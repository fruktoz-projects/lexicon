import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { audio } from '../../services/audio';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'nile' | 'gold' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  withSound?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  withSound = true,
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && withSound) {
      audio.playClickSound();
    }
    onClick?.(e);
  };

  const variants = {
    primary:
      'bg-[#E5C175] text-papyrus-ink hover:bg-[#DDB460] shadow-sm font-sans font-bold',
    secondary:
      'bg-papyrus-subtle text-papyrus-ink hover:bg-papyrus-card shadow-sm font-sans font-bold',
    outline:
      'bg-transparent border border-papyrus-border text-papyrus-ink hover:bg-papyrus-subtle font-sans font-bold',
    ghost:
      'bg-transparent text-papyrus-muted hover:text-papyrus-ink hover:bg-papyrus-subtle font-sans font-semibold',
    nile:
      'bg-status-successBg text-status-success hover:bg-emerald-200 shadow-sm border border-status-successBorder font-sans font-bold',
    gold:
      'bg-status-warningBg text-amber-900 hover:bg-amber-200 shadow-sm border border-status-warningBorder font-sans font-bold',
    danger:
      'bg-status-errorBg text-status-error hover:bg-red-200 shadow-sm border border-status-errorBorder font-sans font-bold',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs rounded-lg',
    md: 'px-4 py-2 text-xs sm:text-sm rounded-xl font-medium',
    lg: 'px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl font-semibold',
  };

  return (
    <button
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none shrink-0 active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )
      )}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
