import React from "react";
import { Modal, Button } from "../../ui/components";
import { useAuth } from "../../auth/AuthProvider";

interface DiagnosticReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: any;
}

export default function DiagnosticReportPrintModal({
  isOpen,
  onClose,
  report,
}: DiagnosticReportPrintModalProps) {
  const { tenant } = useAuth();
  const facilityTitle = tenant ? tenant.replace(/[_|-]/g, " ").toUpperCase() : "ZEN CLINIC HOSPITAL";

  if (!isOpen || !report) return null;

  const qrData = `ABDM-LAB|${report.patientUhid || "UHID-90812"}|${report.sampleId || "SMP-8901"}|${report.testName}|${report.status || "VERIFIED"}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official Diagnostic Lab Report (LAB-001)">
      <div style={{ maxWidth: 840, minWidth: 720, fontFamily: "var(--font-body)", color: "var(--ink)" }}>
        
        {/* Controls Bar */}
        <div
          className="no-print"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            background: "var(--wash-a)",
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid var(--line)",
          }}
        >
          <div>
            <strong style={{ fontSize: 13, color: "var(--indigo)" }}>
              📄 A4 Printable Diagnostic Pathology Report
            </strong>
            <span style={{ fontSize: 11, color: "var(--slate)", display: "block" }}>
              NABL compliant verified report with digital pathologist credentials & ABHA QR
            </span>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Button ghost onClick={onClose}>Close</Button>
            <Button
              onClick={handlePrint}
              style={{ background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)", color: "#fff" }}
            >
              🖨️ Print Official Report (A4)
            </Button>
          </div>
        </div>

        {/* PRINTABLE A4 DIAGNOSTIC REPORT CONTAINER */}
        <div
          className="lab-report-print-container"
          style={{
            background: "#ffffff",
            border: "1px solid var(--line)",
            padding: "32px 38px",
            borderRadius: 14,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            fontSize: 12.5,
          }}
        >
          {/* Hospital Letterhead */}
          <div style={{ borderBottom: "3px solid var(--indigo)", paddingBottom: 12, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 24 }}>🏥</span>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--indigo)", margin: 0, textTransform: "uppercase" }}>
                  {facilityTitle}
                </h1>
              </div>
              <span style={{ fontSize: 11.5, color: "var(--slate)", display: "block", marginTop: 2 }}>
                Department of Clinical Pathology, Hematology & Molecular Diagnostics
              </span>
              <span style={{ fontSize: 11, color: "var(--indigo)", fontWeight: 700 }}>
                NABL Accredited Lab (MC-4891) · ABDM Facility ID: AP-HFR-2026-90214 · Visakhapatnam, AP
              </span>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ background: "var(--indigo-soft)", color: "var(--indigo)", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 800, textTransform: "uppercase", display: "inline-block", marginBottom: 4 }}>
                DIAGNOSTIC LAB REPORT
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#16A34A" }}>
                Status: <strong>VERIFIED & RELEASED</strong>
              </div>
              <div style={{ fontSize: 11, color: "var(--slate)" }}>
                Reported: {report.reportedAt || "29-Aug-2026 09:30 AM"}
              </div>
            </div>
          </div>

          {/* Patient & Specimen Metadata Bar */}
          <div style={{ background: "var(--wash-a)", padding: 14, borderRadius: 10, border: "1px solid var(--line)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 10.5, color: "var(--slate)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Patient Name</span>
              <strong style={{ fontSize: 13, color: "var(--indigo)" }}>{report.patientName || "Ramesh Babu"}</strong>
              <span style={{ fontSize: 11, color: "var(--slate)", display: "block" }}>
                UHID: <strong style={{ fontFamily: "monospace" }}>{report.patientUhid || "UHID-2026-90812"}</strong>
              </span>
            </div>

            <div>
              <span style={{ fontSize: 10.5, color: "var(--slate)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Age / Gender / Bed</span>
              <div style={{ fontWeight: 700, fontSize: 12.5 }}>{report.ageGender || "48Y / Male"}</div>
              <span style={{ fontSize: 11, color: "var(--slate)" }}>Bed: {report.bedNumber || "GMW-101 (Floor 2)"}</span>
            </div>

            <div>
              <span style={{ fontSize: 10.5, color: "var(--slate)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Referring Consultant</span>
              <div style={{ fontWeight: 700, fontSize: 12 }}>{report.doctorName || "Dr. K R Murali (Dean)"}</div>
              <span style={{ fontSize: 11, color: "var(--slate)" }}>Dept: {report.department || "General Medicine"}</span>
            </div>

            <div>
              <span style={{ fontSize: 10.5, color: "var(--slate)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Sample Barcode ID</span>
              <div style={{ fontWeight: 700, fontSize: 12, fontFamily: "monospace", color: "var(--indigo)" }}>
                {report.sampleId || "SMP-2026-8901"}
              </div>
              <span style={{ fontSize: 11, color: "var(--slate)" }}>Type: {report.specimenType || "Whole Blood (EDTA K2)"}</span>
            </div>

            <div>
              <span style={{ fontSize: 10.5, color: "var(--slate)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Collection Timestamp</span>
              <div style={{ fontWeight: 700, fontSize: 12 }}>{report.collectedAt || "29-Aug-2026 08:15 AM"}</div>
              <span style={{ fontSize: 11, color: "var(--slate)" }}>Phlebotomist: Suresh K</span>
            </div>

            <div>
              <span style={{ fontSize: 10.5, color: "var(--slate)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Testing Panel</span>
              <strong style={{ fontSize: 12, color: "var(--indigo)" }}>{report.testName || "Complete Blood Count (CBC)"}</strong>
              <span style={{ fontSize: 11, color: "#16A34A", fontWeight: 700, display: "block" }}>NABL Method: Sysmex XN-550</span>
            </div>
          </div>

          {/* Test Panel Heading */}
          <div style={{ background: "var(--indigo)", color: "#fff", padding: "8px 14px", borderRadius: "8px 8px 0 0", fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", justifyContent: "space-between" }}>
            <span>TEST INVESTIGATION: {report.testName || "COMPLETE BLOOD COUNT (CBC)"}</span>
            <span style={{ fontSize: 11.5, opacity: 0.9 }}>AUTOMATED FLOW CYTOMETRY</span>
          </div>

          {/* Analyte Results Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, border: "1px solid var(--line)", marginBottom: 16 }}>
            <thead>
              <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--slate)" }}>Test Parameter</th>
                <th style={{ textAlign: "right", padding: "8px 12px", color: "var(--slate)" }}>Observed Result</th>
                <th style={{ textAlign: "center", padding: "8px 12px", color: "var(--slate)" }}>Unit</th>
                <th style={{ textAlign: "center", padding: "8px 12px", color: "var(--slate)" }}>Biological Reference</th>
                <th style={{ textAlign: "center", padding: "8px 12px", color: "var(--slate)" }}>Flag</th>
              </tr>
            </thead>
            <tbody>
              {(report.parameters || [
                { name: "Hemoglobin (Hb)", value: "10.4", unit: "g/dL", reference: "13.0 - 17.0", flag: "LOW" },
                { name: "Total Leukocyte Count (WBC)", value: "14,800", unit: "/mcL", reference: "4,000 - 11,000", flag: "HIGH" },
                { name: "Platelet Count", value: "28,000", unit: "/mcL", reference: "1,50,000 - 4,50,000", flag: "CRITICAL" },
                { name: "Red Blood Cell (RBC)", value: "3.85", unit: "mil/mcL", reference: "4.50 - 5.90", flag: "LOW" },
                { name: "Packed Cell Volume (PCV)", value: "32.0", unit: "%", reference: "40.0 - 50.0", flag: "LOW" },
                { name: "Neutrophils", value: "78", unit: "%", reference: "40 - 75", flag: "HIGH" },
                { name: "Lymphocytes", value: "16", unit: "%", reference: "20 - 45", flag: "LOW" },
                { name: "Eosinophils", value: "3", unit: "%", reference: "1 - 6", flag: "NORMAL" },
                { name: "Monocytes", value: "3", unit: "%", reference: "2 - 10", flag: "NORMAL" },
              ]).map((param: any, idx: number) => {
                const isCritical = param.flag === "CRITICAL";
                const isAbnormal = param.flag === "HIGH" || param.flag === "LOW";

                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid var(--line)",
                      background: isCritical ? "#FEF2F2" : idx % 2 === 0 ? "#FFFFFF" : "var(--wash-a)",
                    }}
                  >
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>{param.name}</td>
                    <td
                      style={{
                        padding: "8px 12px",
                        textAlign: "right",
                        fontWeight: 800,
                        fontSize: isCritical ? 14 : 13,
                        color: isCritical ? "#DC2626" : isAbnormal ? "#D97706" : "var(--ink)",
                      }}
                    >
                      {param.value}
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "center", color: "var(--slate)", fontSize: 11.5 }}>
                      {param.unit}
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "center", color: "var(--slate)", fontSize: 11.5 }}>
                      {param.reference}
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      {isCritical ? (
                        <span style={{ background: "#DC2626", color: "#fff", padding: "2px 6px", borderRadius: 4, fontWeight: 900, fontSize: 10 }}>
                          🚨 CRITICAL
                        </span>
                      ) : isAbnormal ? (
                        <span style={{ background: "#FEF3C7", color: "#B45309", padding: "2px 6px", borderRadius: 4, fontWeight: 800, fontSize: 10 }}>
                          {param.flag}
                        </span>
                      ) : (
                        <span style={{ background: "#DCFCE7", color: "#166534", padding: "2px 6px", borderRadius: 4, fontWeight: 700, fontSize: 10 }}>
                          NORMAL
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pathologist Clinical Comments & Panic Alert Box */}
          <div style={{ background: "var(--wash-a)", border: "1px solid var(--line)", borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <strong style={{ fontSize: 11.5, color: "var(--indigo)", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
              Pathologist Clinical Interpretation & Microscopic Exam:
            </strong>
            <p style={{ margin: 0, fontSize: 12, color: "var(--ink)", lineHeight: 1.4 }}>
              {report.comments || "Microcytic hypochromic anemia with neutrophilic leukocytosis. Severe thrombocytopenia noted on smear. Direct telephonic alert provided to attending physician (Dr. Murali) for immediate clinical review."}
            </p>
          </div>

          {/* Digital Signatures & ABDM QR Footer */}
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr", gap: 16, alignItems: "center", borderTop: "2px solid var(--indigo)", paddingTop: 14 }}>
            {/* ABHA QR */}
            <div style={{ textAlign: "center" }}>
              <img src={qrUrl} alt="ABDM QR Code" style={{ width: 72, height: 72, display: "block", margin: "0 auto 2px" }} />
              <span style={{ fontSize: 9, color: "var(--slate)", display: "block" }}>Scan for ABDM</span>
            </div>

            {/* Biochemist Signatory */}
            <div style={{ textAlign: "center", borderLeft: "1px solid var(--line)", paddingLeft: 12 }}>
              <div style={{ height: 26 }}></div>
              <strong style={{ fontSize: 12, color: "var(--ink)", display: "block" }}>
                Suresh Kumar, M.Sc
              </strong>
              <span style={{ fontSize: 10.5, color: "var(--slate)" }}>Chief Medical Biochemist</span>
            </div>

            {/* Pathologist Signatory */}
            <div style={{ textAlign: "center", borderLeft: "1px solid var(--line)", paddingLeft: 12 }}>
              <div style={{ height: 26 }}></div>
              <strong style={{ fontSize: 12, color: "var(--indigo)", display: "block" }}>
                Dr. Ananya Reddy, MD
              </strong>
              <span style={{ fontSize: 10.5, color: "var(--slate)" }}>Consultant Pathologist (APMC-2026-67345)</span>
            </div>
          </div>
        </div>

        {/* Embedded Print CSS */}
        <style>{`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              background: #fff !important;
            }
            .lab-report-print-container {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
            }
          }
        `}</style>
      </div>
    </Modal>
  );
}
