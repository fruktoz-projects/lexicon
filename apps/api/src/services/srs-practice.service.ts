import { PrismaClient } from '@prisma/client';
import {
  calculateNextSrsResult,
  checkAnswer,
  ExerciseType,
  isProgressDue,
  normalizeAnswer,
  PracticeSessionItem,
  PracticeSessionResponse,
  PracticeSubmitResult,
  ProgressItemType,
  SRS_INTERVAL_DAYS,
} from '@lexicon/types';

export class SrsPracticeService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Assembles a customized SRS practice session prioritizing due items, mistake retries, and new items.
   * Items are shuffled so every session feels different.
   */
  async assembleSession(userId: string, limit: number = 20): Promise<PracticeSessionResponse> {
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
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { exercise: true },
    });

    // 3. Assemble session items from due progress
    const sessionItems: PracticeSessionItem[] = [];

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

    // 4. Add mistake retries if not already in session
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

    // 5. Fill remaining capacity with NEW items from packs (never seen before)
    if (sessionItems.length < limit) {
      const existingIds = new Set([...dueItemIds, ...sessionItems.map((s) => s.id)]);
      const remainingNeeded = limit - sessionItems.length;

      // New exercises
      const newExercises = await this.prisma.exercise.findMany({
        where: { id: { notIn: [...existingIds] } },
        take: Math.ceil(remainingNeeded * 0.5),
        orderBy: { createdAt: 'desc' },
      });

      for (const ex of newExercises) {
        existingIds.add(ex.id);
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

      // New vocab items
      const newVocab = await this.prisma.vocabularyItem.findMany({
        where: { id: { notIn: [...existingIds] } },
        take: Math.ceil(remainingNeeded * 0.3),
        orderBy: { createdAt: 'desc' },
      });

      for (const v of newVocab) {
        existingIds.add(v.id);
        sessionItems.push({
          id: v.id,
          sourceType: ProgressItemType.VOCAB,
          exerciseType: ExerciseType.TRANSLATION_HU_TO_EN,
          prompt: `Mi az angol megfelelője? "${v.translationHu}"`,
          payload: {
            sourceHu: v.translationHu,
            phonetics: v.phonetics,
            collocations: v.collocations,
          },
          solution: v.term,
          srsStage: 0,
        });
      }

      // New chunks
      const newChunks = await this.prisma.chunk.findMany({
        where: { id: { notIn: [...existingIds] } },
        take: Math.ceil(remainingNeeded * 0.2),
        orderBy: { createdAt: 'desc' },
      });

      for (const c of newChunks) {
        existingIds.add(c.id);
        sessionItems.push({
          id: c.id,
          sourceType: ProgressItemType.CHUNK,
          exerciseType: ExerciseType.TRANSLATION_HU_TO_EN,
          prompt: `Fordítsd le a kifejezést angolra: "${c.meaningHu}"`,
          payload: {
            sourceHu: c.meaningHu,
            contextSentence: c.contextSentence,
          },
          solution: c.phrase,
          srsStage: 0,
        });
      }
    }

    // 6. Fallback: if still empty, pull any available items from the whole DB
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

    // 7. Shuffle to randomize question order every session (Fisher-Yates)
    const shuffled = [...sessionItems];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 8. Cap to limit
    const finalItems = shuffled.slice(0, limit);

    return {
      sessionId: `srs_sess_${Date.now()}`,
      dueCount: dueProgress.length,
      newCount: finalItems.filter((s) => s.srsStage === 0 && !s.isMistakeRetry).length,
      mistakesCount: finalItems.filter((s) => s.isMistakeRetry).length,
      items: finalItems,
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
    helpUsed?: boolean;
  }): Promise<PracticeSubmitResult> {
    const { userId, itemId, itemType, userAnswer, helpUsed } = params;

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
    const normUser = normalizeAnswer(userAnswer);
    const normExpected = normalizeAnswer(expectedSolution);
    const isCorrect = normUser === normExpected || (normExpected.length > 2 && normUser.includes(normExpected));
    const isCorrectForSrs = isCorrect && !helpUsed; // If help used, SRS treats it as failure

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

    const srsRes = calculateNextSrsResult(currentStage, isCorrectForSrs);
    const nextStage = srsRes.nextStage;
    const nextConsecutive = isCorrectForSrs ? currentConsecutive + 1 : 0;
    const intervalDays = srsRes.intervalDays;

    if (!isCorrectForSrs && itemType === ProgressItemType.EXERCISE) {
      // Log mistake
      await this.prisma.mistakeLog.create({
        data: {
          userId,
          exerciseId: itemId,
          userAnswer,
        },
      });
    }

    const nextReviewDate = new Date(srsRes.nextReviewAt);

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
      helpUsed,
    };
  }
}
