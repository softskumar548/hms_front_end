import React, { useState } from "react";
import { Modal, Button, Input, Select } from "../../ui/components";

interface DonorRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newDonorRecord: any) => void;
}

export default function DonorRegistrationModal({
  isOpen,
  onClose,
  onSuccess,
}: DonorRegistrationModalProps) {
  const [donorName, setDonorName] = useState("K. Rajesh Naidu");
  const [age, setAge] = useState("28");
  const [gender, setGender] = useState("male");
  const [aadhaar, setAadhaar] = useState("7812 4589 1234");
  const [phone, setPhone] = useState("9848099887");
  const [bloodGroup, setBloodGroup] = useState("O_POS");
  const [donationType, setDonationType] = useState("VOLUNTARY");

  // Screening Vitals
  const [weight, setWeight] = useState("68");
  const [hemoglobin, setHemoglobin] = useState("14.2");
  const [bpSystolic, setBpSystolic] = useState("120");
  const [bpDiastolic, setBpDiastolic] = useState("80");
  const [pulse, setPulse] = useState("76");

  // Mandatory 5-Serology Checks (NACO Mandate)
  const [hivScreen, setHivScreen] = useState("NON_REACTIVE");
  const [hbsagScreen, setHbsagScreen] = useState("NON_REACTIVE");
  const [hcvScreen, setHcvScreen] = useState("NON_REACTIVE");
  const [vdrlScreen, setVdrlScreen] = useState("NON_REACTIVE");
  const [malariaScreen, setMalariaScreen] = useState("NEGATIVE");

  if (!isOpen) return null;

  const isSerologyClean =
    hivScreen === "NON_REACTIVE" &&
    hbsagScreen === "NON_REACTIVE" &&
    hcvScreen === "NON_REACTIVE" &&
    vdrlScreen === "NON_REACTIVE" &&
    malariaScreen === "NEGATIVE";

  const isVitalsFit = parseFloat(weight) >= 45 && parseFloat(hemoglobin) >= 12.5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSerologyClean) {
      alert("Cannot accept donation: Serology test is reactive / positive.");
      return;
    }

    const donorRecord = {
      id: `dnr-${Date.now()}`,
      donorCode: `DNR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      unitBagNumber: `BB-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      donorName,
      ageGender: `${age}Y / ${gender === "male" ? "Male" : "Female"}`,
      aadhaar,
      phone: `+91 ${phone}`,
      bloodGroup: bloodGroup.replace(/_/g, " "),
      donationType,
      vitals: {
        weight: parseFloat(weight),
        hemoglobin: parseFloat(hemoglobin),
        bp: `${bpSystolic}/${bpDiastolic}`,
        pulse: parseInt(pulse),
      },
      serology: {
        hiv: hivScreen,
        hbsag: hbsagScreen,
        hcv: hcvScreen,
        vdrl: vdrlScreen,
        malaria: malariaScreen,
        certified: true,
      },
      componentsYielded: {
        prbc: `PRBC-${bloodGroup}-${Date.now().toString().slice(-4)}`,
        ffp: `FFP-${bloodGroup}-${Date.now().toString().slice(-4)}`,
        platelets: `PLT-${bloodGroup}-${Date.now().toString().slice(-4)}`,
      },
      donatedAt: new Date().toLocaleDateString("en-IN"),
      status: "SEPARATED_AND_STOCKED",
    };

    onSuccess(donorRecord);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Voluntary Blood Donor Intake & 5-Serology Screen (BB-001)" maxWidth={680}>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, width: "100%", maxWidth: "100%", fontFamily: "var(--font-body)", color: "var(--ink)", boxSizing: "border-box" }}>
        
        {/* Donor Identity */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Donor Full Name
            </label>
            <Input value={donorName} onChange={(e) => setDonorName(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Age (Years)
            </label>
            <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
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

        {/* Aadhaar, Phone & Blood Group */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              12-Digit Indian Aadhaar ID
            </label>
            <Input value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} required placeholder="XXXX XXXX XXXX" />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Mobile (+91)
            </label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Blood Group
            </label>
            <Select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
              <option value="O_POS">O Positive (O+)</option>
              <option value="O_NEG">O Negative (O- STAT)</option>
              <option value="A_POS">A Positive (A+)</option>
              <option value="A_NEG">A Negative (A-)</option>
              <option value="B_POS">B Positive (B+)</option>
              <option value="B_NEG">B Negative (B-)</option>
              <option value="AB_POS">AB Positive (AB+)</option>
              <option value="AB_NEG">AB Negative (AB-)</option>
              <option value="BOMBAY">Bombay Phenotype (hh)</option>
            </Select>
          </div>
        </div>

        {/* Screening Vitals */}
        <div style={{ background: "var(--wash-a)", border: "1px solid var(--line)", padding: 12, borderRadius: 10 }}>
          <strong style={{ fontSize: 11.5, color: "var(--indigo)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
            🩺 Pre-Donation Clinical Fitness Vitals:
          </strong>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            <div>
              <label style={{ fontSize: 10.5, color: "var(--slate)", display: "block", marginBottom: 2 }}>Weight (kg ≥45)</label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} required />
            </div>

            <div>
              <label style={{ fontSize: 10.5, color: "var(--slate)", display: "block", marginBottom: 2 }}>Hemoglobin (g/dL ≥12.5)</label>
              <Input type="number" step="0.1" value={hemoglobin} onChange={(e) => setHemoglobin(e.target.value)} required />
            </div>

            <div>
              <label style={{ fontSize: 10.5, color: "var(--slate)", display: "block", marginBottom: 2 }}>BP (Systolic)</label>
              <Input type="number" value={bpSystolic} onChange={(e) => setBpSystolic(e.target.value)} required />
            </div>

            <div>
              <label style={{ fontSize: 10.5, color: "var(--slate)", display: "block", marginBottom: 2 }}>Pulse (bpm)</label>
              <Input type="number" value={pulse} onChange={(e) => setPulse(e.target.value)} required />
            </div>
          </div>
        </div>

        {/* Mandatory 5-Serology Infection Screening (NACO / CDSCO Mandate) */}
        <div style={{ background: "#FEF2F2", border: "1.5px solid #DC2626", padding: 12, borderRadius: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ fontSize: 12, color: "#DC2626", textTransform: "uppercase" }}>
              🚨 Mandatory 5-Serology Transfusion Safety Tests (NACO / Drugs Act):
            </strong>
            <span style={{ fontSize: 11, background: isSerologyClean ? "#DCFCE7" : "#FEF2F2", color: isSerologyClean ? "#166534" : "#DC2626", padding: "2px 8px", borderRadius: 4, fontWeight: 900 }}>
              {isSerologyClean ? "✓ ALL 5 TESTS NON-REACTIVE" : "⚠️ REACTIVE DEFECT"}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <div>
              <label style={{ fontSize: 10.5, color: "#991B1B", display: "block", marginBottom: 2 }}>1. HIV 1 & 2 ELISA</label>
              <Select value={hivScreen} onChange={(e) => setHivScreen(e.target.value)}>
                <option value="NON_REACTIVE">Non-Reactive (Safe)</option>
                <option value="REACTIVE">Reactive (Unsafe)</option>
              </Select>
            </div>

            <div>
              <label style={{ fontSize: 10.5, color: "#991B1B", display: "block", marginBottom: 2 }}>2. Hepatitis B (HBsAg)</label>
              <Select value={hbsagScreen} onChange={(e) => setHbsagScreen(e.target.value)}>
                <option value="NON_REACTIVE">Non-Reactive (Safe)</option>
                <option value="REACTIVE">Reactive (Unsafe)</option>
              </Select>
            </div>

            <div>
              <label style={{ fontSize: 10.5, color: "#991B1B", display: "block", marginBottom: 2 }}>3. Hepatitis C (HCV)</label>
              <Select value={hcvScreen} onChange={(e) => setHcvScreen(e.target.value)}>
                <option value="NON_REACTIVE">Non-Reactive (Safe)</option>
                <option value="REACTIVE">Reactive (Unsafe)</option>
              </Select>
            </div>

            <div>
              <label style={{ fontSize: 10.5, color: "#991B1B", display: "block", marginBottom: 2 }}>4. Syphilis (VDRL/RPR)</label>
              <Select value={vdrlScreen} onChange={(e) => setVdrlScreen(e.target.value)}>
                <option value="NON_REACTIVE">Non-Reactive (Safe)</option>
                <option value="REACTIVE">Reactive (Unsafe)</option>
              </Select>
            </div>

            <div>
              <label style={{ fontSize: 10.5, color: "#991B1B", display: "block", marginBottom: 2 }}>5. Malaria Parasite (MP)</label>
              <Select value={malariaScreen} onChange={(e) => setMalariaScreen(e.target.value)}>
                <option value="NEGATIVE">Negative (Safe)</option>
                <option value="POSITIVE">Positive (Unsafe)</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Component Separation Preview */}
        <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", padding: 10, borderRadius: 8, fontSize: 12, color: "#166534" }}>
          <strong style={{ display: "block", marginBottom: 4 }}>
            🩸 Automated Component Separation Yield (1 Donation):
          </strong>
          <div style={{ display: "flex", gap: 14, fontWeight: 700 }}>
            <span>✓ 1 Unit PRBC (Packed Red Cells · 350mL)</span>
            <span>✓ 1 Unit FFP (Fresh Frozen Plasma · 200mL)</span>
            <span>✓ 1 Unit Platelets (RDP · 50mL)</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
          <Button ghost type="button" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            style={{ background: "#DC2626", color: "#fff", fontWeight: 800 }}
          >
            🩸 Accept Donation & Stock Components
          </Button>
        </div>
      </form>
    </Modal>
  );
}
