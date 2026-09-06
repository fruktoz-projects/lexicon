import { CefrLevel, ExerciseType, ProgressItemType, ZoneType, Role } from './enums';

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  targetCefr: CefrLevel;
  currentCefr: CefrLevel;
  dailyGoalMinutes: number;
  preferredZones: string[];
  streakDays: number;
  lastActiveAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LearningPackSummary {
  id: string;
  title: string;
  cefr: CefrLevel;
  topic: ZoneType | string;
  focus: string;
  estimatedMinutes: number;
  vocabularyCount?: number;
  chunksCount?: number;
  exercisesCount?: number;
  createdAt: string;
}

export interface LessonModel {
  id: string;
  packId: string;
  title: string;
  contentMd: string;
  createdAt: string;
}

export interface VocabularyItemModel {
  id: string;
  packId: string;
  term: string;
  phonetics?: string | null;
  translationHu: string;
  definitionEn?: string | null;
  collocations: string[];
  examples: string[];
  createdAt: string;
}

export interface ChunkModel {
  id: string;
  packId: string;
  phrase: string;
  meaningHu: string;
  contextSentence: string;
  createdAt: string;
}

export interface ContrastiveNoteModel {
  id: string;
  packId: string;
  hunglishTrap: string;
  correctUsage: string;
  explanationHu: string;
  createdAt: string;
}

export interface ClozePayload {
  sentenceWithGap: string;
  options: string[];
}

export interface TranslationHuToEnPayload {
  sourceHu: string;
  hints?: string[];
}

export interface TranslationEnToHuPayload {
  sourceEn: string;
  hints?: string[];
}

export interface MultipleChoicePayload {
  question: string;
  options: string[];
}

export interface MatchingPair {
  id: string;
  left: string;  // English collocation or chunk
  right: string; // Hungarian translation
}

export interface MatchingPayload {
  pairs: MatchingPair[];
}

export type ExercisePayload =
  | ClozePayload
  | TranslationHuToEnPayload
  | TranslationEnToHuPayload
  | MultipleChoicePayload
  | MatchingPayload;

export interface ExerciseModel {
  id: string;
  packId: string;
  type: ExerciseType;
  prompt: string;
  payload: ExercisePayload;
  solution: string;
  createdAt: string;
}

export interface ReadingQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface ReadingMaterialModel {
  id: string;
  packId: string;
  title: string;
  bodyText: string;
  questions: ReadingQuestion[];
  createdAt: string;
}

export interface LearningPackDetail extends LearningPackSummary {
  lessons: LessonModel[];
  vocabulary: VocabularyItemModel[];
  chunks: ChunkModel[];
  contrastiveNotes: ContrastiveNoteModel[];
  exercises: ExerciseModel[];
  readingMaterials: ReadingMaterialModel[];
  writingPrompt?: string;
}

export interface UserProgressModel {
  id: string;
  userId: string;
  itemType: ProgressItemType | string;
  itemId: string;
  srsStage: number; // 0..5
  consecutiveOk: number;
  totalAttempts: number;
  nextReviewAt: string;
  updatedAt: string;
}

export interface MistakeLogModel {
  id: string;
  userId: string;
  exerciseId: string;
  userAnswer: string;
  createdAt: string;
  exercise?: ExerciseModel;
}

export interface WritingFeedbackItem {
  original: string;
  replacement: string;
  explanationHu: string;
  ruleHu: string;
}

export interface WritingFeedbackPayload {
  score: number;
  overallAssessmentHu: string;
  errors: WritingFeedbackItem[];
  positives: string[];
  suggestedCefr: CefrLevel;
}

export interface WritingSubmissionModel {
  id: string;
  userId: string;
  promptText: string;
  submittedText: string;
  aiScore?: number | null;
  aiFeedback?: WritingFeedbackPayload | null;
  createdAt: string;
}

export interface PlacementTestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface PlacementTestModel {
  id: string;
  userId: string;
  questionsJson: PlacementTestQuestion[];
  answersJson?: Record<string, string> | null;
  score?: number | null;
  evaluatedCefr?: CefrLevel | null;
  aiFeedback?: string | null;
  createdAt: string;
  completedAt?: string | null;
}
