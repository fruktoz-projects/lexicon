import React, { useState } from 'react';
import { CefrLevel } from '@lexicon/types';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { Button } from '../components/common/Button';
import { Loader2, KeyRound, UserPlus } from 'lucide-react';
import { audio } from '../services/audio';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('expedition@lexicon.hu');
  const [password, setPassword] = useState('password123');
  const [targetCefr, setTargetCefr] = useState<CefrLevel>(CefrLevel.B2);
  const [currentCefr, setCurrentCefr] = useState<CefrLevel>(CefrLevel.B1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    audio.playClickSound();

    try {
      if (isLogin) {
        const res = await api.auth.login({ email, password });
        login(res.token, res.user);
      } else {
        const res = await api.auth.register({ email, password, targetCefr, currentCefr });
        login(res.token, res.user);
      }
      audio.playSuccessSound();
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Hitelesítési hiba történt';
      setError(msg);
      audio.playMistakeSound();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-canvas">
      <div className="w-full max-w-md bg-surface rounded-3xl p-6 sm:p-9 shadow-xl space-y-6 border border-border">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-accent-text mx-auto shadow-md font-bold">
            <span className="text-2xl font-monument font-bold">L</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-monument font-black tracking-wider text-ink">
            LEXICON
          </h2>
          <p className="text-xs font-scribe text-muted tracking-wider font-semibold">
            Kontrasztív Magyar–Angol Tanulórendszer
          </p>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="p-1.5 bg-surface-subtle rounded-2xl grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              audio.playClickSound();
              setIsLogin(true);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-monument font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${isLogin
                ? 'bg-accent text-accent-text shadow-sm'
                : 'text-muted hover:text-ink hover:bg-surface/60'
              }`}
          >
            <KeyRound size={14} />
            <span>Bejelentkezés</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audio.playClickSound();
              setIsLogin(false);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-monument font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${!isLogin
                ? 'bg-accent text-accent-text shadow-sm'
                : 'text-muted hover:text-ink hover:bg-surface/60'
              }`}
          >
            <UserPlus size={14} />
            <span>Regisztráció</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-status-errorBg border-status-errorBorder rounded-xl text-xs text-status-error font-sans font-semibold shadow-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-monument font-bold text-ink mb-1.5">
              E-mail cím
            </label>
            <input
              type="email"
              required
              placeholder="pl. nev@ceg.hu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-surface text-xs sm:text-sm text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none shadow-inner font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-monument font-bold text-ink mb-1.5">
              Jelszó
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-surface text-xs sm:text-sm text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none shadow-inner font-medium"
            />
          </div>

          {!isLogin && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-monument font-bold text-ink mb-1">
                  Jelenlegi szint
                </label>
                <select
                  value={currentCefr}
                  onChange={(e) => setCurrentCefr(e.target.value as CefrLevel)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-border bg-surface text-xs text-ink focus:outline-none font-monument font-bold shadow-inner"
                >
                  <option value={CefrLevel.A2}>A2 — Kezdő</option>
                  <option value={CefrLevel.B1}>B1 — Középhaladó</option>
                  <option value={CefrLevel.B2}>B2 — Haladó</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-monument font-bold text-ink mb-1">
                  Cél CEFR
                </label>
                <select
                  value={targetCefr}
                  onChange={(e) => setTargetCefr(e.target.value as CefrLevel)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-border bg-surface text-xs text-ink focus:outline-none font-monument font-bold shadow-inner"
                >
                  <option value={CefrLevel.B2}>B2 — Haladó</option>
                  <option value={CefrLevel.C1}>C1 — Felsőfokú</option>
                </select>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full py-3 mt-2 font-monument flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                <span>Hitelesítés...</span>
              </>
            ) : isLogin ? (
              <span>Belépés</span>
            ) : (
              <span>Regisztráció és belépés</span>
            )}
          </Button>
        </form>

        <div className="p-3 bg-surface-subtle rounded-xl border border-border text-center text-xs text-ink font-scribe font-semibold">
          <span className="font-monument font-bold">Demo fiók: </span>
          <span className="font-mono">expedition@lexicon.hu</span> / <span className="font-mono font-bold">password123</span>
        </div>
      </div>
    </div>
  );
};
