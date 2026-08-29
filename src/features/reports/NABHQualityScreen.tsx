import React, { useState } from "react";
import { Card, Button, StatusPill, Select, Input } from "../../ui/components";

export default function NABHQualityScreen() {
  const [activeTab, setActiveTab] = useState<"indicators" | "hic" | "safety" | "audits">("indicators");

  const qualityIndicators = [
    { code: "QI-01", name: "Inpatient Bed Occupancy Rate", target: "75 - 85%", actual: "82.4%", status: "compliant", dept: "Hospital Wide" },
    { code: "QI-02", name: "Average Length of Stay (ALOS)", target: "< 4.0 Days", actual: "3.2 Days", status: "compliant", dept: "Clinical Wards" },
    { code: "QI-03", name: "Unplanned ICU Readmission Rate (within 48h)", target: "< 1.5%", actual: "0.4%", status: "compliant", dept: "Critical Care" },
    { code: "QI-04", name: "WHO Surgical Safety Checklist Adherence", target: "100%", actual: "100%", status: "compliant", dept: "Operation Theatre" },
    { code: "QI-05", name: "Initial Assessment TAT in Casualty (Triage)", target: "< 10 Mins", actual: "6.8 Mins", status: "compliant", dept: "Emergency" },
    { code: "QI-06", name: "Medication Prescription Error Rate", target: "< 0.1%", actual: "0.02%", status: "compliant", dept: "Pharmacy & EMR" },
    { code: "QI-07", name: "Stat Lab Test Turnaround Time (TAT)", target: "< 45 Mins", actual: "32 Mins", status: "compliant", dept: "Diagnostic Lab" },
    { code: "QI-08", name: "Hand Hygiene Audit Compliance Rate", target: "> 90%", actual: "94.6%", status: "compliant", dept: "Infection Control" },
  ];

  const hicMetrics = [
    { indicator: "Catheter-Associated Urinary Tract Infection (CAUTI)", rate: "0.8 per 1,000 device days", benchmark: "< 1.2", status: "Compliant" },
    { indicator: "Central Line-Associated Bloodstream Infection (CLABSI)", rate: "0.5 per 1,000 line days", benchmark: "< 1.0", status: "Compliant" },
    { indicator: "Surgical Site Infection (SSI Rate - Clean Surgeries)", rate: "0.3%", benchmark: "< 1.0%", status: "Compliant" },
    { indicator: "Needle-Stick Injury (NSI) Incidents (Monthly)", rate: "0 Incidents", benchmark: "Zero Harm", status: "Compliant" },
  ];

  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 1140, margin: "0 auto" }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0284C7 0%, var(--indigo) 100%)",
          borderRadius: 14,
          padding: "22px 28px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 4px 20px rgba(2, 132, 199, 0.2)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 24 }}>🈳</span>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)" }}>
              NABH Accreditation & Clinical Quality Station
            </h1>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700 }}>
              NABH 5th Edition Standard
            </span>
          </div>
          <p style={{ margin: 0, opacity: 0.9, fontSize: 13.5, maxWidth: 640 }}>
            Standardized hospital quality indicators, Hospital Infection Control (HIC) surveillance, patient safety audits, and statutory compliance.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ background: "rgba(255,255,255,0.15)", padding: "8px 16px", borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", opacity: 0.85 }}>Quality Score</div>
            <strong style={{ fontSize: 20 }}>98.4%</strong>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <Card style={{ padding: "14px 18px", borderLeft: "4px solid #16A34A" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Core Indicators Passed</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#16A34A" }}>8 / 8</strong>
            <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 700 }}>100% Target Met</span>
          </div>
        </Card>

        <Card style={{ padding: "14px 18px", borderLeft: "4px solid var(--indigo)" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>WHO Surgical Safety</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>100%</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>OT 1 - 4 Compliance</span>
          </div>
        </Card>

        <Card style={{ padding: "14px 18px", borderLeft: "4px solid #0284C7" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Hand Hygiene Audit</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#0284C7" }}>94.6%</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>ICU & Wards</span>
          </div>
        </Card>

        <Card style={{ padding: "14px 18px", borderLeft: "4px solid #F59E0B" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Next NABH Audit</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 20, color: "#F59E0B" }}>Nov 2026</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Cycle 2</span>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>
        <Button
          type="button"
          ghost={activeTab !== "indicators"}
          onClick={() => setActiveTab("indicators")}
          style={{ fontSize: 13 }}
        >
          📊 Quality Indicators (QI)
        </Button>
        <Button
          type="button"
          ghost={activeTab !== "hic"}
          onClick={() => setActiveTab("hic")}
          style={{ fontSize: 13 }}
        >
          🧼 Infection Control (HIC)
        </Button>
      </div>

      {/* Tab Content: Quality Indicators */}
      {activeTab === "indicators" && (
        <Card style={{ borderRadius: 14 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Code & Indicator</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Department</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>NABH Benchmark</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Hospital Actual</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Compliance Status</th>
                </tr>
              </thead>
              <tbody>
                {qualityIndicators.map((qi) => (
                  <tr key={qi.code} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <strong style={{ color: "var(--indigo)", fontFamily: "monospace" }}>{qi.code}</strong>
                      <span style={{ display: "block", color: "var(--ink)", fontWeight: 600 }}>{qi.name}</span>
                    </td>
                    <td style={{ padding: "12px 14px", color: "var(--slate)" }}>{qi.dept}</td>
                    <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 600 }}>{qi.target}</td>
                    <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 800, color: "var(--green)" }}>{qi.actual}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <StatusPill kind="success">COMPLIANT</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab Content: HIC Surveillance */}
      {activeTab === "hic" && (
        <Card style={{ borderRadius: 14 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>HIC Parameter</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Hospital Actual Rate</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>NABH / CDC Benchmark</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Audit Status</th>
                </tr>
              </thead>
              <tbody>
                {hicMetrics.map((h, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--ink)" }}>{h.indicator}</td>
                    <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 800, color: "var(--green)" }}>{h.rate}</td>
                    <td style={{ padding: "12px 14px", textAlign: "center", color: "var(--slate)" }}>{h.benchmark}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <StatusPill kind="success">PASSED</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
