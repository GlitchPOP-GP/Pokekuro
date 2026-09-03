import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { setToken } from "../api/client";
import { AuthUser, loginRequest, registerRequest } from "../api/auth";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const LOCAL_DEMO_USER: AuthUser = {
  id: "local-demo",
  email: "demo@pokekuro.app",
  user_name: "DEMO",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // デモ用途では認証画面を待たずにメイン画面を表示する。
  // API が起動している場合は、裏側でデモアカウントのトークンも取得する。
  const [user, setUser] = useState<AuthUser | null>(LOCAL_DEMO_USER);

  useEffect(() => {
    let active = true;
    loginRequest("demo@pokekuro.app", "demo1234")
      .then((demoUser) => {
        if (active) setUser(demoUser);
      })
      .catch(() => {
        // API が停止中でもローカルのデモ画面はそのまま利用できる。
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (email === "demo@pokekuro.app" && password === "demo1234") {
      setUser(LOCAL_DEMO_USER);
      loginRequest(email, password).then(setUser).catch(() => undefined);
      return;
    }
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

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, login, register, logout }}
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
