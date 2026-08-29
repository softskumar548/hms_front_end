import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

export interface TenantTableItem {
  id: string;
  name: string;
  region?: string;
  locale?: string;
  currency?: string;
  status: "draft" | "provisioned" | "configured" | "active" | "suspended" | string;
  patient_count?: number;
  site_count?: number;
  is_synthetic?: boolean;
  created_at?: string;
}

// MediGo / Theme C StatusPill (Sharp rounded-rect 6px radius)
export const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const getPillStyle = (st: string) => {
    switch (st) {
      case "active":
        return { bg: "#DCFCE7", color: "#15803D", label: "Active (LIVE)" };
      case "configured":
        return { bg: "#E0F2FE", color: "#0369A1", label: "Configured" };
      case "provisioned":
        return { bg: "#FEF3C7", color: "#B45309", label: "Provisioned" };
      case "suspended":
        return { bg: "#FEE2E2", color: "#B91C1C", label: "Suspended" };
      default:
        return { bg: "var(--indigo-soft, #E8EEF5)", color: "var(--indigo, #1E3A5F)", label: st };
    }
  };
  const ps = getPillStyle(status);
  return (
    <span
      style={{
        background: ps.bg,
        color: ps.color,
        borderRadius: "var(--r-pill, 6px)",
        padding: "4px 10px",
        fontSize: 12,
        fontWeight: 700,
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

interface TenantDataTableProps {
  tenants: TenantTableItem[];
  token: string | null;
  onRefresh: () => void;
  onInviteStaff?: (tenantId: string) => void;
}

export const TenantDataTable: React.FC<TenantDataTableProps> = ({
  tenants,
  token,
  onRefresh,
  onInviteStaff,
}) => {
  const navigate = useNavigate();

  // Search, Filter, Sort, Synthetic Toggle State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hideSynthetic, setHideSynthetic] = useState(true);
  const [sortBy, setSortBy] = useState<"name" | "status" | "patients" | "sites">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Offboard Confirmation Modal State
  const [showOffboardModal, setShowOffboardModal] = useState(false);
  const [offboardTargetId, setOffboardTargetId] = useState("");
  const [offboardConfirmId, setOffboardConfirmId] = useState("");
  const [offboardError, setOffboardError] = useState<string | null>(null);

  // Subscription & Quotas Modal State
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaTargetTenant, setQuotaTargetTenant] = useState<TenantTableItem | null>(null);
  const [quotaData, setQuotaData] = useState<any>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [selectedPlanTier, setSelectedPlanTier] = useState<"starter" | "growth" | "enterprise">("growth");
  const [upgradeSuccess, setUpgradeSuccess] = useState<string | null>(null);

  // Close modals on Escape key press
  useEffect(() => {
    if (!showOffboardModal && !showQuotaModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowOffboardModal(false);
        setShowQuotaModal(false);
        setOffboardConfirmId("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showOffboardModal, showQuotaModal]);

  const openQuotaModal = async (tenantItem: TenantTableItem) => {
    setQuotaTargetTenant(tenantItem);
    setShowQuotaModal(true);
    setQuotaLoading(true);
    setUpgradeSuccess(null);
    try {
      const data = await api.getTenantQuotas(token, tenantItem.id);
      setQuotaData(data);
    } catch {
      setQuotaData({
        tenant_id: tenantItem.id,
        package_name: "HMS Basic Subscription Annual",
        expiry_date: "25/07/2026",
        admins_limit: 1,
        admins_used: 1,
        staff_limit: 3,
        staff_used: 2,
        doctors_limit: 5,
        doctors_used: 2,
        beds_limit: 15,
        beds_used: 6,
        sms_count_limit: 200,
        sms_count_used: 42,
        email_count_limit: 500,
        email_count_used: 118,
        whatsapp_count_limit: 1000,
        whatsapp_count_used: 312,
      });
    } finally {
      setQuotaLoading(false);
    }
  };

  const handleUpgradePlan = async () => {
    if (!quotaTargetTenant) return;
    try {
      const res = await api.updateTenantPlan(token, quotaTargetTenant.id, {
        plan: selectedPlanTier,
        billing_cycle: "monthly",
      });
      setQuotaData(res);
      setUpgradeSuccess(`Successfully upgraded ${quotaTargetTenant.name} to ${res.package_name || selectedPlanTier}!`);
      onRefresh();
    } catch (e: any) {
      alert("Failed to update subscription plan: " + (e.message || "Unknown error"));
    }
  };


  const handleOffboardTenant = async () => {
    if (offboardConfirmId !== offboardTargetId) return;
    setOffboardError(null);
    try {
      await api.offboardTenant(token, offboardTargetId);
      setShowOffboardModal(false);
      setOffboardConfirmId("");
      onRefresh();
    } catch (err: any) {
      setOffboardError(err?.message || "Offboard cascade delete failed.");
    }
  };

  // Pure Boolean Filter Logic (Fix B2: NO string matching fallbacks)
  const filteredTenants = tenants.filter((t) => {
    if (hideSynthetic && t.is_synthetic) {
      return false;
    }
    if (searchTerm) {
      const matchName = t.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchId = t.id.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchName && !matchId) return false;
    }
    if (statusFilter !== "all" && t.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const sortedTenants = [...filteredTenants].sort((a, b) => {
    let compA: any = a.name;
    let compB: any = b.name;

    if (sortBy === "status") {
      compA = a.status;
      compB = b.status;
    } else if (sortBy === "patients") {
      compA = a.patient_count || 0;
      compB = b.patient_count || 0;
    } else if (sortBy === "sites") {
      compA = a.site_count || 0;
      compB = b.site_count || 0;
    }

    if (compA < compB) return sortOrder === "asc" ? -1 : 1;
    if (compA > compB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: "name" | "status" | "patients" | "sites") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Controls Bar: Search, Status Filter, Synthetic Toggle */}
      <div
        style={{
          background: "#FFFFFF",
          padding: "14px 18px",
          borderRadius: "var(--r-card, 8px)",
          border: "1px solid var(--line, #E2E8F0)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 260 }}>
          <input
            type="text"
            placeholder="🔍 Search hospital name or tenant ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 14px",
              borderRadius: "var(--r-field, 6px)",
              border: "1px solid var(--line, #E2E8F0)",
              fontSize: 13.5,
              background: "#F8FAFC",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", letterSpacing: "0.05em" }}>STATUS:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--r-field, 6px)",
                border: "1px solid var(--line, #E2E8F0)",
                fontSize: 13,
                fontWeight: 600,
                background: "#FFF",
                color: "var(--indigo)",
                cursor: "pointer",
              }}
            >
              <option value="all">All States</option>
              <option value="active">Active (Live)</option>
              <option value="configured">Configured</option>
              <option value="provisioned">Provisioned</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 700,
              color: "var(--slate)",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={hideSynthetic}
              onChange={(e) => setHideSynthetic(e.target.checked)}
              style={{ accentColor: "var(--indigo)", width: 15, height: 15 }}
            />
            Hide Synthetic / Test Debris
          </label>
        </div>
      </div>

      {/* Main Data Table */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "var(--r-card, 8px)",
          border: "1px solid var(--line, #E2E8F0)",
          overflow: "hidden",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#F1F5F9", borderBottom: "1px solid var(--line, #E2E8F0)" }}>
              <th
                onClick={() => toggleSort("name")}
                style={{ padding: "14px 18px", fontSize: 11, fontWeight: 800, color: "var(--slate)", cursor: "pointer", letterSpacing: "0.05em" }}
              >
                HOSPITAL / TENANT NAME {sortBy === "name" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                onClick={() => toggleSort("status")}
                style={{ padding: "14px 18px", fontSize: 11, fontWeight: 800, color: "var(--slate)", cursor: "pointer", letterSpacing: "0.05em" }}
              >
                STATUS {sortBy === "status" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                onClick={() => toggleSort("patients")}
                style={{ padding: "14px 18px", fontSize: 11, fontWeight: 800, color: "var(--slate)", cursor: "pointer", letterSpacing: "0.05em" }}
              >
                PATIENTS {sortBy === "patients" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                onClick={() => toggleSort("sites")}
                style={{ padding: "14px 18px", fontSize: 11, fontWeight: 800, color: "var(--slate)", cursor: "pointer", letterSpacing: "0.05em" }}
              >
                SITES {sortBy === "sites" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th style={{ padding: "14px 18px", fontSize: 11, fontWeight: 800, color: "var(--slate)", textAlign: "right", letterSpacing: "0.05em" }}>
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTenants.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 36, textAlign: "center", color: "var(--slate)", fontSize: 14 }}>
                  No matching tenants found.
                </td>
              </tr>
            ) : (
              sortedTenants.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: "1px solid var(--line, #E2E8F0)",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--ink)" }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "var(--slate)", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <code>{item.id}</code>
                      {item.is_synthetic && (
                        <span style={{ fontSize: 10, background: "#FEF3C7", color: "#B45309", padding: "1px 6px", borderRadius: 4, fontWeight: 800 }}>
                          SYNTHETIC
                        </span>
                      )}
                    </div>
                  </td>

                  <td style={{ padding: "14px 18px" }}>
                    <StatusPill status={item.status} />
                  </td>

                  <td style={{ padding: "14px 18px", fontWeight: 700, fontSize: 15, color: "var(--indigo)" }}>
                    {item.patient_count ?? "0"}
                  </td>

                  <td style={{ padding: "14px 18px", fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>
                    {item.site_count ?? "0"}
                  </td>

                  <td style={{ padding: "14px 18px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button
                        onClick={() => navigate(`/onboarding?tenant_id=${item.id}`)}
                        style={{
                          background: item.status === "provisioned" ? "var(--cyan)" : "var(--indigo-soft)",
                          color: item.status === "provisioned" ? "#04364A" : "var(--indigo)",
                          border: item.status === "provisioned" ? "none" : "1px solid var(--line)",
                          borderRadius: "var(--r-pill)",
                          padding: "5px 14px",
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        {item.status === "provisioned" ? "⚡ Complete Setup →" : "Onboarding Setup"}
                      </button>

                      <button
                        type="button"
                        onClick={() => openQuotaModal(item)}
                        style={{
                          background: "var(--indigo-soft)",
                          color: "var(--indigo)",
                          border: "1px solid var(--line)",
                          borderRadius: "var(--r-pill)",
                          padding: "5px 12px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        💳 Quotas
                      </button>

                      <button
                        onClick={() => {
                          setOffboardTargetId(item.id);
                          setOffboardConfirmId("");
                          setOffboardError(null);
                          setShowOffboardModal(true);
                        }}

                        style={{
                          background: "#FEE2E2",
                          color: "#B91C1C",
                          border: "none",
                          borderRadius: "var(--r-pill, 6px)",
                          padding: "5px 12px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Offboard
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Offboard Confirmation Modal (T3-01 Safeguard Intact) */}
      {showOffboardModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => {
            setShowOffboardModal(false);
            setOffboardConfirmId("");
          }}
        >
          <div
            style={{ background: "#FFF", borderRadius: "var(--r-card, 8px)", padding: 28, width: 480, boxShadow: "var(--shadow-pop)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ color: "var(--danger, #DC2626)", margin: 0, fontSize: 20, fontWeight: 700 }}>
                ⚠️ Confirm Irreversible Tenant Offboarding
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowOffboardModal(false);
                  setOffboardConfirmId("");
                }}
                aria-label="Close modal"
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--slate)" }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: 14, color: "var(--ink)", marginBottom: 12 }}>
              Are you sure you want to offboard and <b>cascade-delete</b> tenant <code>{offboardTargetId}</code>?
            </p>

            <div style={{ fontSize: 13, color: "var(--danger)", background: "#FEE2E2", padding: 14, borderRadius: 6, marginBottom: 20, border: "1px solid #B91C1C" }}>
              <strong>CRITICAL WARNING:</strong> This will execute an atomic, topological cascade deletion across all patient records, encounters, appointments, prescriptions, and tenant-scoped data in PostgreSQL. This action is <b>permanent and irreversible</b>.
            </div>

            {offboardError && (
              <div style={{ background: "var(--danger)", color: "#FFF", padding: 10, borderRadius: 6, marginBottom: 16, fontSize: 13, fontWeight: 700 }}>
                {offboardError}
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate)", marginBottom: 6 }}>
                TO CONFIRM, TYPE TENANT ID <code>{offboardTargetId}</code> BELOW:
              </label>
              <input
                autoFocus
                type="text"
                placeholder={`Type '${offboardTargetId}' to unlock delete button`}
                value={offboardConfirmId}
                onChange={(e) => setOffboardConfirmId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && offboardConfirmId === offboardTargetId) handleOffboardTenant();
                }}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 14 }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => {
                  setShowOffboardModal(false);
                  setOffboardConfirmId("");
                }}
                style={{ background: "#FFF", color: "var(--slate)", border: "1px solid var(--line)", borderRadius: 6, padding: "8px 16px", fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={offboardConfirmId !== offboardTargetId}
                onClick={handleOffboardTenant}
                style={{
                  background: offboardConfirmId === offboardTargetId ? "var(--danger)" : "#94A3B8",
                  color: "#FFF",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 20px",
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

      {/* Subscription & Quota Inspector Modal (TEN-301) */}
      {showQuotaModal && quotaTargetTenant && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(10, 17, 102, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowQuotaModal(false)}
        >
          <div
            style={{
              background: "#FFF",
              borderRadius: 16,
              padding: 28,
              width: "100%",
              maxWidth: 680,
              boxShadow: "var(--shadow-pop, 0 18px 50px rgba(10,17,102,.22))",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ color: "var(--indigo)", margin: 0, fontSize: 20, fontWeight: 800, fontFamily: "var(--font-display)" }}>
                  💳 Subscription Package & Quota Metering
                </h2>
                <span style={{ fontSize: 13, color: "var(--slate)" }}>
                  Tenant: <strong>{quotaTargetTenant.name}</strong> (<code>{quotaTargetTenant.id}</code>)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowQuotaModal(false)}
                aria-label="Close modal"
                style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--slate)" }}
              >
                ✕
              </button>
            </div>

            {upgradeSuccess && (
              <div style={{ background: "#DCFCE7", color: "#15803D", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13, fontWeight: 700 }}>
                ✓ {upgradeSuccess}
              </div>
            )}

            {/* 2-Column Reference Subscription Summary Card */}
            <div
              style={{
                background: "var(--wash-a)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: "18px 22px",
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gap: 20,
                fontSize: 13.5,
                lineHeight: 1.8,
                marginBottom: 20,
              }}
            >
              {/* Left Column */}
              <div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--ink)", width: 130 }}>Package Name :</strong>
                  <span style={{ color: "var(--indigo)", fontWeight: 700 }}>
                    {quotaData?.package_name || quotaData?.plan || "HMS Basic Subscription Annual"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 130 }}>Expiry Date :</strong>
                  <span>{quotaData?.expiry_date || "25/07/2026"}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 130 }}>Admins :</strong>
                  <span>{quotaData?.admins_used ?? 1}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 130 }}>Staff :</strong>
                  <span>{quotaData?.staff_used ?? 3}</span>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 140 }}>Beds Limit :</strong>
                  <span>{quotaData?.beds_limit ?? 15}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 140 }}>Doctors Limit :</strong>
                  <span>{quotaData?.doctors_limit ?? 5}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 140 }}>SMS Count :</strong>
                  <span>{quotaData?.sms_count_limit ?? 200}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 140 }}>Email Count :</strong>
                  <span>{quotaData?.email_count_limit ?? 500}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <strong style={{ color: "var(--slate)", width: 140 }}>Whatsapp Count :</strong>
                  <span>{quotaData?.whatsapp_count_limit ?? 1000}</span>
                </div>
              </div>
            </div>

            {/* Operator Plan Upgrade Action Bar */}
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--slate)" }}>Change Plan Tier:</label>
                <select
                  value={selectedPlanTier}
                  onChange={(e: any) => setSelectedPlanTier(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--line)",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <option value="starter">Starter (Clinic) · ₹1,999/mo</option>
                  <option value="growth">Growth (Polyclinic) · ₹7,999/mo</option>
                  <option value="enterprise">Enterprise (Hospital) · ₹24,999/mo</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowQuotaModal(false)}
                  style={{
                    background: "#FFF",
                    color: "var(--slate)",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--r-pill)",
                    padding: "6px 16px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleUpgradePlan}
                  style={{
                    background: "var(--indigo)",
                    color: "#FFF",
                    border: "none",
                    borderRadius: "var(--r-pill)",
                    padding: "6px 18px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Apply Plan Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

