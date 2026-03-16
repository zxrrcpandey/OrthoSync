import React, { createContext, useContext, useMemo } from 'react';
import { useAppStore } from '../store';
import { THEMES, DEFAULT_THEME, ThemeColors, ThemeName, ThemeConfig } from './themes';

interface ThemeContextValue {
  theme: ThemeConfig;
  colors: ThemeColors;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEMES[DEFAULT_THEME],
  colors: THEMES[DEFAULT_THEME].colors,
  themeName: DEFAULT_THEME,
  setTheme: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeName = useAppStore((s) => s.themeName) || DEFAULT_THEME;
  const setThemeName = useAppStore((s) => s.setTheme);

  const value = useMemo<ThemeContextValue>(() => {
    const theme = THEMES[themeName] || THEMES[DEFAULT_THEME];
    const isDark = themeName !== 'light_green' && themeName !== 'glass_white';
    return {
      theme,
      colors: theme.colors,
      themeName,
      setTheme: setThemeName,
      isDark,
    };
  }, [themeName, setThemeName]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
