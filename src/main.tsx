import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import "./ui/tokens.css";
import i18n from "./i18n";
import { useTranslation } from "react-i18next";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { api } from "./api/client";
import { Button, Card, FieldCell, Input, PageTitle, StatusPill, Select, Skeleton, Chip, RadioPill, DateChips, Modal, Drawer, Toast } from "./ui/components";
import { formatRupees, formatIndianDate } from "./ui/helpers";
import ErrorBoundary from "./ui/ErrorBoundary";
import OfflineBanner from "./ui/OfflineBanner";
import { telemetry } from "./api/telemetry";

const PatientRegister = React.lazy(() => import("./features/patients/PatientRegister"));
const PatientDetail = React.lazy(() => import("./features/patients/PatientDetail"));
const TenantSettings = React.lazy(() => import("./features/settings/TenantSettings"));
const CalendarView = React.lazy(() => import("./features/scheduling/CalendarView"));
const QueueBoard = React.lazy(() => import("./features/scheduling/QueueBoard"));
const ReminderPreview = React.lazy(() => import("./features/scheduling/ReminderPreview"));
const PatientSummary = React.lazy(() => import("./features/emr/PatientSummary"));
const EncounterNote = React.lazy(() => import("./features/emr/EncounterNote"));
const VisitSummaryPrint = React.lazy(() => import("./features/emr/VisitSummaryPrint"));
const OrderCatalog = React.lazy(() => import("./features/orders/OrderCatalog"));
const ResultsInbox = React.lazy(() => import("./features/orders/ResultsInbox"));
const InvoiceScreen = React.lazy(() => import("./features/billing/InvoiceScreen"));
const ReferralTimeline = React.lazy(() => import("./features/referrals/ReferralTimeline"));
const PatientPortal = React.lazy(() => import("./features/portal/PatientPortal"));
const IntakeForms = React.lazy(() => import("./features/portal/IntakeForms"));
const OpsDashboard = React.lazy(() => import("./features/reports/OpsDashboard"));
const ReferralAnalytics = React.lazy(() => import("./features/reports/ReferralAnalytics"));
const TenantManagementScreen = React.lazy(() => import("./features/tenants/TenantManagementScreen").then(m => ({ default: m.TenantManagementScreen })));
const OnboardingWizardScreen = React.lazy(() => import("./features/tenants/OnboardingWizardScreen").then(m => ({ default: m.OnboardingWizardScreen })));
const OperationalControlScreen = React.lazy(() => import("./features/tenants/OperationalControlScreen").then(m => ({ default: m.OperationalControlScreen })));
const MyScheduleView = React.lazy(() => import("./features/scheduling/MyScheduleView"));

function RoleHomeRedirect() {
  const { role } = useAuth();
  if (role === "receptionist") return <Navigate to="/queue" replace />;
  if (role === "physician" || role === "doctor" || role === "nurse") return <Navigate to="/my-schedule" replace />;
  if (role === "billing") return <Navigate to="/billing" replace />;
  if (role === "admin") return <Navigate to="/dashboard" replace />;
  if (role === "operator") return <Navigate to="/tenants" replace />;
  if (role === "patient") return <Navigate to="/portal" replace />;
  return <Navigate to="/queue" replace />;
}




/* ---------- Shell ---------- */
function Shell({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const { tenant, role, logout } = useAuth();
  const location = useLocation();
  
  const isOperatorRoute = role === "operator" ||
    location.pathname.startsWith("/tenants") ||
    location.pathname.startsWith("/onboarding") ||
    location.pathname.startsWith("/ops-control");

  const isPatientRoute = role === "patient" || location.pathname.startsWith("/portal");

  const isPhysician = role === "physician" || role === "doctor" || role === "nurse";

  const showBilling = role === "receptionist" || role === "admin" || role === "billing";
  const showEMR = isPhysician || role === "admin";
  const showSettings = role === "admin";
  const showScheduling = role === "receptionist" || role === "admin" || isPhysician;
  const showQueue = role === "receptionist" || role === "admin" || isPhysician;
  const showReferrals = role === "receptionist" || isPhysician || role === "admin" || role === "billing";
  const showDashboard = role === "admin" || role === "receptionist";
  
  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div>
      <header style={{ background: "#fff", borderBottom: "1px solid var(--line)", padding: "12px 24px", display: "flex", alignItems: "center", gap: 18 }}>
        <Link to="/" style={{ textDecoration: "none", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, color: "var(--indigo)" }}>
          {isOperatorRoute ? "MediGo Operator" : isPatientRoute ? "MediGo Portal" : "MediGo"}
        </Link>
        <nav style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {isOperatorRoute ? (
            /* Operator Console Navigation (PHI-Free) */
            <>
              <Link to="/tenants" style={{ textDecoration: "none", color: "var(--indigo)", fontWeight: 700 }}>{t("nav_operator_tenants", "Tenants")}</Link>
              <Link to="/onboarding" style={{ textDecoration: "none", color: "var(--indigo)", fontWeight: 700 }}>{t("nav_operator_onboarding", "Onboarding")}</Link>
              <Link to="/ops-control" style={{ textDecoration: "none", color: "var(--indigo)", fontWeight: 700 }}>{t("nav_operator_ops", "Billing Ops")}</Link>
              <Link to="/design" style={{ textDecoration: "none", color: "var(--ink)", fontWeight: 600 }}>{t("nav_design")}</Link>
            </>
          ) : isPatientRoute ? (
            /* Patient Portal Navigation */
            <>
              <Link to="/portal" style={{ textDecoration: "none", color: "var(--indigo)", fontWeight: 700 }}>{t("nav_home", "Home")}</Link>
              <Link to="/portal" style={{ textDecoration: "none", color: "var(--ink)", fontWeight: 600 }}>Appointments</Link>
              <Link to="/portal" style={{ textDecoration: "none", color: "var(--ink)", fontWeight: 600 }}>My Records</Link>
              <Link to="/portal" style={{ textDecoration: "none", color: "var(--ink)", fontWeight: 600 }}>Billing</Link>
            </>
          ) : (
            /* Clinic Staff Navigation (5-7 visible items max per role) */
            <>
              <Link to="/" style={{ textDecoration: "none", color: "var(--ink)", fontWeight: 600 }}>{t("nav_home", "Home")}</Link>
              <Link to="/patients" style={{ textDecoration: "none", color: "var(--ink)", fontWeight: 600 }}>{t("nav_patients")}</Link>
              {isPhysician && <Link to="/my-schedule" style={{ textDecoration: "none", color: "var(--ink)", fontWeight: 600 }}>{t("nav_my_schedule", "My Schedule")}</Link>}
              {showScheduling && <Link to="/scheduling" style={{ textDecoration: "none", color: "var(--ink)", fontWeight: 600 }}>{t("nav_scheduling")}</Link>}
              {showQueue && <Link to="/queue" style={{ textDecoration: "none", color: "var(--ink)", fontWeight: 600 }}>{t("nav_queue")}</Link>}
              {showEMR && <Link to="/emr" style={{ textDecoration: "none", color: "var(--ink)", fontWeight: 600 }}>{t("nav_emr")}</Link>}
              {isPhysician && <Link to="/results" style={{ textDecoration: "none", color: "var(--ink)", fontWeight: 600 }}>Results Inbox</Link>}
              {showBilling && <Link to="/billing" style={{ textDecoration: "none", color: "var(--ink)", fontWeight: 600 }}>{t("nav_billing")}</Link>}
              {showReferrals && <Link to="/reports/referrals" style={{ textDecoration: "none", color: "var(--ink)", fontWeight: 600 }}>{t("nav_referrals")}</Link>}
              {showDashboard && <Link to="/dashboard" style={{ textDecoration: "none", color: "var(--ink)", fontWeight: 600 }}>{t("nav_reports")}</Link>}
              {showSettings && <Link to="/settings" style={{ textDecoration: "none", color: "var(--ink)", fontWeight: 600 }}>{t("nav_settings")}</Link>}
            </>
          )}
        </nav>
        <span data-testid="shell-tenant-indicator" style={{ marginLeft: "auto", fontSize: 13, color: "var(--slate)", display: "flex", alignItems: "center", gap: 12 }}>
          <span>{formatIndianDate(new Date())}</span>
          <span style={{ height: 12, width: 1, background: "var(--line)" }}></span>
          <span>{tenant} · {role}</span>
          <span style={{ height: 12, width: 1, background: "var(--line)" }}></span>
          <select value={i18n.language} onChange={handleLangChange} style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "2px 6px", fontSize: 12, fontWeight: 600, background: "#fff", color: "var(--indigo)", cursor: "pointer" }} aria-label="Select language">
            <option value="en">EN</option>
            <option value="te">TE</option>
          </select>
        </span>
        <Button ghost onClick={logout}>{t("logout")}</Button>
      </header>
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "26px 20px" }}>{children}</main>
    </div>
  );
}

/* ---------- Login (dev stub — swaps for OIDC without touching screens) ---------- */
function Login() {
  const { t } = useTranslation();
  const { login, loginWithOidc, sessionExpired } = useAuth();
  const [tenant, setTenant] = useState("apollo");
  const [role, setRole] = useState("receptionist");
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
      <Card style={{ width: 380 }}>
        <PageTitle>{t("sign_in")}</PageTitle>
        <p style={{ color: "var(--slate)", fontSize: 13, marginTop: -8 }}>
          {t("dev_login_desc")}
        </p>
        {sessionExpired && (
          <div style={{ marginBottom: 12 }}>
            <StatusPill kind="danger">{t("session_expired")}</StatusPill>
          </div>
        )}
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <FieldCell label={t("tenant")}>
            <select data-testid="login-tenant" value={tenant} onChange={(e) => setTenant(e.target.value)}
              style={{ font: "inherit", color: "inherit", border: 0, background: "transparent", width: "100%" }}>
              <option value="apollo">Apollo Clinic (demo)</option>
              <option value="kims">KIMS Hospital (demo)</option>
            </select>
          </FieldCell>
          <FieldCell label={t("role")}>
            <select data-testid="login-role" value={role} onChange={(e) => setRole(e.target.value)}
              style={{ font: "inherit", color: "inherit", border: 0, background: "transparent", width: "100%" }}>
              <option>receptionist</option><option>physician</option><option>admin</option><option>billing</option>
            </select>
          </FieldCell>
          <Button data-testid="login-continue" onClick={() => login(tenant, role)}>{t("continue")}</Button>
          <div style={{ textAlign: "center", fontSize: 12, color: "var(--slate)", margin: "4px 0" }}>OR</div>
          <Button data-testid="login-oidc" onClick={() => loginWithOidc && loginWithOidc()} style={{ background: "var(--indigo)", color: "#fff" }}>
            Sign In with Keycloak (OIDC PKCE)
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ---------- Debounce Hook ---------- */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

/* ---------- Patients (REG slice: search, list, create) ---------- */
function Patients() {
  const { t } = useTranslation();
  const { token, role } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [given, setGiven] = useState("");
  const [family, setFamily] = useState("");

  void useDebounce; // (debounce removed from patient filter for deterministic e2e)

  const patients = useQuery({ queryKey: ["patients"], queryFn: () => api.listPatients(token) });
  const create = useMutation({
    mutationFn: () => api.createPatient(token, { given_name: given, family_name: family }),
    onSuccess: () => { setGiven(""); setFamily(""); qc.invalidateQueries({ queryKey: ["patients"] }); },
  });

  const canRegister = role === "receptionist" || role === "admin"; // IAM-002 mirror
  const filtered = (patients.data ?? []).filter((p) => {
    const text = `${p.given_name} ${p.family_name} ${p.national_id || ""}`.toLowerCase();
    const query = q.toLowerCase();
    return text.includes(query);
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <PageTitle>{t("patients_title")}</PageTitle>
        {canRegister && (
          <Link to="/patients/new" style={{ textDecoration: "none" }}>
            <Button>{t("register_patient_btn")}</Button>
          </Link>
        )}
      </div>

      <Card>
        <Input data-testid="patients-search" placeholder={t("search_placeholder")} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search patients" />
        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          {patients.isLoading && (
            <div style={{ display: "grid", gap: 10 }}>
              <Skeleton height={40} />
              <Skeleton height={40} />
              <Skeleton height={40} />
            </div>
          )}
          {patients.isError && (
            <div style={{ display: "grid", placeItems: "center", padding: 20, textAlign: "center" }}>
              <StatusPill kind="danger">{t("failed_to_load")}</StatusPill>
              <Button ghost style={{ marginTop: 12 }} onClick={() => patients.refetch()}>
                {t("retry")}
              </Button>
            </div>
          )}
          {!patients.isLoading && !patients.isError && filtered.map((p) => (
            <Link
              key={p.id}
              data-testid="patient-row"
              to={`/patients/${p.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderBottom: "1px dashed var(--line)",
                padding: "8px 0",
                textDecoration: "none",
                color: "inherit",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f7f9ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <strong>{p.given_name} {p.family_name}</strong>
              <span style={{ color: "var(--slate)", fontSize: 12.5 }}>{p.phone ?? "—"}</span>
              <span style={{ marginLeft: "auto" }}>
                <StatusPill kind={p.national_id ? "brand" : "info"}>
                  {p.national_id ? t("abha_linked") : t("no_abha")}
                </StatusPill>
              </span>
            </Link>
          ))}
          {!patients.isLoading && !patients.isError && filtered.length === 0 && (
            <div style={{ padding: "20px 0", textAlign: "center" }}>
              <div style={{ color: "var(--slate)" }}>{t("no_patients_match")}</div>
              {canRegister && (
                <div style={{ marginTop: 12 }}>
                  <Link to="/patients/new" style={{ textDecoration: "none" }}>
                    <Button ghost>{t("register")}</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {canRegister && (
        <Card style={{ marginTop: 18 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 12px" }}>{t("quick_register")}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10 }}>
            <Input placeholder={t("given_name")} value={given} onChange={(e) => setGiven(e.target.value)} aria-label="Given name" />
            <Input placeholder={t("family_name")} value={family} onChange={(e) => setFamily(e.target.value)} aria-label="Family name" />
            <Button disabled={!given || !family || create.isPending} onClick={() => create.mutate()}>
              {create.isPending ? t("saving") : t("register")}
            </Button>
          </div>
          <p style={{ fontSize: 12, color: "var(--slate)", marginBottom: 0 }}>
            {t("registration_disclaimer")}
          </p>
        </Card>
      )}
    </div>
  );
}

/* ---------- Design system reference ---------- */
function DesignSystem() {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  
  const [selectedChip, setSelectedChip] = useState("all");
  const [radioVal, setRadioVal] = useState("routine");
  const [dateVal, setDateVal] = useState("2026-07-21");
  const [selectVal, setSelectVal] = useState("in-consult");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const dateOptions = [
    { date: "2026-07-21", label: "21 Jul", sub: "Today" },
    { date: "2026-07-22", label: "22 Jul", sub: "Tomorrow" },
    { date: "2026-07-23", label: "23 Jul", sub: "Thu" },
  ];

  const radioOptions = [
    { value: "routine", label: "Routine" },
    { value: "urgent", label: "Urgent" },
    { value: "stat", label: "STAT (Emergency)" },
  ];

  return (
    <div>
      <PageTitle>{t("design_system_title")}</PageTitle>
      
      <div style={{ display: "grid", gap: 20 }}>
        
        {/* Section 1: Primitives */}
        <Card>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 12px", color: "var(--indigo)" }}>{t("buttons_statuses")}</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Button onClick={() => triggerToast("Clicked Primary Button!")}>{t("btn_primary")}</Button>
            <Button ghost onClick={() => triggerToast("Clicked Ghost Button!")}>{t("btn_ghost")}</Button>
            <Button disabled>{t("btn_disabled")}</Button>
            <StatusPill kind="brand">{t("status_brand")}</StatusPill>
            <StatusPill kind="info">{t("status_info")}</StatusPill>
            <StatusPill kind="warn">{t("status_warn")}</StatusPill>
            <StatusPill kind="success">{t("status_success")}</StatusPill>
            <StatusPill kind="danger">{t("status_danger")}</StatusPill>
          </div>
        </Card>

        {/* Section 2: Form & Selection Controls */}
        <Card>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 12px", color: "var(--indigo)" }}>{t("form_custom_inputs")}</h2>
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FieldCell label={t("field_specialty")} sub={t("specialty_sub")}>Cardiology</FieldCell>
              <FieldCell label={t("field_selected_date")} sub={t("selected_date_sub")}>{dateVal}</FieldCell>
            </div>
            
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>{t("dropdown_select")}</label>
              <Select value={selectVal} onChange={(e) => setSelectVal(e.target.value)}>
                <option value="arrived">Arrived</option>
                <option value="in-consult">In Consult</option>
                <option value="done">Completed</option>
              </Select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>{t("filter_chips")}</label>
              <div style={{ display: "flex", gap: 8 }}>
                <Chip active={selectedChip === "all"} onClick={() => setSelectedChip("all")}>{t("all_visits")}</Chip>
                <Chip active={selectedChip === "active"} onClick={() => setSelectedChip("active")}>{t("active")}</Chip>
                <Chip active={selectedChip === "billing"} onClick={() => setSelectedChip("billing")}>{t("pending_billing")}</Chip>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>{t("radio_pill_selector")}</label>
              <RadioPill options={radioOptions} value={radioVal} onChange={setRadioVal} name="priority" />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>{t("date_selection_chips")}</label>
              <DateChips options={dateOptions} value={dateVal} onChange={setDateVal} />
            </div>
          </div>
        </Card>

        {/* Section 3: Loading Skeletons */}
        <Card>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 12px", color: "var(--indigo)" }}>{t("loading_skeletons")}</h2>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Skeleton circular width={40} height={40} />
              <div style={{ flex: 1, display: "grid", gap: 6 }}>
                <Skeleton width="40%" height={16} />
                <Skeleton width="70%" height={12} />
              </div>
            </div>
            <Skeleton height={60} />
          </div>
        </Card>

        {/* Section 4: Interactive Overlays */}
        <Card>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 12px", color: "var(--indigo)" }}>{t("overlays_notifications")}</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <Button onClick={() => setModalOpen(true)}>{t("open_modal")}</Button>
            <Button ghost onClick={() => setDrawerOpen(true)}>{t("open_drawer")}</Button>
            <Button ghost onClick={() => triggerToast("Hello! This is a success notification toast.")}>{t("trigger_toast")}</Button>
          </div>
        </Card>

      </div>

      {/* Modal Demonstration */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={t("confirm_action")}>
        <p style={{ margin: "0 0 20px 0", color: "var(--ink)", fontSize: 14.5, lineHeight: 1.5 }}>
          {t("modal_desc")}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button ghost onClick={() => setModalOpen(false)}>{t("cancel")}</Button>
          <Button onClick={() => { setModalOpen(false); triggerToast("Action confirmed!"); }}>{t("confirm")}</Button>
        </div>
      </Modal>

      {/* Drawer Demonstration */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={t("patient_record_summary")}>
        <div style={{ display: "grid", gap: 16 }}>
          <FieldCell label={t("full_name")}>Venkata Rama Rao</FieldCell>
          <FieldCell label={t("abha_status")}>ABHA Linked (12-3456-7890)</FieldCell>
          <FieldCell label={t("mobile_number")}>+91 98765 43210</FieldCell>
          
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <Button style={{ width: "100%" }} onClick={() => { setDrawerOpen(false); triggerToast("Opened full EMR record!"); }}>
              {t("open_full_record")}
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Toast Notification */}
      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}

/* ---------- Role Gating Route Guard ---------- */
function RequireRole({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { t } = useTranslation();
  const { role } = useAuth();
  if (!role || !roles.includes(role)) {
    return (
      <Card style={{ margin: "40px auto", maxWidth: 500, textAlign: "center", padding: 32 }}>
        <StatusPill kind="danger">{t("access_denied")}</StatusPill>
        <h2 style={{ fontFamily: "var(--font-display)", marginTop: 16, marginBottom: 8, color: "var(--ink)" }}>{t("unauthorized_access")}</h2>
        <p style={{ color: "var(--slate)", fontSize: 14.5, marginBottom: 24 }}>
          {t("unauthorized_desc", { role: role || "none" })}
        </p>
        <Link to="/patients" style={{ display: "inline-block", background: "var(--indigo)", color: "#fff", textDecoration: "none", padding: "10px 24px", borderRadius: "var(--r-pill)", fontWeight: 800, fontSize: 13.5 }}>
          {t("return_to_patients")}
        </Link>
      </Card>
    );
  }
  return <>{children}</>;
}

/* ---------- Styled 404 NotFound ---------- */
function NotFound() {
  const { t } = useTranslation();
  return (
    <Card style={{ margin: "40px auto", maxWidth: 500, textAlign: "center", padding: 32 }}>
      <StatusPill kind="danger">{t("error_404")}</StatusPill>
      <h2 style={{ fontFamily: "var(--font-display)", marginTop: 16, marginBottom: 8, color: "var(--ink)" }}>{t("page_not_found")}</h2>
      <p style={{ color: "var(--slate)", fontSize: 14.5, marginBottom: 24 }}>
        {t("page_not_found_desc")}
      </p>
      <Link to="/patients" style={{ display: "inline-block", background: "var(--indigo)", color: "#fff", textDecoration: "none", padding: "10px 24px", borderRadius: "var(--r-pill)", fontWeight: 800, fontSize: 13.5 }}>
        {t("return_to_patients")}
      </Link>
    </Card>
  );
}

/* ---------- Stubs for routes ---------- */
function BillingStub() {
  const { t } = useTranslation();
  return (
    <div>
      <PageTitle>{t("billing_title")}</PageTitle>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0 }}>{t("pending_bills")}</h2>
          <StatusPill kind="warn">{t("awaiting_cash")}</StatusPill>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 8 }}>
            <span>Venkata Rama Rao (Consultation)</span>
            <strong>{formatRupees(500)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 8 }}>
            <span>Sita Devi (Lab - Complete Blood Count)</span>
            <strong>{formatRupees(350)}</strong>
          </div>
        </div>
      </Card>
    </div>
  );
}

function EMRStub() {
  const { t } = useTranslation();
  const { token } = useAuth();

  // Fetch Patients List
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api.listPatients(token),
  });

  return (
    <div>
      <PageTitle>{t("emr_title")}</PageTitle>
      <Card>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 12px" }}>{t("active_consultations")}</h2>
        <p style={{ color: "var(--slate)", fontSize: 14.5 }}>
          {t("emr_desc")}
        </p>

        {isLoading ? (
          <Skeleton height={50} />
        ) : (
          <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
            {patients.map((p: any) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px dashed var(--line)" }}>
                <span><strong>{p.given_name} {p.family_name}</strong> · {p.gender}, {p.dob || "Age N/A"}</span>
                <span style={{ marginLeft: "auto" }}>
                  <Link to={`/patients/${p.id}`}>
                    <Button type="button" style={{ fontSize: 12, padding: "4px 14px" }}>
                      Open EMR Chart
                    </Button>
                  </Link>
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function PatientWorkspace() {
  const { role } = useAuth();
  return role === "physician" ? <PatientSummary /> : <PatientDetail />;
}


/* ---------- App ---------- */
function App() {
  const { token } = useAuth();

  // Track page views in telemetry stub (UI-703)
  React.useEffect(() => {
    if (token) {
      telemetry.trackPageView(window.location.pathname);
    }
  }, [token, window.location.pathname]);

  if (!token) return <Login />;

  return (
    <Shell>
      <OfflineBanner />
      <React.Suspense fallback={<div style={{ padding: 40 }}><Skeleton height={200} /></div>}>
        <Routes>
          <Route path="/" element={<RoleHomeRedirect />} />
          <Route path="/my-schedule" element={
            <RequireRole roles={["physician", "nurse", "admin"]}>
              <MyScheduleView />
            </RequireRole>
          } />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/new" element={
            <RequireRole roles={["receptionist", "admin"]}>
              <PatientRegister />
            </RequireRole>
          } />
          <Route path="/patients/register" element={
            <RequireRole roles={["receptionist", "admin"]}>
              <PatientRegister />
            </RequireRole>
          } />
          <Route path="/patients/:id" element={<PatientWorkspace />} />

          <Route path="/emr/patients/:id/encounter/:encounterId" element={
            <RequireRole roles={["physician", "admin"]}>
              <EncounterNote />
            </RequireRole>
          } />

          <Route path="/emr/patients/:id/print" element={
            <RequireRole roles={["physician", "admin", "receptionist"]}>
              <VisitSummaryPrint />
            </RequireRole>
          } />

          <Route path="/orders/:id" element={
            <RequireRole roles={["physician", "admin", "receptionist"]}>
              <OrderCatalog />
            </RequireRole>
          } />

          <Route path="/results" element={
            <RequireRole roles={["physician", "admin"]}>
              <ResultsInbox />
            </RequireRole>
          } />

          <Route path="/billing/:id" element={
            <RequireRole roles={["receptionist", "admin", "billing"]}>
              <InvoiceScreen />
            </RequireRole>
          } />

          <Route path="/referrals/timeline/:id" element={
            <RequireRole roles={["physician", "admin", "receptionist"]}>
              <ReferralTimeline />
            </RequireRole>
          } />

          <Route path="/portal" element={
            <RequireRole roles={["patient", "admin"]}>
              <PatientPortal />
            </RequireRole>
          } />

          <Route path="/portal/intake/:apptId" element={
            <RequireRole roles={["patient", "admin"]}>
              <IntakeForms />
            </RequireRole>
          } />

          <Route path="/dashboard" element={
            <RequireRole roles={["receptionist", "admin"]}>
              <OpsDashboard />
            </RequireRole>
          } />

          <Route path="/reports/referrals" element={
            <RequireRole roles={["billing", "admin"]}>
              <ReferralAnalytics />
            </RequireRole>
          } />
          
          <Route path="/scheduling" element={
            <RequireRole roles={["receptionist", "admin"]}>
              <CalendarView />
            </RequireRole>
          } />

          <Route path="/scheduling/book" element={
            <RequireRole roles={["receptionist", "admin"]}>
              <CalendarView />
            </RequireRole>
          } />

          <Route path="/checkin" element={
            <RequireRole roles={["receptionist", "admin", "physician"]}>
              <QueueBoard />
            </RequireRole>
          } />

          <Route path="/scheduling/checkin" element={
            <RequireRole roles={["receptionist", "admin", "physician"]}>
              <QueueBoard />
            </RequireRole>
          } />

          <Route path="/queue" element={
            <RequireRole roles={["receptionist", "admin", "physician"]}>
              <QueueBoard />
            </RequireRole>
          } />

          <Route path="/billing" element={
            <RequireRole roles={["receptionist", "admin", "billing"]}>
              <InvoiceScreen />
            </RequireRole>
          } />
          
          <Route path="/emr" element={
            <RequireRole roles={["physician", "admin"]}>
              <EMRStub />
            </RequireRole>
          } />
          
          <Route path="/settings" element={
            <RequireRole roles={["admin"]}>
              <TenantSettings />
            </RequireRole>
          } />

          <Route path="/settings/reminders" element={
            <RequireRole roles={["admin"]}>
              <ReminderPreview />
            </RequireRole>
          } />
          
          <Route path="/tenants" element={<TenantManagementScreen token={token} />} />
          <Route path="/onboarding" element={<OnboardingWizardScreen token={token} />} />
          <Route path="/ops-control" element={<OperationalControlScreen token={token} />} />

          <Route path="/callback" element={<div style={{ padding: 40, textAlign: "center", color: "var(--indigo)", fontWeight: 700 }}>Completing Keycloak OIDC Authentication...</div>} />
          <Route path="/design" element={<DesignSystem />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
    </Shell>
  );
}

async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCKS === "true") {
    const { worker } = await import("./api/msw/browser");
    return worker.start({
      onUnhandledRequest: "bypass",
    });
  }
}

const qc = new QueryClient();

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={qc}>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
});
