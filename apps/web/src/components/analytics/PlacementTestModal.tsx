import React, { useState, useEffect } from 'react';
import { CefrLevel, PlacementTestModel, PlacementTestQuestion } from '@lexicon/types';
import { api } from '../../services/api';
import { Button } from '../common/Button';
import { audio } from '../../services/audio';
import { Loader2, X, AlertCircle, Brain, CheckCircle2 } from 'lucide-react';

interface PlacementTestModalProps {
  onClose: () => void;
  onComplete: (newCefr: CefrLevel) => void;
}

export const PlacementTestModal: React.FC<PlacementTestModalProps> = ({ onClose, onComplete }) => {
  const [step, setStep] = useState<'intro' | 'loading' | 'test' | 'evaluating' | 'result'>('intro');
  const [testModel, setTestModel] = useState<PlacementTestModel | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleStart = async () => {
    setStep('loading');
    setError(null);
    audio.playClickSound();

    try {
      const test = await api.placement.generate();
      setTestModel(test);
      setStep('test');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Nem sikerült legenerálni a szintfelmérőt.');
      setStep('intro');
      audio.playMistakeSound();
    }
  };

  const handleNextQuestion = () => {
    if (!testModel || !selectedOption) return;

    audio.playClickSound();
    const currentQ = testModel.questionsJson[currentQuestionIndex];
    setAnswers(prev => ({ ...prev, [currentQ.id]: selectedOption }));
    setSelectedOption(null);

    if (currentQuestionIndex < testModel.questionsJson.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Test finished
      submitTest({ ...answers, [currentQ.id]: selectedOption });
    }
  };

  const submitTest = async (finalAnswers: Record<string, string>) => {
    if (!testModel) return;
    setStep('evaluating');
    setError(null);

    try {
      const result = await api.placement.evaluate(testModel.id, finalAnswers);
      setTestModel(result);
      setStep('result');
      audio.playSuccessSound();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Nem sikerült kiértékelni a tesztet.');
      setStep('test');
      audio.playMistakeSound();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-canvas/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-surface rounded-3xl shadow-modal overflow-hidden flex flex-col max-h-[90vh] border border-border">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-subtle">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-accent" />
            <h3 className="font-monument font-bold text-ink text-sm sm:text-base">
              Szintfelmérő Teszt
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted hover:bg-surface hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-status-errorBg border border-status-errorBorder rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-status-error shrink-0 mt-0.5" />
              <p className="text-sm text-status-error font-sans font-semibold">{error}</p>
            </div>
          )}

          {step === 'intro' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mx-auto">
                <Brain size={32} />
              </div>
              <h2 className="text-xl sm:text-2xl font-monument font-bold text-ink">
                Milyen szinten vagy jelenleg?
              </h2>
              <p className="text-sm text-muted font-sans font-medium max-w-md mx-auto leading-relaxed">
                A mesterséges intelligencia generál egy 10 kérdésből álló egyedi tesztet (nyelvtan, szókincs, szövegértés), 
                ami alapján pontosan be tudjuk lőni az angol szintedet. Ez segít abban, hogy a megfelelő nehézségű tananyagokat kapd a jövőben.
              </p>
              
              <div className="pt-4">
                <Button onClick={handleStart} variant="primary" className="px-8 py-3 w-full sm:w-auto">
                  Teszt Generálása és Indítása
                </Button>
              </div>
            </div>
          )}

          {step === 'loading' && (
            <div className="text-center py-10 space-y-4">
              <Loader2 size={32} className="animate-spin text-accent mx-auto" />
              <p className="text-sm font-sans font-bold text-ink animate-pulse">
                Egyedi tesztkérdések generálása (AI)...
              </p>
              <p className="text-xs text-muted">Ez eltarthat néhány másodpercig.</p>
            </div>
          )}

          {step === 'test' && testModel && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-sans font-bold text-muted uppercase tracking-wider">
                  Kérdés {currentQuestionIndex + 1} / {testModel.questionsJson.length}
                </span>
                <div className="flex gap-1">
                  {testModel.questionsJson.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 w-4 rounded-full ${idx === currentQuestionIndex ? 'bg-accent' : idx < currentQuestionIndex ? 'bg-status-success' : 'bg-border'}`} 
                    />
                  ))}
                </div>
              </div>

              <div className="p-5 bg-surface-subtle rounded-2xl border border-border">
                <p className="text-base sm:text-lg font-sans font-bold text-ink">
                  {testModel.questionsJson[currentQuestionIndex].question}
                </p>
              </div>

              <div className="grid gap-3">
                {testModel.questionsJson[currentQuestionIndex].options.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        audio.playClickSound();
                        setSelectedOption(opt);
                      }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-sans font-semibold text-sm ${
                        isSelected 
                          ? 'border-accent bg-accent/5 text-ink' 
                          : 'border-border bg-surface text-muted hover:border-accent/40'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={handleNextQuestion} 
                  disabled={!selectedOption} 
                  variant="primary"
                >
                  {currentQuestionIndex < testModel.questionsJson.length - 1 ? 'Következő Kérdés' : 'Teszt Befejezése'}
                </Button>
              </div>
            </div>
          )}

          {step === 'evaluating' && (
            <div className="text-center py-10 space-y-4">
              <Loader2 size={32} className="animate-spin text-accent mx-auto" />
              <p className="text-sm font-sans font-bold text-ink animate-pulse">
                Válaszok kiértékelése...
              </p>
            </div>
          )}

          {step === 'result' && testModel && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-status-successBg border-2 border-status-successBorder flex items-center justify-center mx-auto shadow-md">
                <span className="text-3xl font-monument font-black text-status-success">
                  {testModel.evaluatedCefr}
                </span>
              </div>
              
              <div>
                <h2 className="text-xl sm:text-2xl font-monument font-bold text-ink mb-2">
                  Eredmény: {testModel.score}%
                </h2>
                <p className="text-sm text-muted font-sans font-medium max-w-md mx-auto leading-relaxed">
                  {testModel.aiFeedback}
                </p>
              </div>

              <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
                <p className="text-sm font-sans font-semibold text-ink">
                  A szinted sikeresen frissítve lett! Mostantól a generált tananyagok ehhez a szinthez fognak igazodni.
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={() => {
                    audio.playClickSound();
                    if (testModel.evaluatedCefr) {
                      onComplete(testModel.evaluatedCefr);
                    } else {
                      onClose();
                    }
                  }} 
                  variant="primary" 
                  className="px-8"
                >
                  Rendben, bezárás
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
