'use client';

import React from 'react';

interface TagProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md';
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function Tag({
  children,
  variant = 'default',
  size = 'md',
  onClick,
  onRemove,
  className = '',
}: TagProps) {
  const baseClasses = 'inline-flex items-center rounded-full font-medium transition-all duration-200';
  
  const variantClasses = {
    success: 'bg-accent-green bg-opacity-20 text-accent-green hover:bg-opacity-30',
    warning: 'bg-accent-orange bg-opacity-20 text-accent-orange hover:bg-opacity-30',
    error: 'bg-accent-red bg-opacity-20 text-accent-red hover:bg-opacity-30',
    info: 'bg-primary bg-opacity-20 text-primary hover:bg-opacity-30',
    default: 'bg-gray-200 dark:bg-gray-700 text-text-secondary hover:bg-opacity-80',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  };

  const clickableClass = onClick ? 'cursor-pointer transform hover:scale-105' : '';

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${clickableClass} ${className}`}
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
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-2 hover:text-text-primary focus:outline-none"
          aria-label="Remove tag"
        >
          ×
        </button>
      )}
    </span>
  );
}
