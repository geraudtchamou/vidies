/**
 * Mobile App Theme Configuration
 * React Native StyleSheet compatible theme tokens
 */

export const Colors = {
  // Core Palette
  primary: '#1F3B81',
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
  accentTeal: '#2EC4B6',
  accentOrange: '#F47321',
  accentGreen: '#22C55E',
  accentRed: '#EF4444',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  glassDark: 'rgba(31, 31, 31, 0.85)',
  glassLight: 'rgba(255, 255, 255, 0.85)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  glow: {
    shadowColor: Colors.accentTeal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
};

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 28,
    '2xl': 32,
    '3xl': 36,
    '4xl': 40,
  },
};

export type ThemeMode = 'light' | 'dark';

export interface AppTheme {
  mode: ThemeMode;
  colors: typeof Colors;
  spacing: typeof Spacing;
  radius: typeof Radius;
  shadows: typeof Shadows;
  typography: typeof Typography;
}

export const LightTheme: AppTheme = {
  mode: 'light',
  colors: {
    ...Colors,
    bg: Colors.bgLight,
    bgSurface: Colors.bgLightSurface,
    textPrimary: Colors.textPrimaryLight,
    textSecondary: Colors.textSecondaryLight,
    border: 'rgba(0, 0, 0, 0.1)',
  },
  spacing: Spacing,
  radius: Radius,
  shadows: Shadows,
  typography: Typography,
};

export const DarkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    ...Colors,
    bg: Colors.bgDark,
    bgSurface: Colors.bgDarkSurface,
    textPrimary: Colors.textPrimaryDark,
    textSecondary: Colors.textSecondaryDark,
    border: 'rgba(255, 255, 255, 0.1)',
  },
  spacing: Spacing,
  radius: Radius,
  shadows: Shadows,
  typography: Typography,
};
