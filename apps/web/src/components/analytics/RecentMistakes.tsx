import React from 'react';
import { XCircle, CheckCircle2 } from 'lucide-react';
import { AudioButton } from '../common/AudioButton';

interface RecentMistake {
  id: string;
  userAnswer: string;
  createdAt: string;
  exercise?: {
    prompt: string;
    solution: string;
  };
}

interface RecentMistakesProps {
  mistakes: RecentMistake[];
}

export const RecentMistakes: React.FC<RecentMistakesProps> = ({ mistakes }) => {
  if (!mistakes || mistakes.length === 0) return null;

  return (
    <div className="bg-surface rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-card border border-border mt-5 sm:mt-7">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-monument font-bold text-ink flex items-center gap-2">
          <XCircle size={18} className="text-status-error" />
          <span>Legutóbbi Hibák</span>
        </h3>
        <p className="text-xs sm:text-sm font-sans text-muted mt-1 font-medium">
          Ezeket rontottad el legutóbb. Nézd át őket, hogy a következő alkalommal már helyesen menjenek!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mistakes.map((mistake) => (
          <div key={mistake.id} className="p-4 bg-surface-subtle border border-border rounded-2xl space-y-3">
            <div className="text-xs text-muted font-sans font-semibold border-b border-border pb-2">
              <span className="font-bold text-ink">Feladat: </span>
              {mistake.exercise?.prompt}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2 p-2 bg-status-errorBg rounded-xl border border-status-errorBorder">
                <XCircle size={14} className="text-status-error shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase text-status-error font-bold tracking-wider block mb-0.5">
                    A te válaszod
                  </span>
                  <span className="text-sm font-mono font-bold text-status-error line-through">
                    {mistake.userAnswer}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 bg-status-successBg rounded-xl border border-status-successBorder">
                <CheckCircle2 size={14} className="text-status-success shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase text-status-success font-bold tracking-wider block mb-0.5">
                    Helyes megoldás
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-status-success">
                      {mistake.exercise?.solution || 'N/A'}
                    </span>
                    {mistake.exercise?.solution && (
                      <AudioButton text={mistake.exercise.solution} size="sm" />
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-[10px] text-right text-muted font-mono pt-1">
              {new Date(mistake.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
