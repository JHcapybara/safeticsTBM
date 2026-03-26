import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import {
  catalog,
  SupportedLang,
  Strings,
} from '@/lang';

type LangContextValue = {
  lang: SupportedLang;
  s: Strings;
  setLang: (lang: SupportedLang) => void;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<SupportedLang>('ko');

  const setLang = useCallback((next: SupportedLang) => {
    setLangState(next);
  }, []);

  const value = useMemo<LangContextValue>(
    () => ({ lang, s: catalog[lang], setLang }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error('useLang는 LangProvider 안에서만 사용할 수 있습니다.');
  }
  return ctx;
}
