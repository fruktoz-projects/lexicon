import React from 'react';
import { CefrLevel } from '@lexicon/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CefrBadgeProps {
  level: CefrLevel | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export const CefrBadge: React.FC<CefrBadgeProps> = ({
  level,
  size = 'md',
  className,
  showLabel = false,
}) => {
  const levelStyles: Record<string, { bg: string; text: string; border: string; labelHu: string }> = {
    A1: { bg: 'bg-stone-100', text: 'text-stone-800', border: 'border-stone-400', labelHu: 'Kezdő' },
    A2: { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-400', labelHu: 'Alapfok' },
    B1: { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-400', labelHu: 'Középhaladó' },
    B2: { bg: 'bg-[#FAF0CD]', text: 'text-[#5C4A2F]', border: 'border-[#D4A843]', labelHu: 'Haladó' },
    C1: { bg: 'bg-[#E0EDF5]', text: 'text-[#2A5070]', border: 'border-[#7AAFCF]', labelHu: 'Felsőfokú' },
    C2: { bg: 'bg-rose-50', text: 'text-rose-950', border: 'border-rose-400', labelHu: 'Mesterfokú' },
  };

  const style = levelStyles[level] || levelStyles['B2'];

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] rounded-full',
    md: 'px-2.5 sm:px-3 py-1 text-xs rounded-full',
    lg: 'px-3.5 sm:px-4 py-1.5 text-sm rounded-full',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 border font-monument font-bold tracking-wider shadow-sm select-none',
          style.bg,
          style.text,
          style.border,
          sizes[size],
          className
        )
      )}
    >
      <span>{level}</span>
      {showLabel && <span className="font-sans font-semibold text-[11px]">({style.labelHu})</span>}
    </span>
  );
};
