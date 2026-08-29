import React, { useState } from "react";
import { Modal, Button, Input } from "../../ui/components";
import { useAuth } from "../../auth/AuthProvider";

interface TillReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (reconciliation: any) => void;
}

interface DenominationRow {
  denom: number;
  count: number;
  isCoin?: boolean;
}

const initialDenominations: DenominationRow[] = [
  { denom: 500, count: 68 },
  { denom: 200, count: 35 },
  { denom: 100, count: 42 },
  { denom: 50, count: 20 },
  { denom: 20, count: 15 },
  { denom: 10, count: 25 },
  { denom: 5, count: 20, isCoin: true },
  { denom: 2, count: 25, isCoin: true },
  { denom: 1, count: 50, isCoin: true },
];

export default function TillReconciliationModal({
  isOpen,
  onClose,
  onSuccess,
}: TillReconciliationModalProps) {
  const { tenant } = useAuth();

  const [denominations, setDenominations] = useState<DenominationRow[]>(initialDenominations);
  const [openingFloat, setOpeningFloat] = useState("5000");
  const [systemCashCollections] = useState(41850);
  const [systemCashRefunds] = useState(350);
  const [cashierName, setCashierName] = useState("Venkata Rao (Cashier 1)");
  const [supervisorName, setSupervisorName] = useState("Dr. K R Murali (Dean)");
  const [shiftName, setShiftName] = useState("Morning OPD Shift (08:00 AM - 02:00 PM)");
  const [notes, setNotes] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Compute Total Physical Cash Counted
  const totalPhysicalCash = denominations.reduce((acc, row) => acc + row.denom * (row.count || 0), 0);

  // Compute Expected System Till Balance
  const openingFloatNum = parseFloat(openingFloat) || 0;
  const expectedTillBalance = openingFloatNum + systemCashCollections - systemCashRefunds;

  // Compute Variance
  const variance = totalPhysicalCash - expectedTillBalance;

  const handleCountChange = (denom: number, val: string) => {
    const parsed = parseInt(val, 10);
    const count = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    setDenominations((prev) =>
      prev.map((d) => (d.denom === denom ? { ...d, count } : d))
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCloseShift = () => {
    setIsLocked(true);
    if (onSuccess) {
      onSuccess({
        totalPhysicalCash,
        expectedTillBalance,
        variance,
        closingTime: new Date().toISOString(),
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Daily Cashier Till Drawer Reconciliation (BIL-004)">
      <div style={{ display: "grid", gap: 18, maxWidth: 680, minWidth: 540, fontFamily: "var(--font-body)", color: "var(--ink)" }}>
        
        {/* Top Shift Details Header */}
        <div style={{ background: "var(--wash-a)", padding: 14, borderRadius: 12, border: "1px solid var(--line)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Hospital Facility</span>
            <div style={{ fontWeight: 800, color: "var(--indigo)", fontSize: 13.5 }}>
              {tenant ? `${tenant.replace("_", " ")} HOSPITAL` : "ZEN CLINIC"}
            </div>
            <span style={{ fontSize: 11, color: "var(--slate)" }}>Terminal Till ID: POS-COUNTER-01</span>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Reconciliation Date</span>
            <div style={{ fontWeight: 800, fontSize: 13.5 }}>
              {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
            <span style={{ fontSize: 11, color: "var(--slate)" }}>
              Shift: {shiftName.split("(")[0]}
            </span>
          </div>
        </div>

        {/* 3 KPI Summary Cards for Till Balance */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          <div style={{ background: "#EEF2FF", border: "1px solid var(--indigo)", padding: 12, borderRadius: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--indigo)", textTransform: "uppercase" }}>
              Expected Balance
            </span>
            <strong style={{ fontSize: 18, color: "var(--indigo)", display: "block", marginTop: 2 }}>
              ₹{expectedTillBalance.toLocaleString("en-IN")}
            </strong>
            <span style={{ fontSize: 10.5, color: "var(--slate)" }}>
              Float + Colls - Refunds
            </span>
          </div>

          <div style={{ background: "#F0FDF4", border: "1px solid #16A34A", padding: 12, borderRadius: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>
              Physical Counted
            </span>
            <strong style={{ fontSize: 18, color: "#16A34A", display: "block", marginTop: 2 }}>
              ₹{totalPhysicalCash.toLocaleString("en-IN")}
            </strong>
            <span style={{ fontSize: 10.5, color: "var(--slate)" }}>
              Drawer Currency Total
            </span>
          </div>

          <div
            style={{
              background: variance === 0 ? "#F0FDF4" : variance > 0 ? "#FFFBEB" : "#FEF2F2",
              border: `1px solid ${variance === 0 ? "#16A34A" : variance > 0 ? "#D97706" : "#DC2626"}`,
              padding: 12,
              borderRadius: 10,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: variance === 0 ? "#166534" : variance > 0 ? "#B45309" : "#991B1B",
                textTransform: "uppercase",
              }}
            >
              Till Variance
            </span>
            <strong
              style={{
                fontSize: 18,
                color: variance === 0 ? "#16A34A" : variance > 0 ? "#D97706" : "#DC2626",
                display: "block",
                marginTop: 2,
              }}
            >
              {variance === 0 ? "₹0 (Balanced)" : `${variance > 0 ? "+₹" : "-₹"}${Math.abs(variance).toLocaleString("en-IN")}`}
            </strong>
            <span style={{ fontSize: 10.5, color: "var(--slate)" }}>
              {variance === 0 ? "🟢 Exact Match" : variance > 0 ? "🟡 Cash Surplus" : "🔴 Cash Shortage"}
            </span>
          </div>
        </div>

        {/* Currency Denomination Counter Table */}
        <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ background: "var(--wash-b)", padding: "8px 14px", fontWeight: 700, fontSize: 12.5, color: "var(--indigo)" }}>
            💵 PHYSICAL CURRENCY DENOMINATION BREAKDOWN
          </div>

          <div style={{ maxHeight: 250, overflowY: "auto", padding: "6px 12px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Denomination</th>
                  <th style={{ textAlign: "center", padding: "6px 8px", width: 140 }}>Physical Note / Coin Count</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", width: 120 }}>Subtotal (₹)</th>
                </tr>
              </thead>
              <tbody>
                {denominations.map((row) => {
                  const subtotal = row.denom * (row.count || 0);
                  return (
                    <tr key={row.denom} style={{ borderBottom: "1px solid var(--wash-a)" }}>
                      <td style={{ padding: "6px 8px", fontWeight: 700 }}>
                        <span style={{ display: "inline-block", width: 65 }}>
                          ₹{row.denom}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--slate)", fontWeight: 400 }}>
                          {row.isCoin ? "Coin" : "Note"}
                        </span>
                      </td>
                      <td style={{ padding: "6px 8px", textAlign: "center" }}>
                        <input
                          type="number"
                          min="0"
                          disabled={isLocked}
                          value={row.count}
                          onChange={(e) => handleCountChange(row.denom, e.target.value)}
                          style={{
                            width: 85,
                            textAlign: "center",
                            padding: "4px 8px",
                            borderRadius: 6,
                            border: "1px solid var(--line)",
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        />
                      </td>
                      <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: "var(--indigo)" }}>
                        ₹{subtotal.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shift Cash Flow Parameters */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
              Opening Float (₹)
            </label>
            <Input
              type="number"
              disabled={isLocked}
              value={openingFloat}
              onChange={(e) => setOpeningFloat(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
              Cash Collections (₹)
            </label>
            <Input type="text" disabled value={`₹${systemCashCollections.toLocaleString("en-IN")}`} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
              Cash Refunds (₹)
            </label>
            <Input type="text" disabled value={`₹${systemCashRefunds.toLocaleString("en-IN")}`} />
          </div>
        </div>

        {/* Cashier & Supervisor Signatory */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
              Duty Cashier Name
            </label>
            <Input
              disabled={isLocked}
              value={cashierName}
              onChange={(e) => setCashierName(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
              Verifying Supervisor
            </label>
            <Input
              disabled={isLocked}
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
            />
          </div>
        </div>

        {/* Variance Notes if any */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
            Reconciliation & Variance Notes
          </label>
          <textarea
            disabled={isLocked}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document any till shortages, excess, unbilled emergency floats, or handover comments..."
            rows={2}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "var(--r-field)",
              border: "1px solid var(--line)",
              fontSize: 12.5,
              fontFamily: "var(--font-body)",
            }}
          />
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: 14 }}>
          <div>
            {isLocked && (
              <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>
                🔒 Shift Finalized & Till Locked at {new Date().toLocaleTimeString("en-IN", { timeStyle: "short" })}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Button ghost onClick={onClose}>Close</Button>
            <Button
              type="button"
              onClick={handlePrint}
              style={{ background: "#EEF2FF", border: "1px solid var(--indigo)", color: "var(--indigo)" }}
            >
              🖨️ Print Sheet
            </Button>
            {!isLocked && (
              <Button
                type="button"
                onClick={handleCloseShift}
                style={{ background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)", color: "#fff" }}
              >
                🔒 Close & Finalize Shift Till
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
