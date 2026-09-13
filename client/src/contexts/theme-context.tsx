'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setExplicitTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialDefaultTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const siteDefault = localStorage.getItem('site_default_theme');
    if (siteDefault === 'dark' || siteDefault === 'light') {
      return siteDefault;
    }
    const cached = localStorage.getItem('sapphire_site_content_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.settings?.defaultTheme === 'dark' || parsed?.settings?.defaultTheme === 'light') {
        return parsed.settings.defaultTheme;
      }
    }
  } catch (e) {
    // ignore
  }
  return 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Check initial preference
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const resolvedTheme = storedTheme || getInitialDefaultTheme();
    setTheme(resolvedTheme);
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }

    // Listen for default theme changes across tabs or from CMS
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'site_default_theme' && !localStorage.getItem('theme')) {
        const newDefault = (e.newValue === 'dark' ? 'dark' : 'light') as Theme;
        setTheme(newDefault);
        if (newDefault === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  const setExplicitTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setExplicitTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
