// e2e/referral-flow.spec.ts — Flagship Flow #1 (referral) against the LIVE stack.
// Precondition: docker compose up (Postgres+API healthy), VITE_USE_MOCKS=false,
// seeded demo tenants. Selectors below use data-testid — add the listed testids
// to screens if missing; do NOT loosen the assertions to make this pass.
import { test, expect } from "@playwright/test";

const PATIENT = { given: "E2E", family: `Referral${Date.now()}` };

test.describe.serial("Flagship #1 — referral: intake → prereq CT → blocked check-in → resolve → invoice → timeline", () => {
  test("dev login as receptionist (apollo)", async ({ page }) => {
    await page.goto("/");
    // Dev-stub login; replace with OIDC helper when N2 lands.
    await page.getByTestId("login-tenant").selectOption("apollo");
    await page.getByTestId("login-role").selectOption("receptionist");
    await page.getByTestId("login-continue").click();
    await expect(page.getByTestId("shell-tenant-indicator")).toContainText("apollo");
  });

  test("register a referred-in patient with referrer capture", async ({ page }) => {
    await page.goto("/patients/register");
    await page.getByTestId("reg-given").fill(PATIENT.given);
    await page.getByTestId("reg-family").fill(PATIENT.family);
    // Referrer capture (REF-012): quick-add a referring clinic doctor.
    await page.getByTestId("referrer-search").fill("E2E Clinic");
    await page.getByTestId("referrer-quick-add").click();
    await page.getByTestId("referrer-add-name").fill("Dr E2E Referrer");
    await page.getByTestId("referrer-add-type").selectOption("clinic_doctor");
    await page.getByTestId("referrer-add-save").click();
    await page.getByTestId("referral-reason").fill("CT scan — facility unavailable at clinic");
    await page.getByTestId("reg-save").click();
    await expect(page.getByTestId("toast")).toContainText(/registered|created/i);
    // No commission UI anywhere (India lock, AP-4):
    await expect(page.locator("text=/commission/i")).toHaveCount(0);
  });

  test("book CT with prerequisite checklist attached (REF-060)", async ({ page }) => {
    await page.goto("/scheduling/book");
    await page.getByTestId("book-patient-search").fill(PATIENT.family);
    await page.getByTestId("book-patient-result").first().click();
    await page.getByTestId("book-service").selectOption({ label: /CT/i });
    await page.getByTestId("book-slot").first().click();
    // Prereqs visible, structured, with hard-stop styling:
    await expect(page.getByTestId("prereq-item-hardstop").first()).toBeVisible();
    await page.getByTestId("book-confirm").click();
    await expect(page.getByTestId("medipass")).toBeVisible(); // signature moment
  });

  test("check-in is BLOCKED on unmet hard-stop, then resolves (REF-061)", async ({ page }) => {
    await page.goto("/scheduling/checkin");
    await page.getByTestId(`checkin-row-${PATIENT.family}`).click();
    await expect(page.getByTestId("checkin-blocked-panel")).toBeVisible();
    await expect(page.getByTestId("checkin-submit")).toBeDisabled();
    // Resolve the hard-stop via the API-backed action (not client-only):
    await page.getByTestId("prereq-resolve").first().click();
    await expect(page.getByTestId("checkin-submit")).toBeEnabled();
    await page.getByTestId("checkin-submit").click();
    await expect(page.getByTestId("queue-status")).toContainText(/arrived/i);
  });

  test("invoice generated with charges; Aarogyasri indicator renders truthfully", async ({ page }) => {
    await page.goto("/billing");
    await page.getByTestId("invoice-patient-search").fill(PATIENT.family);
    await page.getByTestId("invoice-open").first().click();
    await expect(page.getByTestId("invoice-line")).toHaveCount(1, { timeout: 15_000 });
    await expect(page.getByTestId("scheme-indicator")).toBeVisible(); // eligible OR ineligible-with-reason
    await page.getByTestId("invoice-finalize").click();
    await expect(page.getByTestId("toast")).toContainText(/finali[sz]ed/i);
  });

  test("referral timeline closes the loop (REF-064) with zero monetary info", async ({ page }) => {
    await page.goto(`/patients`);
    await page.getByTestId("patients-search").fill(PATIENT.family);
    await page.getByTestId("patient-row").first().click();
    await page.getByTestId("tab-referral-timeline").click();
    const timeline = page.getByTestId("referral-timeline");
    await expect(timeline).toContainText("Dr E2E Referrer");
    await expect(timeline).toContainText(/CT/i);
    await expect(timeline.locator("text=/₹|commission|payout/i")).toHaveCount(0);
  });
});
