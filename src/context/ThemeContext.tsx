import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemeColors {
  primary: string;
  background: string;
  cardBg: string;
  text: string;
  secondaryText: string;
  borderColor: string;
}

const lightThemeColors: ThemeColors = {
  primary: '#006591',
  background: '#f4faff',
  cardBg: 'rgba(255, 255, 255, 0.85)',
  text: '#141d21',
  secondaryText: '#3e4850',
  borderColor: '#e0f2fe',
};

const darkThemeColors: ThemeColors = {
  primary: '#38bdf8',
  background: '#0b1319',
  cardBg: 'rgba(15, 23, 42, 0.85)',
  text: '#f8fafc',
  secondaryText: '#94a3b8',
  borderColor: '#1e293b',
};

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (enabled: boolean) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ragga_theme_dark');
    if (saved !== null) {
      return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('ragga_theme_dark', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const setDarkMode = (enabled: boolean) => {
    setIsDarkMode(enabled);
  };

  const colors = isDarkMode ? darkThemeColors : lightThemeColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setDarkMode, colors }}>
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
