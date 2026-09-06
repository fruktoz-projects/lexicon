import React, { useEffect, useState } from 'react';
import { Trash2, Edit, Calendar, BookOpen, Activity, Target } from 'lucide-react';
import { api } from '../services/api';
import { LearningPackSummary } from '@lexicon/types';
import { CefrBadge } from '../common/CefrBadge';

export const AdminDashboardPage: React.FC = () => {
  const [packs, setPacks] = useState<LearningPackSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPacks = async () => {
    try {
      setIsLoading(true);
      const data = await api.admin.getPacks();
      // Data shape based on `listPacks` from service: { total: number, packs: [] }
      setPacks(data.packs || []);
    } catch (err) {
      console.error('Failed to load packs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPacks();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a tananyagot?')) return;
    try {
      await api.admin.deletePack(id);
      await loadPacks();
    } catch (err) {
      alert('Hiba történt a törlés során.');
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-surface-subtle border border-border/40 rounded-3xl shadow-sm min-h-[60vh]">
      <h1 className="text-2xl font-monument font-bold text-ink mb-6">Adminisztrációs Pult</h1>
      <p className="text-muted mb-6">Kezeld a rendszerben lévő összes tananyagot.</p>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-pulse flex items-center gap-2 text-muted font-semibold">
            <Activity className="animate-spin" size={18} />
            Betöltés...
          </div>
        </div>
      ) : packs.length === 0 ? (
        <div className="py-16 text-center text-muted bg-surface/50 border border-border/40 rounded-3xl border-dashed">
          <div className="inline-flex p-4 rounded-full bg-surface-subtle border border-border/40 mb-4">
            <BookOpen size={24} className="text-muted/60" />
          </div>
          <h3 className="font-bold text-ink mb-1">Nincs még tananyag</h3>
          <p className="text-sm">Jelenleg nincs egyetlen tananyag sem a rendszerben.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="group relative flex flex-col bg-surface border border-border/40 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-200 overflow-hidden"
            >
              {/* Subtle gradient hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Card Header (Badges & Actions) */}
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <CefrBadge level={pack.cefr} size="sm" />
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-surface-subtle text-muted rounded-lg border border-border/40 truncate max-w-[100px]">
                    {pack.topic.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => alert('Szerkesztés még nincs implementálva, de az API támogatja!')}
                    className="p-1.5 text-muted hover:text-ink hover:bg-surface-subtle border border-transparent hover:border-border/40 rounded-lg transition-colors"
                    title="Szerkesztés"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(pack.id)}
                    className="p-1.5 text-muted hover:text-status-error hover:bg-status-errorBg border border-transparent hover:border-status-errorBorder rounded-lg transition-colors"
                    title="Törlés"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Card Body (Title & Focus) */}
              <h3 className="text-base sm:text-lg font-bold text-ink mb-1 line-clamp-2 relative z-10 group-hover:text-accent transition-colors">
                {pack.title}
              </h3>
              <p className="text-xs text-muted mb-4 line-clamp-1 relative z-10" title={pack.focus}>
                {pack.focus}
              </p>

              {/* Card Footer (Stats & Date) */}
              <div className="mt-auto pt-4 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-3 text-[11px] text-muted font-semibold">
                  <div className="flex items-center gap-1" title="Szavak száma">
                    <BookOpen size={12} className="text-muted/70" /> {pack.vocabularyCount || 0}
                  </div>
                  <div className="flex items-center gap-1" title="Kifejezések száma">
                    <Activity size={12} className="text-muted/70" /> {pack.chunksCount || 0}
                  </div>
                  <div className="flex items-center gap-1" title="Feladatok száma">
                    <Target size={12} className="text-muted/70" /> {pack.exercisesCount || 0}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted font-mono">
                  <Calendar size={12} className="text-muted/60" />
                  {new Date(pack.createdAt).toLocaleDateString('hu-HU')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
