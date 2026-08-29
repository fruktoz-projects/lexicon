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
import { useUiStore, ActiveTab } from '../../store/uiStore';
import { CefrBadge } from '../common/CefrBadge';
import { audio } from '../../services/audio';

const NAV_ITEMS: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Főoldal', icon: <Home size={16} /> },
  { id: 'zones', label: 'Tananyagok', icon: <Layers size={16} /> },
  { id: 'practice', label: 'SRS Gyakorlás', icon: <Target size={16} /> },
  { id: 'writing', label: 'Írásműhely', icon: <PenTool size={16} /> },
  { id: 'analytics', label: 'Haladás & Szókincs', icon: <BarChart3 size={16} /> },
];

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { activeTab, setActiveTab, openGeneratorModal } = useUiStore();
  const [soundOn, setSoundOn] = useState(audio.isSoundEnabled());

  const handleToggleSound = () => {
    const next = audio.toggleSound();
    setSoundOn(next);
  };

  const handleLogout = () => {
    audio.playClickSound();
    logout();
  };

  const renderNavButton = (item: typeof NAV_ITEMS[0], isMobile = false) => {
    const isActive = activeTab === item.id;

    if (isMobile) {
      return (
        <button
          key={item.id}
          onClick={() => {
            audio.playClickSound();
            setActiveTab(item.id);
          }}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 px-1 rounded-xl transition-all duration-150 ${
            isActive
              ? 'text-brand bg-[#FAF0CD] border border-[#D4A843] shadow-sm font-bold'
              : 'text-papyrus-muted hover:text-papyrus-ink hover:bg-[#D7BF96]/60'
          }`}
        >
          <span className={isActive ? 'text-brand' : 'text-papyrus-muted'}>{item.icon}</span>
          <span className="text-[10px] font-bold font-sans">{item.label}</span>
        </button>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => {
          audio.playClickSound();
          setActiveTab(item.id);
        }}
        className={`flex items-center gap-1.5 rounded-xl font-sans text-xs font-bold transition-all duration-150 px-3.5 py-2 ${
          isActive
            ? 'bg-[#FAF0CD] text-brand shadow-sm border border-[#D4A843]'
            : 'text-papyrus-muted hover:text-papyrus-ink hover:bg-[#E6D4B4]/70'
        }`}
      >
        <span className={isActive ? 'text-brand' : 'text-papyrus-muted'}>{item.icon}</span>
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#E6D4B4] border-b-2 border-papyrus-border shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            {/* Logo & Brand */}
            <div
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group min-w-0"
              onClick={() => {
                audio.playClickSound();
                setActiveTab('dashboard');
              }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#E5C175] border border-[#DDB460] flex items-center justify-center text-papyrus-ink shadow-sm group-hover:scale-105 transition-transform shrink-0 font-bold">
                <span className="text-xl sm:text-2xl font-monument font-bold">L</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-monument font-bold text-lg sm:text-xl tracking-wider text-papyrus-ink truncate">
                    LEXICON
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#D7BF96] text-papyrus-muted border border-papyrus-border/40 shrink-0">
                    HU → EN
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-sans text-papyrus-muted truncate font-semibold">
                  Kontrasztív Magyar–Angol Tanulórendszer
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 bg-[#D7BF96] border border-papyrus-border/60 p-1.5 rounded-2xl shadow-inner">
              {NAV_ITEMS.map((item) => renderNavButton(item, false))}
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* AI Generator Button */}
              <button
                onClick={() => {
                  audio.playClickSound();
                  openGeneratorModal();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold bg-[#E5C175] text-papyrus-ink border border-[#DDB460] hover:bg-[#DDB460] transition-all shadow-sm active:scale-95"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Új Tananyag</span>
              </button>

              {/* Streak Counter */}
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-status-warningBg border border-status-warningBorder text-papyrus-ink shadow-sm"
                title="Aktív tanulási napok száma"
              >
                <Flame size={16} className="text-amber-600 fill-amber-500" />
                <span className="font-mono font-bold text-xs sm:text-sm">{user?.streakDays || 7} nap</span>
              </div>

              {/* CEFR Indicator */}
              {user && (
                <div className="hidden md:block">
                  <CefrBadge level={user.targetCefr} size="sm" />
                </div>
              )}

              {/* Audio Toggle */}
              <button
                onClick={handleToggleSound}
                title={soundOn ? 'Hanghatások kikapcsolása' : 'Hanghatások bekapcsolása'}
                className="p-2 rounded-xl text-papyrus-muted hover:text-papyrus-ink hover:bg-[#D7BF96]/50 transition-colors hidden sm:block border border-transparent hover:border-papyrus-border/40"
              >
                {soundOn ? <Volume2 size={18} className="text-status-success" /> : <VolumeX size={18} />}
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                title="Kijelentkezés"
                className="p-2 rounded-xl text-papyrus-muted hover:text-brand hover:bg-[#D7BF96]/50 transition-colors border border-transparent hover:border-papyrus-border/40"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#E6D4B4] border-t-2 border-papyrus-border shadow-[0_-4px_14px_rgba(45,30,12,0.1)] pb-safe">
        <div className="flex items-center justify-around p-1.5 max-w-md mx-auto">
          {NAV_ITEMS.map((item) => renderNavButton(item, true))}
        </div>
      </nav>
    </>
  );
};
