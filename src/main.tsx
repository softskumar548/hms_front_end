import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import "./ui/tokens.css";
import i18n from "./i18n";
import { useTranslation, I18nextProvider } from "react-i18next";
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
const OperatorDashboardScreen = React.lazy(() => import("./features/tenants/OperatorDashboardScreen").then(m => ({ default: m.OperatorDashboardScreen })));
const OperatorInsightsScreen = React.lazy(() => import("./features/tenants/OperatorInsightsScreen").then(m => ({ default: m.OperatorInsightsScreen })));
const OperatorProfileScreen = React.lazy(() => import("./features/tenants/OperatorProfileScreen").then(m => ({ default: m.OperatorProfileScreen })));
const MyScheduleView = React.lazy(() => import("./features/scheduling/MyScheduleView"));
const QueueDisplayScreen = React.lazy(() => import("./features/scheduling/QueueDisplayScreen"));
const InpatientBedMatrixScreen = React.lazy(() => import("./features/inpatient/InpatientBedMatrixScreen"));
import { OperatorSidebar } from "./features/tenants/OperatorSidebar";
import { AppSidebar } from "./ui/AppSidebar";

function RoleHomeRedirect() {
  const { role } = useAuth();
  if (role === "receptionist") return <Navigate to="/queue" replace />;
  if (role === "physician" || role === "doctor" || role === "nurse") return <Navigate to="/my-schedule" replace />;
  if (role === "billing") return <Navigate to="/billing" replace />;
  if (role === "admin") return <Navigate to="/dashboard" replace />;
  if (role === "operator") return <Navigate to="/operator/dashboard" replace />;
  if (role === "patient") return <Navigate to="/portal" replace />;
  return <Navigate to="/queue" replace />;
}

function formatHeaderDateTime(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, "0");

  return `${day} ${month} ${year} - ${hoursStr}:${minutes} ${ampm}`;
}

/* ---------- Shell ---------- */
function Shell({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const { tenant, role, logout } = useAuth();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("hms_sidebar_collapsed") === "true";
  });

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Universal dismissal of Profile Menu on Escape key or Click Outside
  useEffect(() => {
    if (!profileOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setProfileOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("hms_sidebar_collapsed", String(next));
      return next;
    });
  };

  const isOperatorRoute =
    role === "operator" ||
    location.pathname.startsWith("/operator") ||
    location.pathname.startsWith("/tenants") ||
    location.pathname.startsWith("/onboarding") ||
    location.pathname.startsWith("/ops-control");

  const isPatientRoute = role === "patient" || location.pathname.startsWith("/portal");
  const isDisplayRoute = location.pathname === "/queue/display";

  if (isDisplayRoute) {
    return <div data-theme="trusted-clinical">{children}</div>;
  }

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--wash-a, #F8FAFC)" }}>
      {/* Sticky Top Header */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid var(--line, #E2E8F0)",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          position: "sticky",
          top: 0,
          zIndex: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <Link
          to={isOperatorRoute ? "/operator/dashboard" : "/"}
          style={{
            textDecoration: "none",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 24,
            color: "var(--indigo)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ background: "var(--indigo)", color: "#fff", padding: "4px 10px", borderRadius: 8, fontSize: 16 }}>
            MediGo
          </span>
          <span>{isOperatorRoute ? "Operator Console" : isPatientRoute ? "Patient Portal" : "MediGo HMS"}</span>
        </Link>

        {isOperatorRoute && (
          <span style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>PHI-Free Operator Session</span>
        )}

        {/* Right side controls */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          {/* Live Date & Time: DD MMM YYYY - HH:MM AM/PM */}
          <span
            data-testid="header-live-clock"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--slate, #5B6172)",
              fontFamily: "monospace",
              background: "var(--wash-a, #F6FAFF)",
              padding: "5px 12px",
              borderRadius: "var(--r-pill, 999px)",
              border: "1px solid var(--line, #E2E8F0)",
            }}
          >
            🕒 {formatHeaderDateTime(currentDateTime)}
          </span>

          <span style={{ height: 16, width: 1, background: "var(--line)" }}></span>

          {/* Tenant and Role info */}
          <span
            data-testid="shell-tenant-indicator"
            style={{ fontSize: 12.5, fontWeight: 700, color: "var(--indigo)" }}
          >
            {tenant} · {role}
          </span>

          <span style={{ height: 16, width: 1, background: "var(--line)" }}></span>

          {/* Language Selector preserved */}
          <select
            value={i18n.language}
            onChange={handleLangChange}
            style={{
              border: "1px solid var(--line)",
              borderRadius: 6,
              padding: "4px 8px",
              fontSize: 12,
              fontWeight: 700,
              background: "#fff",
              color: "var(--indigo)",
              cursor: "pointer",
            }}
            aria-label="Select language"
          >
            <option value="en">EN</option>
            <option value="te">TE</option>
          </select>

          <span style={{ height: 16, width: 1, background: "var(--line)" }}></span>

          {/* Profile Icon with Dropdown Menu */}
          <div ref={profileRef} style={{ position: "relative" }}>
            <button
              type="button"
              data-testid="profile-dropdown-btn"
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--indigo, #131A8F)",
                color: "#ffffff",
                border: "2px solid var(--indigo-soft, #E4E9FF)",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(19, 26, 143, 0.25)",
              }}
              title="User Profile & Settings"
            >
              👤
            </button>

            {profileOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  background: "#ffffff",
                  borderRadius: "var(--r-card, 16px)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                  border: "1px solid var(--line, #E2E8F0)",
                  width: 270,
                  padding: 16,
                  zIndex: 99999,
                  display: "grid",
                  gap: 12,
                }}
              >
                {/* User Info Header */}
                <div style={{ borderBottom: "1px solid var(--line, #E2E8F0)", paddingBottom: 10 }}>
                  <strong style={{ fontSize: 14.5, color: "var(--indigo, #131A8F)", display: "block" }}>
                    {role === "admin" ? "DR K R MURALI (Dean)" : `${role?.toUpperCase()} USER`}
                  </strong>
                  <span style={{ fontSize: 12, color: "var(--slate)", display: "block", marginTop: 2 }}>
                    {role === "admin" ? "drkrmurali9090@yopmail.com" : `${role}@${tenant}.com`}
                  </span>
                  <div style={{ marginTop: 8 }}>
                    <StatusPill kind="brand">{tenant} · {role}</StatusPill>
                  </div>
                </div>

                {/* Profile Links */}
                <div style={{ display: "grid", gap: 4 }}>
                  {role === "operator" ? (
                    <>
                      <Link
                        to="/operator/profile?tab=profile"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          textDecoration: "none",
                          color: "var(--ink)",
                          fontSize: 13,
                          fontWeight: 600,
                          padding: "8px 10px",
                          borderRadius: 8,
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--wash-a)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <span>👤</span> Profile
                      </Link>

                      <Link
                        to="/operator/profile?tab=security"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          textDecoration: "none",
                          color: "var(--ink)",
                          fontSize: 13,
                          fontWeight: 600,
                          padding: "8px 10px",
                          borderRadius: 8,
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--wash-a)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <span>🔑</span> Password Reset
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/settings?tab=account"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          textDecoration: "none",
                          color: "var(--ink)",
                          fontSize: 13,
                          fontWeight: 600,
                          padding: "8px 10px",
                          borderRadius: 8,
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--wash-a)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <span>👤</span> Profile
                      </Link>

                      <Link
                        to="/settings?tab=auth"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          textDecoration: "none",
                          color: "var(--ink)",
                          fontSize: 13,
                          fontWeight: 600,
                          padding: "8px 10px",
                          borderRadius: 8,
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--wash-a)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <span>🔑</span> Password Reset
                      </Link>

                      <Link
                        to="/settings?tab=brand"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          textDecoration: "none",
                          color: "var(--ink)",
                          fontSize: 13,
                          fontWeight: 600,
                          padding: "8px 10px",
                          borderRadius: 8,
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--wash-a)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <span>🎨</span> Brand Settings
                      </Link>

                      <Link
                        to="/settings?tab=print"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          textDecoration: "none",
                          color: "var(--ink)",
                          fontSize: 13,
                          fontWeight: 600,
                          padding: "8px 10px",
                          borderRadius: 8,
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--wash-a)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <span>🖨️</span> Print Settings
                      </Link>
                    </>
                  )}
                </div>

                <div style={{ borderTop: "1px solid var(--line, #E2E8F0)", paddingTop: 10 }}>
                  <button
                    type="button"
                    data-testid="logout-btn"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    style={{
                      width: "100%",
                      background: "#FEE2E2",
                      color: "#B91C1C",
                      border: "none",
                      borderRadius: "var(--r-pill, 999px)",
                      padding: "8px 14px",
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    🚪 {t("logout")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      {isOperatorRoute ? (
        <div data-theme="trusted-clinical" style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 65px)", background: "var(--wash-a, #F8FAFC)" }}>
          <OperatorSidebar />
          <main style={{ flex: 1, padding: "24px 28px", maxWidth: 1200 }}>{children}</main>
        </div>
      ) : isPatientRoute ? (
        <div style={{ flex: 1, maxWidth: 1080, margin: "0 auto", padding: "26px 20px", width: "100%" }}>
          <main>{children}</main>
        </div>
      ) : (
        <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 65px)", background: "var(--wash-a, #F8FAFC)" }}>
          <AppSidebar collapsed={sidebarCollapsed} onToggleCollapse={handleToggleSidebar} />
          <main style={{ flex: 1, padding: "24px 28px", maxWidth: 1160, overflowX: "hidden" }}>{children}</main>
        </div>
      )}
    </div>
  );
}

/* ---------- Login Screen (per HMS-Login-Screen-Spec.docx) ---------- */
function Login() {
  const { t, i18n } = useTranslation();
  const { login, loginWithOidc, sessionExpired } = useAuth();
  const [tenant, setTenant] = useState("apollo");
  const [role, setRole] = useState("receptionist");
  const [showDevPicker, setShowDevPicker] = useState(false);
  const [currentLng, setCurrentLng] = useState(i18n.language?.startsWith("te") ? "te" : "en");

  const isDevAllowed = import.meta.env.DEV || import.meta.env.VITE_ALLOW_DEV_TOKENS === "true";

  const handleLangToggle = (lng: string) => {
    setCurrentLng(lng);
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--wash-a) 0%, var(--wash-b) 100%)", padding: 20 }}>
      <Card style={{ width: "100%", maxWidth: 420, padding: 36, position: "relative", boxShadow: "var(--shadow-card)", borderRadius: 22 }}>
        {/* Top Header: Language Switcher & MediGo Logo */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ background: "var(--indigo)", color: "#FFF", borderRadius: 10, padding: "6px 12px", fontWeight: 800, fontSize: 16, fontFamily: "var(--font-display, 'Baloo 2', sans-serif)" }}>
                MediGo
              </div>
              <span style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", fontSize: 24, fontWeight: 700, color: "var(--indigo)" }}>
                MediGo HMS
              </span>
            </div>
            <p style={{ color: "var(--slate)", fontSize: 14, margin: 0 }}>
              {t("login_tagline")}
            </p>
          </div>

          {/* Language Selector Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#F6FAFF", padding: 3, borderRadius: 999, border: "1px solid var(--line)" }}>
            <button
              onClick={() => handleLangToggle("en")}
              style={{
                background: currentLng === "en" ? "var(--indigo)" : "transparent",
                color: currentLng === "en" ? "#FFF" : "var(--slate)",
                border: "none",
                borderRadius: 999,
                padding: "4px 10px",
                fontWeight: 700,
                fontSize: 11,
                cursor: "pointer"
              }}
            >
              EN
            </button>
            <button
              onClick={() => handleLangToggle("te")}
              style={{
                background: currentLng === "te" ? "var(--indigo)" : "transparent",
                color: currentLng === "te" ? "#FFF" : "var(--slate)",
                border: "none",
                borderRadius: 999,
                padding: "4px 10px",
                fontWeight: 700,
                fontSize: 11,
                cursor: "pointer"
              }}
            >
              TE
            </button>
          </div>
        </div>

        {sessionExpired && (
          <div style={{ marginBottom: 20 }}>
            <StatusPill kind="danger">{t("session_expired")}</StatusPill>
          </div>
        )}

        {/* Primary Production Action Button */}
        <Button
          data-testid="login-oidc"
          onClick={() => loginWithOidc && loginWithOidc()}
          style={{
            background: "var(--indigo)",
            color: "#FFF",
            width: "100%",
            padding: "14px",
            borderRadius: 999,
            fontWeight: 800,
            fontSize: 16,
            marginBottom: isDevAllowed ? 16 : 0,
            boxShadow: "0 6px 18px rgba(19, 26, 143, 0.25)"
          }}
        >
          {t("login_primary_cta")}
        </Button>

        {/* Developer Login Disclosure (Only when environment allows dev tokens) */}
        {isDevAllowed && (
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, marginTop: 12 }}>
            <button
              onClick={() => setShowDevPicker(!showDevPicker)}
              style={{
                background: "none",
                border: "none",
                color: "var(--slate)",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: 6,
                margin: "0 auto 12px"
              }}
            >
              <span>{t("dev_login_toggle")}</span>
              <span style={{ fontSize: 10 }}>{showDevPicker ? "▴" : "▾"}</span>
            </button>

            {showDevPicker && (
              <div style={{ display: "grid", gap: 12, background: "#F6FAFF", padding: 16, borderRadius: 16, border: "1px solid var(--line)" }}>
                <p style={{ color: "var(--slate)", fontSize: 11.5, margin: 0, textAlign: "center" }}>
                  {t("dev_login_desc")}
                </p>

                <FieldCell label={t("tenant")}>
                  <select
                    data-testid="login-tenant"
                    value={tenant}
                    onChange={(e) => setTenant(e.target.value)}
                    style={{ font: "inherit", color: "inherit", border: 0, background: "transparent", width: "100%", fontWeight: 700 }}
                  >
                    <option value="apollo">Apollo Clinic (demo)</option>
                    <option value="kims">KIMS Hospital (demo)</option>
                  </select>
                </FieldCell>

                <FieldCell label={t("role")}>
                  <select
                    data-testid="login-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ font: "inherit", color: "inherit", border: 0, background: "transparent", width: "100%", fontWeight: 700 }}
                  >
                    <option value="receptionist">receptionist</option>
                    <option value="physician">physician</option>
                    <option value="billing">billing</option>
                    <option value="admin">admin</option>
                    <option value="operator">operator</option>
                    <option value="patient">patient</option>
                  </select>
                </FieldCell>

                <Button
                  data-testid="login-continue"
                  onClick={() => login(tenant, role)}
                  style={{ background: "#E4E9FF", color: "var(--indigo)", border: "1px solid var(--line)", fontWeight: 700, padding: "10px" }}
                >
                  {t("continue")}
                </Button>
              </div>
            )}
          </div>
        )}
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
  const { token, role } = useAuth();
  const [emrSearch, setEmrSearch] = useState("");
  const [emrFilter, setEmrFilter] = useState("all");

  // Fetch Patients List
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api.listPatients(token),
  });

  const filteredPatients = patients.filter((p: any) => {
    const q = emrSearch.toLowerCase();
    const fullName = `${p.given_name || ""} ${p.family_name || ""}`.toLowerCase();
    const phone = (p.phone || "").toLowerCase();
    const natId = (p.national_id || "").toLowerCase();
    return fullName.includes(q) || phone.includes(q) || natId.includes(q);
  });

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Top Breadcrumb Banner */}
      <div
        style={{
          background: "#00BCD4",
          borderRadius: "14px 14px 0 0",
          padding: "12px 20px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🩺</span>
          <span>Doctor Consultation & EMR Clinical Workstation</span>
        </div>
        <div style={{ fontSize: 12, background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20 }}>
          Live Queue · Dr. K R Murali (Dean) · Chamber 101
        </div>
      </div>

      {/* Top Clinical KPI Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <Card style={{ padding: "14px 18px", borderLeft: "4px solid var(--indigo)" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Total Consultations</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>{patients.length}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Registered</span>
          </div>
        </Card>

        <Card style={{ padding: "14px 18px", borderLeft: "4px solid #F59E0B" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Waiting in Queue</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#F59E0B" }}>{Math.max(1, Math.floor(patients.length / 2))}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Avg wait: 8 mins</span>
          </div>
        </Card>

        <Card style={{ padding: "14px 18px", borderLeft: "4px solid #16A34A" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Completed Today</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#16A34A" }}>{Math.max(2, Math.floor(patients.length / 3))}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Signed notes</span>
          </div>
        </Card>

        <Card style={{ padding: "14px 18px", borderLeft: "4px solid #DC2626" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Emergency Triage</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#DC2626" }}>1</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Priority acute</span>
          </div>
        </Card>
      </div>

      {/* Main Patient Roster Card */}
      <Card style={{ borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <Input
            placeholder="Search patient by name, phone, ABHA ID..."
            value={emrSearch}
            onChange={(e) => setEmrSearch(e.target.value)}
            style={{ width: 320 }}
          />

          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/scheduling" style={{ textDecoration: "none" }}>
              <Button ghost type="button">📅 View Schedule</Button>
            </Link>
            <Link to="/patients/new" style={{ textDecoration: "none" }}>
              <Button type="button">+ Quick Register Patient</Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: "grid", gap: 10 }}>
            <Skeleton height={50} />
            <Skeleton height={50} />
            <Skeleton height={50} />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Token / Patient</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Contact & ABHA</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Visit Type</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Triage Status</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Clinical Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p: any, idx: number) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    {/* Patient Name & Avatar */}
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "var(--indigo-soft)",
                            color: "var(--indigo)",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 800,
                            fontSize: 13,
                          }}
                        >
                          T-{String(idx + 1).padStart(2, "0")}
                        </div>
                        <div>
                          <strong style={{ display: "block", color: "var(--ink)", fontSize: 13.5 }}>
                            {p.given_name} {p.family_name}
                          </strong>
                          <span style={{ fontSize: 11.5, color: "var(--slate)" }}>
                            {p.gender || "M"}, {p.dob || "Adult"} · <span style={{ fontFamily: "monospace" }}>{p.id?.slice(0, 8)}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact & ABHA */}
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600 }}>📞 +91 {p.phone || "9876543210"}</div>
                      <div style={{ fontSize: 11, color: "var(--slate)", fontFamily: "monospace" }}>
                        {p.national_id ? `ABHA: ${p.national_id}` : "ABHA not linked"}
                      </div>
                    </td>

                    {/* Visit Type */}
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontWeight: 600, color: "var(--indigo)" }}>
                        {idx % 3 === 0 ? "New OPD Consultation" : idx % 3 === 1 ? "Follow-up Review" : "Telehealth Video"}
                      </span>
                      <div style={{ fontSize: 11, color: "var(--slate)" }}>General Medicine · Chamber 101</div>
                    </td>

                    {/* Triage Status */}
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <StatusPill kind={idx === 0 ? "warn" : idx === 1 ? "brand" : "success"}>
                        {idx === 0 ? "ARRIVED (WAITING)" : idx === 1 ? "IN-CONSULT" : "COMPLETED"}
                      </StatusPill>
                    </td>

                    {/* Clinical Actions */}
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 8 }}>
                        <Link to={`/patients/${p.id}`} style={{ textDecoration: "none" }}>
                          <Button
                            type="button"
                            style={{
                              background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)",
                              color: "#fff",
                              fontSize: 12,
                              padding: "6px 14px",
                            }}
                          >
                            🩺 Open EMR Chart
                          </Button>
                        </Link>

                        <Link to={`/emr/patients/${p.id}/print`} style={{ textDecoration: "none" }}>
                          <Button
                            ghost
                            type="button"
                            style={{ fontSize: 12, padding: "6px 12px" }}
                          >
                            🖨️ Rx Stub
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 30, textAlign: "center", color: "var(--slate)" }}>
                      No patients found matching search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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

          <Route path="/queue/display" element={<QueueDisplayScreen />} />

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

          <Route path="/inpatient" element={
            <RequireRole roles={["admin", "physician", "doctor", "nurse", "receptionist"]}>
              <InpatientBedMatrixScreen />
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

          <Route path="/operator" element={<Navigate to="/operator/dashboard" replace />} />
          <Route path="/operator/dashboard" element={
            <RequireRole roles={["operator", "admin"]}>
              <OperatorDashboardScreen token={token} />
            </RequireRole>
          } />
          <Route path="/operator/profile" element={
            <RequireRole roles={["operator", "admin"]}>
              <OperatorProfileScreen token={token} />
            </RequireRole>
          } />
          <Route path="/operator/insights" element={
            <RequireRole roles={["operator", "admin"]}>
              <OperatorInsightsScreen token={token} />
            </RequireRole>
          } />
          <Route path="/tenants" element={
            <RequireRole roles={["operator", "admin"]}>
              <TenantManagementScreen token={token} />
            </RequireRole>
          } />
          <Route path="/onboarding" element={
            <RequireRole roles={["operator", "admin"]}>
              <OnboardingWizardScreen token={token} />
            </RequireRole>
          } />
          <Route path="/ops-control" element={
            <RequireRole roles={["operator", "admin"]}>
              <OperationalControlScreen token={token} />
            </RequireRole>
          } />
          <Route path="/ops-control/suspend" element={
            <RequireRole roles={["operator", "admin"]}>
              <OperationalControlScreen token={token} />
            </RequireRole>
          } />

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
          <I18nextProvider i18n={i18n}>
            <AuthProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </AuthProvider>
          </I18nextProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
});
