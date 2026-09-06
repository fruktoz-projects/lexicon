import React, { useEffect, useState } from 'react';
import { Clock, Layers, ChevronRight, CheckCircle2, TrendingUp } from 'lucide-react';
import { LearningPackSummary, ZONE_DETAILS, ZoneType } from '@lexicon/types';
import { CefrBadge } from '../common/CefrBadge';
import { audio } from '../../services/audio';
import { api } from '../../services/api';

interface PackProgress {
  totalItems: number;
  practicedCount: number;
  masteredCount: number;
  completionPercent: number;
}

interface PackCardProps {
  pack: LearningPackSummary;
  onOpen: (id: string) => void;
}

export const PackCard: React.FC<PackCardProps> = ({ pack, onOpen }) => {
  const zoneInfo = ZONE_DETAILS[pack.topic as ZoneType] || {
    nameHu: pack.topic,
    color: '#6D28D9',
  };

  const [progress, setProgress] = useState<PackProgress | null>(null);

  useEffect(() => {
    api.packs.getProgress(pack.id).then(setProgress).catch(() => {});
  }, [pack.id]);

  const isNew = pack.createdAt
    ? new Date(pack.createdAt).toDateString() === new Date().toDateString()
    : false;

  const hasProgress = progress && progress.practicedCount > 0;
  const isCompleted = progress && progress.completionPercent >= 100;

  return (
    <div
      onClick={() => {
        audio.playClickSound();
        onOpen(pack.id);
      }}
      className={`bg-surface rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col justify-between group relative border-2 ${
        isCompleted
          ? 'border-status-success/40'
          : hasProgress
          ? 'border-accent/30'
          : isNew
          ? 'border-accent/50'
          : 'border-transparent'
      }`}
    >
      {/* Status badge */}
      {isCompleted ? (
        <div className="absolute -top-2 -right-2 bg-status-success text-white text-[10px] font-monument font-bold px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 size={10} /> Kész!
        </div>
      ) : hasProgress ? (
        <div className="absolute -top-2 -right-2 bg-accent text-accent-text text-[10px] font-monument font-bold px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider flex items-center gap-1">
          <TrendingUp size={10} /> Folyamatban
        </div>
      ) : isNew ? (
        <div className="absolute -top-2 -right-2 bg-accent text-accent-text text-[10px] font-monument font-bold px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider animate-bounce-slow">
          Új!
        </div>
      ) : null}

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

        <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-3 font-sans font-medium">
          {pack.focus}
        </p>

        {/* Progress bar */}
        {progress && progress.totalItems > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] font-mono text-muted mb-1">
              <span>{progress.practicedCount}/{progress.totalItems} elem gyakorolva</span>
              <span className="font-bold text-accent">{progress.completionPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-subtle rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted ? 'bg-status-success' : 'bg-accent'
                }`}
                style={{ width: `${progress.completionPercent}%` }}
              />
            </div>
            {progress.masteredCount > 0 && (
              <div className="flex items-center gap-1 text-[10px] font-mono text-status-success mt-1">
                <CheckCircle2 size={10} />
                <span>{progress.masteredCount} elem elsajátítva</span>
              </div>
            )}
          </div>
        )}
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

