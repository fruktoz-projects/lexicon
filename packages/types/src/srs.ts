/**
 * Pure deterministic SRS calculation functions and constants shared across API and Web.
 */

export const SRS_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30] as const;

export type SrsStage = 0 | 1 | 2 | 3 | 4 | 5;

export interface SrsNextResult {
  nextStage: SrsStage;
  intervalDays: number;
  nextReviewAt: string; // ISO date string
}

/**
 * Normalizes text for comparison (removes punctuation, excess spaces, case-insensitive).
 */
export function normalizeAnswer(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Validates whether user answer matches solution.
 */
export function checkAnswer(userAnswer: string, solution: string): boolean {
  return normalizeAnswer(userAnswer) === normalizeAnswer(solution);
}

/**
 * Calculates the next SRS stage and scheduled review date.
 * If correct: advances stage (max 5).
 * If incorrect: resets to stage 0 or decrements for immediate retry.
 */
export function calculateNextSrsResult(
  currentStage: number,
  isCorrect: boolean,
  baseDate: Date = new Date()
): SrsNextResult {
  let nextStage: SrsStage;

  if (isCorrect) {
    nextStage = Math.min(5, Math.max(1, currentStage + 1)) as SrsStage;
  } else {
    nextStage = 0;
  }

  const intervalDays = SRS_INTERVAL_DAYS[nextStage];
  const nextReview = new Date(baseDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    nextStage,
    intervalDays,
    nextReviewAt: nextReview.toISOString(),
  };
}

/**
 * Checks if a progress item is due for review.
 */
export function isProgressDue(nextReviewAt: string | Date | null | undefined, now: Date = new Date()): boolean {
  if (!nextReviewAt) return true;
  const reviewTime = typeof nextReviewAt === 'string' ? new Date(nextReviewAt).getTime() : nextReviewAt.getTime();
  return reviewTime <= now.getTime();
}
