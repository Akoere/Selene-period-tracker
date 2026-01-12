import { createContext, useContext, useState, useEffect } from 'react';

// Define available themes
export const themes = {
  light: {
    id: 'light',
    name: 'Light',
    colors: {
      primary: '#3b82f6',
      background: '#f3f4f6', // Light Gray BG
      foreground: '#111827', // Black Text
      card: '#ffffff',       // White Cards
      cardBorder: 'transparent',
      gradient: 'from-blue-400 to-cyan-400',
    },
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#818cf8',
      background: '#0f172a', // Dark Navy BG
      foreground: '#f8fafc', // White Text
      card: '#1e293b',       // <--- DARK GRAY CARDS (Fixes the white box issue)
      cardBorder: '#334155', 
      gradient: 'from-indigo-500 to-purple-500',
    },
  },
  pink: {
    id: 'pink',
    name: 'Pink',
    colors: {
      primary: '#ec4899',
      background: '#fce7f3', // Pink BG
      foreground: '#1f2937',
      card: '#ffffff',       // White Cards
      cardBorder: 'transparent',
      gradient: 'from-pink-400 to-purple-400',
    },
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    colors: {
      primary: '#a855f7',
      background: '#f3e8ff', // Lavender BG
      foreground: '#1f2937',
      card: '#ffffff',       // White Cards
      cardBorder: 'transparent',
      gradient: 'from-purple-400 to-violet-400',
    },
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    const saved = localStorage.getItem('luna-theme');
    return themes[saved] ? saved : 'pink';
  });

  const currentTheme = themes[themeId] || themes.pink;

  useEffect(() => {
    localStorage.setItem('luna-theme', themeId);
    
    const root = document.documentElement;
    const colors = currentTheme.colors;

    // Set Variables
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', colors.foreground);
    root.style.setProperty('--card-bg', colors.card);
    root.style.setProperty('--card-border', colors.cardBorder);

    // Force Body Background
    document.body.style.backgroundColor = colors.background;
    document.body.style.color = colors.foreground;
    document.body.style.transition = 'background-color 0.3s ease'; 

  }, [themeId, currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme: setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}