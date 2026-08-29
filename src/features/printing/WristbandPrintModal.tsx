import React from "react";
import { Modal, Button } from "../../ui/components";
import { useAuth } from "../../auth/AuthProvider";

interface WristbandPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  inpatientDetails?: {
    bedNumber?: string;
    floor?: number;
    ipNumber?: string;
    doctorName?: string;
    department?: string;
    bloodGroup?: string;
    allergies?: string[];
  };
}

export default function WristbandPrintModal({
  isOpen,
  onClose,
  patient,
  inpatientDetails = {},
}: WristbandPrintModalProps) {
  const { tenant } = useAuth();
  const facilityTitle = tenant ? tenant.replace(/[_|-]/g, " ").toUpperCase() : "ZEN CLINIC HOSPITAL";

  if (!isOpen || !patient) return null;

  const patientName = `${patient.given_name || "Ramesh"} ${patient.family_name || "Babu"}`.toUpperCase();
  const uhid = patient.national_id || `UHID-${patient.id?.slice(0, 6).toUpperCase() || "908124"}`;
  const ipNum = inpatientDetails.ipNumber || "IPD-2026-9013";
  const bedNum = inpatientDetails.bedNumber || "GMW-101 (FL 2)";
  const bloodGroup = inpatientDetails.bloodGroup || "O +ve";
  const doctor = inpatientDetails.doctorName || "Dr. V Ramana";
  const dept = inpatientDetails.department || "Orthopedics";
  const ageGender = `${patient.gender || "M"}, ${patient.dob ? "DOB: " + patient.dob : "Adult 48Y"}`;

  const qrData = `HMS-PATIENT|${uhid}|${ipNum}|${patientName}|${bloodGroup}|${bedNum}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrData)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Patient Thermal ID Wristband Printer (ZBR-001)">
      <div style={{ maxWidth: 640, minWidth: 500, fontFamily: "var(--font-body)", color: "var(--ink)" }}>
        
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
              🏷️ Thermal Wristband Profile (Zebra / TSC 100mm × 25mm)
            </strong>
            <span style={{ fontSize: 11, color: "var(--slate)", display: "block" }}>
              Standard tear-resistant waterproof inpatient wristband roll
            </span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Button ghost onClick={onClose}>Close</Button>
            <Button
              onClick={handlePrint}
              style={{ background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)", color: "#fff" }}
            >
              🖨️ Print Wristband (100×25mm)
            </Button>
          </div>
        </div>

        {/* 1:1 SCALE PHYSICAL THERMAL WRISTBAND PREVIEW */}
        <div
          style={{
            background: "#F1F5F9",
            padding: 24,
            borderRadius: 12,
            border: "1px dashed var(--line)",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            className="wristband-container"
            style={{
              width: "100%",
              maxWidth: 480,
              height: 120,
              background: "#FFFFFF",
              border: "2px solid #0F172A",
              borderRadius: 8,
              padding: "8px 12px",
              display: "grid",
              gridTemplateColumns: "1.8fr 1fr",
              gap: 8,
              alignItems: "center",
              boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
              position: "relative",
              color: "#000000",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {/* Left Column: Demographics & Clinical Info */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: 13, color: "#000", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                    {facilityTitle}
                  </strong>
                  <span style={{ fontSize: 10, fontWeight: 900, background: "#000", color: "#fff", padding: "1px 6px", borderRadius: 3 }}>
                    INPATIENT
                  </span>
                </div>

                <div style={{ fontSize: 13.5, fontWeight: 900, marginTop: 2, color: "#000" }}>
                  {patientName}
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, color: "#334155" }}>
                  {ageGender} · <strong style={{ color: "#DC2626" }}>BG: {bloodGroup}</strong>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#000" }}>
                  UHID: {uhid} · IP: {ipNum}
                </div>
                <div style={{ fontSize: 10.5, color: "#334155" }}>
                  Bed: <strong>{bedNum}</strong> · {doctor} ({dept})
                </div>
              </div>
            </div>

            {/* Right Column: 2D QR Code & Barcode */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderLeft: "1px dashed #94A3B8", paddingLeft: 8, height: "100%" }}>
              <img
                src={qrApiUrl}
                alt="Patient QR Code"
                style={{ width: 64, height: 64, display: "block", marginBottom: 2 }}
              />
              <div style={{ fontSize: 9, fontFamily: "monospace", fontWeight: 800, letterSpacing: 1 }}>
                {uhid}
              </div>
              <div style={{ fontSize: 8.5, color: "#64748B" }}>Scan for EMR</div>
            </div>
          </div>
        </div>

        {/* Embedded Wristband Print CSS */}
        <style>{`
          @media print {
            @page {
              size: 100mm 25mm;
              margin: 0;
            }
            .no-print {
              display: none !important;
            }
            body {
              background: #fff !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .wristband-container {
              border: none !important;
              box-shadow: none !important;
              width: 100mm !important;
              height: 25mm !important;
              max-width: 100mm !important;
              border-radius: 0 !important;
              padding: 4px 6px !important;
            }
          }
        `}</style>
      </div>
    </Modal>
  );
}
