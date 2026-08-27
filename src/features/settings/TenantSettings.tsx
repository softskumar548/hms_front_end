import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, FieldCell, Button, Select, StatusPill, Toast, Input } from "../../ui/components";

export default function TenantSettings() {
  const { t } = useTranslation();
  const { token, tenant, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab") || "config";

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Invite staff modal state (for Users tab)
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("doctor");
  const [inviteName, setInviteName] = useState("");

  // User Authentication tab state (Matching exact screenshots)
  const defaultAuthUsers = [
    {
      id: "1",
      name: "Mr. Dhanunjay yadav",
      phone: "9908030705",
      email: "dhanunjay.dhoni@gmail.com",
      role: "SUPER_ADMINISTRATOR",
    },
    {
      id: "2",
      name: "Dr. SATHVIK NANDAN",
      phone: "8884242466",
      email: "",
      role: "DOCTOR",
    },
  ];
  const [authUsers, setAuthUsers] = useState(() => {
    const saved = localStorage.getItem(`auth-users-${tenant}`);
    return saved ? JSON.parse(saved) : defaultAuthUsers;
  });
  const [authSearch, setAuthSearch] = useState("");
  const [showAddAuthModal, setShowAddAuthModal] = useState(false);
  const [selectedStaffForAuth, setSelectedStaffForAuth] = useState("Dr. SATHVIK NANDAN");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changingUser, setChangingUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const availableEmployees = [
    { name: "Dr. SATHVIK NANDAN", role: "DOCTOR", phone: "8884242466", email: "" },
    { name: "DR K R MURALI (Dean)", role: "SUPER_ADMINISTRATOR", phone: "9100242466", email: "drkrmurali9090@yopmail.com" },
    { name: "Dr. A. Sharma", role: "DOCTOR", phone: "9876543210", email: "dr.sharma@zenclinic.com" },
    { name: "Nurse Anjali", role: "NURSE", phone: "9845123456", email: "nurse.anjali@zenclinic.com" },
    { name: "Rajesh (Receptionist)", role: "RECEPTIONIST", phone: "9123456780", email: "reception@zenclinic.com" },
    { name: "Suresh (Biller)", role: "BILLING", phone: "9988776655", email: "billing@zenclinic.com" },
  ];

  // Configuration Master Category selection
  const [selectedConfigType, setSelectedConfigType] = useState("payment_type");
  const [configSearch, setConfigSearch] = useState("");
  const [showAddConfigModal, setShowAddConfigModal] = useState(false);
  const [newConfigCode, setNewConfigCode] = useState("");
  const [newConfigName, setNewConfigName] = useState("");
  const [newConfigDesc, setNewConfigDesc] = useState("");

  // Account Settings Sub-tabs & Fields (Matching Screenshot & Operator aware)
  const isOperator = role === "operator";
  const defaultOrgName = isOperator ? "ZEN SAAS PLATFORM" : (tenant ? tenant.replace(/[_|-]/g, " ").toUpperCase() : "ZEN CLINIC");
  const [accountSubTab, setAccountSubTab] = useState("general");
  const [projectName, setProjectName] = useState(
    localStorage.getItem(`project-name-${tenant}`) || defaultOrgName
  );
  const [adminName, setAdminName] = useState(
    localStorage.getItem(`admin-name-${tenant}`) || (isOperator ? "PLATFORM OPERATOR" : "DR K R MURALI")
  );
  const [adminPhone, setAdminPhone] = useState(
    localStorage.getItem(`admin-phone-${tenant}`) || "9100242466"
  );
  const [adminEmail, setAdminEmail] = useState(
    localStorage.getItem(`admin-email-${tenant}`) || (isOperator ? "operator@zensynq.com" : "drkrmurali9090@yopmail.com")
  );
  const [addressStreet, setAddressStreet] = useState(
    localStorage.getItem(`address-street-${tenant}`) || "srinivasa Nagar"
  );
  const [addressCity, setAddressCity] = useState(
    localStorage.getItem(`address-city-${tenant}`) || "Nandyal"
  );
  const [addressState, setAddressState] = useState(
    localStorage.getItem(`address-state-${tenant}`) || "Andhra Pradesh"
  );
  const [slotDuration, setSlotDuration] = useState("15");
  const [opdPrefix, setOpdPrefix] = useState("OPD-");
  const [lowStockThreshold, setLowStockThreshold] = useState("20");

  const configCategories = [
    { key: "payment_type", label: "Payment Type", desc: "Patient payment collection methods & cashier rails" },
    { key: "visit_type", label: "Visit Type", desc: "Clinical appointment and consultation categories" },
    { key: "order_status", label: "Order Status", desc: "Diagnostic lab and prescription order states" },
    { key: "clinic_type", label: "Clinic Type", desc: "Healthcare delivery facility and unit classification" },
    { key: "specialization", label: "Specialization", desc: "Medical specialty branches and doctor clinical fields" },
    { key: "room_type", label: "Room Type", desc: "Consultation chambers, procedure rooms, and exam bays" },
    { key: "floor_type", label: "Floor Type", desc: "Building levels, floor master, and wing sections" },
    { key: "bed_category", label: "Bed Category", desc: "Inpatient admission beds, ICU, and daycare recliners" },
    { key: "expense_category", label: "Expense Category", desc: "Operational expenditures and clinic expense heads" },
  ];

  // Default master datasets
  const [configData, setConfigData] = useState<Record<string, Array<{ id: string; code: string; name: string; description: string; active: boolean }>>>({
    payment_type: [
      { id: "1", code: "UPI", name: "UPI QR / Direct Transfer", description: "Real-time dynamic UPI QR collection", active: true },
      { id: "2", code: "CASH", name: "Cash Drawer Collection", description: "Physical cash till reconciliation", active: true },
      { id: "3", code: "CARD", name: "Credit / Debit Card (POS)", description: "Point of sale terminal card swipe", active: true },
      { id: "4", code: "PMJAY", name: "Aarogyasri / PMJAY 100% Cashless", description: "Government cashless scheme split", active: true },
      { id: "5", code: "INSURANCE", name: "Private TPA Insurance", description: "Third-party administrator cashless pre-auth", active: true },
    ],
    visit_type: [
      { id: "1", code: "NEW_OPD", name: "New Consultation Visit", description: "First-time outpatient consultation", active: true },
      { id: "2", code: "FOLLOW_UP", name: "Follow-up Visit", description: "Review consultation within validity window", active: true },
      { id: "3", code: "EMERGENCY", name: "Emergency / Triage", description: "Priority acute care consultation", active: true },
      { id: "4", code: "TELEHEALTH", name: "Telehealth Video Consult", description: "Remote telemedicine appointment", active: true },
      { id: "5", code: "ROUTINE_CHECKUP", name: "Preventive Health Check", description: "Executive comprehensive health screening", active: true },
    ],
    order_status: [
      { id: "1", code: "DRAFT", name: "Draft Order", description: "Clinical prescription order being drafted", active: true },
      { id: "2", code: "PENDING", name: "Pending Sample Collection", description: "Awaiting phlebotomy or imaging token", active: true },
      { id: "3", code: "IN_PROGRESS", name: "In Diagnostic Analysis", description: "Specimen under laboratory analyzer", active: true },
      { id: "4", code: "COMPLETED", name: "Resulted & Signed Off", description: "Verified diagnostic report generated", active: true },
      { id: "5", code: "CANCELLED", name: "Order Cancelled", description: "Voided or cancelled diagnostic test", active: true },
    ],
    clinic_type: [
      { id: "1", code: "OPD_GENERAL", name: "General Outpatient Clinic", description: "Primary care walk-in OPD", active: true },
      { id: "2", code: "OPD_SPECIALIST", name: "Super Specialty Clinic", description: "Specialized clinical consultation suites", active: true },
      { id: "3", code: "DIAGNOSTIC_LAB", name: "Diagnostic & Pathology Lab", description: "Clinical biochemistry and imaging lab", active: true },
      { id: "4", code: "PHARMACY_RETAIL", name: "Hospital Pharmacy", description: "Dispensing pharmacy and medical store", active: true },
      { id: "5", code: "DAY_CARE", name: "Daycare Chemotherapy / Infusion", description: "Short-stay ambulatory treatment unit", active: true },
    ],
    specialization: [
      { id: "1", code: "GEN_MED", name: "General Medicine", description: "Internal medicine & chronic illness care", active: true },
      { id: "2", code: "CARDIO", name: "Cardiology", description: "Heart disease, ECG, and echocardiography", active: true },
      { id: "3", code: "ORTHO", name: "Orthopedics & Joint Care", description: "Bone, joint, and musculoskeletal trauma", active: true },
      { id: "4", code: "PEDIA", name: "Pediatrics & Neonatology", description: "Child healthcare & immunization", active: true },
      { id: "5", code: "GYNAEC", name: "Obstetrics & Gynecology", description: "Women's reproductive & maternity care", active: true },
      { id: "6", code: "DERMA", name: "Dermatology", description: "Skin, hair, and laser aesthetic therapy", active: true },
      { id: "7", code: "OPHTHAL", name: "Ophthalmology", description: "Eye examination & vision diagnostics", active: true },
    ],
    room_type: [
      { id: "1", code: "CONSULT_ROOM", name: "Doctor Consultation Room", description: "Private physician examination chamber", active: true },
      { id: "2", code: "TRIAGE_BAY", name: "Nurse Triage & Vitals Bay", description: "Blood pressure, SpO2, and vitals recording", active: true },
      { id: "3", code: "MINOR_OT", name: "Minor Procedure Room", description: "Dressing, suturing, and minor surgical room", active: true },
      { id: "4", code: "XRAY_ROOM", name: "Radiology / X-Ray Suite", description: "Lead-shielded digital radiography room", active: true },
      { id: "5", code: "SAMPLE_BOOTH", name: "Phlebotomy Collection Booth", description: "Blood and urine sample collection cubicle", active: true },
    ],
    floor_type: [
      { id: "1", code: "GROUND", name: "Ground Floor", description: "Main Reception, Emergency, and Registration", active: true },
      { id: "2", code: "FIRST", name: "First Floor", description: "Physician Consultation Chambers & Minor OT", active: true },
      { id: "3", code: "SECOND", name: "Second Floor", description: "Diagnostic Laboratories & Ultrasound Room", active: true },
      { id: "4", code: "BASEMENT", name: "Basement Level", description: "Medical Records & Pharmacy Storage", active: true },
    ],
    bed_category: [
      { id: "1", code: "GEN_WARD", name: "General Ward Bed", description: "Multi-occupancy inpatient recovery bed", active: true },
      { id: "2", code: "SEMI_PVT", name: "Semi-Private Room Bed", description: "Two-sharing air-conditioned room", active: true },
      { id: "3", code: "PVT_DELUXE", name: "Private Deluxe Room", description: "Single patient private luxury suite", active: true },
      { id: "4", code: "ICU_BED", name: "Intensive Care Unit (ICU)", description: "High-dependency motorized bed with ventilator", active: true },
      { id: "5", code: "DAYCARE_REC", name: "Daycare Infusion Recliner", description: "Comfortable ergonomic chemotherapy recliner", active: true },
    ],
    expense_category: [
      { id: "1", code: "MED_STOCK", name: "Pharmacy & Surgical Consumables", description: "Procurement of medicines and clinical gloves", active: true },
      { id: "2", code: "LAB_REAGENT", name: "Diagnostic Reagents & Kits", description: "Biochemistry reagents, test tubes, and vacutainers", active: true },
      { id: "3", code: "FACILITY_UTIL", name: "Electricity & Biomedical Waste", description: "Power backup, biomedical disposal, and water", active: true },
      { id: "4", code: "STAFF_SALARY", name: "Staff Payroll & Honorarium", description: "Doctor consultation revenue split & staff wages", active: true },
      { id: "5", code: "IT_SOFTWARE", name: "SaaS & Compliance Subscriptions", description: "Hospital Management System and cloud hosting", active: true },
    ],
  });

  // Safe editable state (locale preferences)
  const [dateFormat, setDateFormat] = useState(
    localStorage.getItem("settings-date-format") || "DD MMM YYYY"
  );
  const [numberFormat, setNumberFormat] = useState(
    localStorage.getItem("settings-number-format") || "en-IN"
  );

  // Print settings
  const [printHeader, setPrintHeader] = useState(
    localStorage.getItem(`print-header-${tenant}`) || `${(tenant || "ZEN CLINIC").toUpperCase()} SPECIALTY MEDICAL CENTER`
  );
  const [printPhone, setPrintPhone] = useState(
    localStorage.getItem(`print-phone-${tenant}`) || "+91 91002 42466"
  );
  const [includeBarcode, setIncludeBarcode] = useState(true);

  // Brand config
  const [brandName, setBrandName] = useState(
    localStorage.getItem(`brand-name-${tenant}`) || defaultOrgName
  );
  const [brandColor, setBrandColor] = useState(
    localStorage.getItem(`brand-color-${tenant}`) || "#131A8F"
  );
  const [accentColor, setAccentColor] = useState(
    localStorage.getItem(`accent-color-${tenant}`) || "#5FC6E9"
  );

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleSaveLocale = () => {
    localStorage.setItem("settings-date-format", dateFormat);
    localStorage.setItem("settings-number-format", numberFormat);
    triggerToast("Locale preferences saved successfully!");
  };

  const handleSavePrint = () => {
    localStorage.setItem(`print-header-${tenant}`, printHeader);
    localStorage.setItem(`print-phone-${tenant}`, printPhone);
    triggerToast("Print & Receipt template settings saved!");
  };

  const handleSaveBrand = () => {
    localStorage.setItem(`brand-name-${tenant}`, brandName);
    localStorage.setItem(`brand-color-${tenant}`, brandColor);
    localStorage.setItem(`accent-color-${tenant}`, accentColor);
    triggerToast("Branding settings updated successfully!");
  };

  const handleSaveGeneral = () => {
    localStorage.setItem(`project-name-${tenant}`, projectName);
    localStorage.setItem(`admin-name-${tenant}`, adminName);
    localStorage.setItem(`admin-phone-${tenant}`, adminPhone);
    localStorage.setItem(`admin-email-${tenant}`, adminEmail);
    localStorage.setItem(`address-street-${tenant}`, addressStreet);
    localStorage.setItem(`address-city-${tenant}`, addressCity);
    localStorage.setItem(`address-state-${tenant}`, addressState);
    triggerToast("General account information updated successfully!");
  };

  const handleSaveAuthUser = () => {
    if (!authPassword || authPassword !== authConfirmPassword) {
      triggerToast("Passwords do not match or are empty!");
      return;
    }
    const emp = availableEmployees.find((e) => e.name === selectedStaffForAuth) || {
      name: selectedStaffForAuth,
      role: "DOCTOR",
      phone: "8884242466",
      email: "",
    };
    const newUser = {
      id: String(Date.now()),
      name: emp.name,
      phone: emp.phone,
      email: emp.email,
      role: emp.role,
    };
    const updated = [...authUsers, newUser];
    setAuthUsers(updated);
    localStorage.setItem(`auth-users-${tenant}`, JSON.stringify(updated));
    setShowAddAuthModal(false);
    setAuthPassword("");
    setAuthConfirmPassword("");
    triggerToast(`Authentication access granted to ${emp.name}!`);
  };

  const handleSaveChangedPassword = () => {
    if (!newPassword || newPassword !== confirmNewPassword) {
      triggerToast("Passwords do not match or are empty!");
      return;
    }
    setShowChangePasswordModal(false);
    setNewPassword("");
    setConfirmNewPassword("");
    triggerToast(`Password changed successfully for ${changingUser?.name}!`);
  };

  const handleRemoveAuthUser = (id: string, name: string) => {
    const updated = authUsers.filter((u: any) => u.id !== id);
    setAuthUsers(updated);
    localStorage.setItem(`auth-users-${tenant}`, JSON.stringify(updated));
    triggerToast(`Access removed for ${name}`);
  };

  const handleToggleActive = (type: string, id: string) => {
    setConfigData((prev) => {
      const items = prev[type] || [];
      const updated = items.map((item) => (item.id === id ? { ...item, active: !item.active } : item));
      return { ...prev, [type]: updated };
    });
    triggerToast("Item status updated!");
  };

  const handleAddConfigItem = () => {
    if (!newConfigName) return;
    const newItem = {
      id: String(Date.now()),
      code: newConfigCode.toUpperCase() || newConfigName.replace(/\s+/g, "_").toUpperCase(),
      name: newConfigName,
      description: newConfigDesc || "Configured master item",
      active: true,
    };
    setConfigData((prev) => ({
      ...prev,
      [selectedConfigType]: [...(prev[selectedConfigType] || []), newItem],
    }));
    setShowAddConfigModal(false);
    setNewConfigCode("");
    setNewConfigName("");
    setNewConfigDesc("");
    triggerToast("New configuration item added!");
  };

  const currentCategoryInfo = configCategories.find((c) => c.key === selectedConfigType) || configCategories[0];
  const currentItems = (configData[selectedConfigType] || []).filter((item) => {
    const q = configSearch.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
  });

  const filteredAuthUsers = authUsers.filter((u: any) => {
    const q = authSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  // Close any active modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showAddConfigModal) {
          setShowAddConfigModal(false);
          e.preventDefault();
        } else if (showAddAuthModal) {
          setShowAddAuthModal(false);
          e.preventDefault();
        } else if (showChangePasswordModal) {
          setShowChangePasswordModal(false);
          e.preventDefault();
        } else if (showInviteModal) {
          setShowInviteModal(false);
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAddConfigModal, showAddAuthModal, showChangePasswordModal, showInviteModal]);

  // Fetch practitioners for Users tab (safely handles operator tenant)
  const { data: practitioners = [] } = useQuery({
    queryKey: ["practitioners", tenant],
    queryFn: () => (tenant && tenant !== "__operator__" ? api.listPractitioners(token) : Promise.resolve([])),
    retry: false,
  });

  const inviteStaffMutation = useMutation({
    mutationFn: () =>
      api.inviteStaff(token, tenant || "zen_clinic", {
        email: inviteEmail,
        role: inviteRole,
        given_name: inviteName.split(" ")[0] || "Staff",
        family_name: inviteName.split(" ")[1] || "Member",
      }),
    onSuccess: () => {
      triggerToast(`Invitation sent to ${inviteEmail} (${inviteRole})!`);
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteName("");
      qc.invalidateQueries({ queryKey: ["practitioners"] });
    },
    onError: (err: any) => {
      triggerToast(err.message || "Failed to dispatch staff invitation.");
    },
  });

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* TAB 1: CONFIGURATION (Dropdown-driven Configuration Master) */}
      {activeTab === "config" && (
        <div style={{ display: "grid", gap: 18 }}>
          {/* Top Cyan / Brand Breadcrumb Banner */}
          <div
            style={{
              background: "#00BCD4",
              borderRadius: "14px 14px 0 0",
              padding: "12px 20px",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            <span style={{ fontSize: 16 }}>Configuration</span>
            <span style={{ fontSize: 13, opacity: 0.8 }}>🏠 Configuration</span>
          </div>

          {/* Configuration Selection Card */}
          <Card style={{ marginTop: -14, borderRadius: "0 0 18px 18px", borderTop: "none" }}>
            <div style={{ display: "grid", gap: 16 }}>
              {/* Dropdown Selector */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Select Master Configuration
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    value={selectedConfigType}
                    onChange={(e) => setSelectedConfigType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "var(--r-field, 12px)",
                      border: "2px solid #5B6172",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--ink, #23263B)",
                      background: "#ffffff",
                      cursor: "pointer",
                      outline: "none",
                      appearance: "none",
                    }}
                  >
                    {configCategories.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <span
                    style={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: "var(--slate)",
                      fontWeight: 800,
                    }}
                  >
                    ▼
                  </span>
                </div>
              </div>

              {/* Category Header & Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: 16, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--indigo)", margin: "0 0 2px" }}>
                    {currentCategoryInfo.label} Master
                  </h3>
                  <span style={{ fontSize: 12.5, color: "var(--slate)" }}>{currentCategoryInfo.desc}</span>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Input
                    placeholder="Search items..."
                    value={configSearch}
                    onChange={(e) => setConfigSearch(e.target.value)}
                    style={{ width: 220 }}
                  />
                  <Button onClick={() => setShowAddConfigModal(true)}>+ Add {currentCategoryInfo.label}</Button>
                </div>
              </div>

              {/* Data Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                      <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Code</th>
                      <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Name / Label</th>
                      <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Description</th>
                      <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Status</th>
                      <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid var(--line)" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--indigo)" }}>
                          <span style={{ background: "var(--wash-b)", padding: "4px 8px", borderRadius: 6 }}>
                            {item.code}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", fontWeight: 600 }}>{item.name}</td>
                        <td style={{ padding: "12px 14px", color: "var(--slate)" }}>{item.description}</td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <StatusPill kind={item.active ? "success" : "danger"}>
                            {item.active ? "ACTIVE" : "INACTIVE"}
                          </StatusPill>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right" }}>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(selectedConfigType, item.id)}
                            style={{
                              background: "none",
                              border: "1px solid var(--line)",
                              borderRadius: "var(--r-pill)",
                              padding: "4px 10px",
                              fontSize: 12,
                              fontWeight: 700,
                              color: item.active ? "var(--danger)" : "var(--green)",
                              cursor: "pointer",
                            }}
                          >
                            {item.active ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {currentItems.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--slate)" }}>
                          No configuration items found for {currentCategoryInfo.label}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Add Configuration Modal */}
          {showAddConfigModal && (
            <div
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "grid", placeItems: "center", zIndex: 99999, padding: 20 }}
              onClick={() => setShowAddConfigModal(false)}
            >
              <Card
                style={{ width: "100%", maxWidth: 460, padding: 24, borderRadius: 20, boxShadow: "var(--shadow-pop)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--indigo)", margin: 0 }}>
                    Add New {currentCategoryInfo.label}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddConfigModal(false)}
                    aria-label="Close modal"
                    style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--slate)" }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ display: "grid", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                      Code / Key
                    </label>
                    <Input
                      autoFocus
                      placeholder="e.g. UPI_SPECIAL"
                      value={newConfigCode}
                      onChange={(e) => setNewConfigCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newConfigName) handleAddConfigItem();
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                      Display Name <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <Input
                      placeholder="e.g. VIP Consultation"
                      value={newConfigName}
                      onChange={(e) => setNewConfigName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newConfigName) handleAddConfigItem();
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                      Description
                    </label>
                    <Input
                      placeholder="Description of this configuration"
                      value={newConfigDesc}
                      onChange={(e) => setNewConfigDesc(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newConfigName) handleAddConfigItem();
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                    <Button ghost type="button" onClick={() => setShowAddConfigModal(false)}>
                      Cancel
                    </Button>
                    <Button type="button" disabled={!newConfigName} onClick={handleAddConfigItem}>
                      Save Item
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BRAND SETTINGS */}
      {activeTab === "brand" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              Hospital Brand Identity
            </h2>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Display Hospital Name
                </label>
                <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                    Primary Theme Color
                  </label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} style={{ width: 36, height: 36, border: "none", borderRadius: 6, cursor: "pointer" }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{brandColor}</span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                    Accent Highlight Color
                  </label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ width: 36, height: 36, border: "none", borderRadius: 6, cursor: "pointer" }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{accentColor}</span>
                  </div>
                </div>
              </div>

              <FieldCell label="Custom Hospital Subdomain" sub="SaaS endpoint mapped">
                https://{tenant || "zen_clinic"}.hms.zensynq.com
              </FieldCell>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <Button onClick={handleSaveBrand}>Save Brand Settings</Button>
              </div>
            </div>
          </Card>

          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              Branded Header Preview
            </h2>
            <div style={{ padding: 20, borderRadius: 16, background: "var(--wash-a)", border: `2px dashed ${accentColor}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ background: brandColor, color: "#fff", width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 18 }}>
                    🏥
                  </div>
                  <div>
                    <strong style={{ fontSize: 17, color: "var(--indigo)", display: "block" }}>{brandName}</strong>
                    <span style={{ fontSize: 12, color: "var(--slate)" }}>Andhra Pradesh, India · ABDM Active</span>
                  </div>
                </div>
                <StatusPill kind="brand">VERIFIED</StatusPill>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--slate)", margin: 0, lineHeight: 1.5 }}>
                This branding appears on your patient portals, digital prescription letterheads, and MediPass flight-style boarding stubs.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: PRINT SETTINGS */}
      {activeTab === "print" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              Prescription & Receipt Letterhead
            </h2>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Letterhead Top Header Line
                </label>
                <Input value={printHeader} onChange={(e) => setPrintHeader(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Clinic Contact Numbers for Receipts
                </label>
                <Input value={printPhone} onChange={(e) => setPrintPhone(e.target.value)} />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="barcode-chk"
                  checked={includeBarcode}
                  onChange={(e) => setIncludeBarcode(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <label htmlFor="barcode-chk" style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                  Print 2D / Code-128 Barcodes on MediPass appointment stubs
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <Button onClick={handleSavePrint}>Save Print Settings</Button>
              </div>
            </div>
          </Card>

          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              Print Output Preview
            </h2>
            <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 10, padding: 18, fontFamily: "monospace", fontSize: 12 }}>
              <div style={{ textAlign: "center", borderBottom: "1px dashed #000", paddingBottom: 8, marginBottom: 8 }}>
                <strong>{printHeader}</strong>
                <div>Ph: {printPhone} | GSTIN / Registration: AP-2026-MED</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0" }}>
                <span>PATIENT: VENKATA RAMA RAO</span>
                <span>TOKEN: #004</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0" }}>
                <span>CONSULTANT: DR K R MURALI (DEAN)</span>
                <span>DATE: 23-AUG-2026</span>
              </div>
              {includeBarcode && (
                <div style={{ textAlign: "center", borderTop: "1px dashed #000", paddingTop: 8, marginTop: 8, letterSpacing: 4, fontWeight: 700 }}>
                  ||| ||||| |||| |||||| |||| |||
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: ACCOUNT SETTINGS (Detailed Split Layout Matching User Screenshot) */}
      {activeTab === "account" && (
        <div style={{ display: "grid", gap: 16 }}>
          {/* Top Cyan Breadcrumb Banner */}
          <div
            style={{
              background: "#00BCD4",
              borderRadius: "14px 14px 0 0",
              padding: "12px 20px",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            <span style={{ fontSize: 16 }}>Settings</span>
            <span style={{ fontSize: 13, opacity: 0.85 }}>🏠 Account Setting Details</span>
          </div>

          {/* Subscription Package Summary Card */}
          <Card style={{ marginTop: -12, borderRadius: "0 0 16px 16px", borderTop: "none" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, fontSize: 13, lineHeight: 1.8 }}>
              {/* Left Column Info */}
              <div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--ink)", width: 130 }}>Package Name :</strong>
                  <span style={{ color: "var(--indigo)", fontWeight: 700 }}>HMS Basic Subscription Annual</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 130 }}>Expiry Date :</strong>
                  <span>25/07/2026</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 130 }}>Admins :</strong>
                  <span>1</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 130 }}>Staff :</strong>
                  <span>3</span>
                </div>
              </div>

              {/* Right Column Info */}
              <div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 140 }}>Beds Limit :</strong>
                  <span>15</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 140 }}>Doctors Limit :</strong>
                  <span>5</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 140 }}>SMS Count :</strong>
                  <span>200</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 140 }}>Email Count :</strong>
                  <span>500</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 140 }}>Whatsapp Count :</strong>
                  <span>1000</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Split View: Left Sub-Tabs Navigation & Right Form Content */}
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20, alignItems: "start" }}>
            {/* Left Sub-tabs List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { key: "general", label: "General Settings" },
                { key: "schedule", label: "Schedule Settings" },
                { key: "print", label: "Print Settings" },
                { key: "op", label: "OP Settings" },
                { key: "ip", label: "IP Settings" },
                { key: "lab", label: "Lab Settings" },
                { key: "pharmacy", label: "Pharmacy Settings" },
                { key: "radiology", label: "Radiology Settings" },
                { key: "lis", label: "LIS Configuration" },
                { key: "attendance", label: "Attendance Settings" },
              ].map((tab) => {
                const isActive = accountSubTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setAccountSubTab(tab.key)}
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: isActive ? "#5C6BC0" : "#ffffff",
                      color: isActive ? "#ffffff" : "var(--slate)",
                      border: "1px solid var(--line)",
                      fontWeight: isActive ? 800 : 600,
                      fontSize: 13.5,
                      cursor: "pointer",
                      boxShadow: isActive ? "0 4px 12px rgba(92, 107, 192, 0.3)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Right Settings Panel */}
            <Card style={{ padding: 24 }}>
              {accountSubTab === "general" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--indigo)", letterSpacing: "0.05em", margin: "0 0 10px", textTransform: "uppercase" }}>
                    GENERAL INFORMATION
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center", gap: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)" }}>Project Name</label>
                    <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center", gap: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)" }}>Name</label>
                    <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center", gap: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)" }}>Phone</label>
                    <Input value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center", gap: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)" }}>Email</label>
                    <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "start", gap: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)", paddingTop: 10 }}>Address</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 10 }}>
                      <Input placeholder="Street / Area" value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} />
                      <Input placeholder="City / District" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} />
                      <Select value={addressState} onChange={(e) => setAddressState(e.target.value)}>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Maharashtra">Maharashtra</option>
                      </Select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "start", gap: 16, marginTop: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)", paddingTop: 10 }}>Logo</label>
                    <div
                      style={{
                        border: "2px dashed var(--line)",
                        borderRadius: "var(--r-field, 12px)",
                        padding: "24px 20px",
                        textAlign: "center",
                        background: "var(--wash-a)",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 4 }}>📁</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--indigo)" }}>
                        Drop files here to upload
                      </div>
                      <span style={{ fontSize: 11.5, color: "var(--slate)" }}>PNG, JPG, SVG up to 2MB</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <Button onClick={handleSaveGeneral}>Save General Information</Button>
                  </div>
                </div>
              )}

              {accountSubTab === "schedule" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--indigo)", letterSpacing: "0.05em", margin: "0 0 10px", textTransform: "uppercase" }}>
                    SCHEDULE CONFIGURATION
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center", gap: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)" }}>Consultation Slot Duration</label>
                    <Select value={slotDuration} onChange={(e) => setSlotDuration(e.target.value)}>
                      <option value="15">15 Minutes (Standard OPD)</option>
                      <option value="20">20 Minutes (Specialist OPD)</option>
                      <option value="30">30 Minutes (Comprehensive Review)</option>
                    </Select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center", gap: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)" }}>Daily Overbooking Buffer</label>
                    <Input defaultValue="5 emergency walk-in tokens" />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <Button onClick={() => triggerToast("Schedule parameters saved!")}>Save Schedule Settings</Button>
                  </div>
                </div>
              )}

              {accountSubTab === "print" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--indigo)", letterSpacing: "0.05em", margin: "0 0 10px", textTransform: "uppercase" }}>
                    PRINT & RECEIPT TEMPLATES
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center", gap: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)" }}>Letterhead Header Line</label>
                    <Input value={printHeader} onChange={(e) => setPrintHeader(e.target.value)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center", gap: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)" }}>Receipt Contact Phone</label>
                    <Input value={printPhone} onChange={(e) => setPrintPhone(e.target.value)} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <Button onClick={handleSavePrint}>Save Print Settings</Button>
                  </div>
                </div>
              )}

              {accountSubTab === "op" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--indigo)", letterSpacing: "0.05em", margin: "0 0 10px", textTransform: "uppercase" }}>
                    OUTPATIENT (OPD) PARAMETERS
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center", gap: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)" }}>OPD Token Prefix</label>
                    <Input value={opdPrefix} onChange={(e) => setOpdPrefix(e.target.value)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center", gap: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)" }}>Follow-up Free Validity</label>
                    <Select defaultValue="7">
                      <option value="7">7 Days window</option>
                      <option value="14">14 Days window</option>
                      <option value="30">30 Days window</option>
                    </Select>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <Button onClick={() => triggerToast("OPD parameters saved!")}>Save OP Settings</Button>
                  </div>
                </div>
              )}

              {accountSubTab === "ip" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--indigo)", letterSpacing: "0.05em", margin: "0 0 10px", textTransform: "uppercase" }}>
                    INPATIENT (IPD) PARAMETERS
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center", gap: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)" }}>Admission Initial Deposit</label>
                    <Input defaultValue="₹5,000.00" />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <Button onClick={() => triggerToast("IPD admission parameters saved!")}>Save IP Settings</Button>
                  </div>
                </div>
              )}

              {accountSubTab === "lab" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--indigo)", letterSpacing: "0.05em", margin: "0 0 10px", textTransform: "uppercase" }}>
                    LABORATORY & PATHOLOGY SETTINGS
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center", gap: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)" }}>Specimen Barcode Prefix</label>
                    <Input defaultValue="LAB-" />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <Button onClick={() => triggerToast("Lab parameters saved!")}>Save Lab Settings</Button>
                  </div>
                </div>
              )}

              {accountSubTab === "pharmacy" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--indigo)", letterSpacing: "0.05em", margin: "0 0 10px", textTransform: "uppercase" }}>
                    PHARMACY & DRUG DISPENSING SETTINGS
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center", gap: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)" }}>Low Stock Threshold</label>
                    <Input value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <Button onClick={() => triggerToast("Pharmacy parameters saved!")}>Save Pharmacy Settings</Button>
                  </div>
                </div>
              )}

              {accountSubTab === "radiology" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--indigo)", letterSpacing: "0.05em", margin: "0 0 10px", textTransform: "uppercase" }}>
                    RADIOLOGY & PACS SETTINGS
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center", gap: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)" }}>PACS DICOM Server URL</label>
                    <Input defaultValue="pacs.zensynq.com:11112" />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <Button onClick={() => triggerToast("Radiology parameters saved!")}>Save Radiology Settings</Button>
                  </div>
                </div>
              )}

              {accountSubTab === "lis" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--indigo)", letterSpacing: "0.05em", margin: "0 0 10px", textTransform: "uppercase" }}>
                    LIS (LAB INFORMATION SYSTEM) BRIDGE
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center", gap: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)" }}>HL7 / FHIR Interface Port</label>
                    <Input defaultValue="8443" />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <Button onClick={() => triggerToast("LIS parameters saved!")}>Save LIS Settings</Button>
                  </div>
                </div>
              )}

              {accountSubTab === "attendance" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--indigo)", letterSpacing: "0.05em", margin: "0 0 10px", textTransform: "uppercase" }}>
                    STAFF BIOMETRIC & ATTENDANCE SETTINGS
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center", gap: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "var(--slate)" }}>Biometric Device IP</label>
                    <Input defaultValue="192.168.1.240" />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <Button onClick={() => triggerToast("Attendance parameters saved!")}>Save Attendance Settings</Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* TAB 5: USER AUTHENTICATION (Matching User's Exact Screenshots) */}
      {activeTab === "auth" && (
        <div style={{ display: "grid", gap: 16 }}>
          {/* Top Cyan Breadcrumb Bar with Add button */}
          <div
            style={{
              background: "#00BCD4",
              borderRadius: "14px 14px 0 0",
              padding: "12px 20px",
              color: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700 }}>
              <span style={{ fontSize: 16 }}>User Authentication</span>
              <span style={{ fontSize: 13, opacity: 0.85 }}>🏠 User Details</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedStaffForAuth(availableEmployees[0].name);
                setAuthPassword("");
                setAuthConfirmPassword("");
                setShowAddAuthModal(true);
              }}
              style={{
                background: "#ffffff",
                color: "#00BCD4",
                border: "none",
                borderRadius: 6,
                padding: "6px 18px",
                fontWeight: 800,
                fontSize: 13.5,
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              Add
            </button>
          </div>

          {/* Search Card Container */}
          <Card style={{ marginTop: -14, borderRadius: "0 0 16px 16px", borderTop: "none", padding: "16px 20px" }}>
            <div style={{ display: "flex", width: "100%", maxWidth: 360, marginBottom: 16 }}>
              <input
                placeholder="Search"
                value={authSearch}
                onChange={(e) => setAuthSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px 14px",
                  border: "1px solid #d1d5db",
                  borderRight: "none",
                  borderRadius: "6px 0 0 6px",
                  outline: "none",
                  fontSize: 13.5,
                }}
              />
              <button
                type="button"
                style={{
                  background: "#5C6BC0",
                  color: "#ffffff",
                  border: "none",
                  padding: "0 14px",
                  borderRadius: "0 6px 6px 0",
                  cursor: "pointer",
                  fontSize: 14,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                🔍
              </button>
            </div>

            {/* Table with Blue Header */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: "#5C6BC0", color: "#ffffff" }}>
                    <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 700, fontSize: 12, letterSpacing: "0.05em" }}>NAME</th>
                    <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 700, fontSize: 12, letterSpacing: "0.05em" }}>PHONE NO</th>
                    <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 700, fontSize: 12, letterSpacing: "0.05em" }}>EMAIL</th>
                    <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 700, fontSize: 12, letterSpacing: "0.05em" }}>ROLE</th>
                    <th style={{ textAlign: "center", padding: "10px 16px", fontWeight: 700, fontSize: 12, letterSpacing: "0.05em" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuthUsers.map((user: any) => (
                    <tr key={user.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--ink)" }}>{user.name}</td>
                      <td style={{ padding: "12px 16px", color: "var(--slate)" }}>{user.phone}</td>
                      <td style={{ padding: "12px 16px", color: "var(--slate)" }}>{user.email || "-"}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--indigo)" }}>{user.role}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setChangingUser(user);
                              setNewPassword("");
                              setConfirmNewPassword("");
                              setShowChangePasswordModal(true);
                            }}
                            style={{
                              background: "#5C6BC0",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: 6,
                              padding: "6px 12px",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Change Password
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveAuthUser(user.id, user.name)}
                            style={{
                              background: "#E53935",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: 6,
                              padding: "6px 12px",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Remove Access
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAuthUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--slate)" }}>
                        No authenticated users found. Click &quot;Add&quot; to provision login credentials.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Add User Authentication Modal (Exact from Screenshot 2) */}
          {showAddAuthModal && (
            <div
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", zIndex: 99999, padding: 20 }}
              onClick={() => setShowAddAuthModal(false)}
            >
              <div
                style={{ background: "#ffffff", width: "100%", maxWidth: 440, borderRadius: 12, padding: "24px 28px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>Add User Authentication</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddAuthModal(false)}
                    aria-label="Close modal"
                    style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--slate)" }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: "grid", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", display: "block", marginBottom: 6 }}>
                      Employee Name <span style={{ color: "red" }}>*</span>
                    </label>
                    <Select
                      value={selectedStaffForAuth}
                      onChange={(e) => setSelectedStaffForAuth(e.target.value)}
                    >
                      {availableEmployees.map((emp) => (
                        <option key={emp.name} value={emp.name}>
                          {emp.name} ({emp.role})
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", display: "block", marginBottom: 6 }}>
                      Password <span style={{ color: "red" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        autoFocus
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && authPassword && authConfirmPassword) handleSaveAuthUser();
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 38px 10px 14px",
                          borderRadius: 8,
                          border: "1px solid #d1d5db",
                          outline: "none",
                          fontSize: 13.5,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 15,
                          color: "var(--slate)",
                        }}
                      >
                        {showPassword ? "👁️" : "🙈"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", display: "block", marginBottom: 6 }}>
                      Confirm Password <span style={{ color: "red" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={authConfirmPassword}
                        onChange={(e) => setAuthConfirmPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && authPassword && authConfirmPassword) handleSaveAuthUser();
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 38px 10px 14px",
                          borderRadius: 8,
                          border: "1px solid #d1d5db",
                          outline: "none",
                          fontSize: 13.5,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 15,
                          color: "var(--slate)",
                        }}
                      >
                        {showConfirmPassword ? "👁️" : "🙈"}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={handleSaveAuthUser}
                      disabled={!authPassword || !authConfirmPassword}
                      style={{
                        background: "#5C6BC0",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 6,
                        padding: "10px 24px",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Change Password Modal */}
          {showChangePasswordModal && (
            <div
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", zIndex: 99999, padding: 20 }}
              onClick={() => setShowChangePasswordModal(false)}
            >
              <div
                style={{ background: "#ffffff", width: "100%", maxWidth: 440, borderRadius: 12, padding: "24px 28px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>Change Password</h3>
                  <button
                    type="button"
                    onClick={() => setShowChangePasswordModal(false)}
                    aria-label="Close modal"
                    style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--slate)" }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ fontSize: 13, color: "var(--slate)", marginBottom: 14 }}>
                  Changing password for: <strong style={{ color: "var(--indigo)" }}>{changingUser?.name}</strong>
                </div>

                <div style={{ display: "grid", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", display: "block", marginBottom: 6 }}>
                      New Password <span style={{ color: "red" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        autoFocus
                        type={showNewPassword ? "text" : "password"}
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newPassword && confirmNewPassword) handleSaveChangedPassword();
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 38px 10px 14px",
                          borderRadius: 8,
                          border: "1px solid #d1d5db",
                          outline: "none",
                          fontSize: 13.5,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 15,
                          color: "var(--slate)",
                        }}
                      >
                        {showNewPassword ? "👁️" : "🙈"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", display: "block", marginBottom: 6 }}>
                      Confirm New Password <span style={{ color: "red" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showConfirmNewPassword ? "text" : "password"}
                        placeholder="Confirm New Password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newPassword && confirmNewPassword) handleSaveChangedPassword();
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 38px 10px 14px",
                          borderRadius: 8,
                          border: "1px solid #d1d5db",
                          outline: "none",
                          fontSize: 13.5,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 15,
                          color: "var(--slate)",
                        }}
                      >
                        {showConfirmNewPassword ? "👁️" : "🙈"}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                    <Button ghost type="button" onClick={() => setShowChangePasswordModal(false)}>
                      Cancel
                    </Button>
                    <button
                      type="button"
                      onClick={handleSaveChangedPassword}
                      disabled={!newPassword || !confirmNewPassword}
                      style={{
                        background: "#5C6BC0",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 6,
                        padding: "10px 24px",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: USERS & STAFF */}
      {activeTab === "users" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 4px", color: "var(--indigo)" }}>
                Hospital Practitioners & Staff Directory
              </h2>
              <span style={{ fontSize: 13, color: "var(--slate)" }}>
                Manage login identities, roles, and consultation availability.
              </span>
            </div>
            <Button onClick={() => setShowInviteModal(true)}>+ Invite New Staff</Button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Staff Name</th>
                <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Email / Username</th>
                <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Role</th>
                <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--indigo)" }}>DR K R MURALI (Dean)</td>
                <td style={{ padding: "12px 14px" }}>drkrmurali9090@yopmail.com</td>
                <td style={{ padding: "12px 14px" }}><StatusPill kind="brand">admin</StatusPill></td>
                <td style={{ padding: "12px 14px" }}><StatusPill kind="success">Active (Keycloak)</StatusPill></td>
              </tr>
              {practitioners.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 700 }}>{p.name}</td>
                  <td style={{ padding: "12px 14px" }}>{p.email || `${p.id}@${tenant || "zen_clinic"}.com`}</td>
                  <td style={{ padding: "12px 14px" }}><StatusPill kind="info">{p.role || "doctor"}</StatusPill></td>
                  <td style={{ padding: "12px 14px" }}><StatusPill kind="success">Active</StatusPill></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Staff Invite Modal */}
          {showInviteModal && (
            <div
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", zIndex: 9999, padding: 20 }}
              onClick={() => setShowInviteModal(false)}
            >
              <Card
                style={{ width: "100%", maxWidth: 440, padding: 24, borderRadius: 20, boxShadow: "var(--shadow-pop)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--indigo)", margin: 0 }}>
                    Invite Hospital Staff
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    aria-label="Close modal"
                    style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--slate)" }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ display: "grid", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>Full Name</label>
                    <Input
                      autoFocus
                      placeholder="e.g. Dr. A. Sharma"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && inviteEmail && !inviteStaffMutation.isPending) inviteStaffMutation.mutate();
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>Email Address <span style={{ color: "var(--danger)" }}>*</span></label>
                    <Input
                      placeholder="e.g. doctor@zen_clinic.com"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && inviteEmail && !inviteStaffMutation.isPending) inviteStaffMutation.mutate();
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>Role Assignment</label>
                    <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                      <option value="doctor">Doctor / Clinician (OPD & EMR)</option>
                      <option value="nurse">Nurse (Triage & Vitals)</option>
                      <option value="receptionist">Receptionist (Check-in & Scheduling)</option>
                      <option value="billing">Billing Clerk (Cashier & Invoicing)</option>
                      <option value="admin">Tenant Administrator</option>
                    </Select>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                    <Button ghost type="button" onClick={() => setShowInviteModal(false)}>Cancel</Button>
                    <Button
                      type="button"
                      disabled={!inviteEmail || inviteStaffMutation.isPending}
                      onClick={() => inviteStaffMutation.mutate()}
                    >
                      {inviteStaffMutation.isPending ? "Sending..." : "Send Invitation"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </Card>
      )}

      {/* TAB 7: PAYMENT SETTINGS */}
      {activeTab === "payment" && (
        <Card>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
            Cashier Till & Payment Gateway Parameters
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ display: "grid", gap: 14 }}>
              <FieldCell label="Accepted Payment Modes" sub="Configured payment collection rails">
                UPI QR, Cash Drawer, Card (POS Terminal)
              </FieldCell>
              <FieldCell label="Cashier Daily Till Variance Threshold" sub="Triggers till reconciliation warning">
                ₹500.00
              </FieldCell>
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 10 }}>
                <div>
                  <strong>Aarogyasri / PMJAY 100% Cashless</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>Direct government scheme billing split</div>
                </div>
                <StatusPill kind="success">ENABLED</StatusPill>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>Referral Fee Commissions (REF-010)</strong>
                  <div style={{ fontSize: 12, color: "var(--danger)" }}>Prohibited under NMC medical ethics rules</div>
                </div>
                <StatusPill kind="danger">LOCKED OFF</StatusPill>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 8: ONLINE SERVICES */}
      {activeTab === "online" && (
        <Card>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
            ABDM & Online Healthcare Integrations
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 10 }}>
                <div>
                  <strong>ABDM ABHA Milestone 1 (M1)</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>Aadhaar & mobile OTP ABHA creation & verification</div>
                </div>
                <StatusPill kind="success">READY</StatusPill>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 10 }}>
                <div>
                  <strong>ABDM Milestone 2 (M2 - HIP)</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>Health Information Provider FHIR R4 bridging</div>
                </div>
                <StatusPill kind="brand">SANDBOX</StatusPill>
              </div>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 10 }}>
                <div>
                  <strong>Patient Pre-visit Portal</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>Fast-track mobile check-in & prerequisites</div>
                </div>
                <StatusPill kind="success">ACTIVE</StatusPill>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>SMS / WhatsApp Notifications Gateway</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>Pre-visit preparation rules & MediPass delivery</div>
                </div>
                <StatusPill kind="success">ACTIVE</StatusPill>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 9: REGIONAL PREFERENCES */}
      {activeTab === "regional" && (
        <Card>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
            Regional & Date Format Preferences
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                Preferred Date Format
              </label>
              <Select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                <option value="DD MMM YYYY">21 Jul 2026 (Indian Standard)</option>
                <option value="DD/MM/YYYY">21/07/2026</option>
                <option value="YYYY-MM-DD">2026-07-21 (ISO Standard)</option>
              </Select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                Number Format & Currency Display
              </label>
              <Select value={numberFormat} onChange={(e) => setNumberFormat(e.target.value)}>
                <option value="en-IN">Lakh / Crore (e.g. ₹1,50,000.00)</option>
                <option value="en-US">Million / Billion (e.g. ₹150,000.00)</option>
              </Select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleSaveLocale}>Save Locale Preferences</Button>
          </div>
        </Card>
      )}

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
