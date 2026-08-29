import React, { useState } from "react";
import { Modal, Button, Select } from "../../ui/components";

interface PACURecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  surgery: any;
  onSuccess: (updatedSurgery: any) => void;
}

export default function PACURecoveryModal({
  isOpen,
  onClose,
  surgery,
  onSuccess,
}: PACURecoveryModalProps) {
  const [activity, setActivity] = useState(2);
  const [respiration, setRespiration] = useState(2);
  const [circulation, setCirculation] = useState(2);
  const [consciousness, setConsciousness] = useState(2);
  const [spo2Score, setSpo2Score] = useState(2);
  const [targetWard, setTargetWard] = useState("Floor 2 - Orthopedic Post-Op Ward (Bed 204)");

  if (!isOpen || !surgery) return null;

  const totalScore = activity + respiration + circulation + consciousness + spo2Score;
  const isDischargeReady = totalScore >= 9;

  const handleDischargeToWard = () => {
    onSuccess({
      ...surgery,
      status: "COMPLETED",
      aldreteScore: totalScore,
      targetWard,
      dischargedAt: new Date().toLocaleTimeString("en-IN", { timeStyle: "short" }),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post-Anesthesia Care Unit (PACU) - Aldrete Score (PACU-001)" maxWidth={660}>
      <div style={{ display: "grid", gap: 14, width: "100%", maxWidth: "100%", fontFamily: "var(--font-body)", color: "var(--ink)", boxSizing: "border-box" }}>
        
        {/* Header Summary */}
        <div style={{ background: "#F0FDF4", border: "1.5px solid #22C55E", padding: "10px 14px", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong style={{ fontSize: 14, color: "#166534" }}>
              {surgery.patientName} ({surgery.patientUhid})
            </strong>
            <span style={{ fontSize: 12, color: "#15803D", display: "block" }}>
              Post: <strong>{surgery.procedure}</strong> · Anesthesia: <strong>{surgery.anesthesiaType}</strong>
            </span>
          </div>
          
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 10.5, color: "#166534", fontWeight: 800, textTransform: "uppercase", display: "block" }}>
              Aldrete Score
            </span>
            <strong style={{ fontSize: 22, color: isDischargeReady ? "#16A34A" : "#D97706" }}>
              {totalScore} / 10
            </strong>
          </div>
        </div>

        {/* Aldrete 5 Parameter Breakdown */}
        <div style={{ display: "grid", gap: 10, background: "var(--wash-a)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
          
          {/* 1. Activity */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)" }}>1. Motor Activity:</span>
            <Select value={String(activity)} onChange={(e) => setActivity(Number(e.target.value))}>
              <option value="2">2 - Moves 4 extremities voluntarily or on command</option>
              <option value="1">1 - Moves 2 extremities voluntarily</option>
              <option value="0">0 - Unable to move extremities</option>
            </Select>
          </div>

          {/* 2. Respiration */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)" }}>2. Respiration:</span>
            <Select value={String(respiration)} onChange={(e) => setRespiration(Number(e.target.value))}>
              <option value="2">2 - Able to breathe deeply & cough freely</option>
              <option value="1">1 - Dyspneic, shallow or limited breathing</option>
              <option value="0">0 - Apneic / Ventilator dependent</option>
            </Select>
          </div>

          {/* 3. Circulation */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)" }}>3. Blood Pressure:</span>
            <Select value={String(circulation)} onChange={(e) => setCirculation(Number(e.target.value))}>
              <option value="2">2 - BP ± 20% of pre-anesthesia baseline</option>
              <option value="1">1 - BP ± 20% to 49% of pre-anesthesia level</option>
              <option value="0">0 - BP ± 50% of pre-anesthesia level</option>
            </Select>
          </div>

          {/* 4. Consciousness */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)" }}>4. Consciousness:</span>
            <Select value={String(consciousness)} onChange={(e) => setConsciousness(Number(e.target.value))}>
              <option value="2">2 - Fully awake & oriented</option>
              <option value="1">1 - Arousable on calling / stimulation</option>
              <option value="0">0 - Unresponsive</option>
            </Select>
          </div>

          {/* 5. SpO2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)" }}>5. O2 Saturation:</span>
            <Select value={String(spo2Score)} onChange={(e) => setSpo2Score(Number(e.target.value))}>
              <option value="2">2 - SpO2 &gt; 92% on room air</option>
              <option value="1">1 - Supplemental O2 required for &gt; 90%</option>
              <option value="0">0 - SpO2 &lt; 90% with supplemental O2</option>
            </Select>
          </div>

        </div>

        {/* Clearance Status Banner */}
        <div style={{ background: isDischargeReady ? "#DCFCE7" : "#FEF3C7", border: `1.5px solid ${isDischargeReady ? "#16A34A" : "#D97706"}`, padding: "10px 14px", borderRadius: 8, textAlign: "center" }}>
          <strong style={{ fontSize: 13, color: isDischargeReady ? "#166534" : "#B45309" }}>
            {isDischargeReady
              ? "✓ Aldrete Score ≥ 9 — Patient is Clinically Ready for Post-Op Ward Transfer"
              : "🟡 Aldrete Score < 9 — Patient Must Remain in PACU Under Continuous Observation"}
          </strong>
        </div>

        {/* Target Ward Destination */}
        {isDischargeReady && (
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Select Destination Post-Op Inpatient Ward:
            </label>
            <Select value={targetWard} onChange={(e) => setTargetWard(e.target.value)}>
              <option value="Floor 2 - Orthopedic Post-Op Ward (Bed 204)">🛏️ Floor 2 - Orthopedic Post-Op Ward (Bed 204)</option>
              <option value="Floor 3 - Surgical Semi-Private (Bed 308)">🛏️ Floor 3 - Surgical Semi-Private (Bed 308)</option>
              <option value="Floor 1 - Daycare Surgical Recovery (Bed 102)">🛏️ Floor 1 - Daycare Surgical Recovery (Bed 102)</option>
            </Select>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
          <Button ghost type="button" onClick={onClose}>Close</Button>
          {isDischargeReady && (
            <Button
              type="button"
              onClick={handleDischargeToWard}
              style={{ background: "#16A34A", color: "#fff", fontWeight: 800 }}
            >
              ✓ Discharge from PACU to Ward
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
