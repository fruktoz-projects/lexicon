import { create } from 'zustand';
import { PracticeSessionItem, PracticeSubmitResult } from '@lexicon/types';

interface PracticeSessionState {
  sessionId: string | null;
  items: PracticeSessionItem[];
  currentIndex: number;
  currentAnswer: string;
  isSubmitting: boolean;
  lastResult: PracticeSubmitResult | null;
  score: {
    correct: number;
    incorrect: number;
    xpEarned: number;
  };
  isCompleted: boolean;
  isHelpUsed: boolean;

  startSession: (sessionId: string, items: PracticeSessionItem[]) => void;
  setAnswer: (ans: string) => void;
  setSubmitting: (sub: boolean) => void;
  setResult: (res: PracticeSubmitResult | null) => void;
  setHelpUsed: (used: boolean) => void;
  nextItem: () => void;
  resetSession: () => void;
}

export const usePracticeStore = create<PracticeSessionState>((set, get) => ({
  sessionId: null,
  items: [],
  currentIndex: 0,
  currentAnswer: '',
  isSubmitting: false,
  lastResult: null,
  score: {
    correct: 0,
    incorrect: 0,
    xpEarned: 0,
  },
  isCompleted: false,
  isHelpUsed: false,

  startSession: (sessionId, items) => {
    set({
      sessionId,
      items,
      currentIndex: 0,
      currentAnswer: '',
      isSubmitting: false,
      lastResult: null,
      score: { correct: 0, incorrect: 0, xpEarned: 0 },
      isCompleted: false,
      isHelpUsed: false,
    });
  },

  setAnswer: (currentAnswer) => set({ currentAnswer }),

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  setHelpUsed: (isHelpUsed) => set({ isHelpUsed }),

  setResult: (lastResult) => {
    if (!lastResult) {
      set({ lastResult: null });
      return;
    }

    set((state) => {
      const isOk = lastResult.isCorrect;
      return {
        lastResult,
        score: {
          correct: state.score.correct + (isOk ? 1 : 0),
          incorrect: state.score.incorrect + (isOk ? 0 : 1),
          xpEarned: state.score.xpEarned + (isOk ? 25 : 5),
        },
      };
    });
  },

  nextItem: () => {
    const { currentIndex, items } = get();
    if (currentIndex + 1 >= items.length) {
      set({ isCompleted: true });
    } else {
      set({
        currentIndex: currentIndex + 1,
        currentAnswer: '',
        lastResult: null,
        isHelpUsed: false,
      });
    }
  },

  resetSession: () => {
    set({
      sessionId: null,
      items: [],
      currentIndex: 0,
      currentAnswer: '',
      isSubmitting: false,
      lastResult: null,
      score: { correct: 0, incorrect: 0, xpEarned: 0 },
      isCompleted: false,
      isHelpUsed: false,
    });
  },
}));
