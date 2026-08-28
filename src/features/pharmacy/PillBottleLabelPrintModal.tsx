import React from "react";
import { Modal, Button } from "../../ui/components";
import { useAuth } from "../../auth/AuthProvider";

interface PillBottleLabelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  medication: {
    brandName: string;
    genericName?: string;
    dosage: string;
    frequency: string;
    instructionsEn: string;
    instructionsTe: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    caution?: string;
  };
}

export default function PillBottleLabelPrintModal({
  isOpen,
  onClose,
  patient,
  medication,
}: PillBottleLabelPrintModalProps) {
  const { tenant } = useAuth();
  const facilityTitle = tenant ? tenant.replace(/[_|-]/g, " ").toUpperCase() : "ZEN CLINIC PHARMACY";

  if (!isOpen || !medication) return null;

  const patientName = `${patient?.given_name || "Ramesh"} ${patient?.family_name || "Babu"}`.toUpperCase();
  const uhid = patient?.national_id || `UHID-${patient?.id?.slice(0, 6).toUpperCase() || "908124"}`;

  const qrData = `PHARM|${uhid}|${medication.brandName}|${medication.batchNumber}|${medication.frequency}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(qrData)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pill Bottle & Prescription Label Printer (PHARM-001)">
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
              🏷️ Thermal Bottle Sticker (50mm × 25mm)
            </strong>
            <span style={{ fontSize: 11, color: "var(--slate)", display: "block" }}>
              Bilingual English + Telugu patient instructions with batch tracking
            </span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Button ghost onClick={onClose}>Close</Button>
            <Button
              onClick={handlePrint}
              style={{ background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)", color: "#fff" }}
            >
              🖨️ Print Label (50×25mm)
            </Button>
          </div>
        </div>

        {/* 1:1 SCALE PHYSICAL PILL BOTTLE STICKER PREVIEW */}
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
            className="pill-label-container"
            style={{
              width: "100%",
              maxWidth: 380,
              height: 120,
              background: "#FFFFFF",
              border: "2px solid #0F172A",
              borderRadius: 6,
              padding: "6px 10px",
              display: "grid",
              gridTemplateColumns: "1fr 50px",
              gap: 6,
              alignItems: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              position: "relative",
              color: "#000000",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {/* Left Column: Drug & Dosage Details */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: 10, color: "#131A8F", textTransform: "uppercase" }}>
                    {facilityTitle}
                  </strong>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#64748B" }}>
                    Qty: {medication.quantity}
                  </span>
                </div>

                <div style={{ fontSize: 11.5, fontWeight: 900, color: "#000", marginTop: 1 }}>
                  {patientName} · <span style={{ fontSize: 9.5, fontWeight: 600 }}>{uhid}</span>
                </div>

                <div style={{ fontSize: 12, fontWeight: 900, color: "#0F172A", marginTop: 2 }}>
                  {medication.brandName}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: "#1E3A8A" }}>
                  👉 {medication.frequency} · {medication.instructionsEn}
                </div>

                <div style={{ fontSize: 10.5, fontWeight: 800, color: "#047857" }}>
                  తెలుగు: {medication.instructionsTe || "భోజనం తర్వాత తీసుకోండి"}
                </div>

                <div style={{ fontSize: 8.5, color: "#475569", marginTop: 2, display: "flex", justifyContent: "space-between" }}>
                  <span>B.No: <strong>{medication.batchNumber}</strong></span>
                  <span>Exp: <strong>{medication.expiryDate}</strong></span>
                  <span>Disp: {new Date().toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Right Column: 2D QR Code */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderLeft: "1px dashed #CBD5E1", paddingLeft: 4, height: "100%" }}>
              <img
                src={qrUrl}
                alt="Medication QR"
                style={{ width: 44, height: 44, display: "block" }}
              />
              <span style={{ fontSize: 7.5, fontFamily: "monospace", fontWeight: 800, marginTop: 2 }}>
                {medication.batchNumber.slice(-4)}
              </span>
            </div>
          </div>
        </div>

        {/* Embedded Print CSS */}
        <style>{`
          @media print {
            @page {
              size: 50mm 25mm;
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
            .pill-label-container {
              border: none !important;
              box-shadow: none !important;
              width: 50mm !important;
              height: 25mm !important;
              max-width: 50mm !important;
              border-radius: 0 !important;
              padding: 3px 5px !important;
            }
          }
        `}</style>
      </div>
    </Modal>
  );
}
