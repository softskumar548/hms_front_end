import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, StatusPill, Toast, Skeleton } from "../../ui/components";

export default function PatientPortal() {
  const { token } = useAuth();
  const qc = useQueryClient();

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Bottom action bar navigation active tab: home, records, billing
  const [activeTab, setActiveTab] = useState("home");

  // Local simulated checkout gate simulator details
  const [payingInvoice, setPayingInvoice] = useState<any>(null);

  // Fetch Patient Portal upcoming visits
  const { data: visits = [], isLoading: visitsLoading } = useQuery({
    queryKey: ["portalVisits"],
    queryFn: () => api.getPortalVisits(token),
  });

  // Fetch Patient Summary (to display historical released outcomes & invoices)
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["patientSummary", "p-001"], // Mock patient Kalyan Chakravarthy
    queryFn: () => api.getPatientSummary(token, "p-001"),
  });

  // Fetch Invoices
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["portalInvoices"],
    queryFn: () => api.listInvoices(token, "p-001"),
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Pay Invoice Mutation
  const payMutation = useMutation({
    mutationFn: (invoiceId: string) =>
      api.recordPayment(token, {
        invoice_id: invoiceId,
        amount: payingInvoice.lines.reduce((sum: number, l: any) => sum + l.amount, 0),
        mode: "UPI",
      }),
    onSuccess: () => {
      triggerToast("Payment successful via UPI gateway simulator. Receipt generated.");
      setPayingInvoice(null);
      qc.invalidateQueries({ queryKey: ["portalInvoices"] });
    },
    onError: () => {
      triggerToast("Failed to process digital cashless payment.");
    },
  });

  if (visitsLoading || summaryLoading || invoicesLoading) {
    return (
      <div style={{ display: "grid", justifyContent: "center", padding: 40 }}>
        <Skeleton height={300} style={{ width: 380 }} />
      </div>
    );
  }

  // Find draft or upcoming check-ins
  const upcomingVisit = visits.find((v: any) => v.status === "DRAFT" || v.status === "ARRIVED" || v.status === "BOOKED");

  return (
    <div style={{ display: "grid", justifyContent: "center", padding: "10px 0" }}>
      {/* Smartphone frame container capped at 380px (UI-601) */}
      <div
        className="phone-frame"
        style={{
          width: 380,
          height: 680,
          background: "var(--wash-a)",
          border: "12px solid #23263B",
          borderRadius: "40px",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 22px 60px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--font-body)",
        }}
      >
        {/* Phone screen status header */}
        <div style={{ background: "var(--indigo)", padding: "12px 16px 8px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11 }}>
          <strong>MediGo Patient Portal</strong>
          <span>🔋 100% · 12:00 PM</span>
        </div>

        {/* Scrollable Screen Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 80px" }}>
          
          {/* Header patient profile info */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--indigo-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--indigo)" }}>
              KC
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 15, color: "var(--ink)" }}>Kalyan Chakravarthy</h4>
              <span style={{ fontSize: 11, color: "var(--slate)" }}>ABHA: 91-0391-4912-3210</span>
            </div>
          </div>

          {/* TAB CONTENT: HOME */}
          {activeTab === "home" && (
            <div style={{ display: "grid", gap: 14 }}>
              {upcomingVisit ? (
                <Card style={{ padding: 14, borderRadius: "18px", border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)" }}>UPCOMING CONSULTATION</span>
                    <StatusPill kind={upcomingVisit.status === "DRAFT" ? "warn" : "success"}>
                      {upcomingVisit.status}
                    </StatusPill>
                  </div>
                  
                  <strong style={{ fontSize: 15, color: "var(--indigo)", display: "block" }}>
                    {upcomingVisit.practitioner_name}
                  </strong>
                  <span style={{ fontSize: 12.5, color: "var(--slate)", display: "block", marginTop: 2 }}>
                    {upcomingVisit.service_name} · {upcomingVisit.site_name}
                  </span>
                  
                  <div style={{ borderTop: "1px dashed var(--line)", marginTop: 10, paddingTop: 10 }}>
                    <strong style={{ fontSize: 12, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                      Required Pre-visit Checklists (తప్పనిసరి):
                    </strong>
                    <div style={{ display: "grid", gap: 6 }}>
                      {upcomingVisit.prerequisites?.map((pr: any) => (
                        <div key={pr.prerequisite_id} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12 }}>
                          <input type="checkbox" checked={pr.satisfied} readOnly aria-label={pr.code} style={{ width: 18, height: 18 }} />
                          <div>
                            <strong>{pr.code}:</strong> {pr.description}
                          </div>
                        </div>
                      )) || <span style={{ fontSize: 12.5, fontStyle: "italic" }}>No prerequisites scheduled.</span>}
                    </div>
                  </div>

                  {/* Pre-visit Intake Form CTA (UI-602) */}
                  {!upcomingVisit.forms_completed ? (
                    <div style={{ marginTop: 14 }}>
                      <Link to={`/portal/intake/${upcomingVisit.id}`} style={{ textDecoration: "none" }}>
                        <Button style={{ width: "100%", height: 44, fontSize: 13 }}>
                          📝 Complete Pre-Visit Forms
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div style={{ background: "rgba(28, 154, 78, 0.05)", border: "1px solid var(--green)", color: "var(--green)", padding: 8, borderRadius: "10px", marginTop: 12, fontSize: 12, fontWeight: 700, textAlign: "center" }}>
                      ✓ Pre-Visit Forms & Consents Completed
                    </div>
                  )}
                </Card>
              ) : (
                <p style={{ fontStyle: "italic", fontSize: 13, color: "var(--slate)", textAlign: "center" }}>
                  No upcoming consultation appointments scheduled.
                </p>
              )}
            </div>
          )}

          {/* TAB CONTENT: RECORDS */}
          {activeTab === "records" && (
            <div style={{ display: "grid", gap: 12 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--indigo)", margin: 0 }}>
                Released Diagnostic Outcomes
              </h3>

              <div style={{ display: "grid", gap: 10 }}>
                <Card style={{ padding: 12, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>Troponin T (Serum)</strong>
                    <StatusPill kind="danger">CRITICAL</StatusPill>
                  </div>
                  <strong style={{ fontSize: 18, color: "var(--danger)", display: "block", marginTop: 6 }}>
                    1.5 ng/mL
                  </strong>
                  <span style={{ fontSize: 11, color: "var(--slate)" }}>Reference: 0.0 - 0.04 · Released today</span>
                </Card>
                <Card style={{ padding: 12, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>Hemoglobin</strong>
                    <StatusPill kind="warn">ABNORMAL</StatusPill>
                  </div>
                  <strong style={{ fontSize: 18, color: "var(--orange)", display: "block", marginTop: 6 }}>
                    11.2 g/dL
                  </strong>
                  <span style={{ fontSize: 11, color: "var(--slate)" }}>Reference: 13.0 - 17.0 · Released today</span>
                </Card>
              </div>
            </div>
          )}

          {/* TAB CONTENT: BILLING */}
          {activeTab === "billing" && (
            <div style={{ display: "grid", gap: 12 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--indigo)", margin: 0 }}>
                Outstanding Invoices & Dues
              </h3>

              {invoices.length === 0 ? (
                <p style={{ fontStyle: "italic", fontSize: 13, textAlign: "center", color: "var(--slate)" }}>
                  No outstanding invoices.
                </p>
              ) : (
                invoices.map((inv: any) => {
                  const amt = inv.lines.reduce((sum: number, l: any) => sum + l.amount, 0);
                  const isPaid = inv.status === "paid";
                  
                  return (
                    <Card key={inv.id} style={{ padding: 12, border: "1px solid var(--line)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong style={{ fontSize: 14 }}>Invoice: {inv.id}</strong>
                          <span style={{ display: "block", fontSize: 12, color: "var(--slate)" }}>
                            Total: ₹{amt.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div>
                          {isPaid ? (
                            <span style={{ color: "var(--green)", fontWeight: 700, fontSize: 13 }}>Paid ✓</span>
                          ) : (
                            <Button
                              type="button"
                              style={{ fontSize: 12, height: 36, padding: "0 12px" }}
                              onClick={() => setPayingInvoice(inv)}
                            >
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

        </div>

        {/* UPI Gateway Simulator Drawer */}
        {payingInvoice && (
          <div style={{ position: "absolute", bottom: 0, width: "100%", background: "#fff", borderTop: "2px solid var(--indigo)", padding: 20, zIndex: 100, display: "grid", gap: 12, boxShadow: "0 -4px 15px rgba(0,0,0,0.15)" }}>
            <strong style={{ fontSize: 14, color: "var(--indigo)" }}>Simulated UPI Digital Gateway</strong>
            <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
              Authorizing payment of <strong>₹{payingInvoice.lines.reduce((sum: number, l: any) => sum + l.amount, 0).toLocaleString("en-IN")}</strong> via BHIM UPI cashless gateway.
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              <Button ghost style={{ flex: 1, height: 44 }} onClick={() => setPayingInvoice(null)}>Cancel</Button>
              <Button style={{ flex: 1, height: 44 }} onClick={() => payMutation.mutate(payingInvoice.id)}>
                Authorize Payment
              </Button>
            </div>
          </div>
        )}

        {/* Smartphone bottom navigation bar (UI-601 targets minimum 44px) */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: 54,
            background: "#fff",
            borderTop: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <div
            onClick={() => setActiveTab("home")}
            style={{
              flex: 1,
              textAlign: "center",
              cursor: "pointer",
              height: 48,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              color: activeTab === "home" ? "var(--indigo)" : "var(--slate)",
              fontWeight: activeTab === "home" ? 700 : 400,
              fontSize: 12,
            }}
          >
            🏠 Home
          </div>
          <div
            onClick={() => setActiveTab("records")}
            style={{
              flex: 1,
              textAlign: "center",
              cursor: "pointer",
              height: 48,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              color: activeTab === "records" ? "var(--indigo)" : "var(--slate)",
              fontWeight: activeTab === "records" ? 700 : 400,
              fontSize: 12,
            }}
          >
            📋 Records
          </div>
          <div
            onClick={() => setActiveTab("billing")}
            style={{
              flex: 1,
              textAlign: "center",
              cursor: "pointer",
              height: 48,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              color: activeTab === "billing" ? "var(--indigo)" : "var(--slate)",
              fontWeight: activeTab === "billing" ? 700 : 400,
              fontSize: 12,
            }}
          >
            💳 Billing
          </div>
        </div>

      </div>
      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
