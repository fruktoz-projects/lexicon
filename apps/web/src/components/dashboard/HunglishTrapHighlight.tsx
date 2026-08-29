import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AudioButton } from '../common/AudioButton';

export const HunglishTrapHighlight: React.FC = () => {
  return (
    <div className="bg-papyrus-card rounded-2xl p-5 sm:p-6 shadow-card relative overflow-hidden">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-xl bg-status-warningBg text-amber-900 border border-status-warningBorder shrink-0 shadow-subtle">
            <AlertTriangle size={18} />
          </div>
          <span className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-papyrus-ink truncate">
            Napi Hunglish csapda
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-status-warningBg text-amber-950 border border-status-warningBorder shrink-0 shadow-subtle">
          Prepozíció
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {/* Error Side */}
        <div className="bg-status-errorBg border border-status-errorBorder rounded-xl p-3.5 shadow-subtle">
          <div className="text-xs font-bold text-status-error mb-1 font-sans">
            ❌ Hibás tükörfordítás:
          </div>
          <div className="font-mono text-sm sm:text-base text-red-950 font-bold line-through">
            "running from Docker"
          </div>
          <p className="text-[11px] text-red-900 mt-1 font-sans font-medium">
            A magyar „Dockerből fut" tükörfordításának kényszere.
          </p>
        </div>

        {/* Correct Side */}
        <div className="bg-status-successBg border border-status-successBorder rounded-xl p-3.5 shadow-subtle">
          <div className="flex items-center justify-between gap-1 text-xs font-bold text-status-success mb-1 font-sans">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={14} className="text-emerald-700 shrink-0" /> Helyes angol:
            </span>
            <AudioButton text="running in Docker" size="sm" />
          </div>
          <div className="font-mono text-sm sm:text-base text-emerald-950 font-bold">
            "running in / on Docker"
          </div>
          <p className="text-[11px] text-emerald-900 mt-1 font-sans font-medium">
            Angolban a konténeres futtatást belső környezetként („in") kezeljük.
          </p>
        </div>
      </div>

      <p className="text-xs text-papyrus-muted italic leading-relaxed font-sans font-medium">
        <strong className="not-italic font-sans font-bold text-papyrus-ink">Tanács:</strong> Mindig rögzítsd a szoftverkörnyezeti prepozíciókat: <em>"running in production"</em>, <em>"deployed on Kubernetes"</em>.
      </p>
    </div>
  );
};
