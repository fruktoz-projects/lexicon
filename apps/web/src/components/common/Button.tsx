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
      'bg-[#8B5E3C] text-white hover:bg-[#6B4226] shadow-sm border border-[#5C3A1E] font-bold',
    secondary:
      'bg-[#EAD9B8] text-[#1C150D] hover:bg-[#F5EBD4] border border-[#C5A566] shadow-sm font-bold',
    outline:
      'bg-transparent border-2 border-[#C5A566] text-[#1C150D] hover:bg-[#EAD9B8] font-bold',
    ghost:
      'bg-transparent text-[#7A6B55] hover:text-[#1C150D] hover:bg-[#EAD9B8] border border-transparent font-medium',
    nile:
      'bg-[#2E7D5B] text-white hover:bg-[#1E5840] shadow-sm border border-[#1A4B36] font-bold',
    gold:
      'bg-[#D4A843] text-[#1C150D] hover:bg-[#C29632] shadow-sm border border-[#B38520] font-bold',
    danger:
      'bg-red-700 text-white hover:bg-red-800 shadow-sm border border-red-900 font-bold',
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
          'inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none shrink-0 active:scale-[0.98]',
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
