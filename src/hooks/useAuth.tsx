import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type AuthUser } from "@/lib/db";
import { getSessionUser, saveSession, clearSession, loginUser, registerUser } from "@/lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessionUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

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

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
