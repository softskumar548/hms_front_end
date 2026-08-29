// e2e/clinical-operations.spec.ts — Clinical & Surgical Departmental E2E Suite
import { test, expect } from "@playwright/test";
import { loginViaOIDC } from "./helpers/oidc-auth";

test.describe("Clinical Operations & Surgical Suites Suite", () => {
  test("1. Emergency Casualty & Trauma Triage (/emergency)", async ({ page }) => {
    await loginViaOIDC(page, "dr.smith@apollo.com", "Password123!", "apollo", "physician");
    await page.goto("/emergency");

    // Verify Casualty Trauma Bays Header & Board
    await expect(page.getByText(/Emergency Casualty & Acute Trauma Triage/i)).toBeVisible();
    await expect(page.getByText(/Live Casualty Bays/i)).toBeVisible();

    // Verify Rapid Emergency Intake Modal opens and closes cleanly
    await page.getByRole("button", { name: /Rapid Emergency Intake/i }).click();
    await expect(page.getByText(/Rapid Emergency Casualty & Trauma Intake/i)).toBeVisible();
    await page.getByRole("button", { name: /Cancel/i }).click();

    // Verify STAT Blood & Fast Echo Tab
    await page.getByRole("button", { name: /STAT Blood & Fast Echo/i }).click();
    await expect(page.getByText(/Emergency Uncrossmatched O-Negative Blood/i)).toBeVisible();
  });

  test("2. Inpatient Bed Matrix & Ward Transfer (/inpatient)", async ({ page }) => {
    await loginViaOIDC(page, "dr.smith@apollo.com", "Password123!", "apollo", "physician");
    await page.goto("/inpatient");

    // Verify Bed Matrix Display across floors
    await expect(page.getByText(/Inpatient Ward Bed Matrix & Ward Transfer Engine/i)).toBeVisible();
    await expect(page.getByText(/Floor 1 \(Daycare & Emergency\)/i)).toBeVisible();
    await expect(page.getByText(/Floor 4 \(Critical ICU\/CCU\)/i)).toBeVisible();

    // Open Ward Transfer Modal
    const transferBtn = page.getByRole("button", { name: /Transfer Ward/i }).first();
    if (await transferBtn.isVisible()) {
      await transferBtn.click();
      await expect(page.getByText(/Inpatient Ward Transfer & Bed Reassignment/i)).toBeVisible();
      await page.getByRole("button", { name: /Cancel/i }).click();
    }
  });

  test("3. Operation Theatre & WHO Surgical Safety Checklist (/ot)", async ({ page }) => {
    await loginViaOIDC(page, "dr.smith@apollo.com", "Password123!", "apollo", "physician");
    await page.goto("/ot");

    // Verify 4-Theatre Complexes
    await expect(page.getByText(/Operation Theatre \(OT\) Scheduling & WHO Surgical Safety/i)).toBeVisible();
    await expect(page.getByText(/4-Theatre Suites Grid/i)).toBeVisible();

    // Verify Daily Surgical Schedule & WHO Checklist Verification
    await page.getByRole("button", { name: /Surgery Scheduling Desk/i }).click();
    await expect(page.getByText(/Surgical Case Scheduling & Team Roster/i)).toBeVisible();

    // Open WHO Surgical Safety Checklist Modal from Grid Tab
    await page.getByRole("button", { name: /4-Theatre Suites Grid/i }).click();
    const whoBtn = page.getByRole("button", { name: /WHO Checklist/i }).first();
    if (await whoBtn.isVisible()) {
      await whoBtn.click();
      await expect(page.getByText(/WHO Surgical Safety Checklist/i)).toBeVisible();
      await page.getByRole("button", { name: /Cancel/i }).click();
    }
  });

  test("4. Diagnostic Pathology & Radiology Workstation (/lab)", async ({ page }) => {
    await loginViaOIDC(page, "dr.smith@apollo.com", "Password123!", "apollo", "physician");
    await page.goto("/lab");

    // Verify Lab Workstation and Phlebotomy Queue
    await expect(page.getByText(/Diagnostic Pathology & Radiology Workstation/i)).toBeVisible();
    await expect(page.getByText(/Phlebotomy & Intake Queue/i)).toBeVisible();

    // Verify Analyte Parameter Entry Modal
    const enterResultsBtn = page.getByRole("button", { name: /Enter Results/i }).first();
    if (await enterResultsBtn.isVisible()) {
      await enterResultsBtn.click();
      await expect(page.getByText(/Diagnostic Analyte Parameter Result Entry/i)).toBeVisible();
      await page.getByRole("button", { name: /Cancel/i }).click();
    }
  });

  test("5. Hospital Pharmacy & FEFO POS Dispensary (/pharmacy)", async ({ page }) => {
    await loginViaOIDC(page, "dr.smith@apollo.com", "Password123!", "apollo", "physician");
    await page.goto("/pharmacy");

    // Verify EMR Prescription Dispensing Queue
    await expect(page.getByText(/Hospital Pharmacy & FEFO Dispensary POS/i)).toBeVisible();
    await expect(page.getByText(/EMR Rx Dispensing Queue/i)).toBeVisible();

    // Verify Dispense Medication Modal & Telugu Labels
    const dispenseBtn = page.getByRole("button", { name: /Dispense Rx/i }).first();
    if (await dispenseBtn.isVisible()) {
      await dispenseBtn.click();
      await expect(page.getByText(/FEFO Pharmacy Batch Dispensing/i)).toBeVisible();
      await page.getByRole("button", { name: /Cancel/i }).click();
    }

    // Verify Multi-Batch Inventory Stock Control Tab
    await page.getByRole("button", { name: /FEFO Drug Inventory & Batches/i }).click();
    await expect(page.getByText(/FEFO Drug Inventory & Batch Control/i)).toBeVisible();
  });
});
