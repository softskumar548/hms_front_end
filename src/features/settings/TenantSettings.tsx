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
  const [selectedConfigType, setSelectedConfigType] = useState("room_type");
  const [configSearch, setConfigSearch] = useState("");
  const [showAddConfigModal, setShowAddConfigModal] = useState(false);

  // Common Form Fields
  const [newConfigCode, setNewConfigCode] = useState("");
  const [newConfigName, setNewConfigName] = useState("");
  const [newConfigDesc, setNewConfigDesc] = useState("");

  // Category-Specific Dynamic Form Fields
  const [newConfigFloor, setNewConfigFloor] = useState("Ground Floor");
  const [newConfigBedCategory, setNewConfigBedCategory] = useState("General Ward");
  const [newConfigTariffInr, setNewConfigTariffInr] = useState("1500");
  const [newConfigNursingInr, setNewConfigNursingInr] = useState("350");
  const [newConfigOxygen, setNewConfigOxygen] = useState(false);
  const [newConfigVentilator, setNewConfigVentilator] = useState(false);
  const [newConfigAC, setNewConfigAC] = useState(false);

  const [newConfigFeeInr, setNewConfigFeeInr] = useState("500");
  const [newConfigValidityDays, setNewConfigValidityDays] = useState("7");
  const [newConfigDurationMins, setNewConfigDurationMins] = useState("15");
  const [newConfigEmergency, setNewConfigEmergency] = useState(false);
  const [newConfigTelehealth, setNewConfigTelehealth] = useState(false);

  const [newConfigHodName, setNewConfigHodName] = useState("Dr. K R Murali");
  const [newConfigDefaultChamber, setNewConfigDefaultChamber] = useState("Chamber 101");
  const [newConfigDeptType, setNewConfigDeptType] = useState("Clinical OPD");
  const [newConfigOnCall247, setNewConfigOnCall247] = useState(true);

  const [newConfigFloorLevel, setNewConfigFloorLevel] = useState("0");
  const [newConfigWingBlock, setNewConfigWingBlock] = useState("Main Block");
  const [newConfigBedCapacity, setNewConfigBedCapacity] = useState("20");
  const [newConfigNurseExt, setNewConfigNurseExt] = useState("102");

  const [newConfigLabDept, setNewConfigLabDept] = useState("Biochemistry");
  const [newConfigSampleType, setNewConfigSampleType] = useState("Whole Blood (EDTA)");
  const [newConfigPriceInr, setNewConfigPriceInr] = useState("350");
  const [newConfigTatHours, setNewConfigTatHours] = useState("4");
  const [newConfigNormalRange, setNewConfigNormalRange] = useState("13.5 - 17.5 g/dL");

  const [newConfigRailType, setNewConfigRailType] = useState("UPI QR");
  const [newConfigRequiresUtr, setNewConfigRequiresUtr] = useState(true);
  const [newConfigCashlessScheme, setNewConfigCashlessScheme] = useState(false);

  const [newConfigGstSlab, setNewConfigGstSlab] = useState("0%");
  const [newConfigMonthlyBudgetInr, setNewConfigMonthlyBudgetInr] = useState("50000");
  const [newConfigApprovalLimitInr, setNewConfigApprovalLimitInr] = useState("5000");

  const [newConfigAmbulanceType, setNewConfigAmbulanceType] = useState("ACLS Advanced Life Support");
  const [newConfigPerKmTariff, setNewConfigPerKmTariff] = useState("25");
  const [newConfigPackageDays, setNewConfigPackageDays] = useState("3");
  const [newConfigPreAuthPhone, setNewConfigPreAuthPhone] = useState("1800-102-4477");
  const [newConfigAssetModel, setNewConfigAssetModel] = useState("GE Healthcare Diagnostic");
  const [newConfigCalibrationDate, setNewConfigCalibrationDate] = useState("2026-12-15");
  const [newConfigDietCalories, setNewConfigDietCalories] = useState("1800 kcal");
  const [newConfigCapColor, setNewConfigCapColor] = useState("Purple (EDTA)");
  const [newConfigRouteType, setNewConfigRouteType] = useState("Oral (PO)");
  const [newConfigPartnerCity, setNewConfigPartnerCity] = useState("Nandyal");
  const [newConfigPartnerPhone, setNewConfigPartnerPhone] = useState("+91 98480 22338");
  const [newConfigLanguage, setNewConfigLanguage] = useState("Bilingual (English + Telugu)");
  const [newConfigWasteColor, setNewConfigWasteColor] = useState("Yellow Bag (Incineration)");


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

  const { data: quotaData } = useQuery({
    queryKey: ["tenant-quotas", tenant],
    queryFn: async () => {
      if (!token || !tenant) return null;
      try {
        return await api.getTenantQuotas(token, tenant);
      } catch {
        return null;
      }
    },
    enabled: Boolean(token && tenant),
  });

  // Custom Field Definition for Dynamic User-Defined Catalogs
  interface CustomFieldDef {
    id: string;
    name: string;
    label: string;
    type: "text" | "number" | "select" | "boolean" | "date";
    options?: string;
    required?: boolean;
  }

  // Custom Categories with Dynamic User-Defined Schemas
  const [customCategories, setCustomCategories] = useState<Array<{ key: string; label: string; desc: string; icon?: string; fields?: CustomFieldDef[] }>>(() => {
    const saved = localStorage.getItem(`hms-custom-cats-${tenant || "default"}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatKey, setNewCatKey] = useState("");
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("🏷️");
  const [newCatFields, setNewCatFields] = useState<CustomFieldDef[]>([
    { id: "1", name: "tariff_inr", label: "Tariff / Rate (₹)", type: "number", required: false },
    { id: "2", name: "specification", label: "Type / Specification", type: "text", required: false },
  ]);
  const [customItemValues, setCustomItemValues] = useState<Record<string, any>>({});
  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false);


  // Subscription Plan Tier & Custom Catalog Quotas
  const currentPlanTier: "starter" | "growth" | "enterprise" = (() => {
    if (role === "operator") return "enterprise";
    const pkg = (quotaData?.package_name || quotaData?.plan || "").toLowerCase();
    if (pkg.includes("enterprise")) return "enterprise";
    if (pkg.includes("starter") || pkg.includes("basic")) return "starter";
    if (pkg.includes("growth") || pkg.includes("pro")) return "growth";
    return "growth";
  })();

  const customCatalogLimits: Record<"starter" | "growth" | "enterprise", number> = {
    starter: 0,
    growth: 5,
    enterprise: 999,
  };

  const customCatalogLimit = customCatalogLimits[currentPlanTier];
  const customCatalogCount = customCategories.length;
  const isCustomCatalogQuotaExhausted = currentPlanTier === "starter" || (customCatalogLimit !== 999 && customCatalogCount >= customCatalogLimit);



  const builtInCategories = [
    { key: "room_type", label: "Rooms & Inpatient Beds", desc: "Consultation chambers, OT, recovery beds, tariffs & equipment", icon: "🛏️" },
    { key: "visit_type", label: "Visit Types & Fees", desc: "Clinical appointment categories, consultation tariffs & validity", icon: "📋" },
    { key: "specialization", label: "Departments & Specialties", desc: "Medical specialty branches, HOD doctors & clinical chambers", icon: "🩺" },
    { key: "floor_type", label: "Floors & Building Wings", desc: "Campus building levels, wing sections & nurse stations", icon: "🏢" },
    { key: "lab_test", label: "Diagnostic Lab Catalog", desc: "Pathology tests, radiology imaging, turnaround times & reference ranges", icon: "🔬" },
    { key: "bed_category", label: "Bed Categories", desc: "Inpatient bed classifications, base room tariffs & nursing charges", icon: "🛌" },
    { key: "payment_type", label: "Payment & Cashier Rails", desc: "Payment collection rails, UPI QR, POS card & PMJAY cashless rules", icon: "💳" },
    { key: "expense_category", label: "Expense Heads & Budget", desc: "Operational expenditures, GST slabs & cashier approval thresholds", icon: "📦" },
    { key: "surgical_package", label: "Surgical & OT Packages", desc: "Surgical procedures, OT theatre charges & surgeon packages", icon: "💉" },
    { key: "ambulance_fleet", label: "Ambulance & Transport", desc: "Emergency transport vehicles, drivers, oxygen & tariff/km", icon: "🚑" },
    { key: "tpa_insurance", label: "TPA & Insurance Providers", desc: "Third-party administrators, pre-auth desks & cashless settlement rules", icon: "🛡️" },
    { key: "biomedical_asset", label: "Biomedical Equipment", desc: "Medical machinery, calibration dates, AMC maintenance & service logs", icon: "⚙️" },
    { key: "diet_plan", label: "Inpatient Diet & Nutrition", desc: "Therapeutic meal plans, diabetic diets, and nutrition schedules", icon: "🥗" },
    { key: "specimen_type", label: "Lab Specimen & Vacutainers", desc: "Biological sample collection containers & preservation media", icon: "🧪" },
    { key: "dosage_route", label: "Dosage Routes & Units", desc: "Medication administration routes, standard frequency & volume units", icon: "💊" },
    { key: "referral_partner", label: "Referral Diagnostic Centers", desc: "External diagnostic labs, scan centers & clinic tie-ups", icon: "🤝" },
    { key: "consent_template", label: "Consent Form Templates", desc: "Informed surgical consents, high-risk procedures & admission legal forms", icon: "📄" },
    { key: "waste_category", label: "Biomedical Waste Heads", desc: "CPCB/APPCB color-coded biomedical waste segregation bags", icon: "☣️" },
    { key: "clinic_type", label: "Facility Classifications", desc: "Healthcare delivery unit classification and licensed scope", icon: "🏥" },
    { key: "order_status", label: "Order Workflow States", desc: "Diagnostic lab and clinical order lifecycle states", icon: "📊" },
  ];

  const configCategories = [...builtInCategories, ...customCategories];

  // Default master datasets with rich, category-specific domain attributes
  const [configData, setConfigData] = useState<Record<string, Array<any>>>(() => {
    const saved = localStorage.getItem(`hms-config-data-${tenant || "default"}`);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      room_type: [
        { id: "1", code: "CONS-101", name: "Chamber 101 (OPD)", floor: "Ground Floor", category: "Consultation Chamber", tariff_inr: 0, nursing_charge_inr: 0, amenities: ["AC", "Exam Bed", "Stethoscope Unit"], status: "Available", active: true },
        { id: "2", code: "ICU-01", name: "ICU Ventilator Bed 01", floor: "2nd Floor", category: "ICU Ventilator", tariff_inr: 6500, nursing_charge_inr: 1200, amenities: ["Oxygen", "Ventilator", "Multipara Monitor", "Defibrillator", "AC"], status: "Occupied", active: true },
        { id: "3", code: "ICU-02", name: "ICU Ventilator Bed 02", floor: "2nd Floor", category: "ICU Ventilator", tariff_inr: 6500, nursing_charge_inr: 1200, amenities: ["Oxygen", "Ventilator", "Multipara Monitor", "AC"], status: "Available", active: true },
        { id: "4", code: "DLX-201", name: "Deluxe Single Room 201", floor: "1st Floor", category: "Private Deluxe", tariff_inr: 3500, nursing_charge_inr: 600, amenities: ["Oxygen", "AC", "Attached Bath", "Sofa-cum-Bed", "TV"], status: "Available", active: true },
        { id: "5", code: "GEN-W1-B1", name: "General Ward 1 - Bed 01", floor: "1st Floor", category: "General Ward", tariff_inr: 1200, nursing_charge_inr: 300, amenities: ["Oxygen", "Bedside Locker", "Curtain Partition"], status: "Occupied", active: true },
        { id: "6", code: "TRIAGE-01", name: "Triage & Vitals Bay 1", floor: "Ground Floor", category: "Triage Bay", tariff_inr: 0, nursing_charge_inr: 150, amenities: ["BP Monitor", "ECG", "Pulse Oximeter", "Wheelchair Access"], status: "Available", active: true },
      ],
      visit_type: [
        { id: "1", code: "NEW_OPD", name: "New Consultation Visit", fee_inr: 500, validity_days: 7, duration_mins: 15, is_emergency: false, is_telehealth: false, description: "First-time outpatient consultation", active: true },
        { id: "2", code: "FOLLOW_UP", name: "Follow-up Review", fee_inr: 250, validity_days: 14, duration_mins: 10, is_emergency: false, is_telehealth: false, description: "Review consultation within validity window", active: true },
        { id: "3", code: "EMERGENCY_TRIAGE", name: "Emergency / Acute Triage", fee_inr: 1000, validity_days: 1, duration_mins: 20, is_emergency: true, is_telehealth: false, description: "Priority acute trauma and critical care", active: true },
        { id: "4", code: "TELEHEALTH_VIDEO", name: "Telehealth Video Consult", fee_inr: 450, validity_days: 7, duration_mins: 15, is_emergency: false, is_telehealth: true, description: "Remote telemedicine video appointment", active: true },
        { id: "5", code: "HEALTH_CHECK", name: "Comprehensive Executive Check", fee_inr: 2500, validity_days: 30, duration_mins: 45, is_emergency: false, is_telehealth: false, description: "Full health screening package", active: true },
      ],
      specialization: [
        { id: "1", code: "GEN_MED", name: "General Medicine", hod_name: "Dr. K R Murali", default_chamber: "Chamber 101", dept_type: "Clinical OPD", on_call_247: true, description: "Internal medicine & chronic care", active: true },
        { id: "2", code: "CARDIO", name: "Cardiology", hod_name: "Dr. Sreenivasulu", default_chamber: "Chamber 102", dept_type: "Clinical & Diagnostic", on_call_247: true, description: "Heart disease, ECG, Echocardiography", active: true },
        { id: "3", code: "ORTHO", name: "Orthopedics & Joint Care", hod_name: "Dr. V Ramana", default_chamber: "Chamber 103", dept_type: "Surgical & OPD", on_call_247: true, description: "Bone, joint, trauma surgery", active: true },
        { id: "4", code: "PEDIA", name: "Pediatrics & Neonatology", hod_name: "Dr. Ananya Reddy", default_chamber: "Chamber 104", dept_type: "Clinical OPD", on_call_247: false, description: "Child healthcare & immunization", active: true },
        { id: "5", code: "GYNAEC", name: "Obstetrics & Gynecology", hod_name: "Dr. Shanti Kumari", default_chamber: "Chamber 105", dept_type: "Surgical & Maternity", on_call_247: true, description: "Maternity and women's reproductive health", active: true },
      ],
      floor_type: [
        { id: "1", code: "FL-GND", name: "Ground Floor", floor_level: "0", wing_block: "Main Wing", bed_capacity: 12, nurse_ext: "101", description: "Main Reception, Emergency, OPD Chambers, Pharmacy", active: true },
        { id: "2", code: "FL-1ST", name: "First Floor", floor_level: "1", wing_block: "Inpatient Block A", bed_capacity: 25, nurse_ext: "201", description: "General Wards, Semi-Private Rooms, Deluxe Suites", active: true },
        { id: "3", code: "FL-2ND", name: "Second Floor", floor_level: "2", wing_block: "Critical Care Wing", bed_capacity: 15, nurse_ext: "301", description: "ICU Complex, HDU, Post-Operative Recovery", active: true },
        { id: "4", code: "FL-3RD", name: "Third Floor", floor_level: "3", wing_block: "Surgical OT Block", bed_capacity: 8, nurse_ext: "401", description: "Major Operation Theatres & Sterilization (CSSD)", active: true },
      ],
      lab_test: [
        { id: "1", code: "LAB-CBC", name: "Complete Blood Count (CBC)", department: "Hematology", sample_type: "Whole Blood (EDTA)", price_inr: 350, tat_hours: 2, normal_range: "Hb: 13.5-17.5 g/dL, WBC: 4000-11000", units: "Standard", active: true },
        { id: "2", code: "LAB-LFT", name: "Liver Function Test (LFT)", department: "Biochemistry", sample_type: "Serum", price_inr: 750, tat_hours: 4, normal_range: "Bilirubin: 0.2-1.2, SGOT: 10-40 U/L", units: "mg/dL & U/L", active: true },
        { id: "3", code: "LAB-RFT", name: "Renal Function Test (KFT / RFT)", department: "Biochemistry", sample_type: "Serum", price_inr: 650, tat_hours: 3, normal_range: "Creatinine: 0.7-1.3, Urea: 15-40", units: "mg/dL", active: true },
        { id: "4", code: "RAD-XRAY", name: "Chest X-Ray (PA View)", department: "Radiology", sample_type: "Digital Radiography", price_inr: 450, tat_hours: 1, normal_range: "Clear lung fields, normal cardiothoracic ratio", units: "Visual", active: true },
        { id: "5", code: "LAB-LIPID", name: "Lipid Profile Comprehensive", department: "Biochemistry", sample_type: "Fasting Serum", price_inr: 800, tat_hours: 4, normal_range: "Cholesterol < 200, Triglycerides < 150", units: "mg/dL", active: true },
      ],
      surgical_package: [
        { id: "1", code: "SURG-APP", name: "Laparoscopic Appendectomy", description: "Minimal access appendix excision with 2-day recovery", tariff_inr: 35000, active: true },
        { id: "2", code: "SURG-CAT", name: "Phaco Cataract Surgery with IOL", description: "Micro-incision intraocular lens implantation", tariff_inr: 22000, active: true },
        { id: "3", code: "SURG-TKR", name: "Total Knee Replacement (Unilateral)", description: "High-flex ceramic/titanium joint arthroplasty", tariff_inr: 125000, active: true },
        { id: "4", code: "SURG-DEL", name: "Normal Delivery Maternity Package", description: "3-day stay with neonatal care & pediatrician review", tariff_inr: 28000, active: true },
      ],
      ambulance_fleet: [
        { id: "1", code: "AMB-01", name: "Advance Cardiac Life Support (ACLS)", description: "Vehicle AP-21-TX-1001 with Inbuilt Transport Ventilator & Defibrillator", tariff_inr: 2500, active: true },
        { id: "2", code: "AMB-02", name: "Basic Life Support (BLS)", description: "Vehicle AP-21-TX-2002 with Oxygen, Spine Board & First-Aid", tariff_inr: 1200, active: true },
      ],
      tpa_insurance: [
        { id: "1", code: "TPA-STAR", name: "Star Health & Allied Insurance", description: "Empaneled cashless provider · Pre-auth TAT 2 hours", active: true },
        { id: "2", code: "TPA-MEDI", name: "Medi Assist Insurance TPA", description: "Corporate and individual cashless desk", active: true },
        { id: "3", code: "TPA-HDFC", name: "HDFC ERGO General Insurance", description: "Direct cashless integration portal", active: true },
        { id: "4", code: "TPA-YSR", name: "Dr. YSR Aarogyasri Trust", description: "Andhra Pradesh 100% Cashless Healthcare Scheme", active: true },
      ],
      biomedical_asset: [
        { id: "1", code: "BIO-USG", name: "GE Healthcare 4D Ultrasound", description: "Radiology Unit 1 · Calibration Due: 15/12/2026", active: true },
        { id: "2", code: "BIO-ECG", name: "Philips 12-Lead Diagnostic ECG", description: "OPD Triage Desk · AMC Valid till 2027", active: true },
        { id: "3", code: "BIO-DEFIB", name: "BPL Biphasic Defibrillator", description: "ICU Crash Cart 1 · Monthly Battery Check OK", active: true },
      ],
      diet_plan: [
        { id: "1", code: "DIET-DIA", name: "Diabetic Low Glycemic Diet", description: "Controlled carbohydrate, high fiber 1800 kcal meal", active: true },
        { id: "2", code: "DIET-REN", name: "Renal Low Sodium / Potassium", description: "Restricted protein and fluid for CKD patients", active: true },
        { id: "3", code: "DIET-LIQ", name: "Clear Liquid Post-Operative Diet", description: "Electrolyte water, strained soup & apple juice", active: true },
      ],
      specimen_type: [
        { id: "1", code: "SPEC-EDTA", name: "Whole Blood (EDTA Purple Cap)", description: "For CBC, HbA1c, ESR and blood grouping", active: true },
        { id: "2", code: "SPEC-SERUM", name: "Serum Clot Activator (Red Cap)", description: "For Biochemistry, LFT, KFT, and lipid profiles", active: true },
        { id: "3", code: "SPEC-URINE", name: "Sterile Spot Urine Container", description: "For Routine Microscopy and Culture Sensitivity", active: true },
      ],
      dosage_route: [
        { id: "1", code: "ROUTE-ORAL", name: "Oral (PO) After Food", description: "Tablet, capsule, or syrup swallowed orally", active: true },
        { id: "2", code: "ROUTE-IV", name: "Intravenous (IV) Infusion", description: "Slow intravenous drip administration", active: true },
        { id: "3", code: "ROUTE-IM", name: "Intramuscular (IM) Injection", description: "Deep gluteal or deltoid muscle injection", active: true },
        { id: "4", code: "ROUTE-SUBLING", name: "Sublingual (Under Tongue)", description: "Rapid mucosal absorption (e.g. Nitroglycerin)", active: true },
      ],
      referral_partner: [
        { id: "1", code: "REF-VIJAYA", name: "Vijaya Diagnostic Center (Nandyal)", description: "Partner lab for specialized MRI and Genetic sequencing", active: true },
        { id: "2", code: "REF-MEDIC", name: "MediCover Primary Care Clinic", description: "Upstream patient referral clinic network", active: true },
      ],
      consent_template: [
        { id: "1", code: "CONS-SURG", name: "Surgical Anesthesia Informed Consent", description: "Bilingual (English/Telugu) high-risk surgery consent", active: true },
        { id: "2", code: "CONS-TRANS", name: "Blood Transfusion Consent Form", description: "Patient authorization for PRBC/FFP administration", active: true },
        { id: "3", code: "CONS-LAMA", name: "Leave Against Medical Advice (LAMA)", description: "Discharge against doctor recommendation indemnity", active: true },
      ],
      waste_category: [
        { id: "1", code: "BMW-YELLOW", name: "Yellow Bag (Anatomical & Soiled)", description: "Human tissues, soiled cotton, bandages for incineration", active: true },
        { id: "2", code: "BMW-RED", name: "Red Bag (Contaminated Plastics)", description: "IV tubes, catheters, gloves for autoclaving & recycling", active: true },
        { id: "3", code: "BMW-WHITE", name: "White Container (Puncture-Proof Sharps)", description: "Needles, scalpels, blades for shredding", active: true },
        { id: "4", code: "BMW-BLUE", name: "Blue Box (Glassware & Implants)", description: "Vials, ampoules, orthopedic metal implants", active: true },
      ],
      bed_category: [
        { id: "1", code: "GEN_WARD", name: "General Ward Bed", tariff_inr: 1200, nursing_charge_inr: 300, description: "Multi-occupancy inpatient recovery bed with curtain divider", active: true },
        { id: "2", code: "SEMI_PVT", name: "Semi-Private 2-Sharing", tariff_inr: 2200, nursing_charge_inr: 450, description: "Air-conditioned 2-patient shared room", active: true },
        { id: "3", code: "PVT_DELUXE", name: "Private Deluxe Room", tariff_inr: 3500, nursing_charge_inr: 600, description: "Single patient private luxury suite with sofa and TV", active: true },
        { id: "4", code: "ICU_VENT", name: "ICU Ventilator Bed", tariff_inr: 6500, nursing_charge_inr: 1200, description: "High-dependency motorized bed with ventilator & multipara", active: true },
      ],
      payment_type: [
        { id: "1", code: "UPI", name: "Dynamic UPI QR", rail_type: "Instant Real-time QR", requires_utr: true, is_cashless_scheme: false, description: "Real-time dynamic UPI QR cashier collection", active: true },
        { id: "2", code: "CASH", name: "Cash Till Drawer", rail_type: "Physical Currency", requires_utr: false, is_cashless_scheme: false, description: "Physical cash cashier till reconciliation", active: true },
        { id: "3", code: "CARD", name: "POS Debit / Credit Card", rail_type: "Card Swipe Terminal", requires_utr: true, is_cashless_scheme: false, description: "POS swipe terminal with auth code logging", active: true },
        { id: "4", code: "PMJAY", name: "Dr. YSR Aarogyasri / PMJAY", rail_type: "Govt 100% Cashless", requires_utr: true, is_cashless_scheme: true, description: "Government cashless scheme split settlement", active: true },
        { id: "5", code: "INSURANCE", name: "Private TPA Cashless", rail_type: "Insurance Pre-Auth", requires_utr: true, is_cashless_scheme: true, description: "Third-party administrator pre-authorized claim", active: true },
      ],
      expense_category: [
        { id: "1", code: "MED_STOCK", name: "Pharmacy & Surgical Consumables", gst_slab: "12%", monthly_budget_inr: 150000, approval_limit_inr: 10000, description: "Procurement of medicines and surgical items", active: true },
        { id: "2", code: "LAB_REAGENT", name: "Diagnostic Reagents & Kits", gst_slab: "18%", monthly_budget_inr: 80000, approval_limit_inr: 5000, description: "Biochemistry reagents, test tubes, and vacutainers", active: true },
        { id: "3", code: "FACILITY_UTIL", name: "Electricity & Biomedical Waste", gst_slab: "18%", monthly_budget_inr: 45000, approval_limit_inr: 10000, description: "Power backup diesel, biomedical disposal, water", active: true },
        { id: "4", code: "STAFF_SALARY", name: "Doctor & Staff Honorarium", gst_slab: "0%", monthly_budget_inr: 500000, approval_limit_inr: 25000, description: "Doctor consultation revenue split & staff wages", active: true },
      ],
      clinic_type: [
        { id: "1", code: "OPD_GENERAL", name: "General Outpatient Clinic", description: "Primary care walk-in OPD", active: true },
        { id: "2", code: "OPD_SPECIALIST", name: "Super Specialty Clinic", description: "Specialized clinical consultation suites", active: true },
        { id: "3", code: "HOSPITAL_MULTI", name: "Multi-Specialty Inpatient Hospital", description: "24x7 IPD, Emergency, ICU and Surgical suites", active: true },
        { id: "4", code: "DAY_CARE", name: "Daycare Chemotherapy / Infusion", description: "Short-stay ambulatory treatment unit", active: true },
      ],
      order_status: [
        { id: "1", code: "DRAFT", name: "Draft Order", description: "Clinical prescription order being drafted", active: true },
        { id: "2", code: "PENDING", name: "Pending Sample Collection", description: "Awaiting phlebotomy or imaging token", active: true },
        { id: "3", code: "IN_PROGRESS", name: "In Diagnostic Analysis", description: "Specimen under laboratory analyzer", active: true },
        { id: "4", code: "COMPLETED", name: "Resulted & Signed Off", description: "Verified diagnostic report generated", active: true },
        { id: "5", code: "CANCELLED", name: "Order Cancelled", description: "Voided or cancelled diagnostic test", active: true },
      ],
    };
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
      const nextData = { ...prev, [type]: updated };
      localStorage.setItem(`hms-config-data-${tenant || "default"}`, JSON.stringify(nextData));
      return nextData;
    });
    triggerToast("Item status updated!");
  };

  const handleAddConfigItem = () => {
    if (!newConfigName) return;

    const amenities: string[] = [];
    if (newConfigOxygen) amenities.push("Oxygen");
    if (newConfigVentilator) amenities.push("Ventilator");
    if (newConfigAC) amenities.push("AC");

    const newItem: any = {
      id: String(Date.now()),
      code: newConfigCode.toUpperCase() || newConfigName.replace(/\s+/g, "_").toUpperCase(),
      name: newConfigName,
      description: newConfigDesc || "Configured master item",
      active: true,
    };

    if (selectedConfigType === "room_type") {
      newItem.floor = newConfigFloor;
      newItem.category = newConfigBedCategory;
      newItem.tariff_inr = Number(newConfigTariffInr) || 0;
      newItem.nursing_charge_inr = Number(newConfigNursingInr) || 0;
      newItem.amenities = amenities;
      newItem.status = "Available";
    } else if (selectedConfigType === "visit_type") {
      newItem.fee_inr = Number(newConfigFeeInr) || 0;
      newItem.validity_days = Number(newConfigValidityDays) || 7;
      newItem.duration_mins = Number(newConfigDurationMins) || 15;
      newItem.is_emergency = newConfigEmergency;
      newItem.is_telehealth = newConfigTelehealth;
    } else if (selectedConfigType === "specialization") {
      newItem.hod_name = newConfigHodName;
      newItem.default_chamber = newConfigDefaultChamber;
      newItem.dept_type = newConfigDeptType;
      newItem.on_call_247 = newConfigOnCall247;
    } else if (selectedConfigType === "floor_type") {
      newItem.floor_level = newConfigFloorLevel;
      newItem.wing_block = newConfigWingBlock;
      newItem.bed_capacity = Number(newConfigBedCapacity) || 0;
      newItem.nurse_ext = newConfigNurseExt;
    } else if (selectedConfigType === "lab_test") {
      newItem.department = newConfigLabDept;
      newItem.sample_type = newConfigSampleType;
      newItem.price_inr = Number(newConfigPriceInr) || 0;
      newItem.tat_hours = Number(newConfigTatHours) || 2;
      newItem.normal_range = newConfigNormalRange;
    } else if (selectedConfigType === "bed_category") {
      newItem.tariff_inr = Number(newConfigTariffInr) || 0;
      newItem.nursing_charge_inr = Number(newConfigNursingInr) || 0;
    } else if (selectedConfigType === "payment_type") {
      newItem.rail_type = newConfigRailType;
      newItem.requires_utr = newConfigRequiresUtr;
      newItem.is_cashless_scheme = newConfigCashlessScheme;
    } else if (selectedConfigType === "expense_category") {
      newItem.gst_slab = newConfigGstSlab;
      newItem.monthly_budget_inr = Number(newConfigMonthlyBudgetInr) || 0;
      newItem.approval_limit_inr = Number(newConfigApprovalLimitInr) || 0;
    } else if (selectedConfigType === "surgical_package") {
      newItem.tariff_inr = Number(newConfigTariffInr) || 0;
      newItem.duration_days = Number(newConfigPackageDays) || 3;
    } else if (selectedConfigType === "ambulance_fleet") {
      newItem.tariff_inr = Number(newConfigTariffInr) || 0;
      newItem.per_km_inr = Number(newConfigPerKmTariff) || 25;
      newItem.vehicle_type = newConfigAmbulanceType;
    } else if (selectedConfigType === "tpa_insurance") {
      newItem.contact_phone = newConfigPreAuthPhone;
      newItem.tat_hours = Number(newConfigTatHours) || 2;
    } else if (selectedConfigType === "biomedical_asset") {
      newItem.model = newConfigAssetModel;
      newItem.calibration_date = newConfigCalibrationDate;
    } else if (selectedConfigType === "diet_plan") {
      newItem.calories = newConfigDietCalories;
    } else if (selectedConfigType === "specimen_type") {
      newItem.cap_color = newConfigCapColor;
    } else if (selectedConfigType === "dosage_route") {
      newItem.route_type = newConfigRouteType;
    } else if (selectedConfigType === "referral_partner") {
      newItem.city = newConfigPartnerCity;
      newItem.phone = newConfigPartnerPhone;
    } else if (selectedConfigType === "consent_template") {
      newItem.language = newConfigLanguage;
    } else if (selectedConfigType === "waste_category") {
      newItem.color_bag = newConfigWasteColor;
    }

    // Merge any user-defined dynamic schema fields
    Object.entries(customItemValues).forEach(([k, v]) => {
      newItem[k] = v;
    });

    setConfigData((prev) => {
      const next = {
        ...prev,
        [selectedConfigType]: [...(prev[selectedConfigType] || []), newItem],
      };
      localStorage.setItem(`hms-config-data-${tenant || "default"}`, JSON.stringify(next));
      return next;
    });

    setShowAddConfigModal(false);
    setNewConfigCode("");
    setNewConfigName("");
    setNewConfigDesc("");
    setCustomItemValues({});
    triggerToast(`New ${currentCategoryInfo.label} item added!`);
  };

  const getItemPlaceholders = () => {
    switch (selectedConfigType) {
      case "room_type":
        return { code: "e.g. ICU-03", nameLabel: "Room / Bed Name", namePlaceholder: "e.g. ICU Ventilator Chamber 03" };
      case "visit_type":
        return { code: "e.g. VIP_CONSULT", nameLabel: "Visit Type Category", namePlaceholder: "e.g. Super Specialist Review" };
      case "specialization":
        return { code: "e.g. NEURO", nameLabel: "Department / Specialty Name", namePlaceholder: "e.g. Neurology & Spine Care" };
      case "floor_type":
        return { code: "e.g. FL-4TH", nameLabel: "Floor / Level Name", namePlaceholder: "e.g. Fourth Floor (Daycare & Chemotherapy)" };
      case "lab_test":
        return { code: "e.g. LAB-HBA1C", nameLabel: "Investigation / Test Name", namePlaceholder: "e.g. Glycated Hemoglobin (HbA1c)" };
      case "bed_category":
        return { code: "e.g. HDU_BED", nameLabel: "Bed Category Classification", namePlaceholder: "e.g. High Dependency Unit (HDU)" };
      case "payment_type":
        return { code: "e.g. PAYTM_QR", nameLabel: "Payment Method / Rail", namePlaceholder: "e.g. Dynamic Paytm Soundbox QR" };
      case "expense_category":
        return { code: "e.g. EXP_DIESEL", nameLabel: "Expense Head Title", namePlaceholder: "e.g. DG Power Backup Diesel" };
      case "surgical_package":
        return { code: "e.g. SURG-LAP", nameLabel: "Surgical Procedure / Package Name", namePlaceholder: "e.g. Laparoscopic Cholecystectomy" };
      case "ambulance_fleet":
        return { code: "e.g. AMB-03", nameLabel: "Ambulance Vehicle / Unit", namePlaceholder: "e.g. ACLS Cardiac Ambulance (AP-21-TX-3003)" };
      case "tpa_insurance":
        return { code: "e.g. TPA-ICICI", nameLabel: "Insurance Company / TPA Name", namePlaceholder: "e.g. ICICI Lombard General Insurance" };
      case "biomedical_asset":
        return { code: "e.g. BIO-VENT-02", nameLabel: "Medical Equipment / Device", namePlaceholder: "e.g. Hamilton T1 Transport Ventilator" };
      case "diet_plan":
        return { code: "e.g. DIET-HIGHPRO", nameLabel: "Diet / Nutrition Plan Title", namePlaceholder: "e.g. High Protein Post-Surgical Diet" };
      case "specimen_type":
        return { code: "e.g. SPEC-SST", nameLabel: "Specimen / Vacutainer Name", namePlaceholder: "e.g. Serum Gel SST Vacutainer (Yellow Cap)" };
      case "dosage_route":
        return { code: "e.g. ROUTE-NEB", nameLabel: "Medication Administration Route", namePlaceholder: "e.g. Inhalation via Nebulization" };
      case "referral_partner":
        return { code: "e.g. REF-APOLLO", nameLabel: "Partner Diagnostic / Clinic", namePlaceholder: "e.g. Apollo Diagnostics Hub Nandyal" };
      case "consent_template":
        return { code: "e.g. CONS-ENDO", nameLabel: "Consent Document Title", namePlaceholder: "e.g. Upper GI Endoscopy Informed Consent" };
      case "waste_category":
        return { code: "e.g. BMW-CYTO", nameLabel: "Biomedical Waste Category", namePlaceholder: "e.g. Yellow Bag - Cytotoxic Waste" };
      default:
        return { code: "e.g. ITEM_01", nameLabel: `${currentCategoryInfo.label} Name`, namePlaceholder: `e.g. New ${currentCategoryInfo.label}` };
    }
  };


  const handleAddCustomCategory = () => {
    if (!newCatLabel) return;
    const key = newCatKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_") || newCatLabel.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const newCat = {
      key,
      label: newCatLabel,
      desc: newCatDesc || `${newCatLabel} Master Configuration`,
      icon: newCatIcon || "🏷️",
      fields: newCatFields.map((f, idx) => ({
        ...f,
        name: f.name.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_") || `field_${idx + 1}`,
      })),
    };
    const nextCats = [...customCategories, newCat];
    setCustomCategories(nextCats);
    localStorage.setItem(`hms-custom-cats-${tenant || "default"}`, JSON.stringify(nextCats));
    setSelectedConfigType(key);
    setShowAddCategoryModal(false);
    setNewCatKey("");
    setNewCatLabel("");
    setNewCatDesc("");
    setNewCatIcon("🏷️");
    setNewCatFields([
      { id: "1", name: "tariff_inr", label: "Tariff / Rate (₹)", type: "number", required: false },
      { id: "2", name: "specification", label: "Type / Specification", type: "text", required: false },
    ]);
    triggerToast(`Custom Master Catalog '${newCatLabel}' with ${newCat.fields.length} dynamic fields created!`);
  };


  const currentCategoryInfo = configCategories.find((c) => c.key === selectedConfigType) || configCategories[0];
  const currentItems = (configData[selectedConfigType] || []).filter((item) => {
    const q = configSearch.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.code && item.code.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
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
        } else if (showAddCategoryModal) {
          setShowAddCategoryModal(false);
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
        } else if (showUpgradePlanModal) {
          setShowUpgradePlanModal(false);
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAddConfigModal, showAddCategoryModal, showAddAuthModal, showChangePasswordModal, showInviteModal, showUpgradePlanModal]);



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
              {/* Dropdown Selector & Custom Catalog Actions */}
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "flex", alignItems: "center", gap: 6 }}>
                    Select Master Configuration Category
                    <span style={{ fontSize: 11, background: "var(--wash-b)", color: "var(--indigo)", padding: "2px 8px", borderRadius: 10, fontWeight: 800 }}>
                      {configCategories.length} Master Catalogs (20 Standard{customCatalogCount > 0 ? ` + ${customCatalogCount} Custom` : ""})
                    </span>
                  </label>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Button
                      ghost
                      type="button"
                      onClick={() => {
                        if (isCustomCatalogQuotaExhausted) {
                          setShowUpgradePlanModal(true);
                        } else {
                          setShowAddCategoryModal(true);
                        }
                      }}
                      style={{
                        fontSize: 12.5,
                        padding: "6px 14px",
                        border: currentPlanTier === "starter" ? "1px solid #D97706" : isCustomCatalogQuotaExhausted ? "1px solid #EF4444" : "1px dashed var(--indigo)",
                        color: currentPlanTier === "starter" ? "#B45309" : isCustomCatalogQuotaExhausted ? "#B91C1C" : "var(--indigo)",
                        background: currentPlanTier === "starter" ? "#FEF3C7" : isCustomCatalogQuotaExhausted ? "#FEE2E2" : "#EEF2FF",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    >
                      {currentPlanTier === "starter" ? (
                        <>✨ + Add Custom Catalog <span style={{ background: "#D97706", color: "#fff", padding: "1px 6px", borderRadius: 8, fontSize: 10.5, fontWeight: 800 }}>👑 PRO</span></>
                      ) : currentPlanTier === "growth" ? (
                        <>✨ + Add Custom Catalog <span style={{ background: isCustomCatalogQuotaExhausted ? "#EF4444" : "var(--indigo)", color: "#fff", padding: "1px 6px", borderRadius: 8, fontSize: 10.5, fontWeight: 800 }}>{customCatalogCount}/5 Used</span></>
                      ) : (
                        <>✨ + Add Custom Catalog <span style={{ background: "#10B981", color: "#fff", padding: "1px 6px", borderRadius: 8, fontSize: 10.5, fontWeight: 800 }}>👑 Unlimited</span></>
                      )}
                    </Button>
                  </div>
                </div>


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
                        {(c as any).icon ? `${(c as any).icon} ` : "🏷️ "} {c.label}
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
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--indigo)", margin: "0 0 2px", display: "flex", alignItems: "center", gap: 8 }}>
                    {(currentCategoryInfo as any).icon || "🏷️"} {currentCategoryInfo.label} Master
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

              {/* Dynamic Polymorphic Data Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                      <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Code / Key</th>
                      <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>
                        {selectedConfigType === "room_type" ? "Room / Bed Name" :
                         selectedConfigType === "visit_type" ? "Visit Category" :
                         selectedConfigType === "specialization" ? "Specialization / Dept" :
                         selectedConfigType === "floor_type" ? "Floor Name" :
                         selectedConfigType === "lab_test" ? "Investigation / Test Name" :
                         selectedConfigType === "surgical_package" ? "Surgical Procedure / Package" :
                         selectedConfigType === "ambulance_fleet" ? "Ambulance Vehicle / Unit" :
                         selectedConfigType === "tpa_insurance" ? "Insurance Company / TPA" :
                         selectedConfigType === "biomedical_asset" ? "Medical Asset / Device" :
                         selectedConfigType === "diet_plan" ? "Diet Plan / Nutrition" :
                         selectedConfigType === "specimen_type" ? "Specimen / Container" :
                         selectedConfigType === "dosage_route" ? "Dosage Route" :
                         selectedConfigType === "referral_partner" ? "Partner Center" :
                         selectedConfigType === "consent_template" ? "Consent Document" :
                         selectedConfigType === "waste_category" ? "Waste Category (Color Bag)" :
                         selectedConfigType === "payment_type" ? "Payment Rail" :
                         selectedConfigType === "expense_category" ? "Expense Head" : "Name / Label"}
                      </th>


                      {selectedConfigType === "room_type" && (
                        <>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Floor / Wing</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Bed Category</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Daily Tariff</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Amenities / Gear</th>
                          <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Bed Status</th>
                        </>
                      )}

                      {selectedConfigType === "visit_type" && (
                        <>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Consultation Fee</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Free Follow-up</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Duration</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Clinical Flags</th>
                        </>
                      )}

                      {selectedConfigType === "specialization" && (
                        <>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>HOD / Lead Doctor</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Default Chamber</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Department Type</th>
                          <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>24x7 On-Call</th>
                        </>
                      )}

                      {selectedConfigType === "floor_type" && (
                        <>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Floor Level</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Building Wing</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Bed Capacity</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Nurse Desk Ext</th>
                        </>
                      )}

                      {selectedConfigType === "lab_test" && (
                        <>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Department</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Sample Required</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Patient Price</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Turnaround (TAT)</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Reference Range</th>
                        </>
                      )}

                      {selectedConfigType === "bed_category" && (
                        <>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Base Room Tariff</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Daily Nursing Charge</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Description</th>
                        </>
                      )}

                      {selectedConfigType === "payment_type" && (
                        <>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Rail Type</th>
                          <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Requires UTR #</th>
                          <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Cashless Scheme</th>
                        </>
                      )}

                      {selectedConfigType === "expense_category" && (
                        <>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>GST Slab</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Monthly Budget</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Approval Limit</th>
                        </>
                      )}

                      {selectedConfigType === "surgical_package" && (
                        <>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Package Tariff (₹)</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Surgical Scope</th>
                        </>
                      )}

                      {selectedConfigType === "ambulance_fleet" && (
                        <>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Base Fee (₹)</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Vehicle / Equipment Notes</th>
                        </>
                      )}

                      {/* Dynamic Custom Catalog Defined Headers */}
                      {(currentCategoryInfo as any).fields && (currentCategoryInfo as any).fields.map((f: CustomFieldDef) => (
                        <th key={f.id} style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>
                          {f.label}
                        </th>
                      ))}

                      {![
                        "room_type", "visit_type", "specialization", "floor_type", 
                        "lab_test", "bed_category", "payment_type", "expense_category", 
                        "surgical_package", "ambulance_fleet"
                      ].includes(selectedConfigType) && !(currentCategoryInfo as any).fields && (
                        <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Description / Clinical Scope</th>
                      )}

                      <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Status</th>
                      <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Actions</th>

                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid var(--line)" }}>
                        {/* Code */}
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--indigo)" }}>
                          <span style={{ background: "var(--wash-b)", padding: "4px 8px", borderRadius: 6 }}>
                            {item.code}
                          </span>
                        </td>

                        {/* Name */}
                        <td style={{ padding: "12px 14px", fontWeight: 600 }}>{item.name}</td>

                        {/* Room Type Custom Columns */}
                        {selectedConfigType === "room_type" && (
                          <>
                            <td style={{ padding: "12px 14px" }}>{item.floor || "Ground Floor"}</td>
                            <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--indigo)" }}>{item.category || "General"}</td>
                            <td style={{ padding: "12px 14px", fontWeight: 700 }}>
                              {item.tariff_inr ? `₹${item.tariff_inr.toLocaleString("en-IN")}/day` : "Free / OPD"}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                {(item.amenities || []).map((am: string) => (
                                  <span key={am} style={{ fontSize: 11, background: "#EEF2FF", color: "var(--indigo)", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                                    {am}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              <span style={{
                                fontSize: 11,
                                padding: "3px 8px",
                                borderRadius: 6,
                                fontWeight: 800,
                                background: item.status === "Available" ? "#DCFCE7" : item.status === "Occupied" ? "#FEF3C7" : "#FEE2E2",
                                color: item.status === "Available" ? "#15803D" : item.status === "Occupied" ? "#B45309" : "#B91C1C",
                              }}>
                                {item.status || "Available"}
                              </span>
                            </td>
                          </>
                        )}

                        {/* Visit Type Custom Columns */}
                        {selectedConfigType === "visit_type" && (
                          <>
                            <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--indigo)" }}>
                              ₹{(item.fee_inr ?? 500).toLocaleString("en-IN")}
                            </td>
                            <td style={{ padding: "12px 14px" }}>{item.validity_days ?? 7} Days</td>
                            <td style={{ padding: "12px 14px" }}>{item.duration_mins ?? 15} Mins</td>
                            <td style={{ padding: "12px 14px" }}>
                              <div style={{ display: "flex", gap: 6 }}>
                                {item.is_emergency && (
                                  <span style={{ fontSize: 10.5, background: "#FEE2E2", color: "#B91C1C", padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>
                                    🚨 EMERGENCY
                                  </span>
                                )}
                                {item.is_telehealth && (
                                  <span style={{ fontSize: 10.5, background: "#E0F2FE", color: "#0369A1", padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>
                                    📹 TELEHEALTH
                                  </span>
                                )}
                                {!item.is_emergency && !item.is_telehealth && <span style={{ color: "var(--slate)" }}>OPD Standard</span>}
                              </div>
                            </td>
                          </>
                        )}

                        {/* Specialization Custom Columns */}
                        {selectedConfigType === "specialization" && (
                          <>
                            <td style={{ padding: "12px 14px", fontWeight: 600 }}>{item.hod_name || "Dr. Assigned"}</td>
                            <td style={{ padding: "12px 14px" }}>{item.default_chamber || "Chamber 101"}</td>
                            <td style={{ padding: "12px 14px" }}>{item.dept_type || "Clinical OPD"}</td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              {item.on_call_247 ? (
                                <span style={{ color: "var(--green)", fontWeight: 800 }}>✓ 24x7 Active</span>
                              ) : (
                                <span style={{ color: "var(--slate)" }}>OPD Hours</span>
                              )}
                            </td>
                          </>
                        )}

                        {/* Floor Type Custom Columns */}
                        {selectedConfigType === "floor_type" && (
                          <>
                            <td style={{ padding: "12px 14px", fontWeight: 700 }}>Level {item.floor_level ?? "0"}</td>
                            <td style={{ padding: "12px 14px" }}>{item.wing_block || "Main Block"}</td>
                            <td style={{ padding: "12px 14px", fontWeight: 600 }}>{item.bed_capacity ?? 10} Beds</td>
                            <td style={{ padding: "12px 14px" }}>Ext: <code>{item.nurse_ext || "101"}</code></td>
                          </>
                        )}

                        {/* Lab Test Custom Columns */}
                        {selectedConfigType === "lab_test" && (
                          <>
                            <td style={{ padding: "12px 14px" }}>{item.department || "Biochemistry"}</td>
                            <td style={{ padding: "12px 14px" }}>{item.sample_type || "Whole Blood"}</td>
                            <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--indigo)" }}>
                              ₹{(item.price_inr ?? 350).toLocaleString("en-IN")}
                            </td>
                            <td style={{ padding: "12px 14px" }}>{item.tat_hours ?? 2} Hours</td>
                            <td style={{ padding: "12px 14px", fontSize: 12.5, color: "var(--slate)" }}>
                              {item.normal_range || "Standard Reference"}
                            </td>
                          </>
                        )}

                        {/* Bed Category Custom Columns */}
                        {selectedConfigType === "bed_category" && (
                          <>
                            <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--indigo)" }}>
                              ₹{(item.tariff_inr ?? 1500).toLocaleString("en-IN")}/day
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              ₹{(item.nursing_charge_inr ?? 350).toLocaleString("en-IN")}/day
                            </td>
                            <td style={{ padding: "12px 14px", color: "var(--slate)" }}>{item.description}</td>
                          </>
                        )}

                        {/* Payment Type Custom Columns */}
                        {selectedConfigType === "payment_type" && (
                          <>
                            <td style={{ padding: "12px 14px" }}>{item.rail_type || "Digital Rail"}</td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              {item.requires_utr ? <span style={{ color: "var(--indigo)", fontWeight: 700 }}>Mandatory</span> : <span style={{ color: "var(--slate)" }}>Optional</span>}
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              {item.is_cashless_scheme ? (
                                <span style={{ fontSize: 11, background: "#FEF3C7", color: "#B45309", padding: "2px 8px", borderRadius: 4, fontWeight: 800 }}>
                                  Govt 100% Cashless
                                </span>
                              ) : (
                                <span style={{ color: "var(--slate)" }}>Standard</span>
                              )}
                            </td>
                          </>
                        )}

                        {/* Expense Category Custom Columns */}
                        {selectedConfigType === "expense_category" && (
                          <>
                            <td style={{ padding: "12px 14px" }}>{item.gst_slab || "0%"}</td>
                            <td style={{ padding: "12px 14px", fontWeight: 700 }}>
                              ₹{(item.monthly_budget_inr ?? 50000).toLocaleString("en-IN")}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              ₹{(item.approval_limit_inr ?? 5000).toLocaleString("en-IN")}
                            </td>
                          </>
                        )}

                        {/* Surgical Package Custom Columns */}
                        {selectedConfigType === "surgical_package" && (
                          <>
                            <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--indigo)" }}>
                              ₹{(item.tariff_inr ?? 25000).toLocaleString("en-IN")}
                            </td>
                            <td style={{ padding: "12px 14px", color: "var(--slate)" }}>{item.description}</td>
                          </>
                        )}

                        {/* Ambulance Fleet Custom Columns */}
                        {selectedConfigType === "ambulance_fleet" && (
                          <>
                            <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--indigo)" }}>
                              ₹{(item.tariff_inr ?? 1500).toLocaleString("en-IN")} Base
                            </td>
                            <td style={{ padding: "12px 14px", color: "var(--slate)" }}>{item.description}</td>
                          </>
                        )}

                        {/* Dynamic Custom Catalog Defined Data Cells */}
                        {(currentCategoryInfo as any).fields && (currentCategoryInfo as any).fields.map((f: CustomFieldDef) => {
                          const val = item[f.name];
                          if (f.type === "boolean") {
                            return (
                              <td key={f.id} style={{ padding: "12px 14px", textAlign: "center" }}>
                                <span style={{
                                  fontSize: 11,
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  fontWeight: 800,
                                  background: val ? "#DCFCE7" : "var(--wash-a)",
                                  color: val ? "#15803D" : "var(--slate)",
                                }}>
                                  {val ? "YES" : "NO"}
                                </span>
                              </td>
                            );
                          }
                          if (f.type === "number" && (f.label.includes("₹") || f.label.toLowerCase().includes("tariff") || f.label.toLowerCase().includes("price") || f.label.toLowerCase().includes("fee") || f.label.toLowerCase().includes("rate"))) {
                            return (
                              <td key={f.id} style={{ padding: "12px 14px", fontWeight: 700, color: "var(--indigo)" }}>
                                {val !== undefined && val !== null && val !== "" ? `₹${Number(val).toLocaleString("en-IN")}` : "₹0"}
                              </td>
                            );
                          }
                          if (f.type === "select") {
                            return (
                              <td key={f.id} style={{ padding: "12px 14px" }}>
                                <span style={{ fontSize: 11.5, background: "var(--wash-b)", color: "var(--indigo)", padding: "3px 8px", borderRadius: 4, fontWeight: 700 }}>
                                  {val || "—"}
                                </span>
                              </td>
                            );
                          }
                          return (
                            <td key={f.id} style={{ padding: "12px 14px" }}>
                              {val !== undefined && val !== null && val !== "" ? String(val) : "—"}
                            </td>
                          );
                        })}

                        {/* Simple Description for standard categories with no custom fields */}
                        {![
                          "room_type", "visit_type", "specialization", "floor_type", 
                          "lab_test", "bed_category", "payment_type", "expense_category", 
                          "surgical_package", "ambulance_fleet"
                        ].includes(selectedConfigType) && !(currentCategoryInfo as any).fields && (
                          <td style={{ padding: "12px 14px", color: "var(--slate)" }}>{item.description || "Master entity details"}</td>
                        )}



                        {/* Status */}
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <StatusPill kind={item.active ? "success" : "danger"}>
                            {item.active ? "ACTIVE" : "INACTIVE"}
                          </StatusPill>
                        </td>

                        {/* Actions */}
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
                        <td colSpan={8} style={{ padding: 24, textAlign: "center", color: "var(--slate)" }}>
                          No configuration items found for {currentCategoryInfo.label}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Dynamic Category-Specific Add Configuration Modal */}
          {showAddConfigModal && (
            <div
              style={{ position: "fixed", inset: 0, background: "rgba(10,17,102,0.45)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", zIndex: 99999, padding: 20 }}
              onClick={() => setShowAddConfigModal(false)}
            >
              <Card
                style={{ width: "100%", maxWidth: 580, padding: 28, borderRadius: 20, boxShadow: "var(--shadow-pop)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 21, color: "var(--indigo)", margin: 0 }}>
                      + Add New {currentCategoryInfo.label}
                    </h3>
                    <span style={{ fontSize: 12.5, color: "var(--slate)" }}>Configure customized entity parameters</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddConfigModal(false)}
                    aria-label="Close modal"
                    style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--slate)" }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: "grid", gap: 14 }}>
                  {/* Common Code & Name with Dynamic Placeholders */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                        Item Code / Key
                      </label>
                      <Input
                        autoFocus
                        placeholder={getItemPlaceholders().code}
                        value={newConfigCode}
                        onChange={(e) => setNewConfigCode(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                        {getItemPlaceholders().nameLabel} <span style={{ color: "var(--danger)" }}>*</span>
                      </label>
                      <Input
                        placeholder={getItemPlaceholders().namePlaceholder}
                        value={newConfigName}
                        onChange={(e) => setNewConfigName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* ROOM TYPE SPECIFIC FIELDS */}
                  {selectedConfigType === "room_type" && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Floor / Ward Level
                          </label>
                          <select
                            value={newConfigFloor}
                            onChange={(e) => setNewConfigFloor(e.target.value)}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13.5 }}
                          >
                            <option value="Ground Floor">Ground Floor (OPD)</option>
                            <option value="1st Floor">1st Floor (General Ward)</option>
                            <option value="2nd Floor">2nd Floor (ICU Complex)</option>
                            <option value="3rd Floor">3rd Floor (Operation Theatre)</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Bed / Room Category
                          </label>
                          <select
                            value={newConfigBedCategory}
                            onChange={(e) => setNewConfigBedCategory(e.target.value)}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13.5 }}
                          >
                            <option value="Consultation Chamber">Doctor Consultation Chamber</option>
                            <option value="General Ward">General Ward Bed</option>
                            <option value="Semi-Private">Semi-Private 2-Sharing</option>
                            <option value="Private Deluxe">Private Deluxe Suite</option>
                            <option value="ICU Ventilator">ICU Ventilator Bed</option>
                            <option value="Triage Bay">Triage & Vitals Bay</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Daily Room Tariff (₹)
                          </label>
                          <Input
                            type="number"
                            placeholder="0 for OPD chambers"
                            value={newConfigTariffInr}
                            onChange={(e) => setNewConfigTariffInr(e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Daily Nursing Charge (₹)
                          </label>
                          <Input
                            type="number"
                            placeholder="e.g. 350"
                            value={newConfigNursingInr}
                            onChange={(e) => setNewConfigNursingInr(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                          Room Amenities & Medical Equipment
                        </label>
                        <div style={{ display: "flex", gap: 14, background: "var(--wash-a)", padding: "10px 14px", borderRadius: 8 }}>
                          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                            <input type="checkbox" checked={newConfigOxygen} onChange={(e) => setNewConfigOxygen(e.target.checked)} />
                            🫁 Oxygen Line
                          </label>
                          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                            <input type="checkbox" checked={newConfigVentilator} onChange={(e) => setNewConfigVentilator(e.target.checked)} />
                            💨 Ventilator
                          </label>
                          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                            <input type="checkbox" checked={newConfigAC} onChange={(e) => setNewConfigAC(e.target.checked)} />
                            ❄️ Air Conditioned
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {/* VISIT TYPE SPECIFIC FIELDS */}
                  {selectedConfigType === "visit_type" && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Consultation Fee (₹)
                          </label>
                          <Input
                            type="number"
                            value={newConfigFeeInr}
                            onChange={(e) => setNewConfigFeeInr(e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Follow-up Window (Days)
                          </label>
                          <Input
                            type="number"
                            value={newConfigValidityDays}
                            onChange={(e) => setNewConfigValidityDays(e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Slot Duration (Mins)
                          </label>
                          <Input
                            type="number"
                            value={newConfigDurationMins}
                            onChange={(e) => setNewConfigDurationMins(e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 16, background: "var(--wash-a)", padding: "10px 14px", borderRadius: 8 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                          <input type="checkbox" checked={newConfigEmergency} onChange={(e) => setNewConfigEmergency(e.target.checked)} />
                          🚨 Priority Emergency Triage
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                          <input type="checkbox" checked={newConfigTelehealth} onChange={(e) => setNewConfigTelehealth(e.target.checked)} />
                          📹 Telehealth Video Consultation
                        </label>
                      </div>
                    </>
                  )}

                  {/* SPECIALIZATION SPECIFIC FIELDS */}
                  {selectedConfigType === "specialization" && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Head of Department (HOD)
                          </label>
                          <Input
                            value={newConfigHodName}
                            onChange={(e) => setNewConfigHodName(e.target.value)}
                            placeholder="e.g. Dr. K R Murali"
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Default Consultation Chamber
                          </label>
                          <Input
                            value={newConfigDefaultChamber}
                            onChange={(e) => setNewConfigDefaultChamber(e.target.value)}
                            placeholder="e.g. Chamber 101"
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Department Type
                          </label>
                          <select
                            value={newConfigDeptType}
                            onChange={(e) => setNewConfigDeptType(e.target.value)}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13.5 }}
                          >
                            <option value="Clinical OPD">Clinical OPD</option>
                            <option value="Surgical & OT">Surgical & Operation Theatre</option>
                            <option value="Diagnostic & Lab">Diagnostic & Pathology</option>
                            <option value="Critical Care">Critical Care & ICU</option>
                          </select>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", marginTop: 22 }}>
                          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                            <input type="checkbox" checked={newConfigOnCall247} onChange={(e) => setNewConfigOnCall247(e.target.checked)} />
                            🩺 24x7 Emergency On-Call
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {/* FLOOR & BUILDING WING SPECIFIC FIELDS */}
                  {selectedConfigType === "floor_type" && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Floor Level
                          </label>
                          <select
                            value={newConfigFloorLevel}
                            onChange={(e) => setNewConfigFloorLevel(e.target.value)}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13.5 }}
                          >
                            <option value="-1">Basement (-1)</option>
                            <option value="0">Ground Level (0)</option>
                            <option value="1">1st Floor Level (1)</option>
                            <option value="2">2nd Floor Level (2)</option>
                            <option value="3">3rd Floor Level (3)</option>
                            <option value="4">4th Floor Level (4)</option>
                            <option value="5">5th Floor Level (5)</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Building Wing / Block
                          </label>
                          <Input
                            value={newConfigWingBlock}
                            onChange={(e) => setNewConfigWingBlock(e.target.value)}
                            placeholder="e.g. Inpatient Block A / Surgical Wing"
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Bed Capacity (Beds Count)
                          </label>
                          <Input
                            type="number"
                            value={newConfigBedCapacity}
                            onChange={(e) => setNewConfigBedCapacity(e.target.value)}
                            placeholder="e.g. 24"
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Nurse Station Phone / Extension
                          </label>
                          <Input
                            value={newConfigNurseExt}
                            onChange={(e) => setNewConfigNurseExt(e.target.value)}
                            placeholder="e.g. Ext: 201"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* LAB TEST SPECIFIC FIELDS */}
                  {selectedConfigType === "lab_test" && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Laboratory Department
                          </label>
                          <select
                            value={newConfigLabDept}
                            onChange={(e) => setNewConfigLabDept(e.target.value)}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13.5 }}
                          >
                            <option value="Biochemistry">Biochemistry</option>
                            <option value="Hematology">Hematology</option>
                            <option value="Microbiology">Microbiology</option>
                            <option value="Radiology">Radiology & Imaging</option>
                            <option value="Pathology">Pathology</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Sample Required
                          </label>
                          <Input
                            value={newConfigSampleType}
                            onChange={(e) => setNewConfigSampleType(e.target.value)}
                            placeholder="e.g. Whole Blood (EDTA)"
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Patient Test Price (₹)
                          </label>
                          <Input
                            type="number"
                            value={newConfigPriceInr}
                            onChange={(e) => setNewConfigPriceInr(e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Turnaround Time (Hours)
                          </label>
                          <Input
                            type="number"
                            value={newConfigTatHours}
                            onChange={(e) => setNewConfigTatHours(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                          Standard Reference Range & Units
                        </label>
                        <Input
                          value={newConfigNormalRange}
                          onChange={(e) => setNewConfigNormalRange(e.target.value)}
                          placeholder="e.g. 13.5 - 17.5 g/dL"
                        />
                      </div>
                    </>
                  )}

                  {/* BED CATEGORY SPECIFIC FIELDS */}
                  {selectedConfigType === "bed_category" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                          Base Room Tariff (₹ / Day)
                        </label>
                        <Input
                          type="number"
                          value={newConfigTariffInr}
                          onChange={(e) => setNewConfigTariffInr(e.target.value)}
                          placeholder="e.g. 2500"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                          Daily Nursing Charge (₹ / Day)
                        </label>
                        <Input
                          type="number"
                          value={newConfigNursingInr}
                          onChange={(e) => setNewConfigNursingInr(e.target.value)}
                          placeholder="e.g. 450"
                        />
                      </div>
                    </div>
                  )}

                  {/* PAYMENT TYPE SPECIFIC FIELDS */}
                  {selectedConfigType === "payment_type" && (
                    <>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                          Payment Rail / Type
                        </label>
                        <select
                          value={newConfigRailType}
                          onChange={(e) => setNewConfigRailType(e.target.value)}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13.5 }}
                        >
                          <option value="UPI QR">Instant Dynamic UPI QR</option>
                          <option value="Card Swipe Terminal">POS Debit / Credit Card Swipe</option>
                          <option value="Physical Currency">Physical Cash Till Drawer</option>
                          <option value="Govt 100% Cashless">Govt Cashless Scheme (Dr. YSR / PMJAY)</option>
                          <option value="Insurance Pre-Auth">Private TPA Cashless Pre-Auth</option>
                          <option value="NEFT / RTGS">Bank Wire NEFT / RTGS</option>
                        </select>
                      </div>

                      <div style={{ display: "flex", gap: 16, background: "var(--wash-a)", padding: "10px 14px", borderRadius: 8 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                          <input type="checkbox" checked={newConfigRequiresUtr} onChange={(e) => setNewConfigRequiresUtr(e.target.checked)} />
                          🔢 Requires UTR / Txn Reference #
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                          <input type="checkbox" checked={newConfigCashlessScheme} onChange={(e) => setNewConfigCashlessScheme(e.target.checked)} />
                          🛡️ 100% Govt Cashless Scheme
                        </label>
                      </div>
                    </>
                  )}

                  {/* EXPENSE CATEGORY SPECIFIC FIELDS */}
                  {selectedConfigType === "expense_category" && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            GST Tax Slab
                          </label>
                          <select
                            value={newConfigGstSlab}
                            onChange={(e) => setNewConfigGstSlab(e.target.value)}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13.5 }}
                          >
                            <option value="0%">0% Exempted</option>
                            <option value="5%">5% GST</option>
                            <option value="12%">12% GST</option>
                            <option value="18%">18% GST</option>
                            <option value="28%">28% GST</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Monthly Budget (₹)
                          </label>
                          <Input
                            type="number"
                            value={newConfigMonthlyBudgetInr}
                            onChange={(e) => setNewConfigMonthlyBudgetInr(e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                            Approval Limit (₹)
                          </label>
                          <Input
                            type="number"
                            value={newConfigApprovalLimitInr}
                            onChange={(e) => setNewConfigApprovalLimitInr(e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* SURGICAL PACKAGE SPECIFIC FIELDS */}
                  {selectedConfigType === "surgical_package" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                          Package Tariff Total (₹)
                        </label>
                        <Input
                          type="number"
                          value={newConfigTariffInr}
                          onChange={(e) => setNewConfigTariffInr(e.target.value)}
                          placeholder="e.g. 35000"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                          Included Stay Days (IPD)
                        </label>
                        <Input
                          type="number"
                          value={newConfigPackageDays}
                          onChange={(e) => setNewConfigPackageDays(e.target.value)}
                          placeholder="e.g. 3"
                        />
                      </div>
                    </div>
                  )}

                  {/* AMBULANCE FLEET SPECIFIC FIELDS */}
                  {selectedConfigType === "ambulance_fleet" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                          Life Support Type
                        </label>
                        <select
                          value={newConfigAmbulanceType}
                          onChange={(e) => setNewConfigAmbulanceType(e.target.value)}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13.5 }}
                        >
                          <option value="ACLS Advanced Life Support">ACLS Ventilator Unit</option>
                          <option value="BLS Basic Life Support">BLS Oxygen Unit</option>
                          <option value="Patient Transport Vehicle">Non-Emergency Transport</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                          Base Callout Fee (₹)
                        </label>
                        <Input
                          type="number"
                          value={newConfigTariffInr}
                          onChange={(e) => setNewConfigTariffInr(e.target.value)}
                          placeholder="e.g. 2500"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                          Per KM Tariff (₹/km)
                        </label>
                        <Input
                          type="number"
                          value={newConfigPerKmTariff}
                          onChange={(e) => setNewConfigPerKmTariff(e.target.value)}
                          placeholder="e.g. 25"
                        />
                      </div>
                    </div>
                  )}

                  {/* TPA INSURANCE SPECIFIC FIELDS */}
                  {selectedConfigType === "tpa_insurance" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                          Pre-Auth Desk Phone / Toll-Free
                        </label>
                        <Input
                          value={newConfigPreAuthPhone}
                          onChange={(e) => setNewConfigPreAuthPhone(e.target.value)}
                          placeholder="e.g. 1800-102-4477"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                          Claim Approval TAT (Hours)
                        </label>
                        <Input
                          type="number"
                          value={newConfigTatHours}
                          onChange={(e) => setNewConfigTatHours(e.target.value)}
                          placeholder="e.g. 2"
                        />
                      </div>
                    </div>
                  )}

                  {/* BIOMEDICAL ASSET SPECIFIC FIELDS */}
                  {selectedConfigType === "biomedical_asset" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                          Manufacturer & Model
                        </label>
                        <Input
                          value={newConfigAssetModel}
                          onChange={(e) => setNewConfigAssetModel(e.target.value)}
                          placeholder="e.g. Philips 12-Lead Diagnostic ECG"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                          Next Calibration Due Date
                        </label>
                        <Input
                          type="date"
                          value={newConfigCalibrationDate}
                          onChange={(e) => setNewConfigCalibrationDate(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* SPECIMEN VACUTAINER SPECIFIC FIELDS */}
                  {selectedConfigType === "specimen_type" && (
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                        Vacutainer Cap Color Code
                      </label>
                      <select
                        value={newConfigCapColor}
                        onChange={(e) => setNewConfigCapColor(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13.5 }}
                      >
                        <option value="Purple (EDTA)">Purple Cap (EDTA - Whole Blood)</option>
                        <option value="Red (Plain Clot)">Red Cap (Plain Clot Activator - Serum)</option>
                        <option value="Yellow (Gel SST)">Yellow Cap (Gel Serum Separator SST)</option>
                        <option value="Grey (Fluoride)">Grey Cap (Sodium Fluoride - Glucose)</option>
                        <option value="Blue (Citrate)">Blue Cap (Sodium Citrate - Coagulation)</option>
                        <option value="Sterile Container">Sterile Container (Urine / Body Fluid)</option>
                      </select>
                    </div>
                  )}

                  {/* BIOMEDICAL WASTE SPECIFIC FIELDS */}
                  {selectedConfigType === "waste_category" && (
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                        CPCB / APPCB Waste Color Code
                      </label>
                      <select
                        value={newConfigWasteColor}
                        onChange={(e) => setNewConfigWasteColor(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13.5 }}
                      >
                        <option value="Yellow Bag (Incineration)">Yellow Bag (Anatomical & Soiled Tissue)</option>
                        <option value="Red Bag (Autoclave & Recycle)">Red Bag (Contaminated Plastics & IV sets)</option>
                        <option value="White Container (Puncture-Proof Sharps)">White Container (Needles & Scalpels)</option>
                        <option value="Blue Box (Glassware & Implants)">Blue Box (Glass Vials & Metal Implants)</option>
                      </select>
                    </div>
                  )}

                  {/* DYNAMIC USER-DEFINED SCHEMA FIELDS FOR CUSTOM CATALOGS */}
                  {(currentCategoryInfo as any).fields && (currentCategoryInfo as any).fields.length > 0 && (
                    <div style={{ display: "grid", gap: 12, background: "var(--wash-a)", padding: "14px 16px", borderRadius: 12, border: "1px solid var(--line)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "var(--indigo)" }}>
                          📋 Dynamic Schema Parameters ({currentCategoryInfo.label})
                        </span>
                        <span style={{ fontSize: 11, color: "var(--slate)" }}>Custom hospital-defined fields</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: (currentCategoryInfo as any).fields.length > 1 ? "1fr 1fr" : "1fr", gap: 12 }}>
                        {(currentCategoryInfo as any).fields.map((f: CustomFieldDef) => (
                          <div key={f.id}>
                            <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                              {f.label} {f.required && <span style={{ color: "var(--danger)" }}>*</span>}
                            </label>
                            {f.type === "text" && (
                              <Input
                                placeholder={`Enter ${f.label}`}
                                value={customItemValues[f.name] || ""}
                                onChange={(e) => setCustomItemValues((prev) => ({ ...prev, [f.name]: e.target.value }))}
                              />
                            )}
                            {f.type === "number" && (
                              <Input
                                type="number"
                                placeholder={f.label.includes("₹") ? "e.g. 1500" : "e.g. 10"}
                                value={customItemValues[f.name] || ""}
                                onChange={(e) => setCustomItemValues((prev) => ({ ...prev, [f.name]: e.target.value }))}
                              />
                            )}
                            {f.type === "select" && (
                              <select
                                value={customItemValues[f.name] || ""}
                                onChange={(e) => setCustomItemValues((prev) => ({ ...prev, [f.name]: e.target.value }))}
                                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13.5 }}
                              >
                                <option value="">Select Option</option>
                                {(f.options ? f.options.split(",").map((o) => o.trim()) : ["Standard", "Premium", "Priority"]).map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            )}
                            {f.type === "boolean" && (
                              <div style={{ marginTop: 8 }}>
                                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                                  <input
                                    type="checkbox"
                                    checked={Boolean(customItemValues[f.name])}
                                    onChange={(e) => setCustomItemValues((prev) => ({ ...prev, [f.name]: e.target.checked }))}
                                  />
                                  <span>Enable {f.label}</span>
                                </label>
                              </div>
                            )}
                            {f.type === "date" && (
                              <Input
                                type="date"
                                value={customItemValues[f.name] || ""}
                                onChange={(e) => setCustomItemValues((prev) => ({ ...prev, [f.name]: e.target.value }))}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                      Description & Clinical Notes
                    </label>
                    <Input
                      placeholder="Brief description or purpose"
                      value={newConfigDesc}
                      onChange={(e) => setNewConfigDesc(e.target.value)}
                    />
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
                    <Button ghost type="button" onClick={() => setShowAddConfigModal(false)}>
                      Cancel
                    </Button>
                    <Button type="button" disabled={!newConfigName} onClick={handleAddConfigItem}>
                      Save {currentCategoryInfo.label}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Create Custom Master Catalog Modal with Dynamic Schema Builder */}
          {showAddCategoryModal && (
            <div
              style={{ position: "fixed", inset: 0, background: "rgba(10,17,102,0.5)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", zIndex: 99999, padding: 20 }}
              onClick={() => setShowAddCategoryModal(false)}
            >
              <Card
                style={{ width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", padding: 28, borderRadius: 20, boxShadow: "var(--shadow-pop)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 21, color: "var(--indigo)", margin: 0 }}>
                      ✨ Create Custom Master Catalog
                    </h3>
                    <span style={{ fontSize: 12.5, color: "var(--slate)" }}>Define a new hospital-specific master category & data fields</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(false)}
                    aria-label="Close modal"
                    style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--slate)" }}
                  >
                    ✕
                  </button>
                </div>

                {/* Plan Quota Indicator Banner */}
                <div style={{ background: "#EEF2FF", padding: "8px 12px", borderRadius: 10, border: "1px solid var(--indigo)", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span style={{ color: "var(--indigo)", fontWeight: 700 }}>
                    👑 Plan Quota: {customCatalogCount + 1} of {customCatalogLimit === 999 ? "∞ Unlimited" : customCatalogLimit} Custom Catalogs
                  </span>
                  <span style={{ background: "var(--indigo)", color: "#fff", padding: "2px 8px", borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: "uppercase" }}>
                    {currentPlanTier} PLAN
                  </span>
                </div>

                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                        Category Icon
                      </label>
                      <select
                        value={newCatIcon}
                        onChange={(e) => setNewCatIcon(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 16 }}
                      >
                        <option value="🏷️">🏷️ Tag</option>
                        <option value="🩺">🩺 Stethoscope</option>
                        <option value="💉">💉 Syringe</option>
                        <option value="🩸">🩸 Blood</option>
                        <option value="🦷">🦷 Dental</option>
                        <option value="👁️">👁️ Ophthalmology</option>
                        <option value="🪑">🪑 Unit / Chair</option>
                        <option value="🔬">🔬 Laboratory</option>
                        <option value="🚑">🚑 Emergency</option>
                        <option value="🥗">🥗 Diet / Nutrition</option>
                        <option value="📦">📦 Logistics</option>
                        <option value="🛡️">🛡️ Compliance</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                        Catalog Name / Title <span style={{ color: "var(--danger)" }}>*</span>
                      </label>
                      <Input
                        autoFocus
                        placeholder="e.g. Dialysis Machines / Chairs"
                        value={newCatLabel}
                        onChange={(e) => {
                          setNewCatLabel(e.target.value);
                          if (!newCatKey) {
                            setNewCatKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"));
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                      System Key / Identifier
                    </label>
                    <Input
                      placeholder="e.g. dialysis_units"
                      value={newCatKey}
                      onChange={(e) => setNewCatKey(e.target.value)}
                    />
                    <span style={{ fontSize: 11, color: "var(--slate)", marginTop: 2, display: "block" }}>
                      Unique identifier used to group entities under this master catalog.
                    </span>
                  </div>

                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                      Description & Usage Scope
                    </label>
                    <Input
                      placeholder="e.g. Hemodialysis stations, RO water lines & shift allocations"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                    />
                  </div>

                  {/* DATA CAPTURING FIELDS SCHEMA BUILDER */}
                  <div style={{ background: "var(--wash-a)", padding: "14px 16px", borderRadius: 12, border: "1px solid var(--line)", marginTop: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--indigo)", display: "block" }}>
                          📋 Data Capturing Fields Schema
                        </span>
                        <span style={{ fontSize: 11, color: "var(--slate)" }}>
                          Define custom data attributes to capture for each item in this catalog
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNewCatFields((prev) => [
                            ...prev,
                            {
                              id: String(Date.now()),
                              name: `field_${prev.length + 1}`,
                              label: `Custom Field ${prev.length + 1}`,
                              type: "text",
                              required: false,
                            },
                          ]);
                        }}
                        style={{
                          background: "var(--indigo-soft)",
                          color: "var(--indigo-deep)",
                          border: "1px solid var(--indigo)",
                          borderRadius: 6,
                          padding: "4px 10px",
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        + Add Custom Field
                      </button>
                    </div>

                    <div style={{ display: "grid", gap: 10 }}>
                      {newCatFields.map((f) => (
                        <div key={f.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 30px", gap: 8, alignItems: "center", background: "#fff", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)" }}>
                          <div>
                            <Input
                              placeholder="Field Name / Label (e.g. Daily Tariff ₹)"
                              value={f.label}
                              onChange={(e) => {
                                const val = e.target.value;
                                setNewCatFields((prev) =>
                                  prev.map((item) => (item.id === f.id ? { ...item, label: val, name: val.toLowerCase().replace(/[^a-z0-9_]/g, "_") } : item))
                                );
                              }}
                              style={{ fontSize: 12.5, padding: "6px 10px" }}
                            />
                          </div>
                          <div>
                            <select
                              value={f.type}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                setNewCatFields((prev) =>
                                  prev.map((item) => (item.id === f.id ? { ...item, type: val } : item))
                                );
                              }}
                              style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12 }}
                            >
                              <option value="text">🔤 Text / String</option>
                              <option value="number">🔢 Number / Currency (₹)</option>
                              <option value="select">📑 Dropdown Options</option>
                              <option value="boolean">🔘 Yes / No Toggle</option>
                              <option value="date">📅 Date</option>
                            </select>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => setNewCatFields((prev) => prev.filter((item) => item.id !== f.id))}
                              title="Remove Field"
                              style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: 14, fontWeight: 800 }}
                            >
                              ✕
                            </button>
                          </div>

                          {f.type === "select" && (
                            <div style={{ gridColumn: "span 3", marginTop: 2 }}>
                              <Input
                                placeholder="Comma-separated choices (e.g. Morning Shift, Evening Shift, Night Shift)"
                                value={f.options || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setNewCatFields((prev) =>
                                    prev.map((item) => (item.id === f.id ? { ...item, options: val } : item))
                                  );
                                }}
                                style={{ fontSize: 11.5, padding: "4px 8px" }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
                    <Button ghost type="button" onClick={() => setShowAddCategoryModal(false)}>
                      Cancel
                    </Button>
                    <Button type="button" disabled={!newCatLabel.trim()} onClick={handleAddCustomCategory}>
                      Create Master Catalog
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Subscription Tier Upgrade Modal for Custom Catalogs */}
          {showUpgradePlanModal && (
            <div
              style={{ position: "fixed", inset: 0, background: "rgba(10,17,102,0.6)", backdropFilter: "blur(5px)", display: "grid", placeItems: "center", zIndex: 99999, padding: 20 }}
              onClick={() => setShowUpgradePlanModal(false)}
            >
              <Card
                style={{ width: "100%", maxWidth: 540, padding: 28, borderRadius: 24, boxShadow: "var(--shadow-pop)", border: "2px solid #F59E0B" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FEF3C7", color: "#D97706", display: "grid", placeItems: "center", fontSize: 24, fontWeight: 800 }}>
                      👑
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--indigo)", margin: 0 }}>
                        {currentPlanTier === "starter" ? "Unlock Custom Master Catalogs" : "Custom Catalog Quota Reached"}
                      </h3>
                      <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                        Current Tier: <strong style={{ color: "var(--indigo)", textTransform: "uppercase" }}>{currentPlanTier} PLAN</strong> ({customCatalogCount} of {customCatalogLimit === 999 ? "∞" : customCatalogLimit} custom catalogs used)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUpgradePlanModal(false)}
                    aria-label="Close modal"
                    style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--slate)" }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ background: "var(--wash-a)", padding: 16, borderRadius: 14, border: "1px solid var(--line)", marginBottom: 18 }}>
                  <div style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.6, marginBottom: 12 }}>
                    {currentPlanTier === "starter" ? (
                      <>
                        Your <strong>Starter Subscription</strong> includes all <strong>20 core healthcare catalogs</strong> by default.
                        To define hospital-specific catalogs (e.g. <em>Dialysis Chairs</em>, <em>Ophthalmology Lanes</em>, <em>Physiotherapy Stations</em>) with custom data capturing schemas, upgrade to <strong>Growth</strong> or <strong>Enterprise</strong>.
                      </>
                    ) : (
                      <>
                        You have reached the maximum limit of <strong>5 Custom Catalogs</strong> on your <strong>Growth Plan</strong>.
                        To create unlimited custom catalogs with bespoke clinical schemas, upgrade to the <strong>Enterprise Plan</strong>.
                      </>
                    )}
                  </div>

                  {/* Plan Comparison Mini Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, fontSize: 12 }}>
                    <div style={{ background: currentPlanTier === "starter" ? "#EFF6FF" : "#fff", padding: "10px 12px", borderRadius: 10, border: currentPlanTier === "starter" ? "2px solid var(--indigo)" : "1px solid var(--line)", textAlign: "center" }}>
                      <strong style={{ display: "block", color: "var(--indigo)" }}>Starter</strong>
                      <div style={{ color: "var(--slate)", fontSize: 11, margin: "4px 0" }}>20 Built-in Catalogs</div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)" }}>0 Custom</span>
                    </div>

                    <div style={{ background: currentPlanTier === "growth" ? "#EFF6FF" : "#fff", padding: "10px 12px", borderRadius: 10, border: currentPlanTier === "growth" ? "2px solid var(--indigo)" : "1px solid var(--line)", textAlign: "center" }}>
                      <strong style={{ display: "block", color: "var(--indigo)" }}>Growth</strong>
                      <div style={{ color: "var(--slate)", fontSize: 11, margin: "4px 0" }}>20 Built-in Catalogs</div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#16A34A" }}>5 Custom Schemas</span>
                    </div>

                    <div style={{ background: currentPlanTier === "enterprise" ? "#EFF6FF" : "#fff", padding: "10px 12px", borderRadius: 10, border: currentPlanTier === "enterprise" ? "2px solid var(--indigo)" : "1px solid #F59E0B", textAlign: "center" }}>
                      <strong style={{ display: "block", color: "#D97706" }}>Enterprise 👑</strong>
                      <div style={{ color: "var(--slate)", fontSize: 11, margin: "4px 0" }}>20 Built-in Catalogs</div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#D97706" }}>∞ Unlimited</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <Button ghost type="button" onClick={() => setShowUpgradePlanModal(false)}>
                    Close
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowUpgradePlanModal(false);
                      navigate("?tab=account");
                    }}
                    style={{ background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)", color: "#fff" }}
                  >
                    View Account Quotas ➔
                  </Button>

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
                  <strong style={{ color: "var(--ink)", width: 140 }}>Package Name :</strong>
                  <span style={{ color: "var(--indigo)", fontWeight: 700 }}>
                    {quotaData?.package_name || "HMS Growth Tier Subscription"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 140 }}>Expiry Date :</strong>
                  <span>{quotaData?.expiry_date || "25/07/2026"}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 140 }}>Admins :</strong>
                  <span>{quotaData?.admins_used ?? 1}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 140 }}>Staff :</strong>
                  <span>{quotaData?.staff_used ?? 3}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--indigo)", width: 140 }}>Standard Catalogs :</strong>
                  <span style={{ fontWeight: 700, color: "#16A34A" }}>20 Included (All Tiers)</span>
                </div>
              </div>

              {/* Right Column Info */}
              <div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 140 }}>Beds Limit :</strong>
                  <span>{quotaData?.beds_limit ?? 15}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 140 }}>Doctors Limit :</strong>
                  <span>{quotaData?.doctors_limit ?? 5}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 140 }}>SMS Count :</strong>
                  <span>{quotaData?.sms_count_limit ?? 200}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 140 }}>Email Count :</strong>
                  <span>{quotaData?.email_count_limit ?? 500}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 140 }}>Whatsapp Count :</strong>
                  <span>{quotaData?.whatsapp_count_limit ?? 1000}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--indigo)", width: 140 }}>Custom Catalogs :</strong>
                  <span style={{ fontWeight: 700, color: isCustomCatalogQuotaExhausted && currentPlanTier !== "enterprise" ? "#DC2626" : "var(--indigo)" }}>
                    {customCatalogCount} / {customCatalogLimit === 999 ? "∞ Unlimited" : `${customCatalogLimit} Max`} ({currentPlanTier.toUpperCase()})
                  </span>
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
