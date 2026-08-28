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

  const [adminOpen, setAdminOpen] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "";

  const isPhysician = role === "physician" || role === "doctor" || role === "nurse";
  const isAdmin = role === "admin";
  const isReceptionist = role === "receptionist";
  const isBiller = role === "billing";

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

  // Operations specific to non-admin clinical staff
  const staffNavItems = [
    { label: "Patients", path: "/patients", icon: "👥", show: !isAdmin },
    { label: "Telehealth", path: "/telehealth", icon: "📹", show: isPhysician || isReceptionist },
    { label: "Emergency", path: "/emergency", icon: "🚨", show: !isAdmin },
    { label: "My Schedule", path: "/my-schedule", icon: "🩺", show: isPhysician },
    { label: "Scheduling", path: "/scheduling", icon: "🗓️", show: isReceptionist },
    { label: "Queue Board", path: "/queue", icon: "📋", show: isReceptionist || isPhysician },
    { label: "EMR / Clinical", path: "/emr", icon: "📑", show: isPhysician },
    { label: "OT & Surgery", path: "/ot", icon: "🏥", show: isPhysician || isReceptionist },
    { label: "Inpatient Wards", path: "/inpatient", icon: "🛏️", show: isPhysician || isReceptionist },
    { label: "Dietary", path: "/dietary", icon: "🥗", show: isPhysician || isReceptionist || isBiller },
    { label: "Diagnostic Lab", path: "/lab", icon: "🧪", show: isPhysician || isReceptionist || isBiller },
    { label: "Pharmacy POS", path: "/pharmacy", icon: "💊", show: isPhysician || isReceptionist || isBiller },
    { label: "Print Station", path: "/print-station", icon: "🖨️", show: isPhysician || isReceptionist || isBiller },
    { label: "Billing", path: "/billing", icon: "💳", show: isBiller },
    { label: "HR & Payroll", path: "/hr", icon: "👥", show: isBiller || isReceptionist },
    { label: "Referrals", path: "/reports/referrals", icon: "🔄", show: isBiller || isPhysician },
  ].filter((item) => item.show);

  const adminSubItems = [
    { label: "Configuration", path: "/settings?tab=config", tab: "config", icon: "⚙️" },
    { label: "Account Settings", path: "/settings?tab=account", tab: "account", icon: "🏢" },
    { label: "User Authentication", path: "/settings?tab=auth", tab: "auth", icon: "🔐" },
    { label: "Users", path: "/settings?tab=users", tab: "users", icon: "👥" },
    { label: "Payment", path: "/settings?tab=payment", tab: "payment", icon: "💳" },
    { label: "Online Services", path: "/settings?tab=online", tab: "online", icon: "🌐" },
  ];

  return (
    <aside
      data-testid="app-sidebar"
      style={{
        width: collapsed ? 72 : 240,
        minWidth: collapsed ? 72 : 240,
        background: "#ffffff",
        borderRight: "1px solid var(--line, #E2E8F0)",
        padding: collapsed ? "18px 8px" : "18px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
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
          padding: "0 6px",
          borderBottom: "1px solid var(--line, #E2E8F0)",
          paddingBottom: 12,
        }}
      >
        {!collapsed && (
          <span style={{ fontSize: 11, fontWeight: 800, color: "var(--slate)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Navigation
          </span>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            background: "var(--wash-a, #F6FAFF)",
            border: "1px solid var(--line, #E2E8F0)",
            color: "var(--indigo, #131A8F)",
            borderRadius: "var(--r-pill, 999px)",
            width: 28,
            height: 28,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 800,
            transition: "background 0.15s ease",
          }}
        >
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Top Item: Dashboard, Telehealth, Emergency, OT, Inpatient, Dietary, Lab, Pharmacy, HR & Print Station (for Admin or Overview) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Link
            to="/dashboard"
            title={collapsed ? "Dashboard" : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: collapsed ? "9px 0" : "9px 12px",
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: 10,
              textDecoration: "none",
              background: isCurrent("/dashboard") ? "var(--indigo-soft, #E4E9FF)" : "transparent",
              color: isCurrent("/dashboard") ? "var(--indigo, #131A8F)" : "var(--ink, #23263B)",
              fontWeight: isCurrent("/dashboard") ? 800 : 600,
              fontSize: 13.5,
              borderLeft: isCurrent("/dashboard") ? "3px solid var(--indigo, #131A8F)" : "3px solid transparent",
              transition: "all 0.15s ease",
            }}
          >
            <span style={{ fontSize: 16 }}>📊</span>
            {!collapsed && <span>Dashboard</span>}
          </Link>

          {isAdmin && (
            <>
              <Link
                to="/telehealth"
                title={collapsed ? "Telehealth Video" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "9px 0" : "9px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 10,
                  textDecoration: "none",
                  background: isCurrent("/telehealth") ? "var(--indigo-soft, #E4E9FF)" : "transparent",
                  color: isCurrent("/telehealth") ? "#00BCD4" : "var(--ink, #23263B)",
                  fontWeight: isCurrent("/telehealth") ? 800 : 600,
                  fontSize: 13.5,
                  borderLeft: isCurrent("/telehealth") ? "3px solid #00BCD4" : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: 16 }}>📹</span>
                {!collapsed && <span>Telehealth</span>}
              </Link>

              <Link
                to="/emergency"
                title={collapsed ? "Emergency Casualty" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "9px 0" : "9px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 10,
                  textDecoration: "none",
                  background: isCurrent("/emergency") ? "#FEF2F2" : "transparent",
                  color: isCurrent("/emergency") ? "#DC2626" : "var(--ink, #23263B)",
                  fontWeight: isCurrent("/emergency") ? 800 : 600,
                  fontSize: 13.5,
                  borderLeft: isCurrent("/emergency") ? "3px solid #DC2626" : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: 16 }}>🚨</span>
                {!collapsed && <span>Emergency</span>}
              </Link>

              <Link
                to="/ot"
                title={collapsed ? "Operation Theatre" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "9px 0" : "9px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 10,
                  textDecoration: "none",
                  background: isCurrent("/ot") ? "var(--indigo-soft, #E4E9FF)" : "transparent",
                  color: isCurrent("/ot") ? "var(--indigo, #131A8F)" : "var(--ink, #23263B)",
                  fontWeight: isCurrent("/ot") ? 800 : 600,
                  fontSize: 13.5,
                  borderLeft: isCurrent("/ot") ? "3px solid var(--indigo, #131A8F)" : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: 16 }}>🏥</span>
                {!collapsed && <span>Operation Theatre</span>}
              </Link>

              <Link
                to="/inpatient"
                title={collapsed ? "Inpatient Wards" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "9px 0" : "9px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 10,
                  textDecoration: "none",
                  background: isCurrent("/inpatient") ? "var(--indigo-soft, #E4E9FF)" : "transparent",
                  color: isCurrent("/inpatient") ? "var(--indigo, #131A8F)" : "var(--ink, #23263B)",
                  fontWeight: isCurrent("/inpatient") ? 800 : 600,
                  fontSize: 13.5,
                  borderLeft: isCurrent("/inpatient") ? "3px solid var(--indigo, #131A8F)" : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: 16 }}>🛏️</span>
                {!collapsed && <span>Inpatient Wards</span>}
              </Link>

              <Link
                to="/dietary"
                title={collapsed ? "Dietary & Nutrition" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "9px 0" : "9px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 10,
                  textDecoration: "none",
                  background: isCurrent("/dietary") ? "var(--indigo-soft, #E4E9FF)" : "transparent",
                  color: isCurrent("/dietary") ? "#16A34A" : "var(--ink, #23263B)",
                  fontWeight: isCurrent("/dietary") ? 800 : 600,
                  fontSize: 13.5,
                  borderLeft: isCurrent("/dietary") ? "3px solid #16A34A" : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: 16 }}>🥗</span>
                {!collapsed && <span>Dietary</span>}
              </Link>

              <Link
                to="/lab"
                title={collapsed ? "Diagnostic Lab" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "9px 0" : "9px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 10,
                  textDecoration: "none",
                  background: isCurrent("/lab") ? "var(--indigo-soft, #E4E9FF)" : "transparent",
                  color: isCurrent("/lab") ? "var(--indigo, #131A8F)" : "var(--ink, #23263B)",
                  fontWeight: isCurrent("/lab") ? 800 : 600,
                  fontSize: 13.5,
                  borderLeft: isCurrent("/lab") ? "3px solid var(--indigo, #131A8F)" : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: 16 }}>🧪</span>
                {!collapsed && <span>Diagnostic Lab</span>}
              </Link>

              <Link
                to="/pharmacy"
                title={collapsed ? "Hospital Pharmacy" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "9px 0" : "9px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 10,
                  textDecoration: "none",
                  background: isCurrent("/pharmacy") ? "var(--indigo-soft, #E4E9FF)" : "transparent",
                  color: isCurrent("/pharmacy") ? "var(--indigo, #131A8F)" : "var(--ink, #23263B)",
                  fontWeight: isCurrent("/pharmacy") ? 800 : 600,
                  fontSize: 13.5,
                  borderLeft: isCurrent("/pharmacy") ? "3px solid var(--indigo, #131A8F)" : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: 16 }}>💊</span>
                {!collapsed && <span>Hospital Pharmacy</span>}
              </Link>

              <Link
                to="/print-station"
                title={collapsed ? "Print Station" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "9px 0" : "9px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 10,
                  textDecoration: "none",
                  background: isCurrent("/print-station") ? "var(--indigo-soft, #E4E9FF)" : "transparent",
                  color: isCurrent("/print-station") ? "var(--indigo, #131A8F)" : "var(--ink, #23263B)",
                  fontWeight: isCurrent("/print-station") ? 800 : 600,
                  fontSize: 13.5,
                  borderLeft: isCurrent("/print-station") ? "3px solid var(--indigo, #131A8F)" : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: 16 }}>🖨️</span>
                {!collapsed && <span>Print Station</span>}
              </Link>

              <Link
                to="/hr"
                title={collapsed ? "HR & Payroll" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "9px 0" : "9px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 10,
                  textDecoration: "none",
                  background: isCurrent("/hr") ? "var(--indigo-soft, #E4E9FF)" : "transparent",
                  color: isCurrent("/hr") ? "var(--indigo, #131A8F)" : "var(--ink, #23263B)",
                  fontWeight: isCurrent("/hr") ? 800 : 600,
                  fontSize: 13.5,
                  borderLeft: isCurrent("/hr") ? "3px solid var(--indigo, #131A8F)" : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: 16 }}>👥</span>
                {!collapsed && <span>HR & Payroll</span>}
              </Link>
            </>
          )}
        </div>

        {/* Clinical Staff Navigation (only shown for non-admin staff) */}
        {!isAdmin && staffNavItems.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {staffNavItems.map((item) => {
              const active = isCurrent(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: collapsed ? "9px 0" : "9px 12px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius: 10,
                    textDecoration: "none",
                    background: active ? "var(--indigo-soft, #E4E9FF)" : "transparent",
                    color: active ? "var(--indigo, #131A8F)" : "var(--ink, #23263B)",
                    fontWeight: active ? 800 : 600,
                    fontSize: 13.5,
                    borderLeft: active ? "3px solid var(--indigo, #131A8F)" : "3px solid transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        )}

        {/* Admin Menu (Expandable Accordion matching image specification) */}
        {isAdmin && (
          <div>
            {!collapsed ? (
              <button
                type="button"
                onClick={() => setAdminOpen(!adminOpen)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--indigo, #131A8F)",
                  fontWeight: 800,
                  fontSize: 14,
                  borderRadius: 8,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--green, #1C9A4E)", fontSize: 16 }}>👥</span>
                  <span>Admin</span>
                </span>
                <span style={{ fontSize: 11, color: "var(--slate)" }}>{adminOpen ? "▲" : "▼"}</span>
              </button>
            ) : (
              <div style={{ textAlign: "center", padding: "6px 0", fontSize: 16, color: "var(--green)" }} title="Admin Menu">
                👥
              </div>
            )}

            {(adminOpen || collapsed) && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  marginTop: 4,
                  paddingLeft: collapsed ? 0 : 12,
                  borderLeft: collapsed ? "none" : "2px solid var(--wash-b, #DDEBFC)",
                  marginLeft: collapsed ? 0 : 10,
                }}
              >
                {adminSubItems.map((sub) => {
                  const active = isCurrent(sub.path, sub.tab);
                  return (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      title={collapsed ? sub.label : undefined}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: collapsed ? "8px 0" : "8px 10px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        borderRadius: 8,
                        textDecoration: "none",
                        background: active ? "var(--indigo-soft, #E4E9FF)" : "transparent",
                        color: active ? "var(--indigo, #131A8F)" : "var(--slate, #5B6172)",
                        fontWeight: active ? 800 : 600,
                        fontSize: 13,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{sub.icon}</span>
                      {!collapsed && <span>{sub.label}</span>}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
}
