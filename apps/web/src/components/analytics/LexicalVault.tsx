import React, { useState } from 'react';
import { useOfflineStore } from '../../store/offlineStore';
import { CefrBadge } from '../common/CefrBadge';
import { AudioButton } from '../common/AudioButton';
import { Search, BookOpen } from 'lucide-react';
import { ZoneType } from '@lexicon/types';
import { audio } from '../../services/audio';

export const LexicalVault: React.FC = () => {
  const packs = useOfflineStore((s) => s.packs);
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
    <div className="bg-papyrus-card rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-card space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-xl font-monument font-bold text-papyrus-ink flex items-center gap-2">
            <BookOpen size={20} className="text-brand" />
            <span>Szókincs & Kollokáció Tár</span>
          </h3>
          <p className="text-xs sm:text-sm font-sans text-papyrus-muted mt-0.5 font-semibold">
            Az összes felfedezett szó, kifejezéscsomag és kollokáció kiejtéssel és kontextussal
          </p>
        </div>

        <span className="text-xs font-sans font-bold px-3.5 py-1 rounded-full bg-papyrus-subtle text-papyrus-ink border border-papyrus-border self-start sm:self-auto shadow-subtle">
          {filtered.length} elem
        </span>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <div className="relative sm:col-span-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-papyrus-muted" />
          <input
            type="text"
            placeholder="Keresés angolul vagy magyarul..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border-2 border-papyrus-border bg-white text-papyrus-ink font-medium focus:ring-2 focus:ring-brand/20 focus:border-brand focus:outline-none"
          />
        </div>

        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border-2 border-papyrus-border bg-white text-papyrus-ink focus:outline-none font-sans font-bold"
        >
          <option value="all">Minden Zóna</option>
          <option value={ZoneType.EVERYDAY}>Mindennapok</option>
          <option value={ZoneType.BUSINESS}>Üzleti angol</option>
          <option value={ZoneType.IT}>IT & Technológia</option>
          <option value={ZoneType.ACADEMIC}>Akadémiai angol</option>
        </select>

        <div className="flex items-center gap-1 bg-papyrus-subtle p-1 rounded-xl border border-papyrus-border">
          <button
            onClick={() => {
              audio.playClickSound();
              setSelectedType('all');
            }}
            className={`flex-1 py-1 text-xs rounded-lg font-sans transition-all ${selectedType === 'all' ? 'bg-papyrus-card text-papyrus-ink shadow-subtle font-bold border border-papyrus-border' : 'text-papyrus-muted font-bold'
              }`}
          >
            Összes
          </button>
          <button
            onClick={() => {
              audio.playClickSound();
              setSelectedType('vocab');
            }}
            className={`flex-1 py-1 text-xs rounded-lg font-sans transition-all ${selectedType === 'vocab' ? 'bg-papyrus-card text-papyrus-ink shadow-subtle font-bold border border-papyrus-border' : 'text-papyrus-muted font-bold'
              }`}
          >
            Szavak
          </button>
          <button
            onClick={() => {
              audio.playClickSound();
              setSelectedType('chunk');
            }}
            className={`flex-1 py-1 text-xs rounded-lg font-sans transition-all ${selectedType === 'chunk' ? 'bg-papyrus-card text-papyrus-ink shadow-subtle font-bold border border-papyrus-border' : 'text-papyrus-muted font-bold'
              }`}
          >
            Kollokációk
          </button>
        </div>
      </div>

      {/* Grid of items */}
      {filtered.length === 0 ? (
        <div className="p-6 text-center text-papyrus-muted font-sans font-medium text-sm">
          Nincs találat a megadott keresési feltételekre.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-scribe font-bold text-base sm:text-lg text-papyrus-ink">{item.english}</h4>
                    <AudioButton text={item.english} size="sm" />
                  </div>
                  <CefrBadge level={item.cefr} size="sm" />
                </div>

                {item.phonetics && (
                  <span className="text-[11px] font-mono text-papyrus-muted block mb-1 font-semibold">
                    {item.phonetics}
                  </span>
                )}

                <p className="text-xs font-bold text-brand mb-2 font-sans">{item.hungarian}</p>

                {item.detail && (
                  <p className="text-xs text-papyrus-muted italic font-scribe leading-relaxed line-clamp-2 font-medium">
                    "{item.detail}"
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-papyrus-border flex items-center justify-between text-[10px] font-mono text-papyrus-muted font-semibold">
                <span>{zoneLabel(item.zone)}</span>
                <span className="px-2 py-0.5 rounded-full bg-papyrus-subtle text-papyrus-ink font-sans uppercase font-bold border border-papyrus-border">
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
