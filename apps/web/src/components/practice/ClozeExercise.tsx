import React from 'react';
import { ClozePayload } from '@lexicon/types';
import { audio } from '../../services/audio';

interface ClozeExerciseProps {
  prompt: string;
  payload: ClozePayload;
  selectedAnswer: string;
  onSelect: (ans: string) => void;
  disabled?: boolean;
}

export const ClozeExercise: React.FC<ClozeExerciseProps> = ({
  prompt,
  payload,
  selectedAnswer,
  onSelect,
  disabled,
}) => {
  const parts = (payload.sentenceWithGap || '').split('_______');

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="text-xs sm:text-sm font-monument font-bold text-muted uppercase tracking-wider">
        {prompt}
      </div>

      {/* Sentence Gap Rendering */}
      <div className="p-5 sm:p-7 bg-surface-subtle rounded-2xl text-base sm:text-2xl font-scribe font-bold text-ink leading-relaxed text-center shadow-inner">
        {parts[0]}
        <span
          className={`inline-block min-w-[100px] sm:min-w-[140px] px-3 py-1 mx-1 border-b-2 font-mono font-bold transition-all text-center ${selectedAnswer
              ? 'border-accent text-accent bg-accent-subtle rounded-lg shadow-sm'
              : 'border-muted/40 text-muted/50 italic'
            }`}
        >
          {selectedAnswer || '...'}
        </span>
        {parts[1] || ''}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {payload.options?.map((option, idx) => {
          const isSelected = selectedAnswer === option;
          const keyNum = idx + 1;

          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => {
                audio.playClickSound();
                onSelect(option);
              }}
              className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl text-left font-medium transition-all duration-150 flex items-center justify-between group active:scale-98 shadow-sm ${isSelected
                  ? 'bg-accent text-accent-text shadow-md scale-[1.02] font-bold'
                  : 'bg-surface-subtle hover:bg-surface-subtle text-ink'
                }`}
            >
              <span className="text-sm sm:text-base font-scribe font-bold">{option}</span>
              <span
                className={`keyboard-badge hidden sm:inline-flex ${isSelected ? 'bg-surface-subtle text-ink' : ''
                  }`}
              >
                {keyNum}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
