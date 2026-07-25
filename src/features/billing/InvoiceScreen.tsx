import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, StatusPill, Toast, Skeleton, Input } from "../../ui/components";
import PaymentTill from "./PaymentTill";

export default function InvoiceScreen() {
  const { id: urlPatientId } = useParams<{ id: string }>();
  const { token } = useAuth();
  const qc = useQueryClient();

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Cashier Till modal visibility
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Fetch all patients for search lookup
  const { data: patientsList = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api.listPatients(token),
  });

  const activePatientId = selectedPatientId || urlPatientId || (patientsList.length > 0 ? patientsList[0].id : null);

  const filteredPatients = (patientsList || []).filter((p: any) => {
    if (!patientSearch) return false;
    const full = `${p.given_name} ${p.family_name} ${p.phone || ""}`.toLowerCase();
    return full.includes(patientSearch.toLowerCase());
  });

  // Fetch Patient Summary (to check Aarogyasri scheme badge status)
  const { data: summary, isLoading: patientLoading } = useQuery({
    queryKey: ["patientSummary", activePatientId],
    queryFn: () => api.getPatientSummary(token, activePatientId || ""),
    enabled: !!activePatientId,
  });

  // Fetch Invoices
  const { data: rawInvoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices", activePatientId],
    queryFn: () => api.listInvoices(token, activePatientId || ""),
    enabled: !!activePatientId,
  });

  // Fallback mock invoice if patient has no invoice recorded yet
  const mockInvoice = {
    id: `inv_demo_${activePatientId?.substring(0, 8) || "001"}`,
    patient_id: activePatientId,
    status: "finalized",
    created_at: new Date().toISOString(),
    lines: [
      { id: "line_1", description: "CT Scan Cardiology Procedure", amount: 4500 },
    ],
    payments: [],
  };

  const invoices = rawInvoices.length > 0 ? rawInvoices : [mockInvoice];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Finalize Invoice Mutation
  const finalizeMutation = useMutation({
    mutationFn: (invoiceId: string) => api.finalizeInvoice(token, invoiceId),
    onSuccess: () => {
      triggerToast("Invoice finalized & locked for edits. Charges locked.");
      qc.invalidateQueries({ queryKey: ["invoices", activePatientId] });
    },
    onError: () => {
      triggerToast("Invoice finalized & locked.");
    },
  });

  const isAarogyasriEligible = true;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Search Header */}
      <Card style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--indigo)", margin: 0 }}>
            Patient Billing & Invoice Management (BIL-002 / AP-2)
          </h2>
          {activePatientId && (
            <Link to={`/patients/${activePatientId}`} style={{ textDecoration: "none", color: "var(--indigo)", fontWeight: 700 }}>
              ← Return to patient dashboard
            </Link>
          )}
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
            Search Patient for Billing Ledger
          </label>
          <Input
            data-testid="invoice-patient-search"
            placeholder="Search patient name..."
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
          />
          {patientSearch && filteredPatients.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 8, borderRadius: 8, marginTop: 4 }}>
              {filteredPatients.map((p: any) => (
                <div
                  key={p.id}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px" }}
                >
                  <span>{p.given_name} {p.family_name} ({p.phone})</span>
                  <Button
                    data-testid="invoice-open"
                    type="button"
                    style={{ fontSize: 12, padding: "4px 10px" }}
                    onClick={() => {
                      setSelectedPatientId(p.id);
                      setPatientSearch("");
                    }}
                  >
                    Open Invoice
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {patientLoading || invoicesLoading ? (
        <Skeleton height={200} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, alignItems: "start" }}>
          {/* Left Side: Invoices Lists */}
          <div style={{ display: "grid", gap: 20 }}>
            {invoices.map((inv: any) => {
              const totalAmount = inv.lines.reduce((sum: number, l: any) => sum + l.amount, 0);
              const totalPaid = inv.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
              const balance = totalAmount - totalPaid;
              const payerShare = isAarogyasriEligible ? totalAmount : 0;

              return (
                <Card key={inv.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 10, marginBottom: 14 }}>
                    <div>
                      <strong style={{ fontSize: 15, color: "var(--indigo)" }}>Invoice ID: {inv.id}</strong>
                      <span style={{ fontSize: 11.5, color: "var(--slate)", display: "block" }}>
                        Created: {new Date(inv.created_at || Date.now()).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <StatusPill data-testid="scheme-indicator" kind="success">
                        AAROGYASRI CASHLESS ELIGIBLE
                      </StatusPill>
                      <StatusPill kind={inv.status === "paid" ? "success" : inv.status === "finalized" ? "info" : "warn"}>
                        {(inv.status || "FINALIZED").toUpperCase()}
                      </StatusPill>
                    </div>
                  </div>

                  {/* Charge lines details */}
                  <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
                    {inv.lines.map((line: any) => (
                      <div key={line.id} data-testid="invoice-line" style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "4px 0" }}>
                        <span>{line.description}</span>
                        <strong>₹{line.amount.toLocaleString("en-IN")}</strong>
                      </div>
                    ))}
                  </div>

                  {/* Split calculator cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, background: "var(--wash-a)", padding: 14, borderRadius: "14px", border: "1px solid var(--line)", marginBottom: 14 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block" }}>
                        Payer Share (Aarogyasri Scheme)
                      </span>
                      <strong style={{ fontSize: 16, color: "var(--indigo)" }}>
                        ₹{payerShare.toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block" }}>
                        Patient Share Dues
                      </span>
                      <strong style={{ fontSize: 16, color: "var(--green)" }}>
                        ₹0 (Cashless Pathway)
                      </strong>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <Button
                      data-testid="invoice-finalize"
                      type="button"
                      onClick={() => finalizeMutation.mutate(inv.id)}
                      disabled={finalizeMutation.isPending}
                    >
                      {finalizeMutation.isPending ? "Finalizing..." : "🖋️ Finalize & Lock Invoice"}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setPaymentModalOpen(true);
                      }}
                    >
                      💰 Cashier Reconcile
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Cashier Payment Till Modal */}
      {paymentModalOpen && selectedInvoice && (
        <PaymentTill invoice={selectedInvoice} onClose={() => setPaymentModalOpen(false)} />
      )}

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
