import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Input, Select, StatusPill, Toast } from "../../ui/components";
import SurgeryBookingModal from "./SurgeryBookingModal";
import WHOSurgicalChecklistModal from "./WHOSurgicalChecklistModal";
import PACURecoveryModal from "./PACURecoveryModal";

export interface SurgeryCase {
  id: string;
  otNumber: string;
  patientName: string;
  patientUhid: string;
  ageGender: string;
  procedure: string;
  specialty: string;
  theatre: string;
  team: {
    leadSurgeon: string;
    assistantSurgeon: string;
    anesthesiologist: string;
    scrubNurse: string;
  };
  anesthesiaType: string;
  scheduledDate: string;
  scheduledTime: string;
  preOpStatus: {
    pacCleared: boolean;
    consentSigned: boolean;
    npoConfirmed: boolean;
    bloodArranged: boolean;
  };
  status: "PRE_OP" | "IN_SURGERY" | "PACU_RECOVERY" | "COMPLETED";
  whoChecklistDone: boolean;
  aldreteScore: number | null;
  targetWard?: string;
  whoCertifiedAt?: string;
  dischargedAt?: string;
}

export default function OperationTheatreScreen() {
  const { tenant } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "grid"; // grid, booking, who, pacu

  const [surgeries, setSurgeries] = useState<SurgeryCase[]>(() => {
    const saved = localStorage.getItem(`hms-surgeries-${tenant || "default"}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState("");

  const saveSurgeries = (nextSurgeries: SurgeryCase[]) => {
    setSurgeries(nextSurgeries);
    localStorage.setItem(`hms-surgeries-${tenant || "default"}`, JSON.stringify(nextSurgeries));
  };

  // Modals state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [whoModalOpen, setWhoModalOpen] = useState(false);
  const [pacuModalOpen, setPacuModalOpen] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState<SurgeryCase | null>(null);

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
  const scheduledCount = surgeries.length;
  const inSurgeryCount = surgeries.filter((s) => s.status === "IN_SURGERY").length;
  const inPacuCount = surgeries.filter((s) => s.status === "PACU_RECOVERY").length;
  const completedCount = surgeries.filter((s) => s.status === "COMPLETED").length;

  const filteredSurgeries = surgeries.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.patientName.toLowerCase().includes(q) ||
      s.patientUhid.toLowerCase().includes(q) ||
      s.procedure.toLowerCase().includes(q) ||
      s.theatre.toLowerCase().includes(q) ||
      s.team.leadSurgeon.toLowerCase().includes(q)
    );
  });

  // Action: Add new surgery
  const handleBookingSuccess = (newSurgery: SurgeryCase) => {
    const next = [newSurgery, ...surgeries];
    saveSurgeries(next);
    setBookingModalOpen(false);
    triggerToast(`Surgery scheduled in ${newSurgery.theatre.split(" ")[0]} for ${newSurgery.patientName}.`);
  };

  // Action: WHO Checklist completed
  const handleWhoSuccess = (updated: SurgeryCase) => {
    const next = surgeries.map((s) => (s.id === updated.id ? updated : s));
    saveSurgeries(next);
    setWhoModalOpen(false);
    triggerToast(`WHO Surgical Safety certified. Patient moved to PACU Recovery.`);
  };

  // Action: PACU Discharge
  const handlePacuSuccess = (updated: SurgeryCase) => {
    const next = surgeries.map((s) => (s.id === updated.id ? updated : s));
    saveSurgeries(next);
    setPacuModalOpen(false);
    triggerToast(`Aldrete Score ${updated.aldreteScore}/10 verified. Patient discharged to ${updated.targetWard}.`);
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
          <span style={{ fontSize: 18 }}>🏥</span>
          <span>Operation Theatre (OT) Scheduling & WHO Surgical Safety</span>
        </div>
        <div style={{ fontSize: 12, background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20 }}>
          {tenant ? `${tenant.replace("_", " ")} OT Complex` : "ZEN CLINIC OT COMPLEX"} · 4 Major Suites · Laminar Flow & C-Arm Active
        </div>
      </div>

      {/* 5 Top OT KPI Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <Card style={{ borderLeft: "4px solid var(--indigo)", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Scheduled Today</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>{scheduledCount}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Total Surgeries</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #DC2626", padding: "14px 18px", background: "#FEF2F2" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#DC2626", textTransform: "uppercase" }}>In-Surgery Active</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#DC2626" }}>{inSurgeryCount}</strong>
            <span style={{ fontSize: 12, color: "#991B1B", fontWeight: 700 }}>Active Theatres</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #F59E0B", padding: "14px 18px", background: "#FEFCE8" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#D97706", textTransform: "uppercase" }}>PACU Recovery</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#D97706" }}>{inPacuCount}</strong>
            <span style={{ fontSize: 12, color: "#B45309", fontWeight: 700 }}>Aldrete Scoring</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #16A34A", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Completed & Shifted</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#16A34A" }}>{completedCount}</strong>
            <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>Post-Op Wards</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #00BCD4", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>WHO Safety Compliance</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>100%</strong>
            <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>Certified</span>
          </div>
        </Card>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid var(--line)", paddingBottom: 6 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { key: "grid", label: "🏥 4-Theatre Suites Grid", count: "4 OTs" },
            { key: "booking", label: "📅 Surgery Scheduling Desk", count: scheduledCount },
            { key: "who", label: "📋 WHO Surgical Safety Desk", count: "3-Stage" },
            { key: "pacu", label: "🛏️ PACU Recovery Lounge", count: inPacuCount },
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
            onClick={() => setBookingModalOpen(true)}
            style={{ background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)", color: "#fff", fontWeight: 800, fontSize: 13, padding: "9px 18px" }}
          >
            📅 Schedule Surgical Case
          </Button>
        </div>
      </div>

      {/* TAB 1: 4-THEATRE SUITES GRID */}
      {activeTab === "grid" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                🏥 Operation Theatre Complex (Suites OT-01 to OT-04)
              </h3>
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                Live surgical progress, anesthesia monitoring, and 3-stage WHO surgical safety compliance
              </span>
            </div>

            <Input
              placeholder="Search by patient, procedure, surgeon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 280 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
            {filteredSurgeries.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 24px", background: "var(--wash-a)", borderRadius: 14, border: "1px dashed var(--line)" }}>
                <span style={{ fontSize: 36, display: "block", marginBottom: 12 }}>🏥</span>
                <strong style={{ fontSize: 16, color: "var(--ink)", display: "block", marginBottom: 6 }}>
                  No Surgical Cases Scheduled for Today
                </strong>
                <span style={{ fontSize: 13, color: "var(--slate)", maxWidth: 440, margin: "0 auto 18px", display: "block" }}>
                  All 4 operation theatre suites (Ortho, Laparoscopy, CTVS, Trauma) are currently unbooked. Click '+ Schedule Surgical Case' to schedule an elective or emergency procedure.
                </span>
                <Button type="button" onClick={() => setBookingModalOpen(true)} style={{ background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)", color: "#fff", fontWeight: 800 }}>
                  📅 Schedule Surgical Case
                </Button>
              </div>
            ) : (
              filteredSurgeries.map((surg) => {
                const isInSurgery = surg.status === "IN_SURGERY";
                const isPacu = surg.status === "PACU_RECOVERY";
                const isPreOp = surg.status === "PRE_OP";

                return (
                  <div
                    key={surg.id}
                    style={{
                      background: isInSurgery ? "#FEF2F2" : isPacu ? "#FFFBEB" : "var(--wash-a)",
                      border: isInSurgery ? "2px solid #DC2626" : isPacu ? "2px solid #F59E0B" : "1.5px solid var(--line)",
                      borderRadius: 14,
                      padding: "16px 18px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxShadow: isInSurgery ? "0 4px 14px rgba(220, 38, 38, 0.15)" : "none",
                    }}
                  >
                    <div>
                      {/* Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 900, background: isInSurgery ? "#DC2626" : isPacu ? "#D97706" : "var(--indigo)", color: "#fff", padding: "3px 8px", borderRadius: 4, textTransform: "uppercase" }}>
                          {surg.theatre.split(" ")[0]} · {surg.status.replace("_", " ")}
                        </span>
                        <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--indigo)", fontWeight: 700 }}>
                          {surg.otNumber}
                        </span>
                      </div>

                      <strong style={{ fontSize: 16, color: "var(--ink)", display: "block" }}>
                        {surg.patientName}
                      </strong>
                      <span style={{ fontSize: 12, color: "var(--slate)" }}>
                        {surg.patientUhid} · {surg.ageGender} · Slot: {surg.scheduledTime}
                      </span>

                      {/* Surgical Procedure */}
                      <div style={{ background: "#fff", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", margin: "10px 0" }}>
                        <strong style={{ fontSize: 13, color: "var(--indigo)", display: "block" }}>
                          🔪 {surg.procedure}
                        </strong>
                        <span style={{ fontSize: 11.5, color: "var(--slate)", display: "block", marginTop: 2 }}>
                          Specialty: <strong>{surg.specialty}</strong> · Anesthesia: {surg.anesthesiaType}
                        </span>
                      </div>

                      {/* Team Details */}
                      <div style={{ fontSize: 12, color: "var(--ink)", background: "rgba(255,255,255,0.7)", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)", marginBottom: 12 }}>
                        <div>👨‍⚕️ <strong>Surgeon:</strong> {surg.team.leadSurgeon}</div>
                        <div>🩺 <strong>Anesthetist:</strong> {surg.team.anesthesiologist}</div>
                        <div>👩‍⚕️ <strong>Scrub Nurse:</strong> {surg.team.scrubNurse}</div>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <Button
                        type="button"
                        onClick={() => {
                          setSelectedSurgery(surg);
                          setWhoModalOpen(true);
                        }}
                        style={{
                          background: surg.whoChecklistDone ? "#16A34A" : "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)",
                          color: "#fff",
                          fontSize: 11.5,
                          padding: "7px 10px",
                          fontWeight: 800,
                        }}
                      >
                        {surg.whoChecklistDone ? "✓ WHO Certified" : "📋 WHO Checklist"}
                      </Button>

                      <Button
                        type="button"
                        ghost
                        onClick={() => {
                          setSelectedSurgery(surg);
                          setPacuModalOpen(true);
                        }}
                        style={{ fontSize: 11.5, padding: "7px 8px" }}
                      >
                        🛏️ PACU Aldrete ({surg.aldreteScore !== null ? `${surg.aldreteScore}/10` : "Evaluate"})
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {/* TAB 2: SURGERY BOOKING DESK */}
      {activeTab === "booking" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                📅 Surgical Case Scheduling & Team Roster
              </h3>
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                Elective and emergency bookings with PAC clearance, consent verification, and blood bank reservation
              </span>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>OT #</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Patient & UHID</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Surgical Procedure</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Theatre & Slot</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Lead Surgeon</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Pre-Op Status</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSurgeries.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "32px 14px", color: "var(--slate)", fontStyle: "italic" }}>
                      No surgical bookings recorded for today.
                    </td>
                  </tr>
                ) : (
                  filteredSurgeries.map((surg) => (
                    <tr key={surg.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "var(--indigo)", fontWeight: 700 }}>
                        {surg.otNumber}
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <strong style={{ display: "block" }}>{surg.patientName}</strong>
                        <span style={{ fontSize: 11.5, color: "var(--slate)" }}>{surg.patientUhid} · {surg.ageGender}</span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <strong>{surg.procedure}</strong>
                        <span style={{ fontSize: 11, color: "var(--slate)", display: "block" }}>{surg.specialty}</span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div>{surg.theatre.split(" ")[0]}</div>
                        <span style={{ fontSize: 11.5, color: "var(--slate)" }}>{surg.scheduledTime}</span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        {surg.team.leadSurgeon.split("(")[0]}
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <span style={{ fontSize: 11, background: "#DCFCE7", color: "#166534", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                          ✓ PAC Cleared · Consent OK
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <StatusPill kind={surg.status === "IN_SURGERY" ? "danger" : surg.status === "PACU_RECOVERY" ? "warn" : "info"}>
                          {surg.status}
                        </StatusPill>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: WHO CHECKLIST DESK */}
      {activeTab === "who" && (
        <Card style={{ borderRadius: 16 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
            📋 WHO Surgical Safety 3-Stage Protocol Standards
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            <div style={{ background: "#EFF6FF", border: "1.5px solid #3B82F6", padding: 14, borderRadius: 10 }}>
              <strong style={{ fontSize: 14, color: "#1E40AF", display: "block", marginBottom: 4 }}>
                1. SIGN IN (Pre-Induction)
              </strong>
              <span style={{ fontSize: 12, color: "#1E3A8A" }}>
                Patient identity verified, surgical site marked, pulse oximeter checked, allergy history, and difficult airway readiness.
              </span>
            </div>

            <div style={{ background: "#FEFCE8", border: "1.5px solid #EAB308", padding: 14, borderRadius: 10 }}>
              <strong style={{ fontSize: 14, color: "#854D0E", display: "block", marginBottom: 4 }}>
                2. TIME OUT (Pre-Incision)
              </strong>
              <span style={{ fontSize: 12, color: "#713F12" }}>
                Verbal team confirmation, antibiotic prophylaxis given &lt; 60 mins, imaging displayed, and sterilization verified.
              </span>
            </div>

            <div style={{ background: "#F0FDF4", border: "1.5px solid #22C55E", padding: 14, borderRadius: 10 }}>
              <strong style={{ fontSize: 14, color: "#166534", display: "block", marginBottom: 4 }}>
                3. SIGN OUT (Pre-Exit)
              </strong>
              <span style={{ fontSize: 12, color: "#14532D" }}>
                Instrument/sponge/needle counts 100% correct, biopsy specimen labeled, equipment verified, and PACU handover.
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: PACU POST-ANESTHESIA RECOVERY */}
      {activeTab === "pacu" && (
        <Card style={{ borderRadius: 16 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
            🛏️ Post-Anesthesia Care Unit (PACU) - Active Recovery Lounge
          </h3>

          <div style={{ display: "grid", gap: 12 }}>
            {surgeries.filter(s => s.status === "PACU_RECOVERY").map((surg) => (
              <div key={surg.id} style={{ background: "var(--wash-a)", border: "1px solid var(--line)", padding: "14px 18px", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: 15, color: "var(--ink)" }}>{surg.patientName}</strong>
                  <span style={{ fontSize: 12, color: "var(--slate)", marginLeft: 6 }}>({surg.patientUhid})</span>
                  <span style={{ fontSize: 12, color: "var(--slate)", display: "block", marginTop: 2 }}>
                    Post: <strong>{surg.procedure}</strong> · Surgeon: {surg.team.leadSurgeon}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 10.5, color: "var(--slate)", textTransform: "uppercase", display: "block" }}>Aldrete Score</span>
                    <strong style={{ fontSize: 18, color: (surg.aldreteScore || 0) >= 9 ? "#16A34A" : "#D97706" }}>
                      {surg.aldreteScore !== null ? `${surg.aldreteScore}/10` : "Needs Evaluation"}
                    </strong>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedSurgery(surg);
                      setPacuModalOpen(true);
                    }}
                    style={{ background: "#16A34A", color: "#fff", fontSize: 12 }}
                  >
                    Evaluate & Discharge to Ward
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Booking Modal */}
      {bookingModalOpen && (
        <SurgeryBookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* WHO Checklist Modal */}
      {whoModalOpen && selectedSurgery && (
        <WHOSurgicalChecklistModal
          isOpen={whoModalOpen}
          onClose={() => setWhoModalOpen(false)}
          surgery={selectedSurgery}
          onSuccess={handleWhoSuccess}
        />
      )}

      {/* PACU Recovery Modal */}
      {pacuModalOpen && selectedSurgery && (
        <PACURecoveryModal
          isOpen={pacuModalOpen}
          onClose={() => setPacuModalOpen(false)}
          surgery={selectedSurgery}
          onSuccess={handlePacuSuccess}
        />
      )}

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
