import { create } from 'zustand';
import {
  calculateNextSrsResult,
  CefrLevel,
  CreateRemixPackPayload,
  ExerciseType,
  LearningPackDetail,
  LearningPackSummary,
  MistakeLogModel,
  normalizeAnswer,
  PracticeSessionItem,
  PracticeSessionResponse,
  PracticeSubmitResult,
  ProgressItemType,
  WritingFeedbackDto,
  WritingSubmissionModel,
  ZoneType,
} from '@lexicon/types';
import { INITIAL_PACKS_DETAIL, INITIAL_WRITING_SUBMISSIONS } from './mockData';

interface ProgressRecord {
  itemId: string;
  itemType: ProgressItemType | string;
  srsStage: number;
  consecutiveOk: number;
  nextReviewAt: string;
}

interface OfflineState {
  isOnline: boolean;
  packs: LearningPackDetail[];
  progress: Record<string, ProgressRecord>;
  mistakeLogs: MistakeLogModel[];
  writingSubmissions: WritingSubmissionModel[];

  setOnlineStatus: (status: boolean) => void;
  addPack: (pack: LearningPackDetail) => void;
  getPacksSummary: (zone?: ZoneType | string, cefr?: CefrLevel | string) => LearningPackSummary[];
  getPackById: (id: string) => LearningPackDetail | undefined;
  createLocalRemixPack: (payload: CreateRemixPackPayload) => LearningPackDetail;
  assembleLocalSession: (limit?: number) => PracticeSessionResponse;
  submitLocalAnswer: (itemId: string, itemType: string, userAnswer: string) => PracticeSubmitResult;
  saveLocalWritingSubmission: (promptText: string, submittedText: string, evaluation: WritingFeedbackDto) => WritingSubmissionModel;
}

const STORAGE_PACKS_KEY = 'lexicon_offline_packs';
const STORAGE_PROGRESS_KEY = 'lexicon_offline_progress';
const STORAGE_MISTAKES_KEY = 'lexicon_offline_mistakes';
const STORAGE_WRITINGS_KEY = 'lexicon_offline_writings';

export const useOfflineStore = create<OfflineState>((set, get) => {
  // Load saved or fallback to initial
  let initialPacks = INITIAL_PACKS_DETAIL;
  let initialProgress: Record<string, ProgressRecord> = {
    ex_it_01: {
      itemId: 'ex_it_01',
      itemType: ProgressItemType.EXERCISE,
      srsStage: 2,
      consecutiveOk: 2,
      nextReviewAt: new Date(Date.now() - 3600000).toISOString(), // Due now
    },
    chk_it_01: {
      itemId: 'chk_it_01',
      itemType: ProgressItemType.CHUNK,
      srsStage: 5,
      consecutiveOk: 5,
      nextReviewAt: new Date(Date.now() + 86400000 * 30).toISOString(),
    },
  };
  let initialMistakes: MistakeLogModel[] = [
    {
      id: 'mist_01',
      userId: 'usr_demo_expedition_01',
      exerciseId: 'ex_it_02',
      userAnswer: 'spin off a container',
      createdAt: new Date().toISOString(),
    },
  ];
  let initialWritings = INITIAL_WRITING_SUBMISSIONS;

  if (typeof window !== 'undefined') {
    try {
      const savedPacks = localStorage.getItem(STORAGE_PACKS_KEY);
      if (savedPacks) initialPacks = JSON.parse(savedPacks);

      const savedProg = localStorage.getItem(STORAGE_PROGRESS_KEY);
      if (savedProg) initialProgress = JSON.parse(savedProg);

      const savedMist = localStorage.getItem(STORAGE_MISTAKES_KEY);
      if (savedMist) initialMistakes = JSON.parse(savedMist);

      const savedWritings = localStorage.getItem(STORAGE_WRITINGS_KEY);
      if (savedWritings) initialWritings = JSON.parse(savedWritings);
    } catch {
      // ignore
    }
  }

  return {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    packs: initialPacks,
    progress: initialProgress,
    mistakeLogs: initialMistakes,
    writingSubmissions: initialWritings,

    setOnlineStatus: (isOnline) => set({ isOnline }),

    addPack: (pack) => {
      set((state) => {
        const updated = [pack, ...state.packs];
        localStorage.setItem(STORAGE_PACKS_KEY, JSON.stringify(updated));
        return { packs: updated };
      });
    },

    getPacksSummary: (zone, cefr) => {
      let list = get().packs;
      if (zone && zone !== 'all') list = list.filter((p) => p.topic === zone);
      if (cefr && cefr !== 'all') list = list.filter((p) => p.cefr === cefr);

      return list.map((p) => ({
        id: p.id,
        title: p.title,
        cefr: p.cefr,
        topic: p.topic,
        focus: p.focus,
        estimatedMinutes: p.estimatedMinutes,
        vocabularyCount: p.vocabulary?.length || 0,
        chunksCount: p.chunks?.length || 0,
        exercisesCount: p.exercises?.length || 0,
        createdAt: p.createdAt,
      }));
    },

    getPackById: (id) => {
      return get().packs.find((p) => p.id === id);
    },

    createLocalRemixPack: (payload) => {
      const state = get();
      const { cefr, zone, title, vocabCount = 4, chunkCount = 3, trapCount = 2, exerciseCount = 4 } = payload;

      // Filter eligible source packs
      let eligible = state.packs.filter((p) => p.cefr === cefr);
      if (zone && zone !== 'all') {
        const zoneFiltered = eligible.filter((p) => p.topic === zone);
        if (zoneFiltered.length > 0) eligible = zoneFiltered;
      }
      if (eligible.length === 0) eligible = state.packs;

      const allVocab = eligible.flatMap((p) => p.vocabulary || []);
      const allChunks = eligible.flatMap((p) => p.chunks || []);
      const allTraps = eligible.flatMap((p) => p.contrastiveNotes || []);
      const allExercises = eligible.flatMap((p) => p.exercises || []);
      const allReadings = eligible.flatMap((p) => p.readingMaterials || []);

      const sample = <T>(arr: T[], count: number): T[] => {
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
      };

      const sampledVocab = sample(allVocab, vocabCount);
      const sampledChunks = sample(allChunks, chunkCount);
      const sampledTraps = sample(allTraps, trapCount);
      const sampledExercises = sample(allExercises, exerciseCount);
      const sampledReading = allReadings.length > 0 ? sample(allReadings, 1)[0] : undefined;

      const packId = `remix_pack_${Date.now()}`;
      const packTopic = zone && zone !== 'all' ? (zone as ZoneType) : ZoneType.IT;
      const packTitle = title || `Ismétlő Remix Tananyag (${cefr} • ${zone || 'Minden Zóna'})`;

      const newPack: LearningPackDetail = {
        id: packId,
        title: packTitle,
        cefr,
        topic: packTopic,
        focus: `Véletlenszerűen szintetizált moduláris ismétlő tananyag (${sampledVocab.length} szó, ${sampledChunks.length} kollokáció, ${sampledTraps.length} csapda)`,
        estimatedMinutes: 20,
        vocabularyCount: sampledVocab.length,
        chunksCount: sampledChunks.length,
        exercisesCount: sampledExercises.length,
        createdAt: new Date().toISOString(),
        writingPrompt: `Írj egy 5-7 mondatos angol szöveget a megtanult kifejezések (${sampledChunks.map((c) => `"${c.phrase}"`).join(', ')}) felhasználásával.`,
        lessons: [
          {
            id: `less_${packId}`,
            packId,
            title: `Moduláris Ismétlő Összefoglaló (${cefr})`,
            contentMd: `# Ismétlő Tananyag\n\nEz a modul a korábbi leckékből és szakterületekből véletlenszerűen generált almodulokból épült fel az ismeretek felfrissítésére.\n\n### Kiemelt Kollokációk:\n${sampledChunks.map((c) => `- **${c.phrase}**: *${c.meaningHu}*`).join('\n')}\n\n### Hunglish Figyelmeztetések:\n${sampledTraps.map((t) => `- ❌ *${t.hunglishTrap}* → ✅ **${t.correctUsage}** (${t.explanationHu})`).join('\n')}`,
            createdAt: new Date().toISOString(),
          },
        ],
        vocabulary: sampledVocab.map((v, idx) => ({ ...v, id: `${packId}_voc_${idx}`, packId })),
        chunks: sampledChunks.map((c, idx) => ({ ...c, id: `${packId}_chk_${idx}`, packId })),
        contrastiveNotes: sampledTraps.map((t, idx) => ({ ...t, id: `${packId}_trap_${idx}`, packId })),
        exercises: sampledExercises.map((e, idx) => ({ ...e, id: `${packId}_ex_${idx}`, packId })),
        readingMaterials: sampledReading ? [{ ...sampledReading, id: `${packId}_read_01`, packId }] : [],
      };

      state.addPack(newPack);
      return newPack;
    },

    assembleLocalSession: (limit = 10) => {
      const state = get();
      const now = new Date().getTime();
      const sessionItems: PracticeSessionItem[] = [];

      // 1. Due items
      Object.values(state.progress).forEach((prog) => {
        if (new Date(prog.nextReviewAt).getTime() <= now) {
          for (const pack of state.packs) {
            const ex = pack.exercises?.find((e) => e.id === prog.itemId);
            if (ex && !sessionItems.some((s) => s.id === ex.id)) {
              sessionItems.push({
                id: ex.id,
                sourceType: ProgressItemType.EXERCISE,
                exerciseType: ex.type,
                prompt: ex.prompt,
                payload: ex.payload,
                solution: ex.solution,
                srsStage: prog.srsStage,
              });
              break;
            }
          }
        }
      });

      // 2. Add mistake retries
      state.mistakeLogs.forEach((mist) => {
        if (sessionItems.length >= limit) return;
        for (const pack of state.packs) {
          const ex = pack.exercises?.find((e) => e.id === mist.exerciseId);
          if (ex && !sessionItems.some((s) => s.id === ex.id)) {
            sessionItems.push({
              id: ex.id,
              sourceType: ProgressItemType.EXERCISE,
              exerciseType: ex.type,
              prompt: ex.prompt,
              payload: ex.payload,
              solution: ex.solution,
              srsStage: 0,
              isMistakeRetry: true,
            });
            break;
          }
        }
      });

      // 3. Fill with exercises from packs
      for (const pack of state.packs) {
        if (sessionItems.length >= limit) break;
        for (const ex of pack.exercises || []) {
          if (sessionItems.length >= limit) break;
          if (!sessionItems.some((s) => s.id === ex.id)) {
            const existingProg = state.progress[ex.id];
            sessionItems.push({
              id: ex.id,
              sourceType: ProgressItemType.EXERCISE,
              exerciseType: ex.type,
              prompt: ex.prompt,
              payload: ex.payload,
              solution: ex.solution,
              srsStage: existingProg?.srsStage || 0,
            });
          }
        }
      }

      // If still empty, add chunk translation cards!
      if (sessionItems.length === 0) {
        for (const pack of state.packs) {
          for (const chk of pack.chunks || []) {
            sessionItems.push({
              id: chk.id,
              sourceType: ProgressItemType.CHUNK,
              exerciseType: ExerciseType.TRANSLATION_HU_TO_EN,
              prompt: `Fordítsd le a kifejezést angolra: "${chk.meaningHu}"`,
              payload: {
                sourceHu: chk.meaningHu,
                hints: chk.phrase.split(' ').slice(0, 2),
              },
              solution: chk.phrase,
              srsStage: 0,
            });
          }
        }
      }

      return {
        sessionId: `local_sess_${Date.now()}`,
        dueCount: sessionItems.filter((s) => (get().progress[s.id]?.srsStage || 0) > 0).length,
        newCount: sessionItems.filter((s) => (get().progress[s.id]?.srsStage || 0) === 0).length,
        mistakesCount: sessionItems.filter((s) => s.isMistakeRetry).length,
        items: sessionItems.slice(0, limit),
      };
    },

    submitLocalAnswer: (itemId, itemType, userAnswer) => {
      const state = get();
      let expectedSolution = '';
      let explanationHu = '';

      // Find solution
      for (const pack of state.packs) {
        const ex = pack.exercises?.find((e) => e.id === itemId);
        if (ex) {
          expectedSolution = ex.solution;
          explanationHu = pack.contrastiveNotes?.[0]?.explanationHu || '';
          break;
        }
        const chk = pack.chunks?.find((c) => c.id === itemId);
        if (chk) {
          expectedSolution = chk.phrase;
          explanationHu = `Jelentés: ${chk.meaningHu} (${chk.contextSentence})`;
          break;
        }
      }

      const normUser = normalizeAnswer(userAnswer);
      const normExpected = normalizeAnswer(expectedSolution);
      const isCorrect = normUser === normExpected || (normExpected.length > 2 && normUser.includes(normExpected));

      const currentProg = state.progress[itemId];
      const currentStage = currentProg ? currentProg.srsStage : 0;
      const currentConsecutive = currentProg ? currentProg.consecutiveOk : 0;

      const srsRes = calculateNextSrsResult(currentStage, isCorrect);
      const nextStage = srsRes.nextStage;
      const nextConsecutive = isCorrect ? currentConsecutive + 1 : 0;

      if (!isCorrect) {
        // Log mistake
        const newMistake: MistakeLogModel = {
          id: `mist_${Date.now()}`,
          userId: 'usr_demo_expedition_01',
          exerciseId: itemId,
          userAnswer,
          createdAt: new Date().toISOString(),
        };
        const updatedMistakes = [newMistake, ...state.mistakeLogs];
        localStorage.setItem(STORAGE_MISTAKES_KEY, JSON.stringify(updatedMistakes));
        set({ mistakeLogs: updatedMistakes });
      }

      const updatedProgress = {
        ...state.progress,
        [itemId]: {
          itemId,
          itemType,
          srsStage: nextStage,
          consecutiveOk: nextConsecutive,
          nextReviewAt: srsRes.nextReviewAt,
        },
      };

      localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(updatedProgress));
      set({ progress: updatedProgress });

      return {
        isCorrect,
        correctSolution: expectedSolution,
        userAnswer,
        srsStage: nextStage,
        nextReviewAt: srsRes.nextReviewAt,
        streakDays: 7,
        consecutiveOk: nextConsecutive,
        explanationHu,
      };
    },

    saveLocalWritingSubmission: (promptText, submittedText, evaluation) => {
      const newSub: WritingSubmissionModel = {
        id: `sub_${Date.now()}`,
        userId: 'usr_demo_expedition_01',
        promptText,
        submittedText,
        aiScore: evaluation.score,
        aiFeedback: evaluation,
        createdAt: new Date().toISOString(),
      };

      const updated = [newSub, ...get().writingSubmissions];
      localStorage.setItem(STORAGE_WRITINGS_KEY, JSON.stringify(updated));
      set({ writingSubmissions: updated });
      return newSub;
    },
  };
});
