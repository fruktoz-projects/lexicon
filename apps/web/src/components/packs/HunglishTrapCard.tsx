import React from 'react';
import { ContrastiveNoteModel } from '@lexicon/types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { AudioButton } from '../common/AudioButton';

interface HunglishTrapCardProps {
  note: ContrastiveNoteModel;
}

export const HunglishTrapCard: React.FC<HunglishTrapCardProps> = ({ note }) => {
  return (
    <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl p-4 sm:p-5 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
          <AlertCircle size={16} />
        </div>
        <h4 className="font-monument font-bold text-xs sm:text-sm text-[#1C150D]">
          Kontrasztív Hunglish Elemzés & Szabály
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-3">
        {/* Trap */}
        <div className="bg-red-50 border border-red-300 rounded-xl p-3 shadow-sm">
          <span className="text-[11px] font-bold text-red-900 block mb-1 font-sans">
            ❌ Gyakori magyar hibaminta:
          </span>
          <span className="font-mono text-xs sm:text-sm text-red-950 font-bold line-through">
            "{note.hunglishTrap}"
          </span>
        </div>

        {/* Correct */}
        <div className="bg-emerald-50 border border-emerald-400 rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1 font-sans">
              <CheckCircle2 size={13} /> Helyes angol kifejezés:
            </span>
            <AudioButton text={note.correctUsage} size="sm" />
          </div>
          <span className="font-mono text-xs sm:text-sm text-emerald-950 font-bold block mt-1">
            "{note.correctUsage}"
          </span>
        </div>
      </div>

      {/* Explanation */}
      <div className="p-3 bg-[#EAD9B8] rounded-xl border border-[#C5A566] shadow-inner">
        <span className="text-[11px] font-monument font-bold text-[#1C150D] block mb-0.5">Szabály:</span>
        <p className="text-xs text-[#1C150D] leading-relaxed font-sans">{note.explanationHu}</p>
      </div>
    </div>
  );
};
