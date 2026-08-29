import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Input, Select, StatusPill, Toast } from "../../ui/components";
import DonorRegistrationModal from "./DonorRegistrationModal";
import BloodCrossMatchModal from "./BloodCrossMatchModal";

export interface BloodGroupStock {
  group: string;
  prbc: number;
  ffp: number;
  platelets: number;
  cryo: number;
  status: "OPTIMAL" | "LOW" | "CRITICAL";
}

export interface TransfusionRequisition {
  id: string;
  reqNumber: string;
  patientName: string;
  patientUhid: string;
  bloodGroup: string;
  department: string;
  requiredComponent: string;
  unitsRequested: number;
  urgency: "ROUTINE_OT" | "URGENT_ICU" | "EMERGENCY_STAT";
  status: "PENDING_CROSSMATCH" | "COMPATIBLE_RESERVED" | "TRANSFUSED";
  assignedUnitBag?: string;
  reservedUntil?: string;
}

export interface DonorRecord {
  id: string;
  donorCode: string;
  unitBagNumber: string;
  donorName: string;
  ageGender: string;
  aadhaar: string;
  phone: string;
  bloodGroup: string;
  donationType: string;
  donatedAt: string;
  status: string;
}

const initialStock: BloodGroupStock[] = [
  { group: "O Positive (O+)", prbc: 12, ffp: 8, platelets: 6, cryo: 4, status: "OPTIMAL" },
  { group: "O Negative (O- STAT)", prbc: 6, ffp: 3, platelets: 2, cryo: 1, status: "OPTIMAL" },
  { group: "A Positive (A+)", prbc: 8, ffp: 4, platelets: 3, cryo: 2, status: "OPTIMAL" },
  { group: "A Negative (A-)", prbc: 2, ffp: 1, platelets: 1, cryo: 0, status: "LOW" },
  { group: "B Positive (B+)", prbc: 10, ffp: 6, platelets: 4, cryo: 2, status: "OPTIMAL" },
  { group: "B Negative (B-)", prbc: 2, ffp: 1, platelets: 0, cryo: 0, status: "CRITICAL" },
  { group: "AB Positive (AB+)", prbc: 4, ffp: 2, platelets: 2, cryo: 1, status: "OPTIMAL" },
  { group: "AB Negative (AB-)", prbc: 1, ffp: 1, platelets: 0, cryo: 0, status: "CRITICAL" },
];

export default function BloodBankScreen() {
  const { tenant } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "inventory"; // inventory, crossmatch, donors, emergency

  const [stocks, setStocks] = useState<BloodGroupStock[]>(() => {
    const saved = localStorage.getItem(`hms-blood-stocks-${tenant || "default"}`);
    return saved ? JSON.parse(saved) : initialStock;
  });
  const [requisitions, setRequisitions] = useState<TransfusionRequisition[]>(() => {
    const saved = localStorage.getItem(`hms-blood-requisitions-${tenant || "default"}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [donors, setDonors] = useState<DonorRecord[]>(() => {
    const saved = localStorage.getItem(`hms-blood-donors-${tenant || "default"}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState("");

  const saveStocks = (nextStocks: BloodGroupStock[]) => {
    setStocks(nextStocks);
    localStorage.setItem(`hms-blood-stocks-${tenant || "default"}`, JSON.stringify(nextStocks));
  };

  const saveRequisitions = (nextReqs: TransfusionRequisition[]) => {
    setRequisitions(nextReqs);
    localStorage.setItem(`hms-blood-requisitions-${tenant || "default"}`, JSON.stringify(nextReqs));
  };

  const saveDonors = (nextDonors: DonorRecord[]) => {
    setDonors(nextDonors);
    localStorage.setItem(`hms-blood-donors-${tenant || "default"}`, JSON.stringify(nextDonors));
  };

  // Modals state
  const [donorModalOpen, setDonorModalOpen] = useState(false);
  const [crossMatchModalOpen, setCrossMatchModalOpen] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState<TransfusionRequisition | null>(null);

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
  const totalUnits = stocks.reduce((acc, s) => acc + s.prbc + s.ffp + s.platelets + s.cryo, 0);
  const prbcUnits = stocks.reduce((acc, s) => acc + s.prbc, 0);
  const ffpUnits = stocks.reduce((acc, s) => acc + s.ffp, 0);
  const plateletUnits = stocks.reduce((acc, s) => acc + s.platelets, 0);
  const oNegReserve = stocks.find((s) => s.group.includes("O Negative"))?.prbc || 0;
  const pendingXmCount = requisitions.filter((r) => r.status === "PENDING_CROSSMATCH").length;

  const filteredStocks = stocks.filter((s) => {
    if (!searchQuery) return true;
    return s.group.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Action: Add new donor
  const handleDonorSuccess = (donorRecord: DonorRecord) => {
    const nextDonors = [donorRecord, ...donors];
    saveDonors(nextDonors);
    // Auto increment stock
    const nextStocks = stocks.map((s) => {
      if (s.group.includes(donorRecord.bloodGroup)) {
        return { ...s, prbc: s.prbc + 1, ffp: s.ffp + 1, platelets: s.platelets + 1 };
      }
      return s;
    });
    saveStocks(nextStocks);
    setDonorModalOpen(false);
    triggerToast(`Donation registered for ${donorRecord.donorName}. 3 Components stocked in blood bank.`);
  };

  // Action: Cross-match completed
  const handleCrossMatchSuccess = (updatedReq: TransfusionRequisition) => {
    const nextReqs = requisitions.map((r) => (r.id === updatedReq.id ? updatedReq : r));
    saveRequisitions(nextReqs);
    setCrossMatchModalOpen(false);
    triggerToast(`Compatibility confirmed. Unit ${updatedReq.assignedUnitBag} reserved for ${updatedReq.patientName}.`);
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
          <span style={{ fontSize: 18 }}>🩸</span>
          <span>Blood Bank & Transfusion Medicine Workstation</span>
        </div>
        <div style={{ fontSize: 12, background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20 }}>
          {tenant ? `${tenant.replace("_", " ")} Blood Bank` : "ZEN CLINIC BLOOD BANK"} · CDSCO License: AP-BB-2026-981 · NACO Monitored
        </div>
      </div>

      {/* 5 Top Blood Bank KPI Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <Card style={{ borderLeft: "4px solid #DC2626", padding: "14px 18px", background: "#FEF2F2" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#DC2626", textTransform: "uppercase" }}>Total Units Stock</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#DC2626" }}>{totalUnits}</strong>
            <span style={{ fontSize: 12, color: "#991B1B", fontWeight: 700 }}>All Components</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid var(--indigo)", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>PRBC Packed Cells</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>{prbcUnits}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>2°C to 6°C</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #F59E0B", padding: "14px 18px", background: "#FEFCE8" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#D97706", textTransform: "uppercase" }}>Platelet Units (RDP/SDP)</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#D97706" }}>{plateletUnits}</strong>
            <span style={{ fontSize: 12, color: "#B45309", fontWeight: 700 }}>5-Day Agitator</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #3B82F6", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Fresh Frozen Plasma</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#3B82F6" }}>{ffpUnits}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>-30°C Deep Freeze</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #16A34A", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Emergency O-Neg</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#16A34A" }}>{oNegReserve}</strong>
            <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>STAT Reserve</span>
          </div>
        </Card>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid var(--line)", paddingBottom: 6 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { key: "inventory", label: "🩸 Component Inventory", count: `${totalUnits} Units` },
            { key: "crossmatch", label: "🧪 Cross-Match Desk", count: pendingXmCount },
            { key: "donors", label: "💉 Donor Intake & Serology", count: donors.length },
            { key: "emergency", label: "🚨 Emergency STAT Release", count: `${oNegReserve} Units` },
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
            onClick={() => setDonorModalOpen(true)}
            style={{ background: "#DC2626", color: "#fff", fontWeight: 800, fontSize: 13, padding: "9px 18px" }}
          >
            💉 Register Voluntary Blood Donor
          </Button>
        </div>
      </div>

      {/* TAB 1: COMPONENT INVENTORY GRID */}
      {activeTab === "inventory" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                🩸 Blood Group & Component Stock Inventory
              </h3>
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                Stock monitoring across PRBC (2-6°C), FFP (-30°C), Platelets (Agitator), and Cryoprecipitate
              </span>
            </div>

            <Input
              placeholder="Search blood groups (A+, O-, B+...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 260 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {filteredStocks.map((s, idx) => (
              <div
                key={idx}
                style={{
                  background: s.status === "CRITICAL" ? "#FEF2F2" : s.status === "LOW" ? "#FFFBEB" : "var(--wash-a)",
                  border: s.status === "CRITICAL" ? "2px solid #DC2626" : s.status === "LOW" ? "2px solid #F59E0B" : "1px solid var(--line)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <strong style={{ fontSize: 16, color: s.status === "CRITICAL" ? "#DC2626" : "var(--indigo)" }}>
                      {s.group}
                    </strong>
                    <span style={{ fontSize: 11, fontWeight: 900, background: s.status === "CRITICAL" ? "#DC2626" : s.status === "LOW" ? "#D97706" : "#16A34A", color: "#fff", padding: "2px 6px", borderRadius: 4 }}>
                      {s.status}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, background: "#fff", padding: 10, borderRadius: 8, border: "1px solid var(--line)", marginBottom: 10 }}>
                    <div>
                      <span style={{ color: "var(--slate)", display: "block", fontSize: 10.5 }}>PRBC (Cells)</span>
                      <strong style={{ fontSize: 14, color: s.prbc <= 2 ? "#DC2626" : "var(--ink)" }}>{s.prbc} Units</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--slate)", display: "block", fontSize: 10.5 }}>FFP (Plasma)</span>
                      <strong style={{ fontSize: 14 }}>{s.ffp} Units</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--slate)", display: "block", fontSize: 10.5 }}>Platelets</span>
                      <strong style={{ fontSize: 14, color: s.platelets === 0 ? "#DC2626" : "var(--ink)" }}>{s.platelets} Units</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--slate)", display: "block", fontSize: 10.5 }}>Cryoprecipitate</span>
                      <strong style={{ fontSize: 14 }}>{s.cryo} Units</strong>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  ghost
                  onClick={() => triggerToast(`Blood component issuance slip generated for ${s.group}.`)}
                  style={{ width: "100%", fontSize: 11.5 }}
                >
                  🩸 Issue Blood Component Unit
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 2: CROSS-MATCHING DESK */}
      {activeTab === "crossmatch" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                🧪 Transfusion Cross-Matching & Compatibility Desk
              </h3>
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                Process pre-surgical and ICU blood requisitions with AHG Coombs serological cross-match verification
              </span>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Req #</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Patient Name & UHID</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Patient Group</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Department / OT</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Required Component</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Status</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "36px 14px", color: "var(--slate)", fontStyle: "italic" }}>
                      No pending transfusion cross-match requisitions. Clinical requests from OT and ICU will appear here.
                    </td>
                  </tr>
                ) : (
                  requisitions.map((req) => (
                    <tr key={req.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "var(--indigo)", fontWeight: 700 }}>
                        {req.reqNumber}
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <strong style={{ display: "block" }}>{req.patientName}</strong>
                        <span style={{ fontSize: 11.5, color: "var(--slate)" }}>{req.patientUhid}</span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <strong style={{ color: "#DC2626" }}>{req.bloodGroup}</strong>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div>{req.department}</div>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <strong>{req.requiredComponent}</strong> ({req.unitsRequested} Units)
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <StatusPill kind={req.status === "COMPATIBLE_RESERVED" ? "success" : "warn"}>
                          {req.status.replace(/_/g, " ")}
                        </StatusPill>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        {req.status === "PENDING_CROSSMATCH" ? (
                          <Button
                            type="button"
                            onClick={() => {
                              setSelectedRequisition(req);
                              setCrossMatchModalOpen(true);
                            }}
                            style={{ background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)", color: "#fff", fontSize: 11.5, padding: "6px 12px" }}
                          >
                            🧪 Perform Cross-Match
                          </Button>
                        ) : (
                          <span style={{ fontSize: 11, color: "#166534", fontWeight: 700 }}>
                            ✓ Reserved: {req.assignedUnitBag}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: DONOR RECORDS & SEROLOGY */}
      {activeTab === "donors" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                💉 Voluntary Blood Donors & Mandatory 5-Serology Registry
              </h3>
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                NACO & Drug Controller certified transfusion clearance testing (HIV, HBsAg, HCV, VDRL, Malaria)
              </span>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Donor Code</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Bag Unit #</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Donor Name</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Aadhaar ID</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Blood Group</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Serology Status</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Donation Date</th>
                </tr>
              </thead>
              <tbody>
                {donors.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "36px 14px", color: "var(--slate)", fontStyle: "italic" }}>
                      No voluntary donors registered yet. Register intake using "+ New Blood Donor Intake".
                    </td>
                  </tr>
                ) : (
                  donors.map((d) => (
                    <tr key={d.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "var(--indigo)", fontWeight: 700 }}>
                        {d.donorCode}
                      </td>

                      <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#DC2626", fontWeight: 700 }}>
                        {d.unitBagNumber}
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <strong style={{ display: "block" }}>{d.donorName}</strong>
                        <span style={{ fontSize: 11.5, color: "var(--slate)" }}>{d.ageGender} · {d.phone}</span>
                      </td>

                      <td style={{ padding: "12px 14px", fontFamily: "monospace" }}>
                        {d.aadhaar}
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <strong style={{ color: "#DC2626" }}>{d.bloodGroup}</strong>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: 11, background: "#DCFCE7", color: "#166534", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                          ✓ 5/5 Serology Clean
                        </span>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--slate)" }}>
                        {d.donatedAt}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 4: EMERGENCY STAT RELEASE */}
      {activeTab === "emergency" && (
        <Card style={{ borderRadius: 16 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "#DC2626", margin: "0 0 14px" }}>
            🚨 Emergency Uncrossmatched Blood Release Protocol
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
            <div style={{ background: "#FEF2F2", border: "2px solid #DC2626", padding: 18, borderRadius: 12 }}>
              <strong style={{ fontSize: 16, color: "#DC2626", display: "block", marginBottom: 6 }}>
                🩸 Emergency 2 Units O-Negative PRBC Immediate Release
              </strong>
              <span style={{ fontSize: 12.5, color: "#991B1B", display: "block", marginBottom: 14 }}>
                For acute massive trauma hemorrhage, exsanguinating shock, or ruptured aortic aneurysm where waiting 45 minutes for a full cross-match would be fatal.
              </span>

              <div style={{ display: "grid", gap: 8, fontSize: 12, color: "#991B1B", background: "#fff", padding: 12, borderRadius: 8, border: "1px solid #F87171", marginBottom: 14 }}>
                <div>✓ <strong>Unit 1:</strong> BB-2026-90814 (O Negative PRBC · 350mL)</div>
                <div>✓ <strong>Unit 2:</strong> BB-2026-90815 (O Negative PRBC · 350mL)</div>
                <div>✓ <strong>Signatory Authority:</strong> Casualty Medical Officer (CMO) Statutory Override</div>
              </div>

              <Button
                type="button"
                onClick={() => triggerToast("Emergency Uncrossmatched O-Negative blood units released to Trauma Resuscitation Bay.")}
                style={{ width: "100%", background: "#DC2626", color: "#fff", fontWeight: 800, fontSize: 13 }}
              >
                🚨 Execute Emergency O-Negative Release (STAT)
              </Button>
            </div>

            <div style={{ background: "var(--wash-a)", border: "1px solid var(--line)", padding: 18, borderRadius: 12 }}>
              <strong style={{ fontSize: 15, color: "var(--indigo)", display: "block", marginBottom: 6 }}>
                📋 National Hemovigilance Programme
              </strong>
              <span style={{ fontSize: 12, color: "var(--slate)", display: "block", marginBottom: 12 }}>
                Report adverse transfusion reactions (FNHTR, Hemolytic, Allergic Urticaria, TRALI/TACO) directly to the transfusion committee.
              </span>

              <Button
                type="button"
                ghost
                onClick={() => triggerToast("Hemovigilance adverse event incident report opened.")}
                style={{ width: "100%", fontSize: 12 }}
              >
                + Log Transfusion Reaction Incident
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Donor Modal */}
      {donorModalOpen && (
        <DonorRegistrationModal
          isOpen={donorModalOpen}
          onClose={() => setDonorModalOpen(false)}
          onSuccess={handleDonorSuccess}
        />
      )}

      {/* Cross Match Modal */}
      {crossMatchModalOpen && selectedRequisition && (
        <BloodCrossMatchModal
          isOpen={crossMatchModalOpen}
          onClose={() => setCrossMatchModalOpen(false)}
          requisition={selectedRequisition}
          onSuccess={handleCrossMatchSuccess}
        />
      )}

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
