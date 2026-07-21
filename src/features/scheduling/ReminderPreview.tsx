import React, { useState } from "react";
import { Card, Select, Button, StatusPill, FieldCell } from "../../ui/components";

export default function ReminderPreview() {
  const [locale, setLocale] = useState("te"); // English or Telugu default
  const [channel, setChannel] = useState("sms"); // SMS or Email

  // Pre-compiled merge fields for rendering
  const patientName = "Venkata Rama Rao";
  const doctorName = "Dr. Srinivas";
  const timeString = "21 Jul 2026 at 11:30 AM";
  const facilityName = "Apollo Visakhapatnam";
  const roomName = "Room 101 - Cardiology OPD";

  // Prerequisites merged libraries (UI-305)
  const prereqs = {
    en: [
      { code: "FASTING", label: "1. Fast for 12 hours before test", type: "Required (Hard-Stop)" },
      { code: "CONTRAST_CONSENT", label: "2. Bring signed contrast injection consent", type: "Advisory" },
    ],
    te: [
      { code: "FASTING", label: "1. పరీక్షకు 12 గంటల ముందు ఉపవాసం ఉండాలి", type: "తప్పనిసరి (Hard-Stop)" },
      { code: "CONTRAST_CONSENT", label: "2. సంతకం చేసిన కాంట్రాస్ట్ ఇంజెక్షన్ సమ్మతి పత్రాన్ని తీసుకురండి", type: "సలహా (Advisory)" },
    ],
  }[locale as "en" | "te"];

  const renderSMSBody = () => {
    if (locale === "te") {
      return `ప్రియమైన ${patientName},\n\n${facilityName} లో ${doctorName} తో మీ అపాయింట్‌మెంట్ ${timeString} (${roomName}) కు ఖరారు చేయబడింది.\n\nరాకముందు నిబంధనల తనిఖీ జాబితా:\n${prereqs.map((p) => `- ${p.label} [${p.type}]`).join("\n")}\n\nకన్ఫర్మ్ చేయడానికి: https://hms.zensynq.com/c/appt-1\nక్యాన్సిల్ చేయడానికి: https://hms.zensynq.com/x/appt-1`;
    }
    return `Dear ${patientName},\n\nYour appointment at ${facilityName} with ${doctorName} is confirmed for ${timeString} (${roomName}).\n\nPre-visit check list:\n${prereqs.map((p) => `- ${p.label} [${p.type}]`).join("\n")}\n\nConfirm slot: https://hms.zensynq.com/c/appt-1\nCancel slot: https://hms.zensynq.com/x/appt-1`;
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Card>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
          Patient Notification Template Preview (UI-305 / SCH-006)
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
              Select Language Locale
            </label>
            <Select value={locale} onChange={(e) => setLocale(e.target.value)}>
              <option value="te">Telugu (తెలుగు)</option>
              <option value="en">English (US)</option>
            </Select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
              Delivery Channel
            </label>
            <Select value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option value="sms">SMS Text Message</option>
              <option value="email">HTML Email Template</option>
            </Select>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Render preview screen */}
        <Card style={{ background: channel === "sms" ? "#f4f6fa" : "#fff", border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--slate)" }}>
              {channel === "sms" ? "DEVICE MOBILE SMS PREVIEW" : "INBOX EMAIL PREVIEW"}
            </span>
            <StatusPill kind="info">{locale.toUpperCase()}</StatusPill>
          </div>

          {channel === "sms" ? (
            // SMS Message Preview
            <div
              style={{
                background: "#e5ddd5", // Mock WhatsApp/SMS chat background
                padding: 16,
                borderRadius: "14px",
                maxWidth: 420,
                margin: "10px auto",
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  padding: 12,
                  borderRadius: "10px",
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: "var(--ink)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  whiteSpace: "pre-line",
                }}
              >
                {renderSMSBody()}
              </div>
            </div>
          ) : (
            // HTML Email Template Preview
            <div
              style={{
                border: "1px solid #e1e4ea",
                padding: "24px 30px",
                fontFamily: "var(--font-body)",
                color: "var(--ink)",
                maxWidth: 550,
                margin: "0 auto",
                background: "#ffffff",
              }}
            >
              <div style={{ borderBottom: "3px solid var(--indigo)", paddingBottom: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--indigo)" }}>
                  🏥 MediGo Health
                </span>
              </div>

              <h3 style={{ fontSize: 18, margin: "0 0 12px", fontFamily: "var(--font-display)" }}>
                {locale === "te" ? "అపాయింట్‌మెంట్ కన్ఫర్మేషన్" : "Appointment Booking Confirmation"}
              </h3>

              <p style={{ fontSize: 14, lineHeight: 1.5 }}>
                {locale === "te"
                  ? `నమస్కారం ${patientName}, ${facilityName} లో మీ కింది అపాయింట్‌మెంట్ విజయవంతంగా బుక్ చేయబడింది.`
                  : `Hello ${patientName}, your healthcare appointment has been successfully scheduled at ${facilityName}.`}
              </p>

              <div style={{ background: "var(--wash-a)", padding: 14, borderRadius: "14px", margin: "16px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <FieldCell label="Practitioner">{doctorName}</FieldCell>
                <FieldCell label="Room Location">{roomName}</FieldCell>
                <div style={{ gridColumn: "span 2" }}>
                  <FieldCell label="Scheduled Time">{timeString}</FieldCell>
                </div>
              </div>

              <div style={{ margin: "20px 0" }}>
                <strong style={{ display: "block", fontSize: 13, color: "var(--indigo)", marginBottom: 8 }}>
                  {locale === "te" ? "రాకముందు నిబంధనల జాబితా:" : "Required Pre-Visit Preparation Instructions:"}
                </strong>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--wash-b)", borderBottom: "1px solid var(--line)" }}>
                      <th style={{ textAlign: "left", padding: 8 }}>{locale === "te" ? "నిబంధన" : "Instruction"}</th>
                      <th style={{ textAlign: "right", padding: 8 }}>{locale === "te" ? "రకం" : "Enforcement"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prereqs.map((p) => (
                      <tr key={p.code} style={{ borderBottom: "1px dashed var(--line)" }}>
                        <td style={{ padding: 8, color: "var(--ink)" }}>{p.label}</td>
                        <td style={{ padding: 8, textAlign: "right", fontWeight: 700, color: p.type.includes("Required") || p.type.includes("తప్పనిసరి") ? "var(--danger)" : "var(--orange)" }}>
                          {p.type}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
                <a href="#confirm" style={{ display: "inline-block", background: "var(--green)", color: "#fff", textDecoration: "none", padding: "8px 20px", borderRadius: "20px", fontSize: 12.5, fontWeight: 700 }}>
                  {locale === "te" ? "ధృవీకరించండి" : "Confirm Slot"}
                </a>
                <a href="#cancel" style={{ display: "inline-block", border: "1px solid var(--danger)", color: "var(--danger)", textDecoration: "none", padding: "8px 20px", borderRadius: "20px", fontSize: 12.5, fontWeight: 700 }}>
                  {locale === "te" ? "రద్దు చేయండి" : "Cancel Appointment"}
                </a>
              </div>
            </div>
          )}
        </Card>

        {/* Dynamic Placeholders Documentation */}
        <Card style={{ background: "var(--wash-a)", border: "none" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 10px" }}>
            Merge Variables Description
          </h3>
          <p style={{ fontSize: 13, color: "var(--slate)", lineHeight: 1.5, marginBottom: 14 }}>
            In production, action links are generated dynamically with encrypted route parameters:
          </p>

          <div style={{ display: "grid", gap: 12, fontSize: 12.5 }}>
            <div>
              <strong>Confirm Action Placeholders:</strong>
              <div style={{ color: "var(--slate)" }}>
                Validates appointment check-in pre-clearance directly from SMS notification clicks (POR-009).
              </div>
            </div>
            <div>
              <strong>Cancel Action Placeholders:</strong>
              <div style={{ color: "var(--slate)" }}>
                Cancels appointment slot allocation, freeing room schedule instantly.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
