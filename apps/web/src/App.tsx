import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/layout/Header';
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
import { ZoneType } from '@lexicon/types';

export const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { setOnlineStatus } = useOfflineStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedZone, setSelectedZone] = useState<ZoneType | undefined>(undefined);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

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
    setActiveTab('zones');
  };

  return (
    <div className="min-h-screen bg-[#D8C194] flex flex-col font-sans antialiased text-[#1C150D]">
      {/* Offline Status Notice */}
      <OfflineBanner />

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab !== 'zones') setSelectedZone(undefined);
          setActiveTab(tab);
        }}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
      />

      {/* Main Body Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardPage
            onStartPractice={() => setActiveTab('practice')}
            onSelectZone={handleSelectZone}
            onOpenWriting={() => setActiveTab('writing')}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
          />
        )}

        {activeTab === 'zones' && (
          <ZonesPage
            initialZone={selectedZone}
            onStartPractice={() => setActiveTab('practice')}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
            isGeneratorOpen={isGeneratorOpen}
            setIsGeneratorOpen={setIsGeneratorOpen}
          />
        )}

        {activeTab === 'practice' && (
          <PracticePage onBackToDashboard={() => setActiveTab('dashboard')} />
        )}

        {activeTab === 'writing' && <WritingPage />}

        {activeTab === 'analytics' && <AnalyticsPage />}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#C5A566] bg-[#EAD9B8] py-3.5 sm:py-4 text-center text-xs text-[#7A6B55] mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 font-mono text-[11px]">
          <span className="font-monument font-bold text-[#1C150D]">LEXICON</span>
          <span>•</span>
          <span className="font-semibold text-[#7A6B55]">v0.1.0</span>
        </div>
      </footer>

      {/* Global AI Pack Generator Modal */}
      <PackGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onPackCreated={() => {
          setActiveTab('zones');
        }}
      />
    </div>
  );
};
