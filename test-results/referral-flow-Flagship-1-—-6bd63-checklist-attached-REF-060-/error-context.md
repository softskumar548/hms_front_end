# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: referral-flow.spec.ts >> Flagship #1 — referral: intake → prereq CT → blocked check-in → resolve → invoice → timeline >> book CT with prerequisite checklist attached (REF-060)
- Location: e2e\referral-flow.spec.ts:52:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('medipass')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('medipass')

```

```yaml
- banner:
  - text: MediGo
  - navigation:
    - link "nav_patients":
      - /url: /patients
    - link "nav_scheduling":
      - /url: /scheduling
    - link "nav_queue":
      - /url: /queue
    - link "nav_billing":
      - /url: /billing
    - link "Tenants Control":
      - /url: /tenants
    - link "Onboarding Wizard":
      - /url: /onboarding
    - link "Ops Control":
      - /url: /ops-control
    - link "Ops Dashboard":
      - /url: /dashboard
    - link "nav_design":
      - /url: /design
  - text: 22 Jul 2026 apollo · receptionist
  - combobox "Select language":
    - option "EN" [selected]
    - option "TE"
  - button "logout"
- main:
  - heading "Practitioner Scheduling Dashboard" [level=2]
  - text: Patient Search
  - textbox "Search patient...": E2E Referral1784744789032
  - text: Select Doctor / Practitioner
  - combobox:
    - option "Dr. Srinivas (Cardiology)" [selected]
    - option "Dr. Prasad (General)"
  - text: Clinical Service Required
  - combobox:
    - option "CT Scan Cardiology" [selected]
    - option "General Health Checkup"
    - option "Consultation Follow-up"
  - text: Booking Date
  - combobox:
    - option "21 Jul 2026 (Today)" [selected]
    - option "22 Jul 2026 (Tomorrow)"
  - button "🔍 Find Earliest Slot"
  - 'heading "Slots Grid: 2026-07-21" [level=3]'
  - text: "Room Location: Room 101 - Cardiology OPD"
  - strong: 09:00 AM
  - text: Available slot for booking
  - button "Book Slot"
  - strong: 09:30 AM
  - text: Available slot for booking
  - button "Book Slot"
  - strong: 10:00 AM
  - text: Available slot for booking
  - button "Book Slot"
  - strong: 10:30 AM
  - text: Available slot for booking
  - button "Book Slot"
  - strong: 11:00 AM
  - text: Available slot for booking
  - button "Book Slot"
  - strong: 11:30 AM
  - text: Available slot for booking
  - button "Book Slot"
  - strong: 12:00 PM
  - text: Available slot for booking
  - button "Book Slot"
  - strong: 12:30 PM
  - text: Available slot for booking
  - button "Book Slot"
  - heading "Earliest Slot Assistant (UI-301)" [level=3]
  - paragraph: Click the finder button to automatically scan schedules for the next open appointment opening.
  - text: No active scan results.
  - dialog "Confirm Booking Slot":
    - heading "Confirm Booking Slot" [level=3]
    - button "Close modal": ✕
    - text: Practitioner Dr. Srinivas (Cardiology) Room Location Room 101 - Cardiology OPD Requested Service CT Scan Cardiology Date & Slot Time 21 Jul 2026, 9:00 am Select Patient *
    - textbox "Search patient name..."
    - text: Mohan Chowdary (+91-9315796987) Mohan Chowdary (+91-9969362228) Sana Chowdary (+91-9730834116) Sana Chowdary (+91-9664128604) Kiran Goud (+91-9150333538) Kiran Goud (+91-9782828644) Prakash Gupta (+91-9338038101) Prakash Gupta (+91-9747949364) Ramesh Gupta (+91-9575900901) Ramesh Gupta (+91-9160105958) Padma Iyer (+91-9393508641) Padma Iyer (+91-9630713547) Arjun Khan (+91-9129017618) Arjun Khan (+91-9863342675) Priya Khan (+91-9306178881) Priya Khan (+91-9168627625) Sita Kumar (+91-9409135650) Sita Kumar (+91-9366165435) Swathi Kumar (+91-9249019561) Swathi Kumar (+91-9206066469) Vijay Murthy (+91-9926335080) Vijay Murthy (+91-9647374195) Ananya Naidu (+91-9913441830) Ananya Naidu (+91-9852744981) Suresh Nair (+91-9778248558) Suresh Nair (+91-9306107471) Harish Prasad (+91-9855163057) Harish Prasad (+91-9276874854) Geetha Raju (+91-9143768784) Geetha Raju (+91-9395093764) Lakshmi Raju (+91-9317373272) Lakshmi Raju (+91-9738641699) Naveen Rao (+91-9754468279) Naveen Rao (+91-9193509396) Venkatesh Rao (+91-9571941590) Venkatesh Rao (+91-9973708540) Sneha Reddy (+91-9406701156) Sneha Reddy (+91-9883748176) E2E Referral1784741351937 (+919876543210) E2E Referral1784741570980 (+919421970577) E2E Referral1784741609586 (+919455380611) E2E Referral1784741689819 (+919525820620) E2E Referral1784741824353 (+919985642926) E2E Referral1784742018510 (+919880562891) E2E Referral1784742168740 (+919234071977) E2E Referral1784742370750 (+919831324298) E2E Referral1784742444625 (+919961339972) E2E Referral1784742455424 (+919574255821) E2E Referral1784742487770 (+919448774954) E2E Referral1784742516185 (+919163392809) E2E Referral1784742559397 (+919246311852) E2E Referral1784742999278 (+919594264109) E2E Referral1784743034998 (+919519041141) E2E Referral1784743057696 (+919825558940) E2E Referral1784743526005 (+919944299246) E2E Referral1784744399712 (+919188980027) E2E Referral1784744568863 (+919735235479) E2E Referral1784744646085 (+919431311475) E2E Referral1784744751030 (+919698003719) E2E Referral1784744789032 (+919437199794) Meena Sharma (+91-9729782296) Meena Sharma (+91-9994271812) Ravi Sharma (+91-9490258735) Ravi Sharma (+91-9859365276) Bhavani Varma (+91-9927651752) Bhavani Varma (+91-9898006002) Divya Varma (+91-9348289971) Divya Varma (+91-9762806695) Anil Yadav (+91-9172415715) Anil Yadav (+91-9267112852) Kavya Yadav (+91-9153433556) Kavya Yadav (+91-9602184282)
    - strong: Required Service Prerequisites (UI-302 / REF-060)
    - text: Hard-Stop Fasting for 12 hours before test (12 గంటలు ఖాళీ కడుపుతో ఉండాలి) Advisory Contrast injection consent signed (ఇంజెక్షన్ సమ్మతి పత్రం) ⚠️ Internal Server Error
    - button "Cancel"
    - button "Book Appointment"
```

# Test source

```ts
  1  | // e2e/referral-flow.spec.ts — Flagship Flow #1 (referral) against the LIVE stack.
  2  | // Precondition: docker compose up (Postgres+API healthy), VITE_USE_MOCKS=false,
  3  | // seeded demo tenants. Selectors below use data-testid — add the listed testids
  4  | // to screens if missing; do NOT loosen the assertions to make this pass.
  5  | import { test as baseTest, expect, Page } from "@playwright/test";
  6  | 
  7  | let sharedPage: Page;
  8  | 
  9  | const test = baseTest.extend<{ page: Page }>({
  10 |   page: async ({}, use) => {
  11 |     await use(sharedPage);
  12 |   },
  13 | });
  14 | 
  15 | test.beforeAll(async ({ browser }) => {
  16 |   sharedPage = await browser.newPage();
  17 | });
  18 | 
  19 | test.afterAll(async () => {
  20 |   await sharedPage.close();
  21 | });
  22 | 
  23 | const PATIENT = { given: "E2E", family: `Referral${Date.now()}` };
  24 | 
  25 | test.describe.serial("Flagship #1 — referral: intake → prereq CT → blocked check-in → resolve → invoice → timeline", () => {
  26 |   test("dev login as receptionist (apollo)", async ({ page }) => {
  27 |     await page.goto("/");
  28 |     // Dev-stub login; replace with OIDC helper when N2 lands.
  29 |     await page.getByTestId("login-tenant").selectOption("apollo");
  30 |     await page.getByTestId("login-role").selectOption("receptionist");
  31 |     await page.getByTestId("login-continue").click();
  32 |     await expect(page.getByTestId("shell-tenant-indicator")).toContainText("apollo");
  33 |   });
  34 | 
  35 |   test("register a referred-in patient with referrer capture", async ({ page }) => {
  36 |     await page.goto("/patients/register");
  37 |     await page.getByTestId("reg-given").fill(PATIENT.given);
  38 |     await page.getByTestId("reg-family").fill(PATIENT.family);
  39 |     // Referrer capture (REF-012): quick-add a referring clinic doctor.
  40 |     await page.getByTestId("referrer-search").fill("E2E Clinic");
  41 |     await page.getByTestId("referrer-quick-add").click();
  42 |     await page.getByTestId("referrer-add-name").fill("Dr E2E Referrer");
  43 |     await page.getByTestId("referrer-add-type").selectOption("clinic_doctor");
  44 |     await page.getByTestId("referrer-add-save").click();
  45 |     await page.getByTestId("referral-reason").fill("CT scan — facility unavailable at clinic");
  46 |     await page.getByTestId("reg-save").click();
  47 |     await expect(page.getByTestId("toast")).toContainText(/registered|created/i);
  48 |     // No commission UI anywhere (India lock, AP-4):
  49 |     await expect(page.locator("text=/commission/i")).toHaveCount(0);
  50 |   });
  51 | 
  52 |   test("book CT with prerequisite checklist attached (REF-060)", async ({ page }) => {
  53 |     await page.goto("/scheduling/book");
  54 |     await page.getByTestId("book-patient-search").fill(PATIENT.family);
  55 |     await page.getByTestId("book-patient-result").first().click();
  56 |     await page.getByTestId("book-service").selectOption({ label: "CT Scan Cardiology" });
  57 |     await page.getByTestId("book-slot").first().click();
  58 |     // Prereqs visible, structured, with hard-stop styling:
  59 |     await expect(page.getByTestId("prereq-item-hardstop").first()).toBeVisible();
  60 |     await page.getByTestId("book-confirm").click();
> 61 |     await expect(page.getByTestId("medipass")).toBeVisible(); // signature moment
     |                                                ^ Error: expect(locator).toBeVisible() failed
  62 |   });
  63 | 
  64 |   test("check-in is BLOCKED on unmet hard-stop, then resolves (REF-061)", async ({ page }) => {
  65 |     await page.goto("/scheduling/checkin");
  66 |     await page.getByTestId(`checkin-row-${PATIENT.family}`).click();
  67 |     await expect(page.getByTestId("checkin-blocked-panel")).toBeVisible();
  68 |     await expect(page.getByTestId("checkin-submit")).toBeDisabled();
  69 |     // Resolve the hard-stop via the API-backed action (not client-only):
  70 |     await page.getByTestId("prereq-resolve").first().click();
  71 |     await expect(page.getByTestId("checkin-submit")).toBeEnabled();
  72 |     await page.getByTestId("checkin-submit").click();
  73 |     await expect(page.getByTestId("queue-status")).toContainText(/arrived/i);
  74 |   });
  75 | 
  76 |   test("invoice generated with charges; Aarogyasri indicator renders truthfully", async ({ page }) => {
  77 |     await page.goto("/billing");
  78 |     await page.getByTestId("invoice-patient-search").fill(PATIENT.family);
  79 |     await page.getByTestId("invoice-open").first().click();
  80 |     await expect(page.getByTestId("invoice-line")).toHaveCount(1, { timeout: 15_000 });
  81 |     await expect(page.getByTestId("scheme-indicator")).toBeVisible(); // eligible OR ineligible-with-reason
  82 |     await page.getByTestId("invoice-finalize").click();
  83 |     await expect(page.getByTestId("toast")).toContainText(/finali[sz]ed/i);
  84 |   });
  85 | 
  86 |   test("referral timeline closes the loop (REF-064) with zero monetary info", async ({ page }) => {
  87 |     await page.goto(`/patients`);
  88 |     await page.getByTestId("patients-search").fill(PATIENT.family);
  89 |     await page.getByTestId("patient-row").first().click();
  90 |     await page.getByTestId("tab-referral-timeline").click();
  91 |     const timeline = page.getByTestId("referral-timeline");
  92 |     await expect(timeline).toContainText("Dr E2E Referrer");
  93 |     await expect(timeline).toContainText(/CT/i);
  94 |     await expect(timeline.locator("text=/₹|commission|payout/i")).toHaveCount(0);
  95 |   });
  96 | });
  97 | 
```