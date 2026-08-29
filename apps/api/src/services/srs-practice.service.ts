import { PrismaClient } from '@prisma/client';
import {
  ExerciseType,
  PracticeSessionItem,
  PracticeSessionResponse,
  PracticeSubmitResult,
  ProgressItemType,
  SRS_INTERVAL_DAYS,
} from '@lexicon/types';

export class SrsPracticeService {
  constructor(private prisma: PrismaClient) {}

  private normalizeText(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '')
      .replace(/\s+/g, ' ');
  }

  /**
   * Assembles a customized SRS practice session prioritizing due items, mistake retries, and new items.
   */
  async assembleSession(userId: string, limit: number = 10): Promise<PracticeSessionResponse> {
    const now = new Date();

    // 1. Fetch due progress items (nextReviewAt <= now)
    const dueProgress = await this.prisma.userProgress.findMany({
      where: {
        userId,
        nextReviewAt: { lte: now },
      },
      take: limit,
      orderBy: { nextReviewAt: 'asc' },
    });

    const dueItemIds = dueProgress.map((p) => p.itemId);

    // 2. Fetch recent mistakes for this user
    const recentMistakes = await this.prisma.mistakeLog.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { exercise: true },
    });

    // 3. Assemble exercise items
    const sessionItems: PracticeSessionItem[] = [];

    // Add due exercises / vocab
    for (const prog of dueProgress) {
      if (prog.itemType === ProgressItemType.EXERCISE) {
        const ex = await this.prisma.exercise.findUnique({ where: { id: prog.itemId } });
        if (ex) {
          sessionItems.push({
            id: ex.id,
            sourceType: ProgressItemType.EXERCISE,
            exerciseType: ex.type as ExerciseType,
            prompt: ex.prompt,
            payload: ex.payload,
            solution: ex.solution,
            srsStage: prog.srsStage,
          });
        }
      } else if (prog.itemType === ProgressItemType.CHUNK) {
        const chunk = await this.prisma.chunk.findUnique({ where: { id: prog.itemId } });
        if (chunk) {
          sessionItems.push({
            id: chunk.id,
            sourceType: ProgressItemType.CHUNK,
            exerciseType: ExerciseType.TRANSLATION_HU_TO_EN,
            prompt: `Fordítsd le a kifejezést angolra: "${chunk.meaningHu}"`,
            payload: {
              sourceHu: chunk.meaningHu,
              contextSentence: chunk.contextSentence,
            },
            solution: chunk.phrase,
            srsStage: prog.srsStage,
          });
        }
      } else if (prog.itemType === ProgressItemType.VOCAB) {
        const vocab = await this.prisma.vocabularyItem.findUnique({ where: { id: prog.itemId } });
        if (vocab) {
          sessionItems.push({
            id: vocab.id,
            sourceType: ProgressItemType.VOCAB,
            exerciseType: ExerciseType.TRANSLATION_HU_TO_EN,
            prompt: `Mi az angol megfelelője? "${vocab.translationHu}"`,
            payload: {
              sourceHu: vocab.translationHu,
              phonetics: vocab.phonetics,
              collocations: vocab.collocations,
            },
            solution: vocab.term,
            srsStage: prog.srsStage,
          });
        }
      }
    }

    // Add mistake retries if not already in session
    for (const mist of recentMistakes) {
      if (sessionItems.length >= limit) break;
      if (mist.exercise && !sessionItems.some((item) => item.id === mist.exercise.id)) {
        sessionItems.push({
          id: mist.exercise.id,
          sourceType: ProgressItemType.EXERCISE,
          exerciseType: mist.exercise.type as ExerciseType,
          prompt: mist.exercise.prompt,
          payload: mist.exercise.payload,
          solution: mist.exercise.solution,
          srsStage: 0,
          isMistakeRetry: true,
        });
      }
    }

    // 4. Fill remaining capacity with new exercises from packs
    if (sessionItems.length < limit) {
      const remainingNeeded = limit - sessionItems.length;
      const existingIds = [...dueItemIds, ...sessionItems.map((s) => s.id)];

      const newExercises = await this.prisma.exercise.findMany({
        where: {
          id: { notIn: existingIds },
        },
        take: remainingNeeded,
        orderBy: { createdAt: 'asc' },
      });

      for (const ex of newExercises) {
        sessionItems.push({
          id: ex.id,
          sourceType: ProgressItemType.EXERCISE,
          exerciseType: ex.type as ExerciseType,
          prompt: ex.prompt,
          payload: ex.payload,
          solution: ex.solution,
          srsStage: 0,
        });
      }
    }

    // If still empty (e.g. fresh DB before seeding or user completed all), pull any available exercises
    if (sessionItems.length === 0) {
      const fallbackExercises = await this.prisma.exercise.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      for (const ex of fallbackExercises) {
        sessionItems.push({
          id: ex.id,
          sourceType: ProgressItemType.EXERCISE,
          exerciseType: ex.type as ExerciseType,
          prompt: ex.prompt,
          payload: ex.payload,
          solution: ex.solution,
          srsStage: 0,
        });
      }
    }

    return {
      sessionId: `srs_sess_${Date.now()}`,
      dueCount: dueProgress.length,
      newCount: sessionItems.filter((s) => s.srsStage === 0 && !s.isMistakeRetry).length,
      mistakesCount: sessionItems.filter((s) => s.isMistakeRetry).length,
      items: sessionItems,
    };
  }

  /**
   * Evaluates user answer deterministically and updates SRS intervals without calling LLM
   */
  async submitAnswer(params: {
    userId: string;
    itemId: string;
    itemType: ProgressItemType | string;
    userAnswer: string;
  }): Promise<PracticeSubmitResult> {
    const { userId, itemId, itemType, userAnswer } = params;

    // Find reference solution
    let expectedSolution = '';
    let explanationHu = '';

    if (itemType === ProgressItemType.EXERCISE) {
      const ex = await this.prisma.exercise.findUnique({
        where: { id: itemId },
        include: { pack: { include: { contrastiveNotes: true } } },
      });
      if (ex) {
        expectedSolution = ex.solution;
        if (ex.pack?.contrastiveNotes?.length > 0) {
          explanationHu = ex.pack.contrastiveNotes[0].explanationHu;
        }
      }
    } else if (itemType === ProgressItemType.CHUNK) {
      const chunk = await this.prisma.chunk.findUnique({ where: { id: itemId } });
      if (chunk) {
        expectedSolution = chunk.phrase;
        explanationHu = `Jelentés: ${chunk.meaningHu} | Példa: ${chunk.contextSentence}`;
      }
    } else if (itemType === ProgressItemType.VOCAB) {
      const vocab = await this.prisma.vocabularyItem.findUnique({ where: { id: itemId } });
      if (vocab) {
        expectedSolution = vocab.term;
        explanationHu = `Jelentés: ${vocab.translationHu} ${vocab.phonetics ? `(${vocab.phonetics})` : ''}`;
      }
    }

    // Deterministic comparison
    const normUser = this.normalizeText(userAnswer);
    const normExpected = this.normalizeText(expectedSolution);
    const isCorrect = normUser === normExpected || normUser.includes(normExpected) || normExpected.includes(normUser);

    // Get current progress or create initial
    const existingProg = await this.prisma.userProgress.findUnique({
      where: {
        userId_itemType_itemId: {
          userId,
          itemType,
          itemId,
        },
      },
    });

    const currentStage = existingProg ? existingProg.srsStage : 0;
    const currentConsecutive = existingProg ? existingProg.consecutiveOk : 0;

    let nextStage = currentStage;
    let nextConsecutive = currentConsecutive;
    let intervalDays = 1;

    if (isCorrect) {
      nextStage = Math.min(5, currentStage + 1);
      nextConsecutive = currentConsecutive + 1;
      intervalDays = SRS_INTERVAL_DAYS[nextStage] || 1;
    } else {
      nextStage = Math.max(1, currentStage - 1);
      nextConsecutive = 0;
      intervalDays = 1; // repeat tomorrow

      // Log mistake
      if (itemType === ProgressItemType.EXERCISE) {
        await this.prisma.mistakeLog.create({
          data: {
            userId,
            exerciseId: itemId,
            userAnswer,
          },
        });
      }
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

    // Persist updated progress
    await this.prisma.userProgress.upsert({
      where: {
        userId_itemType_itemId: {
          userId,
          itemType,
          itemId,
        },
      },
      create: {
        userId,
        itemType,
        itemId,
        srsStage: nextStage,
        consecutiveOk: nextConsecutive,
        totalAttempts: 1,
        nextReviewAt: nextReviewDate,
      },
      update: {
        srsStage: nextStage,
        consecutiveOk: nextConsecutive,
        totalAttempts: { increment: 1 },
        nextReviewAt: nextReviewDate,
      },
    });

    // Update user streak & active timestamp
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    let streakDays = user?.streakDays || 1;

    return {
      isCorrect,
      correctSolution: expectedSolution,
      userAnswer,
      srsStage: nextStage,
      nextReviewAt: nextReviewDate.toISOString(),
      streakDays,
      consecutiveOk: nextConsecutive,
      explanationHu,
    };
  }
}
