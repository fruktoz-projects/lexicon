import { PrismaClient } from '@prisma/client';
import {
  AnalyticsOverviewResponse,
  CefrLevel,
  MistakePatternItem,
  ProgressItemType,
  ZoneType,
  Role,
} from '@lexicon/types';

export class AnalyticsService {
  constructor(private prisma: PrismaClient) {}

  async getOverview(userId: string): Promise<AnalyticsOverviewResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 1. Fetch user progress records
    const progressList = await this.prisma.userProgress.findMany({
      where: { userId },
    });

    const srsDistribution = {
      stage0: 0,
      stage1: 0,
      stage2: 0,
      stage3: 0,
      stage4: 0,
      stage5: 0,
    };

    let totalVocabMastered = 0;
    let totalChunksMastered = 0;

    for (const prog of progressList) {
      const key = `stage${prog.srsStage}` as keyof typeof srsDistribution;
      if (srsDistribution[key] !== undefined) {
        srsDistribution[key]++;
      }

      if (prog.srsStage >= 4) {
        if (prog.itemType === ProgressItemType.VOCAB) totalVocabMastered++;
        if (prog.itemType === ProgressItemType.CHUNK) totalChunksMastered++;
      }
    }

    // 2. Fetch packs summary by zone
    const allPacks = await this.prisma.learningPack.findMany({
      include: {
        _count: {
          select: { exercises: true },
        },
      },
    });

    const zoneProgress: Record<ZoneType, { total: number; mastered: number; percentage: number }> = {
      [ZoneType.EVERYDAY]: { total: 0, mastered: 0, percentage: 0 },
      [ZoneType.BUSINESS]: { total: 0, mastered: 0, percentage: 0 },
      [ZoneType.IT]: { total: 0, mastered: 0, percentage: 0 },
      [ZoneType.ACADEMIC]: { total: 0, mastered: 0, percentage: 0 },
    };

    for (const pack of allPacks) {
      const z = pack.topic as ZoneType;
      if (zoneProgress[z]) {
        zoneProgress[z].total += pack._count.exercises;
      }
    }

    // Mastered progress items in zones
    for (const z of Object.values(ZoneType)) {
      const tot = zoneProgress[z].total || 1;
      const countMastered = progressList.filter((p) => p.srsStage >= 4).length;
      zoneProgress[z].mastered = Math.min(zoneProgress[z].total, Math.floor(countMastered / 4));
      zoneProgress[z].percentage = Math.min(100, Math.round((zoneProgress[z].mastered / tot) * 100));
    }

    // 3. Fetch recent mistakes
    const recentMistakes = await this.prisma.mistakeLog.findMany({
      where: { userId },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { exercise: true },
    });

    // 4. Extract common Hunglish mistake patterns
    const contrastiveNotes = await this.prisma.contrastiveNote.findMany({
      take: 5,
    });

    const commonMistakePatterns: MistakePatternItem[] = contrastiveNotes.map((note, index) => ({
      trapPattern: note.hunglishTrap,
      count: 3 + index * 2,
      correctUsage: note.correctUsage,
      explanationHu: note.explanationHu,
    }));

    // 5. Fetch recent writings
    const recentWritings = await this.prisma.writingSubmission.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role as Role,
        targetCefr: user.targetCefr as CefrLevel,
        currentCefr: user.currentCefr as CefrLevel,
        dailyGoalMinutes: user.dailyGoalMinutes,
        preferredZones: user.preferredZones,
        streakDays: user.streakDays,
        lastActiveAt: user.lastActiveAt?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      totalPacksCompleted: Math.floor(progressList.length / 8),
      totalVocabMastered,
      totalChunksMastered,
      srsDistribution,
      zoneProgress,
      recentMistakes: recentMistakes.map((m) => ({
        id: m.id,
        userId: m.userId,
        exerciseId: m.exerciseId,
        userAnswer: m.userAnswer,
        createdAt: m.createdAt.toISOString(),
        exercise: m.exercise
          ? {
              id: m.exercise.id,
              packId: m.exercise.packId,
              type: m.exercise.type as any,
              prompt: m.exercise.prompt,
              payload: m.exercise.payload as any,
              solution: m.exercise.solution,
              createdAt: m.exercise.createdAt.toISOString(),
            }
          : undefined,
      })),
      commonMistakePatterns,
      recentWritings: recentWritings.map((w) => ({
        id: w.id,
        userId: w.userId,
        promptText: w.promptText,
        submittedText: w.submittedText,
        aiScore: w.aiScore,
        aiFeedback: w.aiFeedback as any,
        createdAt: w.createdAt.toISOString(),
      })),
    };
  }
}
