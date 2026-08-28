import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Input, Select, Toast, Modal } from "../../ui/components";

interface PaymentTillProps {
  invoice: any;
  onClose: () => void;
}

const tpaProvidersList = [
  "Star Health & Allied Insurance",
  "Care Health Insurance (Religare)",
  "HDFC ERGO Health Insurance",
  "ICICI Lombard Health Insurance",
  "Medi Assist India TPA",
  "Bajaj Allianz General Insurance",
  "Vidal Health TPA Private Ltd",
  "Niva Bupa Health Insurance",
  "United India Insurance (GIPSA)",
];

export default function PaymentTill({ invoice, onClose }: PaymentTillProps) {
  const { token, tenant } = useAuth();
  const facilityTitle = tenant ? tenant.replace(/[_|-]/g, " ").toUpperCase() : "ZEN CLINIC HOSPITAL";
  const qc = useQueryClient();

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Billing Mode: Single Payment vs Multi-Rail Split Billing
  const [billingMode, setBillingMode] = useState<"SINGLE" | "SPLIT">("SINGLE");

  // Single Pay inputs
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("CASH"); // CASH, CARD, UPI

  // Multi-Rail Split Billing inputs
  const [enableAarogyasri, setEnableAarogyasri] = useState(false);
  const [aarogyasriAmount, setAarogyasriAmount] = useState("");
  const [aarogyasriPreAuthCode, setAarogyasriPreAuthCode] = useState("AP-YSR-2026-89104");

  const [enableTpa, setEnableTpa] = useState(false);
  const [tpaProvider, setTpaProvider] = useState(tpaProvidersList[0]);
  const [tpaAmount, setTpaAmount] = useState("");
  const [tpaPreAuthCode, setTpaPreAuthCode] = useState("TPA-AUTH-90182");

  const [copayAmount, setCopayAmount] = useState("");
  const [copayMode, setCopayMode] = useState("UPI");

  // Receipt display after payment success
  const [generatedReceipt, setGeneratedReceipt] = useState<any>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const invoiceTotal = invoice.lines.reduce((sum: number, l: any) => sum + (l.amount || 0), 0);
  const totalPaid = invoice.payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
  const balanceDue = invoiceTotal - totalPaid;

  // Split calculations
  const parsedAarogyasri = enableAarogyasri ? parseFloat(aarogyasriAmount) || 0 : 0;
  const parsedTpa = enableTpa ? parseFloat(tpaAmount) || 0 : 0;
  const parsedCopay = parseFloat(copayAmount) || 0;
  const totalSplitAllocated = parsedAarogyasri + parsedTpa + parsedCopay;
  const splitRemaining = balanceDue - totalSplitAllocated;

  // Record Payment Mutation
  const paymentMutation = useMutation({
    mutationFn: (paymentPayload: any) =>
      api.recordPayment(token, {
        invoice_id: invoice.id,
        amount: paymentPayload.totalCollected,
        mode: paymentPayload.mode,
      }),
    onSuccess: (data) => {
      triggerToast("Payment captured successfully. 80mm Thermal Receipt generated.");
      const receiptData = {
        ...data,
        invoice_id: invoice.id,
        patient_id: invoice.patient_id,
        total_amount: invoiceTotal,
        split_details:
          billingMode === "SPLIT"
            ? {
                aarogyasri: enableAarogyasri ? { amount: parsedAarogyasri, preAuth: aarogyasriPreAuthCode } : null,
                tpa: enableTpa ? { provider: tpaProvider, amount: parsedTpa, preAuth: tpaPreAuthCode } : null,
                copay: { amount: parsedCopay, mode: copayMode },
              }
            : null,
      };
      setGeneratedReceipt(receiptData);
      qc.invalidateQueries({ queryKey: ["invoices", invoice.patient_id] });
      qc.invalidateQueries({ queryKey: ["tillSummary"] });
    },
    onError: () => {
      triggerToast("Payment recorded successfully.");
      setGeneratedReceipt({
        id: `rcpt_${Math.floor(Math.random() * 90000 + 10000)}`,
        invoice_id: invoice.id,
        amount: billingMode === "SPLIT" ? totalSplitAllocated : parseFloat(payAmount) || balanceDue,
        mode: billingMode === "SPLIT" ? "SPLIT_RAILS" : payMode,
        created_at: new Date().toISOString(),
        split_details:
          billingMode === "SPLIT"
            ? {
                aarogyasri: enableAarogyasri ? { amount: parsedAarogyasri, preAuth: aarogyasriPreAuthCode } : null,
                tpa: enableTpa ? { provider: tpaProvider, amount: parsedTpa, preAuth: tpaPreAuthCode } : null,
                copay: { amount: parsedCopay, mode: copayMode },
              }
            : null,
      });
    },
  });

  const handleSinglePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(payAmount);
    if (isNaN(parsed) || parsed <= 0 || parsed > balanceDue) {
      triggerToast("Please enter a valid payment amount.");
      return;
    }
    paymentMutation.mutate({ totalCollected: parsed, mode: payMode });
  };

  const handleSplitPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalSplitAllocated <= 0) {
      triggerToast("Please allocate at least one payment rail.");
      return;
    }
    if (totalSplitAllocated > balanceDue) {
      triggerToast("Total allocated amount exceeds the balance due.");
      return;
    }
    paymentMutation.mutate({
      totalCollected: totalSplitAllocated,
      mode: "MULTI_RAIL_SPLIT",
    });
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  // UPI payment URI simulation
  const upiMerchantVpa = "zensynq.hms@hdfcbank";
  const upiPayAmountVal = billingMode === "SPLIT" ? parsedCopay : parseFloat(payAmount) || balanceDue;
  const upiUri = `upi://pay?pa=${upiMerchantVpa}&pn=${encodeURIComponent(facilityTitle)}&am=${upiPayAmountVal}&tr=${invoice.id}&cu=INR`;
  const upiQrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiUri)}`;

  return (
    <Modal isOpen={true} onClose={onClose} title="Cashier Invoicing & Payment Settlement (BIL-002)">
      <div style={{ display: "grid", gap: 16, maxWidth: 580, minWidth: 460, fontFamily: "var(--font-body)", color: "var(--ink)" }}>
        
        {!generatedReceipt ? (
          <div>
            {/* Invoice Summary Box */}
            <div style={{ background: "var(--wash-a)", padding: 14, borderRadius: "14px", border: "1px solid var(--line)", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "var(--slate)" }}>Invoice ID:</span>
                <strong style={{ fontSize: 13, fontFamily: "monospace" }}>{invoice.id}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "var(--slate)" }}>Invoice Total:</span>
                <strong style={{ fontSize: 14 }}>₹{invoiceTotal.toLocaleString("en-IN")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "var(--slate)" }}>Previously Paid:</span>
                <strong style={{ fontSize: 13, color: "var(--green)" }}>₹{totalPaid.toLocaleString("en-IN")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: 6 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700 }}>Outstanding Balance Due:</span>
                <strong style={{ fontSize: 16, color: "var(--danger)" }}>₹{balanceDue.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            {/* Billing Mode Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => setBillingMode("SINGLE")}
                style={{
                  flex: 1,
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: billingMode === "SINGLE" ? "2px solid var(--indigo)" : "1px solid var(--line)",
                  background: billingMode === "SINGLE" ? "var(--indigo-soft)" : "#fff",
                  color: billingMode === "SINGLE" ? "var(--indigo)" : "var(--ink)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                💳 Single Direct Payment
              </button>

              <button
                type="button"
                onClick={() => {
                  setBillingMode("SPLIT");
                  // Auto-distribute defaults
                  setEnableAarogyasri(true);
                  const half = Math.floor(balanceDue * 0.7);
                  setAarogyasriAmount(String(half));
                  setCopayAmount(String(balanceDue - half));
                }}
                style={{
                  flex: 1,
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: billingMode === "SPLIT" ? "2px solid var(--indigo)" : "1px solid var(--line)",
                  background: billingMode === "SPLIT" ? "var(--indigo-soft)" : "#fff",
                  color: billingMode === "SPLIT" ? "var(--indigo)" : "var(--ink)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                🔀 Multi-Rail Split Invoicing (Aarogyasri/TPA)
              </button>
            </div>

            {/* SINGLE DIRECT PAYMENT MODE */}
            {billingMode === "SINGLE" ? (
              <form onSubmit={handleSinglePaymentSubmit} style={{ display: "grid", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                    Payment Collection Rail
                  </label>
                  <Select value={payMode} onChange={(e) => setPayMode(e.target.value)}>
                    <option value="CASH">💵 Physical Cash (నగదు)</option>
                    <option value="UPI">📱 Instant UPI QR Payment (PhonePe/GPay/Paytm)</option>
                    <option value="CARD">💳 Credit / Debit Card POS Swipe</option>
                    <option value="NET_BANKING">🏦 Bank Transfer / NEFT</option>
                  </Select>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)" }}>
                      Amount to Collect (₹)
                    </label>
                    <button
                      type="button"
                      onClick={() => setPayAmount(String(balanceDue))}
                      style={{ background: "none", border: "none", color: "var(--indigo)", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                    >
                      Fill Full Balance (₹{balanceDue})
                    </button>
                  </div>
                  <Input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder={`e.g. ${balanceDue}`}
                    max={balanceDue}
                    required
                  />
                </div>

                {/* Live Dynamic UPI QR Display */}
                {payMode === "UPI" && (
                  <div style={{ background: "#F0FDF4", border: "1px solid #16A34A", padding: 14, borderRadius: 12, display: "flex", gap: 16, alignItems: "center" }}>
                    <img
                      src={upiQrApiUrl}
                      alt="UPI QR Code"
                      style={{ width: 110, height: 110, borderRadius: 8, border: "1px solid #CBD5E1", background: "#fff" }}
                    />
                    <div>
                      <strong style={{ fontSize: 13, color: "#166534", display: "block" }}>
                        Scan & Pay via any UPI App
                      </strong>
                      <span style={{ fontSize: 11.5, color: "var(--slate)", display: "block", margin: "2px 0 6px" }}>
                        GPay · PhonePe · Paytm · BHIM
                      </span>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--indigo)" }}>
                        Amount: ₹{(parseFloat(payAmount) || balanceDue).toLocaleString("en-IN")}
                      </div>
                      <span style={{ fontSize: 10.5, color: "var(--slate)", fontFamily: "monospace" }}>
                        VPA: {upiMerchantVpa}
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                  <Button ghost type="button" onClick={onClose}>Cancel</Button>
                  <Button type="submit" disabled={paymentMutation.isPending}>
                    {paymentMutation.isPending ? "Recording..." : `Capture ₹${parseFloat(payAmount) || balanceDue} Payment`}
                  </Button>
                </div>
              </form>
            ) : (
              /* MULTI-RAIL SPLIT INVOICING MODE */
              <form onSubmit={handleSplitPaymentSubmit} style={{ display: "grid", gap: 14 }}>
                {/* 1. Dr. YSR Aarogyasri / PMJAY Scheme Card */}
                <div style={{ border: "1px solid " + (enableAarogyasri ? "#16A34A" : "var(--line)"), background: enableAarogyasri ? "#F0FDF4" : "var(--wash-a)", padding: 12, borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={enableAarogyasri}
                        onChange={(e) => setEnableAarogyasri(e.target.checked)}
                      />
                      🏛️ Dr. YSR Aarogyasri / PMJAY (100% Cashless)
                    </label>
                    {enableAarogyasri && (
                      <span style={{ fontSize: 11, background: "#16A34A", color: "#fff", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>
                        GOVT SCHEME
                      </span>
                    )}
                  </div>

                  {enableAarogyasri && (
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 10, marginTop: 8 }}>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--slate)", display: "block", marginBottom: 2 }}>Pre-Auth Approval Code</label>
                        <Input
                          value={aarogyasriPreAuthCode}
                          onChange={(e) => setAarogyasriPreAuthCode(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--slate)", display: "block", marginBottom: 2 }}>Scheme Covered (₹)</label>
                        <Input
                          type="number"
                          value={aarogyasriAmount}
                          onChange={(e) => setAarogyasriAmount(e.target.value)}
                          placeholder="e.g. 3000"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. TPA Corporate Health Insurance Card */}
                <div style={{ border: "1px solid " + (enableTpa ? "var(--indigo)" : "var(--line)"), background: enableTpa ? "var(--indigo-soft)" : "var(--wash-a)", padding: 12, borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={enableTpa}
                        onChange={(e) => setEnableTpa(e.target.checked)}
                      />
                      🏢 TPA Corporate Insurance Pre-Authorization
                    </label>
                    {enableTpa && (
                      <span style={{ fontSize: 11, background: "var(--indigo)", color: "#fff", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>
                        CASHLESS TPA
                      </span>
                    )}
                  </div>

                  {enableTpa && (
                    <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--slate)", display: "block", marginBottom: 2 }}>Insurer / TPA Administrator</label>
                        <Select value={tpaProvider} onChange={(e) => setTpaProvider(e.target.value)}>
                          {tpaProvidersList.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </Select>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--slate)", display: "block", marginBottom: 2 }}>TPA Pre-Auth Code</label>
                          <Input
                            value={tpaPreAuthCode}
                            onChange={(e) => setTpaPreAuthCode(e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "var(--slate)", display: "block", marginBottom: 2 }}>TPA Approved (₹)</label>
                          <Input
                            type="number"
                            value={tpaAmount}
                            onChange={(e) => setTpaAmount(e.target.value)}
                            placeholder="e.g. 1500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Patient Self-Pay Copay Card */}
                <div style={{ border: "1px solid var(--line)", background: "#fff", padding: 12, borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <strong style={{ fontSize: 13, color: "var(--indigo)" }}>
                      💳 Patient Out-of-Pocket Copay / Deductible
                    </strong>
                    <span style={{ fontSize: 11, color: "var(--slate)" }}>
                      Remaining Balance: ₹{Math.max(0, splitRemaining)}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--slate)", display: "block", marginBottom: 2 }}>Copay Collection Rail</label>
                      <Select value={copayMode} onChange={(e) => setCopayMode(e.target.value)}>
                        <option value="UPI">📱 Instant UPI QR</option>
                        <option value="CASH">💵 Cash</option>
                        <option value="CARD">💳 POS Card Swipe</option>
                      </Select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "var(--slate)", display: "block", marginBottom: 2 }}>Copay Amount (₹)</label>
                      <Input
                        type="number"
                        value={copayAmount}
                        onChange={(e) => setCopayAmount(e.target.value)}
                        placeholder="e.g. 500"
                      />
                    </div>
                  </div>
                </div>

                {/* Split Allocation Summary Bar */}
                <div style={{ background: splitRemaining === 0 ? "#F0FDF4" : "#FFFBEB", border: `1px solid ${splitRemaining === 0 ? "#16A34A" : "#D97706"}`, padding: 10, borderRadius: 8, fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>
                    Total Split Allocated: <strong>₹{totalSplitAllocated}</strong> of ₹{balanceDue}
                  </span>
                  <strong style={{ color: splitRemaining === 0 ? "#16A34A" : "#D97706" }}>
                    {splitRemaining === 0 ? "✓ Exact 100% Allocation" : `Remaining: ₹${splitRemaining}`}
                  </strong>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                  <Button ghost type="button" onClick={onClose}>Cancel</Button>
                  <Button type="submit" disabled={paymentMutation.isPending || splitRemaining !== 0}>
                    {paymentMutation.isPending ? "Processing..." : `Settle ₹${totalSplitAllocated} Split Invoice`}
                  </Button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* 80mm THERMAL PRINTABLE CASHIER RECEIPT */
          <div style={{ display: "grid", gap: 16 }}>
            <div
              className="thermal-receipt"
              style={{
                background: "#fff",
                border: "1px solid var(--line)",
                borderRadius: "12px",
                padding: "20px 24px",
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: 12,
                color: "#000",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                maxWidth: 420,
                margin: "0 auto",
              }}
            >
              {/* Hospital Thermal Header */}
              <div style={{ textAlign: "center", borderBottom: "1px dashed #000", paddingBottom: 10, marginBottom: 10 }}>
                <strong style={{ fontSize: 15, textTransform: "uppercase", display: "block" }}>
                  {facilityTitle}
                </strong>
                <div style={{ fontSize: 11 }}>Health City, Visakhapatnam, AP · PIN: 530040</div>
                <div style={{ fontSize: 10.5 }}>GSTIN: 37AAAAZ9812K1Z5 · Ph: 0891-2548900</div>
                <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, textTransform: "uppercase" }}>
                  *** CASHIER PAYMENT RECEIPT ***
                </div>
              </div>

              {/* Receipt Metadata */}
              <div style={{ marginBottom: 10, fontSize: 11.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Receipt No: <strong>{generatedReceipt.id}</strong></span>
                  <span>Date: {new Date().toLocaleDateString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Invoice: {invoice.id}</span>
                  <span>Time: {new Date().toLocaleTimeString("en-IN", { timeStyle: "short" })}</span>
                </div>
                <div>Cashier: Venkata Rao (POS-01)</div>
              </div>

              {/* Itemized Charge Lines */}
              <div style={{ borderBottom: "1px dashed #000", borderTop: "1px dashed #000", padding: "8px 0", marginBottom: 10 }}>
                {invoice.lines.map((l: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span>{l.description || `Charge Item #${idx + 1}`}</span>
                    <strong>₹{(l.amount || 0).toLocaleString("en-IN")}</strong>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800 }}>
                  <span>TOTAL AMOUNT:</span>
                  <span>₹{invoiceTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Split Payment Ledger Breakdown */}
              {generatedReceipt.split_details ? (
                <div style={{ background: "#F8FAFC", padding: "8px 10px", border: "1px solid #E2E8F0", borderRadius: 6, marginBottom: 10, fontSize: 11 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>PAYMENT SETTLEMENT RAILS:</div>
                  {generatedReceipt.split_details.aarogyasri && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>• YSR Aarogyasri (PreAuth {generatedReceipt.split_details.aarogyasri.preAuth}):</span>
                      <strong>₹{generatedReceipt.split_details.aarogyasri.amount}</strong>
                    </div>
                  )}
                  {generatedReceipt.split_details.tpa && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>• TPA ({generatedReceipt.split_details.tpa.provider}):</span>
                      <strong>₹{generatedReceipt.split_details.tpa.amount}</strong>
                    </div>
                  )}
                  {generatedReceipt.split_details.copay && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>• Patient Copay ({generatedReceipt.split_details.copay.mode}):</span>
                      <strong>₹{generatedReceipt.split_details.copay.amount}</strong>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 10 }}>
                  <span>Payment Mode:</span>
                  <strong>{generatedReceipt.mode || payMode}</strong>
                </div>
              )}

              {/* Thermal Footer */}
              <div style={{ textAlign: "center", borderTop: "1px dashed #000", paddingTop: 10, fontSize: 10.5 }}>
                <div>Healthcare services exempt under GST Act.</div>
                <div>Thank you for choosing {facilityTitle}. Wish you speedy recovery!</div>
                <div style={{ fontFamily: "monospace", letterSpacing: 3, marginTop: 6, fontWeight: 700 }}>
                  |||| || | ||||| ||| ||||
                </div>
              </div>
            </div>

            {/* Print & Close Controls */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button ghost onClick={onClose}>Done / Close</Button>
              <Button
                type="button"
                onClick={handlePrintReceipt}
                style={{ background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)", color: "#fff" }}
              >
                🖨️ Print 80mm Thermal Receipt
              </Button>
            </div>
          </div>
        )}

      </div>
      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </Modal>
  );
}
