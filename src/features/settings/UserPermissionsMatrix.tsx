import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Button, Toast } from "../../ui/components";
import { useAuth } from "../../auth/AuthProvider";
import { api } from "../../api/client";

export interface ScreenItem {
  id: string;
  category: string;
  name: string;
  icon: string;
  defaultAccessible: string[];
  defaultCreate: string[];
  defaultRead: string[];
  defaultUpdate: string[];
  defaultDelete: string[];
}

export interface PermissionRecord {
  isAccessible: boolean;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

// Full 19 Roles matching user specification screenshots
export const ROLES_LIST = [
  "Administrator",
  "Doctor",
  "Nurse",
  "Lab Assistant",
  "Staff",
  "Marketing Executive",
  "Pharmacist",
  "Receptionist",
  "Billing",
  "Super Administrator",
  "Store Management",
  "Pharmacy Incharge",
  "Lab Incharge",
  "MRD",
  "Radiographer",
  "HR",
  "Tele Caller",
  "Accountant",
  "MOD",
];

// Complete 62 Screens across 11 modules matching exact screenshot sequence
export const ALL_SCREENS: ScreenItem[] = [
  // 1. Dashboard & AI
  {
    id: "dashboard_home",
    category: "Dashboard",
    name: "Dashboard /",
    icon: "▦",
    defaultAccessible: ["Administrator", "Super Administrator", "Doctor", "Nurse", "Receptionist", "Billing", "HR", "Accountant", "MOD"],
    defaultCreate: ["Administrator", "Super Administrator"],
    defaultRead: ["Administrator", "Super Administrator", "Doctor", "Nurse", "Receptionist", "Billing", "HR", "Accountant", "MOD"],
    defaultUpdate: ["Administrator", "Super Administrator"],
    defaultDelete: [],
  },
  {
    id: "ai_insight",
    category: "Dashboard",
    name: "AI Insight /",
    icon: "📊",
    defaultAccessible: ["Administrator", "Super Administrator", "Doctor", "MOD"],
    defaultCreate: ["Administrator", "Super Administrator"],
    defaultRead: ["Administrator", "Super Administrator", "Doctor", "MOD"],
    defaultUpdate: ["Administrator", "Super Administrator"],
    defaultDelete: [],
  },

  // 2. Out-Patient (OPD)
  {
    id: "opd_appointments",
    category: "Out-Patient",
    name: "Out-Patient / Appointments",
    icon: "🩺",
    defaultAccessible: ["Administrator", "Super Administrator", "Doctor", "Receptionist", "Nurse", "Tele Caller", "MOD"],
    defaultCreate: ["Administrator", "Super Administrator", "Receptionist", "Tele Caller"],
    defaultRead: ["Administrator", "Super Administrator", "Doctor", "Receptionist", "Nurse", "Tele Caller", "MOD"],
    defaultUpdate: ["Administrator", "Super Administrator", "Receptionist", "Doctor"],
    defaultDelete: ["Administrator", "Super Administrator"],
  },
  {
    id: "opd_patient_register",
    category: "Out-Patient",
    name: "Out-Patient / Patient Register",
    icon: "🩺",
    defaultAccessible: ["Administrator", "Super Administrator", "Receptionist", "Nurse", "MOD"],
    defaultCreate: ["Administrator", "Super Administrator", "Receptionist"],
    defaultRead: ["Administrator", "Super Administrator", "Receptionist", "Nurse", "Doctor", "MOD"],
    defaultUpdate: ["Administrator", "Super Administrator", "Receptionist"],
    defaultDelete: ["Administrator", "Super Administrator"],
  },
  {
    id: "opd_patient_list",
    category: "Out-Patient",
    name: "Out-Patient / Out-Patient List",
    icon: "🩺",
    defaultAccessible: ["Administrator", "Super Administrator", "Doctor", "Nurse", "Receptionist", "MOD"],
    defaultCreate: ["Administrator", "Super Administrator", "Receptionist"],
    defaultRead: ["Administrator", "Super Administrator", "Doctor", "Nurse", "Receptionist", "MOD"],
    defaultUpdate: ["Administrator", "Super Administrator", "Receptionist", "Doctor"],
    defaultDelete: ["Administrator", "Super Administrator"],
  },
  {
    id: "opd_medical_records",
    category: "Out-Patient",
    name: "Out-Patient / Medical Records",
    icon: "🩺",
    defaultAccessible: ["Administrator", "Super Administrator", "Doctor", "MRD", "MOD"],
    defaultCreate: ["Administrator", "Super Administrator", "Doctor", "MOD"],
    defaultRead: ["Administrator", "Super Administrator", "Doctor", "MRD", "MOD", "Nurse"],
    defaultUpdate: ["Administrator", "Super Administrator", "Doctor", "MOD"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "opd_privilege_card",
    category: "Out-Patient",
    name: "Out-Patient / Privilege Card",
    icon: "🩺",
    defaultAccessible: ["Administrator", "Super Administrator", "Receptionist", "Marketing Executive", "Billing"],
    defaultCreate: ["Administrator", "Super Administrator", "Receptionist", "Marketing Executive"],
    defaultRead: ["Administrator", "Super Administrator", "Receptionist", "Marketing Executive", "Billing"],
    defaultUpdate: ["Administrator", "Super Administrator", "Marketing Executive"],
    defaultDelete: ["Administrator", "Super Administrator"],
  },
  {
    id: "opd_bills",
    category: "Out-Patient",
    name: "Out-Patient / Bills",
    icon: "🩺",
    defaultAccessible: ["Administrator", "Super Administrator", "Billing", "Accountant", "Receptionist"],
    defaultCreate: ["Administrator", "Super Administrator", "Billing", "Receptionist"],
    defaultRead: ["Administrator", "Super Administrator", "Billing", "Accountant", "Receptionist"],
    defaultUpdate: ["Administrator", "Super Administrator", "Billing"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "opd_rate_plan_master",
    category: "Out-Patient",
    name: "Out-Patient / Rate Plan Master",
    icon: "🩺",
    defaultAccessible: ["Administrator", "Super Administrator", "Billing", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator"],
    defaultRead: ["Administrator", "Super Administrator", "Billing", "Accountant", "Receptionist"],
    defaultUpdate: ["Administrator", "Super Administrator"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "opd_package_master",
    category: "Out-Patient",
    name: "Out-Patient / Package Master",
    icon: "🩺",
    defaultAccessible: ["Administrator", "Super Administrator", "Billing", "Marketing Executive"],
    defaultCreate: ["Administrator", "Super Administrator"],
    defaultRead: ["Administrator", "Super Administrator", "Billing", "Marketing Executive", "Receptionist"],
    defaultUpdate: ["Administrator", "Super Administrator"],
    defaultDelete: ["Super Administrator"],
  },

  // 3. In-Patient (IPD)
  {
    id: "ipd_admission",
    category: "In-Patient",
    name: "In-Patient / Patient Admission",
    icon: "🛏️",
    defaultAccessible: ["Administrator", "Super Administrator", "Receptionist", "Nurse", "MOD"],
    defaultCreate: ["Administrator", "Super Administrator", "Receptionist", "Nurse"],
    defaultRead: ["Administrator", "Super Administrator", "Receptionist", "Nurse", "Doctor", "MOD"],
    defaultUpdate: ["Administrator", "Super Administrator", "Receptionist", "Nurse"],
    defaultDelete: ["Administrator", "Super Administrator"],
  },
  {
    id: "ipd_admitted_discharge",
    category: "In-Patient",
    name: "In-Patient / Admitted/Discharge Patients",
    icon: "🛏️",
    defaultAccessible: ["Administrator", "Super Administrator", "Doctor", "Nurse", "Receptionist", "MOD", "Billing"],
    defaultCreate: ["Administrator", "Super Administrator", "Doctor", "Nurse"],
    defaultRead: ["Administrator", "Super Administrator", "Doctor", "Nurse", "Receptionist", "MOD", "Billing"],
    defaultUpdate: ["Administrator", "Super Administrator", "Doctor", "Nurse"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "ipd_medical_records",
    category: "In-Patient",
    name: "In-Patient / Medical Records",
    icon: "🛏️",
    defaultAccessible: ["Administrator", "Super Administrator", "Doctor", "Nurse", "MRD", "MOD"],
    defaultCreate: ["Administrator", "Super Administrator", "Doctor", "Nurse", "MOD"],
    defaultRead: ["Administrator", "Super Administrator", "Doctor", "Nurse", "MRD", "MOD"],
    defaultUpdate: ["Administrator", "Super Administrator", "Doctor", "MOD"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "ipd_bed_status",
    category: "In-Patient",
    name: "In-Patient / Bed Status",
    icon: "🛏️",
    defaultAccessible: ["Administrator", "Super Administrator", "Doctor", "Nurse", "Receptionist", "MOD"],
    defaultCreate: ["Administrator", "Super Administrator", "Nurse"],
    defaultRead: ["Administrator", "Super Administrator", "Doctor", "Nurse", "Receptionist", "MOD"],
    defaultUpdate: ["Administrator", "Super Administrator", "Nurse"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "ipd_bed_transfer",
    category: "In-Patient",
    name: "In-Patient / Bed Transfer",
    icon: "🛏️",
    defaultAccessible: ["Administrator", "Super Administrator", "Nurse", "Receptionist", "MOD"],
    defaultCreate: ["Administrator", "Super Administrator", "Nurse"],
    defaultRead: ["Administrator", "Super Administrator", "Nurse", "Receptionist", "Doctor", "MOD"],
    defaultUpdate: ["Administrator", "Super Administrator", "Nurse"],
    defaultDelete: ["Super Administrator"],
  },

  // 4. Lab Management
  {
    id: "lab_bill_history",
    category: "Lab Management",
    name: "Lab Management / Bill History",
    icon: "🧪",
    defaultAccessible: ["Administrator", "Super Administrator", "Lab Incharge", "Lab Assistant", "Billing", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "Lab Incharge", "Billing"],
    defaultRead: ["Administrator", "Super Administrator", "Lab Incharge", "Lab Assistant", "Billing", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "Billing"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "lab_rate_plan_master",
    category: "Lab Management",
    name: "Lab Management / Rate Plan Master",
    icon: "🧪",
    defaultAccessible: ["Administrator", "Super Administrator", "Lab Incharge", "Billing"],
    defaultCreate: ["Administrator", "Super Administrator", "Lab Incharge"],
    defaultRead: ["Administrator", "Super Administrator", "Lab Incharge", "Lab Assistant", "Billing"],
    defaultUpdate: ["Administrator", "Super Administrator", "Lab Incharge"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "lab_package_master",
    category: "Lab Management",
    name: "Lab Management / Package Master",
    icon: "🧪",
    defaultAccessible: ["Administrator", "Super Administrator", "Lab Incharge", "Marketing Executive"],
    defaultCreate: ["Administrator", "Super Administrator", "Lab Incharge"],
    defaultRead: ["Administrator", "Super Administrator", "Lab Incharge", "Marketing Executive", "Billing"],
    defaultUpdate: ["Administrator", "Super Administrator", "Lab Incharge"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "lab_patient_incidents",
    category: "Lab Management",
    name: "Lab Management / Patient Incidents",
    icon: "🧪",
    defaultAccessible: ["Administrator", "Super Administrator", "Lab Incharge", "Lab Assistant", "MOD"],
    defaultCreate: ["Administrator", "Super Administrator", "Lab Incharge", "Lab Assistant"],
    defaultRead: ["Administrator", "Super Administrator", "Lab Incharge", "Lab Assistant", "MOD"],
    defaultUpdate: ["Administrator", "Super Administrator", "Lab Incharge"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "lab_supplier",
    category: "Lab Management",
    name: "Lab Management / Lab Supplier",
    icon: "🧪",
    defaultAccessible: ["Administrator", "Super Administrator", "Lab Incharge", "Store Management", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "Lab Incharge", "Store Management"],
    defaultRead: ["Administrator", "Super Administrator", "Lab Incharge", "Store Management", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "Lab Incharge"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "lab_purchase_indent",
    category: "Lab Management",
    name: "Lab Management / Lab Purchase Indent",
    icon: "🧪",
    defaultAccessible: ["Administrator", "Super Administrator", "Lab Incharge", "Store Management"],
    defaultCreate: ["Administrator", "Super Administrator", "Lab Incharge", "Lab Assistant"],
    defaultRead: ["Administrator", "Super Administrator", "Lab Incharge", "Store Management", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "Lab Incharge"],
    defaultDelete: ["Super Administrator"],
  },

  // 5. Pharmacy
  {
    id: "pharma_medicine",
    category: "Pharmacy",
    name: "Pharmacy / Medicine",
    icon: "💊",
    defaultAccessible: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist", "Doctor"],
    defaultCreate: ["Administrator", "Super Administrator", "Pharmacy Incharge"],
    defaultRead: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist", "Doctor"],
    defaultUpdate: ["Administrator", "Super Administrator", "Pharmacy Incharge"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "pharma_purchase",
    category: "Pharmacy",
    name: "Pharmacy / Purchase",
    icon: "💊",
    defaultAccessible: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Store Management", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Store Management"],
    defaultRead: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Store Management", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "Pharmacy Incharge"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "pharma_stock",
    category: "Pharmacy",
    name: "Pharmacy / Stock",
    icon: "💊",
    defaultAccessible: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist", "Store Management"],
    defaultCreate: ["Administrator", "Super Administrator", "Pharmacy Incharge"],
    defaultRead: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist", "Store Management"],
    defaultUpdate: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "pharma_bill",
    category: "Pharmacy",
    name: "Pharmacy / Bill",
    icon: "💊",
    defaultAccessible: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist", "Billing"],
    defaultCreate: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist"],
    defaultRead: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist", "Billing", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "Pharmacy Incharge"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "pharma_bill_history",
    category: "Pharmacy",
    name: "Pharmacy / Bill History",
    icon: "💊",
    defaultAccessible: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist", "Billing", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "Pharmacy Incharge"],
    defaultRead: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist", "Billing", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "Pharmacy Incharge"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "pharma_patient_incidents",
    category: "Pharmacy",
    name: "Pharmacy / Patient Incidents",
    icon: "💊",
    defaultAccessible: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist", "MOD"],
    defaultCreate: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist"],
    defaultRead: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist", "MOD"],
    defaultUpdate: ["Administrator", "Super Administrator", "Pharmacy Incharge"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "pharma_suppliers",
    category: "Pharmacy",
    name: "Pharmacy / Suppliers",
    icon: "💊",
    defaultAccessible: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Store Management", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "Pharmacy Incharge"],
    defaultRead: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Store Management", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "Pharmacy Incharge"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "pharma_purchase_indents",
    category: "Pharmacy",
    name: "Pharmacy / Purchase Indents",
    icon: "💊",
    defaultAccessible: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist", "Nurse"],
    defaultCreate: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist", "Nurse"],
    defaultRead: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist", "Store Management"],
    defaultUpdate: ["Administrator", "Super Administrator", "Pharmacy Incharge"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "pharma_expenses",
    category: "Pharmacy",
    name: "Pharmacy / Expenses",
    icon: "💊",
    defaultAccessible: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Accountant"],
    defaultRead: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "Accountant"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "pharma_supplier_tx",
    category: "Pharmacy",
    name: "Pharmacy / Supplier Transactions",
    icon: "💊",
    defaultAccessible: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "Accountant"],
    defaultRead: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "Accountant"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "pharma_distribution",
    category: "Pharmacy",
    name: "Pharmacy / Pharmacy Distribution",
    icon: "💊",
    defaultAccessible: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist", "Nurse"],
    defaultCreate: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist"],
    defaultRead: ["Administrator", "Super Administrator", "Pharmacy Incharge", "Pharmacist", "Nurse"],
    defaultUpdate: ["Administrator", "Super Administrator", "Pharmacy Incharge"],
    defaultDelete: ["Super Administrator"],
  },

  // 6. Radiology
  {
    id: "rad_usg_cases",
    category: "Radiology",
    name: "Radiology / USG Cases",
    icon: "⚙️",
    defaultAccessible: ["Administrator", "Super Administrator", "Radiographer", "Doctor", "MOD"],
    defaultCreate: ["Administrator", "Super Administrator", "Radiographer", "Doctor"],
    defaultRead: ["Administrator", "Super Administrator", "Radiographer", "Doctor", "MOD"],
    defaultUpdate: ["Administrator", "Super Administrator", "Radiographer", "Doctor"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "rad_usg_templates",
    category: "Radiology",
    name: "Radiology / USG Templates",
    icon: "⚙️",
    defaultAccessible: ["Administrator", "Super Administrator", "Radiographer", "Doctor"],
    defaultCreate: ["Administrator", "Super Administrator", "Radiographer"],
    defaultRead: ["Administrator", "Super Administrator", "Radiographer", "Doctor"],
    defaultUpdate: ["Administrator", "Super Administrator", "Radiographer"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "rad_xray_cases",
    category: "Radiology",
    name: "Radiology / XRay Cases",
    icon: "⚙️",
    defaultAccessible: ["Administrator", "Super Administrator", "Radiographer", "Doctor", "MOD"],
    defaultCreate: ["Administrator", "Super Administrator", "Radiographer"],
    defaultRead: ["Administrator", "Super Administrator", "Radiographer", "Doctor", "MOD"],
    defaultUpdate: ["Administrator", "Super Administrator", "Radiographer"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "rad_xray_templates",
    category: "Radiology",
    name: "Radiology / XRay Templates",
    icon: "⚙️",
    defaultAccessible: ["Administrator", "Super Administrator", "Radiographer", "Doctor"],
    defaultCreate: ["Administrator", "Super Administrator", "Radiographer"],
    defaultRead: ["Administrator", "Super Administrator", "Radiographer", "Doctor"],
    defaultUpdate: ["Administrator", "Super Administrator", "Radiographer"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "rad_bills",
    category: "Radiology",
    name: "Radiology / Bills",
    icon: "⚙️",
    defaultAccessible: ["Administrator", "Super Administrator", "Radiographer", "Billing", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "Billing", "Radiographer"],
    defaultRead: ["Administrator", "Super Administrator", "Radiographer", "Billing", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "Billing"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "rad_rate_plan_master",
    category: "Radiology",
    name: "Radiology / Rate Plan Master",
    icon: "⚙️",
    defaultAccessible: ["Administrator", "Super Administrator", "Radiographer", "Billing"],
    defaultCreate: ["Administrator", "Super Administrator"],
    defaultRead: ["Administrator", "Super Administrator", "Radiographer", "Billing"],
    defaultUpdate: ["Administrator", "Super Administrator"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "rad_package_master",
    category: "Radiology",
    name: "Radiology / Package Master",
    icon: "⚙️",
    defaultAccessible: ["Administrator", "Super Administrator", "Radiographer", "Marketing Executive"],
    defaultCreate: ["Administrator", "Super Administrator"],
    defaultRead: ["Administrator", "Super Administrator", "Radiographer", "Marketing Executive"],
    defaultUpdate: ["Administrator", "Super Administrator"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "rad_patient_incidents",
    category: "Radiology",
    name: "Radiology / Patient Incidents",
    icon: "⚙️",
    defaultAccessible: ["Administrator", "Super Administrator", "Radiographer", "MOD"],
    defaultCreate: ["Administrator", "Super Administrator", "Radiographer"],
    defaultRead: ["Administrator", "Super Administrator", "Radiographer", "MOD"],
    defaultUpdate: ["Administrator", "Super Administrator", "Radiographer"],
    defaultDelete: ["Super Administrator"],
  },

  // 7. NABH Quality
  {
    id: "nabh_dashboard",
    category: "NABH",
    name: "NABH / Dashboard",
    icon: "🏆",
    defaultAccessible: ["Administrator", "Super Administrator", "Doctor", "MOD", "HR"],
    defaultCreate: ["Administrator", "Super Administrator"],
    defaultRead: ["Administrator", "Super Administrator", "Doctor", "MOD", "HR"],
    defaultUpdate: ["Administrator", "Super Administrator"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "nabh_incidents",
    category: "NABH",
    name: "NABH / Incidents",
    icon: "🏆",
    defaultAccessible: ["Administrator", "Super Administrator", "Doctor", "Nurse", "MOD", "HR"],
    defaultCreate: ["Administrator", "Super Administrator", "Doctor", "Nurse", "MOD"],
    defaultRead: ["Administrator", "Super Administrator", "Doctor", "Nurse", "MOD", "HR"],
    defaultUpdate: ["Administrator", "Super Administrator", "MOD"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "nabh_indicator_def",
    category: "NABH",
    name: "NABH / Indicator Definitions",
    icon: "🏆",
    defaultAccessible: ["Administrator", "Super Administrator", "MOD"],
    defaultCreate: ["Administrator", "Super Administrator"],
    defaultRead: ["Administrator", "Super Administrator", "Doctor", "MOD"],
    defaultUpdate: ["Administrator", "Super Administrator"],
    defaultDelete: ["Super Administrator"],
  },

  // 8. CRM
  {
    id: "crm_lead_mgmt",
    category: "CRM",
    name: "CRM / Lead Management",
    icon: "📣",
    defaultAccessible: ["Administrator", "Super Administrator", "Marketing Executive", "Tele Caller"],
    defaultCreate: ["Administrator", "Super Administrator", "Marketing Executive", "Tele Caller"],
    defaultRead: ["Administrator", "Super Administrator", "Marketing Executive", "Tele Caller"],
    defaultUpdate: ["Administrator", "Super Administrator", "Marketing Executive", "Tele Caller"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "crm_campaign_scheduling",
    category: "CRM",
    name: "CRM / Campaign Scheduling",
    icon: "📣",
    defaultAccessible: ["Administrator", "Super Administrator", "Marketing Executive"],
    defaultCreate: ["Administrator", "Super Administrator", "Marketing Executive"],
    defaultRead: ["Administrator", "Super Administrator", "Marketing Executive"],
    defaultUpdate: ["Administrator", "Super Administrator", "Marketing Executive"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "crm_contacts",
    category: "CRM",
    name: "CRM / Contacts",
    icon: "📣",
    defaultAccessible: ["Administrator", "Super Administrator", "Marketing Executive", "Tele Caller", "Receptionist"],
    defaultCreate: ["Administrator", "Super Administrator", "Marketing Executive", "Tele Caller"],
    defaultRead: ["Administrator", "Super Administrator", "Marketing Executive", "Tele Caller", "Receptionist"],
    defaultUpdate: ["Administrator", "Super Administrator", "Marketing Executive"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "crm_whatsapp_reg",
    category: "CRM",
    name: "CRM / Whatsapp Registration",
    icon: "📣",
    defaultAccessible: ["Administrator", "Super Administrator"],
    defaultCreate: ["Administrator", "Super Administrator"],
    defaultRead: ["Administrator", "Super Administrator"],
    defaultUpdate: ["Administrator", "Super Administrator"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "crm_whatsapp_templates",
    category: "CRM",
    name: "CRM / Whatsapp Templates",
    icon: "📣",
    defaultAccessible: ["Administrator", "Super Administrator", "Marketing Executive"],
    defaultCreate: ["Administrator", "Super Administrator", "Marketing Executive"],
    defaultRead: ["Administrator", "Super Administrator", "Marketing Executive"],
    defaultUpdate: ["Administrator", "Super Administrator", "Marketing Executive"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "crm_sms_templates",
    category: "CRM",
    name: "CRM / Sms Templates",
    icon: "📣",
    defaultAccessible: ["Administrator", "Super Administrator", "Marketing Executive"],
    defaultCreate: ["Administrator", "Super Administrator", "Marketing Executive"],
    defaultRead: ["Administrator", "Super Administrator", "Marketing Executive"],
    defaultUpdate: ["Administrator", "Super Administrator", "Marketing Executive"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "crm_sms_settings",
    category: "CRM",
    name: "CRM / Sms Settings",
    icon: "📣",
    defaultAccessible: ["Administrator", "Super Administrator"],
    defaultCreate: ["Administrator", "Super Administrator"],
    defaultRead: ["Administrator", "Super Administrator"],
    defaultUpdate: ["Administrator", "Super Administrator"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "crm_email_templates",
    category: "CRM",
    name: "CRM / Email Templates",
    icon: "📣",
    defaultAccessible: ["Administrator", "Super Administrator", "Marketing Executive"],
    defaultCreate: ["Administrator", "Super Administrator", "Marketing Executive"],
    defaultRead: ["Administrator", "Super Administrator", "Marketing Executive"],
    defaultUpdate: ["Administrator", "Super Administrator", "Marketing Executive"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "crm_settings",
    category: "CRM",
    name: "CRM / CRM Settings",
    icon: "📣",
    defaultAccessible: ["Administrator", "Super Administrator"],
    defaultCreate: ["Administrator", "Super Administrator"],
    defaultRead: ["Administrator", "Super Administrator"],
    defaultUpdate: ["Administrator", "Super Administrator"],
    defaultDelete: ["Super Administrator"],
  },

  // 9. More (Procurement & Inventory)
  {
    id: "more_vendor_info",
    category: "More",
    name: "More / Vendor Information",
    icon: "📦",
    defaultAccessible: ["Administrator", "Super Administrator", "Store Management", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "Store Management"],
    defaultRead: ["Administrator", "Super Administrator", "Store Management", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "Store Management"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "more_vendor_contract",
    category: "More",
    name: "More / Vendor Contract",
    icon: "📦",
    defaultAccessible: ["Administrator", "Super Administrator", "Store Management", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "Store Management"],
    defaultRead: ["Administrator", "Super Administrator", "Store Management", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "Store Management"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "more_inventory_items",
    category: "More",
    name: "More / Inventory Items",
    icon: "📦",
    defaultAccessible: ["Administrator", "Super Administrator", "Store Management", "Staff"],
    defaultCreate: ["Administrator", "Super Administrator", "Store Management"],
    defaultRead: ["Administrator", "Super Administrator", "Store Management", "Staff"],
    defaultUpdate: ["Administrator", "Super Administrator", "Store Management"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "more_inventory_purchase",
    category: "More",
    name: "More / Inventory Purchase",
    icon: "📦",
    defaultAccessible: ["Administrator", "Super Administrator", "Store Management", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "Store Management"],
    defaultRead: ["Administrator", "Super Administrator", "Store Management", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "Store Management"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "more_inventory_stock",
    category: "More",
    name: "More / Inventory Stock",
    icon: "📦",
    defaultAccessible: ["Administrator", "Super Administrator", "Store Management"],
    defaultCreate: ["Administrator", "Super Administrator", "Store Management"],
    defaultRead: ["Administrator", "Super Administrator", "Store Management"],
    defaultUpdate: ["Administrator", "Super Administrator", "Store Management"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "more_inventory_utilized",
    category: "More",
    name: "More / Inventory Utilized",
    icon: "📦",
    defaultAccessible: ["Administrator", "Super Administrator", "Store Management", "Nurse", "Staff"],
    defaultCreate: ["Administrator", "Super Administrator", "Nurse", "Staff"],
    defaultRead: ["Administrator", "Super Administrator", "Store Management", "Nurse", "Staff"],
    defaultUpdate: ["Administrator", "Super Administrator", "Store Management"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "more_asset_items",
    category: "More",
    name: "More / Asset Items",
    icon: "📦",
    defaultAccessible: ["Administrator", "Super Administrator", "Store Management", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "Store Management"],
    defaultRead: ["Administrator", "Super Administrator", "Store Management", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "Store Management"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "more_asset_purchase",
    category: "More",
    name: "More / Asset Purchase",
    icon: "📦",
    defaultAccessible: ["Administrator", "Super Administrator", "Store Management", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "Store Management", "Accountant"],
    defaultRead: ["Administrator", "Super Administrator", "Store Management", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "Store Management"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "more_asset_utilized",
    category: "More",
    name: "More / Asset Utilized",
    icon: "📦",
    defaultAccessible: ["Administrator", "Super Administrator", "Store Management"],
    defaultCreate: ["Administrator", "Super Administrator", "Store Management"],
    defaultRead: ["Administrator", "Super Administrator", "Store Management"],
    defaultUpdate: ["Administrator", "Super Administrator", "Store Management"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "more_asset_stock",
    category: "More",
    name: "More / Asset Stock",
    icon: "📦",
    defaultAccessible: ["Administrator", "Super Administrator", "Store Management"],
    defaultCreate: ["Administrator", "Super Administrator", "Store Management"],
    defaultRead: ["Administrator", "Super Administrator", "Store Management"],
    defaultUpdate: ["Administrator", "Super Administrator", "Store Management"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "more_expenses",
    category: "More",
    name: "More / Expenses",
    icon: "📦",
    defaultAccessible: ["Administrator", "Super Administrator", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "Accountant"],
    defaultRead: ["Administrator", "Super Administrator", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "Accountant"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "more_income",
    category: "More",
    name: "More / Income",
    icon: "📦",
    defaultAccessible: ["Administrator", "Super Administrator", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "Accountant"],
    defaultRead: ["Administrator", "Super Administrator", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "Accountant"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "more_incidents",
    category: "More",
    name: "More / Incidents",
    icon: "📦",
    defaultAccessible: ["Administrator", "Super Administrator", "MOD", "Staff"],
    defaultCreate: ["Administrator", "Super Administrator", "MOD", "Staff"],
    defaultRead: ["Administrator", "Super Administrator", "MOD", "Staff"],
    defaultUpdate: ["Administrator", "Super Administrator", "MOD"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "more_download_center",
    category: "More",
    name: "More / Download Center",
    icon: "📦",
    defaultAccessible: ["Administrator", "Super Administrator", "Doctor", "Nurse", "Receptionist", "Staff", "MOD"],
    defaultCreate: ["Administrator", "Super Administrator"],
    defaultRead: ["Administrator", "Super Administrator", "Doctor", "Nurse", "Receptionist", "Staff", "MOD"],
    defaultUpdate: ["Administrator", "Super Administrator"],
    defaultDelete: ["Super Administrator"],
  },

  // 10. Admin
  {
    id: "admin_account_settings",
    category: "Admin",
    name: "Admin / Account Settings",
    icon: "🛡️",
    defaultAccessible: ["Administrator", "Super Administrator"],
    defaultCreate: ["Super Administrator"],
    defaultRead: ["Administrator", "Super Administrator"],
    defaultUpdate: ["Administrator", "Super Administrator"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "admin_user_auth",
    category: "Admin",
    name: "Admin / User Authentication",
    icon: "🛡️",
    defaultAccessible: ["Administrator", "Super Administrator"],
    defaultCreate: ["Administrator", "Super Administrator"],
    defaultRead: ["Administrator", "Super Administrator"],
    defaultUpdate: ["Administrator", "Super Administrator"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "admin_users",
    category: "Admin",
    name: "Admin / Users",
    icon: "🛡️",
    defaultAccessible: ["Administrator", "Super Administrator", "HR"],
    defaultCreate: ["Administrator", "Super Administrator", "HR"],
    defaultRead: ["Administrator", "Super Administrator", "HR"],
    defaultUpdate: ["Administrator", "Super Administrator", "HR"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "admin_payment",
    category: "Admin",
    name: "Admin / Payment",
    icon: "🛡️",
    defaultAccessible: ["Administrator", "Super Administrator", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator"],
    defaultRead: ["Administrator", "Super Administrator", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "admin_online_services",
    category: "Admin",
    name: "Admin / Online Services",
    icon: "🛡️",
    defaultAccessible: ["Administrator", "Super Administrator"],
    defaultCreate: ["Administrator", "Super Administrator"],
    defaultRead: ["Administrator", "Super Administrator"],
    defaultUpdate: ["Administrator", "Super Administrator"],
    defaultDelete: ["Super Administrator"],
  },

  // 11. HR & PayRoll
  {
    id: "hr_employees",
    category: "HR & PayRoll",
    name: "HR & PayRoll / Employees",
    icon: "👥",
    defaultAccessible: ["Administrator", "Super Administrator", "HR", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "HR"],
    defaultRead: ["Administrator", "Super Administrator", "HR", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "HR"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "hr_doctors",
    category: "HR & PayRoll",
    name: "HR & PayRoll / Doctors",
    icon: "👥",
    defaultAccessible: ["Administrator", "Super Administrator", "HR", "Doctor"],
    defaultCreate: ["Administrator", "Super Administrator", "HR"],
    defaultRead: ["Administrator", "Super Administrator", "HR", "Doctor"],
    defaultUpdate: ["Administrator", "Super Administrator", "HR"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "hr_referrals",
    category: "HR & PayRoll",
    name: "HR & PayRoll / Referrals",
    icon: "👥",
    defaultAccessible: ["Administrator", "Super Administrator", "HR", "Marketing Executive", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "HR", "Marketing Executive"],
    defaultRead: ["Administrator", "Super Administrator", "HR", "Marketing Executive", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "HR"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "hr_doctor_ratings",
    category: "HR & PayRoll",
    name: "HR & PayRoll / Doctor Ratings",
    icon: "👥",
    defaultAccessible: ["Administrator", "Super Administrator", "HR", "Doctor"],
    defaultCreate: ["Administrator", "Super Administrator", "HR"],
    defaultRead: ["Administrator", "Super Administrator", "HR", "Doctor"],
    defaultUpdate: ["Administrator", "Super Administrator"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "hr_payroll_dashboard",
    category: "HR & PayRoll",
    name: "HR & PayRoll / Payroll Dashboard",
    icon: "👥",
    defaultAccessible: ["Administrator", "Super Administrator", "HR", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "HR", "Accountant"],
    defaultRead: ["Administrator", "Super Administrator", "HR", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "HR"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "hr_payroll_list",
    category: "HR & PayRoll",
    name: "HR & PayRoll / Payroll List",
    icon: "👥",
    defaultAccessible: ["Administrator", "Super Administrator", "HR", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "HR", "Accountant"],
    defaultRead: ["Administrator", "Super Administrator", "HR", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "HR"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "hr_employee_salary",
    category: "HR & PayRoll",
    name: "HR & PayRoll / Employee Salary",
    icon: "👥",
    defaultAccessible: ["Administrator", "Super Administrator", "HR", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "HR"],
    defaultRead: ["Administrator", "Super Administrator", "HR", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "HR"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "hr_timesheet",
    category: "HR & PayRoll",
    name: "HR & PayRoll / Timesheet",
    icon: "👥",
    defaultAccessible: ["Administrator", "Super Administrator", "HR", "Staff", "Nurse"],
    defaultCreate: ["Administrator", "Super Administrator", "HR", "Staff", "Nurse"],
    defaultRead: ["Administrator", "Super Administrator", "HR", "Staff", "Nurse"],
    defaultUpdate: ["Administrator", "Super Administrator", "HR"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "hr_attendance_dashboard",
    category: "HR & PayRoll",
    name: "HR & PayRoll / Attendance Dashboard",
    icon: "👥",
    defaultAccessible: ["Administrator", "Super Administrator", "HR", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "HR"],
    defaultRead: ["Administrator", "Super Administrator", "HR", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "HR"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "hr_payout_structure",
    category: "HR & PayRoll",
    name: "HR & PayRoll / Payout Structure",
    icon: "👥",
    defaultAccessible: ["Administrator", "Super Administrator", "HR", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "HR"],
    defaultRead: ["Administrator", "Super Administrator", "HR", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "HR"],
    defaultDelete: ["Super Administrator"],
  },
  {
    id: "hr_employee_payouts",
    category: "HR & PayRoll",
    name: "HR & PayRoll / Employee Payouts",
    icon: "👥",
    defaultAccessible: ["Administrator", "Super Administrator", "HR", "Accountant"],
    defaultCreate: ["Administrator", "Super Administrator", "HR", "Accountant"],
    defaultRead: ["Administrator", "Super Administrator", "HR", "Accountant"],
    defaultUpdate: ["Administrator", "Super Administrator", "Accountant"],
    defaultDelete: ["Super Administrator"],
  },

  // 12. Reports
  {
    id: "rpt_daily_tx",
    category: "Reports",
    name: "Reports / Daily Transaction Report",
    icon: "📊",
    defaultAccessible: ["Administrator", "Super Administrator", "Billing", "Accountant"],
    defaultCreate: [],
    defaultRead: ["Administrator", "Super Administrator", "Billing", "Accountant"],
    defaultUpdate: [],
    defaultDelete: [],
  },
  {
    id: "rpt_all_tx",
    category: "Reports",
    name: "Reports / All Transaction Report",
    icon: "📊",
    defaultAccessible: ["Administrator", "Super Administrator", "Accountant"],
    defaultCreate: [],
    defaultRead: ["Administrator", "Super Administrator", "Accountant"],
    defaultUpdate: [],
    defaultDelete: [],
  },
  {
    id: "rpt_appointment",
    category: "Reports",
    name: "Reports / Appointment Report",
    icon: "📊",
    defaultAccessible: ["Administrator", "Super Administrator", "Receptionist", "Doctor", "MOD"],
    defaultCreate: [],
    defaultRead: ["Administrator", "Super Administrator", "Receptionist", "Doctor", "MOD"],
    defaultUpdate: [],
    defaultDelete: [],
  },
  {
    id: "rpt_opd",
    category: "Reports",
    name: "Reports / OPD Report",
    icon: "📊",
    defaultAccessible: ["Administrator", "Super Administrator", "Receptionist", "Doctor", "MOD"],
    defaultCreate: [],
    defaultRead: ["Administrator", "Super Administrator", "Receptionist", "Doctor", "MOD"],
    defaultUpdate: [],
    defaultDelete: [],
  },
  {
    id: "rpt_ipd",
    category: "Reports",
    name: "Reports / IPD Report",
    icon: "📊",
    defaultAccessible: ["Administrator", "Super Administrator", "Nurse", "Doctor", "MOD"],
    defaultCreate: [],
    defaultRead: ["Administrator", "Super Administrator", "Nurse", "Doctor", "MOD"],
    defaultUpdate: [],
    defaultDelete: [],
  },
  {
    id: "rpt_ip_discharge",
    category: "Reports",
    name: "Reports / IP Discharge Report",
    icon: "📊",
    defaultAccessible: ["Administrator", "Super Administrator", "Nurse", "Doctor", "MOD"],
    defaultCreate: [],
    defaultRead: ["Administrator", "Super Administrator", "Nurse", "Doctor", "MOD"],
    defaultUpdate: [],
    defaultDelete: [],
  },
  {
    id: "rpt_ip_admission",
    category: "Reports",
    name: "Reports / IP Admission Report",
    icon: "📊",
    defaultAccessible: ["Administrator", "Super Administrator", "Nurse", "Doctor", "MOD"],
    defaultCreate: [],
    defaultRead: ["Administrator", "Super Administrator", "Nurse", "Doctor", "MOD"],
    defaultUpdate: [],
    defaultDelete: [],
  },
  {
    id: "rpt_ip_admission_cancel",
    category: "Reports",
    name: "Reports / IP Admission Cancel Report",
    icon: "📊",
    defaultAccessible: ["Administrator", "Super Administrator", "Nurse", "MOD"],
    defaultCreate: [],
    defaultRead: ["Administrator", "Super Administrator", "Nurse", "MOD"],
    defaultUpdate: [],
    defaultDelete: [],
  },
  {
    id: "rpt_total_sales",
    category: "Reports",
    name: "Reports / Total Sales",
    icon: "📊",
    defaultAccessible: ["Administrator", "Super Administrator", "Accountant"],
    defaultCreate: [],
    defaultRead: ["Administrator", "Super Administrator", "Accountant"],
    defaultUpdate: [],
    defaultDelete: [],
  },
  {
    id: "rpt_op_sales",
    category: "Reports",
    name: "Reports / OP Sales",
    icon: "📊",
    defaultAccessible: ["Administrator", "Super Administrator", "Billing", "Accountant"],
    defaultCreate: [],
    defaultRead: ["Administrator", "Super Administrator", "Billing", "Accountant"],
    defaultUpdate: [],
    defaultDelete: [],
  },
];

// Normalize Keycloak / user roles to one of the 19 standard matrix role display names
export function normalizeRoleToMatrixKey(role: string | undefined | null): string {
  if (!role) return "Staff";
  const r = role.toLowerCase().replace(/[-_]/g, " ").trim();

  // Super Administrator / Platform Operator
  if (r.includes("super") || r.includes("operator") || r.includes("platform admin")) return "Super Administrator";

  // Administrator
  if (r.includes("admin") || r.includes("management") || r === "dean" || r.includes("director")) return "Administrator";

  // Doctor / Physician
  if (
    r.includes("physician") ||
    r.includes("doctor") ||
    r.includes("practitioner") ||
    r.includes("consultant") ||
    r.includes("surgeon") ||
    r.includes("clinician")
  ) {
    return "Doctor";
  }

  // Medical Officer on Duty (MOD)
  if (r.includes("mod") || r.includes("duty doctor") || r.includes("casualty officer") || r.includes("medical officer")) {
    return "MOD";
  }

  // Nurse
  if (r.includes("nurse") || r.includes("sister") || r.includes("matron")) return "Nurse";

  // Pharmacy Incharge vs. Pharmacist
  if ((r.includes("pharma") || r.includes("druggist") || r.includes("dispensary")) && (r.includes("incharge") || r.includes("head") || r.includes("lead"))) {
    return "Pharmacy Incharge";
  }
  if (r.includes("pharma") || r.includes("dispensary") || r.includes("chemist")) return "Pharmacist";

  // Lab Incharge vs. Lab Assistant
  if ((r.includes("lab") || r.includes("pathology") || r.includes("technician")) && (r.includes("incharge") || r.includes("head") || r.includes("lead"))) {
    return "Lab Incharge";
  }
  if (r.includes("lab") || r.includes("pathology") || r.includes("phlebotomist") || r.includes("technician")) {
    return "Lab Assistant";
  }

  // Radiographer / Radiology
  if (r.includes("radio") || r.includes("xray") || r.includes("x ray") || r.includes("ct tech") || r.includes("mri tech") || r.includes("sonographer")) {
    return "Radiographer";
  }

  // Medical Records Department (MRD)
  if (r.includes("mrd") || r.includes("record") || r.includes("archivist") || r.includes("coder")) return "MRD";

  // HR
  if (r.includes("hr") || r.includes("human resource") || r.includes("personnel") || r.includes("payroll")) return "HR";

  // Accountant
  if (r.includes("account") || r.includes("finance") || r.includes("audit") || r.includes("comptroller")) return "Accountant";

  // Receptionist
  if (r.includes("reception") || r.includes("front desk") || r.includes("frontdesk") || r.includes("admissions desk")) return "Receptionist";

  // Billing
  if (r.includes("bill") || r.includes("cashier") || r.includes("till clerk")) return "Billing";

  // Tele Caller
  if (r.includes("tele") || r.includes("call") || r.includes("contact center") || r.includes("bpo")) return "Tele Caller";

  // Marketing Executive
  if (r.includes("market") || r.includes("sales") || r.includes("outreach") || r.includes("business dev")) return "Marketing Executive";

  // Store Management
  if (r.includes("store") || r.includes("inventory") || r.includes("warehouse") || r.includes("stock")) return "Store Management";

  // Exact match check against standard list
  const exactMatch = ROLES_LIST.find((item) => item.toLowerCase() === r);
  if (exactMatch) return exactMatch;

  return "Staff";
}

// Generate default matrix for a given role
export function generateDefaultPermissionsForRole(roleName: string): Record<string, PermissionRecord> {
  const isSuper = roleName === "Super Administrator" || roleName === "Administrator";
  const records: Record<string, PermissionRecord> = {};

  ALL_SCREENS.forEach((screen) => {
    if (isSuper) {
      records[screen.id] = {
        isAccessible: true,
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: roleName === "Super Administrator" || !screen.id.startsWith("admin_"),
      };
    } else {
      const isAccessible = screen.defaultAccessible.includes(roleName);
      records[screen.id] = {
        isAccessible,
        canCreate: isAccessible && screen.defaultCreate.includes(roleName),
        canRead: isAccessible && screen.defaultRead.includes(roleName),
        canUpdate: isAccessible && screen.defaultUpdate.includes(roleName),
        canDelete: isAccessible && screen.defaultDelete.includes(roleName),
      };
    }
  });

  return records;
}

export function UserPermissionsMatrix() {
  const { tenant, token } = useAuth();
  const qc = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>("Doctor");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Storage key per tenant for offline / instant cache fallback
  const storageKey = `hms-screen-permissions-${tenant || "default"}`;

  // Role permissions dictionary: { [roleName]: { [screenId]: PermissionRecord } }
  const [allRolePermissions, setAllRolePermissions] = useState<Record<string, Record<string, PermissionRecord>>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // initialize defaults for all roles
    const initial: Record<string, Record<string, PermissionRecord>> = {};
    ROLES_LIST.forEach((r) => {
      initial[r] = generateDefaultPermissionsForRole(r);
    });
    return initial;
  });

  // Query server permissions
  const { data: serverData, isLoading: isFetchingServer } = useQuery({
    queryKey: ["tenant-permissions", tenant],
    queryFn: async () => {
      if (!tenant) return null;
      try {
        return await api.getTenantPermissions(token, tenant);
      } catch (e) {
        console.warn("Could not fetch remote permissions from backend:", e);
        return null;
      }
    },
    enabled: !!tenant && !!token,
    staleTime: 30 * 1000,
  });

  // Sync server data into state if available
  useEffect(() => {
    if (serverData?.permissions && Object.keys(serverData.permissions).length > 0) {
      setAllRolePermissions((prev) => {
        const merged = { ...prev };
        Object.entries(serverData.permissions).forEach(([r, perms]) => {
          merged[r] = perms as Record<string, PermissionRecord>;
        });
        try {
          localStorage.setItem(storageKey, JSON.stringify(merged));
        } catch {
          // ignore
        }
        return merged;
      });
    }
  }, [serverData, storageKey]);

  // Mutation to persist permissions to backend
  const updateMutation = useMutation({
    mutationFn: async (updatedPerms: Record<string, Record<string, PermissionRecord>>) => {
      if (!tenant) return;
      return await api.updateTenantPermissions(token, tenant, updatedPerms);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant-permissions", tenant] });
      triggerToast(`🎉 Permissions matrix for '${selectedRole}' successfully saved and synced to database!`);
    },
    onError: (err: any) => {
      triggerToast(`⚠️ Saved locally, but server update returned: ${err?.message || "Check network connection"}`);
    },
  });

  // Current selected role's permissions
  const currentPermissions = useMemo(() => {
    return allRolePermissions[selectedRole] || generateDefaultPermissionsForRole(selectedRole);
  }, [allRolePermissions, selectedRole]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Toggle single permission cell with Admin Lockout Prevention
  const handleToggleCell = (screenId: string, field: keyof PermissionRecord) => {
    // Admin Lockout Safeguard: Administrator cannot disable user authentication screen
    if (
      (selectedRole === "Administrator" || selectedRole === "Super Administrator") &&
      screenId === "admin_user_auth" &&
      field === "isAccessible"
    ) {
      triggerToast("🔒 Admin Lockout Safeguard: Administrator cannot revoke access to User Authentication screen.");
      return;
    }

    setAllRolePermissions((prev) => {
      const roleObj = { ...(prev[selectedRole] || generateDefaultPermissionsForRole(selectedRole)) };
      const currentRec = roleObj[screenId] || {
        isAccessible: false,
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
      };

      const nextVal = !currentRec[field];
      const updatedRec: PermissionRecord = { ...currentRec, [field]: nextVal };

      // If turning on create/update/delete, ensure isAccessible and canRead are also turned on
      if (nextVal && (field === "canCreate" || field === "canUpdate" || field === "canDelete")) {
        updatedRec.isAccessible = true;
        updatedRec.canRead = true;
      }
      // If turning off isAccessible, turn off all CRUD
      if (field === "isAccessible" && !nextVal) {
        updatedRec.canCreate = false;
        updatedRec.canRead = false;
        updatedRec.canUpdate = false;
        updatedRec.canDelete = false;
      }

      roleObj[screenId] = updatedRec;
      return { ...prev, [selectedRole]: roleObj };
    });
  };

  // Column "Select All" toggle
  const handleToggleColumn = (field: keyof PermissionRecord) => {
    const allChecked = ALL_SCREENS.every((s) => currentPermissions[s.id]?.[field]);
    const nextVal = !allChecked;

    setAllRolePermissions((prev) => {
      const roleObj = { ...(prev[selectedRole] || generateDefaultPermissionsForRole(selectedRole)) };
      ALL_SCREENS.forEach((s) => {
        // Lockout safeguard on column toggle for Admin
        if (
          (selectedRole === "Administrator" || selectedRole === "Super Administrator") &&
          s.id === "admin_user_auth" &&
          field === "isAccessible" &&
          !nextVal
        ) {
          return;
        }

        const cur = roleObj[s.id] || { isAccessible: false, canCreate: false, canRead: false, canUpdate: false, canDelete: false };
        const updated = { ...cur, [field]: nextVal };
        if (nextVal && (field === "canCreate" || field === "canUpdate" || field === "canDelete")) {
          updated.isAccessible = true;
          updated.canRead = true;
        }
        if (field === "isAccessible" && !nextVal) {
          updated.canCreate = false;
          updated.canRead = false;
          updated.canUpdate = false;
          updated.canDelete = false;
        }
        roleObj[s.id] = updated;
      });
      return { ...prev, [selectedRole]: roleObj };
    });
  };

  // Check if entire column is checked
  const isColumnAllChecked = (field: keyof PermissionRecord) => {
    return ALL_SCREENS.length > 0 && ALL_SCREENS.every((s) => !!currentPermissions[s.id]?.[field]);
  };

  // Save to localStorage and sync to PostgreSQL via Mutation
  const handleSave = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(allRolePermissions));
      updateMutation.mutate(allRolePermissions);
    } catch {
      triggerToast("Failed to save permissions matrix locally.");
    }
  };

  // Reset current role to default
  const handleResetRoleDefaults = () => {
    if (window.confirm(`Reset all screen permissions for '${selectedRole}' to system defaults?`)) {
      setAllRolePermissions((prev) => {
        const nextState = {
          ...prev,
          [selectedRole]: generateDefaultPermissionsForRole(selectedRole),
        };
        try {
          localStorage.setItem(storageKey, JSON.stringify(nextState));
          updateMutation.mutate(nextState);
        } catch {
          // ignore
        }
        return nextState;
      });
      triggerToast(`Permissions for '${selectedRole}' reset to standard defaults.`);
    }
  };

  // Filter screens
  const filteredScreens = useMemo(() => {
    if (!searchQuery.trim()) return ALL_SCREENS;
    const q = searchQuery.toLowerCase();
    return ALL_SCREENS.filter(
      (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* 1. Top Cyan Header Banner matching screenshot */}
      <div
        style={{
          background: "#00BCD4",
          borderRadius: "14px 14px 0 0",
          padding: "12px 24px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0, 188, 212, 0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 700 }}>
          <span>Settings</span>
          <span style={{ fontSize: 13, opacity: 0.9 }}>🏠 User Details</span>
          {isFetchingServer && (
            <span style={{ fontSize: 11, background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 10 }}>
              Syncing...
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={updateMutation.isPending}
          onClick={handleSave}
          style={{
            background: "#ffffff",
            color: "#00838F",
            border: "none",
            borderRadius: 6,
            padding: "7px 22px",
            fontWeight: 800,
            fontSize: 13.5,
            cursor: updateMutation.isPending ? "wait" : "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
            opacity: updateMutation.isPending ? 0.7 : 1,
            transition: "transform 0.1s ease, box-shadow 0.1s ease",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {updateMutation.isPending ? "Saving..." : "Update"}
        </button>
      </div>

      {/* 2. Main White Card Container */}
      <Card style={{ marginTop: -14, borderRadius: "0 0 16px 16px", borderTop: "none", padding: "24px 28px" }}>
        {/* Section A: List of Users / Role Selector */}
        <div style={{ marginBottom: 28 }}>
          <h3
            style={{
              textAlign: "center",
              fontSize: 16,
              fontWeight: 700,
              color: "#334155",
              margin: "0 0 12px",
            }}
          >
            List of Users
          </h3>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 580 }}>
              <select
                data-testid="role-permissions-select"
                aria-label="Select User Role to Configure"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "1.5px solid #CBD5E1",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1E293B",
                  background: "#FFFFFF",
                  outline: "none",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <option value="" disabled>Please Select</option>
                {ROLES_LIST.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section B: Screen Information Header & Search */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Screen Information
            </h4>
            <span style={{ fontSize: 12, color: "#64748B" }}>
              Configuring active permissions for role: <strong style={{ color: "#00838F" }}>{selectedRole}</strong> ({filteredScreens.length} screens)
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="text"
              data-testid="permissions-search-input"
              placeholder="Search screens / Filter screens (e.g. Appointments, Bills, Stock)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #CBD5E1",
                fontSize: 12.5,
                width: 260,
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={handleResetRoleDefaults}
              style={{
                background: "#F1F5F9",
                border: "1px solid #CBD5E1",
                borderRadius: 6,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                color: "#475569",
                cursor: "pointer",
              }}
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {/* Section C: Matrix Table matching exact columns & indigo checkbox style */}
        <div style={{ overflowX: "auto", border: "1px solid #E2E8F0", borderRadius: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1.5px solid #CBD5E1", color: "#1E3A8A" }}>
                {/* Column 1: Main Menu / Sub Menu */}
                <th style={{ textAlign: "left", padding: "12px 18px", fontWeight: 700, fontSize: 11.5, letterSpacing: "0.06em", color: "#1E3A8A", minWidth: 260 }}>
                  MAIN MENU/SUB MENU
                </th>

                {/* Column 2: IS SCREEN ACCESSIBLE */}
                <th style={{ textAlign: "center", padding: "12px 14px", fontWeight: 700, fontSize: 11.5, letterSpacing: "0.06em", color: "#1E3A8A", whiteSpace: "nowrap" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={isColumnAllChecked("isAccessible")}
                      onChange={() => handleToggleColumn("isAccessible")}
                      style={{ width: 15, height: 15, accentColor: "#5C6BC0", cursor: "pointer" }}
                    />
                    <span>IS SCREEN ACCESSIBLE</span>
                  </label>
                </th>

                {/* Column 3: CREATE */}
                <th style={{ textAlign: "center", padding: "12px 14px", fontWeight: 700, fontSize: 11.5, letterSpacing: "0.06em", color: "#1E3A8A", whiteSpace: "nowrap" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={isColumnAllChecked("canCreate")}
                      onChange={() => handleToggleColumn("canCreate")}
                      style={{ width: 15, height: 15, accentColor: "#5C6BC0", cursor: "pointer" }}
                    />
                    <span>CREATE</span>
                  </label>
                </th>

                {/* Column 4: READ */}
                <th style={{ textAlign: "center", padding: "12px 14px", fontWeight: 700, fontSize: 11.5, letterSpacing: "0.06em", color: "#1E3A8A", whiteSpace: "nowrap" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={isColumnAllChecked("canRead")}
                      onChange={() => handleToggleColumn("canRead")}
                      style={{ width: 15, height: 15, accentColor: "#5C6BC0", cursor: "pointer" }}
                    />
                    <span>READ</span>
                  </label>
                </th>

                {/* Column 5: UPDATE */}
                <th style={{ textAlign: "center", padding: "12px 14px", fontWeight: 700, fontSize: 11.5, letterSpacing: "0.06em", color: "#1E3A8A", whiteSpace: "nowrap" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={isColumnAllChecked("canUpdate")}
                      onChange={() => handleToggleColumn("canUpdate")}
                      style={{ width: 15, height: 15, accentColor: "#5C6BC0", cursor: "pointer" }}
                    />
                    <span>UPDATE</span>
                  </label>
                </th>

                {/* Column 6: DELETE */}
                <th style={{ textAlign: "center", padding: "12px 14px", fontWeight: 700, fontSize: 11.5, letterSpacing: "0.06em", color: "#1E3A8A", whiteSpace: "nowrap" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={isColumnAllChecked("canDelete")}
                      onChange={() => handleToggleColumn("canDelete")}
                      style={{ width: 15, height: 15, accentColor: "#5C6BC0", cursor: "pointer" }}
                    />
                    <span>DELETE</span>
                  </label>
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredScreens.map((screen, idx) => {
                const rec = currentPermissions[screen.id] || {
                  isAccessible: false,
                  canCreate: false,
                  canRead: false,
                  canUpdate: false,
                  canDelete: false,
                };

                return (
                  <tr
                    key={screen.id}
                    style={{
                      borderBottom: "1px solid #F1F5F9",
                      background: idx % 2 === 0 ? "#FFFFFF" : "#FBFDFF",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F0F9FF")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "#FFFFFF" : "#FBFDFF")}
                  >
                    {/* Screen Name & Icon */}
                    <td style={{ padding: "11px 18px", color: "#1E293B", fontWeight: 500 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, opacity: 0.85 }}>{screen.icon}</span>
                        <span style={{ fontSize: 13, color: rec.isAccessible ? "#0F172A" : "#64748B" }}>
                          {screen.name}
                        </span>
                      </div>
                    </td>

                    {/* Checkbox: IS SCREEN ACCESSIBLE */}
                    <td style={{ textAlign: "center", padding: "10px 14px" }}>
                      <input
                        type="checkbox"
                        checked={rec.isAccessible}
                        onChange={() => handleToggleCell(screen.id, "isAccessible")}
                        style={{
                          width: 17,
                          height: 17,
                          accentColor: "#5C6BC0",
                          cursor: "pointer",
                        }}
                      />
                    </td>

                    {/* Checkbox: CREATE */}
                    <td style={{ textAlign: "center", padding: "10px 14px" }}>
                      <input
                        type="checkbox"
                        checked={rec.canCreate}
                        disabled={!rec.isAccessible}
                        onChange={() => handleToggleCell(screen.id, "canCreate")}
                        style={{
                          width: 17,
                          height: 17,
                          accentColor: "#5C6BC0",
                          cursor: rec.isAccessible ? "pointer" : "not-allowed",
                          opacity: rec.isAccessible ? 1 : 0.4,
                        }}
                      />
                    </td>

                    {/* Checkbox: READ */}
                    <td style={{ textAlign: "center", padding: "10px 14px" }}>
                      <input
                        type="checkbox"
                        checked={rec.canRead}
                        disabled={!rec.isAccessible}
                        onChange={() => handleToggleCell(screen.id, "canRead")}
                        style={{
                          width: 17,
                          height: 17,
                          accentColor: "#5C6BC0",
                          cursor: rec.isAccessible ? "pointer" : "not-allowed",
                          opacity: rec.isAccessible ? 1 : 0.4,
                        }}
                      />
                    </td>

                    {/* Checkbox: UPDATE */}
                    <td style={{ textAlign: "center", padding: "10px 14px" }}>
                      <input
                        type="checkbox"
                        checked={rec.canUpdate}
                        disabled={!rec.isAccessible}
                        onChange={() => handleToggleCell(screen.id, "canUpdate")}
                        style={{
                          width: 17,
                          height: 17,
                          accentColor: "#5C6BC0",
                          cursor: rec.isAccessible ? "pointer" : "not-allowed",
                          opacity: rec.isAccessible ? 1 : 0.4,
                        }}
                      />
                    </td>

                    {/* Checkbox: DELETE */}
                    <td style={{ textAlign: "center", padding: "10px 14px" }}>
                      <input
                        type="checkbox"
                        checked={rec.canDelete}
                        disabled={!rec.isAccessible}
                        onChange={() => handleToggleCell(screen.id, "canDelete")}
                        style={{
                          width: 17,
                          height: 17,
                          accentColor: "#5C6BC0",
                          cursor: rec.isAccessible ? "pointer" : "not-allowed",
                          opacity: rec.isAccessible ? 1 : 0.4,
                        }}
                      />
                    </td>
                  </tr>
                );
              })}

              {filteredScreens.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "#64748B" }}>
                    No screens found matching "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Update & Summary Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 12, color: "#64748B" }}>
            💡 <strong style={{ color: "#334155" }}>Tip:</strong> Disabling "IS SCREEN ACCESSIBLE" will automatically hide that screen from the user's sidebar.
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Button ghost type="button" onClick={handleResetRoleDefaults}>
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              style={{
                background: "linear-gradient(135deg, #00BCD4 0%, #00838F 100%)",
                color: "#ffffff",
                fontWeight: 700,
                padding: "8px 24px",
                border: "none",
              }}
            >
              Update Permissions ➔
            </Button>
          </div>
        </div>
      </Card>

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}

/**
 * Custom Hook for real-time Role-Based Screen and CRUD permissions.
 * Inspects server-persisted permissions for the active tenant, falling back to local cache or system defaults.
 */
export function useScreenPermissions(screenId?: string) {
  const { token, tenant, role } = useAuth();
  const normalizedRole = normalizeRoleToMatrixKey(role);

  const { data, isLoading } = useQuery({
    queryKey: ["tenant-permissions", tenant],
    queryFn: async () => {
      if (!tenant) return null;
      try {
        return await api.getTenantPermissions(token, tenant);
      } catch {
        return null;
      }
    },
    enabled: !!tenant && !!token,
    staleTime: 10 * 1000,
    refetchOnWindowFocus: true,
  });

  const permissionsMatrix = useMemo(() => {
    // 1. If server data available and has permissions, use it
    if (data?.permissions && Object.keys(data.permissions).length > 0) {
      return data.permissions;
    }
    // 2. Fallback to localStorage cache
    try {
      const cached = localStorage.getItem(`hms-screen-permissions-${tenant || "default"}`);
      if (cached) return JSON.parse(cached);
    } catch {
      // fallback
    }
    // 3. Fallback to code defaults
    return null;
  }, [data, tenant]);

  const activeRolePerms = useMemo(() => {
    if (permissionsMatrix && permissionsMatrix[normalizedRole]) {
      return permissionsMatrix[normalizedRole] as Record<string, PermissionRecord>;
    }
    return generateDefaultPermissionsForRole(normalizedRole);
  }, [permissionsMatrix, normalizedRole]);

  const canAccessScreen = (sId: string): boolean => {
    // Super Administrator and Operator always have full access
    if (normalizedRole === "Super Administrator" || role === "operator") return true;
    // Administrator always has access to admin_user_auth
    if (normalizedRole === "Administrator" && sId === "admin_user_auth") return true;

    const rec = activeRolePerms[sId];
    if (rec !== undefined && rec.isAccessible !== undefined) {
      return !!rec.isAccessible;
    }
    // Fallback to default check
    const screenDef = ALL_SCREENS.find((s) => s.id === sId);
    if (!screenDef) return true;
    return screenDef.defaultAccessible.includes(normalizedRole);
  };

  const canCreate = (sId?: string): boolean => {
    const targetId = sId || screenId;
    if (!targetId) return true;
    if (normalizedRole === "Super Administrator" || role === "operator") return true;
    const rec = activeRolePerms[targetId];
    if (rec && rec.canCreate !== undefined) return !!rec.canCreate;
    const screenDef = ALL_SCREENS.find((s) => s.id === targetId);
    return screenDef ? screenDef.defaultCreate.includes(normalizedRole) : true;
  };

  const canRead = (sId?: string): boolean => {
    const targetId = sId || screenId;
    if (!targetId) return true;
    if (normalizedRole === "Super Administrator" || role === "operator") return true;
    const rec = activeRolePerms[targetId];
    if (rec && rec.canRead !== undefined) return !!rec.canRead;
    const screenDef = ALL_SCREENS.find((s) => s.id === targetId);
    return screenDef ? screenDef.defaultRead.includes(normalizedRole) : true;
  };

  const canUpdate = (sId?: string): boolean => {
    const targetId = sId || screenId;
    if (!targetId) return true;
    if (normalizedRole === "Super Administrator" || role === "operator") return true;
    const rec = activeRolePerms[targetId];
    if (rec && rec.canUpdate !== undefined) return !!rec.canUpdate;
    const screenDef = ALL_SCREENS.find((s) => s.id === targetId);
    return screenDef ? screenDef.defaultUpdate.includes(normalizedRole) : true;
  };

  const canDelete = (sId?: string): boolean => {
    const targetId = sId || screenId;
    if (!targetId) return true;
    if (normalizedRole === "Super Administrator" || role === "operator") return true;
    const rec = activeRolePerms[targetId];
    if (rec && rec.canDelete !== undefined) return !!rec.canDelete;
    const screenDef = ALL_SCREENS.find((s) => s.id === targetId);
    return screenDef ? screenDef.defaultDelete.includes(normalizedRole) : false;
  };

  return {
    canAccessScreen,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAccessible: screenId ? canAccessScreen(screenId) : true,
    userRoleMatrixKey: normalizedRole,
    isLoading,
  };
}

