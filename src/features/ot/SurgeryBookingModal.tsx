import React, { useState } from "react";
import { Modal, Button, Input, Select } from "../../ui/components";

interface SurgeryBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSurgery: any) => void;
}

export default function SurgeryBookingModal({
  isOpen,
  onClose,
  onSuccess,
}: SurgeryBookingModalProps) {
  const [patientName, setPatientName] = useState("K. Venkateswara Rao");
  const [uhid, setUhid] = useState("UHID-2026-90841");
  const [ageGender, setAgeGender] = useState("56Y / Male");
  const [procedure, setProcedure] = useState("Total Knee Arthroplasty (TKR Right)");
  const [specialty, setSpecialty] = useState("Orthopedics");
  const [theatre, setTheatre] = useState("OT-01 (Major Orthopedic & Joints)");
  const [leadSurgeon, setLeadSurgeon] = useState("Dr. V Ramana (Orthopedic Surgeon)");
  const [assistantSurgeon, setAssistantSurgeon] = useState("Dr. Praveen Kumar (Junior Resident)");
  const [anesthesiologist, setAnesthesiologist] = useState("Dr. K R Murali (Chief Anesthesiologist)");
  const [scrubNurse, setScrubNurse] = useState("Sister Sunitha (OT Nurse In-Charge)");
  const [anesthesiaType, setAnesthesiaType] = useState("SPINAL_EPIDURAL");
  const [scheduledDate, setScheduledDate] = useState("29-Aug-2026");
  const [scheduledTime, setScheduledTime] = useState("10:00 AM - 12:30 PM");

  // Pre-Op Checklist Flags
  const [pacCleared, setPacCleared] = useState(true);
  const [consentSigned, setConsentSigned] = useState(true);
  const [npoConfirmed, setNpoConfirmed] = useState(true);
  const [bloodArranged, setBloodArranged] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const surgeryCase = {
      id: `surg-${Date.now()}`,
      otNumber: `OT-2026-${Math.floor(100 + Math.random() * 900)}`,
      patientName,
      patientUhid: uhid,
      ageGender,
      procedure,
      specialty,
      theatre,
      team: {
        leadSurgeon,
        assistantSurgeon,
        anesthesiologist,
        scrubNurse,
      },
      anesthesiaType,
      scheduledDate,
      scheduledTime,
      preOpStatus: {
        pacCleared,
        consentSigned,
        npoConfirmed,
        bloodArranged,
      },
      status: "PRE_OP",
      whoChecklistDone: false,
      aldreteScore: null,
    };

    onSuccess(surgeryCase);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book & Schedule Surgical Case (OT-001)">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, maxWidth: 640, minWidth: 500, fontFamily: "var(--font-body)", color: "var(--ink)" }}>
        
        {/* Patient Details */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Patient Full Name
            </label>
            <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              UHID Number
            </label>
            <Input value={uhid} onChange={(e) => setUhid(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Age / Gender
            </label>
            <Input value={ageGender} onChange={(e) => setAgeGender(e.target.value)} required />
          </div>
        </div>

        {/* Surgical Procedure & Specialty */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Proposed Surgical Procedure
            </label>
            <Input value={procedure} onChange={(e) => setProcedure(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Surgical Specialty
            </label>
            <Select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
              <option value="Orthopedics">🦴 Orthopedics & Joint Replacement</option>
              <option value="General & Laparoscopic">🔪 General & Laparoscopic Surgery</option>
              <option value="Cardiothoracic & Vascular">❤️ Cardiothoracic & Vascular (CTVS)</option>
              <option value="Obstetrics & Gynaecology">👶 Obstetrics & Gynaecology (OBG)</option>
              <option value="Urology">💧 Urology & Kidney Transplant</option>
              <option value="Emergency Trauma">💥 Emergency Trauma Surgery</option>
            </Select>
          </div>
        </div>

        {/* Target Operation Theatre & Slot */}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Assign Operation Theatre Suite
            </label>
            <Select value={theatre} onChange={(e) => setTheatre(e.target.value)}>
              <option value="OT-01 (Major Orthopedic & Joints)">🏥 OT-01 (Major Orthopedic & Joints - Laminar Flow)</option>
              <option value="OT-02 (Advanced Laparoscopic & General)">🏥 OT-02 (Advanced Laparoscopic & 4K Tower)</option>
              <option value="OT-03 (Cardiothoracic & Vascular OT)">🏥 OT-03 (Cardiothoracic & Heart-Lung Machine)</option>
              <option value="OT-04 (Emergency Trauma OT 24/7)">🚨 OT-04 (Emergency Trauma & Crash Suite 24/7)</option>
            </Select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Time Slot
            </label>
            <Select value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)}>
              <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM (Slot 1)</option>
              <option value="10:00 AM - 12:30 PM">10:00 AM - 12:30 PM (Slot 2)</option>
              <option value="01:30 PM - 03:30 PM">01:30 PM - 03:30 PM (Slot 3)</option>
              <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Slot 4)</option>
              <option value="EMERGENCY_STAT">🚨 EMERGENCY STAT SLOT</option>
            </Select>
          </div>
        </div>

        {/* Surgical Team Assignment */}
        <div style={{ background: "var(--wash-a)", border: "1px solid var(--line)", padding: 12, borderRadius: 10 }}>
          <strong style={{ fontSize: 11.5, color: "var(--indigo)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
            👥 Surgical & Anesthesia Team Allocation:
          </strong>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label style={{ fontSize: 10.5, color: "var(--slate)", display: "block", marginBottom: 2 }}>Lead Operating Surgeon</label>
              <Select value={leadSurgeon} onChange={(e) => setLeadSurgeon(e.target.value)}>
                <option value="Dr. V Ramana (Orthopedic Surgeon)">Dr. V Ramana (Senior Ortho Surgeon)</option>
                <option value="Dr. K R Murali (Dean & Surgeon)">Dr. K R Murali (Chief Surgeon)</option>
                <option value="Dr. Sreenivasulu (Cardiologist/CTVS)">Dr. Sreenivasulu (CTVS Surgeon)</option>
              </Select>
            </div>

            <div>
              <label style={{ fontSize: 10.5, color: "var(--slate)", display: "block", marginBottom: 2 }}>Consultant Anesthesiologist</label>
              <Select value={anesthesiologist} onChange={(e) => setAnesthesiologist(e.target.value)}>
                <option value="Dr. K R Murali (Chief Anesthesiologist)">Dr. K R Murali (Chief Anesthesiologist)</option>
                <option value="Dr. Anusha Rao (Consultant Anesthetist)">Dr. Anusha Rao (Consultant Anesthetist)</option>
              </Select>
            </div>

            <div>
              <label style={{ fontSize: 10.5, color: "var(--slate)", display: "block", marginBottom: 2 }}>Assistant Surgeon / Resident</label>
              <Input value={assistantSurgeon} onChange={(e) => setAssistantSurgeon(e.target.value)} />
            </div>

            <div>
              <label style={{ fontSize: 10.5, color: "var(--slate)", display: "block", marginBottom: 2 }}>OT Scrub Nurse In-Charge</label>
              <Input value={scrubNurse} onChange={(e) => setScrubNurse(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Pre-Op Requisites Checklist */}
        <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", padding: 10, borderRadius: 8 }}>
          <strong style={{ fontSize: 11, color: "#166534", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            ✓ Pre-Operative Readiness Verification:
          </strong>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12, color: "#166534", fontWeight: 700 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={pacCleared} onChange={(e) => setPacCleared(e.target.checked)} />
              <span>Pre-Anesthetic Checkup (PAC) Cleared</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={consentSigned} onChange={(e) => setConsentSigned(e.target.checked)} />
              <span>Informed Surgical Consent Signed</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={npoConfirmed} onChange={(e) => setNpoConfirmed(e.target.checked)} />
              <span>NPO 8 Hours Confirmed</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={bloodArranged} onChange={(e) => setBloodArranged(e.target.checked)} />
              <span>2 Units PRBC Reserved in Blood Bank</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
          <Button ghost type="button" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            style={{ background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)", color: "#fff", fontWeight: 800 }}
          >
            📅 Schedule & Lock OT Slot
          </Button>
        </div>
      </form>
    </Modal>
  );
}
