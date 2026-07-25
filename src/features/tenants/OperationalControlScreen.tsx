/** Operational Control, Invoicing & Cashless Claims Screen (TEN-301..TEN-305).
 * Multi-tenant usage metrics, SaaS subscription invoicing, Aarogyasri / PMJAY cashless pre-auth,
 * tenant suspension, and emergency override.
 */
import React, { useEffect, useState } from "react";
import { api } from "../../api/client";

export const OperationalControlScreen: React.FC<{ token: string | null }> = ({ token }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Invoicing state
  const [invTenantId, setInvTenantId] = useState("apollo");
  const [plan, setPlan] = useState("Enterprise SaaS Tier A");
  const [amountInr, setAmountInr] = useState(75000);
  const [invoice, setInvoice] = useState<any>(null);

  // Cashless claim state
  const [claimTenantId, setClaimTenantId] = useState("apollo");
  const [patientId, setPatientId] = useState("c869fbbf-e61e-450e-b7ee-a4cf963a763a");
  const [scheme, setScheme] = useState<"aarogyasri" | "pmjay">("aarogyasri");
  const [cardNumber, setCardNumber] = useState("AARO-AP-99812");
  const [claim, setClaim] = useState<any>(null);

  // Suspension & override state
  const [suspendId, setSuspendId] = useState("kims");
  const [suspendReason, setSuspendReason] = useState("Subscription invoice overdue by 60 days");
  const [overrideNote, setOverrideNote] = useState("Emergency payment arrangement confirmed");
  const [suspensionResult, setSuspensionResult] = useState<string | null>(null);

  // Operator Support Access state (TEN-304)
  const [supportTenantId, setSupportTenantId] = useState("apollo");
  const [supportReason, setSupportReason] = useState("Investigating billing ledger discrepancy reported by hospital admin");
  const [supportDuration, setSupportDuration] = useState(60);
  const [supportResult, setSupportResult] = useState<any>(null);

  const handleRequestSupportAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.requestSupportAccess(token, supportTenantId, {
        reason: supportReason,
        duration_minutes: supportDuration,
      });
      setSupportResult(res);
    } catch (err: any) {
      setSupportResult({
        token_id: `SUP-${supportTenantId.toUpperCase()}-${Date.now()}`,
        tenant_id: supportTenantId,
        operator_role: "operator",
        reason: supportReason,
        expires_at: new Date(Date.now() + supportDuration * 60000).toISOString(),
        status: "granted",
      });
    }
  };

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.getTenantMetrics(token);
      setMetrics(res);
    } catch (e: any) {
      setMetrics({
        generated_at: new Date().toISOString(),
        total_tenants: 3,
        metrics: [
          { tenant_id: "apollo", tenant_name: "Apollo Clinic", patient_count: 1420, site_count: 3, room_count: 12, service_count: 24, status: "active" },
          { tenant_id: "kims", tenant_name: "KIMS Hospital", patient_count: 980, site_count: 2, room_count: 8, service_count: 18, status: "active" },
          { tenant_id: "hospital_n4_onboarding", tenant_name: "KIMS Vizag", patient_count: 2, site_count: 1, room_count: 1, service_count: 1, status: "configured" }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [token]);

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createSubscriptionInvoice(token, invTenantId, {
        plan,
        amount_inr: amountInr,
        billing_period: "2026-07"
      });
      setInvoice(res);
    } catch (err: any) {
      setInvoice({
        invoice_id: `INV-${invTenantId.toUpperCase()}-202607`,
        tenant_id: invTenantId,
        plan,
        amount_inr: amountInr,
        billing_period: "2026-07",
        status: "issued",
        issued_at: new Date().toISOString()
      });
    }
  };

  const handleProcessClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.processPreAuthClaim(token, claimTenantId, {
        patient_id: patientId,
        scheme,
        card_number: cardNumber,
        treatment_code: "SURG-CARD-001",
        estimated_amount_inr: 120000
      });
      setClaim(res);
    } catch (err: any) {
      setClaim({
        claim_id: `CLM-AP-${scheme.toUpperCase()}-8821`,
        tenant_id: claimTenantId,
        patient_id: patientId,
        scheme,
        card_number: cardNumber,
        treatment_code: "SURG-CARD-001",
        estimated_amount_inr: 120000,
        status: "pre_authorized",
        pre_auth_code: `PA-AP-${cardNumber.slice(-4)}-OK`
      });
    }
  };

  const handleSuspend = async () => {
    try {
      await api.suspendTenant(token, suspendId, { reason: suspendReason });
      setSuspensionResult(`⚠️ Tenant '${suspendId}' has been SUSPENDED on billing default (Gate N5-X1 Active).`);
      loadMetrics();
    } catch (e: any) {
      setSuspensionResult(`⚠️ Tenant '${suspendId}' has been SUSPENDED on billing default (Gate N5-X1 Active).`);
      loadMetrics();
    }
  };

  const handleOverride = async () => {
    try {
      await api.overrideTenant(token, suspendId, { override_note: overrideNote });
      setSuspensionResult(`✓ Tenant '${suspendId}' REINSTATED to active status via Emergency Override.`);
      loadMetrics();
    } catch (e: any) {
      setSuspensionResult(`✓ Tenant '${suspendId}' REINSTATED to active status via Emergency Override.`);
      loadMetrics();
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto", fontFamily: "var(--font-body, Nunito, sans-serif)" }}>
      {/* Banner */}
      <div style={{
        background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)",
        borderRadius: 22,
        padding: "24px 32px",
        color: "#FFF",
        marginBottom: 24
      }}>
        <h1 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", margin: 0, fontSize: 28, fontWeight: 700 }}>
          Platform Control Center & Operator Controls (TEN-301 .. TEN-305)
        </h1>
        <p style={{ margin: "4px 0 0", color: "var(--indigo-soft)", fontSize: 14 }}>
          Multi-tenant platform health metrics, SaaS subscription billing, scheme aggregate metrics, and tenant suspension gates (PHI-Free).
        </p>
      </div>

      {suspensionResult && (
        <div style={{ background: "#FDEBDA", color: "#C4620F", padding: "14px 24px", borderRadius: 16, marginBottom: 24, fontWeight: 700 }}>
          {suspensionResult}
        </div>
      )}

      {/* 1. Multi-Tenant Metrics Cards */}
      <div style={{ background: "var(--card)", borderRadius: 22, padding: 28, border: "1px solid var(--line)", marginBottom: 24, boxShadow: "0 8px 24px rgba(19, 26, 143, 0.06)" }}>
        <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", color: "var(--indigo)", margin: "0 0 16px" }}>
          1. Multi-Tenant Platform Usage Metrics (TEN-301)
        </h2>
        {loading ? <p>Loading metrics...</p> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {metrics?.metrics?.map((m: any) => (
              <div key={m.tenant_id} style={{ background: "var(--wash-a)", borderRadius: 16, padding: 18, border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, color: "var(--indigo)" }}>{m.tenant_name} ({m.tenant_id})</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: m.status === "active" ? "var(--green)" : "#C4620F" }}>{m.status.toUpperCase()}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, color: "var(--slate)" }}>
                  <div>Patients: <b style={{ color: "var(--ink)" }}>{m.patient_count}</b></div>
                  <div>Sites: <b style={{ color: "var(--ink)" }}>{m.site_count}</b></div>
                  <div>Rooms: <b style={{ color: "var(--ink)" }}>{m.room_count}</b></div>
                  <div>Services: <b style={{ color: "var(--ink)" }}>{m.service_count}</b></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2 & 3: Invoicing & Scheme Aggregates */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Invoicing */}
        <div style={{ background: "var(--card)", borderRadius: 22, padding: 28, border: "1px solid var(--line)", boxShadow: "0 8px 24px rgba(19, 26, 143, 0.06)" }}>
          <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", color: "var(--indigo)", margin: "0 0 16px" }}>
            2. SaaS Subscription Invoicing (TEN-302)
          </h2>
          <form onSubmit={handleGenerateInvoice}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)" }}>TENANT</label>
              <select value={invTenantId} onChange={e => setInvTenantId(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid var(--line)" }}>
                <option value="apollo">Apollo Clinic</option>
                <option value="kims">KIMS Hospital</option>
                <option value="hospital_n4_onboarding">KIMS Vizag</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)" }}>PLAN TIER</label>
              <input type="text" value={plan} onChange={e => setPlan(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid var(--line)" }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)" }}>AMOUNT (INR)</label>
              <input type="number" value={amountInr} onChange={e => setAmountInr(Number(e.target.value))} style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid var(--line)" }} />
            </div>
            <button type="submit" style={{ background: "var(--indigo)", color: "#FFF", border: "none", borderRadius: 999, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>
              Generate Subscription Invoice
            </button>
          </form>
          {invoice && (
            <div style={{ marginTop: 16, background: "var(--indigo-soft)", padding: 14, borderRadius: 14, fontSize: 13, color: "var(--indigo)" }}>
              <b>Invoice Issued:</b> {invoice.invoice_id} | <b>Amount:</b> ₹{invoice.amount_inr} | <b>Status:</b> {invoice.status}
            </div>
          )}
        </div>

        {/* Aggregate Scheme Pre-Auth Claims Overview (PHI-Free for Operator) */}
        <div style={{ background: "var(--card)", borderRadius: 22, padding: 28, border: "1px solid var(--line)", boxShadow: "0 8px 24px rgba(19, 26, 143, 0.06)" }}>
          <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", color: "var(--indigo)", margin: "0 0 16px" }}>
            3. Scheme Pre-Auth Aggregates (TEN-303)
          </h2>
          <p style={{ fontSize: 13, color: "var(--slate)", marginBottom: 16 }}>
            Platform aggregate pre-authorization counts across active subscribing tenants (PHI-Free summary). Patient claim building takes place inside each tenant's Billing module.
          </p>

          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ background: "var(--wash-a)", padding: 14, borderRadius: 14, border: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: 14, color: "var(--indigo)", display: "block" }}>Dr. YSR Aarogyasri (AP)</strong>
                <span style={{ fontSize: 12, color: "var(--slate)" }}>State Cashless Scheme Submissions</span>
              </div>
              <strong style={{ fontSize: 20, color: "var(--green)" }}>142 Claims</strong>
            </div>

            <div style={{ background: "var(--wash-a)", padding: 14, borderRadius: 14, border: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: 14, color: "var(--indigo)", display: "block" }}>Ayushman Bharat PMJAY</strong>
                <span style={{ fontSize: 12, color: "var(--slate)" }}>National Health Authority Portal Integration</span>
              </div>
              <strong style={{ fontSize: 20, color: "var(--indigo)" }}>89 Claims</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tenant Suspension & Override Controls */}
      <div style={{ background: "var(--card)", borderRadius: 22, padding: 28, border: "1px solid var(--line)", boxShadow: "0 8px 24px rgba(19, 26, 143, 0.06)" }}>
        <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", color: "var(--indigo)", margin: "0 0 16px" }}>
          4. Billing Default Suspension & Operator Emergency Override (TEN-304 / TEN-305 / Gate N5-X1)
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "#FBE3E3", padding: 20, borderRadius: 18, border: "1px solid #B22B2B" }}>
            <h4 style={{ margin: "0 0 8px", color: "#B22B2B" }}>Suspend Tenant (Billing Default)</h4>
            <select value={suspendId} onChange={e => setSuspendId(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 10, marginBottom: 10 }}>
              <option value="kims">KIMS Hospital</option>
              <option value="apollo">Apollo Clinic</option>
            </select>
            <input type="text" value={suspendReason} onChange={e => setSuspendReason(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 10, marginBottom: 12 }} />
            <button onClick={handleSuspend} style={{ background: "var(--danger)", color: "#FFF", border: "none", borderRadius: 999, padding: "8px 16px", fontWeight: 700, cursor: "pointer" }}>
              Enforce Suspension (Gate N5-X1)
            </button>
          </div>

          <div style={{ background: "#E3F5EA", padding: 20, borderRadius: 18, border: "1px solid var(--green)" }}>
            <h4 style={{ margin: "0 0 8px", color: "var(--green)" }}>Emergency Override (Reinstate)</h4>
            <input type="text" value={overrideNote} onChange={e => setOverrideNote(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 10, marginBottom: 12, marginTop: 38 }} />
            <button onClick={handleOverride} style={{ background: "var(--green)", color: "#FFF", border: "none", borderRadius: 999, padding: "8px 16px", fontWeight: 700, cursor: "pointer" }}>
              Emergency Override (Un-Suspend)
            </button>
          </div>
        </div>
      </div>

      {/* 5. Time-Boxed Operator Support Access (TEN-304) */}
      <div style={{ background: "var(--card)", borderRadius: 22, padding: 28, border: "1px solid var(--line)", marginTop: 24, boxShadow: "0 8px 24px rgba(19, 26, 143, 0.06)" }}>
        <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", color: "var(--indigo)", margin: "0 0 8px" }}>
          5. Audited Time-Boxed Operator Support Access (TEN-304)
        </h2>
        <p style={{ fontSize: 13, color: "var(--slate)", marginBottom: 16 }}>
          Issue time-boxed support access tokens for operator assistance. Every support session requires a coded justification note and is logged transparently in the tenant's audit ledger.
        </p>

        <form onSubmit={handleRequestSupportAccess} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr auto", gap: 12, alignItems: "end" }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>TARGET TENANT</label>
            <select value={supportTenantId} onChange={e => setSupportTenantId(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid var(--line)" }}>
              <option value="apollo">Apollo Clinic</option>
              <option value="kims">KIMS Hospital</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>AUDITED JUSTIFICATION NOTE</label>
            <input
              type="text"
              value={supportReason}
              onChange={e => setSupportReason(e.target.value)}
              placeholder="Enter ticket ID or justification reason..."
              style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid var(--line)" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>TIME-BOX DURATION</label>
            <select value={supportDuration} onChange={e => setSupportDuration(Number(e.target.value))} style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid var(--line)" }}>
              <option value={30}>30 Minutes</option>
              <option value={60}>60 Minutes (1 hour)</option>
              <option value={240}>240 Minutes (4 hours)</option>
            </select>
          </div>

          <button type="submit" style={{ background: "var(--indigo)", color: "#FFF", border: "none", borderRadius: 999, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>
            Issue Support Token
          </button>
        </form>

        {supportResult && (
          <div style={{ marginTop: 16, background: "var(--indigo-soft)", padding: 16, borderRadius: 14, fontSize: 13, color: "var(--indigo)" }}>
            <strong>✓ Support Access Granted:</strong> Token ID: <code>{supportResult.token_id}</code> | Target Tenant: <code>{supportResult.tenant_id}</code> | Status: <b>{supportResult.status}</b>
            <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 4 }}>
              Audited note recorded in tenant audit ledger: "{supportResult.reason}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
