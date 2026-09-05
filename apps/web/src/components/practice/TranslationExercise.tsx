import React, { useRef, useEffect } from 'react';
import { TranslationHuToEnPayload } from '@lexicon/types';
import { HelpCircle } from 'lucide-react';
import { audio } from '../../services/audio';

interface TranslationExerciseProps {
  prompt: string;
  payload: TranslationHuToEnPayload;
  userAnswer: string;
  onChange: (ans: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const TranslationExercise: React.FC<TranslationExerciseProps> = ({
  prompt,
  payload,
  userAnswer,
  onChange,
  onSubmit,
  disabled,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled && userAnswer.trim()) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleUseHint = (hint: string) => {
    audio.playClickSound();
    if (!userAnswer.includes(hint)) {
      onChange(userAnswer ? `${userAnswer} ${hint}` : hint);
    }
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="text-xs sm:text-sm font-monument font-bold text-muted uppercase tracking-wider">
        {prompt}
      </div>

      {/* Hungarian Source Box */}
      <div className="p-5 sm:p-7 bg-surface-subtle rounded-2xl border-2 border-border text-center shadow-inner">
        <span className="text-[11px] font-monument uppercase tracking-wider text-muted block mb-1 font-bold">
          Magyar Forrásszöveg:
        </span>
        <div className="text-lg sm:text-2xl font-scribe font-bold text-ink">
          "{payload.sourceHu}"
        </div>
      </div>

      {/* Hints */}
      {payload.hints && payload.hints.length > 0 && (
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
          <span className="text-xs font-mono text-muted flex items-center gap-1 font-bold">
            <HelpCircle size={13} /> Súgó:
          </span>
          {payload.hints.map((hint, idx) => (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => handleUseHint(hint)}
              className="text-xs font-mono px-3 py-1 rounded-full bg-surface-subtle hover:bg-surface text-ink border border-border hover:border-accent shadow-sm transition-colors font-semibold"
            >
              + {hint}
            </button>
          ))}
        </div>
      )}

      {/* English Input */}
      <div>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            disabled={disabled}
            placeholder="Írd be az angol fordítást..."
            value={userAnswer}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-3.5 sm:p-4 text-base sm:text-lg font-scribe font-bold rounded-xl sm:rounded-2xl border-2 border-border bg-surface text-ink placeholder:text-muted focus:border-accent focus:ring-0 focus:outline-none shadow-inner"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-xs text-muted font-mono">
            <span>Nyomj</span>
            <span className="keyboard-badge">Enter</span>
            <span>-t</span>
          </div>
        </div>
      </div>
    </div>
  );
};
