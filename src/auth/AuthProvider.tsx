/** AuthProvider — the UI twin of the backend's RequestContext.
 * DEV STUB: stores a `dev.<tenant>.<role>` bearer token in memory. When real
 * OIDC/Keycloak lands (IAM-001/006), replace the internals of this provider;
 * no screen should change, because screens only consume useAuth(). */
import React, { createContext, useContext, useState } from "react";

export interface AuthState {
  token: string | null;
  tenant: string | null;
  role: string | null;
  sessionExpired: boolean;
  setSessionExpired: (expired: boolean) => void;
  login: (tenant: string, role: string) => void;
  logout: () => void;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // In-memory only (no localStorage): a refresh logs out, which is fine for dev
  // and avoids token persistence questions until real OIDC arrives.
  const [token, setToken] = useState<string | null>(null);
  const [tenant, setTenant] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  const login = (t: string, r: string) => {
    setToken(`dev.${t}.${r}`);
    setTenant(t);
    setRole(r);
    setSessionExpired(false);
  };
  
  const logout = React.useCallback(() => {
    setToken(null);
    setTenant(null);
    setRole(null);
  }, []);

  React.useEffect(() => {
    const handle401 = () => {
      logout();
      setSessionExpired(true);
    };
    window.addEventListener("auth-401", handle401);
    return () => window.removeEventListener("auth-401", handle401);
  }, [logout]);

  return (
    <AuthCtx.Provider value={{ token, tenant, role, sessionExpired, setSessionExpired, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
