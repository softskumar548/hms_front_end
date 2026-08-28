import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Input, Select, StatusPill, Toast, Skeleton } from "../../ui/components";
import InpatientAdmissionModal from "./InpatientAdmissionModal";
import WardTransferModal from "./WardTransferModal";
import InpatientDischargeModal from "./InpatientDischargeModal";

export interface InpatientBed {
  id: string;
  bedNumber: string;
  floor: number;
  wing: string;
  category: string;
  tariffPerDay: number;
  status: "AVAILABLE" | "OCCUPIED" | "CLEANING" | "MAINTENANCE";
  isIcu?: boolean;
  hasVentilator?: boolean;
  patientId?: string;
  patientName?: string;
  ipNumber?: string;
  doctorName?: string;
  department?: string;
  admissionDate?: string;
  primaryDiagnosis?: string;
}

const initialBedsList: InpatientBed[] = [
  // Floor 1: Ground Floor - Emergency & Day Care
  { id: "b-dc-01", bedNumber: "DC-01", floor: 1, wing: "Wing A (Day Care)", category: "Day Care Surgery", tariffPerDay: 1200, status: "AVAILABLE" },
  { id: "b-dc-02", bedNumber: "DC-02", floor: 1, wing: "Wing A (Day Care)", category: "Day Care Surgery", tariffPerDay: 1200, status: "OCCUPIED", patientName: "Venkata Rao", ipNumber: "IPD-2026-9011", doctorName: "Dr. K. Venkateswarlu", department: "General Surgery", admissionDate: "2026-08-28T09:00:00Z", primaryDiagnosis: "Laparoscopic Hernia Repair" },
  { id: "b-dc-03", bedNumber: "DC-03", floor: 1, wing: "Wing A (Day Care)", category: "Day Care Surgery", tariffPerDay: 1200, status: "CLEANING" },
  { id: "b-em-01", bedNumber: "EM-01", floor: 1, wing: "Wing B (Emergency)", category: "Emergency Observation", tariffPerDay: 1500, status: "OCCUPIED", patientName: "Kishore Kumar", ipNumber: "IPD-2026-9012", doctorName: "Dr. K R Murali", department: "Emergency Medicine", admissionDate: "2026-08-28T18:30:00Z", primaryDiagnosis: "Acute Bronchospasm & Asthma" },
  { id: "b-em-02", bedNumber: "EM-02", floor: 1, wing: "Wing B (Emergency)", category: "Emergency Observation", tariffPerDay: 1500, status: "AVAILABLE" },

  // Floor 2: Medical & Surgical Wards
  { id: "b-gmw-101", bedNumber: "GMW-101", floor: 2, wing: "Wing A (Male Ward)", category: "General Male Ward", tariffPerDay: 1000, status: "OCCUPIED", patientName: "Ramesh Babu", ipNumber: "IPD-2026-9013", doctorName: "Dr. V Ramana", department: "Orthopedics", admissionDate: "2026-08-26T10:00:00Z", primaryDiagnosis: "Closed Fracture Right Femur" },
  { id: "b-gmw-102", bedNumber: "GMW-102", floor: 2, wing: "Wing A (Male Ward)", category: "General Male Ward", tariffPerDay: 1000, status: "AVAILABLE" },
  { id: "b-gmw-103", bedNumber: "GMW-103", floor: 2, wing: "Wing A (Male Ward)", category: "General Male Ward", tariffPerDay: 1000, status: "OCCUPIED", patientName: "Satyanarayana P", ipNumber: "IPD-2026-9014", doctorName: "Dr. K R Murali", department: "General Medicine", admissionDate: "2026-08-27T11:00:00Z", primaryDiagnosis: "Type 2 Diabetes with Cellulitis" },
  { id: "b-gmw-104", bedNumber: "GMW-104", floor: 2, wing: "Wing A (Male Ward)", category: "General Male Ward", tariffPerDay: 1000, status: "AVAILABLE" },

  { id: "b-gfw-105", bedNumber: "GFW-105", floor: 2, wing: "Wing B (Female Ward)", category: "General Female Ward", tariffPerDay: 1000, status: "OCCUPIED", patientName: "Sita Devi", ipNumber: "IPD-2026-9015", doctorName: "Dr. Sreenivasulu", department: "Cardiology", admissionDate: "2026-08-25T14:00:00Z", primaryDiagnosis: "Hypertensive Heart Disease" },
  { id: "b-gfw-106", bedNumber: "GFW-106", floor: 2, wing: "Wing B (Female Ward)", category: "General Female Ward", tariffPerDay: 1000, status: "AVAILABLE" },
  { id: "b-gfw-107", bedNumber: "GFW-107", floor: 2, wing: "Wing B (Female Ward)", category: "General Female Ward", tariffPerDay: 1000, status: "OCCUPIED", patientName: "Lakshmi Prasanna", ipNumber: "IPD-2026-9016", doctorName: "Dr. Shanti Kumari", department: "Obstetrics & Gynaecology", admissionDate: "2026-08-27T08:00:00Z", primaryDiagnosis: "Antenatal Observation" },
  { id: "b-gfw-108", bedNumber: "GFW-108", floor: 2, wing: "Wing B (Female Ward)", category: "General Female Ward", tariffPerDay: 1000, status: "CLEANING" },

  { id: "b-sp-201a", bedNumber: "SP-201A", floor: 2, wing: "Wing C (Semi-Private)", category: "Semi-Private Twin", tariffPerDay: 2200, status: "OCCUPIED", patientName: "Narayana Swamy", ipNumber: "IPD-2026-9017", doctorName: "Dr. K R Murali", department: "General Medicine", admissionDate: "2026-08-26T16:00:00Z", primaryDiagnosis: "Acute Pyelonephritis" },
  { id: "b-sp-201b", bedNumber: "SP-201B", floor: 2, wing: "Wing C (Semi-Private)", category: "Semi-Private Twin", tariffPerDay: 2200, status: "AVAILABLE" },
  { id: "b-sp-202a", bedNumber: "SP-202A", floor: 2, wing: "Wing C (Semi-Private)", category: "Semi-Private Twin", tariffPerDay: 2200, status: "AVAILABLE" },
  { id: "b-sp-202b", bedNumber: "SP-202B", floor: 2, wing: "Wing C (Semi-Private)", category: "Semi-Private Twin", tariffPerDay: 2200, status: "MAINTENANCE" },

  // Floor 3: Executive & Deluxe Suites
  { id: "b-dx-301", bedNumber: "DX-301", floor: 3, wing: "Wing A (Deluxe Suite)", category: "Deluxe Single Suite", tariffPerDay: 4500, status: "OCCUPIED", patientName: "Chandra Sekhar", ipNumber: "IPD-2026-9018", doctorName: "Dr. Sreenivasulu", department: "Cardiology", admissionDate: "2026-08-24T12:00:00Z", primaryDiagnosis: "Post-Angiography Observation" },
  { id: "b-dx-302", bedNumber: "DX-302", floor: 3, wing: "Wing A (Deluxe Suite)", category: "Deluxe Single Suite", tariffPerDay: 4500, status: "AVAILABLE" },
  { id: "b-dx-303", bedNumber: "DX-303", floor: 3, wing: "Wing A (Deluxe Suite)", category: "Deluxe Single Suite", tariffPerDay: 4500, status: "AVAILABLE" },
  { id: "b-sdx-304", bedNumber: "SDX-304", floor: 3, wing: "Wing B (Super Deluxe)", category: "Super Deluxe Suite", tariffPerDay: 7500, status: "OCCUPIED", patientName: "Vijaya Bhaskar", ipNumber: "IPD-2026-9019", doctorName: "Dr. K. Venkateswarlu", department: "General Surgery", admissionDate: "2026-08-25T09:30:00Z", primaryDiagnosis: "Laparoscopic Cholecystectomy Post-Op" },

  // Floor 4: Critical Care ICU & CCU
  { id: "b-icu-01", bedNumber: "ICU-01", floor: 4, wing: "Critical Care ICU", category: "ICU Ventilator Bed", tariffPerDay: 8500, status: "OCCUPIED", isIcu: true, hasVentilator: true, patientName: "Appa Rao G", ipNumber: "IPD-2026-9020", doctorName: "Dr. K R Murali", department: "Critical Care / Pulmonology", admissionDate: "2026-08-25T02:00:00Z", primaryDiagnosis: "Severe ARDS on Mechanical Ventilation" },
  { id: "b-icu-02", bedNumber: "ICU-02", floor: 4, wing: "Critical Care ICU", category: "ICU Ventilator Bed", tariffPerDay: 8500, status: "AVAILABLE", isIcu: true, hasVentilator: true },
  { id: "b-icu-03", bedNumber: "ICU-03", floor: 4, wing: "Critical Care ICU", category: "ICU Ventilator Bed", tariffPerDay: 8500, status: "OCCUPIED", isIcu: true, hasVentilator: true, patientName: "Baby Aaradhya", ipNumber: "IPD-2026-9021", doctorName: "Dr. Ananya Reddy", department: "Pediatrics", admissionDate: "2026-08-27T20:00:00Z", primaryDiagnosis: "Severe Bronchiolitis with Hypoxia" },
  { id: "b-ccu-01", bedNumber: "CCU-01", floor: 4, wing: "Coronary Care Unit", category: "CCU Cardiac Bed", tariffPerDay: 9000, status: "OCCUPIED", isIcu: true, patientName: "Krishna Murthy", ipNumber: "IPD-2026-9022", doctorName: "Dr. Sreenivasulu", department: "Cardiology", admissionDate: "2026-08-26T04:30:00Z", primaryDiagnosis: "Acute STEMI Anterior Wall Infarct" },
  { id: "b-ccu-02", bedNumber: "CCU-02", floor: 4, wing: "Coronary Care Unit", category: "CCU Cardiac Bed", tariffPerDay: 9000, status: "AVAILABLE", isIcu: true },
];

export default function InpatientBedMatrixScreen() {
  const { token, tenant } = useAuth();

  const [beds, setBeds] = useState<InpatientBed[]>(initialBedsList);
  const [selectedFloor, setSelectedFloor] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);
  const [selectedBedForAdmission, setSelectedBedForAdmission] = useState<InpatientBed | null>(null);

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedBedForTransfer, setSelectedBedForTransfer] = useState<InpatientBed | null>(null);

  const [dischargeModalOpen, setDischargeModalOpen] = useState(false);
  const [selectedBedForDischarge, setSelectedBedForDischarge] = useState<InpatientBed | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Fetch Patients List for admission dropdown
  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api.listPatients(token),
  });

  // Calculate Metrics
  const totalBedsCount = beds.length;
  const occupiedCount = beds.filter((b) => b.status === "OCCUPIED").length;
  const availableCount = beds.filter((b) => b.status === "AVAILABLE").length;
  const cleaningCount = beds.filter((b) => b.status === "CLEANING").length;
  const icuBeds = beds.filter((b) => b.isIcu);
  const icuOccupied = icuBeds.filter((b) => b.status === "OCCUPIED").length;
  const occupancyPercent = ((occupiedCount / totalBedsCount) * 100).toFixed(1);

  // Filtered beds
  const filteredBeds = beds.filter((b) => {
    if (selectedFloor !== "all" && b.floor !== selectedFloor) return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = b.bedNumber.toLowerCase().includes(q);
      const matchCat = b.category.toLowerCase().includes(q);
      const matchPatient = (b.patientName || "").toLowerCase().includes(q);
      const matchIp = (b.ipNumber || "").toLowerCase().includes(q);
      const matchDoc = (b.doctorName || "").toLowerCase().includes(q);
      return matchNum || matchCat || matchPatient || matchIp || matchDoc;
    }
    return true;
  });

  const availableBedsList = beds.filter((b) => b.status === "AVAILABLE");

  // Handle Admission Confirmation
  const handleAdmissionSuccess = (admData: any) => {
    setBeds((prev) =>
      prev.map((b) =>
        b.id === admData.bedId
          ? {
              ...b,
              status: "OCCUPIED",
              patientId: admData.patientId,
              patientName: admData.patientName,
              ipNumber: admData.ipNumber,
              doctorName: admData.doctorName,
              department: admData.department,
              admissionDate: admData.admissionDate,
              primaryDiagnosis: admData.primaryDiagnosis,
            }
          : b
      )
    );
    setAdmissionModalOpen(false);
    triggerToast(`Patient ${admData.patientName} admitted to Bed ${selectedBedForAdmission?.bedNumber}.`);
  };

  // Handle Ward Transfer Confirmation
  const handleTransferSuccess = (transferData: any) => {
    setBeds((prev) =>
      prev.map((b) => {
        if (b.id === transferData.sourceBedId) {
          return {
            ...b,
            status: "CLEANING",
            patientId: undefined,
            patientName: undefined,
            ipNumber: undefined,
            doctorName: undefined,
            department: undefined,
            admissionDate: undefined,
            primaryDiagnosis: undefined,
          };
        }
        if (b.id === transferData.targetBedId) {
          return {
            ...b,
            status: "OCCUPIED",
            patientName: transferData.patientName,
            ipNumber: transferData.ipNumber,
            admissionDate: transferData.admissionDate,
            doctorName: transferData.doctorName,
            department: transferData.department,
            primaryDiagnosis: transferData.primaryDiagnosis,
          };
        }
        return b;
      })
    );
    setTransferModalOpen(false);
    triggerToast(`Patient ${transferData.patientName} shifted to new bed.`);
  };

  // Handle Discharge Confirmation
  const handleDischargeSuccess = (dischargeData: any) => {
    setBeds((prev) =>
      prev.map((b) =>
        b.id === dischargeData.bedId
          ? {
              ...b,
              status: "CLEANING",
              patientId: undefined,
              patientName: undefined,
              ipNumber: undefined,
              doctorName: undefined,
              department: undefined,
              admissionDate: undefined,
              primaryDiagnosis: undefined,
            }
          : b
      )
    );
    setDischargeModalOpen(false);
    triggerToast(`Discharge complete for ${dischargeData.patientName}. Bed moved to cleaning.`);
  };

  // Mark Cleaning Bed Ready
  const handleMarkCleaned = (bedId: string) => {
    setBeds((prev) =>
      prev.map((b) => (b.id === bedId ? { ...b, status: "AVAILABLE" } : b))
    );
    triggerToast("Bed sanitized and marked ready for admission.");
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Top Header Banner */}
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
          <span style={{ fontSize: 18 }}>🛏️</span>
          <span>Inpatient Ward Bed Matrix & Ward Transfer Engine (IPD-001)</span>
        </div>
        <div style={{ fontSize: 12, background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20 }}>
          {tenant ? `${tenant.replace("_", " ")} Hospital` : "ZEN CLINIC"} · 4 Inpatient Floors
        </div>
      </div>

      {/* 5 Top KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <Card style={{ borderLeft: "4px solid var(--indigo)", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Total Capacity</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>{totalBedsCount}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>4 Floors</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #DC2626", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Occupied Beds</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#DC2626" }}>{occupiedCount}</strong>
            <span style={{ fontSize: 12, color: "#DC2626", fontWeight: 700 }}>{occupancyPercent}%</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #16A34A", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Available Vacant</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#16A34A" }}>{availableCount}</strong>
            <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>Ready</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #F59E0B", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>ICU / CCU Occupancy</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#D97706" }}>{icuOccupied}/{icuBeds.length}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Ventilators</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #8B5CF6", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Housekeeping</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#8B5CF6" }}>{cleaningCount}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Cleaning</span>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card style={{ borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          {/* Floor Tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { id: "all", label: "🏢 All Floors (48)" },
              { id: 1, label: "Floor 1 (Daycare & Emergency)" },
              { id: 2, label: "Floor 2 (General & Semi-Private)" },
              { id: 3, label: "Floor 3 (Deluxe Suites)" },
              { id: 4, label: "Floor 4 (Critical ICU/CCU)" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFloor(f.id as any)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: selectedFloor === f.id ? "2px solid var(--indigo)" : "1px solid var(--line)",
                  background: selectedFloor === f.id ? "var(--indigo-soft)" : "#fff",
                  color: selectedFloor === f.id ? "var(--indigo)" : "var(--ink)",
                  fontWeight: selectedFloor === f.id ? 800 : 600,
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search & Status Filters */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Input
              placeholder="Search bed, patient, IP number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 220 }}
            />

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 160 }}
            >
              <option value="all">All Bed Statuses</option>
              <option value="AVAILABLE">🟢 Available Only</option>
              <option value="OCCUPIED">🔴 Occupied Only</option>
              <option value="CLEANING">🟡 Housekeeping</option>
              <option value="MAINTENANCE">⚙️ Maintenance</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Main Interactive Beds Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {filteredBeds.map((bed) => {
          const isOccupied = bed.status === "OCCUPIED";
          const isAvailable = bed.status === "AVAILABLE";
          const isCleaning = bed.status === "CLEANING";
          const isMaint = bed.status === "MAINTENANCE";

          return (
            <Card
              key={bed.id}
              style={{
                borderRadius: 16,
                border: isOccupied
                  ? "2px solid #FCA5A5"
                  : isAvailable
                  ? "2px solid #86EFAC"
                  : isCleaning
                  ? "2px solid #FDE047"
                  : "1px solid var(--line)",
                background: isOccupied
                  ? "#FEF2F2"
                  : isAvailable
                  ? "#F0FDF4"
                  : isCleaning
                  ? "#FEFCE8"
                  : "var(--wash-a)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "16px 18px",
              }}
            >
              {/* Bed Header */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <strong style={{ fontSize: 17, color: "var(--indigo)", letterSpacing: "0.02em" }}>
                      {bed.bedNumber}
                    </strong>
                    {bed.isIcu && (
                      <span style={{ fontSize: 10, background: "#7C3AED", color: "#fff", padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>
                        ⚡ ICU CRITICAL
                      </span>
                    )}
                  </div>

                  <StatusPill kind={isAvailable ? "success" : isOccupied ? "warn" : "info"}>
                    {bed.status}
                  </StatusPill>
                </div>

                <div style={{ fontSize: 12, color: "var(--slate)", marginBottom: 12 }}>
                  {bed.category} · Floor {bed.floor} ({bed.wing.split("(")[0].trim()})
                </div>

                {/* Occupied Patient Details */}
                {isOccupied && (
                  <div style={{ background: "#fff", padding: 12, borderRadius: 10, border: "1px solid #FECACA", marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                      <strong style={{ fontSize: 14, color: "var(--ink)" }}>{bed.patientName}</strong>
                      <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--indigo)", fontWeight: 700 }}>
                        {bed.ipNumber}
                      </span>
                    </div>

                    <div style={{ fontSize: 11.5, color: "var(--slate)", marginBottom: 4 }}>
                      👨‍⚕️ {bed.doctorName} ({bed.department})
                    </div>

                    <div style={{ fontSize: 11.5, color: "#991B1B", fontWeight: 600 }}>
                      📋 {bed.primaryDiagnosis}
                    </div>

                    <div style={{ fontSize: 10.5, color: "var(--slate)", marginTop: 6, borderTop: "1px dashed var(--line)", paddingTop: 4 }}>
                      Admitted: {bed.admissionDate ? new Date(bed.admissionDate).toLocaleDateString("en-IN") : "Today"} · Tariff: ₹{bed.tariffPerDay}/day
                    </div>
                  </div>
                )}

                {/* Vacant Bed Info */}
                {isAvailable && (
                  <div style={{ background: "#fff", padding: 12, borderRadius: 10, border: "1px solid #BBF7D0", marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#166534", fontWeight: 700 }}>
                        🟢 Ready for Admission
                      </span>
                      <strong style={{ fontSize: 14, color: "#166534" }}>
                        ₹{bed.tariffPerDay.toLocaleString("en-IN")}/day
                      </strong>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--slate)", display: "block", marginTop: 4 }}>
                      Full nursing call bell & medical oxygen point verified
                    </span>
                  </div>
                )}

                {/* Cleaning & Maintenance Info */}
                {isCleaning && (
                  <div style={{ background: "#fff", padding: 12, borderRadius: 10, border: "1px solid #FEF08A", marginBottom: 14 }}>
                    <span style={{ fontSize: 12, color: "#854D0E", fontWeight: 700, display: "block" }}>
                      🧹 Housekeeping & Sanitization in Progress
                    </span>
                    <span style={{ fontSize: 11, color: "var(--slate)" }}>
                      Linen changed & disinfection checklist active
                    </span>
                  </div>
                )}

                {isMaint && (
                  <div style={{ background: "#fff", padding: 12, borderRadius: 10, border: "1px solid #E2E8F0", marginBottom: 14 }}>
                    <span style={{ fontSize: 12, color: "var(--slate)", fontWeight: 700, display: "block" }}>
                      ⚙️ Biomedical Asset Maintenance
                    </span>
                    <span style={{ fontSize: 11, color: "var(--slate)" }}>
                      Bed motor / monitor calibration scheduled
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 10 }}>
                {isAvailable && (
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedBedForAdmission(bed);
                      setAdmissionModalOpen(true);
                    }}
                    style={{ width: "100%", background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)", color: "#fff", fontSize: 12.5 }}
                  >
                    + Admit Patient to Bed
                  </Button>
                )}

                {isOccupied && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <Button
                      type="button"
                      onClick={() => {
                        setSelectedBedForTransfer(bed);
                        setTransferModalOpen(true);
                      }}
                      style={{ flex: 1, fontSize: 11.5, padding: "6px 8px" }}
                    >
                      🔀 Shift / Transfer
                    </Button>

                    <Button
                      type="button"
                      ghost
                      onClick={() => {
                        setSelectedBedForDischarge(bed);
                        setDischargeModalOpen(true);
                      }}
                      style={{ flex: 1, fontSize: 11.5, padding: "6px 8px", borderColor: "#DC2626", color: "#DC2626" }}
                    >
                      🚪 Discharge
                    </Button>
                  </div>
                )}

                {isCleaning && (
                  <Button
                    type="button"
                    onClick={() => handleMarkCleaned(bed.id)}
                    style={{ width: "100%", background: "#EAB308", color: "#000", fontSize: 12, fontWeight: 700 }}
                  >
                    ✓ Mark Cleaned & Available
                  </Button>
                )}

                {isMaint && (
                  <Button
                    type="button"
                    ghost
                    onClick={() => handleMarkCleaned(bed.id)}
                    style={{ width: "100%", fontSize: 12 }}
                  >
                    ✓ Service Complete (Release)
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* 1. Admission Modal */}
      {admissionModalOpen && selectedBedForAdmission && (
        <InpatientAdmissionModal
          isOpen={admissionModalOpen}
          onClose={() => setAdmissionModalOpen(false)}
          bed={selectedBedForAdmission}
          patients={patients}
          onSuccess={handleAdmissionSuccess}
        />
      )}

      {/* 2. Ward Transfer Modal */}
      {transferModalOpen && selectedBedForTransfer && (
        <WardTransferModal
          isOpen={transferModalOpen}
          onClose={() => setTransferModalOpen(false)}
          sourceBed={selectedBedForTransfer}
          availableBeds={availableBedsList}
          onSuccess={handleTransferSuccess}
        />
      )}

      {/* 3. Discharge Clearance Modal */}
      {dischargeModalOpen && selectedBedForDischarge && (
        <InpatientDischargeModal
          isOpen={dischargeModalOpen}
          onClose={() => setDischargeModalOpen(false)}
          bed={selectedBedForDischarge}
          onSuccess={handleDischargeSuccess}
        />
      )}

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
