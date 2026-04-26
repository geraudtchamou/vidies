'use client';

import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  status?: 'processing' | 'paused' | 'completed' | 'failed';
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  progress,
  label,
  status = 'processing',
  showPercentage = true,
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'from-accent-green to-emerald-400';
      case 'failed':
        return 'from-accent-red to-red-400';
      case 'paused':
        return 'from-accent-orange to-orange-400';
      default:
        return 'from-primary to-accent-teal';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'failed':
        return '✕';
      case 'paused':
        return '⏸';
      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-text-primary">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-primary">
              {Math.round(progress)}%
              {getStatusIcon() && (
                <span className="ml-1 text-xs">{getStatusIcon()}</span>
              )}
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${heightClasses[size]}`}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full bg-gradient-to-r ${getStatusColor()} transition-all duration-300 ease-out relative`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          {/* Shimmer effect for processing state */}
          {status === 'processing' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-opacity-30 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
    </div>
  );
}
