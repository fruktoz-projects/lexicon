import { z } from 'zod';
import { CefrLevel, ExerciseType, ZoneType } from './enums';

export const CefrLevelSchema = z.nativeEnum(CefrLevel);
export const ExerciseTypeSchema = z.nativeEnum(ExerciseType);
export const ZoneTypeSchema = z.nativeEnum(ZoneType);

// AI Learning Pack Generation Schema (Section 4.2 of spec.md)
export const VocabularyItemGenerationSchema = z.object({
  term: z.string().min(1),
  phonetics: z.string().optional(),
  translationHu: z.string().min(1),
  definitionEn: z.string().optional(),
  collocations: z.array(z.string()).default([]),
  examples: z.array(z.string()).min(1),
});

export const ChunkGenerationSchema = z.object({
  phrase: z.string().min(1),
  meaningHu: z.string().min(1),
  contextSentence: z.string().min(1),
});

export const ContrastiveNoteGenerationSchema = z.object({
  hunglishTrap: z.string().min(1),
  correctUsage: z.string().min(1),
  explanationHu: z.string().min(1),
});

export const ExerciseGenerationSchema = z.object({
  type: ExerciseTypeSchema,
  prompt: z.string().min(1),
  payload: z.record(z.any()),
  solution: z.string().min(1),
});

export const ReadingQuestionGenerationSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).min(2),
  answer: z.string().min(1),
});

export const ReadingMaterialGenerationSchema = z.object({
  title: z.string().min(1),
  bodyText: z.string().min(10),
  questions: z.array(ReadingQuestionGenerationSchema).min(1),
});

export const LessonGenerationSchema = z.object({
  title: z.string().min(1),
  contentMd: z.string().min(20),
});

export const LearningPackGenerationSchema = z.object({
  title: z.string().min(1),
  cefr: CefrLevelSchema,
  topic: z.string().min(1),
  focus: z.string().default('General Practice'),
  estimatedMinutes: z.number().int().positive().default(20),
  lesson: LessonGenerationSchema,
  vocabulary: z.array(VocabularyItemGenerationSchema).min(1),
  chunks: z.array(ChunkGenerationSchema).min(1),
  contrastiveNotes: z.array(ContrastiveNoteGenerationSchema).min(1),
  exercises: z.array(ExerciseGenerationSchema).min(1),
  reading: ReadingMaterialGenerationSchema.optional(),
  writingPrompt: z.string().optional(),
});

export type LearningPackGenerationDto = z.infer<typeof LearningPackGenerationSchema>;

// Writing evaluation schemas
export const WritingFeedbackItemSchema = z.object({
  original: z.string(),
  replacement: z.string(),
  explanationHu: z.string(),
  ruleHu: z.string(),
});

export const WritingFeedbackSchema = z.object({
  score: z.number().min(0).max(100),
  overallAssessmentHu: z.string(),
  errors: z.array(WritingFeedbackItemSchema),
  positives: z.array(z.string()),
  suggestedCefr: CefrLevelSchema,
});

export type WritingFeedbackDto = z.infer<typeof WritingFeedbackSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email({ message: 'Érvénytelen e-mail cím formátum' }),
  password: z.string().min(6, { message: 'A jelszónak legalább 6 karakterből kell állnia' }),
  targetCefr: CefrLevelSchema.default(CefrLevel.B2),
  currentCefr: CefrLevelSchema.default(CefrLevel.A2),
});

export const LoginRequestSchema = z.object({
  email: z.string().email({ message: 'Érvénytelen e-mail cím formátum' }),
  password: z.string().min(1, { message: 'A jelszó megadása kötelező' }),
});

export const GeneratePackRequestSchema = z.object({
  topic: z.string().min(2),
  cefr: CefrLevelSchema,
  zone: ZoneTypeSchema.optional(),
  customFocus: z.string().optional(),
});
export type GeneratePackRequestDto = z.infer<typeof GeneratePackRequestSchema>;

export const PracticeSubmitSchema = z.object({
  itemId: z.string(),
  itemType: z.enum(['VOCAB', 'CHUNK', 'EXERCISE']),
  userAnswer: z.string(),
  isCorrect: z.boolean().optional(),
});

export const WritingEvaluateSchema = z.object({
  promptText: z.string().min(1),
  submittedText: z.string().min(5),
  targetCefr: CefrLevelSchema.optional(),
});
export type WritingEvaluateRequestDto = z.infer<typeof WritingEvaluateSchema>;

export const UpdateProfileRequestSchema = z.object({
  targetCefr: CefrLevelSchema.optional(),
  dailyGoalMinutes: z.number().int().min(5).max(120).optional(),
  preferredZones: z.array(z.string()).optional(),
});
export type UpdateProfileRequestDto = z.infer<typeof UpdateProfileRequestSchema>;

export const EvaluatePlacementTestRequestSchema = z.object({
  testId: z.string().uuid(),
  answers: z.record(z.string(), z.string()), // questionId -> answer
});
export type EvaluatePlacementTestRequestDto = z.infer<typeof EvaluatePlacementTestRequestSchema>;
