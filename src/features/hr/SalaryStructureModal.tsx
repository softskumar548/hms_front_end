import React, { useState } from "react";
import { Modal, Button, Input } from "../../ui/components";

interface SalaryStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: any;
  onSuccess: (updatedStructure: any) => void;
}

export default function SalaryStructureModal({
  isOpen,
  onClose,
  staff,
  onSuccess,
}: SalaryStructureModalProps) {
  const initialMonthlyCtc = staff.salary || 65000;

  const [monthlyCtc, setMonthlyCtc] = useState(String(initialMonthlyCtc));
  const [basicPercent, setBasicPercent] = useState("50");
  const [hraPercent, setHraPercent] = useState("40");
  const [medicalAllowance, setMedicalAllowance] = useState("2500");
  const [dutyAllowance, setDutyAllowance] = useState(staff.role === "doctor" ? "12000" : "3000");
  const [isEpf, setIsEpf] = useState(true);
  const [isEsic, setIsEsic] = useState(initialMonthlyCtc <= 21000);
  const [isPt, setIsPt] = useState(true);
  const [tdsRate, setTdsRate] = useState(initialMonthlyCtc > 75000 ? "10" : "0");

  if (!isOpen || !staff) return null;

  const parsedCtc = parseFloat(monthlyCtc) || 0;
  const basic = Math.floor((parsedCtc * (parseFloat(basicPercent) || 50)) / 100);
  const hra = Math.floor((basic * (parseFloat(hraPercent) || 40)) / 100);
  const med = parseFloat(medicalAllowance) || 0;
  const duty = parseFloat(dutyAllowance) || 0;
  const special = Math.max(0, parsedCtc - basic - hra - med - duty);

  const grossEarnings = basic + hra + med + special + duty;

  const epf = isEpf ? Math.floor(basic * 0.12) : 0;
  const esic = isEsic ? Math.floor(grossEarnings * 0.0075) : 0;
  const pt = isPt ? 200 : 0;
  const tds = Math.floor((grossEarnings * (parseFloat(tdsRate) || 0)) / 100);
  const healthInsurance = 750;

  const totalDeductions = epf + esic + pt + tds + healthInsurance;
  const estimatedNet = grossEarnings - totalDeductions;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      staffId: staff.id,
      monthlyCtc: parsedCtc,
      basicSalary: basic,
      hra,
      medicalAllowance: med,
      specialAllowance: special,
      dutyAllowance: duty,
      isEpfEligible: isEpf,
      isEsicEligible: isEsic,
      epfDeduction: epf,
      esicDeduction: esic,
      tdsDeduction: tds,
      netSalary: estimatedNet,
    };
    onSuccess(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Employee Compensation & CTC (PAY-002)" maxWidth={620}>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, width: "100%", maxWidth: "100%", fontFamily: "var(--font-body)", color: "var(--ink)", boxSizing: "border-box" }}>
        {/* Staff Header */}
        <div style={{ background: "var(--wash-a)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
          <strong style={{ fontSize: 14, color: "var(--indigo)", display: "block" }}>
            {staff.name} ({staff.designation || staff.role})
          </strong>
          <span style={{ fontSize: 12, color: "var(--slate)" }}>
            Department: {staff.department || "Clinical"} · Emp ID: {staff.employeeId || staff.id.slice(0, 8)}
          </span>
        </div>

        {/* Monthly CTC */}
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
            Total Monthly Cost to Company (CTC) (₹)
          </label>
          <Input
            type="number"
            value={monthlyCtc}
            onChange={(e) => setMonthlyCtc(e.target.value)}
            placeholder="65000"
            required
          />
        </div>

        {/* Earnings Split Proportions */}
        <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 12 }}>
          <strong style={{ fontSize: 12, color: "var(--indigo)", display: "block", marginBottom: 8 }}>
            EARNINGS COMPONENT ALLOCATION:
          </strong>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--slate)", display: "block", marginBottom: 2 }}>Basic (% of CTC)</label>
              <Input
                type="number"
                value={basicPercent}
                onChange={(e) => setBasicPercent(e.target.value)}
              />
              <span style={{ fontSize: 11, color: "var(--indigo)", fontWeight: 700 }}>₹{basic.toLocaleString("en-IN")}</span>
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--slate)", display: "block", marginBottom: 2 }}>HRA (% of Basic)</label>
              <Input
                type="number"
                value={hraPercent}
                onChange={(e) => setHraPercent(e.target.value)}
              />
              <span style={{ fontSize: 11, color: "var(--indigo)", fontWeight: 700 }}>₹{hra.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--slate)", display: "block", marginBottom: 2 }}>Medical Allowance (₹)</label>
              <Input
                type="number"
                value={medicalAllowance}
                onChange={(e) => setMedicalAllowance(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--slate)", display: "block", marginBottom: 2 }}>Duty / On-Call Allowance (₹)</label>
              <Input
                type="number"
                value={dutyAllowance}
                onChange={(e) => setDutyAllowance(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Statutory Compliance Checkboxes */}
        <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 12 }}>
          <strong style={{ fontSize: 12, color: "var(--slate)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>
            Statutory Benefits & Deductions:
          </strong>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={isEpf}
                onChange={(e) => setIsEpf(e.target.checked)}
              />
              <span>Provident Fund (EPF 12%) · ₹{epf}</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={isEsic}
                onChange={(e) => setIsEsic(e.target.checked)}
              />
              <span>ESIC (0.75%) · ₹{esic}</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={isPt}
                onChange={(e) => setIsPt(e.target.checked)}
              />
              <span>Professional Tax (₹200)</span>
            </label>

            <div>
              <label style={{ fontSize: 11, color: "var(--slate)", display: "block", marginBottom: 2 }}>TDS Rate (%)</label>
              <Input
                type="number"
                value={tdsRate}
                onChange={(e) => setTdsRate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Live Net Take-Home Projection */}
        <div style={{ background: "#EEF2FF", border: "1px solid var(--indigo)", padding: 12, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--indigo)", textTransform: "uppercase" }}>
              Projected Net Take-Home Salary:
            </span>
            <div style={{ fontSize: 11.5, color: "var(--slate)" }}>Gross ₹{grossEarnings} - Deductions ₹{totalDeductions}</div>
          </div>
          <strong style={{ fontSize: 20, color: "var(--indigo)" }}>
            ₹{estimatedNet.toLocaleString("en-IN")}/mo
          </strong>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
          <Button ghost type="button" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            style={{ background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)", color: "#fff" }}
          >
            💾 Save Compensation Package
          </Button>
        </div>
      </form>
    </Modal>
  );
}
