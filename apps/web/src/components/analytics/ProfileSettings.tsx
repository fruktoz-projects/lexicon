import React, { useState } from 'react';
import { CefrLevel, UserProfile, ZoneType } from '@lexicon/types';
import { api } from '../../services/api';
import { Button } from '../common/Button';
import { audio } from '../../services/audio';
import { Settings, Save, Loader2, PlayCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface ProfileSettingsProps {
  user: UserProfile;
  onUpdate: (updatedUser: UserProfile) => void;
  onStartPlacementTest: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdate, onStartPlacementTest }) => {
  const [targetCefr, setTargetCefr] = useState<CefrLevel>(user.targetCefr);
  const [dailyGoal, setDailyGoal] = useState<number>(user.dailyGoalMinutes || 15);
  const [isSaving, setIsSaving] = useState(false);
  const { updateUser } = useAuthStore();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await api.auth.updateProfile({
        targetCefr,
        dailyGoalMinutes: dailyGoal,
      });
      updateUser(updated);
      onUpdate(updated);
      audio.playSuccessSound();
    } catch (err) {
      console.error(err);
      audio.playMistakeSound();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-card mb-5 sm:mb-7 border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-monument font-bold text-ink flex items-center gap-2">
            <Settings size={18} className="text-accent" />
            <span>Profil & Tanulási Célok</span>
          </h3>
          <p className="text-xs sm:text-sm font-sans text-muted mt-1 font-medium">
            Testreszabhatod az angol tanulási céljaidat és újra felmérheted a szintedet.
          </p>
        </div>

        <Button
          onClick={() => {
            audio.playClickSound();
            onStartPlacementTest();
          }}
          variant="primary"
          className="flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm py-2"
        >
          <PlayCircle size={16} />
          <span>Szintfelmérő Indítása</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-monument font-bold text-ink mb-2">
            Cél CEFR Szint
          </label>
          <select
            value={targetCefr}
            onChange={(e) => setTargetCefr(e.target.value as CefrLevel)}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-border bg-surface text-sm text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none shadow-inner font-sans font-semibold"
          >
            <option value={CefrLevel.A2}>A2 — Kezdő (Alapfok)</option>
            <option value={CefrLevel.B1}>B1 — Középhaladó</option>
            <option value={CefrLevel.B2}>B2 — Haladó (Középfok)</option>
            <option value={CefrLevel.C1}>C1 — Felsőfokú</option>
            <option value={CefrLevel.C2}>C2 — Mesterfok</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-monument font-bold text-ink mb-2">
            Napi cél (perc)
          </label>
          <select
            value={dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl border-2 border-border bg-surface text-sm text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none shadow-inner font-sans font-semibold"
          >
            <option value={5}>5 perc (Napi minimum)</option>
            <option value={15}>15 perc (Normál haladás)</option>
            <option value={30}>30 perc (Intenzív)</option>
            <option value={60}>60 perc (Nagyon intenzív)</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          variant="secondary"
          className="flex items-center gap-2 text-xs py-1.5 px-4"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>Beállítások Mentése</span>
        </Button>
      </div>
    </div>
  );
};
