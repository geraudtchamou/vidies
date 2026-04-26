'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  selected?: boolean;
  variant?: 'default' | 'glass' | 'bordered';
}

export function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
  selected = false,
  variant = 'default',
}: CardProps) {
  const baseClasses = 'rounded-xl p-6 transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-bg-surface shadow-md border border-border-color hover:shadow-lg',
    glass: 'glass-card',
    bordered: 'bg-transparent border-2 border-border-color hover:border-primary',
  };

  const hoverClass = hoverable || onClick ? 'cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]' : '';
  const selectedClass = selected ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-bg-dark' : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClass} ${selectedClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4;
}

export function CardTitle({ children, className = '', level = 2 }: CardTitleProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const sizeClasses = {
    1: 'text-2xl font-bold',
    2: 'text-xl font-semibold',
    3: 'text-lg font-medium',
    4: 'text-base font-medium',
  };

  return (
    <Tag className={`${sizeClasses[level]} text-text-primary ${className}`}>
      {children}
    </Tag>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`text-text-secondary ${className}`}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function CardFooter({ children, className = '', actions }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-border-color flex items-center justify-between ${className}`}>
      {children}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
