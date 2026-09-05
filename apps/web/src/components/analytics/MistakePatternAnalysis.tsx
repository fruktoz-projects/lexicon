import React from 'react';
import { MistakePatternItem } from '@lexicon/types';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { AudioButton } from '../common/AudioButton';

interface MistakePatternAnalysisProps {
  patterns: MistakePatternItem[];
}

export const MistakePatternAnalysis: React.FC<MistakePatternAnalysisProps> = ({ patterns }) => {
  return (
    <div className="bg-surface-subtle border-2 border-border rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-xl font-monument font-bold text-ink flex items-center gap-2">
            <AlertTriangle size={18} className="text-accent" />
            <span>Gyakori Hunglish hibaminták</span>
          </h3>
          <p className="text-xs sm:text-sm font-scribe text-muted mt-0.5 font-semibold">
            Tipikus magyar tükörfordítások és prepozíciós hibák felszámolása
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {patterns.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 sm:p-4 rounded-2xl border-2 border-border bg-surface-subtle hover:border-accent transition-colors space-y-2 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-status-errorBg text-status-error line-through font-mono font-bold">
                  "{item.trapPattern}"
                </span>
                <ArrowRight size={13} className="text-muted" />
                <span className="text-xs px-3 py-1 rounded-lg bg-status-successBg text-status-success font-mono font-bold flex items-center gap-1">
                  <span>"{item.correctUsage}"</span>
                  <AudioButton text={item.correctUsage} size="sm" />
                </span>
              </div>

              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-status-warningBg text-status-warning border border-status-warningBorder self-start sm:self-auto">
                {item.count}× előfordulás
              </span>
            </div>

            <p className="text-xs text-ink leading-relaxed bg-surface-subtle p-2.5 rounded-xl border border-border font-sans font-medium">
              <strong>Szabály:</strong> {item.explanationHu}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
