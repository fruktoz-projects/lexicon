import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { audio } from '../../services/audio';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AudioButtonProps {
  text: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  size = 'md',
  className,
  label,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    audio.speakEnglish(text);
    setTimeout(() => setIsPlaying(false), 1200);
  };

  const iconSizes = {
    sm: 13,
    md: 16,
    lg: 20,
  };

  const btnSizes = {
    sm: 'p-1 text-xs',
    md: 'p-1.5 text-xs sm:text-sm',
    lg: 'p-2.5 text-sm sm:text-base',
  };

  return (
    <button
      type="button"
      title={`Kiejtés: "${text}"`}
      onClick={handleSpeak}
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-full text-[#8B5E3C] hover:text-[#1C150D] hover:bg-[#FAF0CD] bg-[#8B5E3C]/10 border border-[#8B5E3C]/30 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/40',
          isPlaying && 'bg-[#FAF0CD] text-[#1C150D] scale-105 shadow-sm font-bold border-[#8B5E3C]',
          btnSizes[size],
          className
        )
      )}
    >
      <Volume2 size={iconSizes[size]} className={clsx(isPlaying && 'animate-pulse')} />
      {label && <span className="font-sans font-medium pr-1">{label}</span>}
    </button>
  );
};
