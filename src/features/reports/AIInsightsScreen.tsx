import React, { useState } from "react";
import { Card, Button, StatusPill, Select, Input } from "../../ui/components";
import { formatRupees } from "../../ui/helpers";

export default function AIInsightsScreen() {
  const [selectedDept, setSelectedDept] = useState("all");
  const [timeRange, setTimeRange] = useState("today");

  const insightsData = [
    {
      id: "ins-1",
      category: "Queue & OPD Flow",
      severity: "high",
      title: "OPD Surge Prediction: General Medicine Chamber 101",
      description: "AI predictive model projects 35+ walk-in patients between 10:30 AM and 1:00 PM based on seasonal viral pyrexia historical trends.",
      recommendation: "Deploy 1 additional relief medical officer to Chamber 102 to maintain average wait time under 12 mins.",
      impact: "Reduces patient wait time by ~42%",
      confidence: "94% confidence",
      icon: "⚡",
    },
    {
      id: "ins-2",
      category: "Inpatient Bed Turnaround",
      severity: "medium",
      title: "ICU & Step-Down Bed Occupancy Alert",
      description: "Current ICU occupancy is at 85%. 3 post-op patients from OT 1 & 3 are scheduled for critical recovery between 2:00 PM and 4:30 PM.",
      recommendation: "Fast-track 2 pending discharge clearances on Floor 4 Step-Down ward (Beds 402, 405) by 1:30 PM.",
      impact: "Prevents ICU bed contention and surgery delays",
      confidence: "89% confidence",
      icon: "🛏️",
    },
    {
      id: "ins-3",
      category: "Pharmacy & FEFO Inventory",
      severity: "low",
      title: "FEFO Stock Depletion Warning: Augmentin 625mg",
      description: "Daily prescription consumption increased by 180% this week. Current batch (EXP-09/26) will exhaust in ~4.5 days.",
      recommendation: "Trigger automatic PO purchase requisition for 500 units to primary distributor.",
      impact: "Avoids emergency stock-out at dispensary POS",
      confidence: "97% confidence",
      icon: "💊",
    },
    {
      id: "ins-4",
      category: "Clinical Diagnostic Risk",
      severity: "high",
      title: "High-Risk Sepsis Early Warning Stratification",
      description: "2 patients in Acute Trauma Casualty exhibit elevated temperature (>101.4°F), tachycardia (HR > 115), and WBC > 14,500/mcL.",
      recommendation: "Prompt attending CMO for immediate blood lactate assay and stat broad-spectrum IV antibiotic protocol.",
      impact: "Improves early clinical intervention window by 3.2 hours",
      confidence: "92% confidence",
      icon: "🚨",
    },
  ];

  return (
    <div style={{ display: "grid", gap: 22, maxWidth: 1140, margin: "0 auto" }}>
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
            <span style={{ fontSize: 24 }}>📊</span>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)" }}>
              AI Clinical & Operational Insights
            </h1>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700 }}>
              Live AI Model Active
            </span>
          </div>
          <p style={{ margin: 0, opacity: 0.9, fontSize: 13.5, maxWidth: 640 }}>
            Real-time predictive analytics, clinical risk stratification, bed turnaround forecasting, and operational resource recommendations.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ background: "#ffffff", color: "var(--indigo)", fontWeight: 700, fontSize: 12.5 }}
          >
            <option value="today">Today's Forecast</option>
            <option value="7days">7-Day Trend Projection</option>
            <option value="30days">Monthly Horizon</option>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <Card style={{ padding: "16px 20px", borderLeft: "4px solid var(--indigo)" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>
            Predicted OPD Volume
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 6 }}>
            <strong style={{ fontSize: 26, color: "var(--indigo)" }}>184</strong>
            <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 700 }}>+14% vs avg</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--slate)", marginTop: 4 }}>Peak rush expected: 11 AM - 1 PM</div>
        </Card>

        <Card style={{ padding: "16px 20px", borderLeft: "4px solid #F59E0B" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>
            Forecasted Bed Occupancy
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 6 }}>
            <strong style={{ fontSize: 26, color: "#F59E0B" }}>88%</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>32 / 36 Beds</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--slate)", marginTop: 4 }}>4 Discharges scheduled</div>
        </Card>

        <Card style={{ padding: "16px 20px", borderLeft: "4px solid #16A34A" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>
            Operational Efficiency Score
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 6 }}>
            <strong style={{ fontSize: 26, color: "#16A34A" }}>94.2%</strong>
            <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 700 }}>Optimal</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--slate)", marginTop: 4 }}>Avg TAT: 11.4 mins</div>
        </Card>

        <Card style={{ padding: "16px 20px", borderLeft: "4px solid #DC2626" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>
            High-Risk Clinical Alerts
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 6 }}>
            <strong style={{ fontSize: 26, color: "#DC2626" }}>2</strong>
            <span style={{ fontSize: 12, color: "#DC2626", fontWeight: 700 }}>Action Needed</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--slate)", marginTop: 4 }}>Sepsis early warning triggered</div>
        </Card>
      </div>

      {/* AI Recommendations List */}
      <Card style={{ borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--indigo)" }}>
              ⚡ Real-Time AI Recommendations & Insights
            </h2>
            <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
              Prioritized by clinical urgency and operational efficiency impact
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {insightsData.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: "16px 20px",
                background: "var(--wash-a)",
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {item.category}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "var(--slate)", fontFamily: "monospace" }}>{item.confidence}</span>
                  <StatusPill kind={item.severity === "high" ? "danger" : item.severity === "medium" ? "warn" : "brand"}>
                    {item.severity.toUpperCase()} PRIORITY
                  </StatusPill>
                </div>
              </div>

              <strong style={{ fontSize: 14.5, color: "var(--ink)" }}>{item.title}</strong>
              <p style={{ margin: 0, fontSize: 13, color: "var(--slate)", lineHeight: 1.4 }}>
                {item.description}
              </p>

              <div
                style={{
                  marginTop: 6,
                  padding: "10px 14px",
                  background: "#ffffff",
                  borderRadius: 8,
                  border: "1px solid var(--line)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 12.5 }}>
                  <strong style={{ color: "var(--indigo)" }}>💡 Recommended Action: </strong>
                  <span style={{ color: "var(--ink)" }}>{item.recommendation}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green)" }}>
                  ✨ {item.impact}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
