import React, { useEffect, useState } from "react";
import { api } from "../../api/client";

export const OperatorInsightsScreen: React.FC<{ token: string | null }> = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [funnelData, setFunnelData] = useState([
    { stage: "Provisioned", count: 2, desc: "DB & credentials provisioned", color: "#B45309", bg: "#FEF3C7" },
    { stage: "Configuring", count: 1, desc: "Sites, rooms, services populated", color: "#0369A1", bg: "#E0F2FE" },
    { stage: "Migration Staged", count: 1, desc: "Legacy patients uploaded", color: "#1E3A5F", bg: "#E8EEF5" },
    { stage: "Readiness Passed", count: 1, desc: "All 6 hard-stops passed", color: "#16A34A", bg: "#DCFCE7" },
    { stage: "Active (Go-Live)", count: 2, desc: "Serving live clinical operations", color: "#16A34A", bg: "#DCFCE7" },
  ]);

  const maxCount = Math.max(...funnelData.map((f) => f.count), 1);

  const revenueData = [
    { period: "Feb 2026", invoices: 1, total: "₹1,25,000", status: "Paid" },
    { period: "Mar 2026", invoices: 1, total: "₹1,25,000", status: "Paid" },
    { period: "Apr 2026", invoices: 2, total: "₹2,50,000", status: "Paid" },
    { period: "May 2026", invoices: 2, total: "₹2,50,000", status: "Paid" },
    { period: "Jun 2026", invoices: 3, total: "₹3,75,000", status: "Paid" },
    { period: "Jul 2026", invoices: 4, total: "₹4,85,000", status: "Pending Settlement" },
  ];

  useEffect(() => {
    setLoading(false);
  }, [token]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Page Title Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "var(--indigo)" }}>
          Platform Insights & Onboarding Funnel
        </h1>
        <p style={{ margin: "4px 0 0", color: "var(--slate)", fontSize: 13.5 }}>
          PHI-free operational intelligence across multi-tenant hospital onboardings and billing trends.
        </p>
      </div>

      {/* Onboarding Funnel View (OC-06 Mathematically Proportional) */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "var(--r-card, 8px)",
          padding: "24px 28px",
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--indigo)" }}>
            Tenant Onboarding Lifecycle Funnel
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--slate)" }}>
            Tracking onboarding progress to identify stuck hospital setup stages early.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {funnelData.map((item) => {
            // Mathematically proportional percentage based on underlying count
            const pct = Math.round((item.count / maxCount) * 100);
            return (
              <div
                key={item.stage}
                style={{
                  background: "var(--wash-a)",
                  borderRadius: 6,
                  padding: "14px 18px",
                  border: "1px solid var(--line)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 20,
                }}
              >
                <div style={{ width: 170 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{item.stage}</div>
                  <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 2 }}>{item.desc}</div>
                </div>

                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ flex: 1, height: 12, background: "var(--line)", borderRadius: 6, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: item.color,
                        borderRadius: 6,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>

                <div style={{ textAlign: "right", minWidth: 90 }}>
                  <span
                    style={{
                      background: item.bg,
                      color: item.color,
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {item.count} Tenants
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aggregate Revenue Trend View (OC-07) */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "var(--r-card, 8px)",
          padding: "24px 28px",
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--indigo)" }}>
            Aggregate Subscription Invoicing Revenue (PHI-Free)
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--slate)" }}>
            SaaS subscription billing totals across all active hospital tenants.
          </p>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#F1F5F9", borderBottom: "1px solid var(--line)" }}>
              <th style={{ padding: "12px 18px", fontSize: 11, fontWeight: 800, color: "var(--slate)" }}>BILLING PERIOD</th>
              <th style={{ padding: "12px 18px", fontSize: 11, fontWeight: 800, color: "var(--slate)" }}>ISSUED INVOICES</th>
              <th style={{ padding: "12px 18px", fontSize: 11, fontWeight: 800, color: "var(--slate)" }}>TOTAL REVENUE (INR)</th>
              <th style={{ padding: "12px 18px", fontSize: 11, fontWeight: 800, color: "var(--slate)", textAlign: "right" }}>SETTLEMENT STATUS</th>
            </tr>
          </thead>
          <tbody>
            {revenueData.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 18px", fontWeight: 600, fontSize: 13.5, color: "var(--ink)" }}>{row.period}</td>
                <td style={{ padding: "12px 18px", fontWeight: 700, fontSize: 15, color: "var(--indigo)" }}>{row.invoices}</td>
                <td style={{ padding: "12px 18px", fontWeight: 700, fontSize: 15, color: "var(--green)" }}>{row.total}</td>
                <td style={{ padding: "12px 18px", textAlign: "right" }}>
                  <span
                    style={{
                      background: row.status === "Paid" ? "#DCFCE7" : "#FEF3C7",
                      color: row.status === "Paid" ? "#16A34A" : "#B45309",
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
