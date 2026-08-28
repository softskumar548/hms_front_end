import React, { useState } from "react";
import { Modal, Button } from "../../ui/components";
import { useAuth } from "../../auth/AuthProvider";

interface SpecimenBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  defaultTests?: string[];
}

interface SpecimenTube {
  id: string;
  sampleCode: string;
  testName: string;
  tubeType: "EDTA_PURPLE" | "SERUM_RED" | "FLUORIDE_GREY" | "URINE_PLAIN";
  capColor: string;
  capLabel: string;
  department: string;
  volume: string;
  selected: boolean;
}

const initialTubesList: SpecimenTube[] = [
  {
    id: "tube-1",
    sampleCode: "SMP-8901",
    testName: "Complete Blood Count (CBC) + ESR",
    tubeType: "EDTA_PURPLE",
    capColor: "#7C3AED",
    capLabel: "EDTA K2 (Purple)",
    department: "Hematology",
    volume: "2.0 mL",
    selected: true,
  },
  {
    id: "tube-2",
    sampleCode: "SMP-8902",
    testName: "Liver & Renal Function (LFT + RFT)",
    tubeType: "SERUM_RED",
    capColor: "#DC2626",
    capLabel: "Serum Gel (Red)",
    department: "Biochemistry",
    volume: "3.5 mL",
    selected: true,
  },
  {
    id: "tube-3",
    sampleCode: "SMP-8903",
    testName: "Fasting Blood Sugar (FBS)",
    tubeType: "FLUORIDE_GREY",
    capColor: "#64748B",
    capLabel: "Fluoride (Grey)",
    department: "Biochemistry",
    volume: "2.0 mL",
    selected: true,
  },
  {
    id: "tube-4",
    sampleCode: "SMP-8904",
    testName: "Urine Complete Routine & Micro",
    tubeType: "URINE_PLAIN",
    capColor: "#EAB308",
    capLabel: "Urine Cup (Yellow)",
    department: "Clinical Pathology",
    volume: "30 mL",
    selected: false,
  },
];

export default function SpecimenBarcodeModal({
  isOpen,
  onClose,
  patient,
}: SpecimenBarcodeModalProps) {
  const { tenant } = useAuth();
  const facilityTitle = tenant ? tenant.replace(/[_|-]/g, " ").toUpperCase() : "ZEN CLINIC HOSPITAL";

  const [tubes, setTubes] = useState<SpecimenTube[]>(initialTubesList);

  if (!isOpen || !patient) return null;

  const patientName = `${patient.given_name || "Sita"} ${patient.family_name || "Devi"}`.toUpperCase();
  const uhid = patient.national_id || `UHID-${patient.id?.slice(0, 6).toUpperCase() || "908125"}`;
  const ageGender = `${patient.gender || "F"}, ${patient.dob ? "DOB: " + patient.dob : "Adult 42Y"}`;

  const selectedTubes = tubes.filter((t) => t.selected);

  const toggleTube = (id: string) => {
    setTubes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Diagnostic Specimen Tube Barcode Label Generator (LAB-002)">
      <div style={{ maxWidth: 680, minWidth: 540, fontFamily: "var(--font-body)", color: "var(--ink)" }}>
        
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
              🧪 Vacutainer Specimen Tube Stickers (50mm × 25mm)
            </strong>
            <span style={{ fontSize: 11, color: "var(--slate)", display: "block" }}>
              {selectedTubes.length} Labels ready for thermal label roll printing
            </span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Button ghost onClick={onClose}>Close</Button>
            <Button
              onClick={handlePrint}
              disabled={selectedTubes.length === 0}
              style={{ background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)", color: "#fff" }}
            >
              🖨️ Print {selectedTubes.length} Labels Batch
            </Button>
          </div>
        </div>

        {/* Tube Selection Checklist */}
        <div className="no-print" style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <strong style={{ fontSize: 12, color: "var(--slate)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>
            Select Specimen Tubes to Print:
          </strong>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {tubes.map((t) => (
              <label
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: t.selected ? "var(--indigo-soft)" : "var(--wash-a)",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: t.selected ? "1px solid var(--indigo)" : "1px solid var(--line)",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                <input
                  type="checkbox"
                  checked={t.selected}
                  onChange={() => toggleTube(t.id)}
                />
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: t.capColor,
                    display: "inline-block",
                  }}
                />
                <div>
                  <strong style={{ display: "block", color: "var(--ink)" }}>{t.testName}</strong>
                  <span style={{ fontSize: 10.5, color: "var(--slate)" }}>{t.capLabel} · {t.sampleCode}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 1:1 SCALE PHYSICAL TUBE LABELS PREVIEW */}
        <div
          style={{
            background: "#F8FAFC",
            padding: 16,
            borderRadius: 12,
            border: "1px dashed var(--line)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {selectedTubes.map((tube) => {
            const qrData = `${tube.sampleCode}|${uhid}|${tube.testName}|${patientName}`;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(qrData)}`;

            return (
              <div
                key={tube.id}
                className="specimen-label-container"
                style={{
                  background: "#FFFFFF",
                  border: "2px solid #0F172A",
                  borderRadius: 6,
                  padding: "6px 8px",
                  height: 110,
                  display: "grid",
                  gridTemplateColumns: "1fr 50px",
                  gap: 6,
                  alignItems: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  position: "relative",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                {/* Left Side: Tube Specimen Details */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 9, fontWeight: 900, background: tube.capColor, color: "#fff", padding: "1px 4px", borderRadius: 3 }}>
                        {tube.capLabel.split(" ")[0]}
                      </span>
                      <strong style={{ fontSize: 9, fontFamily: "monospace", color: "#000" }}>
                        {tube.sampleCode}
                      </strong>
                    </div>

                    <div style={{ fontSize: 11.5, fontWeight: 900, color: "#000", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {patientName}
                    </div>

                    <div style={{ fontSize: 9.5, fontWeight: 700, color: "#334155" }}>
                      {uhid} · {ageGender}
                    </div>
                  </div>

                  <div>
                    <strong style={{ fontSize: 10, color: "#131A8F", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tube.testName}
                    </strong>
                    <div style={{ fontSize: 8.5, color: "#64748B" }}>
                      {new Date().toLocaleDateString("en-IN")} {new Date().toLocaleTimeString("en-IN", { timeStyle: "short" })} · Phleb: 01
                    </div>
                  </div>
                </div>

                {/* Right Side: 2D QR Code */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderLeft: "1px dashed #CBD5E1", paddingLeft: 4, height: "100%" }}>
                  <img
                    src={qrUrl}
                    alt="Sample QR"
                    style={{ width: 44, height: 44, display: "block" }}
                  />
                  <span style={{ fontSize: 8, fontFamily: "monospace", fontWeight: 800, marginTop: 2 }}>
                    {tube.sampleCode.slice(-4)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Embedded Specimen Print CSS */}
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
            .specimen-label-container {
              border: none !important;
              box-shadow: none !important;
              width: 50mm !important;
              height: 25mm !important;
              max-width: 50mm !important;
              page-break-after: always !important;
              border-radius: 0 !important;
              padding: 3px 5px !important;
            }
          }
        `}</style>
      </div>
    </Modal>
  );
}
