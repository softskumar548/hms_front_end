import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Input, Select, StatusPill, Toast } from "../../ui/components";
import DiagnosticReportPrintModal from "./DiagnosticReportPrintModal";
import LabResultEntryModal from "./LabResultEntryModal";
import SpecimenBarcodeModal from "../printing/SpecimenBarcodeModal";

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientName: string;
  patientUhid: string;
  ageGender: string;
  bedNumber?: string;
  doctorName: string;
  department: string;
  testName: string;
  sampleId: string;
  specimenType: string;
  tubeCapColor: string;
  tubeCapLabel: string;
  status: "ORDERED" | "COLLECTED" | "IN_ANALYSIS" | "VERIFIED";
  priority: "ROUTINE" | "URGENT" | "STAT_EMERGENCY";
  orderedAt: string;
  collectedAt?: string;
  reportedAt?: string;
  hasPanicAlert?: boolean;
  comments?: string;
  parameters?: any[];
}

const initialLabOrders: LabOrder[] = [
  {
    id: "ord-101",
    orderNumber: "LAB-2026-901",
    patientName: "Ramesh Babu",
    patientUhid: "UHID-2026-90812",
    ageGender: "48Y / Male",
    bedNumber: "GMW-101 (Floor 2)",
    doctorName: "Dr. K R Murali (Dean)",
    department: "General Medicine",
    testName: "Complete Blood Count (CBC)",
    sampleId: "SMP-2026-8901",
    specimenType: "Whole Blood (EDTA K2)",
    tubeCapColor: "#7C3AED",
    tubeCapLabel: "EDTA Purple",
    status: "VERIFIED",
    priority: "STAT_EMERGENCY",
    orderedAt: "29-Aug-2026 08:00 AM",
    collectedAt: "29-Aug-2026 08:15 AM",
    reportedAt: "29-Aug-2026 08:45 AM",
    hasPanicAlert: true,
    comments: "Severe thrombocytopenia (Platelets 28,000/mcL). Attending physician notified telephonically.",
    parameters: [
      { name: "Hemoglobin (Hb)", value: "10.4", unit: "g/dL", reference: "13.0 - 17.0", flag: "LOW" },
      { name: "Total Leukocyte Count (WBC)", value: "14,800", unit: "/mcL", reference: "4,000 - 11,000", flag: "HIGH" },
      { name: "Platelet Count", value: "28,000", unit: "/mcL", reference: "1,50,000 - 4,50,000", flag: "CRITICAL" },
      { name: "Packed Cell Volume (PCV)", value: "32.0", unit: "%", reference: "40.0 - 50.0", flag: "LOW" },
      { name: "Neutrophils", value: "78", unit: "%", reference: "40 - 75", flag: "HIGH" },
      { name: "Lymphocytes", value: "16", unit: "%", reference: "20 - 45", flag: "LOW" },
    ],
  },
  {
    id: "ord-102",
    orderNumber: "LAB-2026-902",
    patientName: "Sita Devi",
    patientUhid: "UHID-2026-90813",
    ageGender: "42Y / Female",
    bedNumber: "SP-201A (Floor 2)",
    doctorName: "Dr. Sreenivasulu",
    department: "Cardiology",
    testName: "Liver Function Test (LFT)",
    sampleId: "SMP-2026-8902",
    specimenType: "Serum Gel Clot",
    tubeCapColor: "#DC2626",
    tubeCapLabel: "Serum Red",
    status: "IN_ANALYSIS",
    priority: "URGENT",
    orderedAt: "29-Aug-2026 08:30 AM",
    collectedAt: "29-Aug-2026 08:45 AM",
  },
  {
    id: "ord-103",
    orderNumber: "LAB-2026-903",
    patientName: "Venkatesh Rao",
    patientUhid: "UHID-2026-90814",
    ageGender: "55Y / Male",
    bedNumber: "ICU-01 (Floor 4)",
    doctorName: "Dr. V Ramana",
    department: "Critical Care",
    testName: "Renal Function Test (RFT)",
    sampleId: "SMP-2026-8903",
    specimenType: "Serum Gel Clot",
    tubeCapColor: "#DC2626",
    tubeCapLabel: "Serum Red",
    status: "VERIFIED",
    priority: "STAT_EMERGENCY",
    orderedAt: "29-Aug-2026 08:15 AM",
    collectedAt: "29-Aug-2026 08:20 AM",
    reportedAt: "29-Aug-2026 08:50 AM",
    hasPanicAlert: true,
    comments: "Hyperkalemia noted (K+ 6.4 mEq/L) with elevated creatinine. Critical call logged.",
    parameters: [
      { name: "Blood Urea", value: "48", unit: "mg/dL", reference: "15 - 45", flag: "HIGH" },
      { name: "Serum Creatinine", value: "3.8", unit: "mg/dL", reference: "0.7 - 1.3", flag: "CRITICAL" },
      { name: "Serum Sodium (Na+)", value: "138", unit: "mEq/L", reference: "135 - 145", flag: "NORMAL" },
      { name: "Serum Potassium (K+)", value: "6.4", unit: "mEq/L", reference: "3.5 - 5.0", flag: "CRITICAL" },
    ],
  },
  {
    id: "ord-104",
    orderNumber: "LAB-2026-904",
    patientName: "Lakshmi Kumari",
    patientUhid: "UHID-2026-90815",
    ageGender: "29Y / Female",
    doctorName: "Dr. Ananya Reddy",
    department: "Pediatrics & OPD",
    testName: "Fasting Blood Sugar (FBS)",
    sampleId: "SMP-2026-8904",
    specimenType: "Sodium Fluoride Plasma",
    tubeCapColor: "#64748B",
    tubeCapLabel: "Fluoride Grey",
    status: "ORDERED",
    priority: "ROUTINE",
    orderedAt: "29-Aug-2026 09:00 AM",
  },
  {
    id: "ord-105",
    orderNumber: "LAB-2026-905",
    patientName: "Kishore Kumar",
    patientUhid: "UHID-2026-90816",
    ageGender: "61Y / Male",
    bedNumber: "DX-301 (Floor 3)",
    doctorName: "Dr. Sreenivasulu",
    department: "Cardiology",
    testName: "Complete Blood Count (CBC)",
    sampleId: "SMP-2026-8905",
    specimenType: "Whole Blood (EDTA K2)",
    tubeCapColor: "#7C3AED",
    tubeCapLabel: "EDTA Purple",
    status: "COLLECTED",
    priority: "URGENT",
    orderedAt: "29-Aug-2026 09:10 AM",
    collectedAt: "29-Aug-2026 09:20 AM",
  },
];

export default function LaboratoryWorkstationScreen() {
  const { tenant } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "queue"; // queue, results, verify, reports

  const [orders, setOrders] = useState<LabOrder[]>(initialLabOrders);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const [resultEntryModalOpen, setResultEntryModalOpen] = useState(false);
  const [selectedOrderForEntry, setSelectedOrderForEntry] = useState<LabOrder | null>(null);

  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [selectedPatientForBarcode, setSelectedPatientForBarcode] = useState<any>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleTabChange = (tabKey: string) => {
    setSearchParams({ tab: tabKey });
  };

  // Metrics
  const pendingCollection = orders.filter((o) => o.status === "ORDERED").length;
  const inTestingCount = orders.filter((o) => o.status === "COLLECTED" || o.status === "IN_ANALYSIS").length;
  const panicCount = orders.filter((o) => o.hasPanicAlert).length;
  const verifiedToday = orders.filter((o) => o.status === "VERIFIED").length;

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.patientName.toLowerCase().includes(q) ||
      o.patientUhid.toLowerCase().includes(q) ||
      o.sampleId.toLowerCase().includes(q) ||
      o.testName.toLowerCase().includes(q) ||
      o.doctorName.toLowerCase().includes(q)
    );
  });

  // Action: Mark Sample Collected
  const handleCollectSample = (order: LabOrder) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              status: "COLLECTED",
              collectedAt: new Date().toLocaleTimeString("en-IN", { timeStyle: "short" }),
            }
          : o
      )
    );
    setSelectedPatientForBarcode({
      given_name: order.patientName.split(" ")[0],
      family_name: order.patientName.split(" ")[1] || "",
      national_id: order.patientUhid,
      gender: order.ageGender.includes("Female") ? "female" : "male",
    });
    setBarcodeModalOpen(true);
    triggerToast(`Sample ${order.sampleId} collected. Vacutainer barcode label ready.`);
  };

  // Action: Save Result Entry
  const handleResultEntrySuccess = (resultPayload: any) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === resultPayload.orderId
          ? {
              ...o,
              status: "VERIFIED",
              hasPanicAlert: resultPayload.hasPanicAlert,
              comments: resultPayload.comments,
              parameters: resultPayload.parameters,
              reportedAt: resultPayload.reportedAt,
            }
          : o
      )
    );
    setResultEntryModalOpen(false);
    triggerToast("Lab result verified and official report released.");
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Top Cyan Breadcrumb Banner */}
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
          <span style={{ fontSize: 18 }}>🧪</span>
          <span>Diagnostic Pathology & Radiology Workstation</span>
        </div>
        <div style={{ fontSize: 12, background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20 }}>
          {tenant ? `${tenant.replace("_", " ")} Hospital` : "ZEN CLINIC"} · NABL Accredited (MC-4891) · ABDM FHIR R4
        </div>
      </div>

      {/* 5 Top Lab KPI Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <Card style={{ borderLeft: "4px solid #00BCD4", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Phlebotomy Intake</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>{pendingCollection}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Awaiting Draw</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #F59E0B", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>In-Analysis Bench</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#D97706" }}>{inTestingCount}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Specimens Testing</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #DC2626", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>🚨 Panic / Critical Alerts</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#DC2626" }}>{panicCount}</strong>
            <span style={{ fontSize: 12, color: "#DC2626", fontWeight: 700 }}>Immediate Attention</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #16A34A", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Verified Reports</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#16A34A" }}>{verifiedToday}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Released Today</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid var(--indigo)", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Avg Turnaround</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>38m</strong>
            <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>Fast Track</span>
          </div>
        </Card>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", gap: 10, borderBottom: "2px solid var(--line)", paddingBottom: 6 }}>
        {[
          { key: "queue", label: "📋 Phlebotomy & Intake Queue", count: pendingCollection },
          { key: "results", label: "🧪 Result Entry & Bench Testing", count: inTestingCount },
          { key: "verify", label: "🔬 Pathologist Review & Sign-Off", count: orders.filter(o => o.status === "COLLECTED" || o.hasPanicAlert).length },
          { key: "reports", label: "📄 Diagnostic Reports Archive", count: verifiedToday },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            style={{
              padding: "10px 18px",
              borderRadius: "10px 10px 0 0",
              border: "none",
              background: activeTab === tab.key ? "var(--indigo)" : "transparent",
              color: activeTab === tab.key ? "#ffffff" : "var(--slate)",
              fontWeight: 800,
              fontSize: 13.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s ease",
            }}
          >
            <span>{tab.label}</span>
            <span style={{ fontSize: 11, background: activeTab === tab.key ? "rgba(255,255,255,0.25)" : "var(--wash-b)", color: activeTab === tab.key ? "#fff" : "var(--indigo)", padding: "2px 6px", borderRadius: 10 }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: PHLEBOTOMY & INTAKE QUEUE */}
      {activeTab === "queue" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                📋 Outpatient & Inpatient Specimen Requisitions
              </h3>
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                Collect blood, urine, and bodily fluid samples and generate 50×25mm Vacutainer tube barcodes
              </span>
            </div>

            <Input
              placeholder="Search by patient name, UHID, sample ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 280 }}
            />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Sample Barcode</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Patient Details</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Test Panel & Tube</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Doctor / Dept</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Priority</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Status</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <strong style={{ fontFamily: "monospace", color: "var(--indigo)", fontSize: 13 }}>
                        {ord.sampleId}
                      </strong>
                      <span style={{ fontSize: 11, color: "var(--slate)", display: "block" }}>{ord.orderedAt}</span>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <strong style={{ display: "block", color: "var(--ink)" }}>{ord.patientName}</strong>
                      <span style={{ fontSize: 11.5, color: "var(--slate)" }}>
                        {ord.patientUhid} · {ord.ageGender} {ord.bedNumber ? `· ${ord.bedNumber}` : ""}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <strong style={{ display: "block", color: "var(--ink)" }}>{ord.testName}</strong>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: ord.tubeCapColor }} />
                        <span style={{ fontSize: 11, color: "var(--slate)", fontWeight: 700 }}>{ord.tubeCapLabel}</span>
                      </div>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <div>{ord.doctorName}</div>
                      <span style={{ fontSize: 11.5, color: "var(--slate)" }}>{ord.department}</span>
                    </td>

                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 800,
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: ord.priority === "STAT_EMERGENCY" ? "#FEF2F2" : ord.priority === "URGENT" ? "#FEF3C7" : "#F1F5F9",
                          color: ord.priority === "STAT_EMERGENCY" ? "#DC2626" : ord.priority === "URGENT" ? "#B45309" : "#64748B",
                        }}
                      >
                        {ord.priority}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <StatusPill kind={ord.status === "VERIFIED" ? "success" : ord.status === "COLLECTED" ? "info" : "warn"}>
                        {ord.status}
                      </StatusPill>
                    </td>

                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      {ord.status === "ORDERED" ? (
                        <Button
                          type="button"
                          onClick={() => handleCollectSample(ord)}
                          style={{ background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)", color: "#fff", fontSize: 12, padding: "6px 14px" }}
                        >
                          🧪 Collect & Print Tube Sticker
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          ghost
                          onClick={() => {
                            setSelectedPatientForBarcode({
                              given_name: ord.patientName.split(" ")[0],
                              family_name: ord.patientName.split(" ")[1] || "",
                              national_id: ord.patientUhid,
                              gender: ord.ageGender.includes("Female") ? "female" : "male",
                            });
                            setBarcodeModalOpen(true);
                          }}
                          style={{ fontSize: 11.5, padding: "5px 10px" }}
                        >
                          🏷️ Re-print Barcode
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: RESULT ENTRY & TESTING BENCH */}
      {activeTab === "results" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                🧪 Analyte Result Entry & Panic Alert Desk
              </h3>
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                Input observed values for CBC, LFT, RFT, Glucose, and Lipid panels with live reference interval checks
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
            {orders.map((ord) => (
              <div
                key={ord.id}
                style={{
                  background: ord.hasPanicAlert ? "#FEF2F2" : "var(--wash-a)",
                  border: ord.hasPanicAlert ? "2px solid #DC2626" : "1px solid var(--line)",
                  borderRadius: 14,
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "var(--indigo)" }}>
                      {ord.sampleId}
                    </span>
                    {ord.hasPanicAlert ? (
                      <span style={{ background: "#DC2626", color: "#fff", padding: "2px 8px", borderRadius: 4, fontWeight: 900, fontSize: 10.5 }}>
                        🚨 PANIC ALERT
                      </span>
                    ) : (
                      <StatusPill kind={ord.status === "VERIFIED" ? "success" : "warn"}>
                        {ord.status}
                      </StatusPill>
                    )}
                  </div>

                  <strong style={{ fontSize: 15, color: "var(--ink)", display: "block" }}>{ord.patientName}</strong>
                  <span style={{ fontSize: 12, color: "var(--slate)" }}>
                    {ord.testName} · {ord.tubeCapLabel}
                  </span>

                  <div style={{ background: "#fff", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", margin: "12px 0", fontSize: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "var(--slate)" }}>Referring Doctor:</span>
                      <strong>{ord.doctorName}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--slate)" }}>Ordered:</span>
                      <span>{ord.orderedAt}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedOrderForEntry(ord);
                      setResultEntryModalOpen(true);
                    }}
                    style={{ flex: 1, background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)", color: "#fff", fontSize: 12.5 }}
                  >
                    🧪 Enter / Edit Results
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: PATHOLOGIST REVIEW */}
      {activeTab === "verify" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                🔬 Senior Pathologist Review & Sign-Off Desk
              </h3>
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                Authorized sign-off by Dr. Ananya Reddy (MD Pathology) and Suresh Kumar (Biochemist)
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {orders.map((ord) => (
              <div
                key={ord.id}
                style={{
                  background: ord.hasPanicAlert ? "#FEF2F2" : "var(--wash-a)",
                  border: ord.hasPanicAlert ? "1px solid #DC2626" : "1px solid var(--line)",
                  padding: "14px 18px",
                  borderRadius: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <strong style={{ fontSize: 14.5, color: "var(--ink)" }}>{ord.patientName}</strong>
                    <span style={{ fontSize: 12, color: "var(--slate)" }}>({ord.patientUhid})</span>
                    {ord.hasPanicAlert && (
                      <span style={{ background: "#DC2626", color: "#fff", padding: "2px 6px", borderRadius: 4, fontWeight: 900, fontSize: 10 }}>
                        🚨 PANIC VALUE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--indigo)", fontWeight: 700, marginTop: 2 }}>
                    {ord.testName} · Sample ID: {ord.sampleId}
                  </div>
                  {ord.comments && (
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--slate)" }}>
                      Pathologist Note: <em>"{ord.comments}"</em>
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedReport(ord);
                      setReportModalOpen(true);
                    }}
                    style={{ fontSize: 12, padding: "6px 14px" }}
                  >
                    📄 Review Full Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: DIAGNOSTIC REPORTS ARCHIVE */}
      {activeTab === "reports" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <Input
              placeholder="Search reports by patient name, UHID, sample code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 320 }}
            />

            <div style={{ fontSize: 12.5, color: "var(--slate)" }}>
              Showing <strong>{filteredOrders.filter(o => o.status === "VERIFIED").length}</strong> verified diagnostic reports
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
            {filteredOrders.filter(o => o.status === "VERIFIED").map((ord) => (
              <div
                key={ord.id}
                style={{
                  background: "var(--wash-a)",
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "var(--indigo)" }}>
                      {ord.sampleId}
                    </span>
                    <span style={{ fontSize: 11, background: "#DCFCE7", color: "#166534", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                      ✓ VERIFIED
                    </span>
                  </div>

                  <strong style={{ fontSize: 15, color: "var(--ink)", display: "block" }}>{ord.patientName}</strong>
                  <span style={{ fontSize: 12, color: "var(--slate)" }}>{ord.patientUhid} · {ord.ageGender}</span>

                  <div style={{ background: "#fff", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", margin: "12px 0", fontSize: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "var(--slate)" }}>Test Panel:</span>
                      <strong style={{ color: "var(--indigo)" }}>{ord.testName}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--line)", paddingTop: 4 }}>
                      <span style={{ color: "var(--slate)" }}>Reported At:</span>
                      <span>{ord.reportedAt || "Today"}</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    setSelectedReport(ord);
                    setReportModalOpen(true);
                  }}
                  style={{ width: "100%", background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)", color: "#fff", fontSize: 12.5 }}
                >
                  🖨️ View & Print Official Lab Report
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Printable Report Modal */}
      {reportModalOpen && selectedReport && (
        <DiagnosticReportPrintModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          report={selectedReport}
        />
      )}

      {/* Result Entry Modal */}
      {resultEntryModalOpen && selectedOrderForEntry && (
        <LabResultEntryModal
          isOpen={resultEntryModalOpen}
          onClose={() => setResultEntryModalOpen(false)}
          order={selectedOrderForEntry}
          onSuccess={handleResultEntrySuccess}
        />
      )}

      {/* Specimen Barcode Modal */}
      {barcodeModalOpen && selectedPatientForBarcode && (
        <SpecimenBarcodeModal
          isOpen={barcodeModalOpen}
          onClose={() => setBarcodeModalOpen(false)}
          patient={selectedPatientForBarcode}
        />
      )}

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
