import { CefrLevel, ExerciseType, ProgressItemType, ZoneType } from './enums';
import {
  UserProfile,
  LearningPackSummary,
  LearningPackDetail,
  ExerciseModel,
  WritingFeedbackPayload,
  WritingSubmissionModel,
  MistakeLogModel,
} from './models';

// Auth Responses
export interface AuthResponse {
  token: string;
  user: UserProfile;
}

// Learning Pack Responses
export interface LearningPacksQuery {
  zone?: ZoneType | string;
  cefr?: CefrLevel | string;
  limit?: number;
  offset?: number;
}

export interface LearningPacksResponse {
  total: number;
  packs: LearningPackSummary[];
}

export interface CreateRemixPackPayload {
  title?: string;
  cefr: CefrLevel;
  zone?: ZoneType | string;
  vocabCount?: number;
  chunkCount?: number;
  trapCount?: number;
  exerciseCount?: number;
}

// SRS Practice Types
export interface PracticeSessionItem {
  id: string; // unique item id
  sourceType: ProgressItemType;
  exerciseType: ExerciseType;
  prompt: string;
  payload: any;
  solution: string;
  explanationHu?: string;
  srsStage: number;
  isMistakeRetry?: boolean;
}

export interface PracticeSessionResponse {
  sessionId: string;
  dueCount: number;
  newCount: number;
  mistakesCount: number;
  items: PracticeSessionItem[];
}

export interface PracticeSubmitResult {
  isCorrect: boolean;
  correctSolution: string;
  userAnswer: string;
  srsStage: number;
  nextReviewAt: string;
  streakDays: number;
  consecutiveOk: number;
  explanationHu?: string;
}

// Analytics Responses
export interface MistakePatternItem {
  trapPattern: string;
  count: number;
  correctUsage: string;
  explanationHu: string;
}

export interface AnalyticsOverviewResponse {
  user: UserProfile;
  totalPacksCompleted: number;
  totalVocabMastered: number;
  totalChunksMastered: number;
  srsDistribution: {
    stage0: number; // New
    stage1: number; // 1d
    stage2: number; // 3d
    stage3: number; // 7d
    stage4: number; // 14d
    stage5: number; // 30d (Mastered)
  };
  zoneProgress: Record<ZoneType, { total: number; mastered: number; percentage: number }>;
  recentMistakes: MistakeLogModel[];
  commonMistakePatterns: MistakePatternItem[];
  recentWritings: WritingSubmissionModel[];
}
