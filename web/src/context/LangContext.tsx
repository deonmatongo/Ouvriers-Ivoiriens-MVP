import { createContext, useContext, useState, type ReactNode } from 'react';
import { translations, type Locale, type TranslationKey } from '../lib/i18n';

interface LangContextType {
  locale: Locale;
  t: (key: TranslationKey) => string;
  toggle: () => void;
}

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(
    () => (localStorage.getItem('locale') as Locale) || 'fr'
  );

  const toggle = () => {
    const next: Locale = locale === 'fr' ? 'en' : 'fr';
    setLocale(next);
    localStorage.setItem('locale', next);
  };

  const t = (key: TranslationKey) => translations[locale][key];

  return (
    <LangContext.Provider value={{ locale, t, toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
