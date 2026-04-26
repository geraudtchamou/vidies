'use client';

import { useState, useCallback } from 'react';
import { videoDownloader, detectPlatform, formatFileSize, formatDuration } from '@videotools/core';
import type { VideoInfo, VideoFormat, AudioFormat } from '@videotools/core';
import UrlInput from '@/components/UrlInput';
import VideoInfoCard from '@/components/VideoInfoCard';
import ActionSelector from '@/components/ActionSelector';
import ProcessingView from '@/components/ProcessingView';
import ResultView from '@/components/ResultView';

type Step = 'input' | 'select' | 'process' | 'result';
type ActionType = 'download' | 'convert-audio' | 'compress';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<VideoFormat | null>(null);
  const [selectedAudioFormat, setSelectedAudioFormat] = useState<AudioFormat | null>(null);
  const [actionType, setActionType] = useState<ActionType>('download');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingData, setProcessingData] = useState<{
    progress: number;
    status: string;
    eta?: number;
  }>({ progress: 0, status: '' });
  const [result, setResult] = useState<{
    outputPath: string;
    originalSize?: number;
    finalSize?: number;
  } | null>(null);

  const handleUrlSubmit = async (submittedUrl: string) => {
    setUrl(submittedUrl);
    setIsLoading(true);
    setError(null);

    try {
      const platform = detectPlatform(submittedUrl);
      if (platform === 'unknown') {
        // For local files or unsupported platforms, skip to upload
        setCurrentStep('select');
        return;
      }

      const info = await videoDownloader.fetchVideoInfo(submittedUrl);
      setVideoInfo(info);
      setCurrentStep('select');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch video info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    // Create mock video info for uploaded file
    const mockInfo: VideoInfo = {
      id: `local_${Date.now()}`,
      title: file.name,
      thumbnail: '',
      duration: 0, // Would need to parse the file to get this
      author: 'Local File',
      platform: 'local',
      formats: [
        {
          id: 'original',
          extension: 'mp4',
          quality: '1080p',
          resolution: { width: 1920, height: 1080 },
          hasAudio: true,
          codec: 'h264',
          filesize: file.size
        }
      ],
      audioFormats: [
        { id: 'aud-320k', extension: 'mp3', bitrate: '320k', filesize: file.size / 5 },
        { id: 'aud-192k', extension: 'mp3', bitrate: '192k', filesize: file.size / 7 },
        { id: 'aud-128k', extension: 'mp3', bitrate: '128k', filesize: file.size / 10 }
      ]
    };
    
    setVideoInfo(mockInfo);
    setCurrentStep('select');
  };

  const handleActionSelect = (action: ActionType) => {
    setActionType(action);
    setCurrentStep('process');
  };

  const handleProcess = async () => {
    // This would integrate with FFmpeg.wasm for actual processing
    // For now, simulate the process
    setProcessingData({ progress: 0, status: 'Starting...' });

    const steps = [
      { progress: 10, status: 'Initializing...' },
      { progress: 30, status: 'Processing video...' },
      { progress: 60, status: 'Converting...' },
      { progress: 85, status: 'Finalizing...' },
      { progress: 100, status: 'Complete!' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProcessingData(step);
    }

    setResult({
      outputPath: 'output.mp4',
      originalSize: selectedFormat?.filesize || videoInfo?.formats[0]?.filesize,
      finalSize: selectedFormat?.filesize ? selectedFormat.filesize * 0.7 : undefined
    });
    setCurrentStep('result');
  };

  const handleReset = () => {
    setCurrentStep('input');
    setUrl('');
    setVideoInfo(null);
    setSelectedFormat(null);
    setSelectedAudioFormat(null);
    setResult(null);
    setProcessingData({ progress: 0, status: '' });
    setError(null);
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            VideoTools
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            Download • Convert • Compress — All in your browser
          </p>
        </header>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
          {currentStep === 'input' && (
            <UrlInput
              onSubmit={handleUrlSubmit}
              onFileUpload={handleFileUpload}
              isLoading={isLoading}
              error={error}
            />
          )}

          {currentStep === 'select' && videoInfo && (
            <VideoInfoCard
              videoInfo={videoInfo}
              selectedFormat={selectedFormat}
              selectedAudioFormat={selectedAudioFormat}
              onSelectFormat={setSelectedFormat}
              onSelectAudioFormat={setSelectedAudioFormat}
              onNext={() => setCurrentStep('select')}
              onBack={handleReset}
            />
          )}

          {currentStep === 'select' && videoInfo && (
            <ActionSelector
              videoInfo={videoInfo}
              selectedAction={actionType}
              onSelectAction={handleActionSelect}
              onBack={() => setCurrentStep('input')}
            />
          )}

          {currentStep === 'process' && (
            <ProcessingView
              actionType={actionType}
              progress={processingData.progress}
              status={processingData.status}
              eta={processingData.eta}
              onProcess={handleProcess}
              onCancel={handleReset}
            />
          )}

          {currentStep === 'result' && result && (
            <ResultView
              result={result}
              actionType={actionType}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Features Section */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Download Videos</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Paste a URL from YouTube, TikTok, or Instagram and download in high quality.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Convert to Audio</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Extract audio from videos in MP3, WAV, AAC, FLAC, or OGG format.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Compression</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Compress videos up to 90% smaller with presets for social media platforms.
            </p>
          </div>
        </section>

        {/* Privacy Notice */}
        <section className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            🔒 Privacy First: All processing happens in your browser. Your files never leave your device.
          </p>
        </section>
      </div>
    </main>
  );
}
