import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AudioButton } from '../common/AudioButton';

export const HunglishTrapHighlight: React.FC = () => {
  return (
    <div className="bg-[#F5EBD4] border-2 border-amber-400 rounded-2xl p-5 sm:p-6 shadow-card relative overflow-hidden">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 shrink-0 shadow-sm">
            <AlertTriangle size={18} />
          </div>
          <span className="text-xs sm:text-sm font-monument font-bold uppercase tracking-wider text-[#1C150D] truncate">
            Napi Hunglish csapda
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 shrink-0 shadow-sm">
          Prepozíció
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {/* Error Side */}
        <div className="bg-red-50 border border-red-300 rounded-xl p-3.5 shadow-sm">
          <div className="text-xs font-bold text-red-900 mb-1 font-sans">
            ❌ Hibás tükörfordítás:
          </div>
          <div className="font-mono text-sm sm:text-base text-red-950 font-bold line-through">
            "running from Docker"
          </div>
          <p className="text-[11px] text-red-900 mt-1 font-sans">
            A magyar „Dockerből fut" tükörfordításának kényszere.
          </p>
        </div>

        {/* Correct Side */}
        <div className="bg-emerald-50 border border-emerald-400 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between gap-1 text-xs font-bold text-emerald-950 mb-1 font-sans">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={14} className="text-emerald-700 shrink-0" /> Helyes angol:
            </span>
            <AudioButton text="running in Docker" size="sm" />
          </div>
          <div className="font-mono text-sm sm:text-base text-emerald-950 font-bold">
            "running in / on Docker"
          </div>
          <p className="text-[11px] text-emerald-900 mt-1 font-sans">
            Angolban a konténeres futtatást belső környezetként („in") kezeljük.
          </p>
        </div>
      </div>

      <p className="text-xs text-[#7A6B55] font-scribe italic leading-relaxed font-semibold">
        <strong className="not-italic font-monument">Tanács:</strong> Mindig rögzítsd a szoftverkörnyezeti prepozíciókat: <em>"running in production"</em>, <em>"deployed on Kubernetes"</em>.
      </p>
    </div>
  );
};
