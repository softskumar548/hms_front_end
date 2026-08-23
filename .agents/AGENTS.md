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

## 1.2 Tenant Admin Navigation Architecture
- 📊 **Dashboard** (`/dashboard`): Executive Welcome Banner with Dean details & clinic name (`Welcome, Dr. K R Murali (Dean) · ZEN CLINIC`), facility site filter, live refresh counter, and KPI metric cards (`Today's Consultations`, `Avg Wait Time`, `No-Shows`, `Cashier Till Revenue`). Seeded tour checklist is omitted.
- 👥 **Admin (Expandable Accordion)**:
  - ⚙️ **Configuration** (`/settings?tab=config`): Master dropdown-driven configuration view (`Payment Type`, `Visit Type`, `Order Status`, `Clinic Type`, `Specialization`, `Room Type`, `Floor Type`, `Bed Category`, `Expense Category`) with dynamic item table & modal forms.
  - 🏢 **Account Settings** (`/settings?tab=account`): Subscription profile, signatory details (`DR K R MURALI`), and compliance documents.
  - 🔐 **User Authentication** (`/settings?tab=auth`): Keycloak OIDC issuer, client parameters, token scopes, and MFA status.
  - 👥 **Users** (`/settings?tab=users`): Staff directory with role badges and **+ Invite Staff** modal.
  - 💳 **Payment** (`/settings?tab=payment`): Payment collection rails, daily till reconciliation limits, PMJAY 100% cashless rules.
  - 🌐 **Online Services** (`/settings?tab=online`): ABDM ABHA milestones, Telehealth switches, and SMS/WhatsApp gateway.

## 1.3 Clinical Staff Navigation
- **Receptionist**: Live Queue / Check-in board (`/queue`), Patients (`/patients`), Scheduling (`/scheduling`).
- **Physician / Nurse**: My Schedule (`/my-schedule`), Live Queue (`/queue`), EMR / Notes (`/emr`).
- **Biller**: Invoices (`/billing`), Payment Till, Referral Analytics (`/reports/referrals`).

---

# PART 2 — THEME & DESIGN TOKENS (MediGo)

Defined once in `src/ui/tokens.css`.
- `--indigo` (#131A8F): Primary brand color, field values, active nav.
- `--indigo-deep` (#0A1166): Dark buttons, toasts, active states.
- `--indigo-soft` (#E4E9FF): Selected row fills, active sidebar item backgrounds.
- `--ink` (#23263B): Body headings and text.
- `--slate` (#5B6172): Secondary text, labels, captions.
- `--line` (#E3E8F4): Hairline borders and dividers.
- `--card` (#FFFFFF): Floating cards.
- `--wash-a` (#F6FAFF) / `--wash-b` (#DDEBFC): Sky wash background gradient.
- Semantics: Info (`--cyan` #5FC6E9), Attention (`--orange` #F08125), Success (`--green` #1C9A4E), Danger (`--danger` #D93A3A).

---

# PART 3 — AUTHENTICATION & MULTI-TENANCY

- **Keycloak OIDC Integration**: Realm `hms`, Client `hms-web` (SPA PKCE).
- **Tenant Context**: Verified server-side and propagated via `app.tenant_id` claim in JWT. Declarative user profile in Keycloak is configured to allow `tenant_id`.
- Role-gated routing in `src/main.tsx` via `<RequireRole>`.
