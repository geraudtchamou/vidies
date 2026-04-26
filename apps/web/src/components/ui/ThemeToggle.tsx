'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export function ThemeToggle() {
  const { mode, toggleMode, isDark } = useTheme();

  return (
    <button
      onClick={toggleMode}
      className="relative inline-flex items-center justify-center p-2 rounded-lg bg-bg-surface border border-border-color hover:bg-opacity-80 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-6 h-6">
        <SunIcon
          className={`absolute inset-0 w-6 h-6 text-accent-orange transition-all duration-300 transform ${
            isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        <MoonIcon
          className={`absolute inset-0 w-6 h-6 text-primary transition-all duration-300 transform ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
          }`}
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
