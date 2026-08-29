/** Operator Profile & Security Management Screen.
 * Tailored exclusively for SaaS Platform Super Operators.
 * Captures operator identity, Keycloak password reset, MFA parameters,
 * and multi-tenant platform fleet administration scopes.
 */
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button, Input, StatusPill, Toast, FieldCell } from "../../ui/components";

export const OperatorProfileScreen: React.FC<{ token: string | null }> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab") || "profile";

  // Operator Profile State
  const [operatorName, setOperatorName] = useState(
    localStorage.getItem("operator_profile_name") || "Platform Super Administrator"
  );
  const [operatorEmail, setOperatorEmail] = useState(
    localStorage.getItem("operator_profile_email") || "operator@zensynq.com"
  );
  const [operatorPhone, setOperatorPhone] = useState(
    localStorage.getItem("operator_profile_phone") || "+91 91002 42466"
  );
  const [operatorDesignation, setOperatorDesignation] = useState(
    localStorage.getItem("operator_profile_designation") || "Chief SaaS Systems Architect"
  );

  // Password Reset State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("operator_profile_name", operatorName);
    localStorage.setItem("operator_profile_email", operatorEmail);
    localStorage.setItem("operator_profile_phone", operatorPhone);
    localStorage.setItem("operator_profile_designation", operatorDesignation);
    triggerToast("✓ Operator profile updated successfully!");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!newPassword || newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match. Please verify.");
      return;
    }

    // Persist new passcode demo status
    localStorage.setItem("operator_pass_updated_at", new Date().toISOString());
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    triggerToast("✓ Keycloak OIDC password reset successfully!");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1080 }}>
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
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ background: "var(--cyan)", color: "#04364A", borderRadius: 999, padding: "4px 14px", fontWeight: 800, fontSize: 12 }}>
              PLATFORM OPERATOR CONSOLE
            </span>
            <span style={{ background: "rgba(255,255,255,0.18)", color: "#FFF", borderRadius: 999, padding: "4px 14px", fontWeight: 700, fontSize: 12 }}>
              🛡️ PHI-Free Session
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", margin: 0, fontSize: 26, fontWeight: 700 }}>
            Operator Profile & Security Management
          </h1>
          <p style={{ margin: "4px 0 0", color: "var(--indigo-soft)", fontSize: 13.5, opacity: 0.9 }}>
            Platform operator credentials, Keycloak authentication, and active session controls
          </p>
        </div>

        <button
          onClick={() => navigate("/operator/dashboard")}
          style={{
            background: "var(--indigo-soft)",
            color: "var(--indigo)",
            border: "none",
            borderRadius: "var(--r-pill)",
            padding: "10px 22px",
            fontWeight: 800,
            cursor: "pointer",
            fontSize: 13.5,
          }}
        >
          ← Return to Dashboard
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: 12, borderBottom: "2px solid var(--line)", paddingBottom: 2 }}>
        <button
          type="button"
          onClick={() => navigate("/operator/profile?tab=profile")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "profile" ? "3px solid var(--indigo)" : "3px solid transparent",
            padding: "10px 20px",
            fontSize: 15,
            fontWeight: activeTab === "profile" ? 800 : 600,
            color: activeTab === "profile" ? "var(--indigo)" : "var(--slate)",
            cursor: "pointer",
            marginBottom: -2,
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>👤</span> Operator Profile & Identity
        </button>

        <button
          type="button"
          onClick={() => navigate("/operator/profile?tab=security")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "security" ? "3px solid var(--indigo)" : "3px solid transparent",
            padding: "10px 20px",
            fontSize: 15,
            fontWeight: activeTab === "security" ? 800 : 600,
            color: activeTab === "security" ? "var(--indigo)" : "var(--slate)",
            cursor: "pointer",
            marginBottom: -2,
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>🔑</span> Password Reset & Security
        </button>
      </div>

      {/* TAB 1: OPERATOR PROFILE */}
      {activeTab === "profile" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, alignItems: "start" }}>
          <Card style={{ padding: 28 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 6px", color: "var(--indigo)" }}>
              Personal & Contact Details
            </h2>
            <p style={{ fontSize: 13, color: "var(--slate)", margin: "0 0 20px" }}>
              Operator administrative identity visible on break-glass overrides and tenant audit trails.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  FULL OPERATOR NAME <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <Input
                  autoFocus
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  placeholder="e.g. Platform Super Administrator"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  LOGIN EMAIL ADDRESS <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <Input
                  type="email"
                  value={operatorEmail}
                  onChange={(e) => setOperatorEmail(e.target.value)}
                  placeholder="e.g. operator@zensynq.com"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                    PHONE NUMBER
                  </label>
                  <Input
                    type="tel"
                    value={operatorPhone}
                    onChange={(e) => setOperatorPhone(e.target.value)}
                    placeholder="e.g. +91 91002 42466"
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                    OFFICIAL DESIGNATION
                  </label>
                  <Input
                    value={operatorDesignation}
                    onChange={(e) => setOperatorDesignation(e.target.value)}
                    placeholder="e.g. Lead Systems Engineer"
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <Button type="submit">Save Profile Details</Button>
              </div>
            </form>
          </Card>

          {/* Right Column: Platform Fleet Privileges */}
          <div style={{ display: "grid", gap: 16 }}>
            <Card style={{ padding: 24, background: "var(--wash-a, #F8FAFC)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ background: "var(--indigo)", color: "#fff", width: 40, height: 40, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 18, fontWeight: 800 }}>
                  🛡️
                </div>
                <div>
                  <strong style={{ fontSize: 15, color: "var(--indigo)", display: "block" }}>Platform Fleet Access</strong>
                  <span style={{ fontSize: 12, color: "var(--slate)" }}>Keycloak Security Scope</span>
                </div>
              </div>

              <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--line)" }}>
                  <span style={{ color: "var(--slate)" }}>Security Role:</span>
                  <StatusPill kind="brand">operator</StatusPill>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--line)" }}>
                  <span style={{ color: "var(--slate)" }}>Tenancy Scope:</span>
                  <strong>__operator__ (Global Fleet)</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--line)" }}>
                  <span style={{ color: "var(--slate)" }}>Tenant Provisioning:</span>
                  <span style={{ color: "var(--green)", fontWeight: 700 }}>✓ Granted</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--line)" }}>
                  <span style={{ color: "var(--slate)" }}>Break-Glass Overrides:</span>
                  <span style={{ color: "var(--green)", fontWeight: 700 }}>✓ Enabled</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                  <span style={{ color: "var(--slate)" }}>PHI Isolation:</span>
                  <span style={{ color: "var(--indigo)", fontWeight: 700 }}>Strict PHI-Free</span>
                </div>
              </div>
            </Card>

            <Card style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--slate)", textTransform: "uppercase", margin: "0 0 10px" }}>
                Global Infrastructure Node
              </h3>
              <div style={{ fontSize: 12.5, color: "var(--slate)", lineHeight: 1.6 }}>
                <div>• <b>Region:</b> India (Andhra Pradesh / Mumbai Dedicated VPS)</div>
                <div>• <b>Database:</b> PostgreSQL 16 with Row-Level Security</div>
                <div>• <b>Auth Engine:</b> Keycloak OIDC 24.0 (Realm: hms)</div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: PASSWORD RESET & SECURITY */}
      {activeTab === "security" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, alignItems: "start" }}>
          <Card style={{ padding: 28 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 6px", color: "var(--indigo)" }}>
              Reset Operator Password
            </h2>
            <p style={{ fontSize: 13, color: "var(--slate)", margin: "0 0 20px" }}>
              Update your Keycloak OIDC password. Requires strong credentials with minimum 8 characters.
            </p>

            {passwordError && (
              <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: "12px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
                ⚠️ {passwordError}
              </div>
            )}

            <form onSubmit={handleResetPassword} style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  CURRENT OPERATOR PASSWORD
                </label>
                <Input
                  autoFocus
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password (if verifying)"
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  NEW PASSWORD <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                    required
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 16,
                      color: "var(--slate)",
                    }}
                  >
                    {showNewPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  CONFIRM NEW PASSWORD <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password to confirm"
                    required
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 16,
                      color: "var(--slate)",
                    }}
                  >
                    {showConfirmPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <Button type="submit" disabled={!newPassword || !confirmPassword}>
                  Update Keycloak Password
                </Button>
              </div>
            </form>
          </Card>

          {/* Security Best Practices & Active Session */}
          <div style={{ display: "grid", gap: 16 }}>
            <Card style={{ padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--indigo)", textTransform: "uppercase", margin: "0 0 14px" }}>
                Active OIDC Session Details
              </h3>
              <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
                <FieldCell label="OIDC Token Issuer" sub="Standard Keycloak RS256">
                  http://keycloak:8080/realms/hms
                </FieldCell>
                <FieldCell label="Multi-Factor Auth (MFA)" sub="Enterprise TOTP Rule">
                  ACTIVE & ENFORCED
                </FieldCell>
              </div>
            </Card>

            <Card style={{ padding: 20, background: "#FEF3C7", border: "1px solid #F59E0B" }}>
              <strong style={{ fontSize: 13.5, color: "#92400E", display: "block", marginBottom: 6 }}>
                🔒 Operator Security Requirement
              </strong>
              <p style={{ fontSize: 12, color: "#78350F", margin: 0, lineHeight: 1.5 }}>
                Platform operators have tenant creation and emergency suspension overrides. Always maintain strong 12+ character passphrases and store backups in your organization password vault.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
};
