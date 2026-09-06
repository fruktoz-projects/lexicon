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
import { PackRemixService } from './pack-remix.service';

export class LearningPackService {
  private remixService: PackRemixService;

  constructor(private prisma: PrismaClient) {
    this.remixService = new PackRemixService(prisma);
  }

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
   * Assembles a new synthesized / remix LearningPack by delegating to PackRemixService
   * and saving via atomic transaction.
   */
  async createRemixPack(payload: CreateRemixPackPayload): Promise<LearningPackDetail> {
    const remixDto = await this.remixService.assembleRemixDto(payload);
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

  async deletePack(id: string): Promise<void> {
    await this.prisma.learningPack.delete({
      where: { id },
    });
  }

  async updatePack(id: string, data: Partial<LearningPackDetail>): Promise<LearningPackDetail> {
    await this.prisma.learningPack.update({
      where: { id },
      data: {
        title: data.title,
        focus: data.focus,
      },
    });
    // A full update would involve nested writes, but for simplicity we'll just allow basic title/focus updates 
    // or assume we use Prisma's deep update if necessary.
    return this.getPackById(id);
  }
}
