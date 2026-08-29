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
    <div className="bg-papyrus-card rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-2xl font-monument font-bold text-papyrus-ink">
            CEFR Tanulási Út
          </h2>
          <p className="text-xs sm:text-sm font-sans text-papyrus-muted mt-0.5 sm:mt-1 font-semibold">
            Magyar anyanyelvűeknek szabott haladási ív
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-papyrus-subtle px-3.5 py-1.5 rounded-xl self-start sm:self-auto shadow-subtle">
          <span className="text-papyrus-muted font-sans font-bold">Jelenlegi:</span>
          <strong className="text-papyrus-ink font-bold font-sans">{user?.currentCefr || 'B1'}</strong>
          <ArrowRight size={13} className="text-brand" />
          <span className="text-papyrus-muted font-sans font-bold">Cél:</span>
          <strong className="text-brand font-bold font-sans">{user?.targetCefr || 'B2'}</strong>
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
              className={`p-4 sm:p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between ${isActive
                  ? 'bg-papyrus-warm shadow-card ring-2 ring-status-warningBorder/30'
                  : isCompleted
                    ? 'bg-status-successBg shadow-subtle'
                    : isTarget
                      ? 'bg-brand-subtle shadow-subtle'
                      : 'bg-papyrus-subtle opacity-60'
                }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span
                    className={`text-[11px] font-sans font-bold px-2.5 py-0.5 rounded-full ${isActive
                        ? 'bg-[#E5C175] text-papyrus-ink shadow-subtle'
                        : isCompleted
                          ? 'bg-status-successBg text-status-success shadow-subtle border border-status-successBorder'
                          : isTarget
                            ? 'bg-[#E5C175] text-papyrus-ink shadow-subtle'
                            : 'bg-stone-300 text-stone-800'
                      }`}
                  >
                    {wp.level}
                  </span>

                  {isCompleted ? (
                    <CheckCircle2 size={18} className="text-status-success" />
                  ) : isActive ? (
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-warning opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-brand"></span>
                    </span>
                  ) : (
                    <Circle size={15} className="text-papyrus-muted/40" />
                  )}
                </div>

                <h4 className="font-monument font-bold text-sm sm:text-base text-papyrus-ink mb-1">
                  {wp.title}
                </h4>
                <p className="text-xs font-sans text-papyrus-muted leading-relaxed font-medium">
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
