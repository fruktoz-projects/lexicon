import React from 'react';
import { ContrastiveNoteModel } from '@lexicon/types';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AudioButton } from '../common/AudioButton';

interface HunglishTrapCardProps {
  note: ContrastiveNoteModel;
}

export const HunglishTrapCard: React.FC<HunglishTrapCardProps> = ({ note }) => {
  return (
    <div className="bg-surface rounded-2xl p-5 shadow-card space-y-3.5">
      {/* Card Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-status-warningBg text-status-warning border border-status-warningBorder shadow-subtle">
            <ShieldAlert size={16} />
          </div>
          <h4 className="font-sans font-bold text-xs sm:text-sm text-ink">
            Kontrasztív Hunglish Csapda & Szabály
          </h4>
        </div>

        <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-status-errorBg text-status-error border border-status-errorBorder">
          Gyakori Hiba
        </span>
      </div>

      {/* 2-Column Contrast Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Error Side */}
        <div className="bg-status-errorBg border border-status-errorBorder rounded-xl p-3.5 shadow-subtle">
          <span className="text-[11px] font-bold text-status-error block mb-1 font-sans flex items-center gap-1">
            <AlertCircle size={13} /> Hibás magyar tükörfordítás:
          </span>
          <span className="font-mono text-xs sm:text-sm text-status-error font-bold line-through">
            "{note.hunglishTrap}"
          </span>
        </div>

        {/* Correct Side */}
        <div className="bg-status-successBg border border-status-successBorder rounded-xl p-3.5 shadow-subtle">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-status-success flex items-center gap-1 font-sans">
              <CheckCircle2 size={13} /> Helyes angol forma:
            </span>
            <AudioButton text={note.correctUsage} size="sm" />
          </div>
          <span className="font-mono text-xs sm:text-sm text-status-success font-bold block">
            "{note.correctUsage}"
          </span>
        </div>
      </div>

      {/* Explanation Rule */}
      <div className="p-3.5 bg-surface-subtle rounded-xl">
        <span className="text-[11px] font-sans font-bold text-ink block mb-0.5">
          Magyarázat & Szabály:
        </span>
        <p className="text-xs text-ink leading-relaxed font-sans">{note.explanationHu}</p>
      </div>
    </div>
  );
};
