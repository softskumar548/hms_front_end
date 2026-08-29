import React, { useState } from "react";
import { Modal, Button, Input } from "../../ui/components";

interface LabResultEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSuccess: (updatedResult: any) => void;
}

interface AnalyteField {
  name: string;
  key: string;
  value: string;
  unit: string;
  referenceMin: number;
  referenceMax: number;
  panicMin?: number;
  panicMax?: number;
  referenceStr: string;
}

const defaultPanels: Record<string, AnalyteField[]> = {
  "Complete Blood Count (CBC)": [
    { name: "Hemoglobin (Hb)", key: "hb", value: "10.4", unit: "g/dL", referenceMin: 13.0, referenceMax: 17.0, panicMin: 6.0, referenceStr: "13.0 - 17.0" },
    { name: "Total Leukocyte Count (WBC)", key: "wbc", value: "14800", unit: "/mcL", referenceMin: 4000, referenceMax: 11000, panicMax: 30000, referenceStr: "4,000 - 11,000" },
    { name: "Platelet Count", key: "plt", value: "28000", unit: "/mcL", referenceMin: 150000, referenceMax: 450000, panicMin: 30000, referenceStr: "1,50,000 - 4,50,000" },
    { name: "Packed Cell Volume (PCV)", key: "pcv", value: "32.0", unit: "%", referenceMin: 40.0, referenceMax: 50.0, referenceStr: "40.0 - 50.0" },
    { name: "Neutrophils", key: "neutro", value: "78", unit: "%", referenceMin: 40, referenceMax: 75, referenceStr: "40 - 75" },
    { name: "Lymphocytes", key: "lympho", value: "16", unit: "%", referenceMin: 20, referenceMax: 45, referenceStr: "20 - 45" },
  ],
  "Liver Function Test (LFT)": [
    { name: "Total Bilirubin", key: "bili_tot", value: "2.4", unit: "mg/dL", referenceMin: 0.2, referenceMax: 1.2, panicMax: 15.0, referenceStr: "0.2 - 1.2" },
    { name: "Direct Bilirubin", key: "bili_dir", value: "1.1", unit: "mg/dL", referenceMin: 0.0, referenceMax: 0.3, referenceStr: "0.0 - 0.3" },
    { name: "SGOT / AST", key: "ast", value: "85", unit: "U/L", referenceMin: 10, referenceMax: 40, panicMax: 500, referenceStr: "10 - 40" },
    { name: "SGPT / ALT", key: "alt", value: "110", unit: "U/L", referenceMin: 10, referenceMax: 45, panicMax: 500, referenceStr: "10 - 45" },
    { name: "Alkaline Phosphatase (ALP)", key: "alp", value: "145", unit: "U/L", referenceMin: 40, referenceMax: 130, referenceStr: "40 - 130" },
    { name: "Serum Albumin", key: "alb", value: "3.4", unit: "g/dL", referenceMin: 3.5, referenceMax: 5.2, referenceStr: "3.5 - 5.2" },
  ],
  "Renal Function Test (RFT)": [
    { name: "Blood Urea", key: "urea", value: "48", unit: "mg/dL", referenceMin: 15, referenceMax: 45, panicMax: 100, referenceStr: "15 - 45" },
    { name: "Serum Creatinine", key: "creat", value: "3.8", unit: "mg/dL", referenceMin: 0.7, referenceMax: 1.3, panicMax: 5.0, referenceStr: "0.7 - 1.3" },
    { name: "Serum Sodium (Na+)", key: "na", value: "138", unit: "mEq/L", referenceMin: 135, referenceMax: 145, panicMin: 120, panicMax: 160, referenceStr: "135 - 145" },
    { name: "Serum Potassium (K+)", key: "k", value: "6.4", unit: "mEq/L", referenceMin: 3.5, referenceMax: 5.0, panicMin: 2.8, panicMax: 6.2, referenceStr: "3.5 - 5.0" },
  ],
  "Fasting Blood Sugar (FBS)": [
    { name: "Fasting Blood Glucose", key: "fbs", value: "168", unit: "mg/dL", referenceMin: 70, referenceMax: 100, panicMin: 45, panicMax: 400, referenceStr: "70 - 100" },
    { name: "Glycated Hemoglobin (HbA1c)", key: "hba1c", value: "8.4", unit: "%", referenceMin: 4.0, referenceMax: 5.7, referenceStr: "< 5.7%" },
  ],
};

export default function LabResultEntryModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: LabResultEntryModalProps) {
  const panelKey = order?.testName || "Complete Blood Count (CBC)";
  const initialFields = defaultPanels[panelKey] || defaultPanels["Complete Blood Count (CBC)"];

  const [parameters, setParameters] = useState<AnalyteField[]>(initialFields);
  const [comments, setComments] = useState("Values evaluated and verified on automated analyzer. Critical panic thresholds flagged.");

  if (!isOpen || !order) return null;

  const handleValueChange = (index: number, val: string) => {
    const updated = [...parameters];
    updated[index].value = val;
    setParameters(updated);
  };

  const computeFlag = (field: AnalyteField) => {
    const num = parseFloat(field.value);
    if (isNaN(num)) return "NORMAL";

    if (field.panicMin !== undefined && num <= field.panicMin) return "CRITICAL";
    if (field.panicMax !== undefined && num >= field.panicMax) return "CRITICAL";
    if (num < field.referenceMin) return "LOW";
    if (num > field.referenceMax) return "HIGH";
    return "NORMAL";
  };

  const hasCriticalFlag = parameters.some((p) => computeFlag(p) === "CRITICAL");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedParams = parameters.map((p) => ({
      name: p.name,
      value: p.value,
      unit: p.unit,
      reference: p.referenceStr,
      flag: computeFlag(p),
    }));

    const resultPayload = {
      orderId: order.id,
      patientName: order.patientName,
      patientUhid: order.patientUhid,
      ageGender: order.ageGender,
      bedNumber: order.bedNumber,
      doctorName: order.doctorName,
      department: order.department,
      sampleId: order.sampleId || "SMP-8901",
      specimenType: order.specimenType || "Whole Blood (EDTA)",
      testName: order.testName,
      collectedAt: order.collectedAt || "29-Aug-2026 08:30 AM",
      reportedAt: new Date().toLocaleDateString("en-IN") + " " + new Date().toLocaleTimeString("en-IN", { timeStyle: "short" }),
      status: "VERIFIED",
      hasPanicAlert: hasCriticalFlag,
      comments,
      parameters: formattedParams,
    };

    onSuccess(resultPayload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Diagnostic Result Entry: ${panelKey} (RES-001)`}>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, maxWidth: 640, minWidth: 500, fontFamily: "var(--font-body)", color: "var(--ink)" }}>
        
        {/* Patient & Order Header */}
        <div style={{ background: "var(--wash-a)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
          <strong style={{ fontSize: 14, color: "var(--indigo)", display: "block" }}>
            {order.patientName} ({order.ageGender || "48Y / M"}) · UHID: {order.patientUhid || "UHID-90812"}
          </strong>
          <span style={{ fontSize: 12, color: "var(--slate)" }}>
            Sample ID: <strong style={{ fontFamily: "monospace" }}>{order.sampleId || "SMP-8901"}</strong> · Ordered by: {order.doctorName || "Dr. K R Murali"}
          </span>
        </div>

        {/* Panic Banner Alert if critical values detected */}
        {hasCriticalFlag && (
          <div style={{ background: "#FEF2F2", border: "2px solid #DC2626", borderRadius: 10, padding: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🚨</span>
            <div>
              <strong style={{ fontSize: 13, color: "#DC2626", display: "block" }}>
                CRITICAL / PANIC VALUES DETECTED
              </strong>
              <span style={{ fontSize: 11.5, color: "#991B1B" }}>
                Observed analyte value exceeds emergency life-threatening thresholds. Telephonic notification required.
              </span>
            </div>
          </div>
        )}

        {/* Analyte Parameters Entry Form */}
        <div style={{ border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ background: "var(--wash-b)", padding: "8px 12px", fontWeight: 800, fontSize: 12, color: "var(--indigo)", display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr", gap: 8 }}>
            <span>Analyte Parameter</span>
            <span style={{ textAlign: "right" }}>Observed Value</span>
            <span style={{ textAlign: "center" }}>Reference</span>
            <span style={{ textAlign: "center" }}>Flag</span>
          </div>

          <div style={{ padding: "8px 12px", display: "grid", gap: 8, maxHeight: 300, overflowY: "auto" }}>
            {parameters.map((param, idx) => {
              const flag = computeFlag(param);
              const isCrit = flag === "CRITICAL";

              return (
                <div key={param.key} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr", gap: 8, alignItems: "center" }}>
                  <div>
                    <strong style={{ fontSize: 12.5, display: "block" }}>{param.name}</strong>
                    <span style={{ fontSize: 10.5, color: "var(--slate)" }}>Unit: {param.unit}</span>
                  </div>

                  <div>
                    <Input
                      type="text"
                      value={param.value}
                      onChange={(e) => handleValueChange(idx, e.target.value)}
                      style={{
                        textAlign: "right",
                        fontWeight: 700,
                        borderColor: isCrit ? "#DC2626" : flag !== "NORMAL" ? "#D97706" : "var(--line)",
                        background: isCrit ? "#FEF2F2" : "#fff",
                      }}
                      required
                    />
                  </div>

                  <div style={{ fontSize: 11, color: "var(--slate)", textAlign: "center" }}>
                    {param.referenceStr}
                  </div>

                  <div style={{ textAlign: "center" }}>
                    {isCrit ? (
                      <span style={{ background: "#DC2626", color: "#fff", padding: "2px 6px", borderRadius: 4, fontWeight: 900, fontSize: 10 }}>
                        🚨 CRITICAL
                      </span>
                    ) : flag !== "NORMAL" ? (
                      <span style={{ background: "#FEF3C7", color: "#B45309", padding: "2px 6px", borderRadius: 4, fontWeight: 800, fontSize: 10 }}>
                        {flag}
                      </span>
                    ) : (
                      <span style={{ background: "#DCFCE7", color: "#166534", padding: "2px 6px", borderRadius: 4, fontWeight: 700, fontSize: 10 }}>
                        NORMAL
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pathologist Clinical Comments */}
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
            Pathologist Interpretation / Microscopic Notes:
          </label>
          <textarea
            rows={2}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
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
            style={{ background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)", color: "#fff" }}
          >
            ✓ Authorize & Release Verified Report
          </Button>
        </div>
      </form>
    </Modal>
  );
}
