import React, { useState } from "react";
import { Modal, Button, Input, Select } from "../../ui/components";

interface InpatientAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bed: any;
  patients: any[];
  onSuccess: (admissionData: any) => void;
}

const doctorList = [
  { id: "doc-1", name: "Dr. K R Murali (Dean)", dept: "General Medicine" },
  { id: "doc-2", name: "Dr. Sreenivasulu", dept: "Cardiology" },
  { id: "doc-3", name: "Dr. V Ramana", dept: "Orthopedics" },
  { id: "doc-4", name: "Dr. Ananya Reddy", dept: "Pediatrics" },
  { id: "doc-5", name: "Dr. Shanti Kumari", dept: "Obstetrics & Gynaecology" },
  { id: "doc-6", name: "Dr. K. Venkateswarlu", dept: "General & Laparoscopic Surgery" },
];

export default function InpatientAdmissionModal({
  isOpen,
  onClose,
  bed,
  patients,
  onSuccess,
}: InpatientAdmissionModalProps) {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || "");
  const [customPatientName, setCustomPatientName] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorList[0].id);
  const [admissionType, setAdmissionType] = useState("PLANNED_ELECTIVE");
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState("");
  const [advanceDeposit, setAdvanceDeposit] = useState("5000");
  const [kinContact, setKinContact] = useState("9876543210");
  const [kinRelation, setKinRelation] = useState("Spouse / Parent");

  if (!isOpen || !bed) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const matchedPatient = patients.find((p) => p.id === selectedPatientId);
    const patientName = matchedPatient
      ? `${matchedPatient.given_name} ${matchedPatient.family_name}`
      : customPatientName || "Admitted Patient";

    const matchedDoctor = doctorList.find((d) => d.id === selectedDoctorId);

    const admissionData = {
      bedId: bed.id,
      patientId: selectedPatientId,
      patientName,
      doctorName: matchedDoctor?.name || "Dr. K R Murali",
      department: matchedDoctor?.dept || "General Medicine",
      admissionType,
      primaryDiagnosis: primaryDiagnosis || "Acute Clinical Management",
      advanceDeposit: parseFloat(advanceDeposit) || 0,
      admissionDate: new Date().toISOString(),
      ipNumber: `IPD-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
    };

    onSuccess(admissionData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inpatient Ward Bed Admission (IPD-001)">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, maxWidth: 540, minWidth: 440, fontFamily: "var(--font-body)", color: "var(--ink)" }}>
        {/* Target Bed Header */}
        <div style={{ background: "var(--wash-a)", padding: 12, borderRadius: 10, border: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong style={{ fontSize: 14, color: "var(--indigo)" }}>
              Bed: {bed.bedNumber} ({bed.category})
            </strong>
            <span style={{ fontSize: 11.5, color: "var(--slate)", display: "block" }}>
              Floor {bed.floor} · {bed.wing}
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, color: "var(--slate)", display: "block" }}>Daily Tariff:</span>
            <strong style={{ fontSize: 14, color: "#16A34A" }}>₹{bed.tariffPerDay.toLocaleString("en-IN")}/day</strong>
          </div>
        </div>

        {/* Patient Selection */}
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
            Select Patient to Admit
          </label>
          <Select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.given_name} {p.family_name} (Phone: {p.phone || "N/A"}) · {p.id.slice(0, 8)}
              </option>
            ))}
            <option value="custom">+ New Admitted Patient Name</option>
          </Select>
        </div>

        {selectedPatientId === "custom" && (
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
              Patient Full Name
            </label>
            <Input
              value={customPatientName}
              onChange={(e) => setCustomPatientName(e.target.value)}
              placeholder="e.g. Anand Kumar V"
              required
            />
          </div>
        )}

        {/* Admitting Doctor & Department */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
              Admitting Consultant Doctor
            </label>
            <Select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
            >
              {doctorList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.dept.split(" ")[0]})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
              Admission Category
            </label>
            <Select
              value={admissionType}
              onChange={(e) => setAdmissionType(e.target.value)}
            >
              <option value="PLANNED_ELECTIVE">Planned Elective</option>
              <option value="EMERGENCY_CASUALTY">Emergency Casualty</option>
              <option value="ICU_CRITICAL">ICU Critical</option>
              <option value="DAY_CARE">Day Care Surgery</option>
            </Select>
          </div>
        </div>

        {/* Primary Diagnosis */}
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
            Primary Admission Diagnosis / Indication
          </label>
          <Input
            value={primaryDiagnosis}
            onChange={(e) => setPrimaryDiagnosis(e.target.value)}
            placeholder="e.g. Acute Coronary Syndrome, Bilateral Pneumonia, Post-op Recovery..."
            required
          />
        </div>

        {/* Advance Deposit & Next of Kin */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
              Advance Deposit Collected (₹)
            </label>
            <Input
              type="number"
              value={advanceDeposit}
              onChange={(e) => setAdvanceDeposit(e.target.value)}
              placeholder="5000"
            />
          </div>

          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
              Next of Kin Mobile Contact
            </label>
            <Input
              type="tel"
              value={kinContact}
              onChange={(e) => setKinContact(e.target.value)}
              placeholder="9876543210"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
          <Button ghost type="button" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            style={{ background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)", color: "#fff" }}
          >
            🛏️ Confirm Inpatient Admission
          </Button>
        </div>
      </form>
    </Modal>
  );
}
