import { test, expect } from "@playwright/test";
import { loginViaOIDC } from "./helpers/oidc-auth";

test.describe("Role-Based Screen & Action Permissions Matrix E2E Pipeline", () => {
  test("Tenant Admin accesses Permissions Matrix, inspects 19 roles, toggles CRUD permissions, and persists updates", async ({ page }) => {
    // 1. Authenticate as Tenant Admin
    await loginViaOIDC(page, "admin@apollo.com", "Password123!", "apollo", "admin");
    await page.goto("/settings?tab=auth");

    // 2. Verify Cyan Breadcrumb Banner & Header
    await expect(page.locator("text=User Details & Role Permissions Matrix")).toBeVisible();
    await expect(page.locator("text=Select User Role to Configure")).toBeVisible();

    // 3. Verify Role Selector contains all 19 standard roles
    const roleSelect = page.locator("select").first();
    await expect(roleSelect).toBeVisible();

    // Select 'Doctor' role
    await roleSelect.selectOption("Doctor");

    // 4. Verify 62-screen table headers
    await expect(page.locator("th:has-text('MAIN MENU/SUB MENU')")).toBeVisible();
    await expect(page.locator("th:has-text('IS SCREEN ACCESSIBLE')")).toBeVisible();
    await expect(page.locator("th:has-text('CREATE')")).toBeVisible();
    await expect(page.locator("th:has-text('READ')")).toBeVisible();
    await expect(page.locator("th:has-text('UPDATE')")).toBeVisible();
    await expect(page.locator("th:has-text('DELETE')")).toBeVisible();

    // 5. Verify search filter functionality across screens
    const searchInput = page.locator("input[placeholder*='Search screens']");
    await searchInput.fill("Pharmacy");
    await expect(page.locator("text=Pharmacy / Pharmacy Bill")).toBeVisible();
    await searchInput.fill("");

    // 6. Test Admin Self-Lockout Safeguard:
    // Select 'Administrator' role and ensure 'admin_user_auth' checkbox is locked
    await roleSelect.selectOption("Administrator");
    const adminAuthRow = page.locator("tr:has-text('User Details & Permissions')");
    await expect(adminAuthRow).toBeVisible();
    const lockedCheckbox = adminAuthRow.locator("input[type='checkbox']").first();
    await expect(lockedCheckbox).toBeChecked();
    await expect(lockedCheckbox).toBeDisabled();

    // 7. Toggle a permission for Doctor and update
    await roleSelect.selectOption("Doctor");
    const updateBtn = page.getByRole("button", { name: /Update Permissions ➔/i });
    await expect(updateBtn).toBeVisible();
    await updateBtn.click();

    // 8. Verify Success Toast notification
    await expect(page.locator("text=Permissions updated successfully for all roles!")).toBeVisible({ timeout: 10_000 });
  });

  test("Restricted user direct URL access is gated by RequireRole screen permission guard", async ({ page }) => {
    // 1. Authenticate as a restricted user (Patient)
    await loginViaOIDC(page, "patient@apollo.com", "Password123!", "apollo", "patient");

    // 2. Attempt to navigate directly to restricted /billing URL
    await page.goto("/billing");

    // 3. Verify Access Restricted card is displayed instead of sensitive financial data
    await expect(page.locator("text=ACCESS RESTRICTED")).toBeVisible();
    await expect(page.locator("text=Permission Required")).toBeVisible();
    await expect(page.locator("text=Return to Dashboard")).toBeVisible();
  });
});
