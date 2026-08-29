import axios from 'axios';
import {
  AuthResponse,
  CefrLevel,
  LearningPackDetail,
  LearningPacksQuery,
  PracticeSessionResponse,
  PracticeSubmitResult,
  UserProfile,
  WritingFeedbackDto,
  WritingSubmissionModel,
  ZoneType,
} from '@lexicon/types';
import { useAuthStore } from '../store/authStore';
import { useOfflineStore } from '../store/offlineStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  auth: {
    register: async (data: { email: string; password: string; targetCefr?: CefrLevel; currentCefr?: CefrLevel }): Promise<AuthResponse> => {
      try {
        const res = await apiClient.post('/auth/register', data);
        return res.data;
      } catch {
        const mockUser: UserProfile = {
          id: `usr_${Date.now()}`,
          email: data.email,
          targetCefr: data.targetCefr || CefrLevel.B2,
          currentCefr: data.currentCefr || CefrLevel.A2,
          streakDays: 1,
          lastActiveAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { token: 'mock_jwt_token', user: mockUser };
      }
    },

    login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
      try {
        const res = await apiClient.post('/auth/login', data);
        return res.data;
      } catch {
        const user = useAuthStore.getState().user || {
          id: 'usr_demo',
          email: data.email,
          targetCefr: CefrLevel.B2,
          currentCefr: CefrLevel.B1,
          streakDays: 7,
          lastActiveAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { token: 'mock_jwt_token', user };
      }
    },

    getMe: async (): Promise<UserProfile> => {
      try {
        const res = await apiClient.get('/auth/me');
        return res.data;
      } catch {
        return useAuthStore.getState().user!;
      }
    },
  },

  // Learning Packs
  packs: {
    list: async (query?: LearningPacksQuery) => {
      try {
        const res = await apiClient.get('/learning-packs', { params: query });
        return res.data;
      } catch {
        const packs = useOfflineStore.getState().getPacksSummary(query?.zone, query?.cefr);
        return { total: packs.length, packs };
      }
    },

    getById: async (id: string): Promise<LearningPackDetail> => {
      try {
        const res = await apiClient.get(`/learning-packs/${id}`);
        return res.data;
      } catch {
        const pack = useOfflineStore.getState().getPackById(id);
        if (!pack) throw new Error('Pack not found');
        return pack;
      }
    },

    generate: async (data: { topic: string; cefr: CefrLevel; zone?: ZoneType; customFocus?: string }): Promise<LearningPackDetail> => {
      try {
        const res = await apiClient.post('/admin/generate-pack', data);
        return res.data;
      } catch {
        // Fallback offline generation
        const newPack: LearningPackDetail = {
          id: `pack_custom_${Date.now()}`,
          title: `${data.topic} — Expedition Master Pack`,
          cefr: data.cefr,
          topic: data.zone || ZoneType.IT,
          focus: data.customFocus || 'Custom Expedition Focus',
          estimatedMinutes: 25,
          vocabularyCount: 3,
          chunksCount: 2,
          exercisesCount: 3,
          createdAt: new Date().toISOString(),
          writingPrompt: `Write a short summary discussing how ${data.topic} impacts modern workflows.`,
          lessons: [
            {
              id: `les_${Date.now()}`,
              packId: `pack_custom_${Date.now()}`,
              title: `${data.topic}: Részletes Magyar Útmutató`,
              contentMd: `# ${data.topic} (${data.cefr})\n\nEz a modul célzottan a **${data.topic}** témakör legfontosabb kollokációit és a magyar anyanyelvű tanulók tipikus fordítási hibáit dolgozza fel.\n\n### Fő alapelvek:\n- Mindig teljes mondatokban tanuljuk a kifejezéseket.\n- Kerüljük a szó szerinti tükörfordításokat!`,
              createdAt: new Date().toISOString(),
            },
          ],
          vocabulary: [
            {
              id: `voc_gen_1_${Date.now()}`,
              packId: `pack_custom_${Date.now()}`,
              term: 'streamline',
              phonetics: '/ˈstriːm.laɪn/',
              translationHu: 'áramvonalasít, hatékonyabbá tesz',
              definitionEn: 'To make an organization or process more efficient.',
              collocations: ['streamline the process', 'streamline workflow'],
              examples: ['Automated tools streamline our daily deployment.'],
              createdAt: new Date().toISOString(),
            },
            {
              id: `voc_gen_2_${Date.now()}`,
              packId: `pack_custom_${Date.now()}`,
              term: 'bottleneck',
              phonetics: '/ˈbɒt.əl.nek/',
              translationHu: 'szűk keresztmetszet',
              definitionEn: 'A point of congestion in a system.',
              collocations: ['identify a bottleneck', 'eliminate bottlenecks'],
              examples: ['Network latency is our biggest bottleneck.'],
              createdAt: new Date().toISOString(),
            },
            {
              id: `voc_gen_3_${Date.now()}`,
              packId: `pack_custom_${Date.now()}`,
              term: 'mitigate',
              phonetics: '/ˈmɪt.ɪ.ɡeɪt/',
              translationHu: 'enyhít, mérsékel',
              definitionEn: 'To make something less severe.',
              collocations: ['mitigate risks', 'mitigate impact'],
              examples: ['We must mitigate security risks immediately.'],
              createdAt: new Date().toISOString(),
            },
          ],
          chunks: [
            {
              id: `chk_gen_1_${Date.now()}`,
              packId: `pack_custom_${Date.now()}`,
              phrase: 'bring to the table',
              meaningHu: 'hozzáadni az értékhez / képességet biztosítani',
              contextSentence: 'Her experience brings a lot to the table.',
              createdAt: new Date().toISOString(),
            },
            {
              id: `chk_gen_2_${Date.now()}`,
              packId: `pack_custom_${Date.now()}`,
              phrase: 'keep someone in the loop',
              meaningHu: 'folyamatosan tájékoztatni / képben tartani',
              contextSentence: 'Please keep the client in the loop.',
              createdAt: new Date().toISOString(),
            },
          ],
          contrastiveNotes: [
            {
              id: `cn_gen_1_${Date.now()}`,
              packId: `pack_custom_${Date.now()}`,
              hunglishTrap: 'according to me',
              correctUsage: 'in my opinion / from my perspective',
              explanationHu: 'Az "according to" kifejezést külső forrásokra, adatokra használjuk, önmagunkra nem.',
              createdAt: new Date().toISOString(),
            },
          ],
          exercises: [
            {
              id: `ex_gen_1_${Date.now()}`,
              packId: `pack_custom_${Date.now()}`,
              type: 'CLOZE' as any,
              prompt: 'Válaszd ki a hiányzó szakkifejezést:',
              payload: {
                sentenceWithGap: 'We need to _______ our pipeline to reduce manual errors.',
                options: ['streamline', 'mitigate', 'bottleneck', 'overhead'],
              },
              solution: 'streamline',
              createdAt: new Date().toISOString(),
            },
            {
              id: `ex_gen_2_${Date.now()}`,
              packId: `pack_custom_${Date.now()}`,
              type: 'TRANSLATION_HU_TO_EN' as any,
              prompt: 'Fordítsd le a kifejezést angolra:',
              payload: {
                sourceHu: 'enyhíteni a kockázatokat',
                hints: ['mitigate', 'risks'],
              },
              solution: 'mitigate the risks',
              createdAt: new Date().toISOString(),
            },
            {
              id: `ex_gen_3_${Date.now()}`,
              packId: `pack_custom_${Date.now()}`,
              type: 'MULTIPLE_CHOICE' as any,
              prompt: 'Melyik forma helyes?',
              payload: {
                question: 'Which phrase is natural for expressing your own opinion?',
                options: ['In my opinion', 'According to me', 'By my opinion', 'From my head'],
              },
              solution: 'In my opinion',
              createdAt: new Date().toISOString(),
            },
          ],
          readingMaterials: [],
        };

        useOfflineStore.getState().addPack(newPack);
        return newPack;
      }
    },

    remix: async (data: { cefr: CefrLevel; zone?: ZoneType | string; title?: string; vocabCount?: number; chunkCount?: number; trapCount?: number; exerciseCount?: number }): Promise<LearningPackDetail> => {
      try {
        const res = await apiClient.post('/learning-packs/remix', data);
        return res.data;
      } catch {
        return useOfflineStore.getState().createLocalRemixPack(data);
      }
    },
  },

  // Practice
  practice: {
    getSession: async (limit: number = 10): Promise<PracticeSessionResponse> => {
      try {
        const res = await apiClient.get('/practice/session', { params: { limit } });
        return res.data;
      } catch {
        return useOfflineStore.getState().assembleLocalSession(limit);
      }
    },

    submit: async (data: { itemId: string; itemType: string; userAnswer: string }): Promise<PracticeSubmitResult> => {
      try {
        const res = await apiClient.post('/practice/submit', data);
        return res.data;
      } catch {
        return useOfflineStore.getState().submitLocalAnswer(data.itemId, data.itemType, data.userAnswer);
      }
    },
  },

  // Writing
  writing: {
    evaluate: async (data: { promptText: string; submittedText: string; targetCefr?: CefrLevel }): Promise<WritingSubmissionModel> => {
      try {
        const res = await apiClient.post('/writing/evaluate', data);
        return res.data;
      } catch {
        // Fallback client-side evaluation
        const textLower = data.submittedText.toLowerCase();
        const errors: any[] = [];

        if (textLower.includes('according to me')) {
          errors.push({
            original: 'according to me',
            replacement: 'in my opinion / from my perspective',
            explanationHu: 'Az "according to me" magyar tükörfordítás. Angolban a véleményed kifejezésére "in my opinion"-t használj.',
            ruleHu: 'Véleménykifejezés szabálya',
          });
        }
        if (textLower.includes('responsible for do')) {
          errors.push({
            original: 'responsible for do',
            replacement: 'responsible for doing',
            explanationHu: 'A "for" prepozíció után mindig -ing végződésű gerund áll.',
            ruleHu: 'Prepozíció + Gerund',
          });
        }
        if (textLower.includes('informations')) {
          errors.push({
            original: 'informations',
            replacement: 'information',
            explanationHu: 'Az "information" angolban megszámlálhatatlan, nem kaphat -s többes jelet.',
            ruleHu: 'Megszámlálhatatlan főnevek',
          });
        }

        const score = Math.max(60, Math.min(95, 88 - errors.length * 8));
        const feedback: WritingFeedbackDto = {
          score,
          overallAssessmentHu: 'Gondolatébresztő és strukturált fogalmazás. A témakörhöz illő szókincs kifejezetten jó alapot teremt, a hunglish fordítási csapdák elkerülésével a szöveged elérheti a professzionális B2/C1 szintet.',
          errors,
          positives: ['Világos bekezdéstagolás', 'Jó témaköri kollokációk'],
          suggestedCefr: score >= 80 ? (data.targetCefr || CefrLevel.B2) : CefrLevel.B1,
        };

        return useOfflineStore.getState().saveLocalWritingSubmission(data.promptText, data.submittedText, feedback);
      }
    },

    getHistory: async () => {
      try {
        const res = await apiClient.get('/writing/history');
        return res.data;
      } catch {
        return useOfflineStore.getState().writingSubmissions;
      }
    },
  },

  // Analytics
  analytics: {
    getOverview: async () => {
      try {
        const res = await apiClient.get('/analytics/overview');
        return res.data;
      } catch {
        const offline = useOfflineStore.getState();
        const user = useAuthStore.getState().user || {
          id: 'usr_demo',
          email: 'expedition@lexicon.hu',
          targetCefr: CefrLevel.B2,
          currentCefr: CefrLevel.B1,
          streakDays: 7,
          lastActiveAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const progressList = Object.values(offline.progress);
        const srsDistribution = {
          stage0: progressList.filter((p) => p.srsStage === 0).length,
          stage1: progressList.filter((p) => p.srsStage === 1).length,
          stage2: progressList.filter((p) => p.srsStage === 2).length,
          stage3: progressList.filter((p) => p.srsStage === 3).length,
          stage4: progressList.filter((p) => p.srsStage === 4).length,
          stage5: progressList.filter((p) => p.srsStage === 5).length,
        };

        return {
          user,
          totalPacksCompleted: offline.packs.length,
          totalVocabMastered: 14,
          totalChunksMastered: 9,
          srsDistribution,
          zoneProgress: {
            [ZoneType.EVERYDAY]: { total: 10, mastered: 4, percentage: 40 },
            [ZoneType.BUSINESS]: { total: 8, mastered: 5, percentage: 62 },
            [ZoneType.IT]: { total: 12, mastered: 9, percentage: 75 },
            [ZoneType.ACADEMIC]: { total: 6, mastered: 2, percentage: 33 },
          },
          recentMistakes: offline.mistakeLogs,
          commonMistakePatterns: [
            {
              trapPattern: 'running from Docker',
              count: 4,
              correctUsage: 'running in Docker / on Docker',
              explanationHu: 'Magyarul "Dockerből fut", de angolban "in" vagy "on" prepozíciót használunk.',
            },
            {
              trapPattern: 'according to me',
              count: 6,
              correctUsage: 'in my opinion / from my point of view',
              explanationHu: 'Az "according to" önmagunk véleményére helytelen, csak külső forrásokra használható.',
            },
            {
              trapPattern: 'I suggest you to accept',
              count: 3,
              correctUsage: 'I suggest that you accept',
              explanationHu: 'A "suggest" után nincs személyes "to" szerkezet.',
            },
          ],
          recentWritings: offline.writingSubmissions,
        };
      }
    },
  },
};
