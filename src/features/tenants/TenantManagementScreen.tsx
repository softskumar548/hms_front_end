/** Tenant Provisioning & Control Center Screen (TEN-101).
 * Operator dashboard for multi-tenant SaaS accounts.
 */
import React, { useEffect, useState } from "react";
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

export const TenantManagementScreen: React.FC<{ token: string | null }> = ({ token }) => {
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newRegion, setNewRegion] = useState("india");
  const [error, setError] = useState<string | null>(null);

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
        { id: "hospital_n4_onboarding", name: "KIMS Vizag Onboarding", region: "india", locale: "en-IN", currency: "INR", status: "configured" }
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
        features: { ref_commission: false }
      });
      setShowProvisionModal(false);
      setNewId("");
      setNewName("");
      loadTenants();
    } catch (err: any) {
      setError(err.message || "Failed to provision tenant");
    }
  };

  const statusColor = (st: string) => {
    switch (st) {
      case "active": return { bg: "#E3F5EA", color: "#1C9A4E", label: "Active (LIVE)" };
      case "configured": return { bg: "#E1F4FB", color: "#1585AC", label: "Configured" };
      case "provisioned": return { bg: "#FDEBDA", color: "#C4620F", label: "Provisioned" };
      case "suspended": return { bg: "#FBE3E3", color: "#B22B2B", label: "Suspended" };
      default: return { bg: "#E4E9FF", color: "#131A8F", label: st };
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto", fontFamily: "var(--font-body, Nunito, sans-serif)" }}>
      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)",
        borderRadius: 22,
        padding: "24px 32px",
        color: "#FFF",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 10px 30px rgba(19, 26, 143, 0.15)",
        marginBottom: 24
      }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", margin: 0, fontSize: 28, fontWeight: 700 }}>
            Platform Control Center — Tenant Operations (TEN-101)
          </h1>
          <p style={{ margin: "4px 0 0", color: "#DDEBFC", fontSize: 14 }}>
            Multi-tenant SaaS provisioning & lifecycle management (Andhra Pradesh Region)
          </p>
        </div>
        <button
          onClick={() => setShowProvisionModal(true)}
          style={{
            background: "#5FC6E9",
            color: "#04364A",
            border: "none",
            borderRadius: 999,
            padding: "12px 24px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 15,
            boxShadow: "0 4px 14px rgba(95, 198, 233, 0.4)"
          }}
        >
          + Provision New Tenant
        </button>
      </div>

      {error && (
        <div style={{ background: "#FBE3E3", color: "#B22B2B", padding: "12px 20px", borderRadius: 14, marginBottom: 20, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Tenant Cards Grid */}
      {loading ? (
        <p style={{ color: "#5B6172" }}>Loading tenant accounts...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 20 }}>
          {tenants.map(t => {
            const sc = statusColor(t.status);
            return (
              <div key={t.id} style={{
                background: "#FFF",
                borderRadius: 22,
                padding: 24,
                border: "1px solid #E3E8F4",
                boxShadow: "0 8px 24px rgba(19, 26, 143, 0.06)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#5B6172", textTransform: "uppercase", letterSpacing: 0.8 }}>
                      TENANT ID
                    </span>
                    <h3 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", margin: "2px 0 0", color: "#131A8F", fontSize: 20, fontWeight: 700 }}>
                      {t.id}
                    </h3>
                  </div>
                  <span style={{
                    background: sc.bg,
                    color: sc.color,
                    borderRadius: 999,
                    padding: "4px 14px",
                    fontSize: 12,
                    fontWeight: 700
                  }}>
                    {sc.label}
                  </span>
                </div>

                <div style={{ background: "#F6FAFF", borderRadius: 14, padding: 14, border: "1px solid #E3E8F4", marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "#5B6172" }}>Hospital / Clinic Name</div>
                  <div style={{ fontWeight: 700, color: "#23263B", fontSize: 16, marginTop: 2 }}>{t.name}</div>
                  <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "#5B6172" }}>
                    <span>Region: <b>{t.region}</b></span>
                    <span>Currency: <b>{t.currency}</b></span>
                    <span>Doctor Fee Payout: <b style={{ color: "#B22B2B" }}>LOCKED OFF</b></span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => alert(`Navigating to Onboarding Setup Wizard for ${t.id}`)}
                    style={{
                      flex: 1,
                      background: "#E4E9FF",
                      color: "#131A8F",
                      border: "none",
                      borderRadius: 999,
                      padding: "8px 16px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: 13
                    }}
                  >
                    Setup Wizard
                  </button>
                  <button
                    onClick={() => alert(`Viewing Tenant Detail for ${t.id}`)}
                    style={{
                      flex: 1,
                      background: "#FFF",
                      color: "#5B6172",
                      border: "1px solid #E3E8F4",
                      borderRadius: 999,
                      padding: "8px 16px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: 13
                    }}
                  >
                    Manage
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Provision Modal */}
      {showProvisionModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(35, 38, 59, 0.5)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{ background: "#FFF", borderRadius: 22, padding: 32, width: 450, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", margin: "0 0 16px", color: "#131A8F" }}>
              Provision Hospital Tenant
            </h2>
            <form onSubmit={handleProvision}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#5B6172", marginBottom: 4 }}>
                  TENANT ID (SLUG)
                </label>
                <input
                  type="text"
                  placeholder="e.g. kims_vizag"
                  value={newId}
                  onChange={e => setNewId(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid #E3E8F4", fontSize: 14 }}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#5B6172", marginBottom: 4 }}>
                  HOSPITAL / CLINIC NAME
                </label>
                <input
                  type="text"
                  placeholder="e.g. KIMS Vizag Super Speciality"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid #E3E8F4", fontSize: 14 }}
                  required
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#5B6172", marginBottom: 4 }}>
                  REGIONAL DOSSIER
                </label>
                <select
                  value={newRegion}
                  onChange={e => setNewRegion(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid #E3E8F4", fontSize: 14 }}
                >
                  <option value="india">Andhra Pradesh / India (INR)</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  style={{ background: "#FFF", color: "#5B6172", border: "1px solid #E3E8F4", borderRadius: 999, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: "#131A8F", color: "#FFF", border: "none", borderRadius: 999, padding: "10px 24px", fontWeight: 700, cursor: "pointer" }}
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
