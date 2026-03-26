import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { validateTestCredentials } from '@/constants/testAuth';

type AuthContextValue = {
  isLoggedIn: boolean;
  /** 아이디·비밀번호 검증 성공 시 true */
  login: (userId: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = useCallback((userId: string, password: string): boolean => {
    if (!validateTestCredentials(userId, password)) {
      return false;
    }
    setIsLoggedIn(true);
    return true;
  }, []);

  /**
   * TODO(로그인/로그아웃): 전체 플로우 재검토 예정.
   * 현재 증상: 로그아웃 시 흰 화면만 뜨거나 멈춤 등 — Expo Router + Redirect + Modal 조합 이슈 가능.
   */
  const logout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ isLoggedIn, login, logout }),
    [isLoggedIn, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다.');
  }
  return ctx;
}
