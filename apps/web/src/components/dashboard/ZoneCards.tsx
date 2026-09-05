import React from 'react';
import { ChevronRight, Anchor, Coins, Cpu, Landmark } from 'lucide-react';
import { ZONE_DETAILS, ZoneType } from '@lexicon/types';
import { useOfflineStore } from '../../store/offlineStore';
import { audio } from '../../services/audio';

interface ZoneCardsProps {
  onSelectZone: (zone: ZoneType) => void;
}

export const ZoneCards: React.FC<ZoneCardsProps> = ({ onSelectZone }) => {
  const packs = useOfflineStore((s) => s.packs);

  const getZoneMeta = (zone: ZoneType) => {
    switch (zone) {
      case ZoneType.EVERYDAY:
        return {
          title: 'Mindennapok',
          badge: '40%',
          icon: <Anchor size={22} className="text-zone-everyday" />,
          accentBg: 'bg-accent-subtle border-border',
        };
      case ZoneType.BUSINESS:
        return {
          title: 'Üzleti angol',
          badge: '25%',
          icon: <Coins size={22} className="text-zone-business" />,
          accentBg: 'bg-status-warningBg border-status-warningBorder',
        };
      case ZoneType.IT:
        return {
          title: 'IT & Technológia',
          badge: '20%',
          icon: <Cpu size={22} className="text-zone-it" />,
          accentBg: 'bg-indigo-50 border-indigo-200',
        };
      case ZoneType.ACADEMIC:
        return {
          title: 'Akadémiai angol',
          badge: '15%',
          icon: <Landmark size={22} className="text-zone-academic" />,
          accentBg: 'bg-status-successBg border-status-successBorder',
        };
    }
  };

  const zones = Object.values(ZoneType) as ZoneType[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-monument font-bold text-ink">
            4 Tartalmi Zóna
          </h3>
          <p className="text-xs sm:text-sm font-sans text-muted font-semibold">
            Funkcionális tanulási területek súlyozással
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map((z) => {
          const detail = ZONE_DETAILS[z];
          const meta = getZoneMeta(z);
          const zonePacks = packs.filter((p) => p.topic === z);

          return (
            <div
              key={z}
              onClick={() => {
                audio.playClickSound();
                onSelectZone(z);
              }}
              className="bg-surface rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-3.5">
                  <div className={`p-3 rounded-2xl border ${meta.accentBg} group-hover:scale-105 transition-transform shadow-subtle`}>
                    {meta.icon}
                  </div>
                  <span className="text-[11px] font-sans font-bold px-2.5 py-0.5 rounded-full bg-surface-subtle text-ink border border-border">
                    {meta.badge}
                  </span>
                </div>

                <h4 className="font-monument font-bold text-base text-ink group-hover:text-accent transition-colors mb-0.5">
                  {meta.title}
                </h4>
                <p className="text-xs font-mono text-muted font-bold mb-2">{detail.name}</p>
                <p className="text-xs text-muted line-clamp-2 leading-relaxed font-sans">
                  {detail.descriptionHu}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="font-mono text-muted font-bold">
                  {zonePacks.length} tananyag
                </span>
                <span className="flex items-center gap-1 text-accent font-sans font-bold group-hover:translate-x-1 transition-transform">
                  Megnyitás <ChevronRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
