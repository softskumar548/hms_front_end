import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Input, Select, StatusPill, Toast } from "../../ui/components";
import PaySlipPrintModal from "./PaySlipPrintModal";
import SalaryStructureModal from "./SalaryStructureModal";

export interface HospitalEmployee {
  id: string;
  employeeId: string;
  name: string;
  role: "doctor" | "nurse" | "receptionist" | "billing" | "admin" | "lab_tech" | "pharmacist";
  designation: string;
  department: string;
  regNo?: string;
  phone: string;
  email: string;
  joiningDate: string;
  salary: number; // Monthly CTC
  basicSalary?: number;
  hra?: number;
  medicalAllowance?: number;
  specialAllowance?: number;
  dutyAllowance?: number;
  incentive?: number;
  isEpfEligible?: boolean;
  isEsicEligible?: boolean;
  epfDeduction?: number;
  esicDeduction?: number;
  tdsDeduction?: number;
  presentDays: number;
  lopDays: number;
  nightShifts: number;
  leaveStatus?: string;
  paymentStatus: "PAID" | "PENDING" | "ON_HOLD";
}

interface LeaveRequest {
  id: string;
  staffName: string;
  role: string;
  leaveType: "Casual Leave" | "Sick Leave" | "Earned Leave" | "Maternity Leave";
  dates: string;
  days: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export default function HospitalHRScreen() {
  const { tenant } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "payroll"; // payroll, attendance, salary-structure, payslips

  const [staffList, setStaffList] = useState<HospitalEmployee[]>(() => {
    const saved = localStorage.getItem(`hms-staff-roster-${tenant || "default"}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem(`hms-leave-requests-${tenant || "default"}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedMonth, setSelectedMonth] = useState("August 2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPayrollLocked, setIsPayrollLocked] = useState(false);

  const saveStaffList = (nextStaff: HospitalEmployee[]) => {
    setStaffList(nextStaff);
    localStorage.setItem(`hms-staff-roster-${tenant || "default"}`, JSON.stringify(nextStaff));
  };

  const saveLeaveRequests = (nextLeaves: LeaveRequest[]) => {
    setLeaveRequests(nextLeaves);
    localStorage.setItem(`hms-leave-requests-${tenant || "default"}`, JSON.stringify(nextLeaves));
  };

  // Modals state
  const [paySlipModalOpen, setPaySlipModalOpen] = useState(false);
  const [selectedStaffForPaySlip, setSelectedStaffForPaySlip] = useState<HospitalEmployee | null>(null);

  const [salaryStructureModalOpen, setSalaryStructureModalOpen] = useState(false);
  const [selectedStaffForStructure, setSelectedStaffForStructure] = useState<HospitalEmployee | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleTabChange = (tabKey: string) => {
    setSearchParams({ tab: tabKey });
  };

  // Metrics
  const totalEmployees = staffList.length;
  const totalPayrollLiability = staffList.reduce((acc, s) => acc + s.salary, 0);
  const totalEpf = staffList.reduce((acc, s) => acc + (s.epfDeduction || 0), 0);
  const totalEsic = staffList.reduce((acc, s) => acc + (s.esicDeduction || 0), 0);
  const totalPt = staffList.length * 200;
  const totalTds = staffList.reduce((acc, s) => acc + (s.tdsDeduction || 0), 0);
  const totalStatutoryDeductions = totalEpf + totalEsic + totalPt + totalTds;
  const totalNetPayout = totalPayrollLiability - totalStatutoryDeductions;
  const pendingLeavesCount = leaveRequests.filter((l) => l.status === "PENDING").length;

  const filteredStaff = staffList.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.designation.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.employeeId.toLowerCase().includes(q)
    );
  });

  // Handle Salary Structure Update
  const handleSalaryStructureSuccess = (updated: any) => {
    const nextStaff = staffList.map((s) =>
      s.id === updated.staffId
        ? {
            ...s,
            salary: updated.monthlyCtc,
            basicSalary: updated.basicSalary,
            hra: updated.hra,
            medicalAllowance: updated.medicalAllowance,
            specialAllowance: updated.specialAllowance,
            dutyAllowance: updated.dutyAllowance,
            isEpfEligible: updated.isEpfEligible,
            isEsicEligible: updated.isEsicEligible,
            epfDeduction: updated.epfDeduction,
            esicDeduction: updated.esicDeduction,
            tdsDeduction: updated.tdsDeduction,
          }
        : s
    );
    saveStaffList(nextStaff);
    setSalaryStructureModalOpen(false);
    triggerToast("Salary compensation package updated successfully.");
  };

  // Handle Leave Approval
  const handleApproveLeave = (id: string) => {
    const next = leaveRequests.map((l) => (l.id === id ? { ...l, status: "APPROVED" as const } : l));
    saveLeaveRequests(next);
    triggerToast("Leave request approved.");
  };

  const handleRejectLeave = (id: string) => {
    const next = leaveRequests.map((l) => (l.id === id ? { ...l, status: "REJECTED" as const } : l));
    saveLeaveRequests(next);
    triggerToast("Leave request rejected.");
  };

  // Export Bank NEFT CMS Ledger
  const handleExportNeftLedger = () => {
    const csvHeader = "Beneficiary Name,Account Number,IFSC Code,Amount (INR),Transaction Remarks,Email\n";
    const csvRows = staffList
      .map(
        (s) =>
          `"${s.name}","5010048912891","HDFC0001248",${s.salary - (s.epfDeduction || 0) - (s.tdsDeduction || 0) - 200},"SALARY ${selectedMonth.toUpperCase()}","${s.email}"`
      )
      .join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Hospital_Salary_NEFT_Batch_${selectedMonth.replace(" ", "_")}.csv`;
    a.click();
    triggerToast("Bank NEFT CMS Payout ledger downloaded.");
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Top Cyan Breadcrumb Banner */}
      <div
        style={{
          background: "#00BCD4",
          borderRadius: "14px 14px 0 0",
          padding: "12px 20px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>👥</span>
          <span>Hospital Human Resources (HR) & Automated Payroll Engine</span>
        </div>
        <div style={{ fontSize: 12, background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20 }}>
          {tenant ? `${tenant.replace("_", " ")} Hospital` : "ZEN CLINIC"} · Indian Statutory Compliance (EPF/ESIC/PT)
        </div>
      </div>

      {/* 5 Top HR KPI Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <Card style={{ borderLeft: "4px solid var(--indigo)", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Total Active Staff</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>{totalEmployees}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>4 Doctors · 4 Staff</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #F59E0B", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Monthly CTC Liability</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#D97706" }}>₹{(totalPayrollLiability / 100000).toFixed(2)}L</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>{selectedMonth}</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #8B5CF6", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Statutory Deductions</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#8B5CF6" }}>₹{(totalStatutoryDeductions / 1000).toFixed(1)}k</strong>
            <span style={{ fontSize: 11, color: "var(--slate)" }}>EPF+ESIC+PT+TDS</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #16A34A", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Net Bank Disbursement</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#16A34A" }}>₹{(totalNetPayout / 100000).toFixed(2)}L</strong>
            <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>NEFT Ready</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #00BCD4", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Leave Applications</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>{pendingLeavesCount}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Awaiting Approval</span>
          </div>
        </Card>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", gap: 10, borderBottom: "2px solid var(--line)", paddingBottom: 6 }}>
        {[
          { key: "payroll", label: "💵 Monthly Payroll Run", icon: "💵" },
          { key: "attendance", label: "📅 Attendance & Leave Desk", icon: "📅" },
          { key: "salary-structure", label: "💼 Salary Structure & CTC", icon: "💼" },
          { key: "payslips", label: "📄 Employee Pay Slips", icon: "📄" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            style={{
              padding: "10px 18px",
              borderRadius: "10px 10px 0 0",
              border: "none",
              background: activeTab === tab.key ? "var(--indigo)" : "transparent",
              color: activeTab === tab.key ? "#ffffff" : "var(--slate)",
              fontWeight: 800,
              fontSize: 13.5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s ease",
            }}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: MONTHLY PAYROLL RUN & BATCH DISBURSEMENT */}
      {activeTab === "payroll" && (
        <div style={{ display: "grid", gap: 18 }}>
          <Card style={{ borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)" }}>Payroll Month:</label>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{ width: 180, fontWeight: 700 }}
                >
                  <option value="August 2026">August 2026</option>
                  <option value="July 2026">July 2026</option>
                  <option value="June 2026">June 2026</option>
                </Select>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <Button
                  type="button"
                  onClick={handleExportNeftLedger}
                  style={{ background: "#EEF2FF", border: "1px solid var(--indigo)", color: "var(--indigo)" }}
                >
                  📥 Export Bank NEFT CMS (.csv)
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    setIsPayrollLocked(true);
                    triggerToast(`Payroll batch for ${selectedMonth} locked and approved for bank payout.`);
                  }}
                  style={{ background: isPayrollLocked ? "#16A34A" : "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)", color: "#fff" }}
                >
                  {isPayrollLocked ? "🔒 Payroll Batch Locked" : "🔒 Finalize & Lock Monthly Batch"}
                </Button>
              </div>
            </div>

            {/* Payroll Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                    <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Employee</th>
                    <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Designation & Dept</th>
                    <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Gross CTC (₹)</th>
                    <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Days / LOP</th>
                    <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Statutory Deductions</th>
                    <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Net Take-Home (₹)</th>
                    <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Status</th>
                    <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "36px 14px", color: "var(--slate)", fontStyle: "italic" }}>
                        No staff members configured in hospital payroll. Add personnel in User & Staff Directory to run payroll.
                      </td>
                    </tr>
                  ) : (
                    staffList.map((s) => {
                      const basic = s.basicSalary || Math.floor(s.salary * 0.5);
                      const epf = s.epfDeduction || 0;
                      const esic = s.esicDeduction || 0;
                      const tds = s.tdsDeduction || 0;
                      const pt = 200;
                      const totalDed = epf + esic + pt + tds + 750;
                      const netSalary = s.salary - totalDed;

                      return (
                        <tr key={s.id} style={{ borderBottom: "1px solid var(--line)" }}>
                          <td style={{ padding: "12px 14px" }}>
                            <strong style={{ display: "block", color: "var(--ink)", fontSize: 13.5 }}>{s.name}</strong>
                            <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--indigo)" }}>{s.employeeId}</span>
                          </td>

                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ fontWeight: 600 }}>{s.designation}</div>
                            <span style={{ fontSize: 11.5, color: "var(--slate)" }}>{s.department}</span>
                          </td>

                          <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700 }}>
                            ₹{s.salary.toLocaleString("en-IN")}
                          </td>

                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            <span style={{ fontWeight: 700 }}>{s.presentDays}d</span>
                            {s.lopDays > 0 && (
                              <span style={{ fontSize: 11, color: "#DC2626", display: "block" }}>
                                -{s.lopDays}d LOP
                              </span>
                            )}
                          </td>

                          <td style={{ padding: "12px 14px", textAlign: "right", fontSize: 12 }}>
                            <span style={{ color: "#991B1B", fontWeight: 700 }}>-₹{totalDed.toLocaleString("en-IN")}</span>
                            <span style={{ fontSize: 10.5, color: "var(--slate)", display: "block" }}>
                              EPF: ₹{epf} · TDS: ₹{tds}
                            </span>
                          </td>

                          <td style={{ padding: "12px 14px", textAlign: "right" }}>
                            <strong style={{ fontSize: 14, color: "#16A34A" }}>
                              ₹{netSalary.toLocaleString("en-IN")}
                            </strong>
                          </td>

                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            <StatusPill kind={s.paymentStatus === "PAID" ? "success" : s.paymentStatus === "PENDING" ? "warn" : "info"}>
                              {s.paymentStatus}
                            </StatusPill>
                          </td>

                          <td style={{ padding: "12px 14px", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: 6 }}>
                              <Button
                                type="button"
                                onClick={() => {
                                  setSelectedStaffForPaySlip(s);
                                  setPaySlipModalOpen(true);
                                }}
                                style={{ fontSize: 11.5, padding: "5px 10px" }}
                              >
                                🖨️ Pay Slip
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: ATTENDANCE & LEAVE DESK */}
      {activeTab === "attendance" && (
        <div style={{ display: "grid", gap: 18 }}>
          {/* Leave Approvals Queue */}
          <Card style={{ borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                  📋 Pending Staff Leave Applications
                </h3>
                <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                  Review and authorize doctor & nursing duty leaves
                </span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, background: "#EEF2FF", color: "var(--indigo)", padding: "4px 12px", borderRadius: 20 }}>
                {pendingLeavesCount} Pending Review
              </span>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {leaveRequests.length === 0 ? (
                <div style={{ textAlign: "center", padding: "28px 14px", background: "var(--wash-a)", borderRadius: 12, border: "1px dashed var(--line)", color: "var(--slate)", fontStyle: "italic" }}>
                  No pending leave applications.
                </div>
              ) : (
                leaveRequests.map((l) => (
                  <div
                    key={l.id}
                    style={{
                      background: "var(--wash-a)",
                      border: "1px solid var(--line)",
                      padding: "12px 16px",
                      borderRadius: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <strong style={{ fontSize: 14, color: "var(--ink)" }}>{l.staffName}</strong>
                        <span style={{ fontSize: 11.5, background: "var(--indigo-soft)", color: "var(--indigo)", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>
                          {l.leaveType}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--slate)" }}>({l.days} Days · {l.dates})</span>
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--slate)" }}>
                        Reason: <em>"{l.reason}"</em>
                      </p>
                    </div>

                    <div>
                      {l.status === "PENDING" ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <Button
                            type="button"
                            onClick={() => handleApproveLeave(l.id)}
                            style={{ background: "#16A34A", color: "#fff", fontSize: 12, padding: "6px 14px" }}
                          >
                            ✓ Approve Leave
                          </Button>
                          <Button
                            type="button"
                            ghost
                            onClick={() => handleRejectLeave(l.id)}
                            style={{ borderColor: "#DC2626", color: "#DC2626", fontSize: 12, padding: "6px 12px" }}
                          >
                            ✕ Reject
                          </Button>
                        </div>
                      ) : (
                        <StatusPill kind={l.status === "APPROVED" ? "success" : "danger"}>
                          {l.status}
                        </StatusPill>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Monthly Attendance Table */}
          <Card style={{ borderRadius: 16 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
              📊 Monthly Duty & Attendance Summary ({selectedMonth})
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                    <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Staff Member</th>
                    <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Total Days</th>
                    <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Present</th>
                    <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Approved Leaves</th>
                    <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Loss of Pay</th>
                    <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Night / On-Call Shifts</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "36px 14px", color: "var(--slate)", fontStyle: "italic" }}>
                        No staff attendance recorded for {selectedMonth}.
                      </td>
                    </tr>
                  ) : (
                    staffList.map((s) => (
                      <tr key={s.id} style={{ borderBottom: "1px solid var(--line)" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <strong style={{ display: "block", color: "var(--ink)" }}>{s.name}</strong>
                          <span style={{ fontSize: 11.5, color: "var(--slate)" }}>{s.designation}</span>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>31 Days</td>
                        <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, color: "#16A34A" }}>{s.presentDays} Days</td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>{31 - s.presentDays - s.lopDays} Days</td>
                        <td style={{ padding: "12px 14px", textAlign: "center", color: s.lopDays > 0 ? "#DC2626" : "var(--slate)", fontWeight: s.lopDays > 0 ? 700 : 400 }}>
                          {s.lopDays} Days
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, color: "var(--indigo)" }}>
                          🌙 {s.nightShifts} Shifts
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: SALARY STRUCTURE & CTC CONFIGURATOR */}
      {activeTab === "salary-structure" && (
        <div style={{ display: "grid", gap: 18 }}>
          <Card style={{ borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                  💼 Staff Compensation Structures (CTC Breakdown)
                </h3>
                <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                  Configure Basic, HRA, Medical Allowance, and Indian Statutory EPF / ESIC Enrollment
                </span>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                    <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Staff / Designation</th>
                    <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Monthly CTC (₹)</th>
                    <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Basic (50%)</th>
                    <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>HRA (40%)</th>
                    <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>EPF / ESIC Status</th>
                    <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "36px 14px", color: "var(--slate)", fontStyle: "italic" }}>
                        No staff compensation structures defined yet.
                      </td>
                    </tr>
                  ) : (
                    staffList.map((s) => (
                      <tr key={s.id} style={{ borderBottom: "1px solid var(--line)" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <strong style={{ display: "block", color: "var(--ink)" }}>{s.name}</strong>
                          <span style={{ fontSize: 11.5, color: "var(--slate)" }}>{s.designation} · {s.department}</span>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "var(--indigo)" }}>
                          ₹{s.salary.toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          ₹{(s.basicSalary || Math.floor(s.salary * 0.5)).toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          ₹{(s.hra || Math.floor(s.salary * 0.2)).toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <span style={{ fontSize: 11, background: s.isEpfEligible !== false ? "#DCFCE7" : "#F1F5F9", color: s.isEpfEligible !== false ? "#166534" : "#64748B", padding: "2px 8px", borderRadius: 4, fontWeight: 700, marginRight: 4 }}>
                            EPF 12%
                          </span>
                          {s.isEsicEligible && (
                            <span style={{ fontSize: 11, background: "#EFF6FF", color: "#1D4ED8", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                              ESIC
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          <Button
                            type="button"
                            onClick={() => {
                              setSelectedStaffForStructure(s);
                              setSalaryStructureModalOpen(true);
                            }}
                            style={{ fontSize: 11.5, padding: "5px 12px" }}
                          >
                            ⚙️ Adjust Structure
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: EMPLOYEE PAY SLIPS ARCHIVE */}
      {activeTab === "payslips" && (
        <div style={{ display: "grid", gap: 18 }}>
          <Card style={{ borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <Input
                placeholder="Search pay slips by employee name, ID, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 320 }}
              />

              <div style={{ fontSize: 12.5, color: "var(--slate)" }}>
                Showing <strong>{filteredStaff.length}</strong> active pay slips for <strong>{selectedMonth}</strong>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
              {filteredStaff.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "36px 14px", background: "var(--wash-a)", borderRadius: 12, border: "1px dashed var(--line)", color: "var(--slate)", fontStyle: "italic" }}>
                  No pay slips generated for {selectedMonth}.
                </div>
              ) : (
                filteredStaff.map((s) => {
                  const basic = s.basicSalary || Math.floor(s.salary * 0.5);
                  const epf = s.epfDeduction || 0;
                  const netSalary = s.salary - epf - (s.tdsDeduction || 0) - 200 - 750;

                  return (
                    <div
                      key={s.id}
                      style={{
                        background: "var(--wash-a)",
                        border: "1px solid var(--line)",
                        borderRadius: 14,
                        padding: "16px 18px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "var(--indigo)" }}>
                            {s.employeeId}
                          </span>
                          <StatusPill kind={s.paymentStatus === "PAID" ? "success" : "warn"}>
                            {s.paymentStatus}
                          </StatusPill>
                        </div>

                        <strong style={{ fontSize: 15, color: "var(--ink)", display: "block" }}>{s.name}</strong>
                        <span style={{ fontSize: 12, color: "var(--slate)" }}>{s.designation} ({s.department})</span>

                      <div style={{ background: "#fff", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", margin: "12px 0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: "var(--slate)" }}>Gross Salary:</span>
                          <strong>₹{s.salary.toLocaleString("en-IN")}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderTop: "1px dashed var(--line)", paddingTop: 4 }}>
                          <span style={{ color: "var(--slate)" }}>Net Take-Home:</span>
                          <strong style={{ color: "#16A34A", fontSize: 14 }}>₹{netSalary.toLocaleString("en-IN")}</strong>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => {
                        setSelectedStaffForPaySlip(s);
                        setPaySlipModalOpen(true);
                      }}
                      style={{ width: "100%", background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)", color: "#fff", fontSize: 12.5 }}
                    >
                      🖨️ View & Print Official Pay Slip
                    </Button>
                  </div>
                );
              })
            )}
          </div>
          </Card>
        </div>
      )}

      {/* Pay Slip Print Modal */}
      {paySlipModalOpen && selectedStaffForPaySlip && (
        <PaySlipPrintModal
          isOpen={paySlipModalOpen}
          onClose={() => setPaySlipModalOpen(false)}
          staff={selectedStaffForPaySlip}
          monthYear={selectedMonth}
        />
      )}

      {/* Salary Structure Modal */}
      {salaryStructureModalOpen && selectedStaffForStructure && (
        <SalaryStructureModal
          isOpen={salaryStructureModalOpen}
          onClose={() => setSalaryStructureModalOpen(false)}
          staff={selectedStaffForStructure}
          onSuccess={handleSalaryStructureSuccess}
        />
      )}

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
