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

  const isNewborn = Boolean(patient.is_newborn);
  const patientName = `${patient.given_name || "Ramesh"} ${patient.family_name || "Babu"}`.toUpperCase();
  const uhid = patient.national_id || `UHID-${patient.id?.slice(0, 6).toUpperCase() || "908124"}`;
  const ipNum = inpatientDetails.ipNumber || (isNewborn ? "NEO-2026-0042" : "IPD-2026-9013");
  const bedNum = inpatientDetails.bedNumber || (isNewborn ? "NICU-02 / BASSINET" : "GMW-101 (FL 2)");
  const bloodGroup = inpatientDetails.bloodGroup || (isNewborn ? "Maternal O+" : "O +ve");
  const doctor = inpatientDetails.doctorName || (isNewborn ? "Dr. P. Sharma (Pediatrics)" : "Dr. V Ramana");
  const dept = inpatientDetails.department || (isNewborn ? "Neonatology" : "Orthopedics");
  
  const birthTime = patient.birth_time || "12:00";
  const birthWeight = patient.birth_weight_grams ? `${patient.birth_weight_grams}g (${(patient.birth_weight_grams / 1000).toFixed(2)}kg)` : "3000g (3.00kg)";
  const ageGender = isNewborn
    ? `${(patient.gender || "M").toUpperCase()} · BORN: ${patient.dob || "TODAY"} ${birthTime}`
    : `${patient.gender || "M"}, ${patient.dob ? "DOB: " + patient.dob : "Adult 48Y"}`;

  const qrData = isNewborn
    ? `HMS-NEWBORN|${uhid}|${patient.mother_patient_id || "MOM-UHID"}|${patientName}|${birthWeight}|${birthTime}`
    : `HMS-PATIENT|${uhid}|${ipNum}|${patientName}|${bloodGroup}|${bedNum}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrData)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isNewborn ? "👶 Newborn Dual Mother-Baby ID Wristband (ZBR-001)" : "Patient Thermal ID Wristband Printer (ZBR-001)"}
      maxWidth={680}
    >
      <div style={{ width: "100%", maxWidth: "100%", fontFamily: "var(--font-body)", color: "var(--ink)", boxSizing: "border-box" }}>
        
        {/* Controls Bar */}
        <div
          className="no-print"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            background: "var(--wash-a)",
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid var(--line)",
            flexWrap: "wrap",
            gap: 12,
            boxSizing: "border-box",
          }}
        >
          <div style={{ flex: "1 1 260px", minWidth: 0 }}>
            <strong style={{ fontSize: 13, color: isNewborn ? "#059669" : "var(--indigo)", display: "block" }}>
              {isNewborn ? "👶 Zebra/TSC 100mm × 25mm Newborn Soft Vinyl Band" : "🏷️ Thermal Wristband Profile (Zebra / TSC 100mm × 25mm)"}
            </strong>
            <span style={{ fontSize: 11.5, color: "var(--slate)", display: "block", marginTop: 2 }}>
              {isNewborn
                ? "Hypoallergenic soft-comfort neonate band with maternal UHID cross-reference"
                : "Standard tear-resistant waterproof inpatient wristband roll"}
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <Button ghost onClick={onClose}>Close</Button>
            <Button
              onClick={handlePrint}
              style={{
                background: isNewborn ? "linear-gradient(135deg, #059669 0%, #0D5C63 100%)" : "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)",
                color: "#fff",
                whiteSpace: "nowrap",
                fontSize: 12.5,
              }}
            >
              🖨️ Print Wristband (100×25mm)
            </Button>
          </div>
        </div>

        {/* 1:1 SCALE PHYSICAL THERMAL WRISTBAND PREVIEW */}
        <div
          style={{
            background: "#F1F5F9",
            padding: "20px 16px",
            borderRadius: 12,
            border: "1px dashed var(--line)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxSizing: "border-box",
            width: "100%",
            overflowX: "auto",
          }}
        >
          <div
            className="wristband-container"
            style={{
              width: "100%",
              maxWidth: 520,
              minHeight: 110,
              background: "#FFFFFF",
              border: isNewborn ? "2px solid #059669" : "2px solid #0F172A",
              borderRadius: 8,
              padding: "10px 14px",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 14,
              alignItems: "center",
              boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
              color: "#000000",
              fontFamily: "system-ui, -apple-system, sans-serif",
              boxSizing: "border-box",
            }}
          >
            {/* Left Column: Demographics & Clinical Info */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", gap: 6 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <strong style={{ fontSize: 13, color: "#000", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                    {facilityTitle}
                  </strong>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 900,
                      background: isNewborn ? "#059669" : "#000",
                      color: "#fff",
                      padding: "1px 6px",
                      borderRadius: 3,
                      flexShrink: 0,
                    }}
                  >
                    {isNewborn ? "👶 NEONATE / INFANT" : "INPATIENT"}
                  </span>
                </div>

                <div style={{ fontSize: 14, fontWeight: 900, marginTop: 3, color: "#000" }}>
                  {patientName}
                </div>

                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#334155", marginTop: 2 }}>
                  {ageGender} · <strong style={{ color: "#059669" }}>WT: {birthWeight}</strong>
                </div>
              </div>

              <div style={{ borderTop: "1px dashed #CBD5E1", paddingTop: 4 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#000" }}>
                  BABY UHID: {uhid} {patient.mother_patient_id && `· MOTHER ID: ${patient.mother_patient_id.slice(0, 8)}`}
                </div>
                <div style={{ fontSize: 10.5, color: "#334155" }}>
                  Ward: <strong>{bedNum}</strong> · {doctor} ({dept})
                </div>
              </div>
            </div>

            {/* Right Column: 2D QR Code & Barcode */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderLeft: "1px dashed #94A3B8", paddingLeft: 12, height: "100%", flexShrink: 0 }}>
              <img
                src={qrApiUrl}
                alt="Patient QR Code"
                style={{ width: 64, height: 64, display: "block", marginBottom: 2 }}
              />
              <div style={{ fontSize: 9, fontFamily: "monospace", fontWeight: 800, letterSpacing: 1 }}>
                {uhid}
              </div>
              <div style={{ fontSize: 8.5, color: "#64748B" }}>
                {isNewborn ? "Scan Neonatal ID" : "Scan for EMR"}
              </div>
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
