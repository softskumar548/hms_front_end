import React, { useState } from "react";
import { Modal, Button, Input, Select } from "../../ui/components";

interface EmergencyIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCase: any) => void;
}

export default function EmergencyIntakeModal({
  isOpen,
  onClose,
  onSuccess,
}: EmergencyIntakeModalProps) {
  const [isUnknown, setIsUnknown] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [estimatedAge, setEstimatedAge] = useState("35");
  const [gender, setGender] = useState("male");
  const [arrivalMode, setArrivalMode] = useState("108_AMBULANCE");
  const [paramedicPhone, setParamedicPhone] = useState("9848011223");
  const [complaint, setComplaint] = useState("RTA_POLYTRAUMA");
  const [assignedBay, setAssignedBay] = useState("Bay 1 (Resuscitation Suite)");

  // GCS Sub-scores
  const [eyeScore, setEyeScore] = useState(4);
  const [verbalScore, setVerbalScore] = useState(5);
  const [motorScore, setMotorScore] = useState(6);

  // Vitals
  const [spo2, setSpo2] = useState("98");
  const [pulse, setPulse] = useState("82");
  const [bpSystolic, setBpSystolic] = useState("120");
  const [bpDiastolic, setBpDiastolic] = useState("80");
  const [rbs, setRbs] = useState("110");

  if (!isOpen) return null;

  const totalGcs = eyeScore + verbalScore + motorScore;
  const parsedSpo2 = parseFloat(spo2) || 98;
  const parsedSys = parseFloat(bpSystolic) || 120;

  // Auto determine triage level
  let autoTriage: "RED" | "YELLOW" | "GREEN" = "GREEN";
  if (totalGcs <= 8 || parsedSpo2 < 88 || parsedSys < 85 || complaint === "RTA_POLYTRAUMA" || complaint === "ACUTE_STEMI") {
    autoTriage = "RED";
  } else if (totalGcs <= 13 || parsedSpo2 < 93 || parsedSys < 95) {
    autoTriage = "YELLOW";
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = isUnknown
      ? `UNKNOWN ${gender.toUpperCase()} #${Math.floor(1000 + Math.random() * 9000)} (108 BROUGHT)`
      : patientName || "Emergency Patient";

    const emergencyCase = {
      id: `emg-${Date.now()}`,
      emergencyNumber: `ER-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: finalName,
      isUnknown,
      ageGender: `${estimatedAge}Y / ${gender === "male" ? "Male" : "Female"}`,
      arrivalMode,
      paramedicPhone,
      complaint: complaint.replace(/_/g, " "),
      assignedBay,
      triageLevel: autoTriage,
      gcsScore: totalGcs,
      gcsBreakdown: `E${eyeScore}V${verbalScore}M${motorScore}`,
      vitals: {
        spo2: parsedSpo2,
        pulse: parseFloat(pulse) || 82,
        bp: `${bpSystolic}/${bpDiastolic}`,
        rbs: parseFloat(rbs) || 110,
      },
      intakeTime: new Date().toLocaleTimeString("en-IN", { timeStyle: "short" }),
      status: "IN_TRAUMA_BAY",
    };

    onSuccess(emergencyCase);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rapid Emergency Casualty & Trauma Intake (ER-001)">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, maxWidth: 660, minWidth: 520, fontFamily: "var(--font-body)", color: "var(--ink)" }}>
        
        {/* Unidentified John Doe Quick Switch */}
        <div style={{ background: isUnknown ? "#FEF2F2" : "var(--wash-a)", padding: 12, borderRadius: 10, border: isUnknown ? "2px solid #DC2626" : "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong style={{ fontSize: 13, color: isUnknown ? "#DC2626" : "var(--indigo)", display: "block" }}>
              🚨 Unidentified / John Doe Trauma Case
            </strong>
            <span style={{ fontSize: 11.5, color: "var(--slate)" }}>
              Enable for unconscious/unresponsive accident victims brought without ID
            </span>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={isUnknown}
              onChange={(e) => setIsUnknown(e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            <span>Unidentified Victim</span>
          </label>
        </div>

        {/* Patient Identity Form */}
        <div style={{ display: "grid", gridTemplateColumns: isUnknown ? "1fr 1fr" : "2fr 1fr 1fr", gap: 10 }}>
          {!isUnknown && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
                Patient Full Name
              </label>
              <Input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Ramesh Babu"
                required={!isUnknown}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Estimated Age (Years)
            </label>
            <Input
              type="number"
              value={estimatedAge}
              onChange={(e) => setEstimatedAge(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Gender
            </label>
            <Select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
          </div>
        </div>

        {/* Mode of Arrival & Chief Complaint */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Arrival Mode & Transport
            </label>
            <Select value={arrivalMode} onChange={(e) => setArrivalMode(e.target.value)}>
              <option value="108_AMBULANCE">🚑 108 Emergency Ambulance</option>
              <option value="POLICE_BROUGHT">🚓 Police Patrol Brought</option>
              <option value="PRIVATE_VEHICLE">🚗 Private Vehicle / Auto</option>
              <option value="WALK_IN">🚶 Walk-In Casualty</option>
            </Select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Presenting Acute Emergency
            </label>
            <Select value={complaint} onChange={(e) => setComplaint(e.target.value)}>
              <option value="RTA_POLYTRAUMA">💥 RTA Polytrauma / Head Injury</option>
              <option value="ACUTE_STEMI">❤️ Acute STEMI / Severe Chest Pain</option>
              <option value="ACUTE_STROKE">🧠 Acute Stroke / Hemiplegia (&lt;4.5h)</option>
              <option value="SEVERE_SEPSIS">🦠 Severe Sepsis / Septic Shock</option>
              <option value="SNAKEBITE_POISON">🐍 Snakebite / Acute Poisoning</option>
              <option value="SEVERE_ASTHMA">🫁 Acute Respiratory Distress / SpO2 Drop</option>
            </Select>
          </div>
        </div>

        {/* Interactive Glasgow Coma Scale (GCS) Calculator */}
        <div style={{ border: "1.5px solid var(--indigo)", borderRadius: 10, padding: 12, background: "var(--wash-a)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <strong style={{ fontSize: 12.5, color: "var(--indigo)", textTransform: "uppercase" }}>
                🧠 Glasgow Coma Scale (GCS) Calculator:
              </strong>
              <span style={{ fontSize: 11, color: "var(--slate)", display: "block" }}>
                Neurological consciousness assessment (E + V + M)
              </span>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 11, color: "var(--slate)" }}>Total GCS Score:</span>
              <strong style={{ fontSize: 18, color: totalGcs <= 8 ? "#DC2626" : totalGcs <= 13 ? "#D97706" : "#16A34A", display: "block" }}>
                {totalGcs} / 15 ({totalGcs <= 8 ? "Severe Deficit" : totalGcs <= 13 ? "Moderate" : "Mild"})
              </strong>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <div>
              <label style={{ fontSize: 10.5, color: "var(--slate)", display: "block", marginBottom: 2 }}>Eye Response (E1-4)</label>
              <Select value={String(eyeScore)} onChange={(e) => setEyeScore(Number(e.target.value))}>
                <option value="4">4 - Spontaneous</option>
                <option value="3">3 - To Speech</option>
                <option value="2">2 - To Pain</option>
                <option value="1">1 - None</option>
              </Select>
            </div>

            <div>
              <label style={{ fontSize: 10.5, color: "var(--slate)", display: "block", marginBottom: 2 }}>Verbal (V1-5)</label>
              <Select value={String(verbalScore)} onChange={(e) => setVerbalScore(Number(e.target.value))}>
                <option value="5">5 - Oriented</option>
                <option value="4">4 - Confused</option>
                <option value="3">3 - Inappropriate</option>
                <option value="2">2 - Incomprehensible</option>
                <option value="1">1 - None</option>
              </Select>
            </div>

            <div>
              <label style={{ fontSize: 10.5, color: "var(--slate)", display: "block", marginBottom: 2 }}>Motor (M1-6)</label>
              <Select value={String(motorScore)} onChange={(e) => setMotorScore(Number(e.target.value))}>
                <option value="6">6 - Obeys Commands</option>
                <option value="5">5 - Localizes Pain</option>
                <option value="4">4 - Withdraws</option>
                <option value="3">3 - Flexion Decorticate</option>
                <option value="2">2 - Extensor Decerebrate</option>
                <option value="1">1 - None</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Emergency Vitals & Triage Badge */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr) 1.2fr", gap: 8, alignItems: "center" }}>
          <div>
            <label style={{ fontSize: 10.5, color: "var(--slate)", display: "block", marginBottom: 2 }}>SpO2 (%)</label>
            <Input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: 10.5, color: "var(--slate)", display: "block", marginBottom: 2 }}>Pulse (bpm)</label>
            <Input type="number" value={pulse} onChange={(e) => setPulse(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: 10.5, color: "var(--slate)", display: "block", marginBottom: 2 }}>BP (Systolic)</label>
            <Input type="number" value={bpSystolic} onChange={(e) => setBpSystolic(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: 10.5, color: "var(--slate)", display: "block", marginBottom: 2 }}>RBS (mg/dL)</label>
            <Input type="number" value={rbs} onChange={(e) => setRbs(e.target.value)} required />
          </div>

          {/* Auto Triage Badge */}
          <div style={{ background: autoTriage === "RED" ? "#FEF2F2" : autoTriage === "YELLOW" ? "#FEF3C7" : "#DCFCE7", border: `2px solid ${autoTriage === "RED" ? "#DC2626" : autoTriage === "YELLOW" ? "#D97706" : "#16A34A"}`, borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--slate)", display: "block", textTransform: "uppercase" }}>
              Triage Level:
            </span>
            <strong style={{ fontSize: 13, color: autoTriage === "RED" ? "#DC2626" : autoTriage === "YELLOW" ? "#B45309" : "#166534" }}>
              {autoTriage === "RED" ? "🔴 RED (Immediate)" : autoTriage === "YELLOW" ? "🟡 YELLOW (Urgent)" : "🟢 GREEN (Stable)"}
            </strong>
          </div>
        </div>

        {/* Casualty Bed Allocation */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
            Assign Emergency Casualty Bay / Trauma Resus Bed:
          </label>
          <Select value={assignedBay} onChange={(e) => setAssignedBay(e.target.value)}>
            <option value="Bay 1 (Resuscitation Suite)">🚨 Bay 1 - Resuscitation Suite (Ventilator & Crash Cart)</option>
            <option value="Bay 2 (Acute Trauma)">💥 Bay 2 - Acute Trauma Bay</option>
            <option value="Bay 3 (Cardiac / Chest Pain)">❤️ Bay 3 - Cardiac Observation</option>
            <option value="Bay 4 (General Casualty)">🛏️ Bay 4 - General Casualty</option>
            <option value="Bay 5 (General Casualty)">🛏️ Bay 5 - General Casualty</option>
          </Select>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
          <Button ghost type="button" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            style={{ background: autoTriage === "RED" ? "#DC2626" : "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)", color: "#fff", fontWeight: 800 }}
          >
            ⚡ Admit to Casualty Bay
          </Button>
        </div>
      </form>
    </Modal>
  );
}
