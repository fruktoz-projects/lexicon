import React, { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { OfflineBanner } from './components/layout/OfflineBanner';
import { DashboardPage } from './pages/DashboardPage';
import { ZonesPage } from './pages/ZonesPage';
import { PracticePage } from './pages/PracticePage';
import { WritingPage } from './pages/WritingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuthPage } from './pages/AuthPage';
import { PackGeneratorModal } from './components/packs/PackGeneratorModal';
import { useAuthStore } from './store/authStore';
import { useOfflineStore } from './store/offlineStore';
import { useUiStore } from './store/uiStore';
import { ZoneType } from '@lexicon/types';

export const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { setOnlineStatus } = useOfflineStore();
  const {
    activeTab,
    setActiveTab,
    selectedZone,
    setSelectedZone,
    isGeneratorModalOpen,
    closeGeneratorModal,
  } = useUiStore();

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  if (!isAuthenticated) {
    return <AuthPage onSuccess={() => setActiveTab('dashboard')} />;
  }

  const handleSelectZone = (zone: ZoneType) => {
    setSelectedZone(zone);
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans antialiased text-ink pb-20 lg:pb-0">
      {/* Offline Status Notice */}
      <OfflineBanner />

      {/* Main Header */}
      <Header />

      {/* Main Body Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardPage
            onStartPractice={() => setActiveTab('practice')}
            onSelectZone={handleSelectZone}
            onOpenWriting={() => setActiveTab('writing')}
            onOpenGenerator={() => useUiStore.getState().openGeneratorModal()}
          />
        )}

        {activeTab === 'zones' && (
          <ZonesPage
            initialZone={selectedZone}
            onStartPractice={() => setActiveTab('practice')}
          />
        )}

        {activeTab === 'practice' && (
          <PracticePage onBackToDashboard={() => setActiveTab('dashboard')} />
        )}

        {activeTab === 'writing' && <WritingPage />}

        {activeTab === 'analytics' && <AnalyticsPage />}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-border bg-surface-subtle py-3.5 sm:py-4 text-center text-xs text-muted mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 font-mono text-[11px]">
          <span className="font-monument font-bold text-ink">LEXICON</span>
          <span>•</span>
          <span className="font-semibold text-muted">v0.1.0</span>
        </div>
      </footer>

      {/* Centralized AI Pack Generator Modal */}
      <PackGeneratorModal
        isOpen={isGeneratorModalOpen}
        onClose={closeGeneratorModal}
        onPackCreated={() => {
          setActiveTab('zones');
        }}
      />
    </div>
  );
};
