import React from 'react';
import { ChunkModel } from '@lexicon/types';
import { AudioButton } from '../common/AudioButton';
import { Link2 } from 'lucide-react';

interface ChunkCardProps {
  chunk: ChunkModel;
}

export const ChunkCard: React.FC<ChunkCardProps> = ({ chunk }) => {
  return (
    <div className="bg-papyrus-card rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
      <div>
        {/* Header: Phrase, Meaning, Audio, Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-papyrus-warm text-brand border border-status-warningBorder shadow-subtle shrink-0 mt-0.5">
              <Link2 size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base sm:text-lg font-scribe font-bold text-papyrus-ink">{chunk.phrase}</h4>
                <AudioButton text={chunk.phrase} size="sm" />
              </div>
              <span className="text-xs font-sans font-bold text-brand block mt-0.5">{chunk.meaningHu}</span>
            </div>
          </div>

          <span className="text-[11px] font-sans font-bold px-2.5 py-0.5 rounded-full bg-papyrus-warm text-papyrus-ink border border-status-warningBorder shrink-0">
            Kollokáció
          </span>
        </div>
      </div>

      {/* Context Sentence */}
      <div className="mt-3 p-3.5 rounded-xl bg-papyrus-subtle">
        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-papyrus-muted block mb-1">
          Életszerű szituáció / Kontextus:
        </span>
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-scribe italic text-papyrus-ink leading-relaxed font-semibold">
            "{chunk.contextSentence}"
          </p>
          <AudioButton text={chunk.contextSentence} size="sm" />
        </div>
      </div>
    </div>
  );
};
