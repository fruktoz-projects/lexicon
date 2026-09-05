import React, { useState, useEffect } from 'react';
import { CefrLevel, LearningPackDetail, LearningPackSummary, ZoneType } from '@lexicon/types';
import { api } from '../services/api';
import { PackCard } from '../components/packs/PackCard';
import { PackDetailModal } from '../components/packs/PackDetailModal';
import { PackRemixModal } from '../components/packs/PackRemixModal';
import { Button } from '../components/common/Button';
import { useUiStore } from '../store/uiStore';
import { Layers, Plus, Filter, Anchor, Coins, Cpu, Landmark, Shuffle } from 'lucide-react';
import { audio } from '../services/audio';

interface ZonesPageProps {
  initialZone?: ZoneType;
  onStartPractice: () => void;
}

export const ZonesPage: React.FC<ZonesPageProps> = ({
  initialZone,
  onStartPractice,
}) => {
  const { openGeneratorModal, isRemixModalOpen, openRemixModal, closeRemixModal } = useUiStore();
  const [selectedZone, setSelectedZone] = useState<string>(initialZone || 'all');
  const [selectedCefr, setSelectedCefr] = useState<string>('all');
  const [packs, setPacks] = useState<LearningPackSummary[]>([]);
  const [activePackDetail, setActivePackDetail] = useState<LearningPackDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPacks = async () => {
    setIsLoading(true);
    try {
      const res = await api.packs.list({
        zone: selectedZone !== 'all' ? selectedZone : undefined,
        cefr: selectedCefr !== 'all' ? (selectedCefr as CefrLevel) : undefined,
      });
      setPacks(res.packs);
    } catch (err) {
      console.error('Failed to load packs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, [selectedZone, selectedCefr]);

  const handleOpenPack = async (id: string) => {
    try {
      const detail = await api.packs.getById(id);
      setActivePackDetail(detail);
    } catch (err) {
      console.error('Failed to get pack detail:', err);
    }
  };

  const handleRemixCreated = async (newPackId: string) => {
    await fetchPacks();
    handleOpenPack(newPackId);
  };

  const zoneTabs = [
    { id: 'all', label: 'Összes', icon: <Layers size={14} /> },
    { id: ZoneType.EVERYDAY, label: 'Mindennapok', icon: <Anchor size={14} /> },
    { id: ZoneType.BUSINESS, label: 'Üzleti', icon: <Coins size={14} /> },
    { id: ZoneType.IT, label: 'IT & Tech', icon: <Cpu size={14} /> },
    { id: ZoneType.ACADEMIC, label: 'Akadémiai', icon: <Landmark size={14} /> },
  ];

  const cefrLevels = ['all', CefrLevel.A2, CefrLevel.B1, CefrLevel.B2, CefrLevel.C1];

  return (
    <div className="space-y-5 sm:space-y-7 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-surface rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers size={22} className="text-accent" />
            <h2 className="text-lg sm:text-2xl font-monument font-bold text-ink">
              Tananyagok & Tartalmi Zónák
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-sans text-muted mt-0.5 sm:mt-1 font-semibold">
            Válassz szakterületet és CEFR szintet a tanulási modulok felfedezéséhez
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <Button
            variant="primary"
            onClick={() => {
              audio.playClickSound();
              openRemixModal();
            }}
            className="flex items-center gap-2 font-sans font-bold"
          >
            <Shuffle size={16} />
            <span>Ismétlő remix</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              audio.playClickSound();
              openGeneratorModal();
            }}
            className="flex items-center gap-2 font-sans font-bold"
          >
            <Plus size={16} />
            <span>Új tananyag (AI)</span>
          </Button>
        </div>
      </div>

      {/* Remix Info Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-subtle flex items-center justify-center text-accent shrink-0">
            <Shuffle size={20} />
          </div>
          <div>
            <h4 className="font-sans font-bold text-xs sm:text-sm text-ink">
              Moduláris tudásfelelevenítő rendszer
            </h4>
            <p className="text-xs font-sans text-muted mt-0.5 font-medium leading-relaxed">
              Az AI tananyagok almoduljai (szavak, kollokációk, Hunglish csapdák) szinten belül szabadon variálhatóak. Készíts véletlenszerű ismétlő összeállítást a meglévő tudás felelevenítésére.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            audio.playClickSound();
            openRemixModal();
          }}
          className="px-4 py-2 rounded-xl text-xs font-sans font-bold bg-accent hover:bg-accent-hover text-accent-text shadow-sm shrink-0 transition-all active:scale-95"
        >
          Remix összeállítása
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-card">
        {/* Zone Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {zoneTabs.map((tab) => {
            const isSelected = selectedZone === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  audio.playClickSound();
                  setSelectedZone(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-bold whitespace-nowrap transition-all ${isSelected
                    ? 'bg-accent text-accent-text shadow-sm'
                    : 'bg-surface-subtle text-ink hover:bg-surface'
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CEFR Level Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
          <span className="text-xs font-sans font-bold text-muted flex items-center gap-1">
            <Filter size={12} /> Szint:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {cefrLevels.map((lvl) => {
              const isSelected = selectedCefr === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => {
                    audio.playClickSound();
                    setSelectedCefr(lvl);
                  }}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-sans font-bold transition-all whitespace-nowrap ${isSelected
                      ? 'bg-accent text-accent-text shadow-sm'
                      : 'bg-surface-subtle text-ink hover:bg-surface'
                    }`}
                >
                  {lvl === 'all' ? 'Minden' : lvl}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of Packs */}
      {isLoading ? (
        <div className="p-8 text-center bg-surface rounded-2xl text-muted text-sm font-sans shadow-card font-semibold">
          Tananyagok betöltése...
        </div>
      ) : packs.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-surface rounded-3xl shadow-card space-y-3">
          <Layers size={40} className="text-muted/40 mx-auto" />
          <h4 className="font-monument font-bold text-sm sm:text-base text-ink">
            Nincs találat a kiválasztott szűrőkre.
          </h4>
          <p className="text-xs font-sans text-muted max-w-sm mx-auto font-medium">
            Hozz létre egy új tananyagot az „Új tananyag (AI)" vagy az „Ismétlő remix" gombbal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {packs.map((pack) => (
            <PackCard key={pack.id} pack={pack} onOpen={handleOpenPack} />
          ))}
        </div>
      )}

      {/* Detail Modal (Station Stepper) */}
      <PackDetailModal
        pack={activePackDetail}
        isOpen={Boolean(activePackDetail)}
        onClose={() => setActivePackDetail(null)}
        onStartPractice={() => {
          setActivePackDetail(null);
          onStartPractice();
        }}
      />

      {/* Remix Modal */}
      <PackRemixModal
        isOpen={isRemixModalOpen}
        onClose={closeRemixModal}
        onPackCreated={handleRemixCreated}
      />
    </div>
  );
};
