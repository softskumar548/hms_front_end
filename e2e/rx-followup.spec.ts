// e2e/rx-followup.spec.ts — Flagship Flow #2 (prescription-driven follow-up)
// against the LIVE stack. Same preconditions as referral-flow.spec.ts.
import { test as baseTest, expect, Page } from "@playwright/test";

let sharedPage: Page;

const test = baseTest.extend<{ page: Page }>({
  page: async ({}, use) => {
    await use(sharedPage);
  },
});

test.beforeAll(async ({ browser }) => {
  sharedPage = await browser.newPage();
});

test.afterAll(async () => {
  await sharedPage.close();
});

const PATIENT = { family: `RxFlow${Date.now()}` };

import { loginViaOIDC } from "./helpers/oidc-auth";

test.describe.serial("Flagship #2 — encounter → Rx allergy alert override → next-visit DRAFT with prereqs", () => {
  test("login as physician via Keycloak OIDC helper and open a patient with a penicillin allergy", async ({ page }) => {
    await loginViaOIDC(page, "dr.smith@apollo.com", "Password123!", "apollo", "physician");
    // Use a seeded patient with a recorded penicillin allergy.
    await page.goto("/patients");
    await page.getByTestId("patients-search").fill("Penicillin");
    await page.getByTestId("patient-row").first().click();
    // Allergy banner is persistent (EMR-005):
    await expect(page.getByTestId("allergy-banner")).toContainText(/penicillin/i);
  });

  test("document encounter; diagnosis required before sign-off (EMR-008)", async ({ page }) => {
    await page.getByTestId("start-encounter").click();
    await page.getByTestId("note-section-subjective").fill("E2E: fever 3 days");
    await page.getByTestId("note-signoff").click();
    await expect(page.getByTestId("signoff-error")).toContainText(/diagnosis/i);
    await page.getByTestId("dx-search").fill("J06");
    await page.getByTestId("dx-option").first().click();
  });

  test("prescribe amoxicillin → HIGH severity allergy alert blocks until coded override (RX-003)", async ({ page }) => {
    await page.getByTestId("rx-open-composer").click();
    await page.getByTestId("rx-drug-search").fill("amoxicillin");
    await page.getByTestId("rx-drug-option").first().click();
    await page.getByTestId("rx-dose").fill("500");
    await page.getByTestId("rx-frequency").selectOption("TID");
    await page.getByTestId("rx-duration").fill("5");
    await page.getByTestId("rx-sign").click();
    // Blocked, not absolutely — override path must exist and demand a coded reason:
    const alert = page.getByTestId("rx-alert-danger");
    await expect(alert).toContainText(/allerg/i);
    await expect(page.getByTestId("rx-sign")).toBeDisabled();
    await page.getByTestId("rx-override-reason").selectOption({ index: 1 }); // coded reason
    await page.getByTestId("rx-override-confirm").click();
    await expect(page.getByTestId("rx-sign")).toBeEnabled();
  });

  test("next-visit panel creates DRAFT follow-up with structured prereqs (EMR-013/014, flag F1)", async ({ page }) => {
    await page.getByTestId("followup-interval-2w").click();
    await page.getByTestId("followup-reason").fill("Review response to antibiotics");
    await page.getByTestId("followup-prereq-search").fill("CBC");
    await page.getByTestId("followup-prereq-option").first().click();
    await page.getByTestId("note-signoff").click();
    await expect(page.getByTestId("toast").filter({ hasText: /signed/i })).toBeVisible();
    // DRAFT follow-up visible on the record (never auto-booked — F1):
    const fu = page.getByTestId("followup-card");
    await expect(fu).toContainText(/draft/i);
    await expect(fu).toContainText(/CBC/i);
  });

  test("signed note is immutable; edit becomes addendum (EMR-003)", async ({ page }) => {
    await expect(page.getByTestId("note-locked-badge")).toBeVisible();
    await expect(page.getByTestId("note-edit")).toHaveCount(0);
    await expect(page.getByTestId("note-add-addendum")).toBeVisible();
  });
});
