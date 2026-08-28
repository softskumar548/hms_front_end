import React, { useState } from "react";
import { Modal, Button, Input, Select } from "../../ui/components";

interface WardTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceBed: any;
  availableBeds: any[];
  onSuccess: (transferData: any) => void;
}

const transferReasons = [
  "Step-Down from ICU to General/Semi-Private Ward (Patient Hemodynamically Stable)",
  "Clinical Escalation / Urgent ICU Ventilator Transfer",
  "Patient / Attendant Request for Deluxe Private Room Upgrade",
  "Post-Operative Recovery Room Transfer to Ward",
  "Infection Control & Medical Isolation Protocol",
  "Bed Maintenance / Sanitization Relocation",
];

export default function WardTransferModal({
  isOpen,
  onClose,
  sourceBed,
  availableBeds,
  onSuccess,
}: WardTransferModalProps) {
  const [targetBedId, setTargetBedId] = useState(availableBeds[0]?.id || "");
  const [transferReason, setTransferReason] = useState(transferReasons[0]);
  const [nurseNotes, setNurseNotes] = useState("");
  const [transferringStaff, setTransferringStaff] = useState("Staff Nurse Lakshmi (Ward 2)");

  if (!isOpen || !sourceBed) return null;

  const targetBed = availableBeds.find((b) => b.id === targetBedId) || availableBeds[0];

  const sourceTariff = sourceBed.tariffPerDay || 0;
  const targetTariff = targetBed?.tariffPerDay || 0;
  const tariffDifference = targetTariff - sourceTariff;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBed) return;

    const transferData = {
      sourceBedId: sourceBed.id,
      targetBedId: targetBed.id,
      patientName: sourceBed.patientName,
      ipNumber: sourceBed.ipNumber,
      admissionDate: sourceBed.admissionDate,
      doctorName: sourceBed.doctorName,
      department: sourceBed.department,
      primaryDiagnosis: sourceBed.primaryDiagnosis,
      transferReason,
      nurseNotes,
      transferringStaff,
      tariffDifference,
      timestamp: new Date().toISOString(),
    };

    onSuccess(transferData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inpatient Bed Shift & Ward Transfer (IPD-002)">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, maxWidth: 560, minWidth: 460, fontFamily: "var(--font-body)", color: "var(--ink)" }}>
        
        {/* Patient & Source Bed Summary */}
        <div style={{ background: "var(--wash-a)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <strong style={{ fontSize: 14, color: "var(--indigo)" }}>
              {sourceBed.patientName} ({sourceBed.ipNumber})
            </strong>
            <span style={{ fontSize: 11, background: "#FEF2F2", color: "#DC2626", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>
              CURRENT OCCUPANCY
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--slate)" }}>
            Current Bed: <strong>{sourceBed.bedNumber}</strong> ({sourceBed.category} · Floor {sourceBed.floor}) · Current Tariff: <strong>₹{sourceTariff.toLocaleString("en-IN")}/day</strong>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--slate)", marginTop: 2 }}>
            Consultant: {sourceBed.doctorName} · Diagnosis: {sourceBed.primaryDiagnosis}
          </div>
        </div>

        {/* Target Bed Selector */}
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
            Select Target Destination Bed
          </label>
          {availableBeds.length === 0 ? (
            <div style={{ padding: 12, background: "#FEF2F2", color: "#DC2626", borderRadius: 8, fontSize: 12 }}>
              ⚠️ No vacant beds available in the hospital. Please discharge or transfer an existing patient.
            </div>
          ) : (
            <Select
              value={targetBedId}
              onChange={(e) => setTargetBedId(e.target.value)}
            >
              {availableBeds.map((b) => (
                <option key={b.id} value={b.id}>
                  Bed {b.bedNumber} — {b.category} (Floor {b.floor} · {b.wing}) · ₹{b.tariffPerDay.toLocaleString("en-IN")}/day
                </option>
              ))}
            </Select>
          )}
        </div>

        {/* Daily Tariff Adjustment Card */}
        {targetBed && (
          <div
            style={{
              background: tariffDifference === 0 ? "#F8FAFC" : tariffDifference > 0 ? "#FFFBEB" : "#F0FDF4",
              border: `1px solid ${tariffDifference === 0 ? "#CBD5E1" : tariffDifference > 0 ? "#D97706" : "#16A34A"}`,
              padding: 12,
              borderRadius: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--slate)" }}>
                Daily Room Tariff Adjustment:
              </span>
              <div style={{ fontSize: 12, color: "var(--ink)", marginTop: 2 }}>
                From ₹{sourceTariff.toLocaleString("en-IN")} → To ₹{targetTariff.toLocaleString("en-IN")}/day
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <strong
                style={{
                  fontSize: 15,
                  color: tariffDifference === 0 ? "var(--ink)" : tariffDifference > 0 ? "#D97706" : "#16A34A",
                }}
              >
                {tariffDifference === 0
                  ? "No Tariff Change (₹0)"
                  : tariffDifference > 0
                  ? `+₹${tariffDifference.toLocaleString("en-IN")}/day Upgrade`
                  : `-₹${Math.abs(tariffDifference).toLocaleString("en-IN")}/day Step-down`}
              </strong>
            </div>
          </div>
        )}

        {/* Transfer Indication / Reason */}
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
            Clinical Transfer Indication
          </label>
          <Select
            value={transferReason}
            onChange={(e) => setTransferReason(e.target.value)}
          >
            {transferReasons.map((r, idx) => (
              <option key={idx} value={r}>{r}</option>
            ))}
          </Select>
        </div>

        {/* Transfer Notes */}
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
            Nurse Handover & Clinical Transfer Notes
          </label>
          <textarea
            value={nurseNotes}
            onChange={(e) => setNurseNotes(e.target.value)}
            placeholder="Document patient vitals before transfer, IV lines status, oxygen support, belongings handover..."
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

        {/* Transferring Staff */}
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
            Transferring Nurse / Staff
          </label>
          <Input
            value={transferringStaff}
            onChange={(e) => setTransferringStaff(e.target.value)}
            placeholder="Staff Nurse Lakshmi"
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
          <Button ghost type="button" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            disabled={availableBeds.length === 0}
            style={{ background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)", color: "#fff" }}
          >
            🔀 Confirm Ward & Bed Shift
          </Button>
        </div>
      </form>
    </Modal>
  );
}
