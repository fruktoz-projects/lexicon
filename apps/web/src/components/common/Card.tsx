import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'sunken';
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  const variants = {
    default:
      'bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl p-5 shadow-card',
    elevated:
      'bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl p-5 shadow-lg',
    interactive:
      'bg-[#F5EBD4] border-2 border-[#C5A566] hover:border-[#8B5E3C] rounded-2xl p-5 shadow-card hover:shadow-md transition-all duration-200 cursor-pointer',
    sunken:
      'bg-[#EAD9B8] border-2 border-[#C5A566] rounded-2xl p-4 shadow-inner',
  };

  return (
    <div className={twMerge(clsx(variants[variant], className))} {...props}>
      {children}
    </div>
  );
};
