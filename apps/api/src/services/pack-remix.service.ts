import { PrismaClient } from '@prisma/client';
import {
  CreateRemixPackPayload,
  LearningPackGenerationDto,
  ZoneType,
} from '@lexicon/types';

export class PackRemixService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Samples a random subset of items from an array without mutation.
   */
  private sample<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Synthesizes a new LearningPackGenerationDto by randomly sampling submodules
   * from existing packs matching the CEFR level and zone.
   */
  async assembleRemixDto(payload: CreateRemixPackPayload): Promise<LearningPackGenerationDto> {
    const { cefr, zone, title, vocabCount = 5, chunkCount = 4, trapCount = 3, exerciseCount = 6 } = payload;

    const wherePack: any = { cefr: cefr as any };
    if (zone && zone !== 'all') {
      wherePack.topic = zone;
    }

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

    const sampledVocab = this.sample(allVocab, vocabCount);
    const sampledChunks = this.sample(allChunks, chunkCount);
    const sampledTraps = this.sample(allTraps, trapCount);
    const sampledExercises = this.sample(allExercises, exerciseCount);
    const sampledReading = allReadings.length > 0 ? this.sample(allReadings, 1)[0] : null;

    const packTitle = title || `Ismétlő Remix Tananyag (${cefr} • ${zone || 'Minden Zóna'})`;
    const packTopic = zone && zone !== 'all' ? (zone as ZoneType) : ZoneType.IT;

    return {
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
        payload: (e.payload ?? {}) as Record<string, unknown>,
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
  }
}
