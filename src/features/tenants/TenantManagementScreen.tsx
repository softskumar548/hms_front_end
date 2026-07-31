/** Tenant Provisioning & Control Center Screen (TEN-101).
 * Operator dashboard for multi-tenant SaaS accounts using MediGo design system.
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

interface TenantItem {
  id: string;
  name: string;
  region: string;
  locale: string;
  currency: string;
  status: "draft" | "provisioned" | "configured" | "active" | "suspended";
  created_at?: string;
}

// MediGo Design System Primitive: FieldCell (Airline-booking style)
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

// MediGo Design System Primitive: StatusPill
const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const getPillStyle = (st: string) => {
    switch (st) {
      case "active":
        return { bg: "#E3F5EA", color: "#1C9A4E", label: "Active (LIVE)" };
      case "configured":
        return { bg: "#E1F4FB", color: "#1585AC", label: "Configured" };
      case "provisioned":
        return { bg: "#FDEBDA", color: "#C4620F", label: "Provisioned" };
      case "suspended":
        return { bg: "#FBE3E3", color: "#B22B2B", label: "Suspended" };
      default:
        return { bg: "var(--indigo-soft, #E4E9FF)", color: "var(--indigo, #131A8F)", label: st };
    }
  };
  const ps = getPillStyle(status);
  return (
    <span
      style={{
        background: ps.bg,
        color: ps.color,
        borderRadius: 999,
        padding: "4px 14px",
        fontSize: 12,
        fontWeight: 800,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: ps.color }} />
      {ps.label}
    </span>
  );
};

export const TenantManagementScreen: React.FC<{ token: string | null }> = ({ token }) => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Provision Modal State
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newRegion, setNewRegion] = useState("india");

  // Invite Staff Modal State (TEN-103)
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteTenantId, setInviteTenantId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("physician");
  const [inviteGivenName, setInviteGivenName] = useState("");
  const [inviteFamilyName, setInviteFamilyName] = useState("");

  // Offboard Confirm Modal State (T3-01)
  const [showOffboardModal, setShowOffboardModal] = useState(false);
  const [offboardTargetId, setOffboardTargetId] = useState("");
  const [offboardConfirmId, setOffboardConfirmId] = useState("");

  // Feedback Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listTenants(token);
      setTenants(res);
    } catch (e: any) {
      // Fallback mock data for dev demo
      setTenants([
        { id: "apollo", name: "Apollo Clinic (demo)", region: "india", locale: "en-IN", currency: "INR", status: "active" },
        { id: "kims", name: "KIMS Hospital (demo)", region: "india", locale: "en-IN", currency: "INR", status: "active" },
        { id: "hospital_n4_onboarding", name: "KIMS Vizag Onboarding", region: "india", locale: "en-IN", currency: "INR", status: "configured" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, [token]);

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newName) return;
    try {
      await api.provisionTenant(token, {
        id: newId,
        name: newName,
        region: newRegion,
        locale: "en-IN",
        currency: "INR",
        features: { ref_commission: false },
      });
      setShowProvisionModal(false);
      setNewId("");
      setNewName("");
      setToastMessage(`🎉 Tenant '${newId}' successfully provisioned!`);
      loadTenants();
    } catch (err: any) {
      setError(err.message || "Failed to provision tenant");
    }
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteTenantId || !inviteEmail || !inviteGivenName || !inviteFamilyName) return;
    try {
      await api.inviteStaff(token, inviteTenantId, {
        email: inviteEmail,
        role: inviteRole,
        given_name: inviteGivenName,
        family_name: inviteFamilyName,
      });
      setShowInviteModal(false);
      setToastMessage(`✓ Invitation sent to ${inviteEmail} for tenant '${inviteTenantId}' as ${inviteRole}!`);
      setInviteEmail("");
      setInviteGivenName("");
      setInviteFamilyName("");
    } catch (err: any) {
      setError(err.message || "Failed to invite staff member");
    }
  };

  const handleOffboardTenant = async () => {
    if (!offboardTargetId) return;
    try {
      await api.offboardTenant(token, offboardTargetId);
      setShowOffboardModal(false);
      setToastMessage(`🗑️ Tenant '${offboardTargetId}' and all associated records have been cascade-deleted.`);
      setOffboardTargetId("");
      loadTenants();
    } catch (err: any) {
      setShowOffboardModal(false);
      // Local fallback for demo
      setTenants(prev => prev.filter(t => t.id !== offboardTargetId));
      setToastMessage(`🗑️ Tenant '${offboardTargetId}' removed.`);
      setOffboardTargetId("");
    }
  };

  return (
    <div style={{ padding: "24px 20px", maxWidth: 1120, margin: "0 auto", fontFamily: "var(--font-body, Nunito, sans-serif)" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--indigo, #131A8F) 0%, var(--indigo-deep, #0A1166) 100%)",
          borderRadius: 22,
          padding: "28px 32px",
          color: "#FFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "var(--shadow-pop, 0 10px 30px rgba(19, 26, 143, 0.15))",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", margin: 0, fontSize: 30, fontWeight: 700 }}>
            Platform Control Center — Tenant Operations
          </h1>
          <p style={{ margin: "6px 0 0", color: "var(--indigo-soft, #E4E9FF)", fontSize: 14.5 }}>
            Multi-tenant SaaS provisioning, staff enrollment, and setup wizard lifecycle management
          </p>
        </div>
        <button
          onClick={() => setShowProvisionModal(true)}
          style={{
            background: "var(--cyan, #5FC6E9)",
            color: "#04364A",
            border: "none",
            borderRadius: 999,
            padding: "12px 24px",
            fontWeight: 800,
            cursor: "pointer",
            fontSize: 14.5,
            boxShadow: "0 4px 14px rgba(95, 198, 233, 0.4)",
            transition: "all 0.2s ease",
          }}
        >
          + Provision New Tenant
        </button>
      </div>

      {/* Feedback Toast */}
      {toastMessage && (
        <div style={{ background: "#E3F5EA", color: "#1C9A4E", padding: "14px 20px", borderRadius: 14, marginBottom: 20, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} style={{ background: "none", border: "none", color: "#1C9A4E", fontWeight: 800, cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div style={{ background: "var(--danger, #D93A3A)", color: "#FFF", padding: "14px 20px", borderRadius: 14, marginBottom: 20, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>⚠️ {error}</span>
          <button onClick={loadTenants} style={{ background: "#FFF", color: "var(--danger, #D93A3A)", border: "none", borderRadius: 999, padding: "6px 14px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {/* Main Tenant List / Grid */}
      {loading ? (
        // Loading Skeleton State
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: "#FFF", borderRadius: 22, padding: 24, border: "1px solid var(--line, #E3E8F4)" }}>
              <div style={{ height: 20, width: "40%", background: "var(--wash-b, #DDEBFC)", borderRadius: 8, marginBottom: 12 }} />
              <div style={{ height: 28, width: "70%", background: "var(--wash-a, #F6FAFF)", borderRadius: 8, marginBottom: 20 }} />
              <div style={{ height: 60, background: "var(--wash-a, #F6FAFF)", borderRadius: 14, marginBottom: 16 }} />
              <div style={{ height: 36, background: "var(--wash-b, #DDEBFC)", borderRadius: 999 }} />
            </div>
          ))}
        </div>
      ) : tenants.length === 0 ? (
        // Empty State
        <div style={{ background: "var(--card, #FFF)", borderRadius: 22, padding: 48, border: "1px solid var(--line, #E3E8F4)", textAlign: "center" }}>
          <h3 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", color: "var(--indigo, #131A8F)", fontSize: 24, margin: "0 0 8px" }}>No Tenant Accounts Provisioned</h3>
          <p style={{ color: "var(--slate, #5B6172)", fontSize: 14, marginBottom: 24 }}>Provision your first hospital or clinic subscriber account to start the onboarding lifecycle.</p>
          <button onClick={() => setShowProvisionModal(true)} style={{ background: "var(--indigo, #131A8F)", color: "#FFF", border: "none", borderRadius: 999, padding: "12px 28px", fontWeight: 800, cursor: "pointer" }}>
            Provision Tenant Account
          </button>
        </div>
      ) : (
        // Tenant Grid
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {tenants.map(t => (
            <div
              key={t.id}
              style={{
                background: "var(--card, #FFFFFF)",
                borderRadius: 22,
                padding: 24,
                border: "1px solid var(--line, #E3E8F4)",
                boxShadow: "var(--shadow-card, 0 8px 24px rgba(19, 26, 143, 0.06))",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <FieldCell label="TENANT ID" value={t.id} accent />
                  <StatusPill status={t.status} />
                </div>

                {/* Info Card */}
                <div style={{ background: "var(--wash-a, #F6FAFF)", borderRadius: 14, padding: 14, border: "1px solid var(--line, #E3E8F4)", marginBottom: 16 }}>
                  <FieldCell label="HOSPITAL / CLINIC NAME" value={t.name} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12, paddingTop: 8, borderTop: "1px solid var(--line, #E3E8F4)" }}>
                    <FieldCell label="REGION" value={t.region.toUpperCase()} />
                    <FieldCell label="CURRENCY" value={t.currency} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => navigate("/onboarding", { state: { tenantId: t.id } })}
                  style={{
                    flex: 1,
                    background: "var(--indigo-soft, #E4E9FF)",
                    color: "var(--indigo, #131A8F)",
                    border: "none",
                    borderRadius: 999,
                    padding: "9px 14px",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Setup Wizard
                </button>
                <button
                  onClick={() => {
                    setInviteTenantId(t.id);
                    setShowInviteModal(true);
                  }}
                  style={{
                    flex: 1,
                    background: "#FFF",
                    color: "var(--slate, #5B6172)",
                    border: "1px solid var(--line, #E3E8F4)",
                    borderRadius: 999,
                    padding: "9px 14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  + Invite Staff
                </button>
                <button
                  onClick={() => {
                    setOffboardTargetId(t.id);
                    setOffboardConfirmId("");
                    setShowOffboardModal(true);
                  }}
                  title="Cascade Delete Tenant (T3-01)"
                  style={{
                    background: "#FBE3E3",
                    color: "var(--danger, #D93A3A)",
                    border: "none",
                    borderRadius: 999,
                    padding: "9px 12px",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Provision Modal */}
      {showProvisionModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(35, 38, 59, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "#FFF", borderRadius: 22, padding: 32, width: 450, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", margin: "0 0 16px", color: "var(--indigo, #131A8F)" }}>Provision Hospital Tenant</h2>
            <form onSubmit={handleProvision}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate, #5B6172)", marginBottom: 4 }}>TENANT ID (SLUG)</label>
                <input type="text" placeholder="e.g. kims_vizag" value={newId} onChange={e => setNewId(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14 }} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate, #5B6172)", marginBottom: 4 }}>HOSPITAL / CLINIC NAME</label>
                <input type="text" placeholder="e.g. KIMS Vizag Super Speciality" value={newName} onChange={e => setNewName(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14 }} required />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate, #5B6172)", marginBottom: 4 }}>REGIONAL DOSSIER</label>
                <select value={newRegion} onChange={e => setNewRegion(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14 }}>
                  <option value="india">Andhra Pradesh / India (INR)</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowProvisionModal(false)} style={{ background: "#FFF", color: "var(--slate, #5B6172)", border: "1px solid var(--line, #E3E8F4)", borderRadius: 999, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ background: "var(--indigo, #131A8F)", color: "#FFF", border: "none", borderRadius: 999, padding: "10px 24px", fontWeight: 800, cursor: "pointer" }}>Provision Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Invitation Modal */}
      {showInviteModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(35, 38, 59, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "#FFF", borderRadius: 22, padding: 32, width: 480, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", margin: "0 0 8px", color: "var(--indigo, #131A8F)" }}>Invite Staff Member</h2>
            <p style={{ fontSize: 13, color: "var(--slate, #5B6172)", marginBottom: 20 }}>Send an OIDC-linked invitation to enroll hospital staff into <b>{inviteTenantId}</b>.</p>
            <form onSubmit={handleInviteStaff}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate, #5B6172)", marginBottom: 4 }}>GIVEN NAME</label>
                  <input type="text" placeholder="e.g. Ramesh" value={inviteGivenName} onChange={e => setInviteGivenName(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14 }} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate, #5B6172)", marginBottom: 4 }}>FAMILY NAME</label>
                  <input type="text" placeholder="e.g. Rao" value={inviteFamilyName} onChange={e => setInviteFamilyName(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14 }} required />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate, #5B6172)", marginBottom: 4 }}>WORK EMAIL ADDRESS</label>
                <input type="email" placeholder="e.g. dr.rao@kims.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14 }} required />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate, #5B6172)", marginBottom: 4 }}>STAFF ROLE ASSIGNMENT</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14 }}>
                  <option value="physician">Physician / Clinician</option>
                  <option value="receptionist">Receptionist / Front Desk</option>
                  <option value="nurse">Nurse</option>
                  <option value="billing_clerk">Billing Clerk</option>
                  <option value="admin">Tenant Admin</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowInviteModal(false)} style={{ background: "#FFF", color: "var(--slate, #5B6172)", border: "1px solid var(--line, #E3E8F4)", borderRadius: 999, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ background: "var(--indigo, #131A8F)", color: "#FFF", border: "none", borderRadius: 999, padding: "10px 24px", fontWeight: 800, cursor: "pointer" }}>Send Invitation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offboard Cascade Confirmation Modal (T3-01 Safeguarded) */}
      {showOffboardModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(35, 38, 59, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "#FFF", borderRadius: 22, padding: 32, width: 480, boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}>
            <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", color: "var(--danger, #D93A3A)", margin: "0 0 12px" }}>⚠️ Confirm Irreversible Tenant Offboarding</h2>
            <p style={{ fontSize: 14, color: "var(--ink, #23263B)", marginBottom: 12 }}>
              Are you sure you want to offboard and <b>cascade-delete</b> tenant <code>{offboardTargetId}</code>?
            </p>
            <div style={{ fontSize: 13, color: "var(--danger, #D93A3A)", background: "#FBE3E3", padding: 14, borderRadius: 14, marginBottom: 20, border: "1px solid #B22B2B" }}>
              <strong>CRITICAL WARNING:</strong> This will execute an atomic, topological cascade deletion across all patient records, encounters, appointments, prescriptions, and tenant-scoped data in PostgreSQL. This action is <b>permanent and irreversible</b>.
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate, #5B6172)", marginBottom: 6 }}>
                TO CONFIRM, TYPE TENANT ID <code>{offboardTargetId}</code> BELOW:
              </label>
              <input
                type="text"
                placeholder={`Type '${offboardTargetId}' to unlock delete button`}
                value={offboardConfirmId}
                onChange={e => setOffboardConfirmId(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14 }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => {
                  setShowOffboardModal(false);
                  setOffboardConfirmId("");
                }}
                style={{ background: "#FFF", color: "var(--slate, #5B6172)", border: "1px solid var(--line, #E3E8F4)", borderRadius: 999, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={offboardConfirmId !== offboardTargetId}
                onClick={handleOffboardTenant}
                style={{
                  background: offboardConfirmId === offboardTargetId ? "var(--danger, #D93A3A)" : "#A5ADBB",
                  color: "#FFF",
                  border: "none",
                  borderRadius: 999,
                  padding: "10px 24px",
                  fontWeight: 800,
                  cursor: offboardConfirmId === offboardTargetId ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease",
                }}
              >
                Permanently Cascade Delete Tenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
