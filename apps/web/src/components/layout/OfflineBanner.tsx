import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOfflineStore } from '../../store/offlineStore';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOfflineStore((s) => s.isOnline);

  if (isOnline) return null;

  return (
    <div className="bg-amber-100 border-b border-amber-300 text-amber-900 px-4 py-1.5 text-xs text-center flex items-center justify-center gap-2">
      <WifiOff size={14} className="text-amber-800" />
      <span>
        <strong>Offline Mód Aktív:</strong> Az alkalmazás helyi memóriából és gyorsítótárból (PWA) fut. Minden gyakorlás automatikusan szinkronizálódik a kapcsolat helyreállásakor.
      </span>
    </div>
  );
};
