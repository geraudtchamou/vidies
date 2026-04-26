import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  colors: any;
  spacing: any;
  radius: any;
  shadows: any;
  typography: any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark'); // Default to dark mode

  useEffect(() => {
    // Try to load saved theme preference
    const loadTheme = async () => {
      try {
        // In a real app, you'd use AsyncStorage here
        if (systemColorScheme === 'dark') {
          setModeState('dark');
        } else {
          setModeState('light');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    
    loadTheme();
  }, [systemColorScheme]);

  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  // Import theme values
  const { Colors, Spacing, Radius, Shadows, Typography, DarkTheme, LightTheme } = require('../theme');
  
  const theme = mode === 'dark' ? DarkTheme : LightTheme;
  
  const value = {
    mode,
    toggleMode,
    setMode,
    isDark: mode === 'dark',
    colors: theme.colors,
    spacing: theme.spacing,
    radius: theme.radius,
    shadows: theme.shadows,
    typography: theme.typography,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
