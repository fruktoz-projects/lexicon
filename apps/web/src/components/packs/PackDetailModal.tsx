import React, { useState } from 'react';
import { LearningPackDetail } from '@lexicon/types';
import { Modal } from '../common/Modal';
import { CefrBadge } from '../common/CefrBadge';
import { LessonReader } from './LessonReader';
import { VocabCard } from './VocabCard';
import { ChunkCard } from './ChunkCard';
import { HunglishTrapCard } from './HunglishTrapCard';
import { ReadingModule } from './ReadingModule';
import { Button } from '../common/Button';
import {
  BookOpen,
  Layers,
  Link2,
  AlertTriangle,
  FileText,
  Play,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Compass,
} from 'lucide-react';
import { audio } from '../../services/audio';

interface PackDetailModalProps {
  pack: LearningPackDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onStartPractice: () => void;
}

type StationType = 'lesson' | 'vocab' | 'chunks' | 'traps' | 'reading';

interface StationConfig {
  id: StationType;
  stepNum: number;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

export const PackDetailModal: React.FC<PackDetailModalProps> = ({
  pack,
  isOpen,
  onClose,
  onStartPractice,
}) => {
  const [activeStation, setActiveStation] = useState<StationType>('lesson');
  const [visitedStations, setVisitedStations] = useState<Set<StationType>>(new Set(['lesson']));

  if (!pack) return null;

  const hasReading = Boolean(pack.readingMaterials && pack.readingMaterials.length > 0);

  const stations: StationConfig[] = [
    { id: 'lesson', stepNum: 1, label: 'Bevezető Lecke', icon: <BookOpen size={15} /> },
    { id: 'vocab', stepNum: 2, label: 'Kulcsszavak', icon: <Layers size={15} />, count: pack.vocabulary?.length || 0 },
    { id: 'chunks', stepNum: 3, label: 'Kollokációk', icon: <Link2 size={15} />, count: pack.chunks?.length || 0 },
    { id: 'traps', stepNum: 4, label: 'Hunglish Csapdák', icon: <AlertTriangle size={15} />, count: pack.contrastiveNotes?.length || 0 },
  ];

  if (hasReading) {
    stations.push({
      id: 'reading',
      stepNum: 5,
      label: 'Szövegértés',
      icon: <FileText size={15} />,
      count: pack.readingMaterials.length,
    });
  }

  const currentIdx = stations.findIndex((s) => s.id === activeStation);
  const currentStationConfig = stations[currentIdx] || stations[0];

  const handleSelectStation = (stationId: StationType) => {
    audio.playClickSound();
    setActiveStation(stationId);
    setVisitedStations((prev) => new Set([...prev, stationId]));
  };

  const handleNextStation = () => {
    if (currentIdx < stations.length - 1) {
      handleSelectStation(stations[currentIdx + 1].id);
    } else {
      audio.playSuccessSound();
      onClose();
      onStartPractice();
    }
  };

  const handlePrevStation = () => {
    if (currentIdx > 0) {
      handleSelectStation(stations[currentIdx - 1].id);
    }
  };

  const progressPercent = Math.round((visitedStations.size / stations.length) * 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={pack.title}
      subtitle={`${pack.topic} • Becsült idő: ${pack.estimatedMinutes} perc`}
      maxWidth="4xl"
    >
      <div className="space-y-5">
        {/* Header Metadata Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-surface-subtle rounded-2xl border border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <CefrBadge level={pack.cefr} size="md" showLabel />
            <span className="text-xs font-sans px-3 py-1 rounded-full bg-surface text-ink border border-border font-bold shadow-subtle">
              Fókusz: {pack.focus}
            </span>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              onClose();
              onStartPractice();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 font-sans font-bold"
          >
            <Play size={14} className="fill-ink text-ink" />
            <span>Gyakorlás Indítása</span>
          </Button>
        </div>

        {/* Expedition Station Stepper (Process Bar) */}
        <div className="bg-surface-subtle p-3.5 rounded-2xl border border-border-subtle space-y-2.5">
          <div className="flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-1.5 text-ink font-bold">
              <Compass size={16} className="text-accent" />
              <span>Tanulási Állomássáv ({visitedStations.size}/{stations.length} kész)</span>
            </div>
            <span className="font-mono text-accent font-bold">{progressPercent}%</span>
          </div>

          {/* Stepper Buttons Horizontal Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            {stations.map((st, idx) => {
              const isActive = activeStation === st.id;
              const isVisited = visitedStations.has(st.id);

              return (
                <button
                  key={st.id}
                  onClick={() => handleSelectStation(st.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all duration-150 flex items-center justify-between gap-1.5 shadow-subtle ${isActive
                      ? 'bg-accent text-accent-text border-transparent shadow-sm scale-[1.02]'
                      : isVisited
                        ? 'bg-surface-subtle border-status-warningBorder text-ink'
                        : 'bg-surface border-transparent text-muted hover:text-ink'
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${isActive
                          ? 'bg-surface-subtle text-ink'
                          : isVisited
                            ? 'bg-status-successBg text-status-success border border-status-successBorder'
                            : 'bg-surface-subtle text-muted'
                        }`}
                    >
                      {isVisited && !isActive ? <CheckCircle2 size={12} /> : idx + 1}
                    </span>
                    <span className="font-sans text-xs font-bold truncate">{st.label}</span>
                  </div>

                  {st.count !== undefined && st.count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${isActive ? 'bg-surface-subtle text-ink' : 'bg-surface-subtle text-ink'
                        }`}
                    >
                      {st.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Station Content Viewport */}
        <div className="min-h-[300px]">
          {activeStation === 'lesson' && pack.lessons?.length > 0 && (
            <LessonReader title={pack.lessons[0].title} contentMd={pack.lessons[0].contentMd} />
          )}

          {activeStation === 'vocab' && (
            <div className="space-y-3">
              <div className="text-xs font-sans font-bold text-muted flex items-center gap-1.5">
                <Layers size={14} className="text-accent" />
                <span>Kiemelt szókincs kiejtéssel és kollokációkkal:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {pack.vocabulary?.map((v) => (
                  <VocabCard key={v.id} item={v} />
                ))}
              </div>
            </div>
          )}

          {activeStation === 'chunks' && (
            <div className="space-y-3">
              <div className="text-xs font-sans font-bold text-muted flex items-center gap-1.5">
                <Link2 size={14} className="text-accent" />
                <span>Anyanyelvi kifejezéscsomagok és szövegkörnyezetek:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {pack.chunks?.map((c) => (
                  <ChunkCard key={c.id} chunk={c} />
                ))}
              </div>
            </div>
          )}

          {activeStation === 'traps' && (
            <div className="space-y-3">
              <div className="text-xs font-sans font-bold text-muted flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-accent" />
                <span>Magyar-angol tükörfordítási hibaminták és javítási szabályok:</span>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {pack.contrastiveNotes?.map((n) => (
                  <HunglishTrapCard key={n.id} note={n} />
                ))}
              </div>
            </div>
          )}

          {activeStation === 'reading' && (
            <div>
              {pack.readingMaterials?.length > 0 ? (
                <ReadingModule reading={pack.readingMaterials[0]} />
              ) : (
                <div className="p-8 text-center bg-surface-subtle rounded-2xl border border-border text-muted text-sm font-sans font-medium">
                  Ebben a tananyagban nincs különálló olvasmány feladvány.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stepper Navigation Footer Bar */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
          <Button
            size="md"
            variant="secondary"
            disabled={currentIdx === 0}
            onClick={handlePrevStation}
            className="flex items-center gap-1.5 font-sans"
          >
            <ChevronLeft size={16} />
            <span>Előző állomás</span>
          </Button>

          <span className="text-xs font-sans font-bold text-muted hidden sm:inline">
            {currentIdx + 1} / {stations.length}. állomás: {currentStationConfig.label}
          </span>

          <Button
            size="md"
            variant="primary"
            onClick={handleNextStation}
            className="flex items-center gap-1.5 font-sans"
          >
            <span>
              {currentIdx === stations.length - 1 ? 'Áttekintés kész • Gyakorlás' : 'Következő állomás'}
            </span>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </Modal>
  );
};
