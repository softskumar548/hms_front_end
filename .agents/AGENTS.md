# AGENTS.md — hms-web (MediGo HMS Frontend)

Project memory for AI AGENTS and the source of truth for how this UI is built.
Read fully before any change. Rules here override habits from other projects.

Backend: separate repo `hms` (Python/FastAPI).
Staging deployment: `https://stage.zensynq.com` (VPS: `103.174.103.158`).

---

# PART 1 — REVAMPED FRONTEND ARCHITECTURE & UX

## 1.1 Header & Sidebar Layout
- **Sticky Header**: Displays brand logo left, and right-aligned live clock (`DD MMM YYYY - HH:MM AM/PM`), tenant·role badge, language selector (`EN / TE`), and interactive Profile Avatar (`👤`) dropdown (User details, quick settings links, and logout).
- **Collapsible Sidebar (`AppSidebar`)**: Replaces horizontal top navigation. Supports expanded (240px) and collapsed icon-only (72px) states with tooltips and active left indicator.
- **Universal Keyboard & Pointer Dismissal**: ESC key press and backdrop click-outside listeners universally bound to all modals, drawers, and header popovers.

## 1.2 Platform Operator Console & Tenant Onboarding Pipeline (TEN-101 / TEN-301)
- 🛡️ **Operator Navigation (`OperatorSidebar`)**:
  - 📋 **Tenant Fleet**: Tenant roster table with live search, status filtering, setup readiness badges, and safe topological cascade offboarding safeguards.
  - ⚡ **Onboarding Wizard (`/onboarding`)**: Streamlined 2-stage tenant onboarding pipeline:
    - **Stage 1 (Credentials, Structured Address & Signatory Audit)**:
      - Real-time Subdomain / Slug availability validation against registered fleet & reserved keywords.
      - Vertical single-column form flow with sequential `Tab` and `Enter` key progression.
      - Jurisdiction locks: State locked to `🏛️ Andhra Pradesh` and Country locked to `🇮🇳 India`.
      - Structured physical address (`Door No`, `Address Line 1`, `Address Line 2`, `City`, `PIN Code (6 digits)`).
      - Telephony: `STD Code` + `Telephone Number` + `Ext` for facility & contacts, `+91` prefilled 10-digit mobile number.
      - Searchable & Creatable `DesignationCombobox` with on-the-fly custom option creation.
      - 12-digit Indian `Aadhaar ID` verification (`XXXX XXXX XXXX`) across contacts and signatory.
      - Automated top-to-bottom error auto-scroll engine focusing the first invalid input.
      - Minimalist, lightweight styling with subtle 1px focus states.
    - **Stage 2 (Tenant Admin Handover Certificate)**:
      - Issues copyable credentials certificate (Custom Portal URL, Keycloak `role: admin`, and temporary passcode).
  - 👤 **Operator Profile & Security (`/operator/profile`)**:
    - Dedicated Operator Profile and Keycloak Password Reset tabs.

## 1.3 Tenant Admin Navigation Architecture
- 📊 **Dashboard** (`/dashboard`): Executive Welcome Banner with Dean details & clinic name (`Welcome, Dr. K R Murali (Dean) · ZEN CLINIC`), facility site filter, live refresh counter, and KPI metric cards (`Today's Consultations`, `Avg Wait Time`, `No-Shows`, `Cashier Till Revenue`). Seeded tour checklist is omitted.
  - ⚙️ **Configuration** (`/settings?tab=config`): Master dropdown-driven configuration view with **20 standard healthcare catalogs** (`room_type`, `visit_type`, `specialization`, `floor_type`, `lab_test`, `bed_category`, `payment_type`, `expense_category`, `surgical_package`, `ambulance_fleet`, `tpa_insurance`, `biomedical_asset`, `diet_plan`, `specimen_type`, `dosage_route`, `referral_partner`, `consent_template`, `waste_category`, `clinic_type`, `order_status`). Pre-seeded with **20 standard clinical & surgical specializations** (General Medicine, Cardiology, Orthopedics, Pediatrics, Gynaecology, Laparoscopic Surgery, Dermatology, ENT, Ophthalmology, Neurology, Pulmonology, Gastroenterology, Nephrology, Urology, Psychiatry, Dental Surgery, Emergency Medicine, Oncology, Anesthesiology, Radiology) with specialized polymorphic entity input forms and HOD/Chamber attributes.
  - 👑 **Custom Master Catalogs & Dynamic Schema Builder**: Allows creating custom master catalogs on the fly with a visual data field schema builder (`CustomFieldDef`: text, currency/numbers, select dropdowns, boolean toggles, dates). Automatically renders dynamic table headers, formatted cells, and form inputs.
  - 📊 **Subscription Tier Metering & Item Quotas**:
    - **Starter Plan**: 20 Built-in Catalogs, 0 Custom Catalogs (`👑 PRO`), item-level limits (15 rooms/beds, 20 lab tests, 5 visit types, 5 specialties, 5 surgical packages, 3 floors, 2 ambulances, 10 general items).
    - **Growth Plan**: 20 Built-in Catalogs + 5 Custom Schemas (`x/5 Used`), expanded item limits (50 rooms/beds, 100 lab tests, 25 visit types, 25 specialties, 30 surgical packages, 10 floors, 10 ambulances, 50 general items).
    - **Enterprise Plan / Operator**: 20 Built-in Catalogs + Unlimited Custom Catalogs (`👑 Unlimited`) + Unlimited items per category (`∞ Unlimited`).
    - Real-time quota pills on action buttons (`+ Add Item (x/limit Used)`), top allocation banners inside addition modals, and automatic tier comparison upgrade triggers (`showUpgradePlanModal`).
  - 🏢 **Account Settings** (`/settings?tab=account`): 
    - **Subscription Package Summary Card**: Real-time quota display tracking `Standard Master Catalogs (20 Included)`, `Custom Master Catalogs (x / limit)`, `Package Name`, `Expiry Date`, `Admins`, `Staff`, `Beds Limit`, `Doctors Limit`, `SMS Count`, `Email Count`, and `Whatsapp Count`.
    - Signatory details (`DR K R MURALI`), department sub-tabs, and compliance documents.
  - 👥 **Users & Staff Directory** (`/settings?tab=users`): Full personnel lifecycle management with live quota meters (`Staff Limit`, `Doctor Limit`). Captures Indian Medical Council Reg No (`NMC / APMC`), designation, department linking (`specialization` catalog), chamber allocation (`room_type` catalog), standard OPD consultation fee (₹), 12-digit Indian Aadhaar ID, duty shifts, and on-call toggles. Includes printable **MediGo Hospital Staff ID Lanyard Badges** with 2D barcodes, Keycloak login passcode resets, and multi-filter search.
  - 💳 **Payment** (`/settings?tab=payment`): Payment collection rails, daily till reconciliation limits, PMJAY 100% cashless rules.
  - 🌐 **Online Services** (`/settings?tab=online`): ABDM ABHA milestones, Telehealth switches, and SMS/WhatsApp gateway.


## 1.4 Clinical Staff Navigation & EMR Workstation
- **Receptionist**: Live Queue / Check-in board (`/queue`), Waiting Lounge TV Token Calling Display (`/queue/display`), Patients (`/patients`), Scheduling (`/scheduling`).
- **Physician / Nurse**:
  - 🩺 **Doctor EMR Launchpad (`/emr`)**: Outpatient consultation queue with live wait times, triage priority, and 1-click encounter launch.
  - 📝 **SOAP Clinical Note Pad (`/emr/patients/:id/encounter/:encounterId`)**: Structured Subjective symptoms chips, Objective systemic exam, Assessment with ICD-10 diagnosis picker, Plan with lifestyle advice, and direct Diagnostic Lab Requisition desk.
  - 🚨 **Persistent Allergy Warning Banner (`EMR-005`)**: High-visibility contraindication alert across clinical records.
  - 💊 **Bilingual Rx Medication Composer (`RX-002` / `RX-003`)**: Indian pharmaceutical brand catalog, structured frequency/route/food-timing matrix, Telugu patient instructions, and hard-stop allergy overrides.
  - 🖨️ **MediPass Printable Stub (`/emr/patients/:id/print`)**: A4 printer-friendly prescription and visit summary with hospital letterhead and physician registration credentials.
  - 🛏️ **Inpatient Bed Matrix & Ward Transfer (`/inpatient`)**: Interactive visual bed grid across 4 hospital floors, 1-click ward transfers with live daily tariff adjustment, admission intake, and 4-point discharge clearance.
- **Biller**:
  - 💳 **Invoicing & Ledger (`/billing`)**: Itemized charge sheets, gross invoice totals, PMJAY/Aarogyasri eligibility indicators, and invoice locking.
  - 💵 **Daily Till Drawer Reconciliation (`TillReconciliationModal`)**: Physical currency denomination breakdown (`₹500`...`₹1`), opening float, cash refunds, and live till variance/shortage audits.
  - 🔀 **Multi-Rail Split Invoicing (`PaymentTill`)**: Settle across YSR Aarogyasri 100% cashless, TPA corporate insurance pre-auths, and patient copay with dynamic UPI QR code generator and 80mm thermal receipt printer.
  - 📈 **Referral Partner Analytics (`/reports/referrals`)**: Diagnostic partner ledger and volume reports.

## 1.5 Hospital Human Resources (HR) & Automated Payroll Engine (`/hr`)
- 👥 **Staff Lifecycle & Statutory Compliance**: Comprehensive staff roster tracking 12-digit Indian Aadhaar ID, PAN, UAN/EPF registration, ESIC numbers, Andhra Pradesh Professional Tax (PT), and Medical Council Reg Nos (`NMC/APMC`).
- 💵 **Monthly Payroll Run & Bank NEFT Payout (`/hr?tab=payroll`)**: Automated gross-to-net salary batch calculation with EPF (12%), ESIC (0.75%), PT (₹200), and TDS deductions with 1-click batch locking and NEFT CMS bank file export (`.csv`).
- 📅 **Attendance & Duty Rostering (`/hr?tab=attendance`)**: Monthly biometric attendance calendar, Present/Absent/LOP days, night-shift & on-call duty counters, and leave application approval queue.
- 💼 **Salary Structure & CTC Configurator (`SalaryStructureModal`)**: Custom earnings breakdown (Basic 50%, HRA 40%, Medical, Special Allowances, Doctor OPD revenue share) and statutory enrollment controls.
- 📄 **Official Printable Pay Slips (`PaySlipPrintModal`)**: A4 printer-friendly pay slips with hospital letterhead, side-by-side earnings vs deductions breakdown, net take-home in Indian currency words, and digital HR stamp seal.

## 1.6 Universal Hospital Print Station & Barcode Label Engine (`/print-station`)
- 🖨️ **Multi-Hardware Printer Profiles**:
  - 🏷️ **Thermal Patient ID Wristbands (`WristbandPrintModal`)**: Zebra/TSC 100mm × 25mm waterproof inpatient wristband roll with high-contrast UHID, IP number, bed, blood group badge, and scannable 2D QR/barcode.
  - 🧪 **Diagnostic Specimen Vacutainer Tube Barcodes (`SpecimenBarcodeModal`)**: 50mm × 25mm tube stickers for Purple EDTA (CBC/ESR), Red Serum (LFT/RFT), Grey Fluoride (Glucose), and Urine containers with 1-click batch printing.
  - 📄 **A4 Standard Laser/Inkjet Hub**: Direct launcher for MediPass Prescriptions, Discharge Summaries, Employee Pay Slips, and Admission Undertakings.
  - 🧾 **80mm POS Thermal Receipts**: Cashier till receipts, OPD token calling slips, and pharmacy dispensing tags.

## 1.7 Diagnostic Pathology & Radiology Workstation (`/lab`)
- 🧪 **Phlebotomy Intake & Vacutainer Barcodes**: Real-time intake queue from OPD Doctor EMR and Inpatient beds with color-coded tube cap assignments (EDTA Purple, Serum Red, Fluoride Grey, Urine Yellow) and 50×25mm sticker printing.
- 🚨 **Analyte Result Entry & Panic Alerts**: Multi-parameter testing (CBC, LFT, RFT, Lipid, Glucose, Thyroid) with automated reference interval checks and high-visibility **🚨 PANIC / CRITICAL VALUE ALERTS** for life-threatening findings.
- 🔬 **Pathologist Digital Verification**: Authorized review desk with clinical impression and microscopic notes.
- 📄 **Official A4 Diagnostic Test Reports (`DiagnosticReportPrintModal`)**: NABL accredited format (MC-4891) with hospital letterhead, multi-analyte parameter tables, digital signatures, and ABHA QR verification code.

## 1.8 Hospital Pharmacy & FEFO Dispensary POS (`/pharmacy`)
- 💊 **EMR Prescription Dispensing Queue**: Direct sync with outpatient e-prescriptions with Telugu dosage instructions and 1-click batch allocation.
- 📦 **FEFO Inventory & Expiry Controls**: Multi-batch inventory tracking with automated First-Expired-First-Out stock deduction and near-expiry alerts (< 60 days).
- 🏷️ **Bilingual Thermal Pill Bottle Labels (`PillBottleLabelPrintModal`)**: 50mm × 25mm barcode stickers with English & Telugu patient dosage instructions (*"ఉదయం, రాత్రి భోజనం తర్వాత"*).
- 🧾 **GST Tax Invoices & Till Settlement**: 12% GST tax breakdown, UPI QR generator, Aarogyasri 100% cashless rules, and 80mm thermal receipt printing.

## 1.9 Emergency Casualty & Acute Trauma Triage (`/emergency`)
- 🚨 **Rapid Trauma Intake & John Doe Support**: Emergency intake mode for identified patients and unconscious accident victims (`UNKNOWN MALE #9021`) brought by 108 Ambulances / Police.
- 🧠 **Glasgow Coma Scale (GCS) Calculator**: Digital E+V+M scoring (`3-15`) with automated triage category determination (🔴 RED Immediate Resuscitation, 🟡 YELLOW Urgent Emergent, 🟢 GREEN Walking Wounded).
- 🛏️ **1-Click Critical Care ICU Escalation**: Rapid transfer workflow from casualty bays directly to Floor 4 ICU ventilator beds (`ICU-01` to `ICU-03`) with SBAR clinical handover notes.
- 🩸 **Emergency STAT Requisitions**: Uncrossmatched O-negative blood release and bedside FAST ultrasound / trauma CT requests.

## 1.10 Operation Theatre (OT) Scheduling & WHO Surgical Safety (`/ot`)
- 🏥 **4-Theatre Complex & Grid**: Visual scheduling across OT 1 (Major Ortho/Joints), OT 2 (Advanced Laparoscopy), OT 3 (Cardiothoracic CTVS), and OT 4 (Emergency Trauma 24/7).
- 📅 **Surgery Booking & Team Allocation**: Full team scheduling (Lead Surgeon, Assistant, Anesthesiologist, Scrub Nurse) with 4-point pre-op validation (PAC clearance, Consent, NPO 8h, PRBC blood reservation).
- 📋 **Interactive 3-Stage WHO Surgical Safety Checklist**: Digital verification of Sign-In (Pre-induction), Time-Out (Pre-incision), and Sign-Out (Pre-exit) with instrument/sponge count verification and compliance certification.
- 🛏️ **PACU Post-Anesthesia Recovery & Aldrete Score**: Real-time Modified Aldrete scoring (`0-10`) with automated discharge criteria (Score ≥ 9) for ward transfers.

---

# PART 2 — THEME & DESIGN TOKENS (MediGo)

Defined once in `src/ui/tokens.css`. **Never hardcode hex values in components.**
- `--indigo` (#131A8F): Primary brand color, field values, active nav.
- `--indigo-deep` (#0A1166): Dark buttons, toasts, active states.
- `--indigo-soft` (#E4E9FF): Selected row fills, active sidebar item backgrounds.
- `--ink` (#23263B): Body headings and text.
- `--slate` (#5B6172): Secondary text, labels, captions.
- `--line` (#E3E8F4): Hairline borders and dividers.
- `--card` (#FFFFFF): Floating cards.
- `--wash-a` (#F6FAFF) / `--wash-b` (#DDEBFC): Sky wash background gradient.
- Semantics: Info (`--cyan` #5FC6E9), Attention (`--orange` #F08125), Success (`--green` #1C9A4E), Danger (`--danger` #D93A3A).
- Minimalist Focus: Non-intrusive 1px focus borders (`#6366F1`) replacing heavy glow rings.

### Signature UI Patterns
1. **FieldCell Grid**: Airline-booking inspired cell grid (tiny slate label above, bold Baloo-2 value below).
2. **Persistent Allergy Banner**: Constant orange warning banner on all clinical patient screens (`EMR-005`).
3. **MediPass**: Boarding pass-style confirmation stub for appointments and lab orders.
4. **i18n Readiness**: English + Telugu language support; all user-facing strings keyed.
5. **Synthetic Data**: Synthetic patient and staff data only in dev and fixtures.

---

# PART 3 — AUTHENTICATION & MULTI-TENANCY

- **Keycloak OIDC Integration**: Realm `hms`, Client `hms-web` (SPA PKCE).
- **Dynamic Subdomain Resolution**: `resolveTenantFromHostname()` automatically binds tenant context from the host subdomain (`*.hms.zensynq.com`), maintaining seamless multi-tenancy.
- **Tenant Context**: Verified server-side and propagated via `app.tenant_id` claim in JWT.
- Role-gated routing in `src/main.tsx` via `<RequireRole>`.
