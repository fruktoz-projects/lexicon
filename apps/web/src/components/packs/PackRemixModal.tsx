import React, { useState } from 'react';
import { CefrLevel, ZoneType } from '@lexicon/types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { Shuffle, Loader2, CheckCircle2, Sliders } from 'lucide-react';
import { audio } from '../../services/audio';

interface PackRemixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPackCreated: (newPackId: string) => void;
}

export const PackRemixModal: React.FC<PackRemixModalProps> = ({
  isOpen,
  onClose,
  onPackCreated,
}) => {
  const [cefr, setCefr] = useState<CefrLevel>(CefrLevel.B2);
  const [zone, setZone] = useState<string>('all');
  const [customTitle, setCustomTitle] = useState('');
  const [vocabCount, setVocabCount] = useState<number>(5);
  const [chunkCount, setChunkCount] = useState<number>(4);
  const [trapCount, setTrapCount] = useState<number>(3);
  const [exerciseCount, setExerciseCount] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cefrOptions = [
    { level: CefrLevel.A2, label: 'A2 — Kezdő' },
    { level: CefrLevel.B1, label: 'B1 — Középhaladó' },
    { level: CefrLevel.B2, label: 'B2 — Haladó' },
    { level: CefrLevel.C1, label: 'C1 — Felsőfokú' },
  ];

  const zones = [
    { type: 'all', label: 'Összes zóna' },
    { type: ZoneType.EVERYDAY, label: 'Mindennapok' },
    { type: ZoneType.BUSINESS, label: 'Üzleti angol' },
    { type: ZoneType.IT, label: 'IT & Technológia' },
    { type: ZoneType.ACADEMIC, label: 'Akadémiai angol' },
  ];

  const handleRemix = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    audio.playClickSound();

    try {
      const newPack = await api.packs.remix({
        cefr,
        zone: zone !== 'all' ? zone : undefined,
        title: customTitle.trim() || undefined,
        vocabCount,
        chunkCount,
        trapCount,
        exerciseCount,
      });

      audio.playSuccessSound();
      onPackCreated(newPack.id);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Nem sikerült az ismétlő tananyag összeállítása');
      audio.playMistakeSound();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ismétlő remix összeállítás"
      subtitle="Véletlenszerűen szintetizált tananyag az eddig generált almodulokból"
      maxWidth="2xl"
    >
      <form onSubmit={handleRemix} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-status-errorBg border border-status-errorBorder text-status-error text-xs font-sans font-bold shadow-subtle">
            ⚠️ {error}
          </div>
        )}

        {/* CEFR Level */}
        <div>
          <label className="block text-xs font-sans font-bold text-ink mb-1.5">
            1. CEFR szint *
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
                      : 'bg-surface-subtle border-border text-ink hover:bg-surface-subtle'
                    }`}
                >
                  {isSelected && <CheckCircle2 size={14} />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Zone Selection */}
        <div>
          <label className="block text-xs font-sans font-bold text-ink mb-1.5">
            2. Tartalmi terület
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {zones.map((z) => {
              const isSelected = zone === z.type;
              return (
                <button
                  key={z.type}
                  type="button"
                  onClick={() => {
                    audio.playClickSound();
                    setZone(z.type);
                  }}
                  className={`p-2.5 rounded-xl border-2 text-xs font-sans font-bold text-left flex items-center justify-between transition-all shadow-subtle ${isSelected
                      ? 'bg-surface-subtle border-accent text-ink ring-1 ring-accent/30 shadow-sm'
                      : 'bg-surface-subtle border-border-subtle text-ink hover:bg-surface-subtle hover:border-accent'
                    }`}
                >
                  <span>{z.label}</span>
                  {isSelected && <CheckCircle2 size={16} className="text-accent shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modular Composition Sliders */}
        <div className="bg-surface-subtle p-4 rounded-2xl border border-border space-y-3.5">
          <div className="flex items-center gap-2 font-sans font-bold text-xs text-ink">
            <Sliders size={15} className="text-accent" />
            <span>Almodulok mennyisége:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-surface p-2.5 rounded-xl border border-border text-center shadow-subtle">
              <label className="text-[11px] font-sans text-muted block font-bold mb-1">Szavak</label>
              <select
                value={vocabCount}
                onChange={(e) => setVocabCount(parseInt(e.target.value, 10))}
                className="w-full text-center font-mono font-bold text-sm bg-surface-subtle border rounded-lg py-1 text-ink focus:outline-none"
              >
                {[3, 4, 5, 6, 8, 10].map((num) => (
                  <option key={num} value={num}>{num} db</option>
                ))}
              </select>
            </div>

            <div className="bg-surface p-2.5 rounded-xl border border-border text-center shadow-subtle">
              <label className="text-[11px] font-sans text-muted block font-bold mb-1">Kollokációk</label>
              <select
                value={chunkCount}
                onChange={(e) => setChunkCount(parseInt(e.target.value, 10))}
                className="w-full text-center font-mono font-bold text-sm bg-surface-subtle border rounded-lg py-1 text-ink focus:outline-none"
              >
                {[2, 3, 4, 5, 6, 8].map((num) => (
                  <option key={num} value={num}>{num} db</option>
                ))}
              </select>
            </div>

            <div className="bg-surface p-2.5 rounded-xl border border-border text-center shadow-subtle">
              <label className="text-[11px] font-sans text-muted block font-bold mb-1">Hunglish csapdák</label>
              <select
                value={trapCount}
                onChange={(e) => setTrapCount(parseInt(e.target.value, 10))}
                className="w-full text-center font-mono font-bold text-sm bg-surface-subtle border rounded-lg py-1 text-ink focus:outline-none"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>{num} db</option>
                ))}
              </select>
            </div>

            <div className="bg-surface p-2.5 rounded-xl border border-border text-center shadow-subtle">
              <label className="text-[11px] font-sans text-muted block font-bold mb-1">Feladatok</label>
              <select
                value={exerciseCount}
                onChange={(e) => setExerciseCount(parseInt(e.target.value, 10))}
                className="w-full text-center font-mono font-bold text-sm bg-surface-subtle border rounded-lg py-1 text-ink focus:outline-none"
              >
                {[3, 4, 5, 6, 8, 10].map((num) => (
                  <option key={num} value={num}>{num} db</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Custom Pack Name */}
        <div>
          <label className="block text-xs font-sans font-bold text-ink mb-1.5">
            Egyedi tananyag név (opcionális)
          </label>
          <input
            type="text"
            placeholder={`pl. B2 ismétlő remix • ${new Date().toLocaleDateString('hu-HU')}`}
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 border-border bg-surface text-xs sm:text-sm text-ink font-medium placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none shadow-inner"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Mégse
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 font-sans font-bold"
          >
            {isLoading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                <span>Összeállítás...</span>
              </>
            ) : (
              <>
                <Shuffle size={17} />
                <span>Remix összeállítása</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
