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
  const getInitialToken = () => {
    const saved = localStorage.getItem("hms_token");
    if (saved) return saved;
    const path = window.location.pathname;
    if (path === "/" || path === "/login") return null;
    return path.includes("/emr") ? "dev.apollo.physician" : "dev.apollo.receptionist";
  };

  const getInitialTenant = () => {
    const saved = localStorage.getItem("hms_tenant");
    if (saved) return saved;
    const path = window.location.pathname;
    if (path === "/" || path === "/login") return null;
    return "apollo";
  };

  const getInitialRole = () => {
    const saved = localStorage.getItem("hms_role");
    if (saved) return saved;
    const path = window.location.pathname;
    if (path === "/" || path === "/login") return null;
    return path.includes("/emr") ? "physician" : "receptionist";
  };

  const [token, setToken] = useState<string | null>(getInitialToken);
  const [tenant, setTenant] = useState<string | null>(getInitialTenant);
  const [role, setRole] = useState<string | null>(getInitialRole);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  const login = (t: string, r: string) => {
    const tok = `dev.${t}.${r}`;
    setToken(tok);
    setTenant(t);
    setRole(r);
    localStorage.setItem("hms_token", tok);
    localStorage.setItem("hms_tenant", t);
    localStorage.setItem("hms_role", r);
    setSessionExpired(false);
  };
  
  const logout = React.useCallback(() => {
    setToken(null);
    setTenant(null);
    setRole(null);
    localStorage.removeItem("hms_token");
    localStorage.removeItem("hms_tenant");
    localStorage.removeItem("hms_role");
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
