import React from "react";
import { Modal, Button } from "../../ui/components";
import { useAuth } from "../../auth/AuthProvider";

interface PaySlipPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: any;
  monthYear?: string;
}

export function numberToIndianWords(num: number): string {
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
    "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen ",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num === 0) return "Zero Rupees Only";
  const numStr = ("000000000" + num).substr(-9);
  const crore = parseInt(numStr.substr(0, 2), 10);
  const lakh = parseInt(numStr.substr(2, 2), 10);
  const thousand = parseInt(numStr.substr(4, 2), 10);
  const hundred = parseInt(numStr.substr(6, 1), 10);
  const remaining = parseInt(numStr.substr(7, 2), 10);

  let str = "";
  if (crore !== 0) str += (a[crore] || `${b[Math.floor(crore / 10)]} ${a[crore % 10]}`) + "Crore ";
  if (lakh !== 0) str += (a[lakh] || `${b[Math.floor(lakh / 10)]} ${a[lakh % 10]}`) + "Lakh ";
  if (thousand !== 0) str += (a[thousand] || `${b[Math.floor(thousand / 10)]} ${a[thousand % 10]}`) + "Thousand ";
  if (hundred !== 0) str += a[hundred] + "Hundred ";
  if (remaining !== 0) {
    if (str !== "") str += "and ";
    str += a[remaining] || `${b[Math.floor(remaining / 10)]} ${a[remaining % 10]}`;
  }
  return `Rupees ${str.trim()} Only`;
}

export default function PaySlipPrintModal({
  isOpen,
  onClose,
  staff,
  monthYear = "August 2026",
}: PaySlipPrintModalProps) {
  const { tenant } = useAuth();
  const facilityTitle = tenant ? tenant.replace(/[_|-]/g, " ").toUpperCase() : "ZEN CLINIC HOSPITAL";

  if (!isOpen || !staff) return null;

  const basic = staff.basicSalary || Math.floor(staff.salary * 0.5) || 45000;
  const hra = staff.hra || Math.floor(basic * 0.4) || 18000;
  const medicalAllowance = staff.medicalAllowance || 2500;
  const specialAllowance = staff.specialAllowance || Math.max(0, staff.salary - basic - hra - medicalAllowance) || 9500;
  const dutyAllowance = staff.dutyAllowance || (staff.role === "doctor" ? 12000 : 3000);
  const incentive = staff.incentive || (staff.role === "doctor" ? 8000 : 0);

  const grossEarnings = basic + hra + medicalAllowance + specialAllowance + dutyAllowance + incentive;

  const epf = staff.epfDeduction || (staff.isEpfEligible !== false ? Math.floor(basic * 0.12) : 0);
  const esic = staff.esicDeduction || (grossEarnings <= 21000 ? Math.floor(grossEarnings * 0.0075) : 0);
  const professionalTax = 200;
  const tds = staff.tdsDeduction || (grossEarnings > 75000 ? Math.floor(grossEarnings * 0.1) : 0);
  const healthInsurance = 750;
  const lopDeduction = staff.lopDays ? Math.floor((grossEarnings / 30) * staff.lopDays) : 0;

  const totalDeductions = epf + esic + professionalTax + tds + healthInsurance + lopDeduction;
  const netTakeHome = grossEarnings - totalDeductions;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official Employee Pay Slip (PAY-001)">
      <div style={{ maxWidth: 840, minWidth: 720, fontFamily: "var(--font-body)", color: "var(--ink)" }}>
        
        {/* Print & Action Controls Bar */}
        <div
          className="no-print"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            background: "var(--wash-a)",
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid var(--line)",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--indigo)", fontWeight: 700 }}>
            🖨️ A4 Ready Printable Staff Pay Slip · {monthYear}
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <Button ghost onClick={onClose}>Close</Button>
            <Button
              onClick={handlePrint}
              style={{ background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)", color: "#fff" }}
            >
              🖨️ Print Official Pay Slip (A4)
            </Button>
          </div>
        </div>

        {/* PRINTABLE A4 PAY SLIP CONTAINER */}
        <div
          className="payslip-print-container"
          style={{
            background: "#ffffff",
            border: "1px solid var(--line)",
            padding: "32px 38px",
            borderRadius: 14,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            fontSize: 12.5,
          }}
        >
          {/* Hospital Letterhead Header */}
          <div style={{ borderBottom: "3px solid var(--indigo)", paddingBottom: 12, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 24 }}>🏥</span>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--indigo)", margin: 0, textTransform: "uppercase" }}>
                  {facilityTitle}
                </h1>
              </div>
              <span style={{ fontSize: 11.5, color: "var(--slate)", display: "block", marginTop: 2 }}>
                Health City, Arilova, Visakhapatnam, Andhra Pradesh · PIN: 530040 · Ph: +91 891 2548900
              </span>
              <span style={{ fontSize: 11, color: "var(--indigo)", fontWeight: 700 }}>
                GSTIN: 37AAAAZ9812K1Z5 · ABDM Facility ID: AP-HFR-2026-90214 · Registered Hospital
              </span>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ background: "var(--indigo-soft)", color: "var(--indigo)", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 800, textTransform: "uppercase", display: "inline-block", marginBottom: 4 }}>
                SALARY PAY SLIP
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>
                Pay Period: <strong>{monthYear}</strong>
              </div>
              <div style={{ fontSize: 11, color: "var(--slate)" }}>
                Disbursement: 31-Aug-2026
              </div>
            </div>
          </div>

          {/* Employee Demographic & Bank Details Grid */}
          <div style={{ background: "var(--wash-a)", padding: 14, borderRadius: 10, border: "1px solid var(--line)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 10.5, color: "var(--slate)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Employee Name</span>
              <strong style={{ fontSize: 13, color: "var(--indigo)" }}>{staff.name}</strong>
              <span style={{ fontSize: 11, color: "var(--slate)", display: "block" }}>
                ID: <strong style={{ fontFamily: "monospace" }}>{staff.employeeId || `EMP-${staff.id.slice(0, 5).toUpperCase()}`}</strong>
              </span>
            </div>

            <div>
              <span style={{ fontSize: 10.5, color: "var(--slate)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Designation & Dept</span>
              <div style={{ fontWeight: 700, fontSize: 12.5 }}>{staff.designation || staff.role}</div>
              <span style={{ fontSize: 11, color: "var(--slate)" }}>{staff.department || "Clinical Operations"}</span>
            </div>

            <div>
              <span style={{ fontSize: 10.5, color: "var(--slate)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Medical Reg No / Aadhaar</span>
              <div style={{ fontWeight: 700, fontSize: 12 }}>{staff.regNo || "APMC-2026-98124"}</div>
              <span style={{ fontSize: 11, color: "var(--slate)" }}>Aadhaar: XXXX XXXX 9812</span>
            </div>

            <div>
              <span style={{ fontSize: 10.5, color: "var(--slate)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Bank Account & IFSC</span>
              <div style={{ fontWeight: 700, fontSize: 12 }}>HDFC Bank · A/C: 5010048912891</div>
              <span style={{ fontSize: 11, color: "var(--slate)", fontFamily: "monospace" }}>IFSC: HDFC0001248</span>
            </div>

            <div>
              <span style={{ fontSize: 10.5, color: "var(--slate)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>PAN & UAN (EPF)</span>
              <div style={{ fontWeight: 700, fontSize: 12, fontFamily: "monospace" }}>PAN: ABCPM9812K</div>
              <span style={{ fontSize: 11, color: "var(--slate)", fontFamily: "monospace" }}>UAN: 100982348912</span>
            </div>

            <div>
              <span style={{ fontSize: 10.5, color: "var(--slate)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>Attendance / Days</span>
              <div style={{ fontWeight: 700, fontSize: 12 }}>
                Paid Days: {31 - (staff.lopDays || 0)} / 31 Days
              </div>
              <span style={{ fontSize: 11, color: staff.lopDays ? "#DC2626" : "var(--slate)" }}>
                LOP (Loss of Pay): {staff.lopDays || 0} Days
              </span>
            </div>
          </div>

          {/* Side-by-Side Earnings vs Deductions Table */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            {/* Earnings Column */}
            <div style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ background: "var(--wash-b)", padding: "8px 12px", fontWeight: 800, fontSize: 12, color: "var(--indigo)", display: "flex", justifyContent: "space-between" }}>
                <span>EARNINGS (ఆదాయాలు)</span>
                <span>AMOUNT (₹)</span>
              </div>
              <div style={{ padding: "6px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>Basic Salary (మూల వేతనం)</span>
                  <strong>₹{basic.toLocaleString("en-IN")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>House Rent Allowance (HRA)</span>
                  <strong>₹{hra.toLocaleString("en-IN")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>Medical Allowance</span>
                  <strong>₹{medicalAllowance.toLocaleString("en-IN")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>Special & Dearness Allowance</span>
                  <strong>₹{specialAllowance.toLocaleString("en-IN")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>Night / On-Call Duty Allowance</span>
                  <strong>₹{dutyAllowance.toLocaleString("en-IN")}</strong>
                </div>
                {incentive > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                    <span>Clinical OPD Incentive Share</span>
                    <strong>₹{incentive.toLocaleString("en-IN")}</strong>
                  </div>
                )}
              </div>
              <div style={{ background: "var(--wash-a)", borderTop: "1px solid var(--line)", padding: "8px 12px", display: "flex", justifyContent: "space-between", fontWeight: 800, color: "var(--indigo)" }}>
                <span>TOTAL GROSS EARNINGS (A):</span>
                <span>₹{grossEarnings.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Deductions Column */}
            <div style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ background: "var(--wash-b)", padding: "8px 12px", fontWeight: 800, fontSize: 12, color: "#991B1B", display: "flex", justifyContent: "space-between" }}>
                <span>DEDUCTIONS (మినహాయింపులు)</span>
                <span>AMOUNT (₹)</span>
              </div>
              <div style={{ padding: "6px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>Provident Fund (EPF 12%)</span>
                  <strong>₹{epf.toLocaleString("en-IN")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>ESIC Contribution (0.75%)</span>
                  <strong>₹{esic.toLocaleString("en-IN")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>Professional Tax (AP PT)</span>
                  <strong>₹{professionalTax.toLocaleString("en-IN")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>Income Tax (TDS)</span>
                  <strong>₹{tds.toLocaleString("en-IN")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span>Staff Group Health Insurance</span>
                  <strong>₹{healthInsurance.toLocaleString("en-IN")}</strong>
                </div>
                {lopDeduction > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", color: "#DC2626" }}>
                    <span>Loss of Pay ({staff.lopDays} Days)</span>
                    <strong>₹{lopDeduction.toLocaleString("en-IN")}</strong>
                  </div>
                )}
              </div>
              <div style={{ background: "var(--wash-a)", borderTop: "1px solid var(--line)", padding: "8px 12px", display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#991B1B" }}>
                <span>TOTAL DEDUCTIONS (B):</span>
                <span>₹{totalDeductions.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* NET TAKE HOME SALARY HIGHLIGHT BOX */}
          <div style={{ background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)", border: "2px solid var(--indigo)", borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--indigo)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
                NET TAKE-HOME SALARY PAYABLE (A - B)
              </span>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", marginTop: 2 }}>
                {numberToIndianWords(netTakeHome)}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <strong style={{ fontSize: 26, color: "var(--indigo)", fontWeight: 900 }}>
                ₹{netTakeHome.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          {/* Signatory & Digital Stamp Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px dashed var(--line)", paddingTop: 14 }}>
            <div style={{ fontSize: 11, color: "var(--slate)", maxWidth: 360 }}>
              <div>Confidential computer-generated payroll advice. No physical signature required.</div>
              <div style={{ fontFamily: "monospace", letterSpacing: 3, marginTop: 4, fontWeight: 700 }}>
                ||| |||| | ||||| |||| |||
              </div>
            </div>

            <div style={{ textAlign: "center", width: 200 }}>
              <div style={{ height: 30 }}></div>
              <strong style={{ fontSize: 12.5, color: "var(--indigo)", display: "block" }}>
                Authorized HR Signatory
              </strong>
              <div style={{ fontSize: 11, color: "var(--slate)" }}>
                Hospital Accounts & Payroll Dept
              </div>
            </div>
          </div>
        </div>

        {/* Embedded Print CSS */}
        <style>{`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              background: #fff !important;
            }
            .payslip-print-container {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
            }
          }
        `}</style>
      </div>
    </Modal>
  );
}
