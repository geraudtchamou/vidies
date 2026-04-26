'use client';

import { COMPRESSION_PROFILES } from '@videotools/core';
import type { VideoInfo } from '@videotools/core';

type ActionType = 'download' | 'convert-audio' | 'compress';

interface ActionSelectorProps {
  videoInfo: VideoInfo;
  selectedAction: ActionType;
  onSelectAction: (action: ActionType) => void;
  onBack: () => void;
}

export default function ActionSelector({
  videoInfo,
  selectedAction,
  onSelectAction,
  onBack
}: ActionSelectorProps) {
  const actions: { id: ActionType; title: string; description: string; icon: string; color: string }[] = [
    {
      id: 'download',
      title: 'Download Video',
      description: 'Download in selected quality',
      icon: '⬇️',
      color: 'blue'
    },
    {
      id: 'convert-audio',
      title: 'Convert to Audio',
      description: 'Extract audio as MP3, WAV, etc.',
      icon: '🎵',
      color: 'purple'
    },
    {
      id: 'compress',
      title: 'Compress Video',
      description: 'Reduce file size with smart presets',
      icon: '📦',
      color: 'green'
    }
  ];

  const getCompressionPresets = () => {
    return COMPRESSION_PROFILES.filter(p => p.mode !== undefined);
  };

  return (
    <div className="space-y-6">
      {/* Action Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">What would you like to do?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onSelectAction(action.id)}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                selectedAction === action.id
                  ? `border-${action.color}-500 bg-${action.color}-50 dark:bg-${action.color}-900/20`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <h4 className="font-semibold mb-1">{action.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Compression Presets (shown when compress is selected) */}
      {selectedAction === 'compress' && (
        <div className="animate-fadeIn">
          <h3 className="text-lg font-semibold mb-4">Choose Compression Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {getCompressionPresets().map((profile) => (
              <div
                key={profile.id}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{profile.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    profile.mode === 'quality-first' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : profile.mode === 'size-first'
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  }`}>
                    {profile.mode.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{profile.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded uppercase">
                    {profile.codec}
                  </span>
                  {profile.resolution && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                      {profile.resolution.width}×{profile.resolution.height}
                    </span>
                  )}
                  {profile.crf && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                      CRF {profile.crf}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          disabled={!selectedAction}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Start Processing
        </button>
      </div>
    </div>
  );
}
