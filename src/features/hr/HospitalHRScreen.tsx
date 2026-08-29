import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Input, Select, StatusPill, Toast, Modal } from "../../ui/components";
import { formatRupees } from "../../ui/helpers";
import PaySlipPrintModal from "./PaySlipPrintModal";
import SalaryStructureModal from "./SalaryStructureModal";
import ReferralAnalytics from "../reports/ReferralAnalytics";

export interface HospitalEmployee {
  id: string;
  employeeId: string;
  title?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  name: string;
  role: "doctor" | "nurse" | "receptionist" | "billing" | "admin" | "lab_tech" | "pharmacist" | "super_admin";
  designation: string;
  department: string;
  gender?: "Male" | "Female" | "Other";
  dob?: string;
  regNo?: string;
  phone: string;
  email: string;
  aadhaar?: string;
  pan?: string;
  address?: string;
  joiningDate: string;
  salary: number; // Monthly CTC
  basicSalary?: number;
  hra?: number;
  medicalAllowance?: number;
  specialAllowance?: number;
  dutyAllowance?: number;
  incentive?: number;
  opdFee?: number;
  rating?: number;
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
  qualification?: string;
  bankName?: string;
  accountNo?: string;
  ifscCode?: string;
  shiftSchedule?: string;
}

const defaultStaff: HospitalEmployee[] = [
  {
    id: "EMP-001",
    employeeId: "MED-ADM-01",
    title: "Mr.",
    firstName: "Dhanunjay",
    lastName: "yadav",
    name: "Mr. Dhanunjay yadav",
    role: "super_admin",
    designation: "Super Administrator",
    department: "Executive Hospital Administration",
    gender: "Male",
    dob: "1988-05-14",
    phone: "9505030705",
    email: "dhanunjay.dhori@gmail.com",
    aadhaar: "5482 9102 3847",
    pan: "ABCDE1234F",
    address: "Flat 402, Sai Balaji Towers, MG Road, Vijayawada, AP",
    joiningDate: "01-Jan-2022",
    salary: 185000,
    basicSalary: 92500,
    hra: 37000,
    medicalAllowance: 15000,
    specialAllowance: 40500,
    isEpfEligible: true,
    isEsicEligible: false,
    epfDeduction: 11100,
    esicDeduction: 0,
    tdsDeduction: 15000,
    presentDays: 30,
    lopDays: 0,
    nightShifts: 0,
    paymentStatus: "PAID",
    bankName: "HDFC Bank",
    accountNo: "5010048912891",
    ifscCode: "HDFC0001248",
    shiftSchedule: "General Shift (09:00 AM - 06:00 PM)",
  },
  {
    id: "EMP-002",
    employeeId: "MED-DOC-01",
    title: "Dr.",
    firstName: "SATHVIK",
    lastName: "NANDAN",
    name: "Dr. SATHVIK NANDAN",
    role: "doctor",
    designation: "Chief Medical Specialist & Physician",
    department: "General Medicine",
    gender: "Male",
    dob: "1992-01-01",
    regNo: "APMC/2017/98421",
    phone: "8884242466",
    email: "sathvik.nandan@gmail.com",
    aadhaar: "8472 1029 4839",
    pan: "BNMPK9021R",
    address: "Chamber 101, Ground Floor OPD Wing, AP",
    joiningDate: "15-Mar-2023",
    salary: 175000,
    basicSalary: 87500,
    hra: 35000,
    medicalAllowance: 15000,
    specialAllowance: 37500,
    opdFee: 500,
    rating: 4.9,
    isEpfEligible: true,
    isEsicEligible: false,
    epfDeduction: 10500,
    esicDeduction: 0,
    tdsDeduction: 12500,
    presentDays: 28,
    lopDays: 0,
    nightShifts: 4,
    paymentStatus: "PAID",
    qualification: "MBBS, MD (General Medicine)",
    bankName: "State Bank of India",
    accountNo: "30849201948",
    ifscCode: "SBIN0004521",
    shiftSchedule: "OPD Morning Shift (08:00 AM - 04:00 PM)",
  },
  {
    id: "EMP-003",
    employeeId: "MED-LAB-01",
    title: "Mr.",
    firstName: "kiran",
    lastName: "Kumar",
    name: "Mr. kiran Kumar",
    role: "lab_tech",
    designation: "Lab Incharge",
    department: "Diagnostic Pathology & Biochemistry",
    gender: "Male",
    dob: "1990-08-20",
    phone: "9875540215",
    email: "kiran.@gmail.com",
    aadhaar: "9012 4829 1048",
    pan: "CXVPK8920K",
    address: "Diagnostic Lab Wing, Floor 1, AP",
    joiningDate: "10-Jun-2023",
    salary: 45000,
    basicSalary: 22500,
    hra: 9000,
    medicalAllowance: 4500,
    specialAllowance: 9000,
    isEpfEligible: true,
    isEsicEligible: true,
    epfDeduction: 2700,
    esicDeduction: 338,
    tdsDeduction: 0,
    presentDays: 29,
    lopDays: 0,
    nightShifts: 2,
    paymentStatus: "PAID",
    qualification: "B.Sc MLT (Medical Lab Technology)",
    bankName: "ICICI Bank",
    accountNo: "002901492019",
    ifscCode: "ICIC0000029",
    shiftSchedule: "Lab Duty Shift (07:00 AM - 03:00 PM)",
  },
  {
    id: "EMP-004",
    employeeId: "MED-DOC-02",
    title: "Dr.",
    firstName: "P.",
    lastName: "Swathi",
    name: "Dr. P. Swathi",
    role: "doctor",
    designation: "Consultant Gastroenterologist",
    department: "Gastroenterology",
    gender: "Female",
    dob: "1989-11-12",
    regNo: "APMC/2016/54210",
    phone: "9848011223",
    email: "drswathi.gastro@yopmail.com",
    aadhaar: "7829 4019 2847",
    pan: "PQRSK5678M",
    address: "Doctors Quarters, Hospital Campus, AP",
    joiningDate: "15-Mar-2023",
    salary: 150000,
    basicSalary: 75000,
    hra: 30000,
    medicalAllowance: 15000,
    specialAllowance: 30000,
    opdFee: 600,
    rating: 4.8,
    isEpfEligible: true,
    isEsicEligible: false,
    epfDeduction: 9000,
    esicDeduction: 0,
    tdsDeduction: 10000,
    presentDays: 27,
    lopDays: 1,
    nightShifts: 2,
    paymentStatus: "PAID",
    bankName: "HDFC Bank",
    accountNo: "5010084920192",
    ifscCode: "HDFC0001248",
    shiftSchedule: "Gastro Special Clinic (10:00 AM - 05:00 PM)",
  },
];

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
  const activeTab = searchParams.get("tab") || "employees";

  const [staffList, setStaffList] = useState<HospitalEmployee[]>(() => {
    const saved = localStorage.getItem(`hms-staff-roster-${tenant || "default"}`);
    return saved ? JSON.parse(saved) : defaultStaff;
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: "LV-101",
      staffName: "Dr. P. Swathi",
      role: "doctor",
      leaveType: "Casual Leave",
      dates: "28 Aug 2026 - 29 Aug 2026",
      days: 2,
      reason: "Medical Conference Presentation",
      status: "PENDING",
    },
    {
      id: "LV-102",
      staffName: "Sister Mary Joseph",
      role: "nurse",
      leaveType: "Earned Leave",
      dates: "02 Sep 2026 - 05 Sep 2026",
      days: 4,
      reason: "Annual Family Vacation",
      status: "APPROVED",
    },
  ]);

  const [selectedMonth, setSelectedMonth] = useState("August 2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [isPayrollLocked, setIsPayrollLocked] = useState(false);

  // Employee Form State (Add / Edit mode matching Screen 2)
  const [employeeFormMode, setEmployeeFormMode] = useState<"list" | "add" | "edit" | "view">("list");
  const [activeFormSubTab, setActiveFormSubTab] = useState<"details" | "history" | "schedule">("details");
  const [selectedEmployee, setSelectedEmployee] = useState<HospitalEmployee | null>(null);

  // Form Fields State
  const [formTitle, setFormTitle] = useState("Dr.");
  const [formFirstName, setFormFirstName] = useState("");
  const [formMiddleName, setFormMiddleName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formUsertype, setFormUsertype] = useState<HospitalEmployee["role"]>("doctor");
  const [formGender, setFormGender] = useState<"Male" | "Female" | "Other">("Male");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDob, setFormDob] = useState("1992-01-01");
  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [formAadhaar, setFormAadhaar] = useState("");
  const [formPan, setFormPan] = useState("");
  const [formQualification, setFormQualification] = useState("");
  const [formDepartment, setFormDepartment] = useState("General Medicine");
  const [formRegNo, setFormRegNo] = useState("");
  const [formSalary, setFormSalary] = useState("150000");
  const [formAddress, setFormAddress] = useState("");
  const [formBankName, setFormBankName] = useState("HDFC Bank");
  const [formAccountNo, setFormAccountNo] = useState("");
  const [formIfscCode, setFormIfscCode] = useState("HDFC0001248");

  // Collapsible Accordion sections in Add/Edit Employee Form
  const [accordionExp, setAccordionExp] = useState(false);
  const [accordionAddr, setAccordionAddr] = useState(false);
  const [accordionBank, setAccordionBank] = useState(false);

  // Upload Employee Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

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
    setEmployeeFormMode("list");
  };

  const openAddEmployeeForm = () => {
    setSelectedEmployee(null);
    setFormTitle("Dr.");
    setFormFirstName("");
    setFormMiddleName("");
    setFormLastName("");
    setFormUsertype("doctor");
    setFormGender("Male");
    setFormPhone("");
    setFormEmail("");
    setFormDob("1992-01-01");
    setFormEmployeeId(`MED-EMP-${String(staffList.length + 1).padStart(2, "0")}`);
    setFormAadhaar("");
    setFormPan("");
    setFormQualification("");
    setFormDepartment("General Medicine");
    setFormRegNo("");
    setFormSalary("150000");
    setFormAddress("");
    setFormBankName("HDFC Bank");
    setFormAccountNo("");
    setFormIfscCode("HDFC0001248");
    setActiveFormSubTab("details");
    setEmployeeFormMode("add");
  };

  const openEditEmployeeForm = (emp: HospitalEmployee) => {
    setSelectedEmployee(emp);
    setFormTitle(emp.title || (emp.role === "doctor" ? "Dr." : "Mr."));
    setFormFirstName(emp.firstName || emp.name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s*/, "").split(" ")[0] || "");
    setFormMiddleName(emp.middleName || "");
    setFormLastName(emp.lastName || emp.name.split(" ").slice(1).join(" ") || "");
    setFormUsertype(emp.role);
    setFormGender(emp.gender || "Male");
    setFormPhone(emp.phone);
    setFormEmail(emp.email);
    setFormDob(emp.dob || "1992-01-01");
    setFormEmployeeId(emp.employeeId);
    setFormAadhaar(emp.aadhaar || "");
    setFormPan(emp.pan || "");
    setFormQualification(emp.qualification || "");
    setFormDepartment(emp.department);
    setFormRegNo(emp.regNo || "");
    setFormSalary(String(emp.salary));
    setFormAddress(emp.address || "");
    setFormBankName(emp.bankName || "HDFC Bank");
    setFormAccountNo(emp.accountNo || "");
    setFormIfscCode(emp.ifscCode || "HDFC0001248");
    setActiveFormSubTab("details");
    setEmployeeFormMode("edit");
  };

  const handleSaveEmployee = () => {
    if (!formFirstName.trim()) {
      triggerToast("Please enter Employee First Name.");
      return;
    }
    if (!formPhone.trim()) {
      triggerToast("Please enter Phone Number.");
      return;
    }

    const fullName = `${formTitle} ${formFirstName} ${formMiddleName ? formMiddleName + " " : ""}${formLastName}`.trim();
    const sal = Number(formSalary) || 50000;
    const basic = Math.floor(sal * 0.5);
    const epf = Math.floor(basic * 0.12);

    if (employeeFormMode === "add") {
      const newEmp: HospitalEmployee = {
        id: `EMP-${Date.now()}`,
        employeeId: formEmployeeId || `MED-EMP-${String(staffList.length + 1).padStart(2, "0")}`,
        title: formTitle,
        firstName: formFirstName,
        middleName: formMiddleName,
        lastName: formLastName,
        name: fullName,
        role: formUsertype,
        designation: formUsertype === "doctor" ? "Medical Specialist" : formUsertype === "nurse" ? "Staff Nurse" : formUsertype === "lab_tech" ? "Lab Incharge" : "Hospital Staff",
        department: formDepartment,
        gender: formGender,
        dob: formDob,
        phone: formPhone,
        email: formEmail,
        aadhaar: formAadhaar,
        pan: formPan,
        qualification: formQualification,
        regNo: formRegNo,
        address: formAddress,
        joiningDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        salary: sal,
        basicSalary: basic,
        hra: Math.floor(sal * 0.2),
        medicalAllowance: 5000,
        specialAllowance: sal - basic - Math.floor(sal * 0.2) - 5000,
        isEpfEligible: true,
        epfDeduction: epf,
        tdsDeduction: sal > 100000 ? 10000 : 0,
        presentDays: 30,
        lopDays: 0,
        nightShifts: formUsertype === "doctor" ? 4 : 0,
        paymentStatus: "PAID",
        bankName: formBankName,
        accountNo: formAccountNo,
        ifscCode: formIfscCode,
        shiftSchedule: "General Shift",
      };
      const updated = [newEmp, ...staffList];
      setStaffList(updated);
      localStorage.setItem(`hms-staff-roster-${tenant || "default"}`, JSON.stringify(updated));
      triggerToast(`Employee ${fullName} created successfully.`);
    } else if (employeeFormMode === "edit" && selectedEmployee) {
      const updated = staffList.map((emp) =>
        emp.id === selectedEmployee.id
          ? {
              ...emp,
              title: formTitle,
              firstName: formFirstName,
              middleName: formMiddleName,
              lastName: formLastName,
              name: fullName,
              role: formUsertype,
              department: formDepartment,
              gender: formGender,
              dob: formDob,
              phone: formPhone,
              email: formEmail,
              aadhaar: formAadhaar,
              pan: formPan,
              qualification: formQualification,
              regNo: formRegNo,
              address: formAddress,
              salary: sal,
              bankName: formBankName,
              accountNo: formAccountNo,
              ifscCode: formIfscCode,
            }
          : emp
      );
      setStaffList(updated);
      localStorage.setItem(`hms-staff-roster-${tenant || "default"}`, JSON.stringify(updated));
      triggerToast(`Employee ${fullName} updated successfully.`);
    }
    setEmployeeFormMode("list");
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from employee records?`)) {
      const updated = staffList.filter((e) => e.id !== id);
      setStaffList(updated);
      localStorage.setItem(`hms-staff-roster-${tenant || "default"}`, JSON.stringify(updated));
      triggerToast(`Employee ${name} removed.`);
    }
  };

  // Metrics
  const totalEmployees = staffList.length;
  const totalDoctors = staffList.filter((s) => s.role === "doctor").length;
  const totalPayrollLiability = staffList.reduce((acc, s) => acc + s.salary, 0);
  const totalEpf = staffList.reduce((acc, s) => acc + (s.epfDeduction || 0), 0);
  const totalEsic = staffList.reduce((acc, s) => acc + (s.esicDeduction || 0), 0);
  const totalPt = staffList.length * 200;
  const totalTds = staffList.reduce((acc, s) => acc + (s.tdsDeduction || 0), 0);
  const totalStatutoryDeductions = totalEpf + totalEsic + totalPt + totalTds;
  const totalNetPayout = totalPayrollLiability - totalStatutoryDeductions;

  const filteredStaff = staffList.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.designation.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.employeeId.toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  });

  const doctorsList = staffList.filter((s) => s.role === "doctor");

  const handleExportNeftLedger = () => {
    const csvHeader = "Beneficiary Name,Account Number,IFSC Code,Amount (INR),Transaction Remarks,Email\n";
    const csvRows = staffList
      .map(
        (s) =>
          `"${s.name}","${s.accountNo || "5010048912891"}","${s.ifscCode || "HDFC0001248"}",${s.salary - (s.epfDeduction || 0) - (s.tdsDeduction || 0) - 200},"SALARY ${selectedMonth.toUpperCase()}","${s.email}"`
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

  const navTabs = [
    { key: "employees", label: "Employees", icon: "👥" },
    { key: "doctors", label: "Doctors", icon: "🩺" },
    { key: "referrals", label: "Referrals", icon: "🔄" },
    { key: "doctor-ratings", label: "Doctor Ratings", icon: "⭐" },
    { key: "payroll-dashboard", label: "Payroll Dashboard", icon: "📊" },
    { key: "payroll-list", label: "Monthly Payroll Run", icon: "📋" },
    { key: "employee-salary", label: "Employee Salary", icon: "💼" },
    { key: "timesheet", label: "Timesheet", icon: "⏱️" },
    { key: "attendance", label: "Attendance & Leave Desk", icon: "📅" },
    { key: "payout-structure", label: "Payout Structure", icon: "📐" },
    { key: "employee-payouts", label: "Employee Payouts", icon: "💳" },
  ];

  // Profile Avatar helper matching screenshot 1
  const getAvatarBadge = (role: string, index: number) => {
    const bgColors = ["#FEF2F2", "#EFF6FF", "#FEF9C3", "#F0FDF4"];
    const textColors = ["#DC2626", "#2563EB", "#CA8A04", "#16A34A"];
    const emojis = ["👨‍💼", "👨‍⚕️", "👨‍🔬", "👩‍⚕️"];
    const i = index % 4;
    return (
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: bgColors[i],
          color: textColors[i],
          display: "grid",
          placeItems: "center",
          fontSize: 20,
          border: `1.5px solid ${textColors[i]}30`,
        }}
      >
        {role === "doctor" ? "👨‍⚕️" : role === "lab_tech" ? "👨‍🔬" : emojis[i]}
      </div>
    );
  };

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 1160, margin: "0 auto" }}>
      {/* Top Cyan Breadcrumb Banner matching Image 1 & 2 */}
      <div
        style={{
          background: "#00BCD4",
          borderRadius: 8,
          padding: "10px 18px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700 }}>
          <span>Employee</span>
          <span>🏠</span>
          <span>
            Employee Details · Hospital Human Resources (HR) & Automated Payroll Engine
            {employeeFormMode === "add" && " - Add Employee"}
            {employeeFormMode === "edit" && " - Edit Employee"}
            {employeeFormMode === "view" && " - View Profile"}
          </span>
        </div>

        {/* Right Action buttons */}
        {activeTab === "employees" && employeeFormMode === "list" && (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={openAddEmployeeForm}
              style={{
                background: "#0284C7",
                color: "#ffffff",
                border: "none",
                borderRadius: 4,
                padding: "6px 14px",
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              + Add
            </button>
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              style={{
                background: "#EF4444",
                color: "#ffffff",
                border: "none",
                borderRadius: 4,
                padding: "6px 14px",
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              Upload Employee
            </button>
          </div>
        )}

        {/* Header Action buttons in Add / Edit form mode */}
        {employeeFormMode !== "list" && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={handleSaveEmployee}
              style={{
                background: "#0284C7",
                color: "#ffffff",
                border: "none",
                borderRadius: 4,
                padding: "6px 16px",
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              {employeeFormMode === "add" ? "Save" : "Update"}
            </button>
            <button
              type="button"
              onClick={() => setEmployeeFormMode("list")}
              style={{
                background: "#ffffff",
                color: "var(--ink)",
                border: "1px solid #E2E8F0",
                borderRadius: 4,
                padding: "6px 14px",
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Top 4 KPI Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        <Card style={{ borderLeft: "4px solid var(--indigo)", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Total Active Staff</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>{totalEmployees}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>{totalDoctors} Doctors · {totalEmployees - totalDoctors} Staff</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #0284C7", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Monthly Payroll Liability</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#0284C7" }}>{formatRupees(totalPayrollLiability)}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Gross CTC</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #DC2626", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Statutory Deductions</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#DC2626" }}>{formatRupees(totalStatutoryDeductions)}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>EPF + ESIC + PT</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #16A34A", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Net Bank Disbursement</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#16A34A" }}>{formatRupees(totalNetPayout)}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>NEFT CMS</span>
          </div>
        </Card>
      </div>

      {/* Horizontal Sub-Tabs Bar (Matching the 11 Submenu items) */}
      <div style={{ display: "flex", gap: 6, borderBottom: "2px solid var(--line)", paddingBottom: 6, overflowX: "auto", whiteSpace: "nowrap" }}>
        {navTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px 8px 0 0",
              border: "none",
              background: (activeTab === tab.key || (tab.key === "payroll-list" && activeTab === "payroll")) ? "var(--indigo)" : "transparent",
              color: (activeTab === tab.key || (tab.key === "payroll-list" && activeTab === "payroll")) ? "#ffffff" : "var(--slate)",
              fontWeight: (activeTab === tab.key || (tab.key === "payroll-list" && activeTab === "payroll")) ? 800 : 600,
              fontSize: 13,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.12s ease",
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ====================================================================
          TAB 1: EMPLOYEES (Screen 1 & Screen 2)
         ==================================================================== */}
      {activeTab === "employees" && (
        <>
          {/* SCREEN 1: EMPLOYEE LIST VIEW */}
          {employeeFormMode === "list" && (
            <Card style={{ borderRadius: 10, padding: 18 }}>
              {/* Search Bar matching Screen 1 */}
              <div style={{ display: "flex", gap: 8, marginBottom: 18, maxWidth: 360 }}>
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: "100%", fontSize: 13 }}
                />
                <button
                  type="button"
                  style={{
                    background: "#4F46E5",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 6,
                    padding: "0 14px",
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 15,
                  }}
                  title="Search"
                >
                  🔍
                </button>
              </div>

              {/* Table matching Screen 1 */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#4338CA", color: "#ffffff" }}>
                      <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, fontSize: 12 }}>PROFILE PIC ⇅</th>
                      <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, fontSize: 12 }}>NAME ⇅</th>
                      <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, fontSize: 12 }}>PHONE NO ⇅</th>
                      <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, fontSize: 12 }}>EMAIL ⇅</th>
                      <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, fontSize: 12 }}>ROLE ⇅</th>
                      <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, fontSize: 12 }}>ADDRESS ⇅</th>
                      <th style={{ textAlign: "right", padding: "10px 14px", fontWeight: 700, fontSize: 12 }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "30px 14px", color: "var(--slate)" }}>
                          No employees found matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredStaff.slice(0, entriesPerPage).map((emp, idx) => (
                        <tr key={emp.id} style={{ borderBottom: "1px solid var(--line)" }}>
                          {/* Profile Pic */}
                          <td style={{ padding: "10px 14px" }}>
                            {getAvatarBadge(emp.role, idx)}
                          </td>

                          {/* Name */}
                          <td style={{ padding: "10px 14px" }}>
                            <strong style={{ color: "var(--ink)" }}>{emp.name}</strong>
                          </td>

                          {/* Phone No */}
                          <td style={{ padding: "10px 14px", color: "var(--slate)" }}>
                            {emp.phone}
                          </td>

                          {/* Email */}
                          <td style={{ padding: "10px 14px", color: "var(--slate)" }}>
                            {emp.email}
                          </td>

                          {/* Role */}
                          <td style={{ padding: "10px 14px", color: "var(--slate)", fontWeight: 600 }}>
                            {emp.role === "super_admin" ? "Super Administrator" : emp.role === "doctor" ? "Doctor" : emp.role === "lab_tech" ? "Lab Incharge" : emp.role === "nurse" ? "Nurse" : "Hospital Staff"}
                          </td>

                          {/* Address */}
                          <td style={{ padding: "10px 14px", color: "var(--slate)", fontSize: 12, maxWidth: 220 }}>
                            {emp.address || "Main Campus, Andhra Pradesh"}
                          </td>

                          {/* Action Buttons: View, Edit, Delete */}
                          <td style={{ padding: "10px 14px", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: 6 }}>
                              {/* 👁️ View Button */}
                              <button
                                type="button"
                                onClick={() => openEditEmployeeForm(emp)}
                                title="View Details"
                                style={{
                                  background: "#06B6D4",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: 4,
                                  width: 28,
                                  height: 28,
                                  display: "grid",
                                  placeItems: "center",
                                  cursor: "pointer",
                                  fontSize: 13,
                                }}
                              >
                                👁️
                              </button>

                              {/* ✏️ Edit Button */}
                              <button
                                type="button"
                                onClick={() => openEditEmployeeForm(emp)}
                                title="Edit Employee"
                                style={{
                                  background: "#4F46E5",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: 4,
                                  width: 28,
                                  height: 28,
                                  display: "grid",
                                  placeItems: "center",
                                  cursor: "pointer",
                                  fontSize: 13,
                                }}
                              >
                                ✏️
                              </button>

                              {/* 🗑️ Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                                title="Delete Employee"
                                style={{
                                  background: "#EF4444",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: 4,
                                  width: 28,
                                  height: 28,
                                  display: "grid",
                                  placeItems: "center",
                                  cursor: "pointer",
                                  fontSize: 13,
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Pagination matching Screen 1 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontSize: 12.5, color: "var(--slate)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Show</span>
                  <select
                    value={entriesPerPage}
                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                    style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid var(--line)" }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span>entries. Showing rows 1 to {Math.min(entriesPerPage, filteredStaff.length)} of {filteredStaff.length}</span>
                </div>

                <div style={{ display: "flex", gap: 4 }}>
                  <button type="button" style={{ border: "1px solid var(--line)", background: "#fff", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>‹</button>
                  <button type="button" style={{ border: "none", background: "#4F46E5", color: "#fff", padding: "4px 10px", borderRadius: 4, fontWeight: 700 }}>1</button>
                  <button type="button" style={{ border: "1px solid var(--line)", background: "#fff", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>›</button>
                </div>
              </div>
            </Card>
          )}

          {/* SCREEN 2: ADD / EDIT EMPLOYEE FORM VIEW */}
          {employeeFormMode !== "list" && (
            <Card style={{ borderRadius: 10, padding: 22 }}>
              {/* Sub-tabs: [ Details ] [ History ] [ Schedule ] matching Screen 2 */}
              <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                <button
                  type="button"
                  onClick={() => setActiveFormSubTab("details")}
                  style={{
                    background: activeFormSubTab === "details" ? "#4F46E5" : "#ffffff",
                    color: activeFormSubTab === "details" ? "#ffffff" : "var(--slate)",
                    border: "1px solid #E2E8F0",
                    borderRadius: 6,
                    padding: "8px 20px",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormSubTab("history")}
                  style={{
                    background: activeFormSubTab === "history" ? "#4F46E5" : "#ffffff",
                    color: activeFormSubTab === "history" ? "#ffffff" : "var(--slate)",
                    border: "1px solid #E2E8F0",
                    borderRadius: 6,
                    padding: "8px 20px",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  History
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormSubTab("schedule")}
                  style={{
                    background: activeFormSubTab === "schedule" ? "#4F46E5" : "#ffffff",
                    color: activeFormSubTab === "schedule" ? "#ffffff" : "var(--slate)",
                    border: "1px solid #E2E8F0",
                    borderRadius: 6,
                    padding: "8px 20px",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Schedule
                </button>
              </div>

              {/* TAB 1: DETAILS */}
              {activeFormSubTab === "details" && (
                <div style={{ display: "grid", gap: 18 }}>
                  {/* Top Row with Avatar & Main Info */}
                  <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
                    {/* Left Circular Avatar with icon */}
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: 86,
                          height: 86,
                          borderRadius: "50%",
                          background: "#FEF2F2",
                          border: "2px solid #FCA5A5",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 44,
                          margin: "0 auto 8px",
                        }}
                      >
                        👨‍⚕️
                      </div>
                      <button
                        type="button"
                        style={{
                          background: "var(--wash-a)",
                          border: "1px solid var(--line)",
                          borderRadius: 4,
                          fontSize: 11,
                          padding: "3px 8px",
                          cursor: "pointer",
                          color: "var(--slate)",
                        }}
                      >
                        Change Photo
                      </button>
                    </div>

                    {/* Right Form Fields */}
                    <div style={{ flex: 1, display: "grid", gap: 14 }}>
                      {/* Row 1: Title, First Name, Middle Name, Last Name */}
                      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Title <span style={{ color: "#00BCD4" }}>*</span>
                          </label>
                          <Select
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            style={{ width: "100%" }}
                          >
                            <option value="Dr.">Dr.</option>
                            <option value="Mr.">Mr.</option>
                            <option value="Mrs.">Mrs.</option>
                            <option value="Ms.">Ms.</option>
                          </Select>
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            First Name <span style={{ color: "#EF4444" }}>*</span>
                          </label>
                          <Input
                            placeholder="First Name"
                            value={formFirstName}
                            onChange={(e) => setFormFirstName(e.target.value)}
                            style={{ width: "100%" }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Middle Name
                          </label>
                          <Input
                            placeholder="Middle Name"
                            value={formMiddleName}
                            onChange={(e) => setFormMiddleName(e.target.value)}
                            style={{ width: "100%" }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Last Name <span style={{ color: "#EF4444" }}>*</span>
                          </label>
                          <Input
                            placeholder="Last Name"
                            value={formLastName}
                            onChange={(e) => setFormLastName(e.target.value)}
                            style={{ width: "100%" }}
                          />
                        </div>
                      </div>

                      {/* Row 2: Usertype, Gender, Phone Number, Email */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr 1.5fr", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Usertype <span style={{ color: "#EF4444" }}>*</span>
                          </label>
                          <Select
                            value={formUsertype}
                            onChange={(e) => setFormUsertype(e.target.value as any)}
                            style={{ width: "100%" }}
                          >
                            <option value="super_admin">Super Administrator</option>
                            <option value="doctor">Doctor</option>
                            <option value="nurse">Nurse</option>
                            <option value="receptionist">Receptionist</option>
                            <option value="billing">Billing Officer</option>
                            <option value="lab_tech">Lab Incharge</option>
                            <option value="pharmacist">Pharmacist</option>
                          </Select>
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Gender <span style={{ color: "#EF4444" }}>*</span>
                          </label>
                          <Select
                            value={formGender}
                            onChange={(e) => setFormGender(e.target.value as any)}
                            style={{ width: "100%" }}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </Select>
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Phone Number <span style={{ color: "#EF4444" }}>*</span>
                          </label>
                          <Input
                            placeholder="9876543210"
                            value={formPhone}
                            onChange={(e) => setFormPhone(e.target.value)}
                            style={{ width: "100%" }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Email <span style={{ color: "#EF4444" }}>*</span>
                          </label>
                          <Input
                            placeholder="email@address.com"
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            style={{ width: "100%" }}
                          />
                        </div>
                      </div>

                      {/* Row 3: D.O.B., Employee Identification, Aadhaar Number, PAN Number */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr 1.2fr", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            D.O.B. <span style={{ color: "#EF4444" }}>*</span>
                          </label>
                          <Input
                            type="date"
                            value={formDob}
                            onChange={(e) => setFormDob(e.target.value)}
                            style={{ width: "100%" }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Employee Identification
                          </label>
                          <Input
                            placeholder="Employee identification"
                            value={formEmployeeId}
                            onChange={(e) => setFormEmployeeId(e.target.value)}
                            style={{ width: "100%" }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Aadhaar Number
                          </label>
                          <Input
                            placeholder="12-digit Aadhaar Number"
                            value={formAadhaar}
                            onChange={(e) => setFormAadhaar(e.target.value)}
                            style={{ width: "100%" }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            PAN Number
                          </label>
                          <Input
                            placeholder="PAN number"
                            value={formPan}
                            onChange={(e) => setFormPan(e.target.value)}
                            style={{ width: "100%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accordion 1: Professional Experience + matching Screen 2 */}
                  <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                    <button
                      type="button"
                      onClick={() => setAccordionExp(!accordionExp)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--ink)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: 0,
                      }}
                    >
                      <span>Professional Experience</span>
                      <span style={{ color: "var(--indigo)", fontWeight: 800 }}>{accordionExp ? "−" : "+"}</span>
                    </button>

                    {accordionExp && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12, padding: "12px 14px", background: "var(--wash-a)", borderRadius: 8 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Qualification</label>
                          <Input placeholder="e.g. MBBS, MD" value={formQualification} onChange={(e) => setFormQualification(e.target.value)} style={{ width: "100%" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Department / Specialization</label>
                          <Input placeholder="General Medicine" value={formDepartment} onChange={(e) => setFormDepartment(e.target.value)} style={{ width: "100%" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Medical Council Reg No (NMC/APMC)</label>
                          <Input placeholder="APMC/2017/98421" value={formRegNo} onChange={(e) => setFormRegNo(e.target.value)} style={{ width: "100%" }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Accordion 2: Address Information + matching Screen 2 */}
                  <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                    <button
                      type="button"
                      onClick={() => setAccordionAddr(!accordionAddr)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--ink)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: 0,
                      }}
                    >
                      <span>Address Information</span>
                      <span style={{ color: "var(--indigo)", fontWeight: 800 }}>{accordionAddr ? "−" : "+"}</span>
                    </button>

                    {accordionAddr && (
                      <div style={{ display: "grid", gap: 12, marginTop: 12, padding: "12px 14px", background: "var(--wash-a)", borderRadius: 8 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Residential / Communication Address</label>
                          <Input placeholder="Door/Flat No, Street, City, State, PIN" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} style={{ width: "100%" }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Accordion 3: Bank Information + matching Screen 2 */}
                  <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                    <button
                      type="button"
                      onClick={() => setAccordionBank(!accordionBank)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--ink)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: 0,
                      }}
                    >
                      <span>Bank Information</span>
                      <span style={{ color: "var(--indigo)", fontWeight: 800 }}>{accordionBank ? "−" : "+"}</span>
                    </button>

                    {accordionBank && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12, padding: "12px 14px", background: "var(--wash-a)", borderRadius: 8 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Bank Name</label>
                          <Input placeholder="HDFC Bank" value={formBankName} onChange={(e) => setFormBankName(e.target.value)} style={{ width: "100%" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Bank Account Number</label>
                          <Input placeholder="Account number" value={formAccountNo} onChange={(e) => setFormAccountNo(e.target.value)} style={{ width: "100%" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>IFSC Code</label>
                          <Input placeholder="HDFC0001248" value={formIfscCode} onChange={(e) => setFormIfscCode(e.target.value)} style={{ width: "100%" }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: HISTORY */}
              {activeFormSubTab === "history" && (
                <div style={{ display: "grid", gap: 14 }}>
                  <h4 style={{ margin: 0, color: "var(--indigo)" }}>📜 Employee Duty & Progression History</h4>
                  <div style={{ background: "var(--wash-a)", padding: 16, borderRadius: 8, fontSize: 13, border: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <strong>Joining & Onboarding</strong>
                      <span style={{ color: "var(--slate)" }}>01 Jan 2022</span>
                    </div>
                    <p style={{ margin: 0, color: "var(--slate)" }}>Onboarded as Senior Consultant in {formDepartment}. Initial CTC set to ₹{Number(formSalary).toLocaleString("en-IN")}.</p>
                  </div>
                </div>
              )}

              {/* TAB 3: SCHEDULE */}
              {activeFormSubTab === "schedule" && (
                <div style={{ display: "grid", gap: 14 }}>
                  <h4 style={{ margin: 0, color: "var(--indigo)" }}>🗓️ Weekly Shift & Duty Roster</h4>
                  <div style={{ background: "var(--wash-a)", padding: 16, borderRadius: 8, fontSize: 13, border: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <strong>Assigned Shift:</strong>
                      <span style={{ color: "var(--indigo)", fontWeight: 700 }}>Morning Shift (08:00 AM - 04:00 PM)</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <strong>Assigned Chamber / Station:</strong>
                      <span>Chamber 101 · OPD Wing</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong>On-Call Emergency Duty:</strong>
                      <span>Tuesdays & Thursdays (Night)</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {/* ====================================================================
          TAB 2: DOCTORS
         ==================================================================== */}
      {activeTab === "doctors" && (
        <Card style={{ borderRadius: 10, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: "var(--indigo)", fontWeight: 700 }}>
              🩺 Medical Practitioners & Specializations Directory
            </h3>
            <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
              {doctorsList.length} Registered Doctors
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Doctor Name</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Reg No (NMC/APMC)</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Specialization</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>OPD Fee</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Rating</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Duty Shifts</th>
                </tr>
              </thead>
              <tbody>
                {doctorsList.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <strong style={{ color: "var(--indigo)", display: "block" }}>{doc.name}</strong>
                      <span style={{ fontSize: 11.5, color: "var(--slate)" }}>{doc.designation}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12 }}>
                      {doc.regNo || "APMC/REG/PENDING"}
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 600 }}>
                      {doc.department}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700 }}>
                      ₹{doc.opdFee || 500}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <span style={{ background: "#FEF3C7", color: "#B45309", padding: "2px 8px", borderRadius: 6, fontWeight: 800, fontSize: 11.5 }}>
                        ⭐ {doc.rating || 4.8}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <StatusPill kind="success">ON-DUTY (Morning)</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ====================================================================
          TAB 3: REFERRALS
         ==================================================================== */}
      {activeTab === "referrals" && (
        <ReferralAnalytics />
      )}

      {/* ====================================================================
          TAB 4: DOCTOR RATINGS
         ==================================================================== */}
      {activeTab === "doctor-ratings" && (
        <Card style={{ borderRadius: 10, padding: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "var(--indigo)", fontWeight: 700 }}>
            ⭐ Clinician Ratings & Patient Satisfaction Scorecard
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {doctorsList.map((doc) => (
              <div key={doc.id} style={{ border: "1px solid var(--line)", padding: "16px 18px", borderRadius: 12, background: "var(--wash-a)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: 14, color: "var(--indigo)" }}>{doc.name}</strong>
                  <span style={{ background: "#FEF3C7", color: "#B45309", padding: "2px 8px", borderRadius: 6, fontWeight: 800, fontSize: 12 }}>
                    ⭐ {doc.rating || 4.8} / 5.0
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--slate)", margin: "4px 0 10px" }}>{doc.department}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink)", background: "#ffffff", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--line)" }}>
                  💬 "Patient communication is thorough and clear with Telugu instructions."
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ====================================================================
          TAB 5: PAYROLL DASHBOARD
         ==================================================================== */}
      {activeTab === "payroll-dashboard" && (
        <div style={{ display: "grid", gap: 16 }}>
          <Card style={{ borderRadius: 10, padding: 18 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "var(--indigo)", fontWeight: 700 }}>
              📊 Payroll Liability & Statutory Summary ({selectedMonth})
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "var(--wash-a)", padding: 16, borderRadius: 10, border: "1px solid var(--line)" }}>
                <strong style={{ fontSize: 13, color: "var(--slate)" }}>Earnings & CTC Breakdown</strong>
                <div style={{ display: "grid", gap: 6, marginTop: 10, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Gross CTC:</span> <strong>{formatRupees(totalPayrollLiability)}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Basic Salary (50%):</span> <strong>{formatRupees(totalPayrollLiability * 0.5)}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>HRA (40%):</span> <strong>{formatRupees(totalPayrollLiability * 0.2)}</strong></div>
                </div>
              </div>

              <div style={{ background: "var(--wash-a)", padding: 16, borderRadius: 10, border: "1px solid var(--line)" }}>
                <strong style={{ fontSize: 13, color: "var(--slate)" }}>Statutory Deductions Ledger</strong>
                <div style={{ display: "grid", gap: 6, marginTop: 10, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>EPF (Employee 12%):</span> <strong>{formatRupees(totalEpf)}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>ESIC (0.75%):</span> <strong>{formatRupees(totalEsic)}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Professional Tax (AP PT):</span> <strong>{formatRupees(totalPt)}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: 4 }}>
                    <span style={{ color: "#16A34A" }}>Net Bank Disbursement:</span> <strong style={{ color: "#16A34A" }}>{formatRupees(totalNetPayout)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ====================================================================
          TAB 6: PAYROLL LIST / MONTHLY PAYROLL RUN
         ==================================================================== */}
      {(activeTab === "payroll-list" || activeTab === "payroll") && (
        <Card style={{ borderRadius: 10, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)" }}>Payroll Month:</label>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ width: 160 }}
              >
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
              </Select>
            </div>

            <Button
              type="button"
              onClick={() => {
                setIsPayrollLocked(true);
                triggerToast(`Payroll batch for ${selectedMonth} locked.`);
              }}
              style={{ background: isPayrollLocked ? "#16A34A" : "var(--indigo)", color: "#fff" }}
            >
              {isPayrollLocked ? "🔒 Batch Locked" : "🔒 Finalize & Lock Batch"}
            </Button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Employee</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Gross (₹)</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Days</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Deductions</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Net Payout (₹)</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Status</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Pay Slip</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((s) => {
                  const epf = s.epfDeduction || 0;
                  const ded = epf + (s.tdsDeduction || 0) + 200;
                  const net = s.salary - ded;
                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <strong style={{ color: "var(--ink)", display: "block" }}>{s.name}</strong>
                        <span style={{ fontSize: 11, color: "var(--slate)" }}>{s.designation}</span>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700 }}>
                        {formatRupees(s.salary)}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>{s.presentDays}d</td>
                      <td style={{ padding: "12px 14px", textAlign: "right", color: "#DC2626" }}>-{formatRupees(ded)}</td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800, color: "#16A34A" }}>
                        {formatRupees(net)}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <StatusPill kind="success">{s.paymentStatus}</StatusPill>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ====================================================================
          TAB 7: EMPLOYEE SALARY
         ==================================================================== */}
      {activeTab === "employee-salary" && (
        <Card style={{ borderRadius: 10, padding: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "var(--indigo)", fontWeight: 700 }}>
            💼 Employee Salary Package Configurator
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Employee</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Monthly CTC</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Basic Pay</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>HRA</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Statutory Status</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <strong>{s.name}</strong>
                      <div style={{ fontSize: 11.5, color: "var(--slate)" }}>{s.designation}</div>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "var(--indigo)" }}>
                      {formatRupees(s.salary)}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      {formatRupees(s.basicSalary || Math.floor(s.salary * 0.5))}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      {formatRupees(s.hra || Math.floor(s.salary * 0.2))}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <span style={{ background: "#DCFCE7", color: "#166534", padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                        EPF 12%
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <Button
                        type="button"
                        onClick={() => {
                          setSelectedStaffForStructure(s);
                          setSalaryStructureModalOpen(true);
                        }}
                        style={{ fontSize: 11.5, padding: "5px 10px" }}
                      >
                        ⚙️ Adjust Structure
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ====================================================================
          TAB 8: TIMESHEET
         ==================================================================== */}
      {activeTab === "timesheet" && (
        <Card style={{ borderRadius: 10, padding: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "var(--indigo)", fontWeight: 700 }}>
            ⏱️ Shift Rostering & Duty Timesheet Log
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Staff</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Shift Timing</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Regular Hours</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Overtime Hours</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Duty Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <strong>{s.name}</strong>
                      <div style={{ fontSize: 11, color: "var(--slate)" }}>{s.designation}</div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>08:00 AM - 04:00 PM (Shift A)</td>
                    <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700 }}>48 hrs / week</td>
                    <td style={{ padding: "12px 14px", textAlign: "center", color: "#16A34A" }}>+4.5 hrs OT</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--indigo)", fontWeight: 600 }}>
                      {s.department}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ====================================================================
          TAB 9: ATTENDANCE DASHBOARD / ATTENDANCE & LEAVE DESK
         ==================================================================== */}
      {activeTab === "attendance" && (
        <Card style={{ borderRadius: 10, padding: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "var(--indigo)", fontWeight: 700 }}>
            📅 Biometric Attendance & Leave Desk ({selectedMonth})
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Staff</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Present</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Approved Leaves</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Loss of Pay (LOP)</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Night Shifts</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <strong>{s.name}</strong>
                      <div style={{ fontSize: 11, color: "var(--slate)" }}>{s.designation}</div>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 800, color: "#16A34A" }}>
                      {s.presentDays} Days
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>{31 - s.presentDays - s.lopDays} Days</td>
                    <td style={{ padding: "12px 14px", textAlign: "center", color: s.lopDays > 0 ? "#DC2626" : "var(--slate)" }}>
                      {s.lopDays} Days
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--indigo)", fontWeight: 700 }}>
                      🌙 {s.nightShifts} Shifts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pending Leave Requests */}
          <div style={{ marginTop: 22, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
            <h4 style={{ margin: "0 0 10px", fontSize: 14, color: "var(--indigo)", fontWeight: 700 }}>
              ⏳ Pending Staff Leave Applications
            </h4>
            <div style={{ display: "grid", gap: 8 }}>
              {leaveRequests.map((lv) => (
                <div key={lv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--wash-a)", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--line)" }}>
                  <div>
                    <strong>{lv.staffName}</strong> · <span style={{ color: "var(--slate)", fontSize: 12 }}>{lv.leaveType} ({lv.days}d) - {lv.dates}</span>
                    <div style={{ fontSize: 11.5, color: "var(--slate)" }}>Reason: {lv.reason}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Button type="button" onClick={() => triggerToast(`Leave for ${lv.staffName} approved.`)} style={{ fontSize: 11, padding: "4px 8px", background: "#16A34A", color: "#fff" }}>Approve</Button>
                    <Button type="button" ghost onClick={() => triggerToast(`Leave for ${lv.staffName} rejected.`)} style={{ fontSize: 11, padding: "4px 8px" }}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ====================================================================
          TAB 10: PAYOUT STRUCTURE
         ==================================================================== */}
      {activeTab === "payout-structure" && (
        <Card style={{ borderRadius: 10, padding: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "var(--indigo)", fontWeight: 700 }}>
            📐 Statutory Payout Formula & Compliance Breakdown
          </h3>
          <div style={{ background: "var(--wash-a)", padding: 18, borderRadius: 12, display: "grid", gap: 10, fontSize: 13 }}>
            <div><strong>Basic Salary Component:</strong> 50% of Monthly CTC</div>
            <div><strong>House Rent Allowance (HRA):</strong> 40% of Basic Pay</div>
            <div><strong>Employees' Provident Fund (EPF):</strong> 12% of Basic Pay (Statutory Max ₹1,800/mo cap eligible)</div>
            <div><strong>Employee State Insurance (ESIC):</strong> 0.75% of Gross Pay (for CTC &lt; ₹21,000)</div>
            <div><strong>Andhra Pradesh Professional Tax (AP PT):</strong> ₹200 / month flat statutory deduction</div>
          </div>
        </Card>
      )}

      {/* ====================================================================
          TAB 11: EMPLOYEE PAYOUTS
         ==================================================================== */}
      {activeTab === "employee-payouts" && (
        <Card style={{ borderRadius: 10, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: "var(--indigo)", fontWeight: 700 }}>
              💳 Bank NEFT Disbursement & Payout Vouchers
            </h3>
            <Button type="button" onClick={handleExportNeftLedger} style={{ fontSize: 12 }}>
              📥 Download NEFT CMS File
            </Button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Beneficiary</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Bank Account & IFSC</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Net Payout</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Payment Rail</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((s) => {
                  const net = s.salary - (s.epfDeduction || 0) - (s.tdsDeduction || 0) - 200;
                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <strong>{s.name}</strong>
                        <div style={{ fontSize: 11, color: "var(--slate)" }}>{s.email}</div>
                      </td>
                      <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12 }}>
                        {s.accountNo || "5010048912891"} · {s.ifscCode || "HDFC0001248"}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800, color: "#16A34A" }}>
                        {formatRupees(net)}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <span style={{ background: "#EEF2FF", color: "var(--indigo)", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                          NEFT CMS
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <StatusPill kind="success">PROCESSED</StatusPill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Upload Employee Modal matching Image 1 */}
      {uploadModalOpen && (
        <Modal
          isOpen={uploadModalOpen}
          title="Upload Employee Bulk Roster"
          onClose={() => setUploadModalOpen(false)}
        >
          <div style={{ display: "grid", gap: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--slate)" }}>
              Upload Excel (.xlsx) or CSV file containing employee personal details, roles, statutory identifiers, and salary structures.
            </p>

            <div
              style={{
                border: "2px dashed var(--indigo)",
                borderRadius: 10,
                padding: "28px 20px",
                textAlign: "center",
                background: "var(--wash-a)",
                cursor: "pointer",
              }}
              onClick={() => {
                triggerToast("Sample employee batch roster imported.");
                setUploadModalOpen(false);
              }}
            >
              <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>📁</span>
              <strong style={{ fontSize: 14, color: "var(--indigo)" }}>Click to browse or drag & drop CSV file</strong>
              <div style={{ fontSize: 11.5, color: "var(--slate)", marginTop: 4 }}>Maximum file size: 5MB</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => {
                  const csvSample = "Title,First Name,Last Name,Role,Gender,Phone,Email,DOB,Employee ID,Aadhaar,PAN,Department,Salary\nMr.,Ravi,Varma,billing,Male,9848012345,ravi.varma@yopmail.com,1993-04-12,MED-BIL-02,901234567890,ABCDE1234F,Cashier Billing Desk,35000\n";
                  const blob = new Blob([csvSample], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "Employee_Bulk_Upload_Template.csv";
                  a.click();
                  triggerToast("Template downloaded.");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--indigo)",
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                📥 Download Sample CSV Template
              </button>

              <Button ghost type="button" onClick={() => setUploadModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
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
          onSuccess={(updated) => {
            setStaffList((prev) =>
              prev.map((s) =>
                s.id === updated.staffId
                  ? { ...s, salary: updated.monthlyCtc, basicSalary: updated.basicSalary, hra: updated.hra }
                  : s
              )
            );
            setSalaryStructureModalOpen(false);
            triggerToast("Salary structure updated.");
          }}
        />
      )}

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
