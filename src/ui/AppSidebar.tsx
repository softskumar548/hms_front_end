import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({ collapsed, onToggleCollapse }: AppSidebarProps) {
  const location = useLocation();
  const { role } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "";

  // Track accordion open/close state for expandable sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    return {
      outpatient: location.pathname.startsWith("/emr") || location.pathname.startsWith("/queue") || location.pathname.startsWith("/patients") || location.pathname.startsWith("/scheduling") || location.pathname.startsWith("/billing"),
      inpatient: location.pathname.startsWith("/inpatient"),
      lab: location.pathname.startsWith("/lab") || location.pathname.startsWith("/results"),
      pharmacy: location.pathname.startsWith("/pharmacy"),
      radiology: location.pathname.startsWith("/radiology") || location.pathname.startsWith("/orders"),
      nabh: location.pathname.startsWith("/nabh"),
      crm: location.pathname.startsWith("/portal") || location.pathname.startsWith("/telehealth"),
      more: location.pathname.startsWith("/emergency") || location.pathname.startsWith("/ot") || location.pathname.startsWith("/blood-bank") || location.pathname.startsWith("/dietary") || location.pathname.startsWith("/print-station"),
      admin: location.pathname.startsWith("/settings"),
      hr: location.pathname.startsWith("/hr"),
      reports: location.pathname.startsWith("/reports"),
    };
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isCurrent = (path: string, tab?: string) => {
    if (tab) {
      return location.pathname === "/settings" && currentTab === tab;
    }
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/";
    }
    if (path === "/settings") {
      return location.pathname === "/settings" && !currentTab;
    }
    return location.pathname.startsWith(path);
  };

  // Section item styling helper
  const renderParentItem = (
    key: string,
    label: string,
    iconSvg: React.ReactNode,
    primaryPath: string,
    hasSubmenu: boolean,
    subItems?: { label: string; path: string; tab?: string }[]
  ) => {
    const isSectionActive = isCurrent(primaryPath) || (subItems && subItems.some((s) => isCurrent(s.path, s.tab)));
    const isOpen = !!openSections[key];

    return (
      <div key={key} style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: collapsed ? "9px 0" : "8px 10px",
            borderRadius: 8,
            cursor: "pointer",
            background: isSectionActive && !isOpen ? "var(--indigo-soft)" : "transparent",
            color: isSectionActive ? "var(--indigo)" : "var(--ink)",
            fontWeight: isSectionActive ? 800 : 600,
            fontSize: 13.5,
            transition: "all 0.15s ease",
          }}
          onClick={() => {
            if (hasSubmenu) {
              if (!collapsed) toggleSection(key);
            }
          }}
        >
          {/* Left part: Icon + Label (Wrapped in Link if no submenu, or Link for primary) */}
          <Link
            to={primaryPath}
            title={collapsed ? label : undefined}
            onClick={(e) => {
              if (hasSubmenu && !collapsed) {
                // If it has submenu, let the accordion toggle handle it without hijacking
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "inherit",
              flex: 1,
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22 }}>
              {iconSvg}
            </span>
            {!collapsed && <span>{label}</span>}
          </Link>

          {/* Right Chevron for submenus (only in expanded mode) */}
          {hasSubmenu && !collapsed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleSection(key);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--slate)",
                cursor: "pointer",
                padding: "2px 4px",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                lineHeight: 1,
              }}
            >
              {key === "admin" ? (isOpen ? "▾" : "▸") : (isOpen ? "▾" : "›")}
            </button>
          )}
        </div>

        {/* Submenu child links (rendered when open & not collapsed) */}
        {hasSubmenu && !collapsed && isOpen && subItems && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              marginTop: 2,
              marginBottom: 4,
              paddingLeft: 22,
              borderLeft: "2px solid var(--wash-b)",
              marginLeft: 18,
            }}
          >
            {subItems.map((sub, idx) => {
              const active = isCurrent(sub.path, sub.tab);
              return (
                <Link
                  key={idx}
                  to={sub.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "6px 10px",
                    borderRadius: 6,
                    textDecoration: "none",
                    background: active ? "var(--indigo-soft)" : "transparent",
                    color: active ? "var(--indigo)" : "var(--slate)",
                    fontWeight: active ? 800 : 500,
                    fontSize: 12.5,
                    transition: "all 0.12s ease",
                  }}
                >
                  <span>{sub.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      data-testid="app-sidebar"
      style={{
        width: collapsed ? 72 : 240,
        minWidth: collapsed ? 72 : 240,
        background: "#ffffff",
        borderRight: "1px solid var(--line, #E2E8F0)",
        padding: collapsed ? "14px 6px" : "14px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "var(--shadow-card)",
        transition: "width 0.22s cubic-bezier(0.4, 0, 0.2, 1), padding 0.22s ease",
        userSelect: "none",
        position: "sticky",
        top: 65,
        height: "calc(100vh - 65px)",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Sidebar Header: Toggle Button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: "0 4px 10px 4px",
          borderBottom: "1px solid var(--line, #E2E8F0)",
        }}
      >
        {!collapsed && (
          <span style={{ fontSize: 11, fontWeight: 800, color: "var(--slate)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            MediGo Navigation
          </span>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            background: "var(--wash-a)",
            border: "1px solid var(--line)",
            color: "var(--indigo)",
            borderRadius: "var(--r-pill)",
            width: 26,
            height: 26,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 800,
            transition: "background 0.15s ease",
          }}
        >
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      {/* Main Menu List in Exact Hierarchy */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* 1. Dashboard */}
        {renderParentItem(
          "dashboard",
          "Dashboard",
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>,
          "/dashboard",
          false
        )}

        {/* 2. AI Insight */}
        {renderParentItem(
          "insights",
          "AI Insight",
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>,
          "/insights",
          false
        )}

        {/* 3. Out-Patient */}
        {renderParentItem(
          "outpatient",
          "Out-Patient",
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3" />
            <path d="M9 12.5v3.5a4 4 0 0 0 4 4h1a4 4 0 0 0 4-4v-1.5" />
            <circle cx="18" cy="14" r="2" />
          </svg>,
          "/queue",
          true,
          [
            { label: "Doctor EMR Launchpad", path: "/emr" },
            { label: "Queue Board & Tokens", path: "/queue" },
            { label: "Waiting Lounge TV Display", path: "/queue/display" },
            { label: "Appointment Scheduling", path: "/scheduling" },
            { label: "Patients Directory", path: "/patients" },
            { label: "Quick Register Patient", path: "/patients/new" },
            { label: "Billing & Cashier Till", path: "/billing" },
          ]
        )}

        {/* 4. In-Patient */}
        {renderParentItem(
          "inpatient",
          "In-Patient",
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4v16" />
            <path d="M2 8h18a2 2 0 0 1 2 2v10" />
            <path d="M2 17h20" />
            <circle cx="6" cy="11" r="2" />
          </svg>,
          "/inpatient",
          true,
          [
            { label: "Visual Bed Matrix & Wards", path: "/inpatient" },
            { label: "Ward Transfers & Daily Tariff", path: "/inpatient" },
            { label: "Admission & Discharge Clearance", path: "/inpatient" },
          ]
        )}

        {/* 5. Lab Management */}
        {renderParentItem(
          "lab",
          "Lab Management",
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2v7.31a2 2 0 0 1-.59 1.41L4.2 16.03A3 3 0 0 0 6.32 21h11.36a3 3 0 0 0 2.12-4.97l-5.21-5.31A2 2 0 0 1 14 9.31V2" />
            <line x1="8" y1="2" x2="16" y2="2" />
            <line x1="7" y1="15" x2="17" y2="15" />
          </svg>,
          "/lab",
          true,
          [
            { label: "Pathology Workstation", path: "/lab" },
            { label: "Phlebotomy Intake Queue", path: "/lab" },
            { label: "Results Inbox & Panic Alerts", path: "/results" },
          ]
        )}

        {/* 6. Pharmacy */}
        {renderParentItem(
          "pharmacy",
          "Pharmacy",
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
          </svg>,
          "/pharmacy",
          true,
          [
            { label: "Dispensary POS & Checkout", path: "/pharmacy" },
            { label: "Rx Dispensing Queue", path: "/pharmacy" },
            { label: "FEFO Multi-Batch Inventory", path: "/pharmacy" },
          ]
        )}

        {/* 7. Radiology */}
        {renderParentItem(
          "radiology",
          "Radiology",
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="2.5" />
            <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(30 12 12)" />
            <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-30 12 12)" />
          </svg>,
          "/radiology",
          true,
          [
            { label: "Modality Worklist & Orders", path: "/radiology" },
            { label: "PACS Imaging & Reports", path: "/radiology" },
          ]
        )}

        {/* 8. Feedbacks */}
        {renderParentItem(
          "feedbacks",
          "Feedbacks",
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>,
          "/feedbacks",
          false
        )}

        {/* 9. NABH */}
        {renderParentItem(
          "nabh",
          "NABH",
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>,
          "/nabh",
          true,
          [
            { label: "Quality Indicators (QI)", path: "/nabh" },
            { label: "Infection Control (HIC)", path: "/nabh" },
            { label: "WHO Safety Checklist Audit", path: "/ot" },
          ]
        )}

        {/* 10. CRM */}
        {renderParentItem(
          "crm",
          "CRM",
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 6.1H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2v3l4-3h8a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1Z" />
            <path d="M22 4h-8a1 1 0 0 0-1 1v1h6a2 2 0 0 1 2 2v6h1a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1Z" />
          </svg>,
          "/portal",
          true,
          [
            { label: "Patient Portal & Intake", path: "/portal" },
            { label: "Telehealth Video Consultations", path: "/telehealth" },
            { label: "Referral Partner Network", path: "/reports/referrals" },
          ]
        )}

        {/* 11. More */}
        {renderParentItem(
          "more",
          "More",
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BE123C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>,
          "/emergency",
          true,
          [
            { label: "Emergency Casualty & Triage", path: "/emergency" },
            { label: "Operation Theatre Complex", path: "/ot" },
            { label: "Blood Bank & Serology", path: "/blood-bank" },
            { label: "Dietary & Clinical Nutrition", path: "/dietary" },
            { label: "Hospital Print Station", path: "/print-station" },
          ]
        )}

        {/* 12. Admin */}
        {renderParentItem(
          "admin",
          "Admin",
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 11c0 3-3 6-3 6s-3-3-3-6a3 3 0 1 1 6 0z" />
          </svg>,
          "/settings?tab=config",
          true,
          [
            { label: "Configuration", path: "/settings?tab=config", tab: "config" },
            { label: "Account Settings", path: "/settings?tab=account", tab: "account" },
            { label: "Users & Staff Directory", path: "/settings?tab=users", tab: "users" },
            { label: "User Authentication", path: "/settings?tab=auth", tab: "auth" },
            { label: "Payment Rails & PMJAY", path: "/settings?tab=payment", tab: "payment" },
            { label: "Online Services & ABDM", path: "/settings?tab=online", tab: "online" },
          ]
        )}

        {/* 13. HR & PayRoll (Exact 11 sub-items matching screenshot) */}
        {renderParentItem(
          "hr",
          "HR & PayRoll",
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>,
          "/hr?tab=employees",
          true,
          [
            { label: "Employees", path: "/hr?tab=employees", tab: "employees" },
            { label: "Doctors", path: "/hr?tab=doctors", tab: "doctors" },
            { label: "Referrals", path: "/reports/referrals" },
            { label: "Doctor Ratings", path: "/feedbacks" },
            { label: "Payroll Dashboard", path: "/hr?tab=payroll-dashboard", tab: "payroll-dashboard" },
            { label: "Payroll List", path: "/hr?tab=payroll-list", tab: "payroll-list" },
            { label: "Employee Salary", path: "/hr?tab=employee-salary", tab: "employee-salary" },
            { label: "Timesheet", path: "/hr?tab=timesheet", tab: "timesheet" },
            { label: "Attendance Dashboard", path: "/hr?tab=attendance", tab: "attendance" },
            { label: "Payout Structure", path: "/hr?tab=payout-structure", tab: "payout-structure" },
            { label: "Employee Payouts", path: "/hr?tab=employee-payouts", tab: "employee-payouts" },
          ]
        )}

        {/* 14. Reports (Standalone Individual Module at the End) */}
        {renderParentItem(
          "reports",
          "Reports",
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16794C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="20" x2="12" y2="10" />
            <line x1="18" y1="20" x2="18" y2="4" />
            <line x1="6" y1="20" x2="6" y2="16" />
          </svg>,
          "/reports",
          true,
          [
            { label: "Operations & Footfall", path: "/reports" },
            { label: "Revenue & Till Collections", path: "/reports" },
            { label: "Referral Partner Analytics", path: "/reports/referrals" },
          ]
        )}
      </nav>
    </aside>
  );
}
