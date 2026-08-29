import React from 'react';
import { WaypointTimeline } from '../components/dashboard/WaypointTimeline';
import { ZoneCards } from '../components/dashboard/ZoneCards';
import { StreakCounter } from '../components/dashboard/StreakCounter';
import { HunglishTrapHighlight } from '../components/dashboard/HunglishTrapHighlight';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../store/authStore';
import { ZoneType } from '@lexicon/types';
import { Play, ArrowRight } from 'lucide-react';

interface DashboardPageProps {
  onStartPractice: () => void;
  onSelectZone: (zone: ZoneType) => void;
  onOpenWriting: () => void;
  onOpenGenerator: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onStartPractice,
  onSelectZone,
  onOpenWriting,
  onOpenGenerator,
}) => {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl sm:rounded-3xl p-5 sm:p-9 shadow-card relative overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8B5E3C]" />

        <div className="max-w-3xl space-y-3.5 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAD9B8] border border-[#C5A566] text-[#5C4A2F] text-xs font-monument font-bold">
            <span>KONTRASZTÍV TANULÁS • MAGYAR → ANGOL</span>
          </div>

          <h1 className="text-xl sm:text-3xl lg:text-4xl font-monument font-black text-[#1C150D] tracking-tight leading-tight">
            Üdvözöljük a Lexicon Munkanaplóban!
          </h1>

          <p className="text-xs sm:text-base font-scribe text-[#5C4A2F] leading-relaxed font-semibold">
            A Lexicon felszámolja a magyar anyanyelvből fakadó hibamintákat (<em className="text-[#8B5E3C] font-bold">Hunglish csapdák</em>), elmélyíti a kifejezéscsomagokat (<em className="text-[#1C150D] font-bold">kollokációk</em>), és determinisztikus SRS memóriamotorral készít fel a magabiztos B2/C1 szintű angolra.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={onStartPractice}
              className="flex items-center justify-center gap-2 font-monument"
            >
              <Play size={17} className="fill-white" />
              <span>Napi SRS Gyakorlás Indítása</span>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={onOpenWriting}
              className="flex items-center justify-center gap-2 font-monument"
            >
              <span>Írásműhely (Esszé)</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* CEFR Waypoint Roadmap */}
      <WaypointTimeline />

      {/* 2-Column Section: Daily Trap & Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <HunglishTrapHighlight />
        <StreakCounter />
      </div>

      {/* Content Zones */}
      <ZoneCards onSelectZone={onSelectZone} />
    </div>
  );
};
