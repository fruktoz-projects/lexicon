import React from 'react';
import { VocabularyItemModel } from '@lexicon/types';
import { AudioButton } from '../common/AudioButton';

interface VocabCardProps {
  item: VocabularyItemModel;
}

export const VocabCard: React.FC<VocabCardProps> = ({ item }) => {
  return (
    <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl p-4 sm:p-5 shadow-card hover:border-[#8B5E3C] hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base sm:text-lg font-scribe font-bold text-[#1C150D]">{item.term}</h4>
            <AudioButton text={item.term} size="sm" />
          </div>
          {item.phonetics && (
            <span className="text-xs font-mono text-[#7A6B55] font-semibold">{item.phonetics}</span>
          )}
        </div>
        <span className="text-[10px] font-monument font-bold px-2.5 py-0.5 rounded-full bg-[#E0F0E8] text-[#1C4C34] border border-[#6BB38A] shrink-0 shadow-sm">
          Szókincs
        </span>
      </div>

      {/* Hungarian Translation */}
      <div className="my-2 p-2.5 rounded-xl bg-[#EAD9B8] border border-[#C5A566]">
        <span className="text-[11px] text-[#7A6B55] font-monument uppercase tracking-wider block font-bold">Magyar jelentés:</span>
        <span className="text-xs sm:text-sm font-bold text-[#1C150D]">{item.translationHu}</span>
      </div>

      {/* English Definition */}
      {item.definitionEn && (
        <div className="mb-2 text-xs text-[#7A6B55] leading-relaxed font-scribe font-semibold italic">
          <strong className="not-italic text-[#1C150D] font-sans font-bold">Definíció: </strong>
          {item.definitionEn}
        </div>
      )}

      {/* Collocations */}
      {item.collocations && item.collocations.length > 0 && (
        <div className="mb-2">
          <span className="text-[11px] font-monument uppercase text-[#7A6B55] block mb-1 font-bold">Gyakori kollokációk:</span>
          <div className="flex flex-wrap gap-1.5">
            {item.collocations.map((c, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-0.5 rounded-lg bg-[#FBF4E4] text-[#1C150D] font-bold border border-[#C5A566] flex items-center gap-1 shadow-sm font-scribe"
              >
                <span>{c}</span>
                <AudioButton text={c} size="sm" />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Examples */}
      {item.examples && item.examples.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-[#C5A566]">
          <span className="text-[11px] font-monument uppercase text-[#7A6B55] block mb-1 font-bold">Kontextus mondat:</span>
          <p className="text-xs text-[#1C150D] italic font-scribe leading-relaxed bg-[#FBF4E4] p-2.5 rounded-xl border border-[#C5A566] font-semibold">
            "{item.examples[0]}"
          </p>
        </div>
      )}
    </div>
  );
};
