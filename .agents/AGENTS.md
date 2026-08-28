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
- 👥 **Admin (Expandable Accordion)**:
  - ⚙️ **Configuration** (`/settings?tab=config`): Master dropdown-driven configuration view with **20 standard healthcare catalogs** (`room_type`, `visit_type`, `specialization`, `floor_type`, `lab_test`, `bed_category`, `payment_type`, `expense_category`, `surgical_package`, `ambulance_fleet`, `tpa_insurance`, `biomedical_asset`, `diet_plan`, `specimen_type`, `dosage_route`, `referral_partner`, `consent_template`, `waste_category`, `clinic_type`, `order_status`) with specialized polymorphic entity input forms.
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


## 1.4 Clinical Staff Navigation
- **Receptionist**: Live Queue / Check-in board (`/queue`), Patients (`/patients`), Scheduling (`/scheduling`).
- **Physician / Nurse**: My Schedule (`/my-schedule`), Live Queue (`/queue`), EMR / Notes (`/emr`).
- **Biller**: Invoices (`/billing`), Payment Till, Referral Analytics (`/reports/referrals`).

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
