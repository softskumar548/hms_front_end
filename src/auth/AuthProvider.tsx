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

function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = new Uint8Array(length);
  window.crypto.getRandomValues(values);
  return Array.from(values).map(x => possible[x % possible.length]).join('');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(a: ArrayBuffer): string {
  const bytes = new Uint8Array(a);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function generateCodeChallengeFromVerifier(v: string): Promise<string> {
  const hashed = await sha256(v);
  return base64urlencode(hashed);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const getInitialToken = () => {
    return localStorage.getItem("hms_token");
  };

  const getInitialTenant = () => {
    return localStorage.getItem("hms_tenant");
  };

  const getInitialRole = () => {
    return localStorage.getItem("hms_role");
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
        const parsedTenant = claims["app"]?.["tenant_id"] || claims["app.tenant_id"] || claims["tenant_id"] || claims["tenant"] || "apollo";
        const roles = claims["roles"] || claims["realm_access"]?.roles || [];
        const knownRoles = ["doctor", "physician", "receptionist", "admin", "billing", "operator", "patient", "nurse"];
        const rolesList = Array.isArray(roles) ? roles : [];
        let parsedRole = rolesList.find((r: string) => knownRoles.includes(r)) || rolesList.find((r: string) => !r.startsWith("default-") && r !== "offline_access" && r !== "uma_authorization") || "receptionist";
        if (parsedRole === "doctor") parsedRole = "physician";
        setTenant(parsedTenant);
        setRole(parsedRole);
        localStorage.setItem("hms_tenant", parsedTenant);
        localStorage.setItem("hms_role", parsedRole);
      }
    }
  }, [token]);

  // Intercept PKCE callback logic when code parameter is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      const verifier = sessionStorage.getItem("pkce_verifier") || "";
      const redirectUri = window.location.origin + "/callback";
      const tokenUrl = `${OIDC_AUTHORITY}/protocol/openid-connect/token`;

      const body = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: OIDC_CLIENT_ID,
        code: code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      });

      fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      })
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            setToken(data.access_token);
            localStorage.setItem("hms_token", data.access_token);
            sessionStorage.removeItem("pkce_verifier");

            const claims = parseJwt(data.access_token);
            let targetPath = "/";
            if (claims) {
              const parsedTenant = claims["app"]?.["tenant_id"] || claims["app.tenant_id"] || claims["tenant_id"] || claims["tenant"] || "apollo";
              const roles = claims["roles"] || claims["realm_access"]?.roles || [];
              const knownRoles = ["doctor", "physician", "receptionist", "admin", "billing", "operator", "patient", "nurse"];
              const rolesList = Array.isArray(roles) ? roles : [];
              let parsedRole = rolesList.find((r: string) => knownRoles.includes(r)) || rolesList.find((r: string) => !r.startsWith("default-") && r !== "offline_access" && r !== "uma_authorization") || "receptionist";
              if (parsedRole === "doctor") parsedRole = "physician";
              setTenant(parsedTenant);
              setRole(parsedRole);
              localStorage.setItem("hms_tenant", parsedTenant);
              localStorage.setItem("hms_role", parsedRole);

              if (parsedRole === "operator") targetPath = "/operator/dashboard";
              else if (parsedRole === "receptionist") targetPath = "/queue";
              else if (parsedRole === "physician" || parsedRole === "nurse") targetPath = "/my-schedule";
              else if (parsedRole === "billing") targetPath = "/billing";
              else if (parsedRole === "admin") targetPath = "/dashboard";
              else if (parsedRole === "patient") targetPath = "/portal";
            }

            window.history.replaceState({}, document.title, targetPath);
            window.location.href = targetPath;
          }
        })
        .catch(err => console.error("PKCE Token Exchange Error:", err));
    }
  }, []);

  const login = (t: string, r: string) => {
    const tok = `dev.${t}.${r}`;
    setToken(tok);
    setTenant(t);
    setRole(r);
    localStorage.setItem("hms_token", tok);
    localStorage.setItem("hms_tenant", t);
    localStorage.setItem("hms_role", r);
    setSessionExpired(false);

    let targetPath = "/";
    if (r === "operator") targetPath = "/operator/dashboard";
    else if (r === "receptionist") targetPath = "/queue";
    else if (r === "physician" || r === "nurse" || r === "doctor") targetPath = "/my-schedule";
    else if (r === "billing") targetPath = "/billing";
    else if (r === "admin") targetPath = "/dashboard";
    else if (r === "patient") targetPath = "/portal";

    window.location.href = targetPath;
  };

  const loginWithOidc = async () => {
    const verifier = generateRandomString(64);
    sessionStorage.setItem("pkce_verifier", verifier);
    const challenge = await generateCodeChallengeFromVerifier(verifier);
    const redirectUri = window.location.origin + "/callback";
    const authUrl = `${OIDC_AUTHORITY}/protocol/openid-connect/auth?client_id=${OIDC_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email&code_challenge=${encodeURIComponent(challenge)}&code_challenge_method=S256`;
    window.location.href = authUrl;
  };
  
  const logout = React.useCallback(() => {
    const isOidc = token && !token.startsWith("dev.");
    setToken(null);
    setTenant(null);
    setRole(null);
    localStorage.removeItem("hms_token");
    localStorage.removeItem("hms_tenant");
    localStorage.removeItem("hms_role");

    if (isOidc) {
      const logoutUrl = `${OIDC_AUTHORITY}/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(window.location.origin + "/")}&client_id=${OIDC_CLIENT_ID}`;
      window.location.href = logoutUrl;
    } else {
      window.location.href = "/";
    }
  }, [token]);

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
