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
          colors: ['#8B5E3C', '#D4A843', '#2E7D5B', '#FAF0CD'],
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
        <div className="inline-flex p-4 rounded-3xl bg-[#FAF0CD] text-[#8B5E3C] border-2 border-[#D4A843] shadow-md">
          <Award size={40} className="text-[#8B5E3C]" />
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-monument font-bold text-[#1C150D]">
            Szép munka!
          </h3>
          <p className="text-xs sm:text-sm font-scribe text-[#7A6B55] mt-1 font-semibold">
            Az SRS memóriamotor frissítette az ismétlési intervallumokat.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="p-3 bg-[#EAD9B8] rounded-xl border border-[#C5A566] text-center shadow-sm">
            <span className="text-[11px] font-monument text-[#7A6B55] block mb-0.5 font-bold">Pontosság</span>
            <span className="font-mono font-bold text-lg text-[#1C150D]">{accuracy}%</span>
          </div>

          <div className="p-3 bg-[#E0F0E8] rounded-xl border border-[#6BB38A] text-center shadow-sm">
            <span className="text-[11px] font-monument text-[#1C4C34] block mb-0.5 font-bold">Helyes</span>
            <span className="font-mono font-bold text-lg text-[#2E7D5B]">{score.correct} db</span>
          </div>

          <div className="p-3 bg-[#FAF0CD] rounded-xl border border-[#D4A843] text-center shadow-sm">
            <span className="text-[11px] font-monument text-[#5C4A2F] block mb-0.5 font-bold">Szerzett XP</span>
            <span className="font-mono font-bold text-lg text-[#8B5E3C]">+{score.xpEarned}</span>
          </div>
        </div>

        {/* SRS Stepping Note */}
        <div className="p-3.5 bg-[#FBF4E4] rounded-xl border border-[#C5A566] text-left flex items-start gap-2.5 shadow-sm">
          <CheckCircle size={17} className="text-[#2E7D5B] mt-0.5 shrink-0" />
          <div className="text-xs text-[#7A6B55] leading-relaxed font-sans font-medium">
            <strong className="text-[#1C150D] block font-monument">Determinisztikus SRS Lépcső:</strong>
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
