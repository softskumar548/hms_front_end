import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Input, Select, StatusPill, Toast } from "../../ui/components";
import PharmacyDispenseModal from "./PharmacyDispenseModal";
import PillBottleLabelPrintModal from "./PillBottleLabelPrintModal";

export interface PrescriptionOrder {
  id: string;
  rxNumber: string;
  patientName: string;
  patientUhid: string;
  ageGender: string;
  doctorName: string;
  department: string;
  date: string;
  status: "PENDING" | "DISPENSED";
  items: Array<{
    name: string;
    generic: string;
    dosage: string;
    frequency: string;
    instructionsEn: string;
    instructionsTe: string;
    batch: string;
    exp: string;
    qty: number;
    unitPrice: number;
  }>;
  totalAmount?: number;
  paymentMode?: string;
  receiptNumber?: string;
  dispensedAt?: string;
}

export interface InventoryDrug {
  id: string;
  brandName: string;
  genericName: string;
  category: "Antibiotics" | "Analgesics" | "Antacids" | "Antidiabetic" | "Cardiovascular" | "Respiratory";
  dosageForm: "Tablet" | "Capsule" | "Syrup" | "Injection";
  totalStock: number;
  minStockLevel: number;
  unitPrice: number;
  hsnCode: string;
  batches: Array<{
    batchNumber: string;
    expiryDate: string;
    stock: number;
    status: "GOOD" | "NEAR_EXPIRY" | "EXPIRED";
  }>;
}

const initialPrescriptions: PrescriptionOrder[] = [
  {
    id: "rx-101",
    rxNumber: "RX-2026-981",
    patientName: "Ramesh Babu",
    patientUhid: "UHID-2026-90812",
    ageGender: "48Y / Male",
    doctorName: "Dr. K R Murali",
    department: "General Medicine",
    date: "29-Aug-2026",
    status: "PENDING",
    items: [
      {
        name: "Tab. Augmentin 625mg",
        generic: "Amoxicillin + Clavulanate",
        dosage: "625mg",
        frequency: "1-0-1 (Twice Daily)",
        instructionsEn: "Take after food for 5 days",
        instructionsTe: "ఉదయం, రాత్రి భోజనం తర్వాత 5 రోజులు తీసుకోండి",
        batch: "AUG-26A",
        exp: "10/2026",
        qty: 10,
        unitPrice: 22,
      },
      {
        name: "Tab. Pan-D",
        generic: "Pantoprazole + Domperidone",
        dosage: "40mg/30mg",
        frequency: "1-0-0 (Morning Empty Stomach)",
        instructionsEn: "Take 30 mins before breakfast",
        instructionsTe: "ఉదయం పరిగడుపున టిఫిన్ ముందు వేసుకోండి",
        batch: "PAN-26C",
        exp: "11/2026",
        qty: 10,
        unitPrice: 14,
      },
      {
        name: "Tab. Dolo 650mg",
        generic: "Paracetamol",
        dosage: "650mg",
        frequency: "1-0-1 (SOS Fever/Pain)",
        instructionsEn: "Take when having fever or body pain",
        instructionsTe: "జ్వరం లేదా ఒంటి నొప్పులు ఉన్నప్పుడు మాత్రమే",
        batch: "DOL-27A",
        exp: "04/2027",
        qty: 15,
        unitPrice: 3.5,
      },
    ],
  },
  {
    id: "rx-102",
    rxNumber: "RX-2026-982",
    patientName: "Sita Devi",
    patientUhid: "UHID-2026-90813",
    ageGender: "42Y / Female",
    doctorName: "Dr. Sreenivasulu",
    department: "Cardiology",
    date: "29-Aug-2026",
    status: "PENDING",
    items: [
      {
        name: "Tab. Telma-AM",
        generic: "Telmisartan 40mg + Amlodipine 5mg",
        dosage: "40/5mg",
        frequency: "1-0-0 (Morning After Food)",
        instructionsEn: "Take regularly for BP control",
        instructionsTe: "రక్తపోటు నియంత్రణకు ప్రతిరోజూ ఉదయం వేసుకోండి",
        batch: "TEL-26D",
        exp: "09/2026",
        qty: 30,
        unitPrice: 12,
      },
      {
        name: "Tab. Ecosprin 75mg",
        generic: "Aspirin 75mg",
        dosage: "75mg",
        frequency: "0-0-1 (Night After Dinner)",
        instructionsEn: "Take after dinner with water",
        instructionsTe: "రాత్రి భోజనం తర్వాత నీళ్లతో తీసుకోండి",
        batch: "ECO-27B",
        exp: "06/2027",
        qty: 30,
        unitPrice: 1.8,
      },
    ],
  },
  {
    id: "rx-103",
    rxNumber: "RX-2026-983",
    patientName: "Venkatesh Rao",
    patientUhid: "UHID-2026-90814",
    ageGender: "55Y / Male",
    doctorName: "Dr. V Ramana",
    department: "Orthopedics",
    date: "29-Aug-2026",
    status: "DISPENSED",
    items: [
      {
        name: "Tab. Zerodol-SP",
        generic: "Aceclofenac + Paracetamol + Serratiopeptidase",
        dosage: "100/325/15mg",
        frequency: "1-0-1 (After Food)",
        instructionsEn: "For joint inflammation & pain",
        instructionsTe: "కీళ్ల వాపు మరియు నొప్పుల నివారణకు",
        batch: "ZER-26B",
        exp: "08/2026",
        qty: 10,
        unitPrice: 13.5,
      },
    ],
    totalAmount: 151.2,
    paymentMode: "UPI",
    receiptNumber: "PH-REC-901248",
    dispensedAt: "08:45 AM",
  },
];

const initialDrugInventory: InventoryDrug[] = [
  {
    id: "med-01",
    brandName: "Tab. Augmentin 625mg",
    genericName: "Amoxicillin 500mg + Clavulanic Acid 125mg",
    category: "Antibiotics",
    dosageForm: "Tablet",
    totalStock: 350,
    minStockLevel: 100,
    unitPrice: 22,
    hsnCode: "300410",
    batches: [
      { batchNumber: "AUG-26A", expiryDate: "10/2026", stock: 120, status: "NEAR_EXPIRY" },
      { batchNumber: "AUG-27B", expiryDate: "12/2027", stock: 230, status: "GOOD" },
    ],
  },
  {
    id: "med-02",
    brandName: "Tab. Pan-D",
    genericName: "Pantoprazole 40mg + Domperidone 30mg",
    category: "Antacids",
    dosageForm: "Capsule",
    totalStock: 500,
    minStockLevel: 150,
    unitPrice: 14,
    hsnCode: "300490",
    batches: [
      { batchNumber: "PAN-26C", expiryDate: "11/2026", stock: 200, status: "NEAR_EXPIRY" },
      { batchNumber: "PAN-27A", expiryDate: "05/2027", stock: 300, status: "GOOD" },
    ],
  },
  {
    id: "med-03",
    brandName: "Tab. Dolo 650mg",
    genericName: "Paracetamol 650mg",
    category: "Analgesics",
    dosageForm: "Tablet",
    totalStock: 1200,
    minStockLevel: 300,
    unitPrice: 3.5,
    hsnCode: "300490",
    batches: [
      { batchNumber: "DOL-27A", expiryDate: "04/2027", stock: 1200, status: "GOOD" },
    ],
  },
  {
    id: "med-04",
    brandName: "Tab. Telma-AM",
    genericName: "Telmisartan 40mg + Amlodipine 5mg",
    category: "Cardiovascular",
    dosageForm: "Tablet",
    totalStock: 280,
    minStockLevel: 100,
    unitPrice: 12,
    hsnCode: "300490",
    batches: [
      { batchNumber: "TEL-26D", expiryDate: "09/2026", stock: 80, status: "NEAR_EXPIRY" },
      { batchNumber: "TEL-27C", expiryDate: "08/2027", stock: 200, status: "GOOD" },
    ],
  },
  {
    id: "med-05",
    brandName: "Inj. Ceftriaxone 1g",
    genericName: "Ceftriaxone Sodium 1g Vial",
    category: "Antibiotics",
    dosageForm: "Injection",
    totalStock: 45,
    minStockLevel: 80,
    unitPrice: 65,
    hsnCode: "300420",
    batches: [
      { batchNumber: "CEF-26A", expiryDate: "10/2026", stock: 45, status: "NEAR_EXPIRY" },
    ],
  },
];

export default function HospitalPharmacyScreen() {
  const { tenant } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dispense"; // dispense, inventory, labels, sales

  const [prescriptions, setPrescriptions] = useState<PrescriptionOrder[]>(initialPrescriptions);
  const [inventory, setInventory] = useState<InventoryDrug[]>(initialDrugInventory);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [dispenseModalOpen, setDispenseModalOpen] = useState(false);
  const [selectedRxForDispense, setSelectedRxForDispense] = useState<PrescriptionOrder | null>(null);

  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const [selectedMedForLabel, setSelectedMedForLabel] = useState<any>(null);
  const [selectedPatientForLabel, setSelectedPatientForLabel] = useState<any>(null);

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
  const pendingRxCount = prescriptions.filter((p) => p.status === "PENDING").length;
  const dispensedTodayCount = prescriptions.filter((p) => p.status === "DISPENSED").length;
  const nearExpiryCount = inventory.reduce(
    (acc, drug) => acc + drug.batches.filter((b) => b.status === "NEAR_EXPIRY").length,
    0
  );
  const lowStockCount = inventory.filter((d) => d.totalStock <= d.minStockLevel).length;

  const filteredPrescriptions = prescriptions.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.patientName.toLowerCase().includes(q) ||
      p.patientUhid.toLowerCase().includes(q) ||
      p.rxNumber.toLowerCase().includes(q) ||
      p.doctorName.toLowerCase().includes(q)
    );
  });

  const filteredInventory = inventory.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return d.brandName.toLowerCase().includes(q) || d.genericName.toLowerCase().includes(q);
  });

  // Handle Dispense Success
  const handleDispenseSuccess = (dispensedResult: any) => {
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === dispensedResult.prescriptionId
          ? {
              ...p,
              status: "DISPENSED",
              totalAmount: dispensedResult.totalAmount,
              paymentMode: dispensedResult.paymentMode,
              receiptNumber: dispensedResult.receiptNumber,
              dispensedAt: dispensedResult.dispensedAt,
            }
          : p
      )
    );

    // Auto deduct inventory
    setInventory((prev) =>
      prev.map((drug) => {
        const dispensedItem = dispensedResult.items.find((i: any) => i.name === drug.brandName);
        if (dispensedItem) {
          return {
            ...drug,
            totalStock: Math.max(0, drug.totalStock - dispensedItem.qty),
          };
        }
        return drug;
      })
    );

    setDispenseModalOpen(false);
    triggerToast(`Prescription dispensed. Receipt #${dispensedResult.receiptNumber} generated.`);
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
          <span style={{ fontSize: 18 }}>💊</span>
          <span>Hospital Pharmacy & FEFO Dispensary POS</span>
        </div>
        <div style={{ fontSize: 12, background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20 }}>
          {tenant ? `${tenant.replace("_", " ")} Pharmacy` : "ZEN CLINIC PHARMACY"} · Drug License: AP-VSP-2026-9812 · GSTIN 37AAAAZ9812K1Z5
        </div>
      </div>

      {/* 5 Top Pharmacy KPI Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <Card style={{ borderLeft: "4px solid #00BCD4", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Pending EMR Prescriptions</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>{pendingRxCount}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Awaiting Dispense</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #16A34A", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Dispensed Today</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#16A34A" }}>{dispensedTodayCount}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Patients Served</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid var(--indigo)", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Dispensary Revenue</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>₹68.4k</strong>
            <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>Today's Till</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #F59E0B", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Near-Expiry Batches</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#D97706" }}>{nearExpiryCount}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>&lt; 60 Days Shelf</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #DC2626", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Low Stock Reorders</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#DC2626" }}>{lowStockCount}</strong>
            <span style={{ fontSize: 12, color: "#DC2626", fontWeight: 700 }}>Below Minimum</span>
          </div>
        </Card>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", gap: 10, borderBottom: "2px solid var(--line)", paddingBottom: 6 }}>
        {[
          { key: "dispense", label: "💊 EMR Rx Dispensing Queue", count: pendingRxCount },
          { key: "inventory", label: "📦 FEFO Drug Inventory & Batches", count: inventory.length },
          { key: "sales", label: "🧾 Sales Ledger & GST Invoices", count: dispensedTodayCount },
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
            <span style={{ fontSize: 11, background: activeTab === tab.key ? "rgba(255,255,255,0.25)" : "var(--wash-b)", color: activeTab === tab.key ? "#fff" : "var(--indigo)", padding: "2px 6px", borderRadius: 10 }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: EMR RX DISPENSING QUEUE */}
      {activeTab === "dispense" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                💊 Active Doctor Outpatient & Inpatient Prescriptions
              </h3>
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                Dispense prescribed pharmaceuticals with automated FEFO batch allocation and bilingual Telugu instruction labels
              </span>
            </div>

            <Input
              placeholder="Search by patient name, UHID, Rx number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 280 }}
            />
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            {filteredPrescriptions.map((rx) => (
              <div
                key={rx.id}
                style={{
                  background: rx.status === "PENDING" ? "#fff" : "var(--wash-a)",
                  border: rx.status === "PENDING" ? "1.5px solid var(--indigo)" : "1px solid var(--line)",
                  borderRadius: 14,
                  padding: "16px 20px",
                  boxShadow: rx.status === "PENDING" ? "0 4px 12px rgba(19, 26, 143, 0.08)" : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <strong style={{ fontSize: 16, color: "var(--ink)" }}>{rx.patientName}</strong>
                      <span style={{ fontSize: 12, color: "var(--slate)" }}>({rx.patientUhid} · {rx.ageGender})</span>
                      <span style={{ fontSize: 11, fontFamily: "monospace", background: "var(--indigo-soft)", color: "var(--indigo)", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                        {rx.rxNumber}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--slate)", display: "block", marginTop: 2 }}>
                      Prescribed by <strong>{rx.doctorName}</strong> ({rx.department}) · {rx.date}
                    </span>
                  </div>

                  <div>
                    <StatusPill kind={rx.status === "DISPENSED" ? "success" : "warn"}>
                      {rx.status}
                    </StatusPill>
                  </div>
                </div>

                {/* Prescribed Items Breakdown */}
                <div style={{ background: "var(--wash-a)", padding: 12, borderRadius: 10, border: "1px solid var(--line)", marginBottom: 12 }}>
                  <strong style={{ fontSize: 11.5, color: "var(--indigo)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    Prescribed Medicines ({rx.items.length} Items):
                  </strong>

                  <div style={{ display: "grid", gap: 6 }}>
                    {rx.items.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, borderBottom: idx < rx.items.length - 1 ? "1px dashed var(--line)" : "none", paddingBottom: 4 }}>
                        <div>
                          <strong style={{ color: "var(--ink)" }}>{item.name}</strong>
                          <span style={{ color: "var(--slate)", marginLeft: 6 }}>({item.frequency})</span>
                          <span style={{ fontSize: 11, color: "#047857", display: "block" }}>
                            తెలుగు: {item.instructionsTe}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, background: "#fff", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 4 }}>
                            Qty: <strong>{item.qty}</strong>
                          </span>
                          <Button
                            type="button"
                            ghost
                            onClick={() => {
                              setSelectedMedForLabel({
                                brandName: item.name,
                                dosage: item.dosage,
                                frequency: item.frequency,
                                instructionsEn: item.instructionsEn,
                                instructionsTe: item.instructionsTe,
                                batchNumber: item.batch,
                                expiryDate: item.exp,
                                quantity: item.qty,
                              });
                              setSelectedPatientForLabel({
                                given_name: rx.patientName.split(" ")[0],
                                family_name: rx.patientName.split(" ")[1] || "",
                                national_id: rx.patientUhid,
                              });
                              setLabelModalOpen(true);
                            }}
                            style={{ fontSize: 11, padding: "3px 8px" }}
                          >
                            🏷️ Print Bottle Label
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  {rx.status === "PENDING" ? (
                    <Button
                      type="button"
                      onClick={() => {
                        setSelectedRxForDispense(rx);
                        setDispenseModalOpen(true);
                      }}
                      style={{ background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)", color: "#fff", fontSize: 12.5, padding: "8px 18px" }}
                    >
                      💊 Dispense & Bill Prescription (FEFO)
                    </Button>
                  ) : (
                    <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                      ✓ Dispensed at {rx.dispensedAt} · Receipt #{rx.receiptNumber} (₹{rx.totalAmount})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 2: FEFO DRUG INVENTORY & BATCHES */}
      {activeTab === "inventory" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                📦 FEFO Drug Inventory & Batch Control
              </h3>
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                Track stock across active batches with First-Expired-First-Out automated FIFO/FEFO rules
              </span>
            </div>

            <Input
              placeholder="Search drug inventory by brand or generic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 280 }}
            />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Medication / Generic</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Category & Form</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Total Stock</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>FEFO Active Batches</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>MRP (₹)</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Shelf Life Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((drug) => {
                  const isLow = drug.totalStock <= drug.minStockLevel;
                  const hasNearExpiry = drug.batches.some((b) => b.status === "NEAR_EXPIRY");

                  return (
                    <tr key={drug.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <strong style={{ display: "block", color: "var(--ink)", fontSize: 13.5 }}>{drug.brandName}</strong>
                        <span style={{ fontSize: 11.5, color: "var(--slate)" }}>{drug.genericName}</span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div>{drug.category}</div>
                        <span style={{ fontSize: 11, color: "var(--slate)" }}>{drug.dosageForm} · HSN: {drug.hsnCode}</span>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <strong style={{ fontSize: 14, color: isLow ? "#DC2626" : "var(--ink)" }}>
                          {drug.totalStock}
                        </strong>
                        {isLow && (
                          <span style={{ fontSize: 10.5, color: "#DC2626", display: "block", fontWeight: 700 }}>
                            Low Stock Alert
                          </span>
                        )}
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {drug.batches.map((b) => (
                            <span
                              key={b.batchNumber}
                              style={{
                                fontSize: 11,
                                padding: "2px 6px",
                                borderRadius: 4,
                                background: b.status === "NEAR_EXPIRY" ? "#FEF3C7" : "#DCFCE7",
                                color: b.status === "NEAR_EXPIRY" ? "#B45309" : "#166534",
                                fontWeight: 700,
                              }}
                            >
                              {b.batchNumber} (Exp: {b.expiryDate} · {b.stock} units)
                            </span>
                          ))}
                        </div>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700 }}>
                        ₹{drug.unitPrice.toFixed(2)}
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        {hasNearExpiry ? (
                          <span style={{ background: "#FEF3C7", color: "#B45309", padding: "3px 8px", borderRadius: 6, fontWeight: 800, fontSize: 11 }}>
                            🟡 Near Expiry (&lt;60d)
                          </span>
                        ) : (
                          <span style={{ background: "#DCFCE7", color: "#166534", padding: "3px 8px", borderRadius: 6, fontWeight: 700, fontSize: 11 }}>
                            🟢 Good Shelf Life
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: SALES LEDGER & GST INVOICES */}
      {activeTab === "sales" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                🧾 Pharmacy Sales Ledger & GST Receipts
              </h3>
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                Tax-compliant sales receipts with 12% GST breakdown and UPI settlement records
              </span>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Receipt #</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Patient Details</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Doctor</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Payment Rail</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Total Amount (₹)</th>
                  <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.filter((p) => p.status === "DISPENSED").map((rx) => (
                  <tr key={rx.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <strong style={{ fontFamily: "monospace", color: "var(--indigo)", fontSize: 13 }}>
                        {rx.receiptNumber || "PH-REC-901248"}
                      </strong>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <strong style={{ display: "block", color: "var(--ink)" }}>{rx.patientName}</strong>
                      <span style={{ fontSize: 11.5, color: "var(--slate)" }}>{rx.patientUhid}</span>
                    </td>

                    <td style={{ padding: "12px 14px" }}>
                      <div>{rx.doctorName}</div>
                      <span style={{ fontSize: 11.5, color: "var(--slate)" }}>{rx.department}</span>
                    </td>

                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <span style={{ fontSize: 11, background: "#EFF6FF", color: "#1D4ED8", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                        {rx.paymentMode || "UPI"}
                      </span>
                    </td>

                    <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800, color: "#16A34A" }}>
                      ₹{(rx.totalAmount || 151.2).toFixed(2)}
                    </td>

                    <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--slate)" }}>
                      {rx.dispensedAt || "Today"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Dispense Modal */}
      {dispenseModalOpen && selectedRxForDispense && (
        <PharmacyDispenseModal
          isOpen={dispenseModalOpen}
          onClose={() => setDispenseModalOpen(false)}
          prescription={selectedRxForDispense}
          onSuccess={handleDispenseSuccess}
        />
      )}

      {/* Pill Bottle Label Modal */}
      {labelModalOpen && selectedMedForLabel && (
        <PillBottleLabelPrintModal
          isOpen={labelModalOpen}
          onClose={() => setLabelModalOpen(false)}
          medication={selectedMedForLabel}
          patient={selectedPatientForLabel}
        />
      )}

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
