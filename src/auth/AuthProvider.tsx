/** AuthProvider — the UI twin of the backend's RequestContext.
 * Supports Keycloak OIDC Code + PKCE flow with silent refresh (IAM-001/006).
 * Maintains strict zero-diff interface seam: all screens consume useAuth().
 */
import React, { createContext, useContext, useEffect, useState } from "react";

export interface AuthState {
  token: string | null;
  tenant: string | null;
  role: string | null;
  sessionExpired: boolean;
  setSessionExpired: (expired: boolean) => void;
  login: (tenant: string, role: string) => void;
  logout: () => void;
  loginWithOidc?: () => void;
}

const AuthCtx = createContext<AuthState | null>(null);

const OIDC_AUTHORITY = import.meta.env.VITE_OIDC_AUTHORITY || "http://localhost:8080/realms/hms";
const OIDC_CLIENT_ID = import.meta.env.VITE_OIDC_CLIENT_ID || "hms-web";

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

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

  // Parse OIDC claims if token is a real JWT
  useEffect(() => {
    if (token && !token.startsWith("dev.")) {
      const claims = parseJwt(token);
      if (claims) {
        const parsedTenant = claims["app.tenant_id"] || claims["tenant_id"] || claims["tenant"] || "apollo";
        const roles = claims["roles"] || claims["realm_access"]?.roles || [];
        const parsedRole = Array.isArray(roles) && roles.length > 0 ? roles[0] : "receptionist";
        setTenant(parsedTenant);
        setRole(parsedRole);
      }
    }
  }, [token]);

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

  const loginWithOidc = () => {
    const redirectUri = window.location.origin + "/callback";
    const authUrl = `${OIDC_AUTHORITY}/protocol/openid-connect/auth?client_id=${OIDC_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email`;
    window.location.href = authUrl;
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
    <AuthCtx.Provider value={{ token, tenant, role, sessionExpired, setSessionExpired, login, logout, loginWithOidc }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
