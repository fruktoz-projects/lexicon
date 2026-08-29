import { create } from 'zustand';
import { CefrLevel, UserProfile } from '@lexicon/types';
import { INITIAL_USER } from './mockData';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  updateUser: (partial: Partial<UserProfile>) => void;
  setCefr: (target: CefrLevel, current: CefrLevel) => void;
}

const TOKEN_KEY = 'lexicon_auth_token';
const USER_KEY = 'lexicon_auth_user';

export const useAuthStore = create<AuthState>((set) => {
  // Try loading from localStorage or fallback to initial demo user
  const savedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  const savedUserJson = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;

  let initialUser: UserProfile = INITIAL_USER;
  if (savedUserJson) {
    try {
      initialUser = JSON.parse(savedUserJson);
    } catch {
      // ignore
    }
  }

  return {
    token: savedToken || 'demo_jwt_token_2026',
    user: initialUser,
    isAuthenticated: true,

    login: (token, user) => {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ token: null, user: null, isAuthenticated: false });
    },

    updateUser: (partial) => {
      set((state) => {
        if (!state.user) return state;
        const updated = { ...state.user, ...partial };
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
        return { user: updated };
      });
    },

    setCefr: (targetCefr, currentCefr) => {
      set((state) => {
        if (!state.user) return state;
        const updated = { ...state.user, targetCefr, currentCefr };
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
        return { user: updated };
      });
    },
  };
});
