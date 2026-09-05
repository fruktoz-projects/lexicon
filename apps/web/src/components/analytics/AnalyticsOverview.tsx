import React, { useState, useEffect } from 'react';
import { AnalyticsOverviewResponse, ZoneType, ZONE_DETAILS } from '@lexicon/types';
import { api } from '../../services/api';
import { MistakePatternAnalysis } from './MistakePatternAnalysis';
import { LexicalVault } from './LexicalVault';
import { CefrBadge } from '../common/CefrBadge';
import { useOfflineStore } from '../../store/offlineStore';
import {
  TrendingUp,
  Target,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  BarChart3,
  Brain,
  Zap,
} from 'lucide-react';

export const AnalyticsOverview: React.FC = () => {
  const [data, setData] = useState<AnalyticsOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const packs = useOfflineStore((s) => s.packs);
  const progress = useOfflineStore((s) => s.progress);
  const mistakeLogs = useOfflineStore((s) => s.mistakeLogs);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.analytics.getOverview();
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="p-8 text-center bg-surface rounded-2xl border-2 border-border text-muted font-sans shadow-card font-semibold">
        Analitikai adatok betöltése...
      </div>
    );
  }

  // Compute additional metrics
  const totalProgressItems = Object.keys(progress).length;
  const totalAllChunks = packs.reduce((sum, p) => sum + (p.chunks?.length || 0), 0);
  const totalMistakes = mistakeLogs.length;

  const masteredItems = Object.values(progress).filter((p) => p.srsStage >= 4).length;
  const learningItems = Object.values(progress).filter((p) => p.srsStage >= 1 && p.srsStage < 4).length;
  const newItems = Object.values(progress).filter((p) => p.srsStage === 0).length;

  const accuracyRate = totalProgressItems > 0
    ? Math.round(((totalProgressItems - totalMistakes) / Math.max(totalProgressItems, 1)) * 100)
    : 0;

  const srsStages = [
    { label: 'Új (még nem ismételt)', count: data.srsDistribution.stage0, color: 'bg-stone-300', textColor: 'text-stone-800' },
    { label: '1 napos ismétlés', count: data.srsDistribution.stage1, color: 'bg-status-warning', textColor: 'text-status-warning' },
    { label: '3 napos ismétlés', count: data.srsDistribution.stage2, color: 'bg-status-warning', textColor: 'text-status-warning' },
    { label: '7 napos rögzülés', count: data.srsDistribution.stage3, color: 'bg-status-success', textColor: 'text-status-success' },
    { label: '14 napos megerősítés', count: data.srsDistribution.stage4, color: 'bg-status-success', textColor: 'text-status-success' },
    { label: '30 nap — Elsajátított', count: data.srsDistribution.stage5, color: 'bg-accent', textColor: 'text-accent-text' },
  ];

  const totalSrsItems = Object.values(data.srsDistribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-5 sm:space-y-7">
      {/* Top Header Card */}
      <div className="bg-surface rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={22} className="text-accent" />
            <h2 className="text-lg sm:text-2xl font-monument font-bold text-ink">
              Haladás & Tudásszint Követés
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-sans text-muted mt-0.5 sm:mt-1 font-semibold">
            SRS memóriagörbe, zóna-haladás, szókincs és hibaminta statisztikák
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <CefrBadge level={data.user.targetCefr} size="md" showLabel />
        </div>
      </div>

      {/* Highlights Metrics Grid — 6 cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-surface rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={14} className="text-status-warning" />
            <span className="text-[11px] font-sans font-bold text-muted uppercase tracking-wider">Sorozat</span>
          </div>
          <div className="font-mono font-bold text-2xl text-ink">{data.user.streakDays}</div>
          <div className="text-[10px] text-muted font-sans mt-0.5">aktív nap</div>
        </div>

        <div className="bg-surface rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 size={14} className="text-status-success" />
            <span className="text-[11px] font-sans font-bold text-muted uppercase tracking-wider">Elsajátított</span>
          </div>
          <div className="font-mono font-bold text-2xl text-status-success">{masteredItems}</div>
          <div className="text-[10px] text-muted font-sans mt-0.5">szó & kifejezés</div>
        </div>

        <div className="bg-surface rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-1.5 mb-2">
            <Brain size={14} className="text-accent" />
            <span className="text-[11px] font-sans font-bold text-muted uppercase tracking-wider">Kollokációk</span>
          </div>
          <div className="font-mono font-bold text-2xl text-accent">{totalAllChunks}</div>
          <div className="text-[10px] text-muted font-sans mt-0.5">kifejezéscsomag</div>
        </div>

        <div className="bg-surface rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpen size={14} className="text-accent" />
            <span className="text-[11px] font-sans font-bold text-muted uppercase tracking-wider">Tananyagok</span>
          </div>
          <div className="font-mono font-bold text-2xl text-ink">{(data as any).totalPacks ?? data.totalPacksCompleted ?? packs.length}</div>
          <div className="text-[10px] text-muted font-sans mt-0.5">elérhető modul</div>
        </div>

        <div className="bg-surface rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-1.5 mb-2">
            <Target size={14} className="text-status-warning" />
            <span className="text-[11px] font-sans font-bold text-muted uppercase tracking-wider">Pontosság</span>
          </div>
          <div className="font-mono font-bold text-2xl text-status-warning">{accuracyRate}%</div>
          <div className="text-[10px] text-muted font-sans mt-0.5">gyakorlási arány</div>
        </div>

        <div className="bg-surface rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-1.5 mb-2">
            <Award size={14} className="text-status-error" />
            <span className="text-[11px] font-sans font-bold text-muted uppercase tracking-wider">Hibák</span>
          </div>
          <div className="font-mono font-bold text-2xl text-status-error">{totalMistakes}</div>
          <div className="text-[10px] text-muted font-sans mt-0.5">naplózott tévesztés</div>
        </div>
      </div>

      {/* Knowledge Level Overview: 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-status-successBg border border-status-successBorder rounded-2xl p-4 sm:p-5 shadow-subtle flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-status-successBg text-status-success border border-status-successBorder shrink-0 shadow-subtle">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-status-success">14+ napos rögzülés</span>
            <h4 className="text-2xl font-mono font-bold text-status-success mt-0.5">{masteredItems} db</h4>
            <p className="text-xs text-status-success/80 mt-1 font-sans font-medium">Hosszú távú memóriába rögzült szókincs és kollokáció</p>
          </div>
        </div>

        <div className="bg-surface-subtle border border-status-warningBorder rounded-2xl p-4 sm:p-5 shadow-subtle flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-status-warning text-ink shrink-0 shadow-subtle">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-status-warning">1–7 napos tanulás</span>
            <h4 className="text-2xl font-mono font-bold text-status-warning mt-0.5">{learningItems} db</h4>
            <p className="text-xs text-status-warning/80 mt-1 font-sans font-medium">Aktív ismétlési ciklusban lévő kifejezések</p>
          </div>
        </div>

        <div className="bg-surface-subtle border border-border rounded-2xl p-4 sm:p-5 shadow-subtle flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-stone-300 text-stone-700 shrink-0 shadow-subtle">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-muted">Új elemek</span>
            <h4 className="text-2xl font-mono font-bold text-ink mt-0.5">{newItems} db</h4>
            <p className="text-xs text-muted mt-1 font-sans font-medium">Gyakorlásra váró új kártyák a tananyagokból</p>
          </div>
        </div>
      </div>

      {/* 2-Column: SRS Distribution Curve & Zone Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-7">
        {/* SRS Interval Distribution */}
        <div className="bg-surface rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-card space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-monument font-bold text-ink flex items-center gap-2">
              <TrendingUp size={18} className="text-accent" />
              <span>Determinisztikus SRS Memóriagörbe</span>
            </h3>
            <p className="text-xs sm:text-sm font-sans text-muted mt-0.5 font-medium">
              A kártyák eloszlása a determinisztikus lépcsőkön (1 $\rightarrow$ 3 $\rightarrow$ 7 $\rightarrow$ 14 $\rightarrow$ 30 nap)
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {srsStages.map((stage, idx) => {
              const percentage = Math.round((stage.count / totalSrsItems) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="font-bold text-ink">{stage.label}</span>
                    <span className="font-mono font-bold text-muted">{stage.count} db ({percentage}%)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-surface-subtle overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                      style={{ width: `${Math.max(percentage, stage.count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone Mastery Progress */}
        <div className="bg-surface rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-card space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-monument font-bold text-ink flex items-center gap-2">
              <Target size={18} className="text-accent" />
              <span>Zóna-haladás és Szakterületi arányok</span>
            </h3>
            <p className="text-xs sm:text-sm font-sans text-muted mt-0.5 font-medium">
              Elsajátítási szint a 4 tartalmi zónában
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {(Array.isArray(data.zoneProgress)
              ? data.zoneProgress
              : Object.entries(data.zoneProgress || {}).map(([zone, val]: [string, any]) => ({
                  zone: zone as ZoneType,
                  masteryPercentage: val.percentage ?? Math.round(((val.mastered || 0) / Math.max(val.total || 1, 1)) * 100),
                  ...val,
                }))
            ).map((zp: any) => {
              const zoneDetail = ZONE_DETAILS[zp.zone as ZoneType];
              const zonePacks = packs.filter((p) => p.topic === zp.zone);
              const vocabInZone = zonePacks.reduce((s, p) => s + (p.vocabulary?.length || 0), 0);
              const chunksInZone = zonePacks.reduce((s, p) => s + (p.chunks?.length || 0), 0);
              const pct = zp.masteryPercentage ?? zp.percentage ?? 0;

              return (
                <div key={zp.zone} className="p-3.5 rounded-2xl bg-surface-subtle space-y-2 shadow-subtle">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-sans font-bold text-xs sm:text-sm text-ink">
                        {zoneDetail?.nameHu || zp.zone}
                      </h4>
                      <span className="text-[11px] font-mono text-muted block">
                        {vocabInZone} szó • {chunksInZone} kollokáció • {zonePacks.length} tananyag
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-sm text-accent">{pct}%</span>
                      <span className="text-[10px] text-muted block font-sans">teljesítve</span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-surface overflow-hidden border border-border">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mistake Pattern Analysis */}
      <MistakePatternAnalysis patterns={(data as any).commonMistakePatterns || (data as any).frequentMistakes || []} />

      {/* Full Lexical Vault Component */}
      <LexicalVault />
    </div>
  );
};
