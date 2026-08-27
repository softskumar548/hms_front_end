import { test, expect } from "@playwright/test";
import { loginViaOIDC } from "./helpers/oidc-auth";

test.describe("Operator Tenant Onboarding Pipeline (TEN-101 / TEN-301)", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as platform operator
    await loginViaOIDC(page, "operator@zensynq.com", "Password123!", "apollo", "operator");
  });

  test("validates required fields, highlights errors, and provisions tenant to Stage 2 handover certificate", async ({ page }) => {
    await page.goto("/onboarding");

    // 1. Verify Header & Initial Stage 1 State
    await expect(page.locator("h1")).toContainText("Provision Organization & Assign Tenant Admin");
    await expect(page.locator("text=STAGE 01")).toBeVisible();

    // 2. Submit empty form to trigger validation errors & auto-scroll engine
    const submitBtn = page.getByRole("button", { name: /⚡ Provision Organization & Issue Admin Access/i });
    await submitBtn.click();

    // Verify error banner is visible
    await expect(page.locator("text=Form Submission Incomplete")).toBeVisible();
    await expect(page.locator("#field-orgName")).toContainText("Organization Full Name is required");

    // 3. Fill in Organization Profile & verify dynamic slug generation
    const uniqueSlug = `e2ehospital${Date.now().toString().slice(-4)}`;
    const orgInput = page.locator("#field-orgName input");
    await orgInput.fill("E2E Multi Specialty Hospital");

    // Slug should auto-generate
    const slugInput = page.locator("#field-tenantId input");
    await slugInput.fill(uniqueSlug);
    await expect(page.locator("text=● Available")).toBeVisible();

    // 4. Fill in Physical Facility Address & Telephony
    await page.locator("input[placeholder*='D.No']").fill("D.No 4-50/12, Health City");
    await page.locator("#field-addressLine1 input").fill("Arilova Main Road");
    await page.locator("#field-city input").fill("Visakhapatnam");
    await page.locator("#field-pinCode input").fill("530040");

    // 5. Fill in Primary Contact Details with Designation and Aadhaar
    await page.locator("#field-primName input").fill("Dr. Rajesh Varma");
    await page.locator("#field-primAadhaar input").fill("5489 1234 5678");
    await page.locator("#field-primPhone input").fill("9876543210");
    await page.locator("#field-primEmail input").fill(`admin@${uniqueSlug}.com`);

    // 6. Autofill Signatory from Primary Contact
    const autofillPrimaryBtn = page.getByRole("button", { name: "Autofill Primary" });
    await autofillPrimaryBtn.click();
    await expect(page.locator("#field-sigName input")).toHaveValue("Dr. Rajesh Varma");

    // 7. Submit valid form
    await submitBtn.click();

    // 8. Verify Stage 2 Handover Certificate is rendered
    await expect(page.locator("text=STAGE 02")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("text=Tenant Provisioned & Admin Issued")).toBeVisible();
    await expect(page.locator("text=PORTAL URL")).toBeVisible();
    await expect(page.locator("text=INITIAL TEMPORARY PASSCODE")).toBeVisible();

    // 9. Verify copy credentials action
    const copyBtn = page.getByRole("button", { name: /Copy Credentials/i });
    await expect(copyBtn).toBeVisible();
  });
});
