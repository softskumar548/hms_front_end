import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Toast, Skeleton } from "../../ui/components";

export default function ReferralAnalytics() {
  const { token } = useAuth();
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Fetch Referral Analytics data (UI-604)
  const { data: attributions = [], isLoading } = useQuery({
    queryKey: ["referralAnalytics"],
    queryFn: () => api.listReferralAnalytics(token),
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleExportCSV = () => {
    triggerToast("Exporting clinical referral analytics data to CSV (Referral_Attributions_Report.csv)...");
  };

  if (isLoading) {
    return (
      <div style={{ padding: 40 }}>
        <Skeleton height={200} />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Header section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--indigo)", margin: 0 }}>
            Referrer Attributions & Volumes Report (UI-604)
          </h2>
          <span style={{ fontSize: 13, color: "var(--slate)" }}>
            Evaluate patient volumes, diagnostics attribution counts, and clinical site distribution from external referrers.
          </span>
        </div>

        <Button onClick={handleExportCSV}>
          📥 Export report as CSV
        </Button>
      </div>

      {/* India lock banner notification */}
      <div style={{ background: "rgba(240, 129, 37, 0.05)", border: "1px solid var(--orange)", padding: 14, borderRadius: "14px", color: "var(--orange)", fontSize: 13 }}>
        🛡️ <strong>Regulatory Notice (India Lock - NMC Directive)</strong>: Monetary payouts, financial fee splits, and referral fee attribution details are locked and hidden in this view to strictly comply with Indian National Medical Commission fee-splitting regulations.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Left Side: Attributions list table */}
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
            Attributed Referral Volumes Summary
          </h3>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: "var(--wash-b)" }}>
                <th style={{ textAlign: "left", padding: 10 }}>Referring Practitioner</th>
                <th style={{ textAlign: "left", padding: 10 }}>Primary Facility Site</th>
                <th style={{ textAlign: "right", padding: 10 }}>Attributed Patient Visits</th>
                <th style={{ textAlign: "right", padding: 10 }}>Fee Payout Dues</th>
              </tr>
            </thead>
            <tbody>
              {attributions.map((row: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: 10, fontWeight: 700 }}>{row.referrer_name}</td>
                  <td style={{ padding: 10 }}>{row.site}</td>
                  <td style={{ padding: 10, textAlign: "right", fontWeight: 700, color: "var(--indigo)" }}>
                    {row.visits} visits
                  </td>
                  <td style={{ padding: 10, textAlign: "right", color: "var(--slate)", fontStyle: "italic", fontSize: 12 }}>
                    [🔒 NMC Lock - Prohibited]
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Right Side: Attributions by service category summary */}
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
            Attributed Diagnostics Categories
          </h3>

          <div style={{ display: "grid", gap: 12 }}>
            {[
              { category: "Cardiology CT Scans", count: 18, pct: "55%" },
              { category: "Endocrinology Lab Panels", count: 10, pct: "30%" },
              { category: "General OPD Consultation Checks", count: 5, pct: "15%" }
            ].map((cat, idx) => (
              <div key={idx} style={{ borderBottom: "1px solid var(--wash-b)", paddingBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span>{cat.category}</span>
                  <strong>{cat.count} orders ({cat.pct})</strong>
                </div>
                <div style={{ width: "100%", height: 6, background: "var(--wash-b)", borderRadius: "var(--r-pill)", marginTop: 6, overflow: "hidden" }}>
                  <div style={{ width: cat.pct, height: "100%", background: "var(--indigo)", borderRadius: "var(--r-pill)" }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
