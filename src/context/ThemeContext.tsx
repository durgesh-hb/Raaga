import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  background: string;
  cardBg: string;
  elevatedBg: string;
  text: string;
  secondaryText: string;
  borderColor: string;
}

const brandThemeColors: ThemeColors = {
  primary: '#1DB954',
  primaryHover: '#1ED760',
  background: '#121212',
  cardBg: '#181818',
  elevatedBg: '#282828',
  text: '#FFFFFF',
  secondaryText: '#B3B3B3',
  borderColor: '#282828',
};

const lightThemeColors: ThemeColors = brandThemeColors;
const darkThemeColors: ThemeColors = brandThemeColors;

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
    return true;
  });

  useEffect(() => {
    localStorage.setItem('ragga_theme_dark', String(isDarkMode));
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
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
