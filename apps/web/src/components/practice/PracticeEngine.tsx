import React, { useEffect, useState, useCallback } from 'react';
import {
  ExerciseType,
  PracticeSessionItem,
} from '@lexicon/types';
import { usePracticeStore } from '../../store/practiceStore';
import { api } from '../../services/api';
import { ClozeExercise } from './ClozeExercise';
import { TranslationExercise } from './TranslationExercise';
import { MultipleChoiceExercise } from './MultipleChoiceExercise';
import { MatchingExercise } from './MatchingExercise';
import { SessionSummaryModal } from './SessionSummaryModal';
import { Button } from '../common/Button';
import { AudioButton } from '../common/AudioButton';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { audio } from '../../services/audio';

interface PracticeEngineProps {
  onFinish?: () => void;
}

export const PracticeEngine: React.FC<PracticeEngineProps> = ({ onFinish }) => {
  const {
    sessionId,
    items,
    currentIndex,
    currentAnswer,
    isSubmitting,
    lastResult,
    score,
    isCompleted,
    isHelpUsed,
    startSession,
    setAnswer,
    setSubmitting,
    setResult,
    setHelpUsed,
    nextItem,
    resetSession,
  } = usePracticeStore();

  const [isLoading, setIsLoading] = useState(false);

  const loadSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const sess = await api.practice.getSession(20);
      startSession(sess.sessionId, sess.items);
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setIsLoading(false);
    }
  }, [startSession]);

  useEffect(() => {
    if (!sessionId || items.length === 0) {
      loadSession();
    }
  }, [sessionId, items.length, loadSession]);

  const currentItem: PracticeSessionItem | undefined = items[currentIndex];

  // Submit Answer handler
  const handleSubmit = useCallback(async () => {
    if (!currentItem || isSubmitting || lastResult) return;
    if (!currentAnswer.trim() && currentItem.exerciseType !== ExerciseType.MATCHING) return;

    setSubmitting(true);
    try {
      const res = await api.practice.submit({
        itemId: currentItem.id,
        itemType: currentItem.sourceType,
        userAnswer: currentAnswer.trim(),
        helpUsed: isHelpUsed,
      });

      setResult(res);

      if (res.isCorrect) {
        audio.playSuccessSound();
      } else {
        audio.playMistakeSound();
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setSubmitting(false);
    }
  }, [currentItem, isSubmitting, lastResult, currentAnswer, setSubmitting, setResult]);

  // Next Item handler
  const handleNext = useCallback(() => {
    audio.playClickSound();
    nextItem();
  }, [nextItem]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === 'Enter') {
        if (lastResult) {
          e.preventDefault();
          handleNext();
        } else if (!isInput && currentAnswer) {
          e.preventDefault();
          handleSubmit();
        }
        return;
      }

      if (isInput) return;

      if (e.key === ' ' && currentItem) {
        e.preventDefault();
        const textToSpeak = lastResult ? lastResult.correctSolution : (currentItem.payload?.sentenceWithGap || currentItem.solution);
        audio.speakEnglish(textToSpeak);
        return;
      }

      if (!lastResult && currentItem) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const index = parseInt(e.key, 10) - 1;
          const options = currentItem.payload?.options;
          if (options && options[index]) {
            e.preventDefault();
            audio.playClickSound();
            setAnswer(options[index]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lastResult, currentAnswer, currentItem, handleNext, handleSubmit, setAnswer]);

  if (isLoading) {
    return (
      <div className="min-h-[380px] flex flex-col items-center justify-center p-6 text-center bg-surface rounded-3xl shadow-card">
        <Loader2 size={36} className="text-accent animate-spin mb-3" />
        <h3 className="font-monument font-bold text-base sm:text-lg text-ink">
          Gyakorló kártyák összeállítása...
        </h3>
        <p className="text-xs font-scribe text-muted mt-1 font-semibold">
          Rendezés az esedékességi idő és a hibaminták alapján
        </p>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="min-h-[380px] flex flex-col items-center justify-center p-6 text-center bg-surface rounded-3xl shadow-card space-y-4">
        <CheckCircle2 size={48} className="text-status-success" />
        <h3 className="font-monument font-bold text-lg sm:text-xl text-ink">
          Minden mai kártyát átismételtél!
        </h3>
        <p className="text-xs sm:text-sm font-scribe text-muted max-w-md font-semibold">
          A felejtési görbe szerint mára nincs több esedékes kártyád. Új tananyagokat a Tananyagok menüpontban nyithatsz meg.
        </p>
        <Button variant="primary" onClick={loadSession}>
          Új gyakorló kör indítása
        </Button>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex) / items.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
      {/* Session Header & Progress */}
      <div className="bg-surface rounded-2xl p-4 sm:p-5 shadow-card">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-monument font-bold px-2.5 py-0.5 rounded-full bg-accent text-accent-text shadow-sm">
              {currentIndex + 1} / {items.length}
            </span>
            <span className="text-xs font-mono text-muted hidden sm:inline font-bold">
              #{currentItem.id.slice(0, 8)}
            </span>
            {currentItem.isMistakeRetry && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-status-errorBg text-status-error border border-status-errorBorder">
                Hibajavítás
              </span>
            )}
          </div>

          {/* Quick Score */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
            <span className="text-status-success font-bold flex items-center gap-1">
              <CheckCircle2 size={15} /> {score.correct}
            </span>
            <span className="text-status-error font-bold flex items-center gap-1">
              <XCircle size={15} /> {score.incorrect}
            </span>
            <span className="text-ink font-bold bg-status-warningBg px-2.5 py-0.5 rounded-lg border border-status-warningBorder shadow-sm">
              +{score.xpEarned} XP
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-surface-subtle rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Practice Card */}
      <div className="bg-surface rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-card min-h-[360px] flex flex-col justify-between">
        {/* Dynamic Exercise Renderer */}
        <div className="flex-1">
          {currentItem.exerciseType === ExerciseType.CLOZE && (
            <ClozeExercise
              prompt={currentItem.prompt}
              payload={currentItem.payload}
              selectedAnswer={currentAnswer}
              onSelect={setAnswer}
              disabled={Boolean(lastResult)}
            />
          )}

          {currentItem.exerciseType === ExerciseType.TRANSLATION_HU_TO_EN && (
            <TranslationExercise
              prompt={currentItem.prompt}
              payload={currentItem.payload}
              userAnswer={currentAnswer}
              onChange={setAnswer}
              onSubmit={handleSubmit}
              disabled={Boolean(lastResult)}
            />
          )}

          {currentItem.exerciseType === ExerciseType.TRANSLATION_EN_TO_HU && (
            <TranslationExercise
              prompt={currentItem.prompt}
              payload={currentItem.payload}
              userAnswer={currentAnswer}
              onChange={setAnswer}
              onSubmit={handleSubmit}
              disabled={Boolean(lastResult)}
            />
          )}

          {currentItem.exerciseType === ExerciseType.MULTIPLE_CHOICE && (
            <MultipleChoiceExercise
              prompt={currentItem.prompt}
              payload={currentItem.payload}
              selectedAnswer={currentAnswer}
              onSelect={setAnswer}
              disabled={Boolean(lastResult)}
            />
          )}

          {currentItem.exerciseType === ExerciseType.MATCHING && (
            <MatchingExercise
              prompt={currentItem.prompt}
              payload={currentItem.payload}
              onComplete={(resultStr) => {
                setAnswer(resultStr);
                setTimeout(() => {
                  handleSubmit();
                }, 300);
              }}
              disabled={Boolean(lastResult)}
            />
          )}
        </div>

        {/* Display Help Hint */}
        {isHelpUsed && !lastResult && (
          <div className="mt-4 p-3 bg-status-warningBg border border-status-warningBorder rounded-xl text-sm font-sans flex gap-2 animate-fade-in text-ink">
            <HelpCircle size={18} className="text-status-warning shrink-0 mt-0.5" />
            <div>
              <strong>Tipp:</strong> {currentItem.payload?.hints?.join(', ') || currentItem.explanationHu || `A megoldás valahogy így kezdődik: "${currentItem.solution.substring(0, Math.max(3, Math.floor(currentItem.solution.length / 2)))}..."`}
            </div>
          </div>
        )}

        {/* Bottom Feedback Banner & Actions */}
        <div className="mt-6 sm:mt-8 pt-4 border-t-2 border-border">
          {!lastResult ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="hidden sm:flex items-center gap-3 text-xs text-muted font-mono">
                <span className="flex items-center gap-1">
                  <span className="keyboard-badge">1-4</span> Válassz
                </span>
                <span className="flex items-center gap-1">
                  <span className="keyboard-badge">Enter</span> Küldés
                </span>
                <span className="flex items-center gap-1">
                  <span className="keyboard-badge">Space</span> Kiejtés
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto ml-auto">
                <Button
                  variant="secondary"
                  size="md"
                  disabled={isSubmitting || isHelpUsed || (!currentAnswer.trim() && currentItem.exerciseType === ExerciseType.MATCHING)}
                  onClick={() => setHelpUsed(true)}
                  className="px-4 font-monument"
                >
                  Segítség
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  disabled={isSubmitting || (!currentAnswer.trim() && currentItem.exerciseType !== ExerciseType.MATCHING)}
                  onClick={handleSubmit}
                  className="w-full sm:w-auto px-8 font-monument"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Válasz Ellenőrzése'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in ${lastResult.isCorrect
                  ? 'bg-status-successBg border-status-successBorder text-ink shadow-sm'
                  : 'bg-status-errorBg border-status-errorBorder text-status-error shadow-sm'
                }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-monument font-bold text-sm sm:text-base">
                  {lastResult.isCorrect ? (
                    <>
                      <CheckCircle2 size={20} className="text-status-success shrink-0" />
                      <span>
                        Helyes válasz! {lastResult.helpUsed ? 'Mivel segítséget használtál, a kártya visszakerült a gyakorolandók közé.' : 'SRS intervallum megnövelve.'}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle size={20} className="text-status-error" />
                      <span>Nem pontos. A kártya bekerült a hibajavító sorba.</span>
                    </>
                  )}
                </div>

                {!lastResult.isCorrect && (
                  <div className="text-xs font-mono mt-1 text-ink font-medium">
                    Helyes megoldás: <strong className="font-bold text-accent">{lastResult.correctSolution}</strong>
                  </div>
                )}

                {lastResult.explanationHu && (
                  <p className="text-xs text-ink font-sans mt-1 leading-relaxed bg-surface-subtle p-2.5 rounded-xl border border-border shadow-sm">
                    💡 <strong>Magyarázat:</strong> {lastResult.explanationHu}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <AudioButton text={lastResult.correctSolution} size="md" label="Kiejtés" />
                <Button
                  variant={lastResult.isCorrect ? 'nile' : 'primary'}
                  onClick={handleNext}
                  className="flex items-center gap-1.5 font-monument"
                >
                  <span>Következő</span>
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Completion Summary Modal */}
      <SessionSummaryModal
        isOpen={isCompleted}
        score={score}
        totalItems={items.length}
        onRestart={() => {
          resetSession();
          loadSession();
        }}
        onGoToDashboard={() => {
          resetSession();
          onFinish?.();
        }}
      />
    </div>
  );
};
