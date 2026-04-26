'use client';

import React from 'react';
import { 
  ArrowDownTrayIcon, 
  MusicalNoteIcon, 
  ArrowsDownLineIcon,
  PlayCircleIcon,
  ShareIcon,
  TrashIcon,
  FolderIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  disabled?: boolean;
  className?: string;
}

export function ActionButton({
  icon,
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}: ActionButtonProps) {
  const baseClasses = 'flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-200 font-medium';
  
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-light text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-bg-surface border-2 border-border-color hover:border-primary text-text-primary disabled:opacity-50 disabled:cursor-not-allowed',
    accent: 'bg-accent-teal hover:bg-opacity-90 text-white shadow-glow hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-label={label}
    >
      <div className="w-8 h-8">{icon}</div>
      <span className="text-sm">{label}</span>
    </button>
  );
}

interface ActionSelectorProps {
  onSelectAction: (action: 'download' | 'convert' | 'compress') => void;
  selectedAction?: 'download' | 'convert' | 'compress';
  className?: string;
}

export function ActionSelector({
  onSelectAction,
  selectedAction,
  className = '',
}: ActionSelectorProps) {
  const actions = [
    {
      id: 'download' as const,
      icon: <ArrowDownTrayIcon className="w-8 h-8" />,
      label: 'Download',
      description: 'Save video in high quality',
      color: 'from-blue-500 to-primary',
    },
    {
      id: 'convert' as const,
      icon: <MusicalNoteIcon className="w-8 h-8" />,
      label: 'Convert to Audio',
      description: 'Extract audio (MP3, WAV, etc.)',
      color: 'from-accent-teal to-emerald-500',
    },
    {
      id: 'compress' as const,
      icon: <ArrowsDownLineIcon className="w-8 h-8" />,
      label: 'Compress',
      description: 'Reduce file size efficiently',
      color: 'from-accent-orange to-red-500',
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => onSelectAction(action.id)}
          className={`relative p-6 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02] text-left ${
            selectedAction === action.id
              ? 'border-primary bg-primary bg-opacity-5 shadow-lg scale-[1.02]'
              : 'border-border-color bg-bg-surface hover:border-primary hover:shadow-md'
          }`}
          aria-pressed={selectedAction === action.id}
        >
          <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.color} text-white mb-3`}>
            {action.icon}
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            {action.label}
          </h3>
          <p className="text-sm text-text-secondary">
            {action.description}
          </p>
          {selectedAction === action.id && (
            <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

interface ResultActionsProps {
  onDownload: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  downloadLabel?: string;
  showSize?: boolean;
  originalSize?: string;
  newSize?: string;
  className?: string;
}

export function ResultActions({
  onDownload,
  onShare,
  onDelete,
  downloadLabel = 'Download',
  showSize = true,
  originalSize,
  newSize,
  className = '',
}: ResultActionsProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Size Comparison */}
      {showSize && (originalSize || newSize) && (
        <div className="flex items-center justify-center gap-4 py-3 px-4 bg-bg-surface rounded-lg border border-border-color">
          {originalSize && (
            <div className="text-center">
              <p className="text-xs text-text-secondary uppercase tracking-wide">Original</p>
              <p className="text-lg font-semibold text-text-primary">{originalSize}</p>
            </div>
          )}
          {originalSize && newSize && (
            <div className="text-text-secondary">→</div>
          )}
          {newSize && (
            <div className="text-center">
              <p className="text-xs text-accent-green uppercase tracking-wide">New Size</p>
              <p className="text-lg font-semibold text-accent-green">{newSize}</p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onDownload}
          className="btn-primary flex items-center gap-2"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          {downloadLabel}
        </button>
        
        {onShare && (
          <button
            onClick={onShare}
            className="btn-secondary flex items-center gap-2"
          >
            <ShareIcon className="w-5 h-5" />
            Share
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-4 py-3 rounded-lg border-2 border-accent-red text-accent-red hover:bg-accent-red hover:text-white font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <TrashIcon className="w-5 h-5" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
