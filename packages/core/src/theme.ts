/**
 * Cross-Platform Design System Tokens
 * Shared between Web (Tailwind config) and Mobile (StyleSheet/Theme)
 */

export const Colors = {
  // Core Palette
  primary: '#1F3B81', // Deep Blue
  primaryLight: '#3B59A8',
  primaryDark: '#162A5C',
  
  // Backgrounds
  bgLight: '#F5F5F5',
  bgDark: '#111111',
  bgDarkSurface: '#1F1F1F',
  bgLightSurface: '#FFFFFF',
  
  // Text
  textPrimaryLight: '#222222',
  textSecondaryLight: '#666666',
  textPrimaryDark: '#E0E0E0',
  textSecondaryDark: '#999999',
  
  // Accents
  accentTeal: '#2EC4B6', // Progress/Quality
  accentOrange: '#F47321', // Danger/Warning
  accentGreen: '#22C55E', // Success
  accentRed: '#EF4444', // Error
  
  // Glassmorphism
  glassDark: 'rgba(31, 31, 31, 0.7)',
  glassLight: 'rgba(255, 255, 255, 0.7)',
  borderDark: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(0, 0, 0, 0.1)',
};

export const Typography = {
  fontFamily: {
    base: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  sizes: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const Spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
};

export const Radius = {
  sm: '0.375rem', // 6px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  full: '9999px',
};

export const Shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  glow: '0 0 15px rgba(46, 196, 182, 0.3)', // Teal glow
};

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  colors: typeof Colors;
  isDark: boolean;
}
