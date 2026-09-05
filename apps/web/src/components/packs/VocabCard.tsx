import React from 'react';
import { VocabularyItemModel } from '@lexicon/types';
import { AudioButton } from '../common/AudioButton';
import { BookOpen } from 'lucide-react';

interface VocabCardProps {
  item: VocabularyItemModel;
}

export const VocabCard: React.FC<VocabCardProps> = ({ item }) => {
  return (
    <div className="bg-surface rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
      <div>
        {/* Header: Term, Phonetics, Audio, Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg sm:text-xl font-scribe font-bold text-ink">{item.term}</h4>
              <AudioButton text={item.term} size="sm" />
            </div>
            {item.phonetics && (
              <span className="text-xs font-mono text-muted font-semibold block mt-0.5">{item.phonetics}</span>
            )}
          </div>
          <span className="text-[11px] font-sans font-bold px-2.5 py-0.5 rounded-full bg-status-successBg text-status-success border border-status-successBorder shrink-0 flex items-center gap-1">
            <BookOpen size={12} />
            <span>Szó</span>
          </span>
        </div>

        {/* Hungarian Translation Inset */}
        <div className="mb-3 p-3 rounded-xl bg-surface-subtle">
          <span className="text-[10px] text-muted font-sans font-bold uppercase tracking-wider block mb-0.5">Magyar jelentés:</span>
          <span className="text-sm font-sans font-bold text-ink">{item.translationHu}</span>
        </div>

        {/* English Definition */}
        {item.definitionEn && (
          <div className="mb-3 text-xs text-muted leading-relaxed font-sans">
            <strong className="text-ink font-semibold">Definíció: </strong>
            <span className="italic">{item.definitionEn}</span>
          </div>
        )}

        {/* Collocations Pills */}
        {item.collocations && item.collocations.length > 0 && (
          <div className="mb-3">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted block mb-1.5">Gyakori kollokációk:</span>
            <div className="flex flex-wrap gap-1.5">
              {item.collocations.map((c, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-lg bg-surface-subtle text-ink font-sans font-semibold border border-status-warningBorder flex items-center gap-1.5 shadow-subtle"
                >
                  <span>{c}</span>
                  <AudioButton text={c} size="sm" />
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Examples Context Sentence */}
      {item.examples && item.examples.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-muted block mb-1">Példamondat:</span>
          <p className="text-xs text-ink italic font-scribe leading-relaxed bg-surface-subtle/60 p-2.5 rounded-xl font-medium">
            "{item.examples[0]}"
          </p>
        </div>
      )}
    </div>
  );
};
