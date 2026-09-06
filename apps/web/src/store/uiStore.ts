import { create } from 'zustand';
import { ZoneType } from '@lexicon/types';

export type ActiveTab = 'dashboard' | 'zones' | 'practice' | 'writing' | 'analytics' | 'admin';

interface UiState {
  activeTab: ActiveTab;
  selectedZone?: ZoneType;
  isGeneratorModalOpen: boolean;
  isRemixModalOpen: boolean;
  
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedZone: (zone?: ZoneType) => void;
  openGeneratorModal: () => void;
  closeGeneratorModal: () => void;
  openRemixModal: () => void;
  closeRemixModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeTab: 'dashboard',
  selectedZone: undefined,
  isGeneratorModalOpen: false,
  isRemixModalOpen: false,

  setActiveTab: (tab) => set((state) => ({ activeTab: tab, selectedZone: tab === 'zones' ? state.selectedZone : undefined })),
  setSelectedZone: (zone) => set({ selectedZone: zone, activeTab: 'zones' }),
  openGeneratorModal: () => set({ isGeneratorModalOpen: true }),
  closeGeneratorModal: () => set({ isGeneratorModalOpen: false }),
  openRemixModal: () => set({ isRemixModalOpen: true }),
  closeRemixModal: () => set({ isRemixModalOpen: false }),
}));
