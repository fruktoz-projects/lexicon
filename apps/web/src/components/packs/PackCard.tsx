import React from 'react';
import { Clock, Layers, ChevronRight } from 'lucide-react';
import { LearningPackSummary, ZONE_DETAILS, ZoneType } from '@lexicon/types';
import { CefrBadge } from '../common/CefrBadge';
import { audio } from '../../services/audio';

interface PackCardProps {
  pack: LearningPackSummary;
  onOpen: (id: string) => void;
}

export const PackCard: React.FC<PackCardProps> = ({ pack, onOpen }) => {
  const zoneInfo = ZONE_DETAILS[pack.topic as ZoneType] || {
    nameHu: pack.topic,
    color: '#6D28D9',
  };

  return (
    <div
      onClick={() => {
        audio.playClickSound();
        onOpen(pack.id);
      }}
      className="bg-surface rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <CefrBadge level={pack.cefr} size="sm" />
          <span className="text-[11px] font-sans font-bold px-2.5 py-0.5 rounded-full bg-surface-subtle text-ink border border-border">
            {zoneInfo.nameHu}
          </span>
        </div>

        <h4 className="font-monument font-bold text-sm sm:text-base text-ink group-hover:text-accent transition-colors line-clamp-2 mb-2">
          {pack.title}
        </h4>

        <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-4 font-sans font-medium">
          {pack.focus}
        </p>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono font-bold">
            <Clock size={13} className="text-muted" />
            <span>{pack.estimatedMinutes}p</span>
          </span>
          <span className="flex items-center gap-1 font-mono font-bold">
            <Layers size={13} className="text-muted" />
            <span>{pack.vocabularyCount || 4} szó / {pack.chunksCount || 3} kif.</span>
          </span>
        </div>

        <span className="text-accent font-sans font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
          Megnyitás <ChevronRight size={14} />
        </span>
      </div>
    </div>
  );
};
