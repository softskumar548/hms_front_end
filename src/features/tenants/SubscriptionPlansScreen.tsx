import React, { useEffect, useState } from "react";
import { api, SubscriptionPlan, SubscriptionPlanCreatePayload, SubscriptionPlanEditPayload } from "../../api/client";

export const SubscriptionPlansScreen: React.FC<{ token: string | null }> = ({ token }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states for Create
  const initialCreateForm: SubscriptionPlanCreatePayload = {
    code: "",
    name: "",
    description: "",
    price_inr_monthly: 4999,
    price_inr_annual: 49990,
    max_practitioners: 5,
    max_beds: 10,
    max_monthly_encounters: 1500,
    admins_limit: 3,
    staff_limit: 20,
    custom_catalogs_limit: 3,
    catalog_item_limit: 30,
    abdm_level: "M1 + M2 (HIP)",
    sms_limit: 500,
    email_limit: 1500,
    whatsapp_limit: 3000,
    active: true,
  };
  const [createForm, setCreateForm] = useState<SubscriptionPlanCreatePayload>(initialCreateForm);

  // Form states for Edit
  const [editForm, setEditForm] = useState<SubscriptionPlanEditPayload>({});

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSubscriptionPlans(token);
      setPlans(res);
    } catch (e: any) {
      console.warn("Failed to fetch plans from backend, loading default fallback catalog", e);
      // Fallback defaults
      setPlans([
        {
          id: "plan-starter",
          code: "starter",
          name: "Starter (Clinic)",
          description: "Solo practitioner consultation chambers & outpatient clinics",
          price_inr_monthly: 1999,
          price_inr_annual: 19990,
          max_practitioners: 2,
          max_beds: 0,
          max_monthly_encounters: 500,
          admins_limit: 1,
          staff_limit: 3,
          custom_catalogs_limit: 0,
          catalog_item_limit: 15,
          abdm_level: "M1 (ABHA)",
          sms_limit: 200,
          email_limit: 500,
          whatsapp_limit: 1000,
          active: true,
          subscribers_count: 1,
        },
        {
          id: "plan-growth",
          code: "growth",
          name: "Growth (Polyclinic)",
          description: "Multi-specialty outpatient clinics and nursing homes with up to 15 beds",
          price_inr_monthly: 7999,
          price_inr_annual: 79990,
          max_practitioners: 10,
          max_beds: 15,
          max_monthly_encounters: 2500,
          admins_limit: 5,
          staff_limit: 50,
          custom_catalogs_limit: 5,
          catalog_item_limit: 50,
          abdm_level: "M1 + M2 (HIP)",
          sms_limit: 1000,
          email_limit: 2500,
          whatsapp_limit: 5000,
          active: true,
          subscribers_count: 2,
        },
        {
          id: "plan-enterprise",
          code: "enterprise",
          name: "Enterprise (Hospital)",
          description: "Comprehensive multi-department tertiary care hospitals and surgical centers",
          price_inr_monthly: 24999,
          price_inr_annual: 249990,
          max_practitioners: -1,
          max_beds: -1,
          max_monthly_encounters: -1,
          admins_limit: 99,
          staff_limit: 9999,
          custom_catalogs_limit: 999,
          catalog_item_limit: 9999,
          abdm_level: "M1 + M2 + M3 (HIU)",
          sms_limit: 10000,
          email_limit: 25000,
          whatsapp_limit: 50000,
          active: true,
          subscribers_count: 1,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [token]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.code || !createForm.name) {
      showToast("Plan code and name are required", "error");
      return;
    }
    setActionLoading(true);
    try {
      const newPlan = await api.createSubscriptionPlan(token, {
        ...createForm,
        code: createForm.code.toLowerCase().trim().replace(/\s+/g, "_"),
        price_inr_annual: createForm.price_inr_annual || createForm.price_inr_monthly * 10,
      });
      showToast(`Subscription plan '${newPlan.name}' created successfully!`);
      setShowCreateModal(false);
      setCreateForm(initialCreateForm);
      loadPlans();
    } catch (err: any) {
      showToast(err.message || "Failed to create subscription plan", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setEditForm({
      name: plan.name,
      description: plan.description || "",
      price_inr_monthly: plan.price_inr_monthly,
      price_inr_annual: plan.price_inr_annual,
      max_practitioners: plan.max_practitioners,
      max_beds: plan.max_beds,
      max_monthly_encounters: plan.max_monthly_encounters,
      admins_limit: plan.admins_limit,
      staff_limit: plan.staff_limit,
      custom_catalogs_limit: plan.custom_catalogs_limit,
      catalog_item_limit: plan.catalog_item_limit,
      abdm_level: plan.abdm_level,
      sms_limit: plan.sms_limit,
      email_limit: plan.email_limit,
      whatsapp_limit: plan.whatsapp_limit,
      active: plan.active,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setActionLoading(true);
    try {
      await api.updateSubscriptionPlan(token, editingPlan.id || editingPlan.code, editForm);
      showToast(`Subscription plan '${editForm.name || editingPlan.name}' updated successfully!`);
      setEditingPlan(null);
      loadPlans();
    } catch (err: any) {
      showToast(err.message || "Failed to update subscription plan", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingPlan) return;
    setActionLoading(true);
    try {
      await api.deleteSubscriptionPlan(token, deletingPlan.id || deletingPlan.code);
      showToast(`Subscription plan '${deletingPlan.name}' removed successfully!`);
      setDeletingPlan(null);
      loadPlans();
    } catch (err: any) {
      showToast(err.message || "Failed to delete subscription plan", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPlans = plans.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : statusFilter === "active" ? p.active : !p.active;
    return matchesSearch && matchesStatus;
  });

  const totalSubscribers = plans.reduce((acc, p) => acc + (p.subscribers_count || 0), 0);
  const activePlansCount = plans.filter((p) => p.active).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: 8,
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: 14,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            background: toastMessage.type === "success" ? "var(--green, #16794C)" : "var(--danger, #C52222)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span>{toastMessage.type === "success" ? "✅" : "⚠️"}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep, #07393E) 100%)",
          padding: "24px 28px",
          borderRadius: "var(--r-card, 12px)",
          color: "#FFFFFF",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>💎</span>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.01em" }}>
              SaaS Subscription Plans & Quota Limits
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                background: "rgba(255,255,255,0.2)",
                padding: "2px 8px",
                borderRadius: 12,
              }}
            >
              Operator Control
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, opacity: 0.9, maxWidth: 720, lineHeight: 1.5 }}>
            Configure commercial subscription tiers, physician practitioner caps, inpatient bed capacity,
            dynamic custom catalog schema limits, and automated pricing for all subscribing clinics & hospitals.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            background: "#FFFFFF",
            color: "var(--indigo)",
            border: "none",
            borderRadius: 8,
            padding: "10px 18px",
            fontWeight: 800,
            fontSize: 13.5,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            transition: "transform 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <span style={{ fontSize: 16 }}>✨</span>
          <span>+ Create New Plan</span>
        </button>
      </div>

      {/* KPI Overview Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid var(--line, #E2E8F0)",
            borderRadius: 10,
            padding: "16px 20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>
            Total Subscription Plans
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", marginTop: 4 }}>
            {plans.length}{" "}
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--green)" }}>
              ({activePlansCount} Active)
            </span>
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid var(--line, #E2E8F0)",
            borderRadius: 10,
            padding: "16px 20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>
            Active Subscribed Tenants
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--indigo)", marginTop: 4 }}>
            {totalSubscribers}{" "}
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--slate)" }}>Healthcare Facilities</span>
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid var(--line, #E2E8F0)",
            borderRadius: 10,
            padding: "16px 20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>
            Starter Entry Tier
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", marginTop: 4 }}>
            ₹1,999 <span style={{ fontSize: 13, fontWeight: 500, color: "var(--slate)" }}>/ month</span>
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid var(--line, #E2E8F0)",
            borderRadius: 10,
            padding: "16px 20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>
            Enterprise Flagship Tier
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--indigo-deep)", marginTop: 4 }}>
            ₹24,999 <span style={{ fontSize: 13, fontWeight: 500, color: "var(--slate)" }}>/ month</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          background: "#FFFFFF",
          padding: "14px 18px",
          borderRadius: 10,
          border: "1px solid var(--line, #E2E8F0)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 260 }}>
          <span style={{ fontSize: 16, color: "var(--slate)" }}>🔍</span>
          <input
            type="text"
            placeholder="Search plan by name, code, or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: 13.5,
              color: "var(--ink)",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--slate)" }}>Status:</span>
          {(["all", "active", "inactive"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 600,
                border: "1px solid",
                borderColor: statusFilter === st ? "var(--indigo)" : "var(--line, #E2E8F0)",
                background: statusFilter === st ? "var(--indigo-soft, #E5F3F3)" : "#FFFFFF",
                color: statusFilter === st ? "var(--indigo)" : "var(--slate)",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "var(--slate)", fontSize: 14 }}>
          Loading subscription plans catalog...
        </div>
      ) : filteredPlans.length === 0 ? (
        <div
          style={{
            padding: 48,
            textAlign: "center",
            background: "#FFFFFF",
            borderRadius: 10,
            border: "1px dashed var(--line, #E2E8F0)",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>💎</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>No Subscription Plans Found</div>
          <p style={{ fontSize: 13, color: "var(--slate)", margin: "4px 0 16px" }}>
            No plans matched your search query or filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            style={{
              padding: "8px 16px",
              background: "var(--indigo-soft)",
              color: "var(--indigo)",
              border: "none",
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 20 }}>
          {filteredPlans.map((plan) => {
            const isUnlimitedDocs = plan.max_practitioners === -1;
            const isUnlimitedBeds = plan.max_beds === -1;
            const isUnlimitedVisits = plan.max_monthly_encounters === -1;
            const isUnlimitedCatalogs = plan.custom_catalogs_limit >= 999;
            const isLockedCatalogs = plan.custom_catalogs_limit === 0;

            return (
              <div
                key={plan.id || plan.code}
                style={{
                  background: "#FFFFFF",
                  border: plan.code === "growth" ? "2px solid var(--indigo)" : "1px solid var(--line, #E2E8F0)",
                  borderRadius: 12,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: plan.code === "growth" ? "0 4px 16px rgba(13, 92, 99, 0.1)" : "0 1px 3px rgba(0,0,0,0.04)",
                  position: "relative",
                  transition: "box-shadow 0.2s ease",
                }}
              >
                {plan.code === "growth" && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      right: 20,
                      background: "var(--indigo)",
                      color: "#FFFFFF",
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "3px 10px",
                      borderRadius: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    ⭐ Most Popular
                  </div>
                )}

                <div>
                  {/* Card Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>{plan.name}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: 11.5,
                            background: "var(--wash-a, #F8FAFC)",
                            border: "1px solid var(--line)",
                            padding: "1px 6px",
                            borderRadius: 4,
                            color: "var(--slate)",
                          }}
                        >
                          code: {plan.code}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 10,
                            background: plan.active ? "#E8F5E9" : "#ECEFF1",
                            color: plan.active ? "var(--green, #16794C)" : "var(--slate)",
                          }}
                        >
                          {plan.active ? "Active" : "Archived"}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        background: "var(--indigo-soft, #E5F3F3)",
                        color: "var(--indigo)",
                        padding: "4px 10px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        textAlign: "right",
                      }}
                    >
                      {plan.subscribers_count} {plan.subscribers_count === 1 ? "Subscriber" : "Subscribers"}
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: "var(--slate)", margin: "0 0 16px", minHeight: 38, lineHeight: 1.45 }}>
                    {plan.description || "Healthcare facility management tier with standardized clinical operations."}
                  </p>

                  {/* Pricing Display */}
                  <div
                    style={{
                      background: "var(--wash-a, #F8FAFC)",
                      padding: "12px 16px",
                      borderRadius: 8,
                      border: "1px solid var(--line)",
                      marginBottom: 18,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)" }}>
                        ₹{plan.price_inr_monthly.toLocaleString("en-IN")}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--slate)", fontWeight: 500 }}>/ month</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 2 }}>
                      Annual: ₹{plan.price_inr_annual.toLocaleString("en-IN")} / year
                      <span style={{ color: "var(--green)", fontWeight: 700, marginLeft: 6 }}>(Save ~16%)</span>
                    </div>
                  </div>

                  {/* Quota Limits Grid */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Allocated Capacity & Quotas
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12.5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink)" }}>
                        <span>👨‍⚕️</span>
                        <span>
                          <strong>{isUnlimitedDocs ? "Unlimited" : plan.max_practitioners}</strong> Doctors
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink)" }}>
                        <span>🛏️</span>
                        <span>
                          <strong>{isUnlimitedBeds ? "Unlimited" : plan.max_beds === 0 ? "0 (OPD Only)" : `${plan.max_beds} Beds`}</strong>
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink)" }}>
                        <span>🩺</span>
                        <span>
                          <strong>{isUnlimitedVisits ? "Unlimited" : plan.max_monthly_encounters.toLocaleString()}</strong> Visits/mo
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink)" }}>
                        <span>👥</span>
                        <span>
                          <strong>{plan.staff_limit >= 9999 ? "Unlimited" : plan.staff_limit}</strong> Staff Max
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink)" }}>
                        <span>👑</span>
                        <span>
                          <strong>
                            {isLockedCatalogs ? "0 (Locked)" : isUnlimitedCatalogs ? "Unlimited" : `${plan.custom_catalogs_limit} Schemas`}
                          </strong>{" "}
                          Catalogs
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink)" }}>
                        <span>📦</span>
                        <span>
                          <strong>{plan.catalog_item_limit >= 9999 ? "Unlimited" : `${plan.catalog_item_limit} Items`}</strong> /Category
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink)", gridColumn: "1 / -1" }}>
                        <span>🏛️</span>
                        <span>
                          ABDM: <strong>{plan.abdm_level}</strong>
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--slate)", gridColumn: "1 / -1", fontSize: 12 }}>
                        <span>💬</span>
                        <span>
                          Comms: {plan.sms_limit.toLocaleString()} SMS · {plan.email_limit.toLocaleString()} Email · {plan.whatsapp_limit.toLocaleString()} WhatsApp
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 16,
                    borderTop: "1px solid var(--line, #E2E8F0)",
                    gap: 10,
                  }}
                >
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      background: "var(--indigo-soft, #E5F3F3)",
                      color: "var(--indigo)",
                      border: "1px solid var(--indigo)",
                      borderRadius: 6,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>✏️</span>
                    <span>Edit Plan</span>
                  </button>

                  <button
                    onClick={() => setDeletingPlan(plan)}
                    style={{
                      padding: "8px 12px",
                      background: "#FFF5F5",
                      color: "var(--danger, #C52222)",
                      border: "1px solid #FFCDD2",
                      borderRadius: 6,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    title={plan.subscribers_count > 0 ? "Cannot delete plan with active subscribers" : "Remove subscription plan"}
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE PLAN MODAL */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9000,
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: "#FFFFFF",
              width: "100%",
              maxWidth: 680,
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: 14,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              padding: 28,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>
                  Create Subscription Plan
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--slate)" }}>
                  Define a new commercial tier with custom clinical and data quotas.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--slate)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate)", marginBottom: 4 }}>
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Super Specialty Surgery"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--line, #E2E8F0)",
                      fontSize: 13,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate)", marginBottom: 4 }}>
                    Unique Code Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. super_specialty"
                    value={createForm.code}
                    onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--line, #E2E8F0)",
                      fontSize: 13,
                      fontFamily: "monospace",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate)", marginBottom: 4 }}>
                  Feature Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Target facility type, department specialties, and included operations..."
                  value={createForm.description || ""}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--line, #E2E8F0)",
                    fontSize: 13,
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Pricing Section */}
              <div style={{ background: "var(--wash-a, #F8FAFC)", padding: 14, borderRadius: 8, border: "1px solid var(--line)" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--slate)", textTransform: "uppercase", marginBottom: 10 }}>
                  Pricing Configuration (INR ₹)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      Monthly Fee (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={100}
                      value={createForm.price_inr_monthly}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setCreateForm({
                          ...createForm,
                          price_inr_monthly: val,
                          price_inr_annual: val * 10,
                        });
                      }}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: "1px solid var(--line, #E2E8F0)",
                        fontSize: 13,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      Annual Fee (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={100}
                      value={createForm.price_inr_annual}
                      onChange={(e) => setCreateForm({ ...createForm, price_inr_annual: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: "1px solid var(--line, #E2E8F0)",
                        fontSize: 13,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Capacity Quotas Section */}
              <div style={{ background: "var(--wash-a, #F8FAFC)", padding: 14, borderRadius: 8, border: "1px solid var(--line)" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--slate)", textTransform: "uppercase", marginBottom: 10 }}>
                  Capacity & Resource Limits (-1 for Unlimited)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      Max Doctors
                    </label>
                    <input
                      type="number"
                      required
                      value={createForm.max_practitioners}
                      onChange={(e) => setCreateForm({ ...createForm, max_practitioners: parseInt(e.target.value) || 0 })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      Max Inpatient Beds
                    </label>
                    <input
                      type="number"
                      required
                      value={createForm.max_beds}
                      onChange={(e) => setCreateForm({ ...createForm, max_beds: parseInt(e.target.value) || 0 })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      Monthly Encounters
                    </label>
                    <input
                      type="number"
                      required
                      value={createForm.max_monthly_encounters}
                      onChange={(e) => setCreateForm({ ...createForm, max_monthly_encounters: parseInt(e.target.value) || 0 })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      Tenant Admins Limit
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={createForm.admins_limit}
                      onChange={(e) => setCreateForm({ ...createForm, admins_limit: parseInt(e.target.value) || 1 })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      Total Staff Limit
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={createForm.staff_limit}
                      onChange={(e) => setCreateForm({ ...createForm, staff_limit: parseInt(e.target.value) || 1 })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      Custom Master Catalogs
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={createForm.custom_catalogs_limit}
                      onChange={(e) => setCreateForm({ ...createForm, custom_catalogs_limit: parseInt(e.target.value) || 0 })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      Catalog Category Items
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={createForm.catalog_item_limit}
                      onChange={(e) => setCreateForm({ ...createForm, catalog_item_limit: parseInt(e.target.value) || 1 })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                    />
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      ABDM Compliance Level
                    </label>
                    <select
                      value={createForm.abdm_level}
                      onChange={(e) => setCreateForm({ ...createForm, abdm_level: e.target.value })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                    >
                      <option value="M1 (ABHA)">M1 (ABHA & Digital Health ID)</option>
                      <option value="M1 + M2 (HIP)">M1 + M2 (HIP Health Information Provider)</option>
                      <option value="M1 + M2 + M3 (HIU)">M1 + M2 + M3 (HIU Health Information User)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Comms Quotas */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--slate)", marginBottom: 4 }}>
                    Monthly SMS
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={createForm.sms_limit}
                    onChange={(e) => setCreateForm({ ...createForm, sms_limit: parseInt(e.target.value) || 0 })}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--slate)", marginBottom: 4 }}>
                    Monthly Email
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={createForm.email_limit}
                    onChange={(e) => setCreateForm({ ...createForm, email_limit: parseInt(e.target.value) || 0 })}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--slate)", marginBottom: 4 }}>
                    Monthly WhatsApp
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={createForm.whatsapp_limit}
                    onChange={(e) => setCreateForm({ ...createForm, whatsapp_limit: parseInt(e.target.value) || 0 })}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox"
                  id="create_active"
                  checked={createForm.active}
                  onChange={(e) => setCreateForm({ ...createForm, active: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: "var(--indigo)" }}
                />
                <label htmlFor="create_active" style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", cursor: "pointer" }}>
                  Active for new tenant subscriptions
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 6,
                    border: "1px solid var(--line)",
                    background: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--slate)",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 6,
                    border: "none",
                    background: "var(--indigo)",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    opacity: actionLoading ? 0.7 : 1,
                  }}
                >
                  {actionLoading ? "Creating..." : "Save Subscription Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLAN MODAL */}
      {editingPlan && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9000,
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
          onClick={() => setEditingPlan(null)}
        >
          <div
            style={{
              background: "#FFFFFF",
              width: "100%",
              maxWidth: 680,
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: 14,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              padding: 28,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>
                  Edit Subscription Plan: {editingPlan.name}
                </h2>
                <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 4 }}>
                  Code: <code style={{ color: "var(--indigo)" }}>{editingPlan.code}</code> · {editingPlan.subscribers_count} Active Subscribers
                </div>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--slate)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate)", marginBottom: 4 }}>
                  Plan Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--slate)", marginBottom: 4 }}>
                  Feature Description
                </label>
                <textarea
                  rows={2}
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                />
              </div>

              {/* Pricing Section */}
              <div style={{ background: "var(--wash-a, #F8FAFC)", padding: 14, borderRadius: 8, border: "1px solid var(--line)" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--slate)", textTransform: "uppercase", marginBottom: 10 }}>
                  Pricing Configuration (INR ₹)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      Monthly Fee (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.price_inr_monthly ?? 0}
                      onChange={(e) => setEditForm({ ...editForm, price_inr_monthly: parseFloat(e.target.value) || 0 })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      Annual Fee (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.price_inr_annual ?? 0}
                      onChange={(e) => setEditForm({ ...editForm, price_inr_annual: parseFloat(e.target.value) || 0 })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                    />
                  </div>
                </div>
              </div>

              {/* Capacity Quotas Section */}
              <div style={{ background: "var(--wash-a, #F8FAFC)", padding: 14, borderRadius: 8, border: "1px solid var(--line)" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--slate)", textTransform: "uppercase", marginBottom: 10 }}>
                  Capacity & Resource Limits (-1 for Unlimited)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      Max Doctors
                    </label>
                    <input
                      type="number"
                      value={editForm.max_practitioners ?? 0}
                      onChange={(e) => setEditForm({ ...editForm, max_practitioners: parseInt(e.target.value) || 0 })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      Max Inpatient Beds
                    </label>
                    <input
                      type="number"
                      value={editForm.max_beds ?? 0}
                      onChange={(e) => setEditForm({ ...editForm, max_beds: parseInt(e.target.value) || 0 })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      Monthly Encounters
                    </label>
                    <input
                      type="number"
                      value={editForm.max_monthly_encounters ?? 0}
                      onChange={(e) => setEditForm({ ...editForm, max_monthly_encounters: parseInt(e.target.value) || 0 })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      Tenant Admins Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editForm.admins_limit ?? 1}
                      onChange={(e) => setEditForm({ ...editForm, admins_limit: parseInt(e.target.value) || 1 })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      Total Staff Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editForm.staff_limit ?? 1}
                      onChange={(e) => setEditForm({ ...editForm, staff_limit: parseInt(e.target.value) || 1 })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      Custom Master Catalogs
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.custom_catalogs_limit ?? 0}
                      onChange={(e) => setEditForm({ ...editForm, custom_catalogs_limit: parseInt(e.target.value) || 0 })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      Catalog Category Items
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editForm.catalog_item_limit ?? 1}
                      onChange={(e) => setEditForm({ ...editForm, catalog_item_limit: parseInt(e.target.value) || 1 })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                    />
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                      ABDM Compliance Level
                    </label>
                    <select
                      value={editForm.abdm_level || "M1 + M2 (HIP)"}
                      onChange={(e) => setEditForm({ ...editForm, abdm_level: e.target.value })}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                    >
                      <option value="M1 (ABHA)">M1 (ABHA & Digital Health ID)</option>
                      <option value="M1 + M2 (HIP)">M1 + M2 (HIP Health Information Provider)</option>
                      <option value="M1 + M2 + M3 (HIU)">M1 + M2 + M3 (HIU Health Information User)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Comms Quotas */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--slate)", marginBottom: 4 }}>
                    Monthly SMS
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.sms_limit ?? 0}
                    onChange={(e) => setEditForm({ ...editForm, sms_limit: parseInt(e.target.value) || 0 })}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--slate)", marginBottom: 4 }}>
                    Monthly Email
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.email_limit ?? 0}
                    onChange={(e) => setEditForm({ ...editForm, email_limit: parseInt(e.target.value) || 0 })}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--slate)", marginBottom: 4 }}>
                    Monthly WhatsApp
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.whatsapp_limit ?? 0}
                    onChange={(e) => setEditForm({ ...editForm, whatsapp_limit: parseInt(e.target.value) || 0 })}
                    style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox"
                  id="edit_active"
                  checked={editForm.active ?? true}
                  onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: "var(--indigo)" }}
                />
                <label htmlFor="edit_active" style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", cursor: "pointer" }}>
                  Active for new tenant subscriptions
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 6,
                    border: "1px solid var(--line)",
                    background: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--slate)",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 6,
                    border: "none",
                    background: "var(--indigo)",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    opacity: actionLoading ? 0.7 : 1,
                  }}
                >
                  {actionLoading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE / DEACTIVATE CONFIRMATION MODAL */}
      {deletingPlan && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9000,
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
          onClick={() => setDeletingPlan(null)}
        >
          <div
            style={{
              background: "#FFFFFF",
              width: "100%",
              maxWidth: 480,
              borderRadius: 14,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              padding: 26,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>
              {deletingPlan.subscribers_count > 0 ? "🛡️" : "🗑️"}
            </div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>
              {deletingPlan.subscribers_count > 0 ? "Cannot Delete Active Plan" : "Delete Subscription Plan?"}
            </h3>

            {deletingPlan.subscribers_count > 0 ? (
              <div style={{ marginTop: 12, fontSize: 13.5, color: "var(--slate)", lineHeight: 1.5 }}>
                <p style={{ margin: "0 0 10px" }}>
                  The plan <strong>{deletingPlan.name}</strong> currently has{" "}
                  <strong style={{ color: "var(--indigo)" }}>
                    {deletingPlan.subscribers_count} active subscribed healthcare facility(ies)
                  </strong>.
                </p>
                <p style={{ margin: 0 }}>
                  To maintain data integrity and uninterrupted hospital operations, you cannot delete a plan with active subscribers.
                  You may edit the plan to mark it <strong>Inactive</strong> to prevent new signups, or reassign existing tenants first.
                </p>
              </div>
            ) : (
              <p style={{ margin: "12px 0 0", fontSize: 13.5, color: "var(--slate)", lineHeight: 1.5 }}>
                Are you sure you want to permanently delete the <strong>{deletingPlan.name}</strong> (<code>{deletingPlan.code}</code>) subscription plan? This action cannot be undone.
              </p>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
              <button
                type="button"
                onClick={() => setDeletingPlan(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "1px solid var(--line)",
                  background: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--slate)",
                  cursor: "pointer",
                }}
              >
                {deletingPlan.subscribers_count > 0 ? "Close" : "Cancel"}
              </button>

              {deletingPlan.subscribers_count === 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  disabled={actionLoading}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 6,
                    border: "none",
                    background: "var(--danger, #C52222)",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {actionLoading ? "Deleting..." : "Permanently Delete"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
