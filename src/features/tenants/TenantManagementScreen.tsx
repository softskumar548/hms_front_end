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
          background: "linear-gradient(135deg, var(--indigo-deep) 0%, var(--indigo) 100%)",
          color: "#FFF",
          borderRadius: "var(--r-card, 12px)",
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", margin: 0, fontSize: 26, fontWeight: 700 }}>
            Platform Control Center — Subscribed Tenants
          </h1>
          <p style={{ margin: "4px 0 0", color: "var(--indigo-soft)", fontSize: 13.5, opacity: 0.9 }}>
            Multi-tenant SaaS provisioning, staff enrollment, and setup wizard lifecycle management
          </p>
        </div>
        <button
          onClick={() => navigate("/onboarding?mode=new")}
          style={{
            background: "var(--cyan)",
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

      {toastMessage && (
        <div style={{ background: "#E3F5EA", color: "#1C9A4E", padding: "12px 18px", borderRadius: 12, fontWeight: 700 }}>
          {toastMessage}
        </div>
      )}

      {error && (
        <div style={{ background: "#FBE3E3", color: "var(--danger)", padding: "12px 18px", borderRadius: 12, fontWeight: 700 }}>
          {error}
        </div>
      )}

      {/* Shared Tenant Data Table */}
      {loading ? (
        <div style={{ padding: 36, textAlign: "center", color: "var(--indigo)", fontWeight: 700 }}>
          Loading tenants list...
        </div>
      ) : (
        <TenantDataTable tenants={tenants} token={token} onRefresh={loadTenants} />
      )}
    </div>
  );
};
