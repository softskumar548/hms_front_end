import React, { useState } from "react";
import { Modal, Button, Select } from "../../ui/components";

interface EmergencyICUTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergencyCase: any;
  onSuccess: (transferData: any) => void;
}

export default function EmergencyICUTransferModal({
  isOpen,
  onClose,
  emergencyCase,
  onSuccess,
}: EmergencyICUTransferModalProps) {
  const [destinationBed, setDestinationBed] = useState("ICU-01 (Floor 4 - Mechanical Ventilator)");
  const [indication, setIndication] = useState("SEVERE_RESPIRATORY_FAILURE");
  const [ventilatorMode, setVentilatorMode] = useState("INVASIVE_VENTILATION");
  const [attendingIntensivist, setAttendingIntensivist] = useState("Dr. K R Murali (Dean & Critical Care)");
  const [handoverNotes, setHandoverNotes] = useState("Patient intubated with 7.5mm ET tube. Inotropic support started with Noradrenaline. Shifted with portable transport monitor.");

  if (!isOpen || !emergencyCase) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess({
      caseId: emergencyCase.id,
      patientName: emergencyCase.patientName,
      sourceBay: emergencyCase.assignedBay,
      destinationBed,
      indication: indication.replace(/_/g, " "),
      ventilatorMode,
      attendingIntensivist,
      handoverNotes,
      transferTime: new Date().toLocaleTimeString("en-IN", { timeStyle: "short" }),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="1-Click Emergency ICU / OT Escalation Transfer (ICU-001)">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, maxWidth: 580, minWidth: 460, fontFamily: "var(--font-body)", color: "var(--ink)" }}>
        
        {/* Patient Details Header */}
        <div style={{ background: "#FEF2F2", border: "1.5px solid #DC2626", padding: 12, borderRadius: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <strong style={{ fontSize: 14, color: "#DC2626" }}>
              🚨 {emergencyCase.patientName}
            </strong>
            <span style={{ fontSize: 11, background: "#DC2626", color: "#fff", padding: "2px 6px", borderRadius: 4, fontWeight: 900 }}>
              {emergencyCase.triageLevel} TRIAGE
            </span>
          </div>
          <span style={{ fontSize: 12, color: "#991B1B", display: "block", marginTop: 2 }}>
            Current Location: <strong>{emergencyCase.assignedBay}</strong> · GCS: <strong>{emergencyCase.gcsScore}/15</strong> · Diagnosis: {emergencyCase.complaint}
          </span>
        </div>

        {/* Destination Critical Care Unit & Bed */}
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
            Select Target Critical Care / ICU Bed:
          </label>
          <Select value={destinationBed} onChange={(e) => setDestinationBed(e.target.value)}>
            <option value="ICU-01 (Floor 4 - Mechanical Ventilator)">🛏️ ICU-01 (Floor 4 - Mechanical Ventilator Bed · ₹8,500/day)</option>
            <option value="ICU-02 (Floor 4 - Mechanical Ventilator)">🛏️ ICU-02 (Floor 4 - Mechanical Ventilator Bed · ₹8,500/day)</option>
            <option value="CCU-01 (Floor 4 - Cardiac Care Unit)">❤️ CCU-01 (Floor 4 - Coronary Care Unit · ₹9,000/day)</option>
            <option value="OT-01 (Emergency Operation Theatre)">🏥 OT-01 (Emergency Trauma Operation Theatre Suite)</option>
          </Select>
        </div>

        {/* Transfer Indication & Respiratory Support */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Clinical Transfer Indication
            </label>
            <Select value={indication} onChange={(e) => setIndication(e.target.value)}>
              <option value="SEVERE_RESPIRATORY_FAILURE">🫁 Acute Respiratory Failure (SpO2 &lt; 85%)</option>
              <option value="SEPTIC_REFRACTORY_SHOCK">🦠 Refractory Septic Shock / Inotropes</option>
              <option value="POST_CPR_ARREST">⚡ Post-Cardiac Arrest Monitoring</option>
              <option value="EMERGENCY_SURGERY">🔪 Emergency Trauma Laparotomy / OT</option>
              <option value="SEVERE_HEAD_INJURY">🧠 Severe Head Injury / Intracranial Pressure</option>
            </Select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Ventilator / Oxygen Mode
            </label>
            <Select value={ventilatorMode} onChange={(e) => setVentilatorMode(e.target.value)}>
              <option value="INVASIVE_VENTILATION">🫁 Invasive Mechanical Ventilation (ET Tube)</option>
              <option value="NON_INVASIVE_BIPAP">💨 Non-Invasive BiPAP / CPAP</option>
              <option value="HIGH_FLOW_NASAL">👃 High-Flow Nasal Cannula (HFNC)</option>
              <option value="NRBM_OXYGEN">😷 NRBM High Concentration Oxygen</option>
            </Select>
          </div>
        </div>

        {/* Attending Intensivist */}
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
            Receiving Consultant Intensivist:
          </label>
          <Select value={attendingIntensivist} onChange={(e) => setAttendingIntensivist(e.target.value)}>
            <option value="Dr. K R Murali (Dean & Critical Care)">Dr. K R Murali (Dean & Critical Care Physician)</option>
            <option value="Dr. Sreenivasulu (Interventional Cardiologist)">Dr. Sreenivasulu (Senior Cardiologist)</option>
            <option value="Dr. V Ramana (Orthopedic & Trauma Surgeon)">Dr. V Ramana (Trauma Surgeon)</option>
          </Select>
        </div>

        {/* Clinical Handover Notes */}
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
            Emergency Handover SBAR / Resuscitation Notes:
          </label>
          <textarea
            rows={2}
            value={handoverNotes}
            onChange={(e) => setHandoverNotes(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 8,
              border: "1px solid var(--line)",
              fontFamily: "var(--font-body)",
              fontSize: 12.5,
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
          <Button ghost type="button" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            style={{ background: "#DC2626", color: "#fff", fontWeight: 800 }}
          >
            🚨 Execute Emergency ICU Shift
          </Button>
        </div>
      </form>
    </Modal>
  );
}
