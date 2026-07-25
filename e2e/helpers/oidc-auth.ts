import { Page } from "@playwright/test";

const KEYCLOAK_TOKEN_URL = process.env.VITE_OIDC_AUTHORITY
  ? `${process.env.VITE_OIDC_AUTHORITY}/protocol/openid-connect/token`
  : "http://127.0.0.1:8080/realms/hms/protocol/openid-connect/token";

export async function loginViaOIDC(
  page: Page,
  username = "dr.smith@apollo.com",
  password = "Password123!",
  tenant = "apollo",
  role = "physician"
): Promise<string> {
  const params = new URLSearchParams({
    grant_type: "password",
    client_id: "hms-web",
    username: username,
    password: password,
  });

  let token = `dev.${tenant}.${role}`;
  try {
    const response = await fetch("http://127.0.0.1:8080/realms/hms/protocol/openid-connect/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    if (response.ok) {
      const data = await response.json();
      token = data.access_token;
    } else {
      console.warn("Keycloak OIDC fetch failed:", response.status, await response.text());
    }
  } catch (err) {
    console.warn("Keycloak OIDC login helper error:", err);
  }

  await page.addInitScript(
    ({ token, tenant, role }) => {
      localStorage.setItem("hms_token", token);
      localStorage.setItem("hms_tenant", tenant);
      localStorage.setItem("hms_role", role);
    },
    { token, tenant, role }
  );

  return token;
}
