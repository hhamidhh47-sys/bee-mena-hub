import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type AuthUser } from "@/lib/db";
import { getSessionUser, saveSession, clearSession, loginUser, registerUser } from "@/lib/auth";
import { isAuthEnabled, setAuthEnabled } from "@/lib/authConfig";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  authEnabled: boolean;
  setAuthRequired: (enabled: boolean) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authEnabled, setAuthEnabledState] = useState(() => isAuthEnabled());

  useEffect(() => {
    if (authEnabled) {
      getSessionUser().then((u) => {
        setUser(u);
        setLoading(false);
      });
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [authEnabled]);

  const login = async (username: string, password: string) => {
    const u = await loginUser(username, password);
    saveSession(u.id!);
    setUser(u);
  };

  const register = async (username: string, password: string, displayName: string) => {
    const u = await registerUser(username, password, displayName);
    saveSession(u.id!);
    setUser(u);
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const setAuthRequired = useCallback((enabled: boolean) => {
    setAuthEnabled(enabled);
    setAuthEnabledState(enabled);
    if (!enabled) {
      clearSession();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, authEnabled, setAuthRequired, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
