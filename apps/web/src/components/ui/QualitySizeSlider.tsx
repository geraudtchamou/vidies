'use client';

import React, { useState } from 'react';
import { Slider } from '@headlessui/react';
import { EyeIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

interface QualitySizeSliderProps {
  minQuality: number; // 0-100
  maxQuality: number; // 0-100
  defaultValue: number;
  originalSize: number; // in bytes
  onQualityChange: (quality: number) => void;
  className?: string;
}

export function QualitySizeSlider({
  minQuality,
  maxQuality,
  defaultValue,
  originalSize,
  onQualityChange,
  className = '',
}: QualitySizeSliderProps) {
  const [quality, setQuality] = useState(defaultValue);

  // Estimate output size based on quality (simplified linear model)
  const estimatedSize = Math.round(originalSize * (quality / 100));
  
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const savings = originalSize - estimatedSize;
  const savingsPercent = Math.round((savings / originalSize) * 100);

  const handleChange = (value: number) => {
    setQuality(value);
    onQualityChange(value);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <EyeIcon className="w-5 h-5 text-text-secondary" />
          <span className="text-sm font-medium text-text-primary">Quality</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowsRightLeftIcon className="w-5 h-5 text-text-secondary" />
          <span className="text-sm font-medium text-text-primary">Size</span>
        </div>
      </div>

      {/* Slider */}
      <Slider
        value={quality}
        onChange={handleChange}
        min={minQuality}
        max={maxQuality}
        step={5}
        className="relative w-full h-8 flex items-center"
      >
        <Slider.Track className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          <Slider.Range className="absolute h-full bg-gradient-to-r from-primary to-accent-teal rounded-full" />
        </Slider.Track>
        <Slider.Thumb className="block w-6 h-6 bg-white border-2 border-primary rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
      </Slider>

      {/* Labels */}
      <div className="flex justify-between text-xs text-text-secondary">
        <span>Smaller Size</span>
        <span>Better Quality</span>
      </div>

      {/* Current Value Display */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-bg-surface rounded-lg border border-border-color">
          <p className="text-xs text-text-secondary uppercase tracking-wide">Quality</p>
          <p className="text-xl font-bold text-primary">{quality}%</p>
        </div>
        <div className="text-center p-3 bg-bg-surface rounded-lg border border-border-color">
          <p className="text-xs text-text-secondary uppercase tracking-wide">Est. Size</p>
          <p className="text-xl font-bold text-accent-teal">{formatSize(estimatedSize)}</p>
        </div>
      </div>

      {/* Savings Info */}
      {savings > 0 && (
        <div className="p-3 bg-accent-green bg-opacity-10 rounded-lg border border-accent-green border-opacity-20">
          <p className="text-sm text-center">
            <span className="font-semibold text-accent-green">Save {savingsPercent}%</span>
            <span className="text-text-secondary ml-2">
              ({formatSize(savings)} smaller)
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
