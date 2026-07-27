import { test, expect } from "@playwright/test";
import path from "path";

const ARTIFACT_DIR = "C:\\Users\\Sivakumar\\.gemini\\antigravity-ide\\brain\\bc53ac22-a2b2-4bf6-93a6-b5c8e8eae3ba";

test("Capture Visual Verification Proof Screenshots", async ({ page }) => {
  // Set viewport size
  await page.setViewportSize({ width: 1280, height: 900 });

  // 1. Clean Tenant Management Screen
  await page.goto("http://localhost:5173/");
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "tenant_management_clean_list.png"),
    fullPage: false,
  });

  // 2. Open Type-to-Confirm Delete Confirmation Modal (Triggered)
  // Click on the delete button for the first tenant card
  const deleteBtn = page.locator("button[title*='Cascade Delete Tenant']").first();
  await deleteBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "delete_modal_open_safeguard.png"),
    fullPage: false,
  });

  // 3. Type into input to demonstrate confirmation field reactivity
  const confirmInput = page.locator("input[placeholder*='Type']");
  await confirmInput.fill("kims");
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "delete_modal_typed_input.png"),
    fullPage: false,
  });

  // Close modal
  await page.click("button:has-text('Cancel')");
  await page.waitForTimeout(300);

  // 4. Onboarding Wizard Step 3: Readiness & Go-Live
  await page.goto("http://localhost:5173/tenants/onboarding");
  await page.waitForTimeout(1000);

  // Click on Step 3 tab
  const step3Btn = page.locator("button:has-text('Step 3: Readiness & Go-Live')");
  await step3Btn.click();
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "onboarding_wizard_step3_readiness.png"),
    fullPage: false,
  });
});
