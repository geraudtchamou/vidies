'use client';

import { formatFileSize } from '@videotools/core';

type ActionType = 'download' | 'convert-audio' | 'compress';

interface ResultViewProps {
  result: {
    outputPath: string;
    originalSize?: number;
    finalSize?: number;
  };
  actionType: ActionType;
  onReset: () => void;
}

export default function ResultView({ result, actionType, onReset }: ResultViewProps) {
  const getActionTitle = () => {
    switch (actionType) {
      case 'download':
        return 'Download Complete!';
      case 'convert-audio':
        return 'Audio Conversion Complete!';
      case 'compress':
        return 'Compression Complete!';
    }
  };

  const getActionIcon = () => {
    switch (actionType) {
      case 'download':
        return '✅';
      case 'convert-audio':
        return '🎵';
      case 'compress':
        return '📦';
    }
  };

  const sizeReduction = result.originalSize && result.finalSize
    ? Math.round((1 - result.finalSize / result.originalSize) * 100)
    : null;

  return (
    <div className="space-y-6 text-center py-8">
      {/* Success Icon */}
      <div className="text-6xl mb-4">{getActionIcon()}</div>

      {/* Title */}
      <h3 className="text-xl font-semibold">{getActionTitle()}</h3>

      {/* File Info */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">Output File:</span>
          <span className="font-medium">{result.outputPath}</span>
        </div>

        {result.originalSize && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Original Size:</span>
            <span className="font-medium">{formatFileSize(result.originalSize)}</span>
          </div>
        )}

        {result.finalSize && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Final Size:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {formatFileSize(result.finalSize)}
            </span>
          </div>
        )}

        {sizeReduction !== null && sizeReduction > 0 && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
              <span className="text-green-700 dark:text-green-400 text-sm font-semibold">
                🎉 {sizeReduction}% smaller!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          onClick={onReset}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Process Another Video
        </button>
        <button
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download File
        </button>
        <button
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>

      {/* History Note */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          💡 This file has been saved to your download history. You can access it anytime from the history tab.
        </p>
      </div>
    </div>
  );
}
