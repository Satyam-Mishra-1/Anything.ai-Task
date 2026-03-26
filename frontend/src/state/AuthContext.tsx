import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearToken, getToken, setToken } from "../lib/token";
import { me } from "../lib/api";

export type AuthUser = { id: string; email: string; role: "USER" | "ADMIN" };

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshUser = async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    setLoading(true);
    try {
      const res = await me();
      const role = res.user.role === "ADMIN" ? "ADMIN" : "USER";
      setUser({ id: res.user.id, email: res.user.email, role });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Refresh user on first load if token exists.
    if (token) {
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loginWithToken = async (jwt: string) => {
    setToken(jwt);
    setTokenState(jwt);
    await refreshUser();
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, loading, loginWithToken, logout, refreshUser }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

