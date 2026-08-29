import React, { useState, useEffect } from 'react';
import { WritingSubmissionModel, CefrLevel } from '@lexicon/types';
import { DualPaneEditor } from './DualPaneEditor';
import { api } from '../../services/api';
import { CefrBadge } from '../common/CefrBadge';
import { PenTool, History } from 'lucide-react';
import { audio } from '../../services/audio';

export const WritingLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');
  const [history, setHistory] = useState<WritingSubmissionModel[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string>(
    'Írj egy 5-8 mondatos összefoglalót angolul arról, hogy miért elengedhetetlen a konténer-vezénylés (orchestration) és a folyamatok egyszerűsítése éles környezetben.'
  );

  const samplePrompts = [
    {
      title: 'IT Konténerizáció & DevOps',
      cefr: CefrLevel.B2,
      prompt: 'Írj egy 5-8 mondatos összefoglalót angolul arról, hogy miért elengedhetetlen a konténer-vezénylés (orchestration) és a folyamatok egyszerűsítése éles környezetben.',
    },
    {
      title: 'Tárgyalástechnika & Megállapodás',
      cefr: CefrLevel.B2,
      prompt: 'Write a 6-8 sentence formal follow-up email confirming mutual concessions, highlighting bottom line targets, and proposing next steps.',
    },
    {
      title: 'Akadémiai Érvelés & Technológiai Kritika',
      cefr: CefrLevel.C1,
      prompt: 'Provide a nuanced academic critique on the societal implications of generative AI, utilizing hedging devices and empirical references.',
    },
  ];

  const fetchHistory = async () => {
    try {
      const res = await api.writing.getHistory();
      setHistory(res);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <PenTool size={22} className="text-brand" />
            <h2 className="text-lg sm:text-2xl font-monument font-bold text-[#1C150D]">
              Írásműhely (Writing Lab)
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-scribe text-[#7A6B55] mt-0.5 sm:mt-1 font-semibold">
            Kétpaneles fogalmazó asztal magyar nyelvű margóelemzésekkel és Hunglish szabálymagyarázatokkal
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-papyrus-subtle p-1 rounded-2xl self-start sm:self-auto shadow-sm">
          <button
            onClick={() => {
              audio.playClickSound();
              setActiveTab('editor');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-monument font-bold transition-all ${activeTab === 'editor'
                ? 'bg-[#E5C175] text-[#1C150D] shadow-sm'
                : 'text-[#7A6B55] hover:text-[#1C150D]'
              }`}
          >
            <PenTool size={13} />
            <span>Fogalmazás</span>
          </button>

          <button
            onClick={() => {
              audio.playClickSound();
              setActiveTab('history');
              fetchHistory();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-monument font-bold transition-all ${activeTab === 'history'
                ? 'bg-[#E5C175] text-[#1C150D] shadow-sm'
                : 'text-[#7A6B55] hover:text-[#1C150D]'
              }`}
          >
            <History size={13} />
            <span>Korábbiak ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Editor Tab */}
      {activeTab === 'editor' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Prompt Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-monument font-bold text-[#7A6B55] whitespace-nowrap">Témák:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  audio.playClickSound();
                  setSelectedPrompt(p.prompt);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-2 font-monument font-bold ${selectedPrompt === p.prompt
                    ? 'bg-[#E5C175] text-[#1C150D] shadow-sm'
                    : 'bg-white text-[#1C150D] shadow-sm hover:bg-papyrus-subtle'
                  }`}
              >
                <span>{p.title}</span>
                <CefrBadge level={p.cefr} size="sm" />
              </button>
            ))}
          </div>

          <DualPaneEditor key={selectedPrompt} initialPrompt={selectedPrompt} onSavedSubmission={fetchHistory} />
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl text-[#7A6B55] font-scribe shadow-card font-semibold">
              Még nem küldtél be esszét értékelésre.
            </div>
          ) : (
            history.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-card space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono text-[#7A6B55] block mb-1 font-bold">
                      {new Date(sub.createdAt).toLocaleDateString('hu-HU')} • ID: #{sub.id.slice(0, 8)}
                    </span>
                    <h4 className="font-monument font-bold text-xs sm:text-sm text-[#1C150D]">
                      {sub.promptText}
                    </h4>
                  </div>
                  {sub.aiScore && (
                    <span className="text-xs font-monument font-bold px-3 py-1 rounded-full bg-[#FAF0CD] text-[#5C4A2F] border border-[#D4A843] shrink-0 shadow-sm">
                      {sub.aiScore} / 100 pont
                    </span>
                  )}
                </div>

                <div className="p-3 bg-[#EAD9B8] rounded-xl border border-[#C5A566] font-scribe text-xs sm:text-sm text-[#1C150D] italic">
                  "{sub.submittedText}"
                </div>

                {sub.aiFeedback && (
                  <div className="p-3 bg-[#FBF4E4] rounded-xl border border-[#C5A566] text-xs text-[#1C150D] font-sans">
                    <strong>AI Összefoglaló: </strong>
                    {sub.aiFeedback.overallAssessmentHu}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
