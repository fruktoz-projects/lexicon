import React from 'react';
import { Flame } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const StreakCounter: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const streak = user?.streakDays || 7;

  const days = [
    { name: 'Hét' },
    { name: 'Kedd' },
    { name: 'Sze' },
    { name: 'Csüt' },
    { name: 'Pén' },
    { name: 'Szo' },
    { name: 'Vas' },
  ];

  return (
    <div className="bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl p-5 sm:p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
            <Flame size={22} className="fill-amber-500" />
          </div>
          <div>
            <h4 className="font-monument font-bold text-sm sm:text-base text-[#1C150D]">
              Tanulási sorozat
            </h4>
            <p className="text-xs font-scribe text-[#7A6B55] font-semibold">Napi gyakorlási fegyelem</p>
          </div>
        </div>
        <div className="text-right">
          <span className="font-monument font-bold text-2xl text-[#1C150D]">{streak}</span>
          <span className="text-xs font-scribe text-[#7A6B55] ml-1 font-semibold">nap egyhuzamban</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
        {days.map((day, i) => {
          const isDone = i < (streak % 7 || 7);
          return (
            <div
              key={day.name}
              className={`py-2 px-1 rounded-xl border text-[11px] font-mono transition-all flex flex-col items-center justify-between shadow-sm ${
                isDone
                  ? 'bg-[#FAF0CD] border-[#D4A843] text-[#5C4A2F] font-bold'
                  : 'bg-[#EAD9B8] border-[#C5A566] text-[#9A8B73]'
              }`}
            >
              <span className="text-[10px] uppercase font-monument tracking-wider mb-0.5">{day.name}</span>
              <span className="text-xs mt-1">{isDone ? '🔥' : '○'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
