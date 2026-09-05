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
      <div className="h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-surface-subtle/60 border-2 border-dashed border-border rounded-2xl">
        <FileText size={36} className="text-muted mb-3" />
        <h4 className="font-monument font-bold text-sm sm:text-base text-ink">
          AI Értékelő Panel
        </h4>
        <p className="text-xs text-muted max-w-xs mt-1 font-scribe font-semibold">
          Írd meg a szöveget a bal oldali felületen, majd kattints az „Értékelés Kérése” gombra a részletes magyar visszajelzésért.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Score Header */}
      <div className="p-4 bg-status-warningBg rounded-2xl border-2 border-status-warningBorder flex items-center justify-between shadow-sm">
        <div>
          <span className="text-[11px] font-monument uppercase tracking-wider text-muted block font-bold">
            Összpontszám:
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-monument font-bold text-accent">
              {feedback.score}
            </span>
            <span className="text-xs text-muted font-mono font-bold">/ 100 pont</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-monument uppercase tracking-wider text-muted block mb-1 font-bold">
            Javasolt szint:
          </span>
          <CefrBadge level={feedback.suggestedCefr} size="md" />
        </div>
      </div>

      {/* Overall Assessment in Hungarian */}
      <div className="p-4 sm:p-5 bg-surface-subtle rounded-2xl border border-border text-xs sm:text-sm leading-relaxed text-ink font-sans shadow-inner">
        <strong className="block font-monument font-bold text-sm text-ink mb-1">
          Részletes Értékelés:
        </strong>
        {feedback.overallAssessmentHu}
      </div>

      {/* Positives */}
      {feedback.positives && feedback.positives.length > 0 && (
        <div className="p-4 bg-status-successBg rounded-2xl border border-status-successBorder text-xs shadow-sm">
          <strong className="block font-monument font-bold text-ink mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-status-success" /> Pozitívumok & Erősségek:
          </strong>
          <ul className="space-y-1 font-sans">
            {feedback.positives.map((pos, i) => (
              <li key={i} className="flex items-start gap-1.5 text-ink font-medium">
                <span>•</span>
                <span>{pos}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Errors & Hungarian Margin Rules */}
      <div className="space-y-3">
        <h5 className="font-monument font-bold text-xs sm:text-sm text-ink flex items-center gap-1.5">
          <AlertTriangle size={15} className="text-accent" />
          <span>Javítási Javaslatok & Hunglish Elemzések ({feedback.errors?.length || 0})</span>
        </h5>

        {feedback.errors && feedback.errors.length > 0 ? (
          feedback.errors.map((err, idx) => (
            <div
              key={idx}
              className="p-4 bg-surface-subtle rounded-2xl border-2 border-border shadow-sm space-y-2 hover:border-accent transition-colors"
            >
              {/* Diff Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-lg bg-status-errorBg text-status-error line-through font-mono font-bold">
                  {err.original}
                </span>
                <span className="text-xs text-ink font-bold">→</span>
                <span className="text-xs px-3 py-0.5 rounded-lg bg-status-successBg text-status-success font-mono font-bold flex items-center gap-1">
                  <span>{err.replacement}</span>
                  <AudioButton text={err.replacement} size="sm" />
                </span>
              </div>

              {/* Hungarian Rule */}
              <div className="text-[11px] font-monument font-bold px-2.5 py-0.5 rounded-full bg-status-warningBg text-ink border border-status-warningBorder inline-block shadow-sm">
                Szabály: {err.ruleHu}
              </div>

              {/* Hungarian Explanation */}
              <p className="text-xs text-ink leading-relaxed bg-surface-subtle p-2.5 rounded-xl border border-border font-sans font-medium">
                {err.explanationHu}
              </p>
            </div>
          ))
        ) : (
          <div className="p-4 bg-status-successBg rounded-2xl border border-status-successBorder text-xs text-ink text-center font-medium shadow-sm">
            Nem találtunk kirívó nyelvtani vagy szókincsbeli hibát! Remek munka!
          </div>
        )}
      </div>
    </div>
  );
};
