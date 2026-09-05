import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOfflineStore } from '../../store/offlineStore';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOfflineStore((s) => s.isOnline);

  if (isOnline) return null;

  return (
    <div className="bg-status-warningBg border-b border-status-warningBorder text-status-warning px-4 py-1.5 text-xs text-center flex items-center justify-center gap-2">
      <WifiOff size={14} className="text-status-warning" />
      <span>
        <strong>Offline Mód Aktív:</strong> Az alkalmazás helyi memóriából és gyorsítótárból (PWA) fut. Minden gyakorlás automatikusan szinkronizálódik a kapcsolat helyreállásakor.
      </span>
    </div>
  );
};
