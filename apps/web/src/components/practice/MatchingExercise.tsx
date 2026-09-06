import React, { useState, useEffect, useMemo } from 'react';
import { MatchingPayload } from '@lexicon/types';
import { audio } from '../../services/audio';

interface MatchingExerciseProps {
  prompt: string;
  payload: MatchingPayload;
  onComplete: (matchedPairsString: string) => void;
  disabled?: boolean;
}

export const MatchingExercise: React.FC<MatchingExerciseProps> = ({
  prompt,
  payload,
  onComplete,
  disabled,
}) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({}); // left -> right
  const [shuffledRights, setShuffledRights] = useState<string[]>([]);

  const normalizedPairs = useMemo(() => {
    if (!payload?.pairs) return [];
    return payload.pairs.map((p, idx) => {
      if (Array.isArray(p)) {
        return { id: String(idx), left: p[0] || '', right: p[1] || '' };
      }
      return p;
    });
  }, [payload?.pairs]);

  useEffect(() => {
    if (normalizedPairs.length > 0) {
      const rights = normalizedPairs.map((p) => p.right);
      const shuffled = [...rights].sort(() => Math.random() - 0.5);
      setShuffledRights(shuffled);
      setMatched({});
      setSelectedLeft(null);
    }
  }, [payload]);

  const handleSelectLeft = (left: string) => {
    if (disabled || matched[left]) return;
    audio.playClickSound();
    setSelectedLeft(left);
  };

  const handleSelectRight = (right: string) => {
    if (disabled || !selectedLeft) return;
    audio.playClickSound();

    const newMatched = { ...matched, [selectedLeft]: right };
    setMatched(newMatched);
    setSelectedLeft(null);

    // If all pairs matched
    if (Object.keys(newMatched).length === normalizedPairs.length) {
      const resultStr = normalizedPairs
        .map((p) => `${p.id}:${newMatched[p.left] || ''}`)
        .join(',');
      onComplete(resultStr);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="text-xs sm:text-sm font-monument font-bold text-muted uppercase tracking-wider">
        {prompt}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Left column (English) */}
        <div className="space-y-2.5">
          <div className="text-xs font-monument uppercase text-muted tracking-wider font-bold">
            Angol Kifejezések:
          </div>
          {normalizedPairs.map((p) => {
            const isSelected = selectedLeft === p.left;
            const isDone = Boolean(matched[p.left]);

            return (
              <button
                key={p.id}
                type="button"
                disabled={disabled || isDone}
                onClick={() => handleSelectLeft(p.left)}
                className={`w-full p-3 sm:p-3.5 rounded-xl text-left text-xs sm:text-sm font-scribe font-bold transition-all active:scale-98 shadow-sm ${isDone
                    ? 'bg-status-successBg border border-status-successBorder text-ink opacity-60 line-through'
                    : isSelected
                      ? 'bg-accent text-accent-text shadow-md scale-102'
                      : 'bg-surface-subtle text-ink hover:bg-surface-subtle'
                  }`}
              >
                {p.left}
              </button>
            );
          })}
        </div>

        {/* Right column (Hungarian) */}
        <div className="space-y-2.5">
          <div className="text-xs font-monument uppercase text-muted tracking-wider font-bold">
            Magyar Jelentések:
          </div>
          {shuffledRights.map((right, idx) => {
            const isDone = Object.values(matched).includes(right);

            return (
              <button
                key={idx}
                type="button"
                disabled={disabled || isDone || !selectedLeft}
                onClick={() => handleSelectRight(right)}
                className={`w-full p-3 sm:p-3.5 rounded-xl text-left text-xs sm:text-sm font-sans font-semibold transition-all active:scale-98 shadow-sm ${isDone
                    ? 'bg-status-successBg border border-status-successBorder text-ink opacity-60 line-through'
                    : selectedLeft
                      ? 'bg-surface text-ink hover:bg-surface-subtle cursor-pointer'
                      : 'bg-surface-subtle/60 text-muted/60 cursor-not-allowed'
                  }`}
              >
                {right}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
