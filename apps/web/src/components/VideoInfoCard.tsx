'use client';

import { formatFileSize, formatDuration } from '@videotools/core';
import type { VideoInfo, VideoFormat, AudioFormat } from '@videotools/core';

interface VideoInfoCardProps {
  videoInfo: VideoInfo;
  selectedFormat: VideoFormat | null;
  selectedAudioFormat: AudioFormat | null;
  onSelectFormat: (format: VideoFormat) => void;
  onSelectAudioFormat: (format: AudioFormat) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function VideoInfoCard({
  videoInfo,
  selectedFormat,
  selectedAudioFormat,
  onSelectFormat,
  onSelectAudioFormat,
  onBack
}: VideoInfoCardProps) {
  return (
    <div className="space-y-6">
      {/* Video Info Header */}
      <div className="flex gap-4">
        {videoInfo.thumbnail && (
          <img
            src={videoInfo.thumbnail}
            alt={videoInfo.title}
            className="w-32 h-20 object-cover rounded-lg"
          />
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold truncate">{videoInfo.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{videoInfo.author}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full capitalize">
              {videoInfo.platform}
            </span>
            {videoInfo.duration > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDuration(videoInfo.duration)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Video Format Selection */}
      <div>
        <h3 className="text-sm font-medium mb-3">Select Video Quality</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {videoInfo.formats.map((format) => (
            <button
              key={format.id}
              onClick={() => onSelectFormat(format)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedFormat?.id === format.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {format.quality}
                </span>
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded uppercase">
                  {format.extension}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>{format.resolution.width}×{format.resolution.height}</p>
                {format.filesize && (
                  <p>~{formatFileSize(format.filesize)}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Audio Format Selection */}
      <div>
        <h3 className="text-sm font-medium mb-3">Select Audio Quality (for conversion)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {videoInfo.audioFormats.map((format) => (
            <button
              key={format.id}
              onClick={() => onSelectAudioFormat(format)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                selectedAudioFormat?.id === format.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="font-semibold text-purple-600 dark:text-purple-400">
                {format.bitrate}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mt-1">
                {format.extension}
              </div>
              {format.filesize && (
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  ~{formatFileSize(format.filesize)}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedFormat && !selectedAudioFormat}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
