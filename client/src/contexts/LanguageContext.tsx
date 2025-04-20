import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/components/LanguageSelector';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  getLocalizedText: (key: string, texts: Record<Language, string>) => string;
}

const defaultLanguage: Language = 'ar-EG';

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  getLocalizedText: () => '',
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get from localStorage first
    const savedLanguage = localStorage.getItem('app-language');
    return (savedLanguage as Language) || defaultLanguage;
  });
  
  // Wrapper around setLanguage to ensure proper state update and localStorage save
  const handleSetLanguage = (lang: Language) => {
    console.log('Setting language to:', lang);
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  useEffect(() => {
    // Save to localStorage when language changes
    localStorage.setItem('app-language', language);
    
    // Update document direction
    document.documentElement.dir = language.startsWith('ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const getLocalizedText = (key: string, texts: Record<Language, string>) => {
    return texts[language] || texts[defaultLanguage] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, getLocalizedText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;