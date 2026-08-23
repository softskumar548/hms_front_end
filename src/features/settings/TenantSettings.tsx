import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, FieldCell, Button, Select, StatusPill, Toast, Input } from "../../ui/components";

export default function TenantSettings() {
  const { t } = useTranslation();
  const { token, tenant, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab") || "brand";

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Invite staff modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("doctor");
  const [inviteName, setInviteName] = useState("");

  // Safe editable state (locale preferences)
  const [dateFormat, setDateFormat] = useState(
    localStorage.getItem("settings-date-format") || "DD MMM YYYY"
  );
  const [numberFormat, setNumberFormat] = useState(
    localStorage.getItem("settings-number-format") || "en-IN"
  );

  // Print settings
  const [printHeader, setPrintHeader] = useState(
    localStorage.getItem(`print-header-${tenant}`) || `${(tenant || "ZEN CLINIC").toUpperCase()} SPECIALTY MEDICAL CENTER`
  );
  const [printPhone, setPrintPhone] = useState(
    localStorage.getItem(`print-phone-${tenant}`) || "+91 91002 42466"
  );
  const [includeBarcode, setIncludeBarcode] = useState(true);

  // Brand config
  const defaultOrgName = tenant ? tenant.replace(/[_|-]/g, " ").toUpperCase() : "ZEN CLINIC";
  const [brandName, setBrandName] = useState(
    localStorage.getItem(`brand-name-${tenant}`) || defaultOrgName
  );
  const [brandColor, setBrandColor] = useState(
    localStorage.getItem(`brand-color-${tenant}`) || "#131A8F"
  );
  const [accentColor, setAccentColor] = useState(
    localStorage.getItem(`accent-color-${tenant}`) || "#5FC6E9"
  );

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleSaveLocale = () => {
    localStorage.setItem("settings-date-format", dateFormat);
    localStorage.setItem("settings-number-format", numberFormat);
    triggerToast("Locale preferences saved successfully!");
  };

  const handleSavePrint = () => {
    localStorage.setItem(`print-header-${tenant}`, printHeader);
    localStorage.setItem(`print-phone-${tenant}`, printPhone);
    triggerToast("Print & Receipt template settings saved!");
  };

  const handleSaveBrand = () => {
    localStorage.setItem(`brand-name-${tenant}`, brandName);
    localStorage.setItem(`brand-color-${tenant}`, brandColor);
    localStorage.setItem(`accent-color-${tenant}`, accentColor);
    triggerToast("Branding settings updated successfully!");
  };

  const handleTabChange = (tabKey: string) => {
    navigate(`/settings?tab=${tabKey}`);
  };

  // Fetch practitioners & sites for Configuration/Users tab
  const { data: practitioners = [] } = useQuery({
    queryKey: ["practitioners", tenant],
    queryFn: () => api.listPractitioners(token),
  });

  const { data: sites = [] } = useQuery({
    queryKey: ["sites", tenant],
    queryFn: () => api.listSites(token),
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services", tenant],
    queryFn: () => api.listServices(token),
  });

  const inviteStaffMutation = useMutation({
    mutationFn: () =>
      api.inviteStaff(token, tenant || "zen_clinic", {
        email: inviteEmail,
        role: inviteRole,
        given_name: inviteName.split(" ")[0] || "Staff",
        family_name: inviteName.split(" ")[1] || "Member",
      }),
    onSuccess: () => {
      triggerToast(`Invitation sent to ${inviteEmail} (${inviteRole})!`);
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteName("");
      qc.invalidateQueries({ queryKey: ["practitioners"] });
    },
    onError: (err: any) => {
      triggerToast(err.message || "Failed to dispatch staff invitation.");
    },
  });

  const tabList = [
    { key: "brand", label: "🎨 Brand Related" },
    { key: "print", label: "🖨️ Print Settings" },
    { key: "config", label: "⚙️ Configuration" },
    { key: "account", label: "🏢 Account Settings" },
    { key: "auth", label: "🔐 User Authentication" },
    { key: "users", label: "👥 Users & Staff" },
    { key: "payment", label: "💳 Payment Settings" },
    { key: "online", label: "🌐 Online Services" },
    { key: "regional", label: "🌍 Regional Preferences" },
  ];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--indigo)", margin: "0 0 4px" }}>
          Clinic Administration & Settings
        </h1>
        <p style={{ color: "var(--slate)", fontSize: 13.5, margin: 0 }}>
          Manage your hospital brand identity, print templates, staff access, and integration parameters.
        </p>
      </div>

      {/* Tab Navigation Chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
        {tabList.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              style={{
                background: isActive ? "var(--indigo)" : "#ffffff",
                color: isActive ? "#ffffff" : "var(--slate)",
                border: isActive ? "1px solid var(--indigo)" : "1px solid var(--line)",
                padding: "8px 16px",
                borderRadius: "var(--r-pill, 999px)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: isActive ? "0 4px 12px rgba(19, 26, 143, 0.2)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: BRAND SETTINGS */}
      {activeTab === "brand" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              Hospital Brand Identity
            </h2>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Display Hospital Name
                </label>
                <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                    Primary Theme Color
                  </label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} style={{ width: 36, height: 36, border: "none", borderRadius: 6, cursor: "pointer" }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{brandColor}</span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                    Accent Highlight Color
                  </label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ width: 36, height: 36, border: "none", borderRadius: 6, cursor: "pointer" }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{accentColor}</span>
                  </div>
                </div>
              </div>

              <FieldCell label="Custom Hospital Subdomain" sub="SaaS endpoint mapped">
                https://{tenant || "zen_clinic"}.hms.zensynq.com
              </FieldCell>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <Button onClick={handleSaveBrand}>Save Brand Settings</Button>
              </div>
            </div>
          </Card>

          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              Branded Header Preview
            </h2>
            <div style={{ padding: 20, borderRadius: 16, background: "var(--wash-a)", border: `2px dashed ${accentColor}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ background: brandColor, color: "#fff", width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 18 }}>
                    🏥
                  </div>
                  <div>
                    <strong style={{ fontSize: 17, color: "var(--indigo)", display: "block" }}>{brandName}</strong>
                    <span style={{ fontSize: 12, color: "var(--slate)" }}>Andhra Pradesh, India · ABDM Active</span>
                  </div>
                </div>
                <StatusPill kind="brand">VERIFIED</StatusPill>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--slate)", margin: 0, lineHeight: 1.5 }}>
                This branding appears on your patient portals, digital prescription letterheads, and MediPass flight-style boarding stubs.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: PRINT SETTINGS */}
      {activeTab === "print" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              Prescription & Receipt Letterhead
            </h2>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Letterhead Top Header Line
                </label>
                <Input value={printHeader} onChange={(e) => setPrintHeader(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Clinic Contact Numbers for Receipts
                </label>
                <Input value={printPhone} onChange={(e) => setPrintPhone(e.target.value)} />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="barcode-chk"
                  checked={includeBarcode}
                  onChange={(e) => setIncludeBarcode(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <label htmlFor="barcode-chk" style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                  Print 2D / Code-128 Barcodes on MediPass appointment stubs
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <Button onClick={handleSavePrint}>Save Print Settings</Button>
              </div>
            </div>
          </Card>

          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              Print Output Preview
            </h2>
            <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 10, padding: 18, fontFamily: "monospace", fontSize: 12 }}>
              <div style={{ textAlign: "center", borderBottom: "1px dashed #000", paddingBottom: 8, marginBottom: 8 }}>
                <strong>{printHeader}</strong>
                <div>Ph: {printPhone} | GSTIN / Registration: AP-2026-MED</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0" }}>
                <span>PATIENT: VENKATA RAMA RAO</span>
                <span>TOKEN: #004</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0" }}>
                <span>CONSULTANT: DR K R MURALI (DEAN)</span>
                <span>DATE: 23-AUG-2026</span>
              </div>
              {includeBarcode && (
                <div style={{ textAlign: "center", borderTop: "1px dashed #000", paddingTop: 8, marginTop: 8, letterSpacing: 4, fontWeight: 700 }}>
                  ||| ||||| |||| |||||| |||| |||
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: CONFIGURATION (Sites, Rooms, Services) */}
      {activeTab === "config" && (
        <div style={{ display: "grid", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <strong style={{ color: "var(--indigo)" }}>Facility Sites</strong>
                <StatusPill kind="info">{sites.length || 1} Active</StatusPill>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--slate)" }}>Main clinic facility and outpatient satellite campuses.</p>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginTop: 8 }}>
                📍 {tenant ? tenant.replace(/[_|-]/g, " ").toUpperCase() : "ZEN CLINIC"} Main Campus
              </div>
            </Card>

            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <strong style={{ color: "var(--indigo)" }}>Consultation Rooms</strong>
                <StatusPill kind="info">OPD Ready</StatusPill>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--slate)" }}>Consulting chambers and diagnostic examination cubicles.</p>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginTop: 8 }}>
                🚪 Room 101 (General OPD), Room 102 (Specialist)
              </div>
            </Card>

            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <strong style={{ color: "var(--indigo)" }}>Services Master</strong>
                <StatusPill kind="success">{services.length || 4} Configured</StatusPill>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--slate)" }}>Consultation charge master and diagnostic test catalog.</p>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginTop: 8 }}>
                📋 General Consult, Specialist Consult, Health Check
              </div>
            </Card>
          </div>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 4px" }}>
                  Setup Readiness & Go-Live Verification
                </h3>
                <span style={{ fontSize: 13, color: "var(--slate)" }}>
                  Evaluates all 6 setup readiness checks (Facility sites, consultation rooms, practitioners, charge master, and security).
                </span>
              </div>
              <Button ghost onClick={() => navigate("/onboarding")}>Open Onboarding Setup →</Button>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: ACCOUNT SETTINGS */}
      {activeTab === "account" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              Tenant Subscription & Legal Entity
            </h2>
            <div style={{ display: "grid", gap: 14 }}>
              <FieldCell label="Subscribed Tenant ID" sub="Unique SaaS identifier">{tenant || "zen_clinic"}</FieldCell>
              <FieldCell label="Designated Tenant Administrator" sub="Medical Director / Dean">DR K R MURALI (DEAN)</FieldCell>
              <FieldCell label="Admin Contact Email" sub="Identity login email">drkrmurali9090@yopmail.com</FieldCell>
              <FieldCell label="Admin Contact Phone" sub="SMS alert dispatch">+91 91002 42466</FieldCell>
            </div>
          </Card>

          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              Contract & Compliance Attestation
            </h2>
            <div style={{ display: "grid", gap: 14 }}>
              <FieldCell label="Contract Signatory" sub="Designation: DEAN">DR K R MURALI</FieldCell>
              <FieldCell label="Attestation Document" sub="Verified digital agreement">signed_terms_contract.pdf</FieldCell>
              <FieldCell label="Deployment Region" sub="Data residency policy">Andhra Pradesh (India VPS)</FieldCell>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
                <span>Account Status:</span>
                <StatusPill kind="success">PROVISIONED & ACTIVE</StatusPill>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: USER AUTHENTICATION */}
      {activeTab === "auth" && (
        <Card>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
            Identity & Authentication Security (Keycloak OIDC)
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ display: "grid", gap: 14 }}>
              <FieldCell label="Authentication Authority" sub="OIDC RS256 Provider">
                https://stage.zensynq.com/auth/realms/hms
              </FieldCell>
              <FieldCell label="Client Identity" sub="SPA PKCE S256 Protocol">
                hms-web
              </FieldCell>
              <FieldCell label="Single Sign-On Scope" sub="Granted token claims">
                openid, profile, email, app.tenant_id
              </FieldCell>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 10 }}>
                <div>
                  <strong>Declarative User Profile</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>Tenant claim mapped to app.tenant_id</div>
                </div>
                <StatusPill kind="success">ACTIVE</StatusPill>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 10 }}>
                <div>
                  <strong>Multi-Factor Authentication (MFA)</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>OTP verification for clinical roles</div>
                </div>
                <StatusPill kind="brand">OPTIONAL</StatusPill>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>Session Security Policy</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>Token expiry: 30 minutes with silent refresh</div>
                </div>
                <StatusPill kind="info">ENFORCED</StatusPill>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 6: USERS & STAFF */}
      {activeTab === "users" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 4px", color: "var(--indigo)" }}>
                Hospital Practitioners & Staff Directory
              </h2>
              <span style={{ fontSize: 13, color: "var(--slate)" }}>
                Manage login identities, roles, and consultation availability.
              </span>
            </div>
            <Button onClick={() => setShowInviteModal(true)}>+ Invite New Staff</Button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Staff Name</th>
                <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Email / Username</th>
                <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Role</th>
                <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--indigo)" }}>DR K R MURALI (Dean)</td>
                <td style={{ padding: "12px 14px" }}>drkrmurali9090@yopmail.com</td>
                <td style={{ padding: "12px 14px" }}><StatusPill kind="brand">admin</StatusPill></td>
                <td style={{ padding: "12px 14px" }}><StatusPill kind="success">Active (Keycloak)</StatusPill></td>
              </tr>
              {practitioners.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 700 }}>{p.name}</td>
                  <td style={{ padding: "12px 14px" }}>{p.email || `${p.id}@${tenant || "zen_clinic"}.com`}</td>
                  <td style={{ padding: "12px 14px" }}><StatusPill kind="info">{p.role || "doctor"}</StatusPill></td>
                  <td style={{ padding: "12px 14px" }}><StatusPill kind="success">Active</StatusPill></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Staff Invite Modal */}
          {showInviteModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", zIndex: 9999 }}>
              <Card style={{ width: "100%", maxWidth: 440, padding: 24, borderRadius: 20 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--indigo)", margin: "0 0 16px" }}>
                  Invite Hospital Staff
                </h3>
                <div style={{ display: "grid", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>Full Name</label>
                    <Input placeholder="e.g. Dr. A. Sharma" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>Email Address</label>
                    <Input placeholder="e.g. doctor@zen_clinic.com" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>Role Assignment</label>
                    <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                      <option value="doctor">Doctor / Clinician (OPD & EMR)</option>
                      <option value="nurse">Nurse (Triage & Vitals)</option>
                      <option value="receptionist">Receptionist (Check-in & Scheduling)</option>
                      <option value="billing">Billing Clerk (Cashier & Invoicing)</option>
                      <option value="admin">Tenant Administrator</option>
                    </Select>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                    <Button ghost type="button" onClick={() => setShowInviteModal(false)}>Cancel</Button>
                    <Button
                      type="button"
                      disabled={!inviteEmail || inviteStaffMutation.isPending}
                      onClick={() => inviteStaffMutation.mutate()}
                    >
                      {inviteStaffMutation.isPending ? "Sending..." : "Send Invitation"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </Card>
      )}

      {/* TAB 7: PAYMENT SETTINGS */}
      {activeTab === "payment" && (
        <Card>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
            Cashier Till & Payment Gateway Parameters
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ display: "grid", gap: 14 }}>
              <FieldCell label="Accepted Payment Modes" sub="Configured payment collection rails">
                UPI QR, Cash Drawer, Card (POS Terminal)
              </FieldCell>
              <FieldCell label="Cashier Daily Till Variance Threshold" sub="Triggers till reconciliation warning">
                ₹500.00
              </FieldCell>
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 10 }}>
                <div>
                  <strong>Aarogyasri / PMJAY 100% Cashless</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>Direct government scheme billing split</div>
                </div>
                <StatusPill kind="success">ENABLED</StatusPill>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>Referral Fee Commissions (REF-010)</strong>
                  <div style={{ fontSize: 12, color: "var(--danger)" }}>Prohibited under NMC medical ethics rules</div>
                </div>
                <StatusPill kind="danger">LOCKED OFF</StatusPill>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 8: ONLINE SERVICES */}
      {activeTab === "online" && (
        <Card>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
            ABDM & Online Healthcare Integrations
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 10 }}>
                <div>
                  <strong>ABDM ABHA Milestone 1 (M1)</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>Aadhaar & mobile OTP ABHA creation & verification</div>
                </div>
                <StatusPill kind="success">READY</StatusPill>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 10 }}>
                <div>
                  <strong>ABDM Milestone 2 (M2 - HIP)</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>Health Information Provider FHIR R4 bridging</div>
                </div>
                <StatusPill kind="brand">SANDBOX</StatusPill>
              </div>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 10 }}>
                <div>
                  <strong>Patient Pre-visit Portal</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>Fast-track mobile check-in & prerequisites</div>
                </div>
                <StatusPill kind="success">ACTIVE</StatusPill>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>SMS / WhatsApp Notifications Gateway</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>Pre-visit preparation rules & MediPass delivery</div>
                </div>
                <StatusPill kind="success">ACTIVE</StatusPill>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 9: REGIONAL PREFERENCES */}
      {activeTab === "regional" && (
        <Card>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
            Regional & Date Format Preferences
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                Preferred Date Format
              </label>
              <Select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                <option value="DD MMM YYYY">21 Jul 2026 (Indian Standard)</option>
                <option value="DD/MM/YYYY">21/07/2026</option>
                <option value="YYYY-MM-DD">2026-07-21 (ISO Standard)</option>
              </Select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                Number Format & Currency Display
              </label>
              <Select value={numberFormat} onChange={(e) => setNumberFormat(e.target.value)}>
                <option value="en-IN">Lakh / Crore (e.g. ₹1,50,000.00)</option>
                <option value="en-US">Million / Billion (e.g. ₹150,000.00)</option>
              </Select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleSaveLocale}>Save Locale Preferences</Button>
          </div>
        </Card>
      )}

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
