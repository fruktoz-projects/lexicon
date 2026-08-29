import React from 'react';
import { WritingFeedbackPayload } from '@lexicon/types';
import { CefrBadge } from '../common/CefrBadge';
import { AudioButton } from '../common/AudioButton';
import { CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface FeedbackPanelProps {
  feedback: WritingFeedbackPayload | null;
  submittedText: string;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedback }) => {
  if (!feedback) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-[#EAD9B8]/60 border-2 border-dashed border-[#C5A566] rounded-2xl">
        <FileText size={36} className="text-[#9A8B73] mb-3" />
        <h4 className="font-monument font-bold text-sm sm:text-base text-[#1C150D]">
          AI Értékelő Panel
        </h4>
        <p className="text-xs text-[#7A6B55] max-w-xs mt-1 font-scribe font-semibold">
          Írd meg a szöveget a bal oldali felületen, majd kattints az „Értékelés Kérése” gombra a részletes magyar visszajelzésért.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Score Header */}
      <div className="p-4 bg-[#FAF0CD] rounded-2xl border-2 border-[#D4A843] flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[11px] font-monument uppercase tracking-wider text-[#7A6B55] block font-bold">
            Összpontszám:
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-monument font-bold text-[#8B5E3C]">
              {feedback.score}
            </span>
            <span className="text-xs text-[#7A6B55] font-mono font-bold">/ 100 pont</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-monument uppercase tracking-wider text-[#7A6B55] block mb-1 font-bold">
            Javasolt szint:
          </span>
          <CefrBadge level={feedback.suggestedCefr} size="md" />
        </div>
      </div>

      {/* Overall Assessment in Hungarian */}
      <div className="p-4 sm:p-5 bg-[#EAD9B8] rounded-2xl border border-[#C5A566] text-xs sm:text-sm leading-relaxed text-[#1C150D] font-sans shadow-inner">
        <strong className="block font-monument font-bold text-sm text-[#1C150D] mb-1">
          Részletes Értékelés:
        </strong>
        {feedback.overallAssessmentHu}
      </div>

      {/* Positives */}
      {feedback.positives && feedback.positives.length > 0 && (
        <div className="p-4 bg-[#E0F0E8] rounded-2xl border border-[#6BB38A] text-xs shadow-sm">
          <strong className="block font-monument font-bold text-[#1C4C34] mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-[#2E7D5B]" /> Pozitívumok & Erősségek:
          </strong>
          <ul className="space-y-1 font-sans">
            {feedback.positives.map((pos, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[#1C4C34] font-medium">
                <span>•</span>
                <span>{pos}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Errors & Hungarian Margin Rules */}
      <div className="space-y-3">
        <h5 className="font-monument font-bold text-xs sm:text-sm text-[#1C150D] flex items-center gap-1.5">
          <AlertTriangle size={15} className="text-[#8B5E3C]" />
          <span>Javítási Javaslatok & Hunglish Elemzések ({feedback.errors?.length || 0})</span>
        </h5>

        {feedback.errors && feedback.errors.length > 0 ? (
          feedback.errors.map((err, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#FBF4E4] rounded-2xl border-2 border-[#C5A566] shadow-sm space-y-2 hover:border-[#8B5E3C] transition-colors"
            >
              {/* Diff Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-red-100 text-red-950 line-through font-mono font-bold">
                  {err.original}
                </span>
                <span className="text-xs text-[#1C150D] font-bold">→</span>
                <span className="text-xs px-3 py-0.5 rounded-lg bg-emerald-100 text-emerald-950 font-mono font-bold flex items-center gap-1">
                  <span>{err.replacement}</span>
                  <AudioButton text={err.replacement} size="sm" />
                </span>
              </div>

              {/* Hungarian Rule */}
              <div className="text-[11px] font-monument font-bold px-2.5 py-0.5 rounded-full bg-[#FAF0CD] text-[#5C4A2F] border border-[#D4A843] inline-block shadow-sm">
                Szabály: {err.ruleHu}
              </div>

              {/* Hungarian Explanation */}
              <p className="text-xs text-[#1C150D] leading-relaxed bg-[#EAD9B8] p-2.5 rounded-xl border border-[#C5A566] font-sans font-medium">
                {err.explanationHu}
              </p>
            </div>
          ))
        ) : (
          <div className="p-4 bg-[#E0F0E8] rounded-2xl border border-[#6BB38A] text-xs text-[#1C4C34] text-center font-medium shadow-sm">
            Nem találtunk kirívó nyelvtani vagy szókincsbeli hibát! Remek munka!
          </div>
        )}
      </div>
    </div>
  );
};
