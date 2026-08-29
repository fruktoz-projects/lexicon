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
      'bg-papyrus-card rounded-2xl p-5 shadow-card',
    elevated:
      'bg-papyrus-card rounded-2xl p-5 shadow-card-hover',
    interactive:
      'bg-papyrus-card hover:border-brand rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer',
    sunken:
      'bg-papyrus-subtle rounded-2xl p-4 shadow-inner',
  };

  return (
    <div className={twMerge(clsx(variants[variant], className))} {...props}>
      {children}
    </div>
  );
};
