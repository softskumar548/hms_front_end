import React, { useState } from "react";
import { Card, Button, StatusPill, Select, Input } from "../../ui/components";
import { formatRupees } from "../../ui/helpers";
import ReferralAnalytics from "./ReferralAnalytics";
import OpsDashboard from "./OpsDashboard";

export default function ReportsHubScreen() {
  const [activeReport, setActiveReport] = useState<"operations" | "revenue" | "referrals" | "clinical" | "pharmacy">("operations");
  const [dateFilter, setDateFilter] = useState("this_month");

  const revenueBreakdown = [
    { source: "OPD Doctor Consultations", amount: 185400, share: "28%", transactions: 312 },
    { source: "Inpatient Bed & Nursing Tariff", amount: 245000, share: "37%", transactions: 24 },
    { source: "Pharmacy Dispensary POS", amount: 128600, share: "19%", transactions: 285 },
    { source: "Diagnostic Pathology & Radiology", amount: 86500, share: "13%", transactions: 142 },
    { source: "Operation Theatre & Procedures", amount: 20000, share: "3%", transactions: 6 },
  ];

  const totalRevenue = revenueBreakdown.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 1140, margin: "0 auto" }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--indigo-deep) 0%, var(--indigo) 100%)",
          borderRadius: 14,
          padding: "22px 28px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 4px 20px rgba(13, 92, 99, 0.2)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 24 }}>📈</span>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)" }}>
              Hospital Reports & Business Intelligence Central
            </h1>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700 }}>
              Live Financial & Clinical Ledger
            </span>
          </div>
          <p style={{ margin: 0, opacity: 0.9, fontSize: 13.5, maxWidth: 640 }}>
            Executive operations summary, multi-rail till collections, referral partner volume ledgers, and department utilization.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ background: "#ffffff", color: "var(--indigo)", fontWeight: 700, fontSize: 12.5 }}
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month (August 2026)</option>
            <option value="quarter">Quarter-to-Date</option>
          </Select>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--line)", paddingBottom: 8, flexWrap: "wrap" }}>
        <Button
          type="button"
          ghost={activeReport !== "operations"}
          onClick={() => setActiveReport("operations")}
          style={{ fontSize: 13 }}
        >
          📊 Operations & Footfall
        </Button>
        <Button
          type="button"
          ghost={activeReport !== "revenue"}
          onClick={() => setActiveReport("revenue")}
          style={{ fontSize: 13 }}
        >
          💳 Revenue & Cashier Till
        </Button>
        <Button
          type="button"
          ghost={activeReport !== "referrals"}
          onClick={() => setActiveReport("referrals")}
          style={{ fontSize: 13 }}
        >
          🔄 Referral Partner Analytics
        </Button>
      </div>

      {/* Tab Content: Operations */}
      {activeReport === "operations" && (
        <OpsDashboard />
      )}

      {/* Tab Content: Revenue & Cashier Till */}
      {activeReport === "revenue" && (
        <div style={{ display: "grid", gap: 18 }}>
          {/* Revenue KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            <Card style={{ padding: "16px 20px", borderLeft: "4px solid var(--indigo)" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Gross Revenue</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
                <strong style={{ fontSize: 26, color: "var(--indigo)" }}>{formatRupees(totalRevenue)}</strong>
                <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 700 }}>+18% MoM</span>
              </div>
            </Card>

            <Card style={{ padding: "16px 20px", borderLeft: "4px solid #16A34A" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Cash & UPI Collections</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
                <strong style={{ fontSize: 26, color: "#16A34A" }}>{formatRupees(totalRevenue * 0.72)}</strong>
                <span style={{ fontSize: 12, color: "var(--slate)" }}>Instant settlement</span>
              </div>
            </Card>

            <Card style={{ padding: "16px 20px", borderLeft: "4px solid #0284C7" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>PMJAY / Aarogyasri Cashless</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
                <strong style={{ fontSize: 26, color: "#0284C7" }}>{formatRupees(totalRevenue * 0.28)}</strong>
                <span style={{ fontSize: 12, color: "var(--slate)" }}>Claims logged</span>
              </div>
            </Card>
          </div>

          {/* Revenue Breakdown Table */}
          <Card style={{ borderRadius: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--indigo)" }}>
                Departmental Revenue Contribution
              </h3>
              <span style={{ fontSize: 12, color: "var(--slate)" }}>769 Total Transactions</span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                    <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Revenue Source</th>
                    <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Transactions</th>
                    <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Revenue Share</th>
                    <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Total Collected</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueBreakdown.map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--ink)" }}>{r.source}</td>
                      <td style={{ padding: "12px 14px", textAlign: "center", color: "var(--slate)" }}>{r.transactions}</td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <StatusPill kind="brand">{r.share}</StatusPill>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800, color: "var(--indigo)" }}>
                        {formatRupees(r.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab Content: Referrals */}
      {activeReport === "referrals" && (
        <ReferralAnalytics />
      )}
    </div>
  );
}
