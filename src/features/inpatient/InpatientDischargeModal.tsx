import React, { useState } from "react";
import { Modal, Button, Select } from "../../ui/components";

interface InpatientDischargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bed: any;
  onSuccess: (dischargeData: any) => void;
}

export default function InpatientDischargeModal({
  isOpen,
  onClose,
  bed,
  onSuccess,
}: InpatientDischargeModalProps) {
  const [pharmacyCleared, setPharmacyCleared] = useState(true);
  const [labCleared, setLabCleared] = useState(true);
  const [billingCleared, setBillingCleared] = useState(true);
  const [summaryPrinted, setSummaryPrinted] = useState(true);
  const [disposition, setDisposition] = useState("HOME_RECOVERY");
  const [dischargeAdvice, setDischargeAdvice] = useState("Review in OPD after 7 days; continue prescribed medications.");

  if (!isOpen || !bed) return null;

  const allChecklistCleared = pharmacyCleared && labCleared && billingCleared && summaryPrinted;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allChecklistCleared) return;

    const dischargeData = {
      bedId: bed.id,
      patientName: bed.patientName,
      ipNumber: bed.ipNumber,
      disposition,
      dischargeAdvice,
      dischargeTime: new Date().toISOString(),
    };

    onSuccess(dischargeData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inpatient Discharge & Bed Clearance (IPD-003)" maxWidth={580}>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, width: "100%", maxWidth: "100%", fontFamily: "var(--font-body)", color: "var(--ink)", boxSizing: "border-box" }}>
        
        {/* Admitted Patient Details */}
        <div style={{ background: "var(--wash-a)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
          <strong style={{ fontSize: 14, color: "var(--indigo)", display: "block" }}>
            {bed.patientName} ({bed.ipNumber})
          </strong>
          <span style={{ fontSize: 12, color: "var(--slate)" }}>
            Bed {bed.bedNumber} ({bed.category} · Floor {bed.floor}) · Attending: {bed.doctorName}
          </span>
          <div style={{ fontSize: 11.5, color: "var(--slate)", marginTop: 2 }}>
            Admission Date: {bed.admissionDate ? new Date(bed.admissionDate).toLocaleDateString("en-IN") : "Today"}
          </div>
        </div>

        {/* 4-Point Mandatory Discharge Clearance Checklist */}
        <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 12 }}>
          <strong style={{ fontSize: 12, color: "var(--slate)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>
            Mandatory Discharge Clearance Checklist:
          </strong>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={pharmacyCleared}
                onChange={(e) => setPharmacyCleared(e.target.checked)}
              />
              <span>💊 <strong>Pharmacy Clearance:</strong> Unused medicines returned & medication discharge kit issued</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={labCleared}
                onChange={(e) => setLabCleared(e.target.checked)}
              />
              <span>🔬 <strong>Lab & Radiology Clearance:</strong> All pending investigation reports verified</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={billingCleared}
                onChange={(e) => setBillingCleared(e.target.checked)}
              />
              <span>💳 <strong>Cashier & Billing Settlement:</strong> Final IP invoice settled / Aarogyasri claim dispatched</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={summaryPrinted}
                onChange={(e) => setSummaryPrinted(e.target.checked)}
              />
              <span>📄 <strong>Discharge Summary:</strong> Clinical summary generated & handed over to patient</span>
            </label>
          </div>
        </div>

        {/* Discharge Disposition */}
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
            Discharge Disposition
          </label>
          <Select
            value={disposition}
            onChange={(e) => setDisposition(e.target.value)}
          >
            <option value="HOME_RECOVERY">Discharged Home (Stable Recovery)</option>
            <option value="HIGHER_CENTER_TRANSFER">Transfer to Higher Tertiary Center</option>
            <option value="LAMA">Left Against Medical Advice (LAMA)</option>
            <option value="EXPIRED">Deceased / Mortuary Transfer</option>
          </Select>
        </div>

        {/* Advice on Discharge */}
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
            Discharge Instructions & Follow-up
          </label>
          <textarea
            value={dischargeAdvice}
            onChange={(e) => setDischargeAdvice(e.target.value)}
            rows={2}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "var(--r-field)",
              border: "1px solid var(--line)",
              fontSize: 12.5,
              fontFamily: "var(--font-body)",
            }}
          />
        </div>

        <div style={{ background: "#FEF3C7", border: "1px solid #D97706", padding: 10, borderRadius: 8, fontSize: 11.5, color: "#92400E" }}>
          🧹 <strong>Housekeeping Note:</strong> Bed {bed.bedNumber} will automatically transition to <em>"Housekeeping / Cleaning"</em> state upon discharge clearance.
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
          <Button ghost type="button" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            disabled={!allChecklistCleared}
            style={{ background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)", color: "#fff" }}
          >
            ✓ Complete Discharge & Release Bed
          </Button>
        </div>
      </form>
    </Modal>
  );
}
