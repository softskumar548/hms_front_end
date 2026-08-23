/** Operator Tenant Provisioning & Admin Access Handover Screen (TEN-101).
 * Streamlined 2-stage operator handover pipeline:
 * Stage 1: Organization Credentials, Primary/Secondary Contacts, Admin Selection & Signed Contract Upload.
 * Stage 2: Tenant Admin Access Handover Certificate (Portal URL, Keycloak role: admin, Passcode & Email).
 */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/client";

// MediGo Primitives
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

export const OnboardingWizardScreen: React.FC<{ token: string | null }> = ({ token }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const queryTenantId = queryParams.get("tenant_id") || queryParams.get("tenantId") || "";
  const queryOrgName = queryParams.get("name") || "";
  const stateTenantId = (location.state as { tenantId?: string })?.tenantId || "";
  const [tenantId, setTenantId] = useState(queryTenantId || stateTenantId || "");

  // 2-Stage Pipeline State: 1 = Org Provisioning & Contract | 2 = Admin Access Handover Certificate
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [provisioned, setProvisioned] = useState<boolean>(false);

  // Stage 1: Organization Profile & Infrastructure
  const [orgName, setOrgName] = useState(queryOrgName || (queryTenantId ? queryTenantId.toUpperCase().replace(/[_|-]/g, " ") : ""));
  const [customUrl, setCustomUrl] = useState(queryTenantId ? `${queryTenantId}.hms.zensynq.com` : "");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState("india");
  const [locale, setLocale] = useState("en-IN");
  const [currency, setCurrency] = useState("INR");
  const [isolatedDb, setIsolatedDb] = useState(false);

  // Stage 1: Feature Modules
  const [featureReferrals, setFeatureReferrals] = useState(true);
  const [featureAbdm, setFeatureAbdm] = useState(true);
  const [featureTelehealth, setFeatureTelehealth] = useState(true);

  // Stage 1: Contacts & Admin Assignment
  const [primName, setPrimName] = useState("");
  const [primPhone, setPrimPhone] = useState("");
  const [primEmail, setPrimEmail] = useState("");
  const [primDesignation, setPrimDesignation] = useState("");

  const [secName, setSecName] = useState("");
  const [secPhone, setSecPhone] = useState("");
  const [secEmail, setSecEmail] = useState("");
  const [secDesignation, setSecDesignation] = useState("");

  const [adminContactTarget, setAdminContactTarget] = useState<"primary" | "secondary">("primary");

  // Stage 1: Physical Signed Contract & Signatory Audit
  const [contractFileName, setContractFileName] = useState("");
  const [sigName, setSigName] = useState("");
  const [sigDesignation, setSigDesignation] = useState("");
  const [sigPhone, setSigPhone] = useState("");
  const [sigEmail, setSigEmail] = useState("");
  const [signatoryError, setSignatoryError] = useState<string | null>(null);

  // Stage 2: Handover Certificate & Passcode State
  const [tempPasscode, setTempPasscode] = useState("");
  const [copiedToast, setCopiedToast] = useState(false);
  const [provisioningLoading, setProvisioningLoading] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tid = queryTenantId || stateTenantId;
    if (tid) {
      setTenantId(tid);
    }
  }, [queryTenantId, stateTenantId]);

  const handleOrgNameChange = (val: string) => {
    setOrgName(val);
    const slug = val.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!queryTenantId) {
      setTenantId(slug);
      setCustomUrl(`${slug}.hms.zensynq.com`);
    }
  };

  const handleAutofillSignatory = (target: "primary" | "secondary") => {
    if (target === "primary") {
      setSigName(primName);
      setSigDesignation(primDesignation);
      setSigPhone(primPhone);
      setSigEmail(primEmail);
    } else {
      setSigName(secName);
      setSigDesignation(secDesignation);
      setSigPhone(secPhone);
      setSigEmail(secEmail);
    }
    setSignatoryError(null);
  };

  const validateSignatory = (): boolean => {
    if (!sigName && !sigEmail && !sigPhone) return true;
    const sName = sigName.toLowerCase().trim();
    const sEmail = sigEmail.toLowerCase().trim();
    const sPhone = sigPhone.trim();

    const pMatch =
      Boolean(primName) &&
      (sEmail === primEmail.toLowerCase().trim() ||
        sPhone === primPhone.trim() ||
        sName.includes(primName.toLowerCase().trim()) ||
        primName.toLowerCase().trim().includes(sName));

    const sMatch =
      Boolean(secName) &&
      (sEmail === secEmail.toLowerCase().trim() ||
        sPhone === secPhone.trim() ||
        sName.includes(secName.toLowerCase().trim()) ||
        secName.toLowerCase().trim().includes(sName));

    if (!pMatch && !sMatch) {
      setSignatoryError("⚠️ Contract signatory details must match either Primary Contact or Secondary Contact!");
      return false;
    }
    setSignatoryError(null);
    return true;
  };

  // Stage 1 Provisioning & Admin Creation Handler
  const handleProvisionTenantAndIssueAdmin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orgName || !tenantId) {
      setError("Please provide Organization Name and Tenant Identifier.");
      return;
    }
    if (!validateSignatory()) return;

    setProvisioningLoading(true);
    setError(null);
    try {
      const payload: any = {
        id: tenantId,
        name: orgName,
        region: region,
        custom_url: customUrl || `${tenantId}.hms.zensynq.com`,
        isolated_db: isolatedDb,
        address: address,
        website: website,
        admin_contact_target: adminContactTarget,
        features: {
          referrals: featureReferrals,
          abdm: featureAbdm,
          telehealth: featureTelehealth,
        },
      };

      if (primName || primEmail) {
        payload.primary_contact = {
          name: primName || "Primary Admin",
          phone: primPhone || "+919876543210",
          email: primEmail || `admin@${tenantId}.com`,
          designation: primDesignation || "Medical Director",
        };
      }

      if (secName || secEmail) {
        payload.secondary_contact = {
          name: secName,
          phone: secPhone,
          email: secEmail,
          designation: secDesignation,
        };
      }

      if (sigName || sigEmail) {
        payload.contract_attestation = {
          document_filename: contractFileName || "signed_terms_contract.pdf",
          signatory_name: sigName,
          signatory_designation: sigDesignation,
          signatory_phone: sigPhone,
          signatory_email: sigEmail,
        };
      }

      await api.provisionTenant(token, payload);
      setProvisioned(true);
      const generatedPass = `Hms${tenantId.charAt(0).toUpperCase() + tenantId.slice(1)}#2026!`;
      setTempPasscode(generatedPass);
      setMessage(`🎉 Tenant '${orgName}' provisioned successfully! Tenant Admin account created.`);
      setCurrentStage(2);
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || "Failed to provision tenant");
    } finally {
      setProvisioningLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    const adminEmail = adminContactTarget === "secondary" ? secEmail || primEmail : primEmail;
    const adminName = adminContactTarget === "secondary" ? secName || primName : primName;
    const textToCopy = `HOSPITAL TENANT ADMIN HANDOVER CREDENTIALS
Organization: ${orgName}
Access URL: https://${customUrl || `${tenantId}.hms.zensynq.com`}
Tenant Admin: ${adminName} (${adminEmail})
Assigned Role: admin (Keycloak OIDC & PostgreSQL)
Initial Temporary Passcode: ${tempPasscode}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const adminTargetObj = adminContactTarget === "secondary" && secName ? { name: secName, email: secEmail, phone: secPhone, title: secDesignation || "Secondary Contact" } : { name: primName || "Primary Contact", email: primEmail, phone: primPhone, title: primDesignation || "Primary Contact" };

  return (
    <div style={{ padding: "24px 20px", maxWidth: 1160, margin: "0 auto", fontFamily: "var(--font-body, Nunito, sans-serif)" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--indigo-deep, #0A1166) 0%, var(--indigo, #131A8F) 100%)",
          borderRadius: 22,
          padding: "26px 32px",
          color: "#FFF",
          marginBottom: 24,
          boxShadow: "var(--shadow-pop, 0 10px 30px rgba(19, 26, 143, 0.15))",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ background: "var(--cyan, #5FC6E9)", color: "#04364A", borderRadius: 999, padding: "4px 14px", fontWeight: 800, fontSize: 12 }}>
              PLATFORM OPERATOR CONTROL CENTER
            </span>
            {provisioned && (
              <span style={{ background: "#E3F5EA", color: "#1C9A4E", borderRadius: 999, padding: "4px 14px", fontWeight: 800, fontSize: 12 }}>
                ✓ PROVISIONED & HANDOVER READY
              </span>
            )}
          </div>
          <h1 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", margin: 0, fontSize: 30, fontWeight: 700 }}>
            {tenantId ? `Tenant Provisioning: ${orgName || tenantId.toUpperCase()}` : "Organization Provisioning & Admin Handover"}
          </h1>
          <p style={{ margin: "4px 0 0", color: "var(--indigo-soft, #E4E9FF)", fontSize: 14 }}>
            Operator onboarding: Capture organization credentials, contract attestation, and issue initial **Tenant Admin (`role: admin`)** access.
          </p>
        </div>

        <button
          onClick={() => navigate("/tenants")}
          style={{ background: "var(--indigo-soft, #E4E9FF)", color: "var(--indigo, #131A8F)", border: "none", borderRadius: 999, padding: "10px 22px", fontWeight: 800, fontSize: 13.5, cursor: "pointer" }}
        >
          ← Return to Subscribed Tenants
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div style={{ background: "#E3F5EA", color: "#1C9A4E", padding: "14px 20px", borderRadius: 14, marginBottom: 20, fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #1C9A4E" }}>
          <span>{message}</span>
          <button onClick={() => setMessage(null)} style={{ background: "none", border: "none", color: "#1C9A4E", fontWeight: 800, cursor: "pointer" }}>✕</button>
        </div>
      )}

      {error && (
        <div style={{ background: "var(--danger, #D93A3A)", color: "#FFF", padding: "14px 20px", borderRadius: 14, marginBottom: 20, fontWeight: 700 }}>
          ⚠️ {error}
        </div>
      )}

      {/* 2-Stage Pipeline Navigation Bar */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
        <button
          onClick={() => setCurrentStage(1)}
          style={{
            flex: 1,
            background: currentStage === 1 ? "var(--indigo, #131A8F)" : "#FFF",
            color: currentStage === 1 ? "#FFF" : "var(--ink, #23263B)",
            border: `1.5px solid ${currentStage === 1 ? "var(--indigo, #131A8F)" : "var(--line, #E3E8F4)"}`,
            borderRadius: 18,
            padding: "16px 20px",
            textAlign: "left",
            cursor: "pointer",
            boxShadow: currentStage === 1 ? "0 6px 18px rgba(19, 26, 143, 0.2)" : "none",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8, opacity: currentStage === 1 ? 0.9 : 0.6 }}>
            STAGE 01
          </div>
          <div style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", fontSize: 18, fontWeight: 700 }}>
            Org Credentials & Contract Attestation
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>Org profile, contacts, Tenant Admin selection & physical contract upload</div>
        </button>

        <button
          onClick={() => {
            if (provisioned) setCurrentStage(2);
          }}
          disabled={!provisioned}
          style={{
            flex: 1,
            background: currentStage === 2 ? "var(--indigo, #131A8F)" : provisioned ? "#E3F5EA" : "#FFF",
            color: currentStage === 2 ? "#FFF" : provisioned ? "#1C9A4E" : "#888",
            border: `1.5px solid ${currentStage === 2 ? "var(--indigo, #131A8F)" : provisioned ? "#1C9A4E" : "var(--line, #E3E8F4)"}`,
            borderRadius: 18,
            padding: "16px 20px",
            textAlign: "left",
            cursor: provisioned ? "pointer" : "not-allowed",
            boxShadow: currentStage === 2 ? "0 6px 18px rgba(19, 26, 143, 0.2)" : "none",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8, opacity: currentStage === 2 ? 0.9 : 0.6 }}>
            STAGE 02
          </div>
          <div style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", fontSize: 18, fontWeight: 700 }}>
            Tenant Admin Handover Certificate
          </div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{provisioned ? "✓ Credentials issued — Ready for Tenant Admin handover" : "Unlocks after Stage 1 provisioning"}</div>
        </button>
      </div>

      {/* STAGE 1: Organization Provisioning, Contacts & Signed Contract Upload */}
      {currentStage === 1 && (
        <form onSubmit={handleProvisionTenantAndIssueAdmin} style={{ display: "grid", gap: 24 }}>
          {signatoryError && (
            <div style={{ background: "var(--danger, #D93A3A)", color: "#FFF", padding: "14px 20px", borderRadius: 14, fontWeight: 700 }}>
              {signatoryError}
            </div>
          )}

          {/* Card 1: Organization Credentials & Infrastructure */}
          <div style={{ background: "var(--card, #FFF)", borderRadius: 22, padding: 28, border: "1px solid var(--line, #E3E8F4)", boxShadow: "var(--shadow-card, 0 8px 24px rgba(19, 26, 143, 0.06))" }}>
            <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", color: "var(--indigo, #131A8F)", margin: "0 0 6px", fontSize: 22 }}>
              Organization Credentials & Custom Subdomain Access
            </h2>
            <p style={{ color: "var(--slate, #5B6172)", fontSize: 13.5, marginBottom: 20 }}>
              Specify official hospital/clinic branding, custom domain URL, physical address, and database isolation model.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--slate, #5B6172)", marginBottom: 4 }}>ORGANIZATION FULL NAME *</label>
                <input
                  type="text"
                  placeholder="e.g. Apollo Specialty Hospital Vizag"
                  value={orgName}
                  onChange={e => handleOrgNameChange(e.target.value)}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14, fontWeight: 600 }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--slate, #5B6172)", marginBottom: 4 }}>TENANT IDENTIFIER (SLUG) *</label>
                <input
                  type="text"
                  placeholder="e.g. apollovizag"
                  value={tenantId}
                  onChange={e => {
                    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "");
                    setTenantId(slug);
                    setCustomUrl(`${slug}.hms.zensynq.com`);
                  }}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14, fontWeight: 700, color: "var(--indigo, #131A8F)" }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--slate, #5B6172)", marginBottom: 4 }}>CUSTOM ACCESS URL</label>
                <input
                  type="text"
                  placeholder="e.g. apollo.hms.zensynq.com"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14, fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--slate, #5B6172)", marginBottom: 4 }}>WEBSITE URL</label>
                <input
                  type="url"
                  placeholder="e.g. https://apollohospitals.com"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--slate, #5B6172)", marginBottom: 4 }}>LAUNCH REGION</label>
                <select value={region} onChange={e => setRegion(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 14, fontWeight: 600 }}>
                  <option value="india">India (Andhra Pradesh / Mumbai Region)</option>
                  <option value="ap_local">AP Dedicated Healthcare Data Center</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--slate, #5B6172)", marginBottom: 4 }}>PHYSICAL ADDRESS</label>
              <textarea
                rows={2}
                placeholder="e.g. 10-2-15 Main Road, Health City, Vizag, AP 530040"
                value={address}
                onChange={e => setAddress(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", fontSize: 13.5 }}
              />
            </div>

            <div style={{ background: "var(--wash-a, #F6FAFF)", padding: 14, borderRadius: 14, border: "1px solid var(--line, #E3E8F4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--indigo, #131A8F)" }}>DEDICATED ISOLATED DATABASE</div>
                <div style={{ fontSize: 12, color: "var(--slate, #5B6172)" }}>Provision a dedicated physical DB instance vs shared multi-tenant RLS DB</div>
              </div>
              <input
                type="checkbox"
                checked={isolatedDb}
                onChange={e => setIsolatedDb(e.target.checked)}
                style={{ width: 20, height: 20, accentColor: "var(--indigo, #131A8F)", cursor: "pointer" }}
              />
            </div>
          </div>

          {/* Card 2: Primary & Secondary Contacts */}
          <div style={{ background: "var(--card, #FFF)", borderRadius: 22, padding: 28, border: "1px solid var(--line, #E3E8F4)", boxShadow: "var(--shadow-card, 0 8px 24px rgba(19, 26, 143, 0.06))" }}>
            <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", color: "var(--indigo, #131A8F)", margin: "0 0 6px", fontSize: 22 }}>
              Primary & Secondary Organization Contacts
            </h2>
            <p style={{ color: "var(--slate, #5B6172)", fontSize: 13.5, marginBottom: 20 }}>
              Enter official contacts. Organization management designates who gets auto-provisioned as the **Tenant Admin (`role: admin`)**.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Primary Contact */}
              <div style={{ background: "var(--wash-a, #F6FAFF)", padding: 20, borderRadius: 16, border: "1px solid var(--line, #E3E8F4)" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--indigo, #131A8F)", textTransform: "uppercase", marginBottom: 12 }}>PRIMARY CONTACT</div>
                <div style={{ display: "grid", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate)", marginBottom: 2 }}>FULL NAME *</label>
                    <input type="text" placeholder="e.g. Dr. K. S. Rao" value={primName} onChange={e => setPrimName(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line)", fontSize: 13.5 }} required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate)", marginBottom: 2 }}>DESIGNATION</label>
                    <input type="text" placeholder="e.g. Medical Director" value={primDesignation} onChange={e => setPrimDesignation(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line)", fontSize: 13.5 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate)", marginBottom: 2 }}>PHONE NUMBER *</label>
                    <input type="tel" placeholder="e.g. +919876543210" value={primPhone} onChange={e => setPrimPhone(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line)", fontSize: 13.5 }} required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate)", marginBottom: 2 }}>WORK EMAIL *</label>
                    <input type="email" placeholder="e.g. admin@apollo.com" value={primEmail} onChange={e => setPrimEmail(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line)", fontSize: 13.5 }} required />
                  </div>
                </div>
              </div>

              {/* Secondary Contact */}
              <div style={{ background: "var(--wash-a, #F6FAFF)", padding: 20, borderRadius: 16, border: "1px solid var(--line, #E3E8F4)" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--slate)", textTransform: "uppercase", marginBottom: 12 }}>SECONDARY CONTACT (OPS / IT LEAD)</div>
                <div style={{ display: "grid", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate)", marginBottom: 2 }}>FULL NAME</label>
                    <input type="text" placeholder="e.g. Suresh Verma" value={secName} onChange={e => setSecName(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line)", fontSize: 13.5 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate)", marginBottom: 2 }}>DESIGNATION</label>
                    <input type="text" placeholder="e.g. Operations Lead" value={secDesignation} onChange={e => setSecDesignation(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line)", fontSize: 13.5 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate)", marginBottom: 2 }}>PHONE NUMBER</label>
                    <input type="tel" placeholder="e.g. +918765432109" value={secPhone} onChange={e => setSecPhone(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line)", fontSize: 13.5 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate)", marginBottom: 2 }}>WORK EMAIL</label>
                    <input type="email" placeholder="e.g. ops@apollo.com" value={secEmail} onChange={e => setSecEmail(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line)", fontSize: 13.5 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Tenant Admin Role Assignment */}
          <div style={{ background: "var(--card, #FFF)", borderRadius: 22, padding: 28, border: "1px solid var(--line, #E3E8F4)", boxShadow: "var(--shadow-card, 0 8px 24px rgba(19, 26, 143, 0.06))" }}>
            <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", color: "var(--indigo, #131A8F)", margin: "0 0 6px", fontSize: 22 }}>
              Organization Tenant Admin Assignment
            </h2>
            <p style={{ color: "var(--slate, #5B6172)", fontSize: 13.5, marginBottom: 16 }}>
              Choose which contact is auto-provisioned into Keycloak & Postgres with **`role: admin`** to log in and manage internal staff roles.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderRadius: 16, border: `2px solid ${adminContactTarget === "primary" ? "var(--indigo)" : "var(--line)"}`, background: adminContactTarget === "primary" ? "#F0F4FF" : "#FFF", cursor: "pointer" }}>
                <input type="radio" name="adminTarget" checked={adminContactTarget === "primary"} onChange={() => setAdminContactTarget("primary")} style={{ width: 18, height: 18, accentColor: "var(--indigo)" }} />
                <div>
                  <div style={{ fontWeight: 800, color: "var(--indigo)", fontSize: 14.5 }}>Assign Primary Contact as Tenant Admin</div>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>{primName ? `${primName} (${primEmail || primPhone})` : "Primary contact"}</div>
                </div>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderRadius: 16, border: `2px solid ${adminContactTarget === "secondary" ? "var(--indigo)" : "var(--line)"}`, background: adminContactTarget === "secondary" ? "#F0F4FF" : "#FFF", cursor: "pointer" }}>
                <input type="radio" name="adminTarget" checked={adminContactTarget === "secondary"} onChange={() => setAdminContactTarget("secondary")} style={{ width: 18, height: 18, accentColor: "var(--indigo)" }} />
                <div>
                  <div style={{ fontWeight: 800, color: "var(--indigo)", fontSize: 14.5 }}>Assign Secondary Contact as Tenant Admin</div>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>{secName ? `${secName} (${secEmail || secPhone})` : "Secondary contact"}</div>
                </div>
              </label>
            </div>
          </div>

          {/* Card 4: Physical Contract Upload & Signatory Audit */}
          <div style={{ background: "var(--card, #FFF)", borderRadius: 22, padding: 28, border: "1px solid var(--line, #E3E8F4)", boxShadow: "var(--shadow-card, 0 8px 24px rgba(19, 26, 143, 0.06))" }}>
            <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", color: "var(--indigo, #131A8F)", margin: "0 0 6px", fontSize: 22 }}>
              Signed Physical Contract Upload & Signatory Verification
            </h2>
            <p style={{ color: "var(--slate, #5B6172)", fontSize: 13.5, marginBottom: 20 }}>
              Upload the scanned physical contract file. **Signatory details must match either Primary Contact or Secondary Contact.**
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 20 }}>
              <div style={{ background: "var(--wash-a, #F6FAFF)", padding: 20, borderRadius: 16, border: "1px solid var(--line, #E3E8F4)" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--indigo, #131A8F)", textTransform: "uppercase", marginBottom: 8 }}>PHYSICAL CONTRACT FILE</div>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setContractFileName(e.target.files[0].name);
                    }
                  }}
                  style={{ fontSize: 13 }}
                />
                {contractFileName && (
                  <div style={{ marginTop: 12, fontSize: 12.5, fontWeight: 700, color: "#1C9A4E" }}>
                    ✓ File Attached: {contractFileName}
                  </div>
                )}
              </div>

              <div style={{ background: "#FFF", padding: 20, borderRadius: 16, border: "1px solid var(--line, #E3E8F4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--slate)", textTransform: "uppercase" }}>CONTRACT SIGNATORY DETAILS</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => handleAutofillSignatory("primary")} style={{ background: "var(--cyan, #5FC6E9)", color: "#04364A", border: "none", borderRadius: 999, padding: "4px 12px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Autofill Primary</button>
                    <button type="button" onClick={() => handleAutofillSignatory("secondary")} style={{ background: "var(--indigo-soft, #E4E9FF)", color: "var(--indigo)", border: "none", borderRadius: 999, padding: "4px 12px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>Autofill Secondary</button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate)", marginBottom: 2 }}>SIGNATORY FULL NAME</label>
                    <input type="text" placeholder="e.g. Dr. K. S. Rao" value={sigName} onChange={e => setSigName(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line)", fontSize: 13.5 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate)", marginBottom: 2 }}>DESIGNATION</label>
                    <input type="text" placeholder="e.g. Medical Director" value={sigDesignation} onChange={e => setSigDesignation(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line)", fontSize: 13.5 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate)", marginBottom: 2 }}>PHONE NUMBER</label>
                    <input type="tel" placeholder="e.g. +919876543210" value={sigPhone} onChange={e => setSigPhone(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line)", fontSize: 13.5 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--slate)", marginBottom: 2 }}>WORK EMAIL</label>
                    <input type="email" placeholder="e.g. admin@apollo.com" value={sigEmail} onChange={e => setSigEmail(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--line)", fontSize: 13.5 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={provisioningLoading}
              style={{ background: "var(--cyan, #5FC6E9)", color: "#04364A", border: "none", borderRadius: 999, padding: "14px 40px", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 16px rgba(95, 198, 233, 0.4)" }}
            >
              {provisioningLoading ? "Provisioning Tenant & Keycloak Identity..." : "⚡ Provision Organization & Issue Admin Access →"}
            </button>
          </div>
        </form>
      )}

      {/* STAGE 2: Tenant Admin Handover Certificate & Access Credentials */}
      {currentStage === 2 && (
        <div style={{ background: "var(--card, #FFF)", borderRadius: 22, padding: 32, border: "1px solid var(--line, #E3E8F4)", boxShadow: "var(--shadow-pop, 0 10px 30px rgba(19, 26, 143, 0.12))", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", color: "var(--indigo, #131A8F)", fontSize: 30, margin: "0 0 8px" }}>
            Tenant Provisioned & Admin Credentials Issued
          </h2>
          <p style={{ color: "var(--slate, #5B6172)", fontSize: 15, maxWidth: 640, margin: "0 auto 28px" }}>
            Database instance and Keycloak <b>`role: admin`</b> account provisioned. Hand over credentials to hospital management to configure their internal facilities & staff.
          </p>

          {/* airliner MediPass Handover Certificate */}
          <div
            style={{
              background: "linear-gradient(135deg, var(--indigo-deep, #0A1166) 0%, var(--indigo, #131A8F) 100%)",
              borderRadius: 22,
              padding: 28,
              color: "#FFF",
              maxWidth: 720,
              margin: "0 auto 32px",
              textAlign: "left",
              boxShadow: "0 12px 32px rgba(10, 17, 102, 0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed rgba(255,255,255,0.3)", paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "var(--cyan, #5FC6E9)", letterSpacing: 1 }}>MEDIGO SaaS TENANT HANDOVER CERTIFICATE</span>
                <div style={{ fontFamily: "var(--font-display, 'Baloo 2', sans-serif)", fontSize: 24, fontWeight: 700 }}>{orgName || tenantId.toUpperCase()}</div>
              </div>
              <span style={{ background: "#E3F5EA", color: "#1C9A4E", borderRadius: 999, padding: "6px 16px", fontWeight: 800, fontSize: 12.5 }}>
                ✓ STATUS: PROVISIONED
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--indigo-soft, #E4E9FF)", fontWeight: 700, textTransform: "uppercase" }}>HOSPITAL LOGIN PORTAL URL</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: "var(--cyan, #5FC6E9)" }}>https://{customUrl || `${tenantId}.hms.zensynq.com`}</div>
              </div>

              <div>
                <div style={{ fontSize: 10, color: "var(--indigo-soft, #E4E9FF)", fontWeight: 700, textTransform: "uppercase" }}>DESIGNATED TENANT ADMIN</div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{adminTargetObj.name || "Tenant Administrator"}</div>
                <div style={{ fontSize: 12, color: "var(--indigo-soft, #E4E9FF)" }}>{adminTargetObj.email || `admin@${tenantId}.com`}</div>
              </div>

              <div>
                <div style={{ fontSize: 10, color: "var(--indigo-soft, #E4E9FF)", fontWeight: 700, textTransform: "uppercase" }}>ASSIGNED SECURITY ROLE</div>
                <span style={{ background: "var(--cyan, #5FC6E9)", color: "#04364A", padding: "2px 10px", borderRadius: 999, fontWeight: 800, fontSize: 12 }}>
                  KEYCLOAK ROLE: ADMIN
                </span>
              </div>

              <div>
                <div style={{ fontSize: 10, color: "var(--indigo-soft, #E4E9FF)", fontWeight: 700, textTransform: "uppercase" }}>INITIAL TEMPORARY PASSCODE</div>
                <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "monospace", color: "#FFD166" }}>{tempPasscode}</div>
              </div>
            </div>

            <div style={{ borderTop: "1px dashed rgba(255,255,255,0.3)", paddingTop: 14, fontSize: 12, color: "var(--indigo-soft, #E4E9FF)", display: "flex", justifyContent: "space-between" }}>
              <span>Database Architecture: <b>{isolatedDb ? "Dedicated Isolated Database" : "Multi-Tenant RLS Protected"}</b></span>
              <span>Region: <b>{region.toUpperCase()}</b></span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            <button
              onClick={handleCopyCredentials}
              style={{ background: "var(--cyan, #5FC6E9)", color: "#04364A", border: "none", borderRadius: 999, padding: "12px 28px", fontWeight: 800, fontSize: 14.5, cursor: "pointer" }}
            >
              {copiedToast ? "✓ Credentials Copied to Clipboard!" : "📋 Copy Admin Handover Credentials"}
            </button>
            <button
              onClick={() => navigate("/tenants")}
              style={{ background: "var(--indigo, #131A8F)", color: "#FFF", border: "none", borderRadius: 999, padding: "12px 28px", fontWeight: 800, fontSize: 14.5, cursor: "pointer" }}
            >
              ← Return to Subscribed Tenants Roster
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
