import React, { useState } from 'react';
import { CefrLevel, WritingFeedbackPayload } from '@lexicon/types';
import { Button } from '../common/Button';
import { FeedbackPanel } from './FeedbackPanel';
import { api } from '../../services/api';
import { Send, Loader2, RotateCcw } from 'lucide-react';
import { audio } from '../../services/audio';

interface DualPaneEditorProps {
  initialPrompt?: string;
  onSavedSubmission?: () => void;
}

export const DualPaneEditor: React.FC<DualPaneEditorProps> = ({
  initialPrompt = 'Írj egy 5-8 mondatos összefoglalót angolul arról, hogy miért elengedhetetlen a konténer-vezénylés (orchestration) és a folyamatok egyszerűsítése éles környezetben.',
  onSavedSubmission,
}) => {
  const [promptText, setPromptText] = useState(initialPrompt);
  const [submittedText, setSubmittedText] = useState(
    'In modern software systems, running application in Docker is very popular. According to me, container orchestration is essential because it helps to eliminate bottlenecks and streamline the deployment process. Furthermore, we must be responsible for doing continuous testing to mitigate risks.'
  );
  const [targetCefr, setTargetCefr] = useState<CefrLevel>(CefrLevel.B2);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<WritingFeedbackPayload | null>(null);

  const wordCount = submittedText.trim() ? submittedText.trim().split(/\s+/).length : 0;
  const charCount = submittedText.length;

  const handleEvaluate = async () => {
    if (!submittedText.trim() || isLoading) return;

    setIsLoading(true);
    audio.playClickSound();

    try {
      const res = await api.writing.evaluate({
        promptText,
        submittedText,
        targetCefr,
      });

      if (res.aiFeedback) {
        setFeedback(res.aiFeedback);
        audio.playSuccessSound();
      }
      onSavedSubmission?.();
    } catch (err) {
      console.error('Failed to evaluate writing:', err);
      audio.playMistakeSound();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    audio.playClickSound();
    setSubmittedText('');
    setFeedback(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Left Pane: Writing Workspace */}
      <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-card flex flex-col justify-between space-y-4">
        <div className="space-y-3.5 flex-1">
          {/* Prompt Section */}
          <div>
            <label className="block text-xs font-monument font-bold uppercase text-[#7A6B55] tracking-wider mb-1">
              Feladat & Téma (HU):
            </label>
            <textarea
              rows={2}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-[#C5A566] bg-[#EAD9B8] text-xs sm:text-sm text-[#1C150D] font-medium focus:ring-2 focus:ring-[#8B5E3C] focus:outline-none resize-none shadow-inner"
            />
          </div>

          {/* Level selector */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-monument font-bold text-[#7A6B55]">Cél Szint:</span>
            <select
              value={targetCefr}
              onChange={(e) => setTargetCefr(e.target.value as CefrLevel)}
              className="px-3 py-1 text-xs font-monument font-bold rounded-full border border-[#D4A843] bg-[#FAF0CD] text-[#5C4A2F] focus:outline-none shadow-sm"
            >
              <option value={CefrLevel.B1}>B1 — Középhaladó</option>
              <option value={CefrLevel.B2}>B2 — Haladó</option>
              <option value={CefrLevel.C1}>C1 — Felsőfokú</option>
            </select>
          </div>

          {/* English Composition Textarea */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-monument font-bold uppercase text-[#7A6B55] tracking-wider">
                Angol Szövegalkotás:
              </label>
              <span className="text-xs font-mono text-[#7A6B55] font-bold">
                {wordCount} szó • {charCount} betű
              </span>
            </div>
            <textarea
              rows={11}
              placeholder="Írd ide az angol szöveget... Használj kollokációkat és ügyelj a tipikus magyar fordítási csapdákra!"
              value={submittedText}
              onChange={(e) => setSubmittedText(e.target.value)}
              className="w-full flex-1 p-3.5 sm:p-4 rounded-2xl border-2 border-[#C5A566] bg-white text-sm sm:text-base font-scribe font-semibold text-[#1C150D] leading-relaxed focus:border-[#8B5E3C] focus:ring-0 focus:outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#C5A566]">
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={isLoading || !submittedText}>
            <RotateCcw size={14} className="mr-1" /> Törlés
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleEvaluate}
            disabled={isLoading || wordCount < 3}
            className="flex items-center gap-2 px-5 sm:px-7 font-monument"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>AI Elemzés folyamatban...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Értékelés Kérése (AI)</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Right Pane: AI Pedagogical Feedback */}
      <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-card overflow-y-auto max-h-[700px]">
        <FeedbackPanel feedback={feedback} submittedText={submittedText} />
      </div>
    </div>
  );
};
