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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(KEYCLOAK_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      token = data.access_token;
    }
  } catch (_err) {
    console.log(`[OIDC Helper] Keycloak unreachable at ${KEYCLOAK_TOKEN_URL}; using fallback dev token '${token}'`);
  }

  await page.goto("/");
  await page.evaluate(
    ({ token, tenant, role }) => {
      localStorage.setItem("hms_token", token);
      localStorage.setItem("hms_tenant", tenant);
      localStorage.setItem("hms_role", role);
    },
    { token, tenant, role }
  );
  await page.reload();

  return token;
}
