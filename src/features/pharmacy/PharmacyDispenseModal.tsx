import React, { useState } from "react";
import { Modal, Button, Select } from "../../ui/components";

interface PharmacyDispenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: any;
  onSuccess: (dispensedResult: any) => void;
}

export default function PharmacyDispenseModal({
  isOpen,
  onClose,
  prescription,
  onSuccess,
}: PharmacyDispenseModalProps) {
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI" | "AAROGYASRI" | "CREDIT">("UPI");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !prescription) return null;

  const items = prescription.items || [
    { name: "Tab. Augmentin 625mg", generic: "Amoxicillin + Clavulanic Acid", batch: "AUG-26A", exp: "10/2026", qty: 10, unitPrice: 22, gst: 12 },
    { name: "Tab. Pan-D", generic: "Pantoprazole + Domperidone", batch: "PAN-26C", exp: "11/2026", qty: 10, unitPrice: 14, gst: 12 },
    { name: "Tab. Dolo 650mg", generic: "Paracetamol 650mg", batch: "DOL-27A", exp: "04/2027", qty: 15, unitPrice: 3.5, gst: 12 },
  ];

  const subtotal = items.reduce((acc: number, item: any) => acc + item.qty * item.unitPrice, 0);
  const gstAmount = Math.round(subtotal * 0.12);
  const totalAmount = paymentMode === "AAROGYASRI" ? 0 : subtotal + gstAmount;

  const handleDispense = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess({
        prescriptionId: prescription.id,
        patientName: prescription.patientName,
        patientUhid: prescription.patientUhid,
        doctorName: prescription.doctorName,
        items,
        subtotal,
        gstAmount,
        totalAmount,
        paymentMode,
        dispensedAt: new Date().toLocaleTimeString("en-IN", { timeStyle: "short" }),
        receiptNumber: `PH-REC-${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }, 600);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dispense & Bill EMR Prescription (DISP-001)">
      <div style={{ display: "grid", gap: 14, maxWidth: 640, minWidth: 500, fontFamily: "var(--font-body)", color: "var(--ink)" }}>
        
        {/* Prescription Header */}
        <div style={{ background: "var(--wash-a)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
          <strong style={{ fontSize: 14, color: "var(--indigo)", display: "block" }}>
            {prescription.patientName} ({prescription.patientUhid})
          </strong>
          <span style={{ fontSize: 12, color: "var(--slate)" }}>
            Prescribed by: {prescription.doctorName || "Dr. K R Murali"} · Date: {prescription.date || "Today"}
          </span>
        </div>

        {/* FEFO Batch Allocation Table */}
        <div style={{ border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ background: "var(--wash-b)", padding: "8px 12px", fontWeight: 800, fontSize: 12, color: "var(--indigo)", display: "grid", gridTemplateColumns: "2fr 1fr 50px 80px", gap: 8 }}>
            <span>Medication / Generic</span>
            <span>FEFO Batch & Expiry</span>
            <span style={{ textAlign: "center" }}>Qty</span>
            <span style={{ textAlign: "right" }}>Amount (₹)</span>
          </div>

          <div style={{ padding: "8px 12px", display: "grid", gap: 8 }}>
            {items.map((item: any, idx: number) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 50px 80px", gap: 8, alignItems: "center", borderBottom: idx < items.length - 1 ? "1px solid var(--line)" : "none", paddingBottom: 6 }}>
                <div>
                  <strong style={{ fontSize: 12.5, display: "block" }}>{item.name}</strong>
                  <span style={{ fontSize: 10.5, color: "var(--slate)" }}>{item.generic}</span>
                </div>

                <div>
                  <span style={{ fontSize: 11, background: "#DCFCE7", color: "#166534", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                    {item.batch}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--slate)", display: "block", marginTop: 2 }}>
                    Exp: {item.exp}
                  </span>
                </div>

                <div style={{ textAlign: "center", fontWeight: 700, fontSize: 12.5 }}>
                  {item.qty}
                </div>

                <div style={{ textAlign: "right", fontWeight: 700, fontSize: 12.5 }}>
                  ₹{(item.qty * item.unitPrice).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settlement & Bill Calculation */}
        <div style={{ background: "#F8FAFC", border: "1px solid var(--line)", padding: 12, borderRadius: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: "var(--slate)" }}>Medicine Subtotal:</span>
            <strong>₹{subtotal.toFixed(2)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
            <span style={{ color: "var(--slate)" }}>GST (12% CGST+SGST):</span>
            <strong>₹{gstAmount.toFixed(2)}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, borderTop: "2px solid var(--line)", paddingTop: 6, color: "var(--indigo)" }}>
            <strong>Net Payable Total:</strong>
            <strong style={{ fontSize: 18 }}>₹{totalAmount.toFixed(2)}</strong>
          </div>
        </div>

        {/* Payment Mode Selector */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12, alignItems: "center" }}>
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
              Payment Collection Rail:
            </label>
            <Select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as any)}
            >
              <option value="UPI">📱 Instant UPI QR Code</option>
              <option value="CASH">💵 Cash at Pharmacy Till</option>
              <option value="AAROGYASRI">🏛️ Dr. YSR Aarogyasri (100% Cashless)</option>
              <option value="CREDIT">🏥 Inpatient Hospital Credit</option>
            </Select>
          </div>

          <div style={{ textAlign: "right" }}>
            {paymentMode === "AAROGYASRI" && (
              <span style={{ fontSize: 11, background: "#DCFCE7", color: "#166534", padding: "4px 8px", borderRadius: 6, fontWeight: 800 }}>
                100% Government Cashless
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
          <Button ghost type="button" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleDispense}
            disabled={isProcessing}
            style={{ background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)", color: "#fff" }}
          >
            {isProcessing ? "Processing..." : "✓ Confirm Dispense & Settle Bill"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
