import React, { useState } from 'react';
import { CefrLevel, ZoneType } from '@lexicon/types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { Plus, Loader2, Anchor, Coins, Cpu, Landmark, CheckCircle2 } from 'lucide-react';
import { audio } from '../../services/audio';

interface PackGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPackCreated: () => void;
}

export const PackGeneratorModal: React.FC<PackGeneratorModalProps> = ({
  isOpen,
  onClose,
  onPackCreated,
}) => {
  const [topic, setTopic] = useState('');
  const [cefr, setCefr] = useState<CefrLevel>(CefrLevel.B2);
  const [zone, setZone] = useState<ZoneType>(ZoneType.IT);
  const [customFocus, setCustomFocus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickTopics = [
    { label: 'Microservices & API', zone: ZoneType.IT, cefr: CefrLevel.B2, text: 'Microservices vs Monolith architektúra, REST vs GraphQL, hibakezelés' },
    { label: 'Bér- és szerződéstárgyalás', zone: ZoneType.BUSINESS, cefr: CefrLevel.B2, text: 'Bértárgyalás, feltételek egyeztetése, kompromisszumok' },
    { label: 'Éles rendszerkrízis (Incident)', zone: ZoneType.IT, cefr: CefrLevel.B2, text: 'Production leállás elhárítása, post-mortem megbeszélés' },
    { label: 'Utazás & szállodai helyzetek', zone: ZoneType.EVERYDAY, cefr: CefrLevel.B1, text: 'Szállodai bejelentkezés, panaszkezelés és repülőtéri ügyintézés' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);
    audio.playClickSound();

    try {
      await api.packs.generate({
        topic: topic.trim(),
        cefr,
        zone,
        customFocus: customFocus.trim() || undefined,
      });

      audio.playSuccessSound();
      onPackCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Nem sikerült a tananyag létrehozása');
      audio.playMistakeSound();
    } finally {
      setIsLoading(false);
    }
  };

  const zones = [
    {
      type: ZoneType.EVERYDAY,
      title: 'Mindennapok',
      sub: 'Mindennapi élet & utazás (40%)',
      icon: <Anchor size={18} className="text-[#8B5E3C]" />,
    },
    {
      type: ZoneType.BUSINESS,
      title: 'Üzleti angol',
      sub: 'Üzlet, tárgyalás, karrier (25%)',
      icon: <Coins size={18} className="text-[#B8860B]" />,
    },
    {
      type: ZoneType.IT,
      title: 'IT & Technológia',
      sub: 'Szoftver, DevOps, architektúra (20%)',
      icon: <Cpu size={18} className="text-[#4A6F8B]" />,
    },
    {
      type: ZoneType.ACADEMIC,
      title: 'Akadémiai angol',
      sub: 'Akadémiai írás & érvelés (15%)',
      icon: <Landmark size={18} className="text-[#2E7D5B]" />,
    },
  ];

  const cefrOptions = [
    { level: CefrLevel.A2, label: 'A2 — Kezdő' },
    { level: CefrLevel.B1, label: 'B1 — Középhaladó' },
    { level: CefrLevel.B2, label: 'B2 — Haladó' },
    { level: CefrLevel.C1, label: 'C1 — Felsőfokú' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Új tananyag generálása (AI)"
      subtitle="Strukturált magyar → angol tananyag: szókincs, kollokációk és Hunglish csapdák"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-100 border border-red-300 text-red-950 text-xs font-sans font-bold shadow-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Quick Topic Chips */}
        <div>
          <span className="text-[11px] font-monument font-bold uppercase tracking-wider text-[#5C4A2F] block mb-1.5">
            Gyors témaötletek:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickTopics.map((qt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  audio.playClickSound();
                  setTopic(qt.text);
                  setZone(qt.zone);
                  setCefr(qt.cefr);
                }}
                className="text-xs font-medium px-3 py-1.5 rounded-xl bg-[#EAD9B8] hover:bg-white text-[#1C150D] border border-[#C5A566] hover:border-[#8B5E3C] transition-all shadow-sm"
              >
                + {qt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Input */}
        <div>
          <label className="block text-xs font-monument font-bold text-[#1C150D] mb-1.5">
            Témakör vagy tanulási cél *
          </label>
          <input
            type="text"
            required
            placeholder="pl. GraphQL vs REST API, Nemzetközi bértárgyalási stratégiák..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#C5A566] bg-white text-sm text-[#1C150D] font-medium placeholder:text-[#9A8B73] focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/20 focus:outline-none shadow-sm"
          />
        </div>

        {/* CEFR Level */}
        <div>
          <label className="block text-xs font-monument font-bold text-[#1C150D] mb-1.5">
            CEFR szint
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {cefrOptions.map((opt) => {
              const isSelected = cefr === opt.level;
              return (
                <button
                  key={opt.level}
                  type="button"
                  onClick={() => {
                    audio.playClickSound();
                    setCefr(opt.level);
                  }}
                  className={`p-2.5 rounded-xl border-2 text-xs font-monument font-bold flex items-center justify-center gap-1 transition-all shadow-sm ${
                    isSelected
                      ? 'bg-[#8B5E3C] text-white border-[#6B4226]'
                      : 'bg-white border-[#C5A566] text-[#1C150D] hover:bg-[#F5EBD4]'
                  }`}
                >
                  {isSelected && <CheckCircle2 size={14} />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Zone Grid Selection */}
        <div>
          <label className="block text-xs font-monument font-bold text-[#1C150D] mb-1.5">
            Tartalmi zóna
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {zones.map((z) => {
              const isSelected = zone === z.type;
              return (
                <div
                  key={z.type}
                  onClick={() => {
                    audio.playClickSound();
                    setZone(z.type);
                  }}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between shadow-sm ${
                    isSelected
                      ? 'bg-[#FAF0CD] border-[#8B5E3C] ring-1 ring-[#8B5E3C]/30'
                      : 'bg-white border-[#C5A566] hover:bg-[#F5EBD4] hover:border-[#8B5E3C]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#EAD9B8] border border-[#C5A566]">
                      {z.icon}
                    </div>
                    <div>
                      <span className="font-monument font-bold text-xs text-[#1C150D]">{z.title}</span>
                      <span className="text-[11px] text-[#7A6B55] font-sans font-medium block">{z.sub}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 size={18} className="text-[#8B5E3C] shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Focus */}
        <div>
          <label className="block text-xs font-monument font-bold text-[#1C150D] mb-1.5">
            Egyedi fókusz (opcionális)
          </label>
          <input
            type="text"
            placeholder="pl. Különös hangsúly az elöljárószókra vagy szoftveres kifejezésekre"
            value={customFocus}
            onChange={(e) => setCustomFocus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-[#C5A566] bg-white text-xs sm:text-sm text-[#1C150D] font-medium placeholder:text-[#9A8B73] focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/20 focus:outline-none shadow-sm"
          />
        </div>

        {/* Info Banner */}
        <div className="p-3.5 bg-[#EAD9B8] rounded-xl border border-[#C5A566] text-xs text-[#5C4A2F] leading-relaxed font-scribe font-semibold">
          Az AI a magyar magyarázatokat, szókincset, kollokációkat és Hunglish csapdákat pedagógiai séma szerint állítja elő a napi SRS gyakorláshoz.
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#C5A566]">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Mégse
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !topic.trim()}
            className="flex items-center gap-2 px-6 py-2.5 font-monument"
          >
            {isLoading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                <span>Generálás...</span>
              </>
            ) : (
              <>
                <Plus size={17} />
                <span>Tananyag generálása</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
