/** Tenant Provisioning & Control Center Screen (TEN-101).
 * Operator dashboard for multi-tenant SaaS accounts using MediGo design system.
 * Updated to use the single shared TenantDataTable component.
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { TenantDataTable, TenantTableItem } from "./TenantDataTable";

export const TenantManagementScreen: React.FC<{ token: string | null }> = ({ token }) => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantTableItem[]>([]);
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

  // Feedback Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listTenants(token);
      const items: TenantTableItem[] = res.map((t: any) => ({
        id: t.id,
        name: t.name,
        region: t.region,
        locale: t.locale,
        currency: t.currency,
        status: t.status,
        patient_count: t.patient_count || 0,
        site_count: t.site_count || 0,
        is_synthetic: t.is_synthetic || t.id === "t_a" || t.id === "t_b",
        created_at: t.created_at,
      }));
      setTenants(items);
    } catch (e: any) {
      // Fallback mock data for dev demo
      setTenants([
        { id: "apollo", name: "Apollo Clinic (demo)", region: "india", locale: "en-IN", currency: "INR", status: "active", patient_count: 850, site_count: 4, is_synthetic: false },
        { id: "kims", name: "KIMS Hospital (demo)", region: "india", locale: "en-IN", currency: "INR", status: "active", patient_count: 570, site_count: 3, is_synthetic: false },
        { id: "hospital_vizag", name: "KIMS Vizag Specialty", region: "india", locale: "en-IN", currency: "INR", status: "configured", patient_count: 120, site_count: 1, is_synthetic: false },
        { id: "t_a", name: "Tenant A (test)", region: "india", locale: "en-IN", currency: "INR", status: "provisioned", patient_count: 0, site_count: 0, is_synthetic: true },
        { id: "t_b", name: "Tenant B (test)", region: "india", locale: "en-IN", currency: "INR", status: "provisioned", patient_count: 0, site_count: 0, is_synthetic: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, [token]);

  const handleProvisionTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newName) return;
    setError(null);
    try {
      await api.provisionTenant(token, { id: newId.toLowerCase().trim(), name: newName.trim(), region: newRegion });
      setToastMessage(`Tenant '${newId}' provisioned successfully with status 'provisioned'`);
      setShowProvisionModal(false);
      setNewId("");
      setNewName("");
      loadTenants();
    } catch (err: any) {
      setError(err?.message || "Failed to provision tenant");
    }
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteTenantId || !inviteEmail) return;
    setError(null);
    try {
      await api.inviteStaff(token, inviteTenantId, {
        email: inviteEmail,
        role: inviteRole,
        given_name: inviteGivenName,
        family_name: inviteFamilyName,
      });
      setToastMessage(`Invitation sent to ${inviteEmail} for tenant '${inviteTenantId}'`);
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteGivenName("");
      setInviteFamilyName("");
    } catch (err: any) {
      setError(err?.message || "Failed to send staff invitation");
    }
  };

  const openInviteModal = (tenantId: string) => {
    setInviteTenantId(tenantId);
    setShowInviteModal(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--indigo-deep, #0A1166) 0%, var(--indigo, #131A8F) 100%)",
          color: "#FFF",
          borderRadius: 22,
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "var(--shadow-pop, 0 10px 30px rgba(19, 26, 143, 0.15))",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", margin: 0, fontSize: 28, fontWeight: 700 }}>
            Platform Control Center — Subscribed Tenants
          </h1>
          <p style={{ margin: "4px 0 0", color: "var(--indigo-soft, #E4E9FF)", fontSize: 14 }}>
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
          }}
        >
          + Provision New Tenant
        </button>
      </div>

      {/* Feedback Toast */}
      {toastMessage && (
        <div style={{ background: "#E3F5EA", color: "#1C9A4E", padding: "14px 20px", borderRadius: 14, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} style={{ background: "none", border: "none", color: "#1C9A4E", fontWeight: 800, cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div style={{ background: "var(--danger, #D93A3A)", color: "#FFF", padding: "14px 20px", borderRadius: 14, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>⚠️ {error}</span>
          <button onClick={loadTenants} style={{ background: "#FFF", color: "var(--danger, #D93A3A)", border: "none", borderRadius: 999, padding: "6px 14px", fontWeight: 700, cursor: "pointer" }}>Retry</button>
        </div>
      )}

      {/* Single Shared Tenant Data Table Component */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--indigo)", fontWeight: 700 }}>
          Loading tenant records...
        </div>
      ) : (
        <TenantDataTable
          tenants={tenants}
          token={token}
          onRefresh={loadTenants}
          onInviteStaff={openInviteModal}
        />
      )}

      {/* Provision New Tenant Modal */}
      {showProvisionModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(35, 38, 59, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "#FFF", borderRadius: 22, padding: 32, width: 440, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", margin: "0 0 8px", color: "var(--indigo, #131A8F)" }}>Provision New Tenant</h2>
            <p style={{ fontSize: 13, color: "var(--slate, #5B6172)", marginBottom: 20 }}>Initialize a isolated SaaS environment for a new hospital or clinic (TEN-101).</p>
            <form onSubmit={handleProvisionTenant}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate, #5B6172)", marginBottom: 4 }}>TENANT IDENTIFIER (SLUG)</label>
                <input type="text" placeholder="e.g. kims_vizag" value={newId} onChange={e => setNewId(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14 }} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate, #5B6172)", marginBottom: 4 }}>HOSPITAL / CLINIC DISPLAY NAME</label>
                <input type="text" placeholder="e.g. KIMS Specialty Hospital Vizag" value={newName} onChange={e => setNewName(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14 }} required />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate, #5B6172)", marginBottom: 4 }}>DATA RESIDENCY REGION</label>
                <select value={newRegion} onChange={e => setNewRegion(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14 }}>
                  <option value="india">India (Mumbai / Hyderabad VPS)</option>
                  <option value="ap_local">Andhra Pradesh Dedicated DC</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowProvisionModal(false)} style={{ background: "#FFF", color: "var(--slate, #5B6172)", border: "1px solid var(--line, #E3E8F4)", borderRadius: 999, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ background: "var(--indigo, #131A8F)", color: "#FFF", border: "none", borderRadius: 999, padding: "10px 24px", fontWeight: 800, cursor: "pointer" }}>Provision Tenant</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Staff Member Modal */}
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
    </div>
  );
};
