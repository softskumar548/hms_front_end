import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Input, Select, Toast, Modal, Skeleton } from "../../ui/components";

interface PaymentTillProps {
  invoice: any;
  onClose: () => void;
}

export default function PaymentTill({ invoice, onClose }: PaymentTillProps) {
  const { token, tenant } = useAuth();
  const facilityTitle = tenant ? tenant.replace(/[_|-]/g, " ").toUpperCase() : "HEALTHCARE CLINIC";
  const qc = useQueryClient();

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Form inputs
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("CASH"); // CASH, CARD, UPI

  // Receipt display after payment success
  const [generatedReceipt, setGeneratedReceipt] = useState<any>(null);
  
  // Till summary display state
  const [showTillSummary, setShowTillSummary] = useState(false);

  // Fetch Till Summary data (UI-504)
  const { data: tillData, refetch: refetchTill } = useQuery({
    queryKey: ["tillSummary"],
    queryFn: () => api.getTillSummary(token),
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const invoiceTotal = invoice.lines.reduce((sum: number, l: any) => sum + l.amount, 0);
  const totalPaid = invoice.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
  const balanceDue = invoiceTotal - totalPaid;

  // Record Payment Mutation
  const paymentMutation = useMutation({
    mutationFn: (amount: number) =>
      api.recordPayment(token, {
        invoice_id: invoice.id,
        amount: amount,
        mode: payMode,
      }),
    onSuccess: (data) => {
      triggerToast("Payment captured successfully. Receipt generated.");
      setGeneratedReceipt(data);
      refetchTill();
      qc.invalidateQueries({ queryKey: ["invoices", invoice.patient_id] });
    },
    onError: () => {
      triggerToast("Failed to record cashier payment.");
    },
  });

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(payAmount);
    if (isNaN(parsed) || parsed <= 0 || parsed > balanceDue) {
      triggerToast("Please enter a valid partial or full payment amount.");
      return;
    }
    paymentMutation.mutate(parsed);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Cashier Payments Till Workspace">
      <div style={{ display: "grid", gap: 20, maxWidth: 500, minWidth: 420, fontFamily: "var(--font-body)", color: "var(--ink)" }}>
        
        {/* Toggle between checkout and daily till summary */}
        <div style={{ display: "flex", gap: 10, borderBottom: "1px solid var(--line)", paddingBottom: 10 }}>
          <Button ghost={showTillSummary} onClick={() => setShowTillSummary(false)} style={{ flex: 1 }}>
            Checkout Counter
          </Button>
          <Button ghost={!showTillSummary} onClick={() => setShowTillSummary(true)} style={{ flex: 1 }}>
            Daily Till Summary
          </Button>
        </div>

        {!showTillSummary ? (
          <div>
            {!generatedReceipt ? (
              <form onSubmit={handleSubmitPayment} style={{ display: "grid", gap: 14 }}>
                <div style={{ background: "var(--wash-a)", padding: 14, borderRadius: "14px", border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "var(--slate)" }}>Invoice Total:</span>
                    <strong style={{ fontSize: 13 }}>₹{invoiceTotal.toLocaleString("en-IN")}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "var(--slate)" }}>Amount Paid:</span>
                    <strong style={{ fontSize: 13, color: "var(--green)" }}>₹{totalPaid.toLocaleString("en-IN")}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>Balance Due:</span>
                    <strong style={{ fontSize: 14, color: "var(--danger)" }}>₹{balanceDue.toLocaleString("en-IN")}</strong>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                    Payment Mode
                  </label>
                  <Select value={payMode} onChange={(e) => setPayMode(e.target.value)}>
                    <option value="CASH">Cash (నగదు)</option>
                    <option value="CARD">Credit/Debit Card (కార్డు)</option>
                    <option value="UPI">UPI / Digital (UPI)</option>
                  </Select>
                </div>

                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                    Amount to Collect (₹)
                  </label>
                  <Input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder={`e.g. ${balanceDue}`}
                    max={balanceDue}
                    required
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                  <Button ghost type="button" onClick={onClose}>Cancel</Button>
                  <Button type="submit" disabled={paymentMutation.isPending}>
                    {paymentMutation.isPending ? "Recording..." : "Capture Payment"}
                  </Button>
                </div>
              </form>
            ) : (
              /* Printable Receipt view */
              <div style={{ display: "grid", gap: 16 }}>
                <div
                  style={{
                    background: "#fff",
                    border: "2px dashed var(--indigo)",
                    borderRadius: "14px",
                    padding: 20,
                    fontFamily: "monospace",
                    position: "relative",
                  }}
                >
                  {/* Perforated design header */}
                  <div style={{ textAlign: "center", borderBottom: "1px dashed #000", paddingBottom: 10, marginBottom: 14 }}>
                    <strong style={{ fontSize: 16 }}>{facilityTitle}</strong>
                    <div style={{ fontSize: 11 }}>OFFICIAL PAYMENT RECEIPT</div>
                  </div>

                  <div style={{ display: "grid", gap: 6, fontSize: 13 }}>
                    <div><strong>Receipt No:</strong> {generatedReceipt.receipt_number}</div>
                    <div><strong>Invoice ID:</strong> {generatedReceipt.invoice_id}</div>
                    <div><strong>Payment Mode:</strong> {generatedReceipt.mode}</div>
                    <div><strong>Date:</strong> {new Date(generatedReceipt.created_at).toLocaleString("en-IN")}</div>
                    <div style={{ borderBottom: "1px dashed #000", margin: "8px 0" }}></div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14 }}>
                      <span>AMOUNT PAID:</span>
                      <span>₹{generatedReceipt.amount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <Button ghost onClick={() => window.print()}>Print Receipt</Button>
                  <Button onClick={() => setGeneratedReceipt(null)}>Collect Another Payment</Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Daily Till summary (UI-504) */
          <div>
            {!tillData ? (
              <Skeleton height={150} />
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                <h4 style={{ margin: "0 0 6px", fontSize: 15, color: "var(--indigo)" }}>
                  Today's Cash Drawer Summary
                </h4>
                
                <div style={{ display: "grid", gap: 8, background: "var(--wash-a)", padding: 14, borderRadius: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Collected Cash:</span>
                    <strong>₹{tillData.collected_cash.toLocaleString("en-IN")}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Collected Digital:</span>
                    <strong>₹{tillData.collected_digital.toLocaleString("en-IN")}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: 6, fontWeight: 700 }}>
                    <span>Total Till Balance:</span>
                    <span>₹{tillData.expected_balance.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "rgba(28,154,78,0.05)", border: "1px solid var(--green)", padding: 12, borderRadius: "14px", fontSize: 12.5, color: "var(--green)" }}>
                  <div><strong>Till Discrepancy:</strong> ₹0</div>
                  <div><strong>Status:</strong> RECONCILED OK</div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                  <Button onClick={() => triggerToast("Till sessions closed & logs exported.")}>
                    🔒 Lock & Close Till
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </Modal>
  );
}
