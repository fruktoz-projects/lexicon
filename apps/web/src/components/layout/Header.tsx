import React, { useState } from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  Target,
  PenTool,
  BarChart3,
  Layers,
  Plus,
  Home,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { CefrBadge } from '../common/CefrBadge';
import { audio } from '../../services/audio';

export type ActiveTab = 'dashboard' | 'zones' | 'practice' | 'writing' | 'analytics';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenGenerator: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, onOpenGenerator }) => {
  const { user, logout } = useAuthStore();
  const [soundOn, setSoundOn] = useState(audio.isSoundEnabled());

  const handleToggleSound = () => {
    const next = audio.toggleSound();
    setSoundOn(next);
  };

  const handleLogout = () => {
    audio.playClickSound();
    logout();
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Főoldal', icon: <Home size={17} /> },
    { id: 'zones', label: 'Tananyagok', icon: <Layers size={17} /> },
    { id: 'practice', label: 'SRS Gyakorlás', icon: <Target size={17} /> },
    { id: 'writing', label: 'Írásműhely', icon: <PenTool size={17} /> },
    { id: 'analytics', label: 'Haladás & Szókincs', icon: <BarChart3 size={17} /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F5EBD4] border-b-2 border-[#C5A566] shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group min-w-0"
            onClick={() => {
              audio.playClickSound();
              onSelectTab('dashboard');
            }}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#8B5E3C] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform border-2 border-[#6B4226] shrink-0">
              <span className="text-xl sm:text-2xl font-monument font-bold">L</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-monument font-black text-lg sm:text-xl tracking-wider text-[#1C150D] truncate">
                  LEXICON
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#EAD9B8] text-[#5C4A2F] border border-[#C5A566] shrink-0">
                  HU → EN
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-scribe text-[#7A6B55] truncate font-semibold">
                Kontrasztív Magyar–Angol Tanulórendszer
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#EAD9B8] p-1.5 rounded-2xl border border-[#C5A566]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    audio.playClickSound();
                    onSelectTab(item.id);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#F5EBD4] text-[#1C150D] shadow-sm border border-[#C5A566] font-bold'
                      : 'text-[#7A6B55] hover:text-[#1C150D] hover:bg-[#F5EBD4]/60'
                  }`}
                >
                  <span className={isActive ? 'text-[#8B5E3C]' : 'text-[#9A8B73]'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* AI Generator Button (Desktop) */}
            <button
              onClick={() => {
                audio.playClickSound();
                onOpenGenerator();
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-monument font-bold bg-[#8B5E3C] text-white hover:bg-[#6B4226] border border-[#5C3A1E] transition-all shadow-sm active:scale-95"
            >
              <Plus size={14} />
              <span>Új Tananyag (AI)</span>
            </button>

            {/* Streak Counter */}
            <div
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#FAF0CD] border border-[#D4A843] text-[#5C4A2F] shadow-sm"
              title="Aktív tanulási napok száma"
            >
              <Flame size={16} className="text-amber-600 fill-amber-500" />
              <span className="font-mono font-bold text-xs sm:text-sm">{user?.streakDays || 7} nap</span>
            </div>

            {/* CEFR Indicator */}
            {user && (
              <div className="hidden sm:block">
                <CefrBadge level={user.targetCefr} size="sm" />
              </div>
            )}

            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              title={soundOn ? 'Hanghatások kikapcsolása' : 'Hanghatások bekapcsolása'}
              className="p-2 rounded-xl text-[#7A6B55] hover:text-[#1C150D] hover:bg-[#EAD9B8] border border-[#C5A566] transition-colors"
            >
              {soundOn ? <Volume2 size={18} className="text-[#2E7D5B]" /> : <VolumeX size={18} />}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Kijelentkezés"
              className="p-2 rounded-xl text-[#7A6B55] hover:text-[#8B5E3C] hover:bg-[#EAD9B8] border border-[#C5A566] transition-colors"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Toolbar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2 gap-1 border-t border-[#C5A566] scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  audio.playClickSound();
                  onSelectTab(item.id);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#F5EBD4] text-[#1C150D] border border-[#C5A566] font-bold shadow-sm'
                    : 'text-[#7A6B55] hover:text-[#1C150D]'
                }`}
              >
                <span className={isActive ? 'text-[#8B5E3C]' : 'text-[#9A8B73]'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
