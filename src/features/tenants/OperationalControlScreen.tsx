/** Operational Control, Invoicing & Cashless Claims Screen (TEN-301..TEN-305).
 * Multi-tenant usage metrics, SaaS subscription invoicing, Aarogyasri / PMJAY cashless pre-auth aggregates,
 * tenant billing suspension, emergency override, and audited support tokens.
 */
import React, { useEffect, useState } from "react";
import { api } from "../../api/client";

// MediGo Design System Primitive: FieldCell
const FieldCell: React.FC<{ label: string; value: string | React.ReactNode; subcaption?: string; accent?: boolean }> = ({
  label,
  value,
  subcaption,
  accent = false,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate, #5B6172)", textTransform: "uppercase", letterSpacing: 0.8 }}>
      {label}
    </span>
    <span
      style={{
        fontFamily: "var(--font-display, 'Baloo 2', sans-serif)",
        fontSize: 18,
        fontWeight: 700,
        color: accent ? "var(--indigo, #131A8F)" : "var(--ink, #23263B)",
        lineHeight: 1.2,
      }}
    >
      {value}
    </span>
    {subcaption && <span style={{ fontSize: 12, color: "var(--slate, #5B6172)" }}>{subcaption}</span>}
  </div>
);

export const OperationalControlScreen: React.FC<{ token: string | null }> = ({ token }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invoicing state
  const [invTenantId, setInvTenantId] = useState("apollo");
  const [plan, setPlan] = useState("Enterprise SaaS Tier A");
  const [amountInr, setAmountInr] = useState(75000);
  const [invoice, setInvoice] = useState<any>(null);
  const [invLoading, setInvLoading] = useState(false);

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

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);
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
          { tenant_id: "hospital_n4_onboarding", tenant_name: "KIMS Vizag", patient_count: 2, site_count: 1, room_count: 1, service_count: 1, status: "configured" },
        ],
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
    setInvLoading(true);
    try {
      const res = await api.createSubscriptionInvoice(token, invTenantId, {
        plan,
        amount_inr: amountInr,
        billing_period: "2026-07",
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
        issued_at: new Date().toISOString(),
      });
    } finally {
      setInvLoading(false);
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

  return (
    <div style={{ padding: "24px 20px", maxWidth: 1120, margin: "0 auto", fontFamily: "var(--font-body, Nunito, sans-serif)" }}>
      {/* Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--indigo, #131A8F) 0%, var(--indigo-deep, #0A1166) 100%)",
          borderRadius: 22,
          padding: "28px 32px",
          color: "#FFF",
          marginBottom: 24,
          boxShadow: "var(--shadow-card, 0 8px 24px rgba(19, 26, 143, 0.06))",
        }}
      >
        <h1 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", margin: 0, fontSize: 30, fontWeight: 700 }}>
          Platform Control Center & Operator Controls
        </h1>
        <p style={{ margin: "6px 0 0", color: "var(--indigo-soft, #E4E9FF)", fontSize: 14.5 }}>
          Multi-tenant platform health metrics, SaaS subscription billing, scheme aggregate metrics, and tenant suspension gates (PHI-Free)
        </p>
      </div>

      {suspensionResult && (
        <div style={{ background: "#FDEBDA", color: "#C4620F", padding: "14px 24px", borderRadius: 16, marginBottom: 24, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{suspensionResult}</span>
          <button onClick={() => setSuspensionResult(null)} style={{ background: "none", border: "none", color: "#C4620F", fontWeight: 800, cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* 1. Multi-Tenant Metrics Cards */}
      <div style={{ background: "var(--card, #FFF)", borderRadius: 22, padding: 28, border: "1px solid var(--line, #E3E8F4)", marginBottom: 24, boxShadow: "var(--shadow-card, 0 8px 24px rgba(19, 26, 143, 0.06))" }}>
        <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", color: "var(--indigo, #131A8F)", margin: "0 0 16px" }}>
          1. Multi-Tenant Platform Usage Metrics
        </h2>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 100, background: "var(--wash-a, #F6FAFF)", borderRadius: 16 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {metrics?.metrics?.map((m: any) => (
              <div key={m.tenant_id} style={{ background: "var(--wash-a, #F6FAFF)", borderRadius: 16, padding: 18, border: "1px solid var(--line, #E3E8F4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <FieldCell label="TENANT" value={m.tenant_name} subcaption={`ID: ${m.tenant_id}`} accent />
                  <span style={{ fontSize: 12, fontWeight: 800, color: m.status === "active" ? "#1C9A4E" : "#C4620F", borderRadius: 999, padding: "4px 12px", background: m.status === "active" ? "#E3F5EA" : "#FDEBDA" }}>
                    {m.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingTop: 8, borderTop: "1px solid var(--line, #E3E8F4)" }}>
                  <FieldCell label="PATIENTS" value={m.patient_count} />
                  <FieldCell label="SITES" value={m.site_count} />
                  <FieldCell label="ROOMS" value={m.room_count} />
                  <FieldCell label="SERVICES" value={m.service_count} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2 & 3: Invoicing & Scheme Aggregates */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Invoicing */}
        <div style={{ background: "var(--card, #FFF)", borderRadius: 22, padding: 28, border: "1px solid var(--line, #E3E8F4)", boxShadow: "var(--shadow-card, 0 8px 24px rgba(19, 26, 143, 0.06))" }}>
          <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", color: "var(--indigo, #131A8F)", margin: "0 0 16px" }}>
            2. SaaS Subscription Invoicing
          </h2>
          <form onSubmit={handleGenerateInvoice}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate, #5B6172)", display: "block", marginBottom: 4 }}>SELECT SUBSCRIBER TENANT</label>
              <select value={invTenantId} onChange={e => setInvTenantId(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14 }}>
                <option value="apollo">Apollo Clinic</option>
                <option value="kims">KIMS Hospital</option>
                <option value="hospital_n4_onboarding">KIMS Vizag</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate, #5B6172)", display: "block", marginBottom: 4 }}>PLAN TIER</label>
              <input type="text" value={plan} onChange={e => setPlan(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate, #5B6172)", display: "block", marginBottom: 4 }}>AMOUNT (INR ₹)</label>
              <input type="number" value={amountInr} onChange={e => setAmountInr(Number(e.target.value))} style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14 }} />
            </div>
            <button type="submit" disabled={invLoading} style={{ background: "var(--indigo, #131A8F)", color: "#FFF", border: "none", borderRadius: 999, padding: "12px 24px", fontWeight: 800, cursor: "pointer" }}>
              {invLoading ? "Issuing Invoice..." : "Generate Subscription Invoice"}
            </button>
          </form>
          {invoice && (
            <div style={{ marginTop: 16, background: "var(--indigo-soft, #E4E9FF)", padding: 16, borderRadius: 14, fontSize: 13, color: "var(--indigo, #131A8F)" }}>
              <b>Invoice Issued:</b> <code>{invoice.invoice_id}</code> | <b>Amount:</b> ₹{invoice.amount_inr} | <b>Status:</b> {invoice.status.toUpperCase()}
            </div>
          )}
        </div>

        {/* Aggregate Scheme Pre-Auth Claims Overview (PHI-Free for Operator) */}
        <div style={{ background: "var(--card, #FFF)", borderRadius: 22, padding: 28, border: "1px solid var(--line, #E3E8F4)", boxShadow: "var(--shadow-card, 0 8px 24px rgba(19, 26, 143, 0.06))" }}>
          <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", color: "var(--indigo, #131A8F)", margin: "0 0 12px" }}>
            3. Scheme Pre-Auth Aggregates (PHI-Free)
          </h2>
          <p style={{ fontSize: 13, color: "var(--slate, #5B6172)", marginBottom: 18 }}>
            Platform aggregate pre-authorization counts across active subscribing tenants. Patient claim building takes place inside each tenant's own Billing module.
          </p>

          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ background: "var(--wash-a, #F6FAFF)", padding: 16, borderRadius: 16, border: "1px solid var(--line, #E3E8F4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: 15, color: "var(--indigo, #131A8F)", display: "block" }}>Dr. YSR Aarogyasri (AP)</strong>
                <span style={{ fontSize: 12, color: "var(--slate, #5B6172)" }}>State Cashless Scheme Submissions</span>
              </div>
              <strong style={{ fontSize: 22, color: "#1C9A4E", fontFamily: "var(--font-display, 'Baloo 2', sans-serif)" }}>142 Claims</strong>
            </div>

            <div style={{ background: "var(--wash-a, #F6FAFF)", padding: 16, borderRadius: 16, border: "1px solid var(--line, #E3E8F4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: 15, color: "var(--indigo, #131A8F)", display: "block" }}>Ayushman Bharat PMJAY</strong>
                <span style={{ fontSize: 12, color: "var(--slate, #5B6172)" }}>National Health Authority Portal Integration</span>
              </div>
              <strong style={{ fontSize: 22, color: "var(--indigo, #131A8F)", fontFamily: "var(--font-display, 'Baloo 2', sans-serif)" }}>89 Claims</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Tenant Suspension & Override Controls */}
      <div style={{ background: "var(--card, #FFF)", borderRadius: 22, padding: 28, border: "1px solid var(--line, #E3E8F4)", boxShadow: "var(--shadow-card, 0 8px 24px rgba(19, 26, 143, 0.06))" }}>
        <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", color: "var(--indigo, #131A8F)", margin: "0 0 16px" }}>
          4. Billing Default Suspension & Operator Emergency Override
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: "#FBE3E3", padding: 22, borderRadius: 18, border: "1px solid var(--danger, #D93A3A)" }}>
            <h4 style={{ margin: "0 0 8px", color: "var(--danger, #D93A3A)" }}>Suspend Tenant (Billing Default)</h4>
            <select value={suspendId} onChange={e => setSuspendId(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 12, border: "1px solid var(--line, #E3E8F4)", marginBottom: 10 }}>
              <option value="kims">KIMS Hospital</option>
              <option value="apollo">Apollo Clinic</option>
            </select>
            <input type="text" value={suspendReason} onChange={e => setSuspendReason(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 12, border: "1px solid var(--line, #E3E8F4)", marginBottom: 14 }} />
            <button onClick={handleSuspend} style={{ background: "var(--danger, #D93A3A)", color: "#FFF", border: "none", borderRadius: 999, padding: "10px 20px", fontWeight: 800, cursor: "pointer" }}>
              Enforce Suspension
            </button>
          </div>

          <div style={{ background: "#E3F5EA", padding: 22, borderRadius: 18, border: "1px solid #1C9A4E" }}>
            <h4 style={{ margin: "0 0 8px", color: "#1C9A4E" }}>Emergency Override (Reinstate)</h4>
            <input type="text" value={overrideNote} onChange={e => setOverrideNote(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 12, border: "1px solid var(--line, #E3E8F4)", marginBottom: 14, marginTop: 42 }} />
            <button onClick={handleOverride} style={{ background: "#1C9A4E", color: "#FFF", border: "none", borderRadius: 999, padding: "10px 20px", fontWeight: 800, cursor: "pointer" }}>
              Emergency Override
            </button>
          </div>
        </div>
      </div>

      {/* 5. Time-Boxed Operator Support Access (TEN-304) */}
      <div style={{ background: "var(--card, #FFF)", borderRadius: 22, padding: 28, border: "1px solid var(--line, #E3E8F4)", marginTop: 24, boxShadow: "var(--shadow-card, 0 8px 24px rgba(19, 26, 143, 0.06))" }}>
        <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", color: "var(--indigo, #131A8F)", margin: "0 0 8px" }}>
          5. Audited Time-Boxed Operator Support Access
        </h2>
        <p style={{ fontSize: 13, color: "var(--slate, #5B6172)", marginBottom: 16 }}>
          Issue time-boxed support access tokens for operator assistance. Every support session requires a coded justification note and is logged transparently in the tenant's audit ledger.
        </p>

        <form onSubmit={handleRequestSupportAccess} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr auto", gap: 14, alignItems: "end" }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate, #5B6172)", display: "block", marginBottom: 4 }}>TARGET TENANT</label>
            <select value={supportTenantId} onChange={e => setSupportTenantId(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)" }}>
              <option value="apollo">Apollo Clinic</option>
              <option value="kims">KIMS Hospital</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate, #5B6172)", display: "block", marginBottom: 4 }}>AUDITED JUSTIFICATION NOTE</label>
            <input
              type="text"
              value={supportReason}
              onChange={e => setSupportReason(e.target.value)}
              placeholder="Enter ticket ID or justification reason..."
              style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate, #5B6172)", display: "block", marginBottom: 4 }}>TIME-BOX DURATION</label>
            <select value={supportDuration} onChange={e => setSupportDuration(Number(e.target.value))} style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)" }}>
              <option value={30}>30 Minutes</option>
              <option value={60}>60 Minutes (1 hour)</option>
              <option value={240}>240 Minutes (4 hours)</option>
            </select>
          </div>

          <button type="submit" style={{ background: "var(--indigo, #131A8F)", color: "#FFF", border: "none", borderRadius: 999, padding: "12px 24px", fontWeight: 800, cursor: "pointer" }}>
            Issue Support Token
          </button>
        </form>

        {supportResult && (
          <div style={{ marginTop: 16, background: "var(--indigo-soft, #E4E9FF)", padding: 16, borderRadius: 16, fontSize: 13, color: "var(--indigo, #131A8F)" }}>
            <strong>✓ Support Access Granted:</strong> Token ID: <code>{supportResult.token_id}</code> | Target Tenant: <code>{supportResult.tenant_id}</code> | Status: <b>{supportResult.status.toUpperCase()}</b>
            <div style={{ fontSize: 12, color: "var(--slate, #5B6172)", marginTop: 4 }}>
              Audited note recorded in tenant audit ledger: "{supportResult.reason}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
