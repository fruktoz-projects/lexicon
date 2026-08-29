import React from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { CefrLevel } from '@lexicon/types';
import { useAuthStore } from '../../store/authStore';

export const WaypointTimeline: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  const waypoints = [
    { level: CefrLevel.A2, title: 'Alapozó szint', status: 'completed', desc: 'Alapvető mondatszerkezetek és nyelvtani alapkövek' },
    { level: CefrLevel.B1, title: 'Középhaladó szint', status: 'active', desc: 'Mindennapi kommunikáció & alapvető Hunglish hibák kiküszöbölése' },
    { level: CefrLevel.B2, title: 'Haladó szint', status: 'target', desc: 'Szakmai & IT kifejezéscsomagok, tárgyalástechnika' },
    { level: CefrLevel.C1, title: 'Felsőfokú szint', status: 'locked', desc: 'Árnyalt retorika, akadémiai szintézis és esszéírás' },
  ];

  return (
    <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-2xl font-monument font-bold text-[#1C150D]">
            CEFR Tanulási Út
          </h2>
          <p className="text-xs sm:text-sm font-scribe text-[#7A6B55] mt-0.5 sm:mt-1 font-semibold">
            Magyar anyanyelvűeknek szabott tanulási ív
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-[#EAD9B8] px-3.5 py-1.5 rounded-xl border border-[#C5A566] self-start sm:self-auto shadow-sm">
          <span className="text-[#7A6B55] font-sans font-bold">Jelenlegi:</span>
          <strong className="text-[#1C150D] font-bold font-monument">{user?.currentCefr || 'B1'}</strong>
          <ArrowRight size={13} className="text-[#8B5E3C]" />
          <span className="text-[#7A6B55] font-sans font-bold">Cél:</span>
          <strong className="text-[#8B5E3C] font-bold font-monument">{user?.targetCefr || 'B2'}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {waypoints.map((wp) => {
          const isCompleted = wp.status === 'completed';
          const isActive = wp.status === 'active';
          const isTarget = wp.status === 'target';

          return (
            <div
              key={wp.level}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? 'bg-[#FAF0CD] border-[#D4A843] shadow-md ring-2 ring-[#D4A843]/30'
                  : isCompleted
                  ? 'bg-[#E0F0E8] border-[#6BB38A] shadow-sm'
                  : isTarget
                  ? 'bg-[#F5E6D3] border-[#C5A566] shadow-sm'
                  : 'bg-[#EAD9B8] border-[#C5A566] opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span
                    className={`text-[11px] font-monument font-bold px-2.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#8B5E3C] text-white shadow-sm'
                        : isCompleted
                        ? 'bg-[#2E7D5B] text-white shadow-sm'
                        : isTarget
                        ? 'bg-[#8B5E3C] text-white shadow-sm'
                        : 'bg-stone-300 text-stone-700'
                    }`}
                  >
                    {wp.level}
                  </span>

                  {isCompleted ? (
                    <CheckCircle2 size={18} className="text-[#2E7D5B]" />
                  ) : isActive ? (
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A843] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#8B5E3C]"></span>
                    </span>
                  ) : (
                    <Circle size={15} className="text-[#9A8B73]/40" />
                  )}
                </div>

                <h4 className="font-monument font-bold text-sm sm:text-base text-[#1C150D] mb-1">
                  {wp.title}
                </h4>
                <p className="text-xs font-sans text-[#7A6B55] leading-relaxed">
                  {wp.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
