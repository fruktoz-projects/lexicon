import React from 'react';
import { PracticeEngine } from '../components/practice/PracticeEngine';
import { Target, ArrowLeft } from 'lucide-react';

interface PracticePageProps {
  onBackToDashboard: () => void;
}

export const PracticePage: React.FC<PracticePageProps> = ({ onBackToDashboard }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#7A6B55] hover:text-[#1C150D] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Vissza a Főoldalra</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-[#7A6B55] bg-[#EAD9B8] px-3 py-1 rounded-lg border border-[#C5A566]">
          <Target size={14} className="text-[#8B5E3C]" />
          <span>Determinisztikus SRS Memóriamotor</span>
        </div>
      </div>

      {/* Main Practice Engine Component */}
      <PracticeEngine onFinish={onBackToDashboard} />
    </div>
  );
};
