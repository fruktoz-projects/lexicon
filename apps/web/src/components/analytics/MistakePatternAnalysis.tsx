import React from 'react';
import { MistakePatternItem } from '@lexicon/types';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { AudioButton } from '../common/AudioButton';

interface MistakePatternAnalysisProps {
  patterns: MistakePatternItem[];
}

export const MistakePatternAnalysis: React.FC<MistakePatternAnalysisProps> = ({ patterns }) => {
  return (
    <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-xl font-monument font-bold text-[#1C150D] flex items-center gap-2">
            <AlertTriangle size={18} className="text-[#8B5E3C]" />
            <span>Gyakori Hunglish hibaminták</span>
          </h3>
          <p className="text-xs sm:text-sm font-scribe text-[#7A6B55] mt-0.5 font-semibold">
            Tipikus magyar tükörfordítások és prepozíciós hibák felszámolása
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {patterns.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 sm:p-4 rounded-2xl border-2 border-[#C5A566] bg-[#FBF4E4] hover:border-[#8B5E3C] transition-colors space-y-2 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-red-100 text-red-950 line-through font-mono font-bold">
                  "{item.trapPattern}"
                </span>
                <ArrowRight size={13} className="text-[#9A8B73]" />
                <span className="text-xs px-3 py-1 rounded-lg bg-emerald-100 text-emerald-950 font-mono font-bold flex items-center gap-1">
                  <span>"{item.correctUsage}"</span>
                  <AudioButton text={item.correctUsage} size="sm" />
                </span>
              </div>

              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 self-start sm:self-auto">
                {item.count}× előfordulás
              </span>
            </div>

            <p className="text-xs text-[#1C150D] leading-relaxed bg-[#EAD9B8] p-2.5 rounded-xl border border-[#C5A566] font-sans font-medium">
              <strong>Szabály:</strong> {item.explanationHu}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
