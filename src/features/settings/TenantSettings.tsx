import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthProvider";
import { Card, FieldCell, Button, Select, StatusPill, Toast, Input } from "../../ui/components";

export default function TenantSettings() {
  const { t } = useTranslation();
  const { tenant } = useAuth();

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Safe editable state (locale preferences) for UI-205
  const [dateFormat, setDateFormat] = useState(
    localStorage.getItem("settings-date-format") || "DD MMM YYYY"
  );
  const [numberFormat, setNumberFormat] = useState(
    localStorage.getItem("settings-number-format") || "en-IN"
  );

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleSave = () => {
    localStorage.setItem("settings-date-format", dateFormat);
    localStorage.setItem("settings-number-format", numberFormat);
    triggerToast("Locale preferences saved successfully!");
  };

  // Tenant specific branding info (UI-205)
  const brandingConfig = {
    apollo: {
      name: "Apollo Hospitals",
      primaryColor: "#131A8F", // Indigo
      accentColor: "#F08125",  // Orange (Gold/Amber style)
      logoSymbol: "🏥 Apollo",
    },
    kims: {
      name: "KIMS Hospitals",
      primaryColor: "#131A8F", // Indigo
      accentColor: "#1C9A4E",  // Green
      logoSymbol: "💚 KIMS",
    },
  }[tenant as "apollo" | "kims"] || {
    name: "MediGo Platform Partner",
    primaryColor: "#131A8F",
    accentColor: "#5FC6E9",
    logoSymbol: "✈️ MediGo",
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--indigo)", margin: "0 0 10px" }}>
        {t("settings_title")}
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Card 1: Branding & Logo Preview (UI-205) */}
        <Card>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
            {t("branding_config")}
          </h2>

          <div style={{ display: "grid", gap: 16 }}>
            <FieldCell label="Subscribed Tenant" sub="Assigned hospital profile group">
              {brandingConfig.name}
            </FieldCell>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                Logo Symbol & Accent Colors Preview
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderRadius: "var(--r-field)",
                  background: "var(--wash-a)",
                  border: `2px solid ${brandingConfig.accentColor}`,
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--indigo)" }}>
                  {brandingConfig.logoSymbol}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: brandingConfig.primaryColor,
                      border: "2px solid #fff",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    }}
                    title="Primary"
                  />
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: brandingConfig.accentColor,
                      border: "2px solid #fff",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    }}
                    title="Accent"
                  />
                </div>
              </div>
            </div>

            <FieldCell label={t("target_market")} sub="Regional compliance profile active">
              Andhra Pradesh, India
            </FieldCell>
          </div>
        </Card>

        {/* Card 2: Feature Flags & Regulatory Restrictions (UI-205) */}
        <Card>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
            Feature Flags & Policies
          </h2>

          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>Pre-visit Patient Portal</strong>
                <div style={{ fontSize: 11.5, color: "var(--slate)" }}>Allows remote pre-registration and check-in</div>
              </div>
              <StatusPill kind="brand">ENABLED</StatusPill>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed var(--line)", paddingTop: 12 }}>
              <div>
                <strong>Aarogyasri / PMJAY Scheme Integration</strong>
                <div style={{ fontSize: 11.5, color: "var(--slate)" }}>Enables cashless scheme eligibility workflows</div>
              </div>
              <StatusPill kind="brand">ENABLED</StatusPill>
            </div>

            {/* Locked referral commission (AP India Regulation AP-4 / REF-010) */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px dashed var(--line)",
                paddingTop: 12,
                opacity: 0.9,
              }}
            >
              <div>
                <strong style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Referral Fee Payouts (REF-010)
                  <span
                    style={{
                      display: "inline-block",
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "var(--slate)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      textAlign: "center",
                      lineHeight: "14px",
                      cursor: "help",
                    }}
                    title="NMC regulations forbid fee splitting or cash incentives for professional medical referrals."
                  >
                    i
                  </span>
                </strong>
                <div style={{ fontSize: 11.5, color: "var(--danger)", fontWeight: 600 }}>
                  {t("nmc_regulation_note")}
                </div>
              </div>
              <StatusPill kind="danger">LOCKED / PROHIBITED</StatusPill>
            </div>
          </div>
        </Card>

        {/* Card 3: Locale Settings - Safe Edits (UI-205) */}
        <Card style={{ gridColumn: "span 2" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
            Editable Regional Preferences
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
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </Card>
      </div>

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
