import { test } from "@playwright/test";
import path from "path";
import fs from "fs";

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || "./test-results";

test("Capture Visual Verification Proof Screenshots", async ({ page }) => {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  // Set viewport size
  await page.setViewportSize({ width: 1280, height: 900 });

  // 1. Clean Tenant Management Screen
  await page.goto("/");
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "tenant_management_clean_list.png"),
    fullPage: false,
  });

  // 2. Open Type-to-Confirm Delete Confirmation Modal if button exists
  const deleteBtn = page.locator("button[title*='Cascade Delete Tenant']").first();
  if (await deleteBtn.isVisible()) {
    await deleteBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "delete_modal_open_safeguard.png"),
      fullPage: false,
    });

    const confirmInput = page.locator("input[placeholder*='Type']");
    if (await confirmInput.isVisible()) {
      await confirmInput.fill("kims");
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, "delete_modal_typed_input.png"),
        fullPage: false,
      });
    }

    const cancelBtn = page.locator("button:has-text('Cancel')");
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await page.waitForTimeout(300);
    }
  }

  // 3. Onboarding Wizard Step 3: Readiness & Go-Live
  await page.goto("/tenants/onboarding");
  await page.waitForTimeout(1000);

  const step3Btn = page.locator("button:has-text('Step 3: Readiness & Go-Live')");
  if (await step3Btn.isVisible()) {
    await step3Btn.click();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "onboarding_wizard_step3_readiness.png"),
      fullPage: false,
    });
  }
});
