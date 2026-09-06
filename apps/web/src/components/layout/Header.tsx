import React from 'react';
import {
  Flame,
  Target,
  PenTool,
  BarChart3,
  Layers,
  Plus,
  Home,
  LogOut,
  Settings,
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

  const navItems = [...NAV_ITEMS];
  if (user?.role === 'ADMIN') {
    navItems.push({ id: 'admin', label: 'Admin', icon: <Settings size={16} /> });
  }

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
              ? 'text-accent bg-accent-subtle border border-accent/30 shadow-sm font-bold'
              : 'text-muted hover:text-ink hover:bg-surface-subtle/60'
          }`}
        >
          <span className={isActive ? 'text-accent' : 'text-muted'}>{item.icon}</span>
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
            ? 'bg-accent-subtle text-accent shadow-sm border border-accent/30'
            : 'text-muted hover:text-ink hover:bg-surface-subtle/70'
        }`}
      >
        <span className={isActive ? 'text-accent' : 'text-muted'}>{item.icon}</span>
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface-subtle border-b-2 border-border shadow-sm">
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
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-accent border border-accent flex items-center justify-center text-accent-text shadow-sm group-hover:scale-105 transition-transform shrink-0 font-bold">
                <span className="text-xl sm:text-2xl font-monument font-bold">L</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-monument font-bold text-lg sm:text-xl tracking-wider text-ink truncate">
                    LEXICON
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-surface-subtle text-muted border border-border/40 shrink-0">
                    HU → EN
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] font-sans text-muted truncate font-semibold">
                  Kontrasztív Magyar–Angol Tanulórendszer
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 bg-surface-subtle border border-border/60 p-1.5 rounded-2xl shadow-inner">
              {navItems.map((item) => renderNavButton(item, false))}
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* AI Generator Button */}
              <button
                onClick={() => {
                  audio.playClickSound();
                  openGeneratorModal();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold bg-accent text-accent-text border border-accent hover:bg-accent-hover transition-all shadow-sm active:scale-95"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Új Tananyag</span>
              </button>

              {/* Streak Counter */}
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-status-warningBg border border-status-warningBorder text-ink shadow-sm"
                title="Aktív tanulási napok száma"
              >
                <Flame size={16} className="text-status-warning fill-status-warning" />
                <span className="font-mono font-bold text-xs sm:text-sm">{user?.streakDays || 7} nap</span>
              </div>

              {/* CEFR Indicator */}
              {user && (
                <div className="hidden md:block">
                  <CefrBadge level={user.targetCefr} size="sm" />
                </div>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                title="Kijelentkezés"
                className="p-2 rounded-xl text-muted hover:text-accent hover:bg-surface-subtle/50 transition-colors border border-transparent hover:border-border/40"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-subtle border-t-2 border-border shadow-[0_-4px_14px_rgba(15,23,42,0.1)] pb-safe">
        <div className="flex items-center justify-around p-1.5 max-w-md mx-auto">
          {navItems.map((item) => renderNavButton(item, true))}
        </div>
      </nav>
    </>
  );
};
