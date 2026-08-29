import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Input, Select, StatusPill, Toast } from "../../ui/components";
import EmergencyIntakeModal from "./EmergencyIntakeModal";
import EmergencyICUTransferModal from "./EmergencyICUTransferModal";

export interface EmergencyCase {
  id: string;
  emergencyNumber: string;
  patientName: string;
  isUnknown: boolean;
  ageGender: string;
  arrivalMode: string;
  paramedicPhone?: string;
  complaint: string;
  assignedBay: string;
  triageLevel: "RED" | "YELLOW" | "GREEN";
  gcsScore: number;
  gcsBreakdown: string;
  vitals: {
    spo2: number;
    pulse: number;
    bp: string;
    rbs: number;
  };
  intakeTime: string;
  status: "IN_TRAUMA_BAY" | "TRANSFERRED_ICU" | "TRANSFERRED_OT" | "DISCHARGED";
  destinationBed?: string;
}

const initialEmergencyCases: EmergencyCase[] = [
  {
    id: "emg-01",
    emergencyNumber: "ER-2026-9011",
    patientName: "UNKNOWN MALE #9021 (108 BROUGHT)",
    isUnknown: true,
    ageGender: "35Y / Male",
    arrivalMode: "108_AMBULANCE",
    paramedicPhone: "9848011223",
    complaint: "RTA Polytrauma & Severe Head Injury",
    assignedBay: "Bay 1 (Resuscitation Suite)",
    triageLevel: "RED",
    gcsScore: 6,
    gcsBreakdown: "E1V2M3",
    vitals: {
      spo2: 84,
      pulse: 124,
      bp: "80/50",
      rbs: 140,
    },
    intakeTime: "08:15 AM",
    status: "IN_TRAUMA_BAY",
  },
  {
    id: "emg-02",
    emergencyNumber: "ER-2026-9012",
    patientName: "Kishore Varma",
    isUnknown: false,
    ageGender: "58Y / Male",
    arrivalMode: "PRIVATE_VEHICLE",
    paramedicPhone: "9848022334",
    complaint: "Acute STEMI / Anterior Wall MI with Cardiogenic Shock",
    assignedBay: "Bay 3 (Cardiac / Chest Pain)",
    triageLevel: "RED",
    gcsScore: 14,
    gcsBreakdown: "E4V4M6",
    vitals: {
      spo2: 90,
      pulse: 110,
      bp: "85/60",
      rbs: 180,
    },
    intakeTime: "08:30 AM",
    status: "IN_TRAUMA_BAY",
  },
  {
    id: "emg-03",
    emergencyNumber: "ER-2026-9013",
    patientName: "Saritha Reddy",
    isUnknown: false,
    ageGender: "44Y / Female",
    arrivalMode: "108_AMBULANCE",
    paramedicPhone: "9848033445",
    complaint: "Acute Bronchial Asthma with Severe Stridor",
    assignedBay: "Bay 2 (Acute Trauma)",
    triageLevel: "YELLOW",
    gcsScore: 15,
    gcsBreakdown: "E4V5M6",
    vitals: {
      spo2: 91,
      pulse: 98,
      bp: "130/85",
      rbs: 115,
    },
    intakeTime: "08:45 AM",
    status: "IN_TRAUMA_BAY",
  },
  {
    id: "emg-04",
    emergencyNumber: "ER-2026-9014",
    patientName: "Appa Rao",
    isUnknown: false,
    ageGender: "62Y / Male",
    arrivalMode: "WALK_IN",
    complaint: "Acute Right Forearm Colles Fracture",
    assignedBay: "Bay 4 (General Casualty)",
    triageLevel: "GREEN",
    gcsScore: 15,
    gcsBreakdown: "E4V5M6",
    vitals: {
      spo2: 98,
      pulse: 76,
      bp: "125/80",
      rbs: 105,
    },
    intakeTime: "09:00 AM",
    status: "IN_TRAUMA_BAY",
  },
];

export default function EmergencyTriageScreen() {
  const { tenant } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "board"; // board, intake, transfers, stat

  const [cases, setCases] = useState<EmergencyCase[]>(initialEmergencyCases);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [intakeModalOpen, setIntakeModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedCaseForTransfer, setSelectedCaseForTransfer] = useState<EmergencyCase | null>(null);

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
  const redCount = cases.filter((c) => c.triageLevel === "RED" && c.status === "IN_TRAUMA_BAY").length;
  const yellowCount = cases.filter((c) => c.triageLevel === "YELLOW" && c.status === "IN_TRAUMA_BAY").length;
  const greenCount = cases.filter((c) => c.triageLevel === "GREEN" && c.status === "IN_TRAUMA_BAY").length;
  const transferredCount = cases.filter((c) => c.status.startsWith("TRANSFERRED")).length;

  const filteredCases = cases.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.patientName.toLowerCase().includes(q) ||
      c.emergencyNumber.toLowerCase().includes(q) ||
      c.assignedBay.toLowerCase().includes(q) ||
      c.complaint.toLowerCase().includes(q)
    );
  });

  // Action: Add new emergency case
  const handleIntakeSuccess = (newCase: EmergencyCase) => {
    setCases((prev) => [newCase, ...prev]);
    setIntakeModalOpen(false);
    triggerToast(`Admitted ${newCase.patientName} to ${newCase.assignedBay} (${newCase.triageLevel} Triage).`);
  };

  // Action: Transfer to ICU
  const handleTransferSuccess = (transferData: any) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === transferData.caseId
          ? {
              ...c,
              status: "TRANSFERRED_ICU",
              destinationBed: transferData.destinationBed,
            }
          : c
      )
    );
    setTransferModalOpen(false);
    triggerToast(`Patient transferred to ${transferData.destinationBed} under ${transferData.attendingIntensivist}.`);
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
          <span style={{ fontSize: 18 }}>🚨</span>
          <span>Emergency Casualty & Acute Trauma Triage Desk</span>
        </div>
        <div style={{ fontSize: 12, background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20 }}>
          {tenant ? `${tenant.replace("_", " ")} Emergency` : "ZEN CLINIC EMERGENCY"} · Level-1 Trauma Center · 108 Direct Integration
        </div>
      </div>

      {/* 5 Top Emergency KPI Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <Card style={{ borderLeft: "4px solid #DC2626", padding: "14px 18px", background: "#FEF2F2" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#DC2626", textTransform: "uppercase" }}>🔴 Red Triage (Immediate)</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 26, color: "#DC2626" }}>{redCount}</strong>
            <span style={{ fontSize: 12, color: "#991B1B", fontWeight: 700 }}>Resuscitation</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #F59E0B", padding: "14px 18px", background: "#FEFCE8" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#D97706", textTransform: "uppercase" }}>🟡 Yellow Triage (Urgent)</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 26, color: "#D97706" }}>{yellowCount}</strong>
            <span style={{ fontSize: 12, color: "#B45309", fontWeight: 700 }}>&lt; 15 mins</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #16A34A", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#16A34A", textTransform: "uppercase" }}>🟢 Green Triage (Stable)</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 26, color: "#16A34A" }}>{greenCount}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Casualty Bays</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid var(--indigo)", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>ICU / OT Transfers</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 26, color: "var(--indigo)" }}>{transferredCount}</strong>
            <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>Ventilator Shifted</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #00BCD4", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Door-to-Doctor</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 26, color: "var(--indigo)" }}>5.8m</strong>
            <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>Fast Track</span>
          </div>
        </Card>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid var(--line)", paddingBottom: 6 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { key: "board", label: "🚨 Live Casualty Bays", count: cases.filter(c => c.status === "IN_TRAUMA_BAY").length },
            { key: "transfers", label: "🛏️ ICU & OT Escalations", count: transferredCount },
            { key: "stat", label: "🩸 STAT Blood & Fast Echo", count: "STAT" },
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

        <div>
          <Button
            type="button"
            onClick={() => setIntakeModalOpen(true)}
            style={{ background: "#DC2626", color: "#fff", fontWeight: 800, fontSize: 13, padding: "9px 18px" }}
          >
            ⚡ Rapid Emergency Intake (30s)
          </Button>
        </div>
      </div>

      {/* TAB 1: LIVE CASUALTY BAYS BOARD */}
      {activeTab === "board" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                🚨 Active Emergency Bays & Trauma Resuscitation Suites
              </h3>
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                Real-time patient monitoring, GCS consciousness score, and instant 1-click critical ICU ventilator escalation
              </span>
            </div>

            <Input
              placeholder="Search casualty cases, bay, diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 280 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
            {filteredCases.filter(c => c.status === "IN_TRAUMA_BAY").map((c) => {
              const isRed = c.triageLevel === "RED";
              const isYellow = c.triageLevel === "YELLOW";

              return (
                <div
                  key={c.id}
                  style={{
                    background: isRed ? "#FEF2F2" : isYellow ? "#FFFBEB" : "var(--wash-a)",
                    border: isRed ? "2px solid #DC2626" : isYellow ? "2px solid #F59E0B" : "1.5px solid #16A34A",
                    borderRadius: 14,
                    padding: "16px 18px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: isRed ? "0 4px 14px rgba(220, 38, 38, 0.15)" : "none",
                  }}
                >
                  <div>
                    {/* Header with Bay & Triage Badge */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 900, background: isRed ? "#DC2626" : isYellow ? "#D97706" : "#16A34A", color: "#fff", padding: "3px 8px", borderRadius: 4, textTransform: "uppercase" }}>
                        {c.triageLevel} TRIAGE · {c.assignedBay.split(" ")[0]} {c.assignedBay.split(" ")[1]}
                      </span>
                      <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--indigo)", fontWeight: 700 }}>
                        {c.emergencyNumber}
                      </span>
                    </div>

                    <strong style={{ fontSize: 15.5, color: isRed ? "#991B1B" : "var(--ink)", display: "block" }}>
                      {c.patientName}
                    </strong>
                    <span style={{ fontSize: 12, color: "var(--slate)" }}>
                      {c.ageGender} · Arrival: {c.arrivalMode.replace("_", " ")} ({c.intakeTime})
                    </span>

                    {/* Presenting Complaint */}
                    <div style={{ background: "#fff", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)", margin: "10px 0" }}>
                      <strong style={{ fontSize: 12, color: isRed ? "#DC2626" : "var(--indigo)", display: "block" }}>
                        💥 {c.complaint}
                      </strong>
                    </div>

                    {/* GCS & Vitals Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: 6, background: "rgba(255,255,255,0.7)", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)", marginBottom: 12, fontSize: 11.5 }}>
                      <div>
                        <span style={{ color: "var(--slate)", display: "block", fontSize: 10 }}>GCS SCORE</span>
                        <strong style={{ color: c.gcsScore <= 8 ? "#DC2626" : "var(--ink)", fontSize: 12.5 }}>
                          {c.gcsScore}/15 ({c.gcsBreakdown})
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--slate)", display: "block", fontSize: 10 }}>SpO2</span>
                        <strong style={{ color: c.vitals.spo2 < 90 ? "#DC2626" : "#16A34A" }}>
                          {c.vitals.spo2}%
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--slate)", display: "block", fontSize: 10 }}>PULSE</span>
                        <strong>{c.vitals.pulse} bpm</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--slate)", display: "block", fontSize: 10 }}>BP</span>
                        <strong>{c.vitals.bp}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Controls */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 8 }}>
                    <Button
                      type="button"
                      onClick={() => {
                        setSelectedCaseForTransfer(c);
                        setTransferModalOpen(true);
                      }}
                      style={{ background: "#DC2626", color: "#fff", fontSize: 11.5, padding: "7px 10px", fontWeight: 800 }}
                    >
                      🛏️ Shift to ICU Ventilator
                    </Button>

                    <Button
                      type="button"
                      ghost
                      onClick={() => triggerToast(`Emergency STAT Blood Cross-Match requisition sent for ${c.patientName}`)}
                      style={{ fontSize: 11.5, padding: "7px 8px" }}
                    >
                      🩸 STAT Blood
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* TAB 2: ICU & OT TRANSFERS */}
      {activeTab === "transfers" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                🛏️ Critical Care Escalation & ICU / OT Transfers Ledger
              </h3>
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                Patients escalated from Casualty to Floor 4 ICU Mechanical Ventilators or Emergency Operation Theatre
              </span>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>ER Number</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Patient Name</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Diagnosis / Trauma</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Target Critical Unit</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {cases.filter(c => c.status.startsWith("TRANSFERRED")).map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "var(--indigo)", fontWeight: 700 }}>
                      {c.emergencyNumber}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <strong style={{ display: "block" }}>{c.patientName}</strong>
                      <span style={{ fontSize: 11.5, color: "var(--slate)" }}>{c.ageGender}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>{c.complaint}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <strong style={{ color: "#DC2626" }}>{c.destinationBed || "ICU-01 (Floor 4)"}</strong>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <span style={{ fontSize: 11, background: "#FEF2F2", color: "#DC2626", padding: "3px 8px", borderRadius: 4, fontWeight: 800 }}>
                        ✓ ESCALATED TO ICU
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: STAT BLOOD & FAST ECHO REQUISITIONS */}
      {activeTab === "stat" && (
        <Card style={{ borderRadius: 16 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
            🩸 Emergency STAT Clinical Requisitions
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
            <div style={{ background: "#FEF2F2", border: "1.5px solid #DC2626", padding: 16, borderRadius: 12 }}>
              <strong style={{ fontSize: 15, color: "#DC2626", display: "block" }}>
                🩸 Emergency Uncrossmatched O-Negative Blood
              </strong>
              <span style={{ fontSize: 12, color: "#991B1B", display: "block", margin: "4px 0 14px" }}>
                Immediate release of 2 Units O-Negative PRBC for severe hemorrhagic shock without pre-transfusion crossmatch.
              </span>
              <Button
                type="button"
                onClick={() => triggerToast("Emergency 2 Units O-Negative Blood requisition dispatched to Blood Bank.")}
                style={{ width: "100%", background: "#DC2626", color: "#fff", fontSize: 12.5 }}
              >
                🚨 Requisition 2 Units O-Negative (STAT)
              </Button>
            </div>

            <div style={{ background: "var(--wash-a)", border: "1px solid var(--line)", padding: 16, borderRadius: 12 }}>
              <strong style={{ fontSize: 15, color: "var(--indigo)", display: "block" }}>
                🔬 Bedside FAST Ultrasound / Echo
              </strong>
              <span style={{ fontSize: 12, color: "var(--slate)", display: "block", margin: "4px 0 14px" }}>
                Focused Assessment with Sonography in Trauma (FAST) for hemoperitoneum or pericardial tamponade.
              </span>
              <Button
                type="button"
                onClick={() => triggerToast("Bedside FAST Ultrasound team paged to Trauma Resuscitation Bay.")}
                style={{ width: "100%", background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)", color: "#fff", fontSize: 12.5 }}
              >
                Page FAST Ultrasound Team
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Emergency Intake Modal */}
      {intakeModalOpen && (
        <EmergencyIntakeModal
          isOpen={intakeModalOpen}
          onClose={() => setIntakeModalOpen(false)}
          onSuccess={handleIntakeSuccess}
        />
      )}

      {/* ICU Transfer Modal */}
      {transferModalOpen && selectedCaseForTransfer && (
        <EmergencyICUTransferModal
          isOpen={transferModalOpen}
          onClose={() => setTransferModalOpen(false)}
          emergencyCase={selectedCaseForTransfer}
          onSuccess={handleTransferSuccess}
        />
      )}

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
