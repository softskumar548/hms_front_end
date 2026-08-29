import React, { useState } from "react";
import { Modal, Button, Input, Select } from "../../ui/components";

interface BloodCrossMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: any;
  onSuccess: (updatedRequisition: any) => void;
}

export default function BloodCrossMatchModal({
  isOpen,
  onClose,
  requisition,
  onSuccess,
}: BloodCrossMatchModalProps) {
  const [majorCrossMatch, setMajorCrossMatch] = useState("COMPATIBLE");
  const [minorCrossMatch, setMinorCrossMatch] = useState("COMPATIBLE");
  const [coombsAhgTest, setCoombsAhgTest] = useState("NEGATIVE_NO_AGGLUTINATION");
  const [assignedUnitBag, setAssignedUnitBag] = useState("BB-2026-90812 (PRBC · B Pos · Exp: 15-Sep-2026)");
  const [technologistName, setTechnologistName] = useState("K. Sandhya (Senior Blood Bank Technologist)");

  if (!isOpen || !requisition) return null;

  const isFullyCompatible =
    majorCrossMatch === "COMPATIBLE" &&
    minorCrossMatch === "COMPATIBLE" &&
    coombsAhgTest === "NEGATIVE_NO_AGGLUTINATION";

  const handleIssueAndReserve = () => {
    onSuccess({
      ...requisition,
      status: "COMPATIBLE_RESERVED",
      assignedUnitBag,
      majorCrossMatch,
      minorCrossMatch,
      coombsAhgTest,
      technologistName,
      reservedUntil: "24 Hours (Active Hold)",
      crossMatchedAt: new Date().toLocaleTimeString("en-IN", { timeStyle: "short" }),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transfusion Compatibility & Major Cross-Match (XM-001)" maxWidth={660}>
      <div style={{ display: "grid", gap: 14, width: "100%", maxWidth: "100%", fontFamily: "var(--font-body)", color: "var(--ink)", boxSizing: "border-box" }}>
        
        {/* Patient & Requisition Header */}
        <div style={{ background: "#FEF2F2", border: "1.5px solid #DC2626", padding: 12, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong style={{ fontSize: 14, color: "#DC2626" }}>
              🩸 {requisition.patientName} ({requisition.patientUhid})
            </strong>
            <span style={{ fontSize: 12, color: "#991B1B", display: "block", marginTop: 2 }}>
              Patient Group: <strong>{requisition.bloodGroup}</strong> · Required: <strong>{requisition.requiredComponent} (2 Units)</strong>
            </span>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, background: "#DC2626", color: "#fff", padding: "3px 8px", borderRadius: 4, fontWeight: 900 }}>
              {requisition.department}
            </span>
          </div>
        </div>

        {/* Selected Donor Blood Unit */}
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
            Assign Matched Donor Blood Unit from Inventory:
          </label>
          <Select value={assignedUnitBag} onChange={(e) => setAssignedUnitBag(e.target.value)}>
            <option value="BB-2026-90812 (PRBC · B Pos · Exp: 15-Sep-2026)">🩸 BB-2026-90812 · PRBC (B Positive · Unit 1 · 350mL)</option>
            <option value="BB-2026-90813 (PRBC · B Pos · Exp: 18-Sep-2026)">🩸 BB-2026-90813 · PRBC (B Positive · Unit 2 · 350mL)</option>
            <option value="BB-2026-90814 (PRBC · O Neg · STAT Reserve)">🚨 BB-2026-90814 · PRBC (O Negative Universal Donor)</option>
          </Select>
        </div>

        {/* Serological Compatibility Testing */}
        <div style={{ background: "var(--wash-a)", border: "1.5px solid var(--indigo)", padding: 12, borderRadius: 10 }}>
          <strong style={{ fontSize: 12, color: "var(--indigo)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
            🧪 Pre-Transfusion Serology & AHG Testing:
          </strong>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
                Major Cross-Match (Patient Serum + Donor Cells)
              </label>
              <Select value={majorCrossMatch} onChange={(e) => setMajorCrossMatch(e.target.value)}>
                <option value="COMPATIBLE">✓ Compatible (No Agglutination / Hemolysis)</option>
                <option value="INCOMPATIBLE">❌ Incompatible (Agglutination Present)</option>
              </Select>
            </div>

            <div>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
                Minor Cross-Match (Donor Serum + Patient Cells)
              </label>
              <Select value={minorCrossMatch} onChange={(e) => setMinorCrossMatch(e.target.value)}>
                <option value="COMPATIBLE">✓ Compatible (No Reaction)</option>
                <option value="INCOMPATIBLE">❌ Incompatible</option>
              </Select>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Anti-Human Globulin (AHG / Indirect Coombs Phase)
            </label>
            <Select value={coombsAhgTest} onChange={(e) => setCoombsAhgTest(e.target.value)}>
              <option value="NEGATIVE_NO_AGGLUTINATION">✓ Negative — No Irregular Antibodies Detected (37°C + AHG)</option>
              <option value="POSITIVE_ANTIBODY_PRESENT">❌ Positive — Irregular Antibodies Detected</option>
            </Select>
          </div>
        </div>

        {/* Compatibility Verdict Banner */}
        <div style={{ background: isFullyCompatible ? "#DCFCE7" : "#FEF2F2", border: `1.5px solid ${isFullyCompatible ? "#16A34A" : "#DC2626"}`, padding: "10px 14px", borderRadius: 8, textAlign: "center" }}>
          <strong style={{ fontSize: 13, color: isFullyCompatible ? "#166534" : "#991B1B" }}>
            {isFullyCompatible
              ? "✓ 100% COMPATIBLE — Blood Unit Cleared for Surgical Transfusion"
              : "❌ INCOMPATIBLE — Unit CANNOT be transfused. Discard & re-match."}
          </strong>
        </div>

        {/* Technologist */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
            Transfusion Technologist / Medical Officer:
          </label>
          <Input value={technologistName} onChange={(e) => setTechnologistName(e.target.value)} />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
          <Button ghost type="button" onClick={onClose}>Cancel</Button>
          {isFullyCompatible && (
            <Button
              type="button"
              onClick={handleIssueAndReserve}
              style={{ background: "#DC2626", color: "#fff", fontWeight: 800 }}
            >
              🩸 Reserve & Lock Unit (24h Hold)
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
