import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

export type ThemeMode = 'Light' | 'Dark' | 'System';
export type ResolvedTheme = 'Light' | 'Dark';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'crm-theme';
const SETTINGS_APPEARANCE_KEY = 'technokraft_crm_appearance';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'Light' || stored === 'Dark' || stored === 'System') {
        return stored;
      }
      // Check if Settings appearance key has a theme stored
      const settingsRaw = localStorage.getItem(SETTINGS_APPEARANCE_KEY);
      if (settingsRaw) {
        const parsed = JSON.parse(settingsRaw);
        if (parsed.theme === 'Light' || parsed.theme === 'Dark' || parsed.theme === 'System') {
          return parsed.theme;
        }
      }
    } catch {
      // Fallback
    }
    return 'Light'; // Default to Light as per user requirements
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Track system dark mode changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (theme === 'System') {
      return systemIsDark ? 'Dark' : 'Light';
    }
    return theme;
  }, [theme, systemIsDark]);

  // Apply or remove .dark class from <html> root and sync attribute
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'Dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, [resolvedTheme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
      // Also sync with technokraft_crm_appearance if present
      const settingsRaw = localStorage.getItem(SETTINGS_APPEARANCE_KEY);
      if (settingsRaw) {
        const parsed = JSON.parse(settingsRaw);
        parsed.theme = mode;
        localStorage.setItem(SETTINGS_APPEARANCE_KEY, JSON.stringify(parsed));
      }
    } catch (e) {
      console.error('Failed to save theme in localStorage', e);
    }
  };

  const toggleTheme = () => {
    if (resolvedTheme === 'Dark') {
      setTheme('Light');
    } else {
      setTheme('Dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
