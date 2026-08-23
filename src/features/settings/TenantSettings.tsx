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

  // Invite staff modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("doctor");
  const [inviteName, setInviteName] = useState("");

  // Configuration Master Category selection
  const [selectedConfigType, setSelectedConfigType] = useState("payment_type");
  const [configSearch, setConfigSearch] = useState("");
  const [showAddConfigModal, setShowAddConfigModal] = useState(false);
  const [newConfigCode, setNewConfigCode] = useState("");
  const [newConfigName, setNewConfigName] = useState("");
  const [newConfigDesc, setNewConfigDesc] = useState("");

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
  const defaultOrgName = tenant ? tenant.replace(/[_|-]/g, " ").toUpperCase() : "ZEN CLINIC";
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

  const handleTabChange = (tabKey: string) => {
    navigate(`/settings?tab=${tabKey}`);
  };

  const currentCategoryInfo = configCategories.find((c) => c.key === selectedConfigType) || configCategories[0];
  const currentItems = (configData[selectedConfigType] || []).filter((item) => {
    const q = configSearch.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
  });

  // Fetch practitioners & sites for Users tab
  const { data: practitioners = [] } = useQuery({
    queryKey: ["practitioners", tenant],
    queryFn: () => api.listPractitioners(token),
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

  const tabList = [
    { key: "config", label: "⚙️ Configuration" },
    { key: "account", label: "🏢 Account Settings" },
    { key: "auth", label: "🔐 User Authentication" },
    { key: "users", label: "👥 Users & Staff" },
    { key: "payment", label: "💳 Payment Settings" },
    { key: "online", label: "🌐 Online Services" },
    { key: "brand", label: "🎨 Brand Related" },
    { key: "print", label: "🖨️ Print Settings" },
    { key: "regional", label: "🌍 Regional Preferences" },
  ];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Header Tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
        {tabList.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              style={{
                background: isActive ? "var(--indigo)" : "#ffffff",
                color: isActive ? "#ffffff" : "var(--slate)",
                border: isActive ? "1px solid var(--indigo)" : "1px solid var(--line)",
                padding: "8px 16px",
                borderRadius: "var(--r-pill, 999px)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: isActive ? "0 4px 12px rgba(19, 26, 143, 0.2)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

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
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "grid", placeItems: "center", zIndex: 99999 }}>
              <Card style={{ width: "100%", maxWidth: 460, padding: 24, borderRadius: 20 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--indigo)", margin: "0 0 16px" }}>
                  Add New {currentCategoryInfo.label}
                </h3>
                <div style={{ display: "grid", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                      Code / Key
                    </label>
                    <Input placeholder="e.g. UPI_SPECIAL" value={newConfigCode} onChange={(e) => setNewConfigCode(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                      Display Name
                    </label>
                    <Input placeholder="e.g. VIP Consultation" value={newConfigName} onChange={(e) => setNewConfigName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                      Description
                    </label>
                    <Input placeholder="Description of this configuration" value={newConfigDesc} onChange={(e) => setNewConfigDesc(e.target.value)} />
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

      {/* TAB 4: ACCOUNT SETTINGS */}
      {activeTab === "account" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              Tenant Subscription & Legal Entity
            </h2>
            <div style={{ display: "grid", gap: 14 }}>
              <FieldCell label="Subscribed Tenant ID" sub="Unique SaaS identifier">{tenant || "zen_clinic"}</FieldCell>
              <FieldCell label="Designated Tenant Administrator" sub="Medical Director / Dean">DR K R MURALI (DEAN)</FieldCell>
              <FieldCell label="Admin Contact Email" sub="Identity login email">drkrmurali9090@yopmail.com</FieldCell>
              <FieldCell label="Admin Contact Phone" sub="SMS alert dispatch">+91 91002 42466</FieldCell>
            </div>
          </Card>

          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              Contract & Compliance Attestation
            </h2>
            <div style={{ display: "grid", gap: 14 }}>
              <FieldCell label="Contract Signatory" sub="Designation: DEAN">DR K R MURALI</FieldCell>
              <FieldCell label="Attestation Document" sub="Verified digital agreement">signed_terms_contract.pdf</FieldCell>
              <FieldCell label="Deployment Region" sub="Data residency policy">Andhra Pradesh (India VPS)</FieldCell>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
                <span>Account Status:</span>
                <StatusPill kind="success">PROVISIONED & ACTIVE</StatusPill>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: USER AUTHENTICATION */}
      {activeTab === "auth" && (
        <Card>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
            Identity & Authentication Security (Keycloak OIDC)
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ display: "grid", gap: 14 }}>
              <FieldCell label="Authentication Authority" sub="OIDC RS256 Provider">
                https://stage.zensynq.com/auth/realms/hms
              </FieldCell>
              <FieldCell label="Client Identity" sub="SPA PKCE S256 Protocol">
                hms-web
              </FieldCell>
              <FieldCell label="Single Sign-On Scope" sub="Granted token claims">
                openid, profile, email, app.tenant_id
              </FieldCell>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 10 }}>
                <div>
                  <strong>Declarative User Profile</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>Tenant claim mapped to app.tenant_id</div>
                </div>
                <StatusPill kind="success">ACTIVE</StatusPill>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 10 }}>
                <div>
                  <strong>Multi-Factor Authentication (MFA)</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>OTP verification for clinical roles</div>
                </div>
                <StatusPill kind="brand">OPTIONAL</StatusPill>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>Session Security Policy</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>Token expiry: 30 minutes with silent refresh</div>
                </div>
                <StatusPill kind="info">ENFORCED</StatusPill>
              </div>
            </div>
          </div>
        </Card>
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
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", zIndex: 9999 }}>
              <Card style={{ width: "100%", maxWidth: 440, padding: 24, borderRadius: 20 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--indigo)", margin: "0 0 16px" }}>
                  Invite Hospital Staff
                </h3>
                <div style={{ display: "grid", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>Full Name</label>
                    <Input placeholder="e.g. Dr. A. Sharma" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>Email Address</label>
                    <Input placeholder="e.g. doctor@zen_clinic.com" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
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
