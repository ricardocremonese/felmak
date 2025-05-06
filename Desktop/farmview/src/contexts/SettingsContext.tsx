
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'en' | 'pt-BR';

interface SettingsContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(
    (localStorage.getItem('language') as Language) || 'en'
  );

  // Get i18n instance
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set initial language
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  }, [i18n, language]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguage,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
