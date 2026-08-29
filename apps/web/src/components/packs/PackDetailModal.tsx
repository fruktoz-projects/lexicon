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
import { BookOpen, Layers, Link2, AlertTriangle, FileText, Play } from 'lucide-react';
import { audio } from '../../services/audio';

interface PackDetailModalProps {
  pack: LearningPackDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onStartPractice: () => void;
}

type TabType = 'lesson' | 'vocab' | 'chunks' | 'traps' | 'reading';

export const PackDetailModal: React.FC<PackDetailModalProps> = ({
  pack,
  isOpen,
  onClose,
  onStartPractice,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('lesson');

  if (!pack) return null;

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'lesson', label: 'Tananyag', icon: <BookOpen size={15} /> },
    { id: 'vocab', label: 'Szókincs', icon: <Layers size={15} />, count: pack.vocabulary?.length || 0 },
    { id: 'chunks', label: 'Kollokációk', icon: <Link2 size={15} />, count: pack.chunks?.length || 0 },
    { id: 'traps', label: 'Hunglish Csapdák', icon: <AlertTriangle size={15} />, count: pack.contrastiveNotes?.length || 0 },
    {
      id: 'reading',
      label: 'Olvasmány',
      icon: <FileText size={15} />,
      count: pack.readingMaterials?.length || 0,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={pack.title}
      subtitle={`${pack.topic} • Becsült idő: ${pack.estimatedMinutes} perc`}
      maxWidth="4xl"
    >
      <div className="space-y-4 sm:space-y-5">
        {/* Top Meta Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-[#EAD9B8] rounded-2xl border border-[#C5A566] shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <CefrBadge level={pack.cefr} size="md" showLabel />
            <span className="text-xs font-monument px-3 py-1 rounded-full bg-white text-[#1C150D] border border-[#C5A566] font-bold shadow-sm">
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
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 font-monument"
          >
            <Play size={14} className="fill-white" />
            <span>Gyakorlás Indítása</span>
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-[#C5A566] pb-2 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  audio.playClickSound();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-monument font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#8B5E3C] text-white shadow-sm border border-[#6B4226]'
                    : 'text-[#7A6B55] hover:text-[#1C150D] hover:bg-[#EAD9B8]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#FAF0CD] text-[#5C4A2F] border border-[#D4A843]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="min-h-[280px]">
          {activeTab === 'lesson' && pack.lessons?.length > 0 && (
            <LessonReader title={pack.lessons[0].title} contentMd={pack.lessons[0].contentMd} />
          )}

          {activeTab === 'vocab' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {pack.vocabulary?.map((v) => (
                <VocabCard key={v.id} item={v} />
              ))}
            </div>
          )}

          {activeTab === 'chunks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {pack.chunks?.map((c) => (
                <ChunkCard key={c.id} chunk={c} />
              ))}
            </div>
          )}

          {activeTab === 'traps' && (
            <div className="space-y-3 sm:space-y-4">
              {pack.contrastiveNotes?.map((n) => (
                <HunglishTrapCard key={n.id} note={n} />
              ))}
            </div>
          )}

          {activeTab === 'reading' && (
            <div>
              {pack.readingMaterials?.length > 0 ? (
                <ReadingModule reading={pack.readingMaterials[0]} />
              ) : (
                <div className="p-8 text-center bg-[#EAD9B8] rounded-2xl border border-[#C5A566] text-[#7A6B55] text-sm font-scribe font-semibold">
                  Ebben a tananyagban nincs különálló olvasmány feladvány.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
