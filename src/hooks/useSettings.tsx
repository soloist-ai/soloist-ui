import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTelegram } from '../useTelegram';
import { gqlSdk } from '../graphql/client';

import { type Language } from '../locales';

interface Settings {
  language: Language;
  isManual: boolean;
}

const defaultSettings: Settings = {
  language: 'ru',
  isManual: false,
};

const STORAGE_KEY = 'app-settings';

// Утилитарная функция для получения языка из localStorage
export const getLanguageFromStorage = (): Language => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.language || defaultSettings.language;
    }
  } catch (error) {
    console.error('Failed to get language from storage:', error);
  }
  return defaultSettings.language;
};

type SettingsContextValue = {
  settings: Settings;
  isLoaded: boolean;
  localeLoaded: boolean;
  setLanguage: (language: Language) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  updateMultipleSettings: (newSettings: Settings) => void;
  setIsManual: (isManual: boolean) => void;
  setLocaleLoaded: (loaded: boolean) => void;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const [localeLoaded, setLocaleLoaded] = useState(false);
  const { user } = useTelegram();

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Apply current language once loaded (on initial mount or when language changes)
  useEffect(() => {
    if (isLoaded) {
      applyLanguage(settings.language);
    }
  }, [isLoaded, settings.language]);

  // Derive language from Telegram (or browser) when not manual
  useEffect(() => {
    if (!isLoaded) return;
    if (settings.isManual) return;
    const derived = deriveLanguageFromTelegram(user?.language_code);
    if (derived !== settings.language) {
      // Only update language, keep isManual as false
      setSettings(prev => {
        const updated = { ...prev, language: derived };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save settings:', error);
        }
        return updated;
      });
    }
  }, [isLoaded, settings.isManual, user?.language_code, settings.language]);

  const deriveLanguageFromTelegram = (code?: string): Language => {
    const raw = (code || (typeof navigator !== 'undefined' ? navigator.language : '')).toLowerCase();
    if (raw.startsWith('ru')) return 'ru';
    return 'en';
  };

  const applyLanguage = (language: Language) => {
    document.documentElement.lang = language;
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
      return updated;
    });
  };

  const setLanguage = (language: Language) => {
    // Manual selection sets isManual to true
    updateSettings({ language, isManual: true });
    // Persist user locale to backend (manual update)
    try {
      // Fire-and-forget; UI state remains responsive
      void gqlSdk.UpdateUserLocale({ locale: { tag: language, isManual: true } });
    } catch (error) {
      console.error('Failed to update user locale on backend:', error);
    }
  };

  const updateMultipleSettings = (newSettings: Settings) => {
    setSettings(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
      return newSettings;
    });
  };

  const setIsManual = (isManual: boolean) => {
    if (!isManual) {
      const derived = deriveLanguageFromTelegram(user?.language_code);
      updateSettings({ isManual: false, language: derived });
    } else {
      updateSettings({ isManual: true });
    }
  };

  const value: SettingsContextValue = {
    settings,
    isLoaded,
    localeLoaded,
    setLanguage,
    updateSettings,
    updateMultipleSettings,
    setIsManual,
    setLocaleLoaded,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextValue => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
};


