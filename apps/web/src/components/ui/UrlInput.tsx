'use client';

import React, { useState } from 'react';
import { ArrowUpTrayIcon, LinkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/solid';

interface UrlInputProps {
  onUrlSubmit: (url: string) => void;
  onFileUpload: (files: FileList) => void;
  placeholder?: string;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

export function UrlInput({
  onUrlSubmit,
  onFileUpload,
  placeholder = 'Paste video URL or upload file',
  accept = 'video/*,audio/*',
  multiple = true,
  className = '',
}: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [copiedFromClipboard, setCopiedFromClipboard] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onUrlSubmit(url.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setCopiedFromClipboard(true);
        setTimeout(() => setCopiedFromClipboard(false), 2000);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* URL Input Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-text-secondary">
            <LinkIcon className="w-5 h-5" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={placeholder}
            className="input-field pl-12 pr-32 py-4 text-base"
            aria-label="Video URL"
          />
          <div className="absolute right-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handlePaste}
              className="p-2 text-text-secondary hover:text-primary transition-colors duration-200"
              aria-label="Paste from clipboard"
              title="Paste from clipboard"
            >
              {copiedFromClipboard ? (
                <ClipboardDocumentCheckIcon className="w-5 h-5 text-accent-green" />
              ) : (
                <ClipboardDocumentIcon className="w-5 h-5" />
              )}
            </button>
            <button
              type="submit"
              disabled={!url.trim()}
              className="btn-primary px-4 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Process
            </button>
          </div>
        </div>
      </form>

      {/* File Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-primary bg-primary bg-opacity-5 scale-[1.02]'
            : 'border-border-color hover:border-primary hover:bg-bg-surface'
        }`}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload files"
        />
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-bg-surface rounded-full shadow-md">
              <ArrowUpTrayIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-text-primary font-medium">
              Drop files here or click to upload
            </p>
            <p className="text-text-secondary text-sm mt-1">
              Supports MP4, WebM, MKV, AVI, MOV, MP3, WAV, AAC, FLAC, OGG
            </p>
            {multiple && (
              <p className="text-text-secondary text-xs mt-1">
                Multiple files supported
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        <span className="tag tag-info">YouTube</span>
        <span className="tag tag-info">TikTok</span>
        <span className="tag tag-info">Instagram</span>
        <span className="tag tag-info">Local Files</span>
      </div>
    </div>
  );
}
