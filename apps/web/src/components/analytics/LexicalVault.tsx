import React, { useState } from 'react';
import { useOfflineStore } from '../../store/offlineStore';
import { CefrBadge } from '../common/CefrBadge';
import { AudioButton } from '../common/AudioButton';
import { Search, BookOpen, Hash } from 'lucide-react';
import { ZoneType } from '@lexicon/types';
import { audio } from '../../services/audio';

export const LexicalVault: React.FC = () => {
  const packs = useOfflineStore((s) => s.packs);
  const progress = useOfflineStore((s) => s.progress);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'vocab' | 'chunk'>('all');

  // Extract all vocab and chunks
  const allVocab = packs.flatMap((p) =>
    (p.vocabulary || []).map((v) => ({
      ...v,
      zone: p.topic,
      cefr: p.cefr,
      type: 'vocab' as const,
    }))
  );

  const allChunks = packs.flatMap((p) =>
    (p.chunks || []).map((c) => ({
      ...c,
      zone: p.topic,
      cefr: p.cefr,
      type: 'chunk' as const,
    }))
  );

  const combined = [
    ...allVocab.map((v) => ({
      id: v.id,
      english: v.term,
      hungarian: v.translationHu,
      detail: v.definitionEn || v.collocations?.join(', '),
      phonetics: v.phonetics,
      zone: v.zone,
      cefr: v.cefr,
      type: 'vocab' as const,
    })),
    ...allChunks.map((c) => ({
      id: c.id,
      english: c.phrase,
      hungarian: c.meaningHu,
      detail: c.contextSentence,
      phonetics: null,
      zone: c.zone,
      cefr: c.cefr,
      type: 'chunk' as const,
    })),
  ];

  const filtered = combined.filter((item) => {
    const matchSearch =
      item.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hungarian.toLowerCase().includes(searchTerm.toLowerCase());
    const matchZone = selectedZone === 'all' || item.zone === selectedZone;
    const matchType = selectedType === 'all' || item.type === selectedType;
    return matchSearch && matchZone && matchType;
  });

  const zoneLabel = (z: string) => {
    switch (z) {
      case ZoneType.EVERYDAY: return 'Mindennapok';
      case ZoneType.BUSINESS: return 'Üzleti';
      case ZoneType.IT: return 'IT';
      case ZoneType.ACADEMIC: return 'Akadémiai';
      default: return z;
    }
  };

  return (
    <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-card space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-xl font-monument font-bold text-[#1C150D] flex items-center gap-2">
            <BookOpen size={20} className="text-[#8B5E3C]" />
            <span>Szókincs & Kollokáció Tár</span>
          </h3>
          <p className="text-xs sm:text-sm font-scribe text-[#7A6B55] mt-0.5 font-semibold">
            Az összes felfedezett szó, kifejezéscsomag és kollokáció kiejtéssel és kontextussal
          </p>
        </div>

        <span className="text-xs font-monument font-bold px-3.5 py-1 rounded-full bg-[#EAD9B8] text-[#5C4A2F] border border-[#C5A566] self-start sm:self-auto shadow-sm">
          {filtered.length} elem
        </span>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <div className="relative sm:col-span-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8B73]" />
          <input
            type="text"
            placeholder="Keresés angolul vagy magyarul..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border-2 border-[#C5A566] bg-white text-[#1C150D] font-medium focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] focus:outline-none"
          />
        </div>

        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border-2 border-[#C5A566] bg-white text-[#1C150D] focus:outline-none font-monument font-bold"
        >
          <option value="all">Minden Zóna</option>
          <option value={ZoneType.EVERYDAY}>Mindennapok</option>
          <option value={ZoneType.BUSINESS}>Üzleti angol</option>
          <option value={ZoneType.IT}>IT & Technológia</option>
          <option value={ZoneType.ACADEMIC}>Akadémiai angol</option>
        </select>

        <div className="flex items-center gap-1 bg-[#EAD9B8] p-1 rounded-xl border border-[#C5A566]">
          <button
            onClick={() => {
              audio.playClickSound();
              setSelectedType('all');
            }}
            className={`flex-1 py-1 text-xs rounded-lg font-monument transition-all ${
              selectedType === 'all' ? 'bg-[#F5EBD4] text-[#1C150D] shadow-sm font-bold border border-[#C5A566]' : 'text-[#7A6B55] font-bold'
            }`}
          >
            Összes
          </button>
          <button
            onClick={() => {
              audio.playClickSound();
              setSelectedType('vocab');
            }}
            className={`flex-1 py-1 text-xs rounded-lg font-monument transition-all ${
              selectedType === 'vocab' ? 'bg-[#F5EBD4] text-[#1C150D] shadow-sm font-bold border border-[#C5A566]' : 'text-[#7A6B55] font-bold'
            }`}
          >
            Szavak
          </button>
          <button
            onClick={() => {
              audio.playClickSound();
              setSelectedType('chunk');
            }}
            className={`flex-1 py-1 text-xs rounded-lg font-monument transition-all ${
              selectedType === 'chunk' ? 'bg-[#F5EBD4] text-[#1C150D] shadow-sm font-bold border border-[#C5A566]' : 'text-[#7A6B55] font-bold'
            }`}
          >
            Kollokációk
          </button>
        </div>
      </div>

      {/* Grid of items */}
      {filtered.length === 0 ? (
        <div className="p-6 text-center text-[#7A6B55] font-scribe font-semibold text-sm">
          Nincs találat a megadott keresési feltételekre.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border-2 border-[#C5A566] bg-[#FBF4E4] hover:border-[#8B5E3C] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-scribe font-bold text-base sm:text-lg text-[#1C150D]">{item.english}</h4>
                    <AudioButton text={item.english} size="sm" />
                  </div>
                  <CefrBadge level={item.cefr} size="sm" />
                </div>

                {item.phonetics && (
                  <span className="text-[11px] font-mono text-[#7A6B55] block mb-1 font-semibold">
                    {item.phonetics}
                  </span>
                )}

                <p className="text-xs font-bold text-[#8B5E3C] mb-2">{item.hungarian}</p>

                {item.detail && (
                  <p className="text-xs text-[#7A6B55] italic font-scribe leading-relaxed line-clamp-2 font-semibold">
                    "{item.detail}"
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-[#C5A566] flex items-center justify-between text-[10px] font-mono text-[#7A6B55] font-semibold">
                <span>{zoneLabel(item.zone)}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#EAD9B8] text-[#5C4A2F] font-monument uppercase font-bold border border-[#C5A566]">
                  {item.type === 'vocab' ? 'Szó' : 'Kollokáció'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
