import { test, expect } from "@playwright/test";
import { loginViaOIDC } from "./helpers/oidc-auth";

test.describe("Track E-E2E — Keycloak OIDC Authentication Helper Verification", () => {
  test("programmatically acquires real Keycloak JWT and authenticates user for apollo", async ({ page }) => {
    const token = await loginViaOIDC(page, "dr.smith@apollo.com", "Password123!", "apollo", "physician");
    
    // Assert real OIDC token starts with header 'eyJ' (RS256 JWT)
    expect(token).toMatch(/^eyJ/);
    
    // Navigate to /patients and verify authenticated shell session
    await page.goto("/patients");
    await expect(page.getByTestId("shell-tenant-indicator")).toContainText("apollo");
  });

  test("programmatically acquires real Keycloak JWT for platform operator", async ({ page }) => {
    const token = await loginViaOIDC(page, "operator@zensynq.com", "Password123!", "apollo", "operator");
    
    expect(token).toMatch(/^eyJ/);
  });
});
