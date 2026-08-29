// e2e/specialized-departments.spec.ts — Specialized Departmental & Administrative E2E Suite
import { test, expect } from "@playwright/test";
import { loginViaOIDC } from "./helpers/oidc-auth";

test.describe("Specialized Departments & Administration Suite", () => {
  test("1. Hospital HR & Automated Payroll Engine (/hr)", async ({ page }) => {
    await loginViaOIDC(page, "dr.smith@apollo.com", "Password123!", "apollo", "physician");
    await page.goto("/hr");

    // Verify HR Directory and Statutory Compliance
    await expect(page.getByText(/Hospital Human Resources \(HR\) & Automated Payroll Engine/i)).toBeVisible();
    await expect(page.getByText(/Total Active Staff/i)).toBeVisible();

    // Verify Monthly Payroll Run Tab
    await page.getByRole("button", { name: /Monthly Payroll Run/i }).click();
    await expect(page.getByText(/Payroll Month:/i)).toBeVisible();

    // Verify Attendance & Duty Rostering Tab
    await page.getByRole("button", { name: /Attendance & Leave Desk/i }).click();
    await expect(page.getByText(/Pending Staff Leave Applications/i)).toBeVisible();
  });

  test("2. Telehealth WebRTC Video Consultations (/telehealth)", async ({ page }) => {
    await loginViaOIDC(page, "dr.smith@apollo.com", "Password123!", "apollo", "physician");
    await page.goto("/telehealth");

    // Verify Telehealth Queue & HD Video Room
    await expect(page.getByText(/Telehealth WebRTC Video Consultations/i)).toBeVisible();
    await expect(page.getByText(/Live Video Consult Room/i)).toBeVisible();
    await expect(page.getByText(/Virtual Waiting Queue/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Book Video Consultation/i })).toBeVisible();
  });

  test("3. Inpatient Dietary & Clinical Nutrition (/dietary)", async ({ page }) => {
    await loginViaOIDC(page, "dr.smith@apollo.com", "Password123!", "apollo", "physician");
    await page.goto("/dietary");

    // Verify Dietary Nutrition & Meal Tray Delivery
    await expect(page.getByText(/Inpatient Dietary & Clinical Nutrition Workstation/i)).toBeVisible();
    await expect(page.getByText(/Meal Tray Delivery Board/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Prescribe Therapeutic Diet/i })).toBeVisible();

    // Verify Central Kitchen Aggregation Tab
    await page.getByRole("button", { name: /Kitchen Batch Prep/i }).click();
    await expect(page.getByText(/Kitchen Batch Prep/i).first()).toBeVisible();
  });

  test("4. Blood Bank & Serology Cross-Matching (/blood-bank)", async ({ page }) => {
    await loginViaOIDC(page, "dr.smith@apollo.com", "Password123!", "apollo", "physician");
    await page.goto("/blood-bank");

    // Verify Blood Bank Inventory Matrix (8 ABO/Rh blood groups)
    await expect(page.getByText(/Blood Bank & Transfusion Medicine Workstation/i)).toBeVisible();
    await expect(page.getByText(/Component Inventory/i)).toBeVisible();

    // Verify Voluntary Donor Intake Tab
    await page.getByRole("button", { name: /Donor Intake & Serology/i }).click();
    await expect(page.getByRole("button", { name: /Register Voluntary Blood Donor/i })).toBeVisible();
  });

  test("5. Universal Hospital Print Station (/print-station)", async ({ page }) => {
    await loginViaOIDC(page, "dr.smith@apollo.com", "Password123!", "apollo", "physician");
    await page.goto("/print-station");

    // Verify Multi-Hardware Print Station
    await expect(page.getByText(/Thermal Patient Wristbands/i)).toBeVisible();

    // Open Thermal Wristband Printer Modal and close via aria-label
    await page.getByRole("button", { name: /Open Thermal Wristband Printer/i }).click();
    await expect(page.getByText(/Patient Thermal ID Wristband Printer/i)).toBeVisible();
    await page.locator("button[aria-label='Close modal']").click();

    // Verify Specimen Tube Barcode Tab
    await page.getByRole("button", { name: /Specimen Tube Barcodes/i }).click();
    await expect(page.getByText(/Phlebotomy Vacutainer Tube Barcode Stickers/i)).toBeVisible();
  });

  test("6. Tenant Admin Master Configuration & Quota Metering (/settings)", async ({ page }) => {
    await loginViaOIDC(page, "operator@zensynq.com", "Password123!", "apollo", "operator");
    await page.goto("/settings?tab=config");

    // Verify Master Catalog Configuration View
    await expect(page.getByText(/Select Master Configuration Category/i)).toBeVisible();

    // Verify Account Settings Tab & General info
    await page.goto("/settings?tab=account");
    await expect(page.getByRole("heading", { name: /GENERAL INFORMATION/i })).toBeVisible();
  });
});
