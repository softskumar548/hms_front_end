import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Input, Select, StatusPill, Toast } from "../../ui/components";
import WristbandPrintModal from "./WristbandPrintModal";
import SpecimenBarcodeModal from "./SpecimenBarcodeModal";

export default function PrintStationScreen() {
  const { token, tenant } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("profile") || "wristband"; // wristband, specimen, a4, thermal80

  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedDocType, setSelectedDocType] = useState("PRESCRIPTION");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Modals state
  const [wristbandModalOpen, setWristbandModalOpen] = useState(false);
  const [specimenModalOpen, setSpecimenModalOpen] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Fetch Patients
  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api.listPatients(token),
  });

  const activePatient = patients.find((p) => p.id === selectedPatientId) || patients[0] || null;

  const handleTabChange = (profileKey: string) => {
    setSearchParams({ profile: profileKey });
  };

  const handleGenericPrint = () => {
    window.print();
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
          <span style={{ fontSize: 18 }}>🖨️</span>
          <span>Universal Hospital Print Station & Barcode Label Engine</span>
        </div>
        <div style={{ fontSize: 12, background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20 }}>
          {tenant ? `${tenant.replace("_", " ")} Hospital` : "ZEN CLINIC"} · 4 Hardware Printer Profiles
        </div>
      </div>

      {/* Patient Selector Bar */}
      <Card style={{ borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 320 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "var(--indigo)", whiteSpace: "nowrap" }}>
              👤 Active Patient:
            </label>
            <Select
              value={selectedPatientId || activePatient?.id || ""}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              style={{ flex: 1 }}
              disabled={patients.length === 0}
            >
              {patients.length === 0 ? (
                <option value="">No patients registered</option>
              ) : (
                patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.given_name} {p.family_name} (Phone: {p.phone || "N/A"}) · {p.national_id || p.id.slice(0, 8)}
                  </option>
                ))
              )}
            </Select>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {activePatient ? (
              <span style={{ fontSize: 12, color: "var(--slate)", background: "var(--wash-a)", padding: "6px 12px", borderRadius: 8, border: "1px solid var(--line)" }}>
                UHID: <strong>{activePatient.national_id || `UHID-${activePatient.id?.slice(0, 6)}`}</strong>
              </span>
            ) : (
              <span style={{ fontSize: 12, color: "var(--slate)", background: "var(--wash-a)", padding: "6px 12px", borderRadius: 8, border: "1px solid var(--line)" }}>
                No active patient selected
              </span>
            )}
            <span style={{ fontSize: 12, color: "#16A34A", background: "#DCFCE7", padding: "6px 12px", borderRadius: 8, fontWeight: 700 }}>
              🟢 Spooler Active
            </span>
          </div>
        </div>
      </Card>

      {/* Hardware Printer Profile Tabs */}
      <div style={{ display: "flex", gap: 10, borderBottom: "2px solid var(--line)", paddingBottom: 6 }}>
        {[
          { key: "wristband", label: "🏷️ Thermal Patient Wristbands", sub: "Zebra / TSC 100×25mm" },
          { key: "specimen", label: "🧪 Specimen Tube Barcodes", sub: "Vacutainer 50×25mm" },
          { key: "a4", label: "📄 A4 Laser Documents", sub: "Standard 210×297mm" },
          { key: "thermal80", label: "🧾 80mm POS Thermal Receipts", sub: "Receipt Roll 80mm" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            style={{
              padding: "10px 16px",
              borderRadius: "10px 10px 0 0",
              border: "none",
              background: activeTab === tab.key ? "var(--indigo)" : "transparent",
              color: activeTab === tab.key ? "#ffffff" : "var(--slate)",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 2,
              transition: "all 0.15s ease",
            }}
          >
            <span>{tab.label}</span>
            <span style={{ fontSize: 10.5, opacity: activeTab === tab.key ? 0.9 : 0.7, fontWeight: 400 }}>
              {tab.sub}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: THERMAL PATIENT WRISTBANDS */}
      {activeTab === "wristband" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                🏷️ Inpatient Thermal Wristband Generator (Zebra / TSC 100mm × 25mm)
              </h3>
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                Print high-density waterproof barcode wristbands for inpatient admissions and ward transfers
              </span>
            </div>

            <Button
              type="button"
              onClick={() => setWristbandModalOpen(true)}
              style={{ background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)", color: "#fff" }}
            >
              🖨️ Open Thermal Wristband Printer
            </Button>
          </div>

          {/* Quick Preview Card */}
          <div style={{ background: "var(--wash-a)", padding: 20, borderRadius: 12, border: "1px solid var(--line)" }}>
            {activePatient ? (
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: 15, color: "var(--ink)", display: "block" }}>
                    {activePatient.given_name} {activePatient.family_name}
                  </strong>
                  <span style={{ fontSize: 12, color: "var(--slate)", display: "block", marginTop: 2 }}>
                    UHID: {activePatient.national_id || `UHID-${activePatient.id?.slice(0, 6)}`} · {activePatient.gender}, {activePatient.dob || "Adult"}
                  </span>

                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <span style={{ fontSize: 11, background: "#DCFCE7", color: "#166534", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                      Bed: Inpatient Ward
                    </span>
                    <span style={{ fontSize: 11, background: "#EFF6FF", color: "#1D4ED8", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                      General Medicine
                    </span>
                    <span style={{ fontSize: 11, background: "#FEF2F2", color: "#DC2626", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                      Blood Group: AP-Verified
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <Button
                    type="button"
                    onClick={() => setWristbandModalOpen(true)}
                    style={{ fontSize: 12, padding: "8px 18px" }}
                  >
                    🏷️ Print 1-Click Wristband
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "16px 0", color: "var(--slate)", fontStyle: "italic" }}>
                No patient selected. Register or select a patient to print thermal wristbands.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* TAB 2: SPECIMEN TUBE BARCODES */}
      {activeTab === "specimen" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                🧪 Phlebotomy Vacutainer Tube Barcode Stickers (50mm × 25mm)
              </h3>
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                Print color-coded tube stickers for EDTA (Purple), Serum (Red), Fluoride (Grey), and Urine containers
              </span>
            </div>

            <Button
              type="button"
              onClick={() => setSpecimenModalOpen(true)}
              style={{ background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)", color: "#fff" }}
            >
              🧪 Print Specimen Tube Batch
            </Button>
          </div>

          {/* Tube Presets Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <div style={{ background: "#FAF5FF", border: "1px solid #7C3AED", padding: 12, borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#7C3AED" }} />
                <strong style={{ fontSize: 13, color: "#7C3AED" }}>EDTA K2 (Purple Cap)</strong>
              </div>
              <span style={{ fontSize: 11.5, color: "var(--slate)" }}>CBC, ESR, HbA1c, Blood Grouping</span>
            </div>

            <div style={{ background: "#FEF2F2", border: "1px solid #DC2626", padding: 12, borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#DC2626" }} />
                <strong style={{ fontSize: 13, color: "#DC2626" }}>Serum Gel (Red Cap)</strong>
              </div>
              <span style={{ fontSize: 11.5, color: "var(--slate)" }}>LFT, RFT, Lipid, Thyroid T3/T4/TSH</span>
            </div>

            <div style={{ background: "#F1F5F9", border: "1px solid #64748B", padding: 12, borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#64748B" }} />
                <strong style={{ fontSize: 13, color: "#475569" }}>Sodium Fluoride (Grey)</strong>
              </div>
              <span style={{ fontSize: 11.5, color: "var(--slate)" }}>Fasting & Post-Prandial Glucose</span>
            </div>

            <div style={{ background: "#FEFCE8", border: "1px solid #EAB308", padding: 12, borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#EAB308" }} />
                <strong style={{ fontSize: 13, color: "#854D0E" }}>Plain Urine Container</strong>
              </div>
              <span style={{ fontSize: 11.5, color: "var(--slate)" }}>Urine Complete Routine & Micro</span>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: A4 LASER DOCUMENTS */}
      {activeTab === "a4" && (
        <Card style={{ borderRadius: 16 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
            📄 A4 Clinical Documents Hub (Standard Laser 210mm × 297mm)
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {/* 1. MediPass Prescription */}
            <div style={{ background: "var(--wash-a)", border: "1px solid var(--line)", padding: 16, borderRadius: 12, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <strong style={{ fontSize: 14, color: "var(--indigo)", display: "block" }}>
                  💊 MediPass Outpatient E-Prescription
                </strong>
                <span style={{ fontSize: 12, color: "var(--slate)", display: "block", marginTop: 4 }}>
                  A4 visit prescription with APMC doctor credentials and Telugu bilingual instructions.
                </span>
              </div>
              {activePatient ? (
                <Link to={`/emr/patients/${activePatient.id}/print`} style={{ textDecoration: "none", marginTop: 14 }}>
                  <Button type="button" style={{ width: "100%", fontSize: 12 }}>
                    🖨️ Launch MediPass Rx Print
                  </Button>
                </Link>
              ) : (
                <Button type="button" disabled style={{ width: "100%", fontSize: 12, marginTop: 14 }}>
                  Select patient to print
                </Button>
              )}
            </div>

            {/* 2. Employee Pay Slip */}
            <div style={{ background: "var(--wash-a)", border: "1px solid var(--line)", padding: 16, borderRadius: 12, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <strong style={{ fontSize: 14, color: "var(--indigo)", display: "block" }}>
                  👥 Employee Monthly Pay Slip
                </strong>
                <span style={{ fontSize: 12, color: "var(--slate)", display: "block", marginTop: 4 }}>
                  Official hospital salary voucher with Indian statutory EPF/ESIC/PT breakdowns.
                </span>
              </div>
              <Link to="/hr?tab=payslips" style={{ textDecoration: "none", marginTop: 14 }}>
                <Button type="button" ghost style={{ width: "100%", fontSize: 12 }}>
                  🖨️ Go to Pay Slips Archive
                </Button>
              </Link>
            </div>

            {/* 3. Inpatient Admission / Bed Stub */}
            <div style={{ background: "var(--wash-a)", border: "1px solid var(--line)", padding: 16, borderRadius: 12, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <strong style={{ fontSize: 14, color: "var(--indigo)", display: "block" }}>
                  🛏️ Inpatient Admission Summary
                </strong>
                <span style={{ fontSize: 12, color: "var(--slate)", display: "block", marginTop: 4 }}>
                  Bed allocation sheet with attending physician, floor, wing, and advance deposit.
                </span>
              </div>
              <Link to="/inpatient" style={{ textDecoration: "none", marginTop: 14 }}>
                <Button type="button" ghost style={{ width: "100%", fontSize: 12 }}>
                  🖨️ Open Inpatient Wards
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: 80mm POS THERMAL RECEIPTS */}
      {activeTab === "thermal80" && (
        <Card style={{ borderRadius: 16 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
            🧾 80mm POS Thermal Receipt Profiles
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            <div style={{ background: "var(--wash-a)", border: "1px solid var(--line)", padding: 16, borderRadius: 12 }}>
              <strong style={{ fontSize: 14, color: "var(--indigo)", display: "block" }}>
                💳 Cashier Till Payment Receipt
              </strong>
              <span style={{ fontSize: 12, color: "var(--slate)", display: "block", margin: "4px 0 14px" }}>
                Itemized GST receipt with YSR Aarogyasri / TPA split payment breakdown and barcode.
              </span>
              <Link to="/billing" style={{ textDecoration: "none" }}>
                <Button type="button" style={{ width: "100%", fontSize: 12 }}>
                  Go to Billing & Cashier Till
                </Button>
              </Link>
            </div>

            <div style={{ background: "var(--wash-a)", border: "1px solid var(--line)", padding: 16, borderRadius: 12 }}>
              <strong style={{ fontSize: 14, color: "var(--indigo)", display: "block" }}>
                📋 OPD Kiosk Token Slip
              </strong>
              <span style={{ fontSize: 12, color: "var(--slate)", display: "block", margin: "4px 0 14px" }}>
                Thermal check-in token slips for Waiting Lounge TV calling queues.
              </span>
              <Link to="/queue" style={{ textDecoration: "none" }}>
                <Button type="button" ghost style={{ width: "100%", fontSize: 12 }}>
                  Go to OPD Queue Board
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Wristband Modal */}
      {wristbandModalOpen && (
        <WristbandPrintModal
          isOpen={wristbandModalOpen}
          onClose={() => setWristbandModalOpen(false)}
          patient={activePatient}
          inpatientDetails={{
            bedNumber: "GMW-101 (Floor 2)",
            floor: 2,
            ipNumber: "IPD-2026-9013",
            doctorName: "Dr. V Ramana",
            department: "Orthopedics",
            bloodGroup: "O +ve",
          }}
        />
      )}

      {/* Specimen Barcode Modal */}
      {specimenModalOpen && (
        <SpecimenBarcodeModal
          isOpen={specimenModalOpen}
          onClose={() => setSpecimenModalOpen(false)}
          patient={activePatient}
        />
      )}

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
