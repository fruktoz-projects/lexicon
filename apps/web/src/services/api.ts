import axios from 'axios';
import {
  AnalyticsOverviewResponse,
  AuthResponse,
  CefrLevel,
  CreateRemixPackPayload,
  GeneratePackPayload,
  LearningPackDetail,
  LearningPacksQuery,
  PracticeSessionResponse,
  PracticeSubmitResult,
  UserProfile,
  WritingEvaluatePayload,
  WritingFeedbackDto,
  WritingSubmissionModel,
} from '@lexicon/types';
import { useAuthStore } from '../store/authStore';
import { useOfflineStore } from '../store/offlineStore';
import { offlineAdapter } from './offlineAdapter';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// AI-powered endpoints (Gemini API) need a longer timeout
const AI_TIMEOUT = 120000;

// Request interceptor: attach token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to determine if we should route to offline adapter
function isOffline(): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }
  return useOfflineStore.getState().isOnline === false;
}

export const api = {
  // Auth
  auth: {
    register: async (data: { email: string; password: string; targetCefr?: CefrLevel; currentCefr?: CefrLevel }): Promise<AuthResponse> => {
      if (isOffline()) {
        return offlineAdapter.auth.register(data);
      }
      const res = await apiClient.post('/auth/register', data);
      return res.data;
    },

    login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
      if (isOffline()) {
        return offlineAdapter.auth.login(data);
      }
      const res = await apiClient.post('/auth/login', data);
      return res.data;
    },

    getMe: async (): Promise<UserProfile> => {
      if (isOffline()) {
        return offlineAdapter.auth.getMe();
      }
      const res = await apiClient.get('/auth/me');
      return res.data;
    },

    updateProfile: async (data: {
      targetCefr?: string;
      dailyGoalMinutes?: number;
      preferredZones?: string[];
    }): Promise<UserProfile> => {
      if (isOffline()) {
        throw new Error('Profil módosítása csak online módban lehetséges');
      }
      const res = await apiClient.put('/auth/profile', data);
      return res.data;
    },
  },

  // Learning Packs
  packs: {
    list: async (query?: LearningPacksQuery) => {
      if (isOffline()) {
        return offlineAdapter.packs.list(query);
      }
      const res = await apiClient.get('/learning-packs', { params: query });
      return res.data;
    },

    getById: async (id: string): Promise<LearningPackDetail> => {
      if (isOffline()) {
        return offlineAdapter.packs.getById(id);
      }
      const res = await apiClient.get(`/learning-packs/${id}`);
      return res.data;
    },

    getProgress: async (id: string): Promise<{ totalItems: number; practicedCount: number; masteredCount: number; completionPercent: number }> => {
      try {
        const res = await apiClient.get(`/learning-packs/${id}/progress`);
        return res.data;
      } catch {
        return { totalItems: 0, practicedCount: 0, masteredCount: 0, completionPercent: 0 };
      }
    },

    generate: async (payload: GeneratePackPayload): Promise<LearningPackDetail> => {
      if (isOffline()) {
        return offlineAdapter.packs.generate(payload);
      }
      const res = await apiClient.post('/learning-packs/generate', payload, { timeout: AI_TIMEOUT });
      return res.data;
    },

    remix: async (payload: CreateRemixPackPayload): Promise<LearningPackDetail> => {
      if (isOffline()) {
        return offlineAdapter.packs.remix(payload);
      }
      const res = await apiClient.post('/learning-packs/remix', payload);
      return res.data;
    },
  },

  // Practice & SRS
  practice: {
    getSession: async (limit: number = 8): Promise<PracticeSessionResponse> => {
      if (isOffline()) {
        return offlineAdapter.practice.getSession(limit);
      }
      const res = await apiClient.get('/practice/session', { params: { limit } });
      return res.data;
    },

    submit: async (data: { itemId: string; itemType: string; userAnswer: string }): Promise<PracticeSubmitResult> => {
      if (isOffline()) {
        return offlineAdapter.practice.submit(data);
      }
      const res = await apiClient.post('/practice/submit', data);
      return res.data;
    },
  },

  // Writing & Evaluation
  writing: {
    evaluate: async (data: WritingEvaluatePayload): Promise<WritingFeedbackDto> => {
      if (isOffline()) {
        return offlineAdapter.writing.evaluate(data);
      }
      const res = await apiClient.post('/writing/evaluate', data, { timeout: AI_TIMEOUT });
      return res.data;
    },

    getHistory: async (): Promise<WritingSubmissionModel[]> => {
      if (isOffline()) {
        return offlineAdapter.writing.getHistory();
      }
      const res = await apiClient.get('/writing/history');
      return res.data;
    },
  },

  // Analytics
  analytics: {
    getOverview: async (): Promise<AnalyticsOverviewResponse> => {
      if (isOffline()) {
        return offlineAdapter.analytics.getOverview();
      }
      const res = await apiClient.get('/analytics/overview');
      return res.data;
    },
  },

  // Placement Test
  placement: {
    generate: async (): Promise<any> => {
      if (isOffline()) throw new Error('Szintfelmérő csak online érhető el.');
      const res = await apiClient.post('/placement/generate', {}, { timeout: AI_TIMEOUT });
      return res.data;
    },
    evaluate: async (testId: string, answers: Record<string, string>): Promise<any> => {
      if (isOffline()) throw new Error('Szintfelmérő csak online érhető el.');
      const res = await apiClient.post('/placement/evaluate', { testId, answers }, { timeout: AI_TIMEOUT });
      return res.data;
    }
  },

  // Admin
  admin: {
    getPacks: async (query?: LearningPacksQuery) => {
      const res = await apiClient.get('/admin/packs', { params: query });
      return res.data;
    },
    deletePack: async (id: string) => {
      const res = await apiClient.delete(`/admin/packs/${id}`);
      return res.data;
    },
    updatePack: async (id: string, data: Partial<LearningPackDetail>) => {
      const res = await apiClient.put(`/admin/packs/${id}`, data);
      return res.data;
    },
    generatePack: async (payload: GeneratePackPayload): Promise<LearningPackDetail> => {
      const res = await apiClient.post('/admin/generate-pack', payload, { timeout: AI_TIMEOUT });
      return res.data;
    },
  }
};
