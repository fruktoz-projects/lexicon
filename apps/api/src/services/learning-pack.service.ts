import { PrismaClient } from '@prisma/client';
import {
  CefrLevel,
  CreateRemixPackPayload,
  LearningPackDetail,
  LearningPackGenerationDto,
  LearningPackSummary,
  LearningPacksQuery,
  ZoneType,
} from '@lexicon/types';

export class LearningPackService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Persists a newly generated or imported learning pack into PostgreSQL via an atomic transaction.
   */
  async createPackFromDto(dto: LearningPackGenerationDto): Promise<LearningPackDetail> {
    return this.prisma.$transaction(async (tx) => {
      // Create parent pack record
      const pack = await tx.learningPack.create({
        data: {
          title: dto.title,
          cefr: dto.cefr as any,
          topic: dto.topic,
          focus: dto.focus,
          estimatedMinutes: dto.estimatedMinutes,
          rawJson: dto as any,
        },
      });

      // Create lesson
      await tx.lesson.create({
        data: {
          packId: pack.id,
          title: dto.lesson.title,
          contentMd: dto.lesson.contentMd,
        },
      });

      // Create vocabulary items
      for (const item of dto.vocabulary) {
        await tx.vocabularyItem.create({
          data: {
            packId: pack.id,
            term: item.term,
            phonetics: item.phonetics,
            translationHu: item.translationHu,
            definitionEn: item.definitionEn,
            collocations: item.collocations,
            examples: item.examples,
          },
        });
      }

      // Create chunks
      for (const chunk of dto.chunks) {
        await tx.chunk.create({
          data: {
            packId: pack.id,
            phrase: chunk.phrase,
            meaningHu: chunk.meaningHu,
            contextSentence: chunk.contextSentence,
          },
        });
      }

      // Create contrastive notes (Hunglish traps)
      for (const note of dto.contrastiveNotes) {
        await tx.contrastiveNote.create({
          data: {
            packId: pack.id,
            hunglishTrap: note.hunglishTrap,
            correctUsage: note.correctUsage,
            explanationHu: note.explanationHu,
          },
        });
      }

      // Create exercises
      for (const ex of dto.exercises) {
        await tx.exercise.create({
          data: {
            packId: pack.id,
            type: ex.type as any,
            prompt: ex.prompt,
            payload: ex.payload,
            solution: ex.solution,
          },
        });
      }

      // Create reading material if present
      if (dto.reading) {
        await tx.readingMaterial.create({
          data: {
            packId: pack.id,
            title: dto.reading.title,
            bodyText: dto.reading.bodyText,
            questions: dto.reading.questions as any,
          },
        });
      }

      // Fetch complete pack detail
      return this.getPackById(pack.id, tx);
    });
  }

  /**
   * Assembles a new synthesized / remix LearningPack by randomly selecting modular elements
   * (vocab, chunks, contrastive notes, exercises) from existing packs of a target CEFR level / Zone.
   */
  async createRemixPack(payload: CreateRemixPackPayload): Promise<LearningPackDetail> {
    const { cefr, zone, title, vocabCount = 5, chunkCount = 4, trapCount = 3, exerciseCount = 6 } = payload;

    const wherePack: any = { cefr: cefr as any };
    if (zone && zone !== 'all') {
      wherePack.topic = zone;
    }

    // Find all eligible packs
    const sourcePacks = await this.prisma.learningPack.findMany({
      where: wherePack,
      include: {
        vocabulary: true,
        chunks: true,
        contrastiveNotes: true,
        exercises: true,
        readingMaterials: true,
      },
    });

    if (sourcePacks.length === 0) {
      throw new Error(`Nincs elegendő kiinduló tananyag a(z) ${cefr} szinten az ismétléshez.`);
    }

    // Aggregate submodules
    const allVocab = sourcePacks.flatMap((p) => p.vocabulary);
    const allChunks = sourcePacks.flatMap((p) => p.chunks);
    const allTraps = sourcePacks.flatMap((p) => p.contrastiveNotes);
    const allExercises = sourcePacks.flatMap((p) => p.exercises);
    const allReadings = sourcePacks.flatMap((p) => p.readingMaterials);

    // Shuffle & sample
    const sample = <T>(arr: T[], count: number): T[] => {
      const shuffled = [...arr].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(count, shuffled.length));
    };

    const sampledVocab = sample(allVocab, vocabCount);
    const sampledChunks = sample(allChunks, chunkCount);
    const sampledTraps = sample(allTraps, trapCount);
    const sampledExercises = sample(allExercises, exerciseCount);
    const sampledReading = allReadings.length > 0 ? sample(allReadings, 1)[0] : null;

    const packTitle = title || `Ismétlő Remix Tananyag (${cefr} • ${zone || 'Minden Zóna'})`;
    const packTopic = zone && zone !== 'all' ? (zone as ZoneType) : ZoneType.IT;

    const remixDto: LearningPackGenerationDto = {
      title: packTitle,
      cefr,
      topic: packTopic,
      focus: `Vegyes tudásfelelevenítő ismétlő modul: ${sampledVocab.length} szó, ${sampledChunks.length} kollokáció és ${sampledTraps.length} Hunglish hibaminta szintézise`,
      estimatedMinutes: 25,
      lesson: {
        title: `Átfogó Ismétlő Összefoglaló (${cefr})`,
        contentMd: `# Ismétlő Tananyag\n\nEz a modul a korábban generált és elsajátított anyagokból állt össze az ismeretek felfrissítésére és a kifejezéscsomagok aktív felidézésére.\n\n### Kiemelt Fókuszpontok:\n${sampledChunks.map((c) => `- **${c.phrase}**: *${c.meaningHu}*`).join('\n')}\n\n### Hunglish Figyelmeztetések:\n${sampledTraps.map((t) => `- ❌ *${t.hunglishTrap}* → ✅ **${t.correctUsage}** (${t.explanationHu})`).join('\n')}`,
      },
      vocabulary: sampledVocab.map((v) => ({
        term: v.term,
        phonetics: v.phonetics || undefined,
        translationHu: v.translationHu,
        definitionEn: v.definitionEn || undefined,
        collocations: v.collocations,
        examples: v.examples,
      })),
      chunks: sampledChunks.map((c) => ({
        phrase: c.phrase,
        meaningHu: c.meaningHu,
        contextSentence: c.contextSentence,
      })),
      contrastiveNotes: sampledTraps.map((t) => ({
        hunglishTrap: t.hunglishTrap,
        correctUsage: t.correctUsage,
        explanationHu: t.explanationHu,
      })),
      exercises: sampledExercises.map((e) => ({
        type: e.type as any,
        prompt: e.prompt,
        payload: e.payload,
        solution: e.solution,
      })),
      reading: sampledReading
        ? {
            title: sampledReading.title,
            bodyText: sampledReading.bodyText,
            questions: sampledReading.questions as any,
          }
        : undefined,
      writingPrompt: `Írj egy 6-8 mondatos angol szöveget, amelyben felhasználsz legalább 3 kollokációt (${sampledChunks.slice(0, 3).map((c) => `"${c.phrase}"`).join(', ')}) és elkerülöd a tipikus magyar hibamintákat.`,
    };

    return this.createPackFromDto(remixDto);
  }

  async listPacks(query: LearningPacksQuery = {}): Promise<{ total: number; packs: LearningPackSummary[] }> {
    const { zone, cefr, limit = 50, offset = 0 } = query;

    const where: any = {};
    if (zone && zone !== 'all') {
      where.topic = zone;
    }
    if (cefr && cefr !== 'all') {
      where.cefr = cefr;
    }

    const [total, packs] = await Promise.all([
      this.prisma.learningPack.count({ where }),
      this.prisma.learningPack.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              vocabulary: true,
              chunks: true,
              exercises: true,
            },
          },
        },
      }),
    ]);

    return {
      total,
      packs: packs.map((p) => ({
        id: p.id,
        title: p.title,
        cefr: p.cefr as CefrLevel,
        topic: p.topic as ZoneType,
        focus: p.focus,
        estimatedMinutes: p.estimatedMinutes,
        vocabularyCount: p._count.vocabulary,
        chunksCount: p._count.chunks,
        exercisesCount: p._count.exercises,
        createdAt: p.createdAt.toISOString(),
      })),
    };
  }

  async getPackById(id: string, customPrisma?: any): Promise<LearningPackDetail> {
    const client = customPrisma || this.prisma;
    const pack = await client.learningPack.findUnique({
      where: { id },
      include: {
        lessons: true,
        vocabulary: true,
        chunks: true,
        contrastiveNotes: true,
        exercises: true,
        readingMaterials: true,
      },
    });

    if (!pack) {
      throw new Error(`Learning pack not found: ${id}`);
    }

    const raw = pack.rawJson as any;

    return {
      id: pack.id,
      title: pack.title,
      cefr: pack.cefr as CefrLevel,
      topic: pack.topic as ZoneType,
      focus: pack.focus,
      estimatedMinutes: pack.estimatedMinutes,
      vocabularyCount: pack.vocabulary.length,
      chunksCount: pack.chunks.length,
      exercisesCount: pack.exercises.length,
      createdAt: pack.createdAt.toISOString(),
      writingPrompt: raw?.writingPrompt || 'Write an essay synthesizing the key vocabulary and idioms learned.',
      lessons: pack.lessons.map((l: any) => ({
        id: l.id,
        packId: l.packId,
        title: l.title,
        contentMd: l.contentMd,
        createdAt: l.createdAt.toISOString(),
      })),
      vocabulary: pack.vocabulary.map((v: any) => ({
        id: v.id,
        packId: v.packId,
        term: v.term,
        phonetics: v.phonetics,
        translationHu: v.translationHu,
        definitionEn: v.definitionEn,
        collocations: v.collocations,
        examples: v.examples,
        createdAt: v.createdAt.toISOString(),
      })),
      chunks: pack.chunks.map((c: any) => ({
        id: c.id,
        packId: c.packId,
        phrase: c.phrase,
        meaningHu: c.meaningHu,
        contextSentence: c.contextSentence,
        createdAt: c.createdAt.toISOString(),
      })),
      contrastiveNotes: pack.contrastiveNotes.map((n: any) => ({
        id: n.id,
        packId: n.packId,
        hunglishTrap: n.hunglishTrap,
        correctUsage: n.correctUsage,
        explanationHu: n.explanationHu,
        createdAt: n.createdAt.toISOString(),
      })),
      exercises: pack.exercises.map((e: any) => ({
        id: e.id,
        packId: e.packId,
        type: e.type,
        prompt: e.prompt,
        payload: e.payload,
        solution: e.solution,
        createdAt: e.createdAt.toISOString(),
      })),
      readingMaterials: pack.readingMaterials.map((r: any) => ({
        id: r.id,
        packId: r.packId,
        title: r.title,
        bodyText: r.bodyText,
        questions: r.questions,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }
}
