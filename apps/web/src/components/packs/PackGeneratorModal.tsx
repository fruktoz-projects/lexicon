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
      setError(err.response?.data?.error || err.message || 'Nem sikerült a tananyag létrehozása');
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
      icon: <Anchor size={18} className="text-zone-everyday" />,
    },
    {
      type: ZoneType.BUSINESS,
      title: 'Üzleti angol',
      sub: 'Üzlet, tárgyalás, karrier (25%)',
      icon: <Coins size={18} className="text-zone-business" />,
    },
    {
      type: ZoneType.IT,
      title: 'IT & Technológia',
      sub: 'Szoftver, DevOps, architektúra (20%)',
      icon: <Cpu size={18} className="text-zone-it" />,
    },
    {
      type: ZoneType.ACADEMIC,
      title: 'Akadémiai angol',
      sub: 'Akadémiai írás & érvelés (15%)',
      icon: <Landmark size={18} className="text-zone-academic" />,
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
          <div className="p-3.5 rounded-xl bg-status-errorBg border border-status-errorBorder text-status-error text-xs font-sans font-bold shadow-subtle">
            ⚠️ {error}
          </div>
        )}

        {/* Quick Topic Chips */}
        <div>
          <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-muted block mb-1.5">
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
                className="text-xs font-sans font-semibold px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-surface text-ink border border-border hover:border-accent transition-all shadow-subtle"
              >
                + {qt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Input */}
        <div>
          <label className="block text-xs font-sans font-bold text-ink mb-1.5">
            Témakör vagy tanulási cél *
          </label>
          <input
            type="text"
            required
            placeholder="pl. GraphQL vs REST API, Nemzetközi bértárgyalási stratégiák..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-surface text-sm text-ink font-medium placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none shadow-inner"
          />
        </div>

        {/* CEFR Level */}
        <div>
          <label className="block text-xs font-sans font-bold text-ink mb-1.5">
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
                  className={`p-2.5 rounded-xl border-2 text-xs font-sans font-bold flex items-center justify-center gap-1 transition-all shadow-subtle ${isSelected
                      ? 'bg-accent text-accent-text border-accent shadow-sm'
                      : 'bg-surface-subtle border-border text-ink hover:bg-surface-subtle hover:border-border'
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
          <label className="block text-xs font-sans font-bold text-ink mb-1.5">
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
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-surface-subtle border-accent ring-1 ring-accent/30 shadow-sm'
                      : 'bg-surface-subtle border-border-subtle hover:border-accent hover:bg-surface-subtle shadow-subtle'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg border ${
                      isSelected
                        ? 'bg-surface-subtle border-border'
                        : 'bg-surface border-border'
                    }`}>
                      {z.icon}
                    </div>
                    <div>
                      <span className="font-sans font-bold text-xs text-ink block">{z.title}</span>
                      <span className="text-[11px] text-muted font-sans font-medium block">{z.sub}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 size={18} className="text-accent shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Focus */}
        <div>
          <label className="block text-xs font-sans font-bold text-ink mb-1.5">
            Egyedi fókusz (opcionális)
          </label>
          <input
            type="text"
            placeholder="pl. Különös hangsúly az elöljárószókra vagy szoftveres kifejezésekre"
            value={customFocus}
            onChange={(e) => setCustomFocus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-surface text-xs sm:text-sm text-ink font-medium placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none shadow-inner"
          />
        </div>

        {/* Info Banner */}
        <div className="p-3.5 bg-surface-subtle rounded-xl border border-border-subtle text-xs text-muted leading-relaxed font-sans font-medium flex items-start gap-2">
          <span className="text-accent shrink-0 mt-0.5">ℹ️</span>
          <span>Az AI a magyar magyarázatokat, szókincset, kollokációkat és Hunglish csapdákat pedagógiai séma szerint állítja elő a napi SRS gyakorláshoz.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Mégse
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !topic.trim()}
            className="flex items-center gap-2 px-6 py-2.5 font-sans font-bold"
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
