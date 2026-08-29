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
      <div className="p-8 text-center bg-[#F5EBD4] rounded-2xl border-2 border-[#C5A566] text-[#7A6B55] font-scribe shadow-card font-semibold">
        Analitikai adatok betöltése...
      </div>
    );
  }

  // Compute additional metrics
  const totalProgressItems = Object.keys(progress).length;
  const totalAllVocab = packs.reduce((sum, p) => sum + (p.vocabulary?.length || 0), 0);
  const totalAllChunks = packs.reduce((sum, p) => sum + (p.chunks?.length || 0), 0);
  const totalAllExercises = packs.reduce((sum, p) => sum + (p.exercises?.length || 0), 0);
  const totalMistakes = mistakeLogs.length;

  const masteredItems = Object.values(progress).filter((p) => p.srsStage >= 4).length;
  const learningItems = Object.values(progress).filter((p) => p.srsStage >= 1 && p.srsStage < 4).length;
  const newItems = Object.values(progress).filter((p) => p.srsStage === 0).length;

  const accuracyRate = totalProgressItems > 0
    ? Math.round(((totalProgressItems - totalMistakes) / Math.max(totalProgressItems, 1)) * 100)
    : 0;

  const srsStages = [
    { label: 'Új (még nem ismételt)', count: data.srsDistribution.stage0, color: 'bg-[#D1C8B8]', textColor: 'text-[#5C4A2F]' },
    { label: '1 napos ismétlés', count: data.srsDistribution.stage1, color: 'bg-[#E8D5A3]', textColor: 'text-[#6B5A3A]' },
    { label: '3 napos ismétlés', count: data.srsDistribution.stage2, color: 'bg-[#D4A843]', textColor: 'text-[#5C4A2F]' },
    { label: '7 napos rögzülés', count: data.srsDistribution.stage3, color: 'bg-[#6BB38A]', textColor: 'text-[#1C4C34]' },
    { label: '14 napos megerősítés', count: data.srsDistribution.stage4, color: 'bg-[#2E7D5B]', textColor: 'text-white' },
    { label: '30 nap — Elsajátított', count: data.srsDistribution.stage5, color: 'bg-[#8B5E3C]', textColor: 'text-white' },
  ];

  const totalSrsItems = Object.values(data.srsDistribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-5 sm:space-y-7">
      {/* Top Header Card */}
      <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={22} className="text-[#8B5E3C]" />
            <h2 className="text-lg sm:text-2xl font-monument font-bold text-[#1C150D]">
              Haladás & Tudásszint Követés
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-scribe text-[#7A6B55] mt-0.5 sm:mt-1 font-semibold">
            SRS memóriagörbe, zóna-haladás, szókincs és hibaminta statisztikák
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <CefrBadge level={data.user.targetCefr} size="md" showLabel />
        </div>
      </div>

      {/* Highlights Metrics Grid — 6 cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={14} className="text-amber-600" />
            <span className="text-[11px] font-monument text-[#7A6B55] font-bold">Sorozat</span>
          </div>
          <span className="text-2xl font-monument font-bold text-[#1C150D]">{data.user.streakDays}</span>
          <span className="text-xs font-scribe text-[#7A6B55] ml-1 font-semibold">nap</span>
        </div>

        <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-1.5 mb-2">
            <Award size={14} className="text-[#2E7D5B]" />
            <span className="text-[11px] font-monument text-[#7A6B55] font-bold">Elsajátított szavak</span>
          </div>
          <span className="text-2xl font-monument font-bold text-[#2E7D5B]">{data.totalVocabMastered}</span>
          <span className="text-xs font-scribe text-[#7A6B55] ml-1 font-semibold">/ {totalAllVocab}</span>
        </div>

        <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-1.5 mb-2">
            <Brain size={14} className="text-[#8B5E3C]" />
            <span className="text-[11px] font-monument text-[#7A6B55] font-bold">Kollokációk</span>
          </div>
          <span className="text-2xl font-monument font-bold text-[#8B5E3C]">{data.totalChunksMastered}</span>
          <span className="text-xs font-scribe text-[#7A6B55] ml-1 font-semibold">/ {totalAllChunks}</span>
        </div>

        <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpen size={14} className="text-[#4A6F8B]" />
            <span className="text-[11px] font-monument text-[#7A6B55] font-bold">Tananyagok</span>
          </div>
          <span className="text-2xl font-monument font-bold text-[#1C150D]">{packs.length}</span>
          <span className="text-xs font-scribe text-[#7A6B55] ml-1 font-semibold">modul</span>
        </div>

        <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span className="text-[11px] font-monument text-[#7A6B55] font-bold">Pontosság</span>
          </div>
          <span className="text-2xl font-monument font-bold text-emerald-700">{accuracyRate}%</span>
          <span className="text-xs font-scribe text-[#7A6B55] ml-1 font-semibold">helyes</span>
        </div>

        <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={14} className="text-red-600" />
            <span className="text-[11px] font-monument text-[#7A6B55] font-bold">Hibák</span>
          </div>
          <span className="text-2xl font-monument font-bold text-red-700">{totalMistakes}</span>
          <span className="text-xs font-scribe text-[#7A6B55] ml-1 font-semibold">alkalommal</span>
        </div>
      </div>

      {/* SRS Overview Summary Card */}
      <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl p-5 sm:p-6 shadow-card">
        <h4 className="font-monument font-bold text-sm text-[#1C150D] mb-3 flex items-center gap-2">
          <Target size={16} className="text-[#8B5E3C]" />
          Tudásszint összefoglaló
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#E0F0E8] border border-[#6BB38A] rounded-xl p-3.5 text-center">
            <span className="text-xl font-monument font-bold text-[#2E7D5B]">{masteredItems}</span>
            <p className="text-[11px] font-monument text-[#2E7D5B] mt-1 font-bold">Elsajátított</p>
            <p className="text-[10px] text-[#3A7D56] font-scribe">14+ napos SRS szint</p>
          </div>
          <div className="bg-[#FAF0CD] border border-[#D4A843] rounded-xl p-3.5 text-center">
            <span className="text-xl font-monument font-bold text-[#8B6E2F]">{learningItems}</span>
            <p className="text-[11px] font-monument text-[#8B6E2F] mt-1 font-bold">Tanulás alatt</p>
            <p className="text-[10px] text-[#8B6E2F] font-scribe">1–7 napos ismétlés</p>
          </div>
          <div className="bg-[#EAD9B8] border border-[#C5A566] rounded-xl p-3.5 text-center">
            <span className="text-xl font-monument font-bold text-[#5C4A2F]">{newItems}</span>
            <p className="text-[11px] font-monument text-[#5C4A2F] mt-1 font-bold">Új elemek</p>
            <p className="text-[10px] text-[#7A6B55] font-scribe">Még nem ismételt</p>
          </div>
        </div>
      </div>

      {/* SRS Distribution & Zone Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* SRS Stage Bar */}
        <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-card space-y-3 sm:space-y-4">
          <div>
            <h4 className="font-monument font-bold text-sm sm:text-base text-[#1C150D] flex items-center gap-2">
              <TrendingUp size={18} className="text-[#2E7D5B]" />
              <span>SRS Ismétlési Szintek Eloszlása</span>
            </h4>
            <p className="text-xs font-scribe text-[#7A6B55] mt-0.5 font-semibold">
              1, 3, 7, 14 és 30 napos determinisztikus időközök
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {srsStages.map((stage) => {
              const pct = Math.round((stage.count / totalSrsItems) * 100);

              return (
                <div key={stage.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-monument text-[#1C150D] font-bold">{stage.label}</span>
                    <span className="font-mono text-[#7A6B55] font-bold">{stage.count} elem ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#EAD9B8] rounded-full overflow-hidden border border-[#C5A566]">
                    <div
                      className={`h-full ${stage.color} transition-all duration-300 rounded-full`}
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone Progress */}
        <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-card space-y-3 sm:space-y-4">
          <div>
            <h4 className="font-monument font-bold text-sm sm:text-base text-[#1C150D] flex items-center gap-2">
              <Target size={18} className="text-[#8B5E3C]" />
              <span>Zónánkénti haladás</span>
            </h4>
            <p className="text-xs font-scribe text-[#7A6B55] mt-0.5 font-semibold">
              Haladás a 4 funkcionális tanulási területen
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {(Object.keys(data.zoneProgress) as ZoneType[]).map((zone) => {
              const zp = data.zoneProgress[zone];
              const detail = ZONE_DETAILS[zone];
              const zonePacks = packs.filter((p) => p.topic === zone);
              const zoneVocab = zonePacks.reduce((s, p) => s + (p.vocabulary?.length || 0), 0);
              const zoneChunks = zonePacks.reduce((s, p) => s + (p.chunks?.length || 0), 0);

              return (
                <div key={zone} className="p-3.5 bg-[#FBF4E4] rounded-xl border border-[#C5A566] shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-monument font-bold text-[#1C150D]">{detail.nameHu}</span>
                    <span className="font-mono font-bold text-[#8B5E3C]">{zp.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#EAD9B8] rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-[#8B5E3C] transition-all duration-300 rounded-full"
                      style={{ width: `${zp.percentage}%` }}
                    />
                  </div>
                  <div className="text-[11px] font-mono text-[#7A6B55] flex justify-between font-semibold">
                    <span>{zonePacks.length} tananyag • {zoneVocab} szó • {zoneChunks} koll.</span>
                    <span>{zp.mastered} / {zp.total} elem</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Common Hunglish Mistake Patterns */}
      <MistakePatternAnalysis patterns={data.commonMistakePatterns} />

      {/* Searchable Lexical Vault */}
      <LexicalVault />
    </div>
  );
};
