import React from 'react';
import { ChunkModel } from '@lexicon/types';
import { AudioButton } from '../common/AudioButton';
import { Link2 } from 'lucide-react';

interface ChunkCardProps {
  chunk: ChunkModel;
}

export const ChunkCard: React.FC<ChunkCardProps> = ({ chunk }) => {
  return (
    <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl p-4 sm:p-5 shadow-card hover:border-[#8B5E3C] hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#FAF0CD] text-[#8B5E3C] border border-[#D4A843] shadow-sm">
            <Link2 size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-scribe font-bold text-[#1C150D]">{chunk.phrase}</h4>
              <AudioButton text={chunk.phrase} size="sm" />
            </div>
            <span className="text-xs font-bold text-[#8B5E3C]">{chunk.meaningHu}</span>
          </div>
        </div>
        <span className="text-[10px] font-monument font-bold px-2.5 py-0.5 rounded-full bg-[#FAF0CD] text-[#5C4A2F] border border-[#D4A843] shrink-0 shadow-sm">
          Kollokáció
        </span>
      </div>

      <div className="mt-3 p-3 rounded-xl bg-[#EAD9B8] border border-[#C5A566] shadow-inner">
        <span className="text-[11px] font-monument uppercase text-[#7A6B55] block mb-1 font-bold">Kontextus mondat:</span>
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-scribe italic text-[#1C150D] leading-relaxed font-semibold">
            "{chunk.contextSentence}"
          </p>
          <AudioButton text={chunk.contextSentence} size="sm" />
        </div>
      </div>
    </div>
  );
};
