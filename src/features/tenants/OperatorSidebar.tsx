import React from "react";
import { Link, useLocation } from "react-router-dom";

export function OperatorSidebar() {
  const location = useLocation();

  const isCurrent = (path: string) => {
    if (path === "/operator/dashboard") {
      return location.pathname === "/operator/dashboard" || location.pathname === "/operator" || location.pathname === "/";
    }
    if (path === "/ops-control") {
      return location.pathname === "/ops-control" && location.hash !== "#suspend";
    }
    if (path === "/ops-control#suspend" || path === "/ops-control/suspend") {
      return location.pathname === "/ops-control/suspend" || (location.pathname === "/ops-control" && location.hash === "#suspend");
    }
    if (path.startsWith("/operator/profile")) {
      const searchParams = new URLSearchParams(location.search);
      const currentTab = searchParams.get("tab") || "profile";
      const targetTab = new URLSearchParams(path.split("?")[1] || "").get("tab") || "profile";
      return location.pathname === "/operator/profile" && currentTab === targetTab;
    }
    return location.pathname.startsWith(path);
  };

  const navGroups = [
    {
      title: "OVERVIEW",
      items: [
        { label: "Dashboard", path: "/operator/dashboard", icon: "📊" },
        { label: "Insights & Funnel", path: "/operator/insights", icon: "📈" },
      ],
    },
    {
      title: "TENANTS",
      items: [
        { label: "All Tenants", path: "/tenants", icon: "🏥" },
        { label: "Onboarding Wizard", path: "/onboarding", icon: "🚀" },
      ],
    },
    {
      title: "PLATFORM",
      items: [
        { label: "Billing & Ops", path: "/ops-control", icon: "💳" },
        { label: "Suspend & Override", path: "/ops-control#suspend", icon: "🛡️" },
      ],
    },
    {
      title: "PROFILE & SECURITY",
      items: [
        { label: "Profile", path: "/operator/profile?tab=profile", icon: "👤" },
        { label: "Password Reset", path: "/operator/profile?tab=security", icon: "🔑" },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { label: "Design System", path: "/design", icon: "🎨" },
      ],
    },
  ];

  return (
    <aside
      data-testid="operator-sidebar"
      style={{
        width: 230,
        minWidth: 230,
        background: "#ffffff",
        borderRight: "1px solid var(--line, #E2E8F0)",
        padding: "20px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div style={{ padding: "0 6px" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "var(--indigo, #1E3A5F)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 2,
          }}
        >
          Control Center
        </div>
        <div style={{ fontSize: 12.5, color: "var(--slate)", fontWeight: 600 }}>SaaS Operations</div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {navGroups.map((group) => (
          <div key={group.title}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "var(--slate)",
                letterSpacing: "0.08em",
                marginBottom: 6,
                padding: "0 6px",
              }}
            >
              {group.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {group.items.map((item) => {
                const active = isCurrent(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: "var(--r-pill, 6px)",
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: active ? 700 : 500,
                      color: active ? "var(--indigo)" : "var(--ink)",
                      background: active ? "var(--indigo-soft)" : "transparent",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
