import React, { useState } from 'react';
import { ReadingMaterialModel } from '@lexicon/types';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { audio } from '../../services/audio';

interface ReadingModuleProps {
  reading: ReadingMaterialModel;
}

export const ReadingModule: React.FC<ReadingModuleProps> = ({ reading }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelectOption = (qIndex: number, option: string) => {
    if (submitted) return;
    audio.playClickSound();
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    let allCorrect = true;
    reading.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] !== q.answer) {
        allCorrect = false;
      }
    });

    if (allCorrect) {
      audio.playSuccessSound();
    } else {
      audio.playMistakeSound();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Reading Text */}
      <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-card">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#C5A566]">
          <BookOpen size={18} className="text-[#8B5E3C]" />
          <h4 className="font-monument font-bold text-base sm:text-lg text-[#1C150D]">{reading.title}</h4>
        </div>
        <p className="font-scribe text-[#1C150D] text-sm sm:text-base leading-relaxed whitespace-pre-line font-semibold">
          {reading.bodyText}
        </p>
      </div>

      {/* Comprehension Questions */}
      <div className="bg-[#EAD9B8] border-2 border-[#C5A566] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-inner space-y-4">
        <h5 className="font-monument font-bold text-xs sm:text-sm text-[#1C150D] uppercase tracking-wider">
          Szövegértési Feladványok
        </h5>

        {reading.questions.map((q, qIndex) => {
          const userChoice = selectedAnswers[qIndex];
          const isCorrect = userChoice === q.answer;

          return (
            <div key={qIndex} className="p-3.5 sm:p-4 bg-[#F5EBD4] rounded-xl sm:rounded-2xl border border-[#C5A566] space-y-2.5 shadow-sm">
              <p className="text-xs sm:text-sm font-scribe font-bold text-[#1C150D]">
                {qIndex + 1}. {q.question}
              </p>

              <div className="space-y-2">
                {q.options.map((opt, optIndex) => {
                  const isSelected = userChoice === opt;
                  const isAnswer = q.answer === opt;

                  let optClass = 'border-[#C5A566] hover:bg-white text-[#1C150D] bg-[#FBF4E4]';
                  if (submitted) {
                    if (isAnswer) {
                      optClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optClass = 'border-red-500 bg-red-50 text-red-950 line-through';
                    } else {
                      optClass = 'border-[#C5A566] opacity-50';
                    }
                  } else if (isSelected) {
                    optClass = 'border-[#8B5E3C] bg-[#FAF0CD] text-[#5C4A2F] font-bold shadow-sm';
                  }

                  return (
                    <div
                      key={optIndex}
                      onClick={() => handleSelectOption(qIndex, opt)}
                      className={`p-3 rounded-xl border-2 text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-between font-scribe font-bold ${optClass}`}
                    >
                      <span>{opt}</span>
                      {submitted && isAnswer && <CheckCircle size={16} className="text-emerald-600 shrink-0" />}
                      {submitted && isSelected && !isCorrect && <XCircle size={16} className="text-red-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!submitted ? (
          <Button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length < reading.questions.length}
            className="w-full py-2.5 font-monument"
          >
            Válaszok Ellenőrzése
          </Button>
        ) : (
          <div className="p-3 bg-[#F5EBD4] rounded-xl text-center text-xs font-monument text-[#7A6B55] font-bold border border-[#C5A566]">
            Szövegértési feladvány lezárva.
          </div>
        )}
      </div>
    </div>
  );
};
