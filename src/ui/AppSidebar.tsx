import React, { useState, useEffect } from "react";
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
  const [settingsOpen, setSettingsOpen] = useState(true);

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

  const coreNavItems = [
    { label: "Dashboard", path: "/dashboard", icon: "📊", show: isAdmin || isReceptionist },
    { label: "Patients", path: "/patients", icon: "👥", show: true },
    { label: "Scheduling", path: "/scheduling", icon: "🗓️", show: isReceptionist || isAdmin || isPhysician },
    { label: "Queue Board", path: "/queue", icon: "📋", show: isReceptionist || isAdmin || isPhysician },
    { label: "EMR / Clinical", path: "/emr", icon: "🩺", show: isPhysician || isAdmin },
    { label: "Billing", path: "/billing", icon: "💳", show: isBiller || isReceptionist || isAdmin },
    { label: "Referrals", path: "/reports/referrals", icon: "🔄", show: isAdmin || isPhysician || isBiller },
  ].filter((item) => item.show);

  const adminSubItems = [
    { label: "Configuration", path: "/settings?tab=config", tab: "config", icon: "⚙️" },
    { label: "Account Settings", path: "/settings?tab=account", tab: "account", icon: "🏢" },
    { label: "User Authentication", path: "/settings?tab=auth", tab: "auth", icon: "🔐" },
    { label: "Users", path: "/settings?tab=users", tab: "users", icon: "👥" },
    { label: "Payment", path: "/settings?tab=payment", tab: "payment", icon: "💳" },
    { label: "Online Services", path: "/settings?tab=online", tab: "online", icon: "🌐" },
  ];

  const settingsSubItems = [
    { label: "Brand Related", path: "/settings?tab=brand", tab: "brand", icon: "🎨" },
    { label: "Print Settings", path: "/settings?tab=print", tab: "print", icon: "🖨️" },
    { label: "Reminders", path: "/settings/reminders", icon: "🔔" },
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
        {/* SECTION 1: Core Operations */}
        <div>
          {!collapsed && (
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                color: "var(--slate)",
                letterSpacing: "0.08em",
                marginBottom: 6,
                padding: "0 8px",
                textTransform: "uppercase",
              }}
            >
              Operations
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {coreNavItems.map((item) => {
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
        </div>

        {/* SECTION 2: Admin Accordion Menu (from user's design) */}
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
                  padding: "6px 8px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--indigo, #131A8F)",
                  fontWeight: 800,
                  fontSize: 13.5,
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
              <div style={{ textAlign: "center", padding: "6px 0", fontSize: 14, color: "var(--green)" }} title="Admin Menu">
                👥
              </div>
            )}

            {(adminOpen || collapsed) && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  marginTop: 3,
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
                        padding: collapsed ? "8px 0" : "7px 10px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        borderRadius: 8,
                        textDecoration: "none",
                        background: active ? "var(--indigo-soft, #E4E9FF)" : "transparent",
                        color: active ? "var(--indigo, #131A8F)" : "var(--slate, #5B6172)",
                        fontWeight: active ? 800 : 600,
                        fontSize: 12.5,
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

        {/* SECTION 3: Settings Accordion Menu (Brand, Print, Reminders) */}
        {isAdmin && (
          <div>
            {!collapsed ? (
              <button
                type="button"
                onClick={() => setSettingsOpen(!settingsOpen)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 8px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--indigo, #131A8F)",
                  fontWeight: 800,
                  fontSize: 13.5,
                  borderRadius: 8,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>⚙️</span>
                  <span>Settings</span>
                </span>
                <span style={{ fontSize: 11, color: "var(--slate)" }}>{settingsOpen ? "▲" : "▼"}</span>
              </button>
            ) : (
              <div style={{ textAlign: "center", padding: "6px 0", fontSize: 14 }} title="Settings">
                ⚙️
              </div>
            )}

            {(settingsOpen || collapsed) && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  marginTop: 3,
                  paddingLeft: collapsed ? 0 : 12,
                  borderLeft: collapsed ? "none" : "2px solid var(--wash-b, #DDEBFC)",
                  marginLeft: collapsed ? 0 : 10,
                }}
              >
                {settingsSubItems.map((sub) => {
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
                        padding: collapsed ? "8px 0" : "7px 10px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        borderRadius: 8,
                        textDecoration: "none",
                        background: active ? "var(--indigo-soft, #E4E9FF)" : "transparent",
                        color: active ? "var(--indigo, #131A8F)" : "var(--slate, #5B6172)",
                        fontWeight: active ? 800 : 600,
                        fontSize: 12.5,
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
