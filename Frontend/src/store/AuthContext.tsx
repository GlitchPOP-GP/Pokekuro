import React, { createContext, useCallback, useContext, useState } from "react";
import { setToken } from "../api/client";
import { AuthUser, loginRequest, registerRequest } from "../api/auth";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userName: string) => Promise<void>;
  logout: () => void;
  // TODO: 認証UI未実装のための暫定。デモアカウントで実ログインして次画面へ進む。
  bypassLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const u = await loginRequest(email, password);
    setUser(u);
  }, []);

  const register = useCallback(
    async (email: string, password: string, userName: string) => {
      const u = await registerRequest(email, password, userName);
      setUser(u);
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // 暫定: デモアカウント（DBにシード済み）で実ログインする。
  // 実トークンが得られるので、クローゼット等の認証必須APIも読める。
  // API に繋がらない場合はゲストで画面遷移だけ通す（データは空）。
  const bypassLogin = useCallback(async () => {
    try {
      const u = await loginRequest("demo@pokekuro.app", "demo1234");
      setUser(u);
    } catch {
      setUser({ id: "guest", email: "guest@example.com" });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, login, register, logout, bypassLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
