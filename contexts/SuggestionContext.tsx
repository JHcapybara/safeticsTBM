import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { MOCK_CURRENT_USER_NAME, MOCK_SUGGESTIONS, type SuggestionItem } from '@/constants/suggestions';

type NewSuggestionInput = {
  title: string;
  preview: string;
};

type SuggestionContextValue = {
  suggestions: SuggestionItem[];
  currentUserName: string;
  addSuggestion: (input: NewSuggestionInput) => SuggestionItem;
};

const SuggestionContext = createContext<SuggestionContextValue | null>(null);

function getNowTicketNo(seq: number) {
  const now = new Date();
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}${m}${d}-${String(seq).padStart(3, '0')}`;
}

export function SuggestionProvider({ children }: { children: React.ReactNode }) {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(MOCK_SUGGESTIONS);

  const addSuggestion = useCallback((input: NewSuggestionInput): SuggestionItem => {
    const nextSeq = suggestions.length + 1;
    const newItem: SuggestionItem = {
      id: String(nextSeq),
      ticketNo: getNowTicketNo(nextSeq),
      title: input.title.trim(),
      preview: input.preview.trim(),
      author: MOCK_CURRENT_USER_NAME,
      timeLabel: '방금',
      siteLabel: '강남 사업장',
      status: 'pending',
      priority: 'normal',
      category: '건의',
      actionHistory: [],
    };
    setSuggestions((prev) => [newItem, ...prev]);
    return newItem;
  }, [suggestions.length]);

  const value = useMemo<SuggestionContextValue>(
    () => ({
      suggestions,
      currentUserName: MOCK_CURRENT_USER_NAME,
      addSuggestion,
    }),
    [suggestions, addSuggestion],
  );

  return <SuggestionContext.Provider value={value}>{children}</SuggestionContext.Provider>;
}

export function useSuggestions() {
  const ctx = useContext(SuggestionContext);
  if (!ctx) throw new Error('useSuggestions는 SuggestionProvider 안에서만 사용할 수 있습니다.');
  return ctx;
}

