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
          className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Vissza a Főoldalra</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-muted bg-surface-subtle px-3 py-1 rounded-lg border border-border">
          <Target size={14} className="text-accent" />
          <span>Determinisztikus SRS Memóriamotor</span>
        </div>
      </div>

      {/* Main Practice Engine Component */}
      <PracticeEngine onFinish={onBackToDashboard} />
    </div>
  );
};
