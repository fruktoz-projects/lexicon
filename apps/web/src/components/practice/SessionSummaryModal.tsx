import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CheckCircle, ArrowRight, Award } from 'lucide-react';
import { audio } from '../../services/audio';

interface SessionSummaryModalProps {
  isOpen: boolean;
  score: {
    correct: number;
    incorrect: number;
    xpEarned: number;
  };
  totalItems: number;
  onRestart: () => void;
  onGoToDashboard: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  score,
  totalItems,
  onRestart,
  onGoToDashboard,
}) => {
  useEffect(() => {
    if (isOpen) {
      audio.playSuccessSound();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6D28D9', '#0F172A', '#10B981', '#FFFFFF'],
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalAnswered = score.correct + score.incorrect || totalItems || 1;
  const accuracy = Math.round((score.correct / totalAnswered) * 100);

  return (
    <Modal isOpen={isOpen} onClose={onGoToDashboard} title="Gyakorlat Befejezve!" maxWidth="md">
      <div className="text-center space-y-5 py-2">
        {/* Badge Icon */}
        <div className="inline-flex p-4 rounded-3xl bg-accent-subtle text-accent border-2 border-accent-soft shadow-md">
          <Award size={40} className="text-accent" />
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-monument font-bold text-ink">
            Szép munka!
          </h3>
          <p className="text-xs sm:text-sm font-scribe text-muted mt-1 font-semibold">
            Az SRS memóriamotor frissítette az ismétlési intervallumokat.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="p-3 bg-surface-subtle rounded-xl border border-border text-center shadow-sm">
            <span className="text-[11px] font-monument text-muted block mb-0.5 font-bold">Pontosság</span>
            <span className="font-mono font-bold text-lg text-ink">{accuracy}%</span>
          </div>

          <div className="p-3 bg-status-successBg rounded-xl border border-status-successBorder text-center shadow-sm">
            <span className="text-[11px] font-monument text-ink block mb-0.5 font-bold">Helyes</span>
            <span className="font-mono font-bold text-lg text-status-success">{score.correct} db</span>
          </div>

          <div className="p-3 bg-status-warningBg rounded-xl border border-status-warningBorder text-center shadow-sm">
            <span className="text-[11px] font-monument text-ink block mb-0.5 font-bold">Szerzett XP</span>
            <span className="font-mono font-bold text-lg text-accent">+{score.xpEarned}</span>
          </div>
        </div>

        {/* SRS Stepping Note */}
        <div className="p-3.5 bg-surface-subtle rounded-xl border border-border text-left flex items-start gap-2.5 shadow-sm">
          <CheckCircle size={17} className="text-status-success mt-0.5 shrink-0" />
          <div className="text-xs text-muted leading-relaxed font-sans font-medium">
            <strong className="text-ink block font-monument">Determinisztikus SRS Lépcső:</strong>
            A helyesen megoldott kártyák a következő állomásra léptek (1 → 3 → 7 → 14 → 30 napos ismétlés).
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Button variant="secondary" onClick={onRestart} className="flex-1">
            Új Gyakorló Kör
          </Button>
          <Button variant="primary" onClick={onGoToDashboard} className="flex-1 flex items-center justify-center gap-1.5 font-monument">
            <span>Vissza a Főoldalra</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    </Modal>
  );
};
