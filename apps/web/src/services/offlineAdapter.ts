import {
  AnalyticsOverviewResponse,
  AuthResponse,
  CefrLevel,
  CreateRemixPackPayload,
  ExerciseType,
  GeneratePackPayload,
  LearningPackDetail,
  LearningPacksQuery,
  PracticeSessionResponse,
  PracticeSubmitResult,
  ProgressItemType,
  UserProfile,
  WritingEvaluatePayload,
  WritingFeedbackDto,
  WritingSubmissionModel,
  ZoneType,
} from '@lexicon/types';
import { useAuthStore } from '../store/authStore';
import { useOfflineStore } from '../store/offlineStore';

/**
 * Dedicated offline adapter implementing client-side logic over offlineStore and local state.
 * Used exclusively when the application is in offline mode or disconnected from network.
 */
export const offlineAdapter = {
  auth: {
    login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
      const user: UserProfile = useAuthStore.getState().user || {
        id: 'usr_demo',
        email: data.email || 'expedition@lexicon.hu',
        targetCefr: CefrLevel.B2,
        currentCefr: CefrLevel.B1,
        streakDays: 7,
        lastActiveAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { token: 'mock_offline_jwt_token', user };
    },

    register: async (data: { email: string; password: string; targetCefr?: CefrLevel; currentCefr?: CefrLevel }): Promise<AuthResponse> => {
      const user: UserProfile = {
        id: `usr_${Date.now()}`,
        email: data.email,
        targetCefr: data.targetCefr || CefrLevel.B2,
        currentCefr: data.currentCefr || CefrLevel.A2,
        streakDays: 1,
        lastActiveAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { token: 'mock_offline_jwt_token', user };
    },

    getMe: async (): Promise<UserProfile> => {
      return useAuthStore.getState().user || {
        id: 'usr_demo',
        email: 'expedition@lexicon.hu',
        targetCefr: CefrLevel.B2,
        currentCefr: CefrLevel.B1,
        streakDays: 7,
        lastActiveAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
  },

  packs: {
    list: async (query?: LearningPacksQuery) => {
      const packs = useOfflineStore.getState().getPacksSummary(query?.zone, query?.cefr);
      return { total: packs.length, packs };
    },

    getById: async (id: string): Promise<LearningPackDetail> => {
      const pack = useOfflineStore.getState().getPackById(id);
      if (!pack) {
        throw new Error(`Tananyag nem található (ID: ${id})`);
      }
      return pack;
    },

    generate: async (payload: GeneratePackPayload): Promise<LearningPackDetail> => {
      const packId = `pack_gen_${Date.now()}`;
      const newPack: LearningPackDetail = {
        id: packId,
        title: payload.topic,
        cefr: payload.cefr,
        topic: payload.zone || ZoneType.IT,
        focus: payload.customFocus || `Gyakorlati modul: ${payload.topic}`,
        estimatedMinutes: 20,
        vocabularyCount: 4,
        chunksCount: 3,
        exercisesCount: 5,
        createdAt: new Date().toISOString(),
        writingPrompt: `Write a short 5-7 sentence paragraph explaining the main aspects of ${payload.topic}.`,
        lessons: [
          {
            id: `less_${packId}`,
            packId,
            title: `Bevezetés: ${payload.topic}`,
            contentMd: `# ${payload.topic}\n\nEz a tananyag a(z) **${payload.topic}** témakör szókincsét és kulcskifejezéseit foglalja össze magyar magyarázatokkal.\n\n### Főbb Fókuszpontok:\n- Anyanyelvi szintű kollokációk és szókapcsolatok\n- Gyakori magyar tükörfordítási csapdák felszámolása\n- Életszerű szituációs feladatok`,
            createdAt: new Date().toISOString(),
          },
        ],
        vocabulary: [
          {
            id: `${packId}_voc_1`,
            packId,
            term: 'implementation',
            phonetics: '/ˌɪmplɪmenˈteɪʃn/',
            translationHu: 'megvalósítás, bevezetés',
            definitionEn: 'The process of putting a decision or plan into effect; execution.',
            collocations: ['flawless implementation', 'implementation details', 'carry out implementation'],
            examples: ['The implementation of the new architecture took three months.'],
            createdAt: new Date().toISOString(),
          },
          {
            id: `${packId}_voc_2`,
            packId,
            term: 'bottleneck',
            phonetics: '/ˈbɒtlnek/',
            translationHu: 'szűk keresztmetszet',
            definitionEn: 'A point of congestion in a system that occurs when workloads arrive too quickly.',
            collocations: ['performance bottleneck', 'eliminate bottlenecks', 'identify the bottleneck'],
            examples: ['Database queries were the primary bottleneck in the system.'],
            createdAt: new Date().toISOString(),
          },
        ],
        chunks: [
          {
            id: `${packId}_chk_1`,
            packId,
            phrase: 'mitigate risks',
            meaningHu: 'kockázatokat mérsékel / csökkent',
            contextSentence: 'Continuous testing helps to mitigate deployment risks.',
            createdAt: new Date().toISOString(),
          },
          {
            id: `${packId}_chk_2`,
            packId,
            phrase: 'meet tight deadlines',
            meaningHu: 'szoros határidőket betartani',
            contextSentence: 'The team worked overtime to meet tight deadlines.',
            createdAt: new Date().toISOString(),
          },
        ],
        contrastiveNotes: [
          {
            id: `${packId}_trap_1`,
            packId,
            hunglishTrap: 'running from Docker',
            correctUsage: 'running in / on Docker',
            explanationHu: 'A magyar „Dockerből fut” tükörfordítása helyett angolban a konténer egy belső futási környezet („in Docker”).',
            createdAt: new Date().toISOString(),
          },
        ],
        exercises: [
          {
            id: `${packId}_ex_1`,
            packId,
            type: ExerciseType.CLOZE,
            prompt: 'Egészítsd ki a mondatot a megfelelő kifejezéssel:',
            payload: {
              sentenceWithGap: 'We need to _______ in order to ensure stable releases.',
              options: ['mitigate risks', 'running from Docker', 'eliminate bottleneck', 'take decisions'],
            },
            solution: 'mitigate risks',
            createdAt: new Date().toISOString(),
          },
        ],
        readingMaterials: [],
      };

      useOfflineStore.getState().addPack(newPack);
      return newPack;
    },

    remix: async (payload: CreateRemixPackPayload): Promise<LearningPackDetail> => {
      return useOfflineStore.getState().createLocalRemixPack(payload);
    },
  },

  practice: {
    getSession: async (limit: number = 8): Promise<PracticeSessionResponse> => {
      return useOfflineStore.getState().assembleLocalSession(limit);
    },

    submit: async (data: { itemId: string; itemType: ProgressItemType | string; userAnswer: string }): Promise<PracticeSubmitResult> => {
      return useOfflineStore.getState().submitLocalAnswer(data.itemId, data.itemType, data.userAnswer);
    },
  },

  writing: {
    evaluate: async (data: WritingEvaluatePayload): Promise<WritingFeedbackDto> => {
      const targetCefr = data.targetCefr || CefrLevel.B2;
      const feedback: WritingFeedbackDto = {
        score: 84,
        suggestedCefr: targetCefr,
        overallAssessmentHu:
          'Gondolatmeneted világos és szakmailag releváns. A mondatszerkezetek jó szintet képviselnek, néhány magyaros tükörfordítás és prepozíciós pontatlanság javításra szorul.',
        positives: [
          'Helyes szakmai terminológia és kifejezéshasználat.',
          'Világos érvelési ív és logikus bekezdésszerkezet.',
        ],
        errors: [
          {
            original: 'running application in Docker',
            replacement: 'running applications in Docker',
            explanationHu: 'Megszámlálható főneveknél határozatlan többes szám vagy névelő szükséges („applications”).',
            ruleHu: 'Főnévi egyeztetés & számlálhatóság',
          },
          {
            original: 'According to me',
            replacement: 'In my opinion / From my perspective',
            explanationHu: 'Az „according to” kifejezést külső forrásra használjuk, saját véleményre az „in my opinion” a természetes angol forma.',
            ruleHu: 'Véleménykifejezés vs Hivatkozás',
          },
        ],
      };

      useOfflineStore.getState().saveLocalWritingSubmission(
        data.promptText,
        data.submittedText,
        feedback
      );

      return feedback;
    },

    getHistory: async (): Promise<WritingSubmissionModel[]> => {
      return useOfflineStore.getState().writingSubmissions;
    },
  },

  analytics: {
    getOverview: async (): Promise<AnalyticsOverviewResponse> => {
      const state = useOfflineStore.getState();
      const packs = state.packs;
      const progress = state.progress;
      const mistakeLogs = state.mistakeLogs;
      const submissions = state.writingSubmissions;

      const stageCounts = { stage0: 0, stage1: 0, stage2: 0, stage3: 0, stage4: 0, stage5: 0 };
      Object.values(progress).forEach((p) => {
        const key = `stage${Math.min(Math.max(p.srsStage, 0), 5)}` as keyof typeof stageCounts;
        stageCounts[key] = (stageCounts[key] || 0) + 1;
      });

      const zoneProgress = {
        [ZoneType.EVERYDAY]: { total: 10, mastered: 5, percentage: 50 },
        [ZoneType.BUSINESS]: { total: 10, mastered: 3, percentage: 30 },
        [ZoneType.IT]: { total: 10, mastered: 7, percentage: 70 },
        [ZoneType.ACADEMIC]: { total: 10, mastered: 2, percentage: 20 },
      };

      return {
        user: {
          id: 'usr_local',
          email: 'local@lexicon.hu',
          currentCefr: CefrLevel.B1,
          targetCefr: CefrLevel.B2,
          streakDays: 7,
          lastActiveAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        totalPacksCompleted: packs.length,
        totalVocabMastered: stageCounts.stage5 * 2,
        totalChunksMastered: stageCounts.stage5,
        srsDistribution: stageCounts,
        zoneProgress,
        recentMistakes: mistakeLogs.slice(0, 5),
        commonMistakePatterns: [],
        recentWritings: submissions.slice(0, 5),
      };
    },
  },
};
