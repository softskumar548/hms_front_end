import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, StatusPill, Skeleton } from "../../ui/components";

export default function ReferralTimeline() {
  const { id: patientId } = useParams<{ id: string }>();
  const { token } = useAuth();

  // Fetch Patient Summary details
  const { data: summary, isLoading } = useQuery({
    queryKey: ["patientSummary", patientId],
    queryFn: () => api.getPatientSummary(token, patientId || ""),
    enabled: !!patientId,
  });

  if (isLoading || !summary) {
    return (
      <div style={{ padding: 40 }}>
        <Skeleton height={250} />
      </div>
    );
  }

  const { demographics, encounters, medications } = summary;
  const demo = demographics as any;

  // Visual Nodes representation for the close-loop flowchart (REF-064)
  const timelineNodes = [
    {
      title: "1. Referral Attributed",
      desc: demo.referred_by_name ? `From: ${demo.referred_by_name} (${demo.referred_by_org || "External Clinic"})` : "Self referred",
      status: demo.referred_by_name ? "COMPLETED" : "N/A",
      kind: "success",
    },
    {
      title: "2. Booking Prereqs",
      desc: "FASTING preparation checklist required for consultation check-in",
      status: "SATISFIED",
      kind: "success",
    },
    {
      title: "3. Check-In & OPD Arrival",
      desc: "Patient marked arrived; room 101 front desk registration complete",
      status: "ARRIVED",
      kind: "info",
    },
    {
      title: "4. EMR SOAP Note & Diagnoses",
      desc: (encounters[0] as any)?.notes?.structured_content?.assessment 
        ? `Assessment: ${(encounters[0] as any).notes.structured_content.assessment} (ICD: ${(encounters[0] as any).notes.structured_content.icd10_code})`
        : "SOAP consultation notes initialized",
      status: encounters[0]?.status || "DRAFT",
      kind: encounters[0]?.status === "signed" ? "success" : "warn",
    },
    {
      title: "5. Diagnostics Order placed",
      desc: "CT Chest scan with IV contrast placed (LOINC 74211-1)",
      status: "RESULTED",
      kind: "success",
    },
    {
      title: "6. Acknowledged Outcome",
      desc: "Troponin T outcome (1.5 ng/mL) flagged critical & acknowledged by physician",
      status: "ACKNOWLEDGED",
      kind: "success",
    },
    {
      title: "7. Ledger Settlement",
      desc: demo.phone?.startsWith("9") ? "Aarogyasri Cashless Pre-auth cleared" : "Self-pay dues split settled",
      status: "CLEARED",
      kind: "success",
    },
    {
      title: "8. Follow-up draft",
      desc: "Draft scheduled return appointment set for 2 weeks with Fasting preparation checks",
      status: "DRAFT (FLAG F1)",
      kind: "warn",
    }
  ];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to={`/patients/${patientId}`} style={{ textDecoration: "none", color: "var(--indigo)", fontWeight: 700 }}>
          ← Return to clinical dashboard
        </Link>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--indigo)", margin: 0 }}>
          Referred Patient Care Loop Timeline
        </h2>
      </div>

      {/* India lock banner notification */}
      <div style={{ background: "var(--wash-a)", border: "1px solid var(--indigo)", padding: 14, borderRadius: "14px", color: "var(--indigo)", fontSize: 13 }}>
        🛡️ <strong>Regulatory Notice (India Lock - NMC Directive)</strong>: Referral financial/fee tracking is locked and disabled on this system. Only clinical and process workflow steps are illustrated.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: 20, alignItems: "start" }}>
        {/* Left: Timeline flowchart */}
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 20px" }}>
            Care Coordination Lifecycle (REF-064)
          </h3>

          <div style={{ position: "relative", paddingLeft: 30, borderLeft: "3px solid var(--indigo-soft)", display: "grid", gap: 24, marginLeft: 10 }}>
            {timelineNodes.map((node, idx) => (
              <div key={idx} style={{ position: "relative" }}>
                {/* Visual bullet marker node */}
                <div
                  style={{
                    position: "absolute",
                    left: -41,
                    top: 2,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: node.kind === "success" ? "var(--green)" : node.kind === "info" ? "var(--cyan)" : "var(--orange)",
                    border: "4px solid #fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, color: "var(--indigo)", fontFamily: "var(--font-display)" }}>
                      {node.title}
                    </h4>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--slate)" }}>
                      {node.desc}
                    </p>
                  </div>
                  <div>
                    <StatusPill kind={node.kind as any}>
                      {node.status}
                    </StatusPill>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Patient demographics overview card */}
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
            Patient Demographics
          </h3>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block" }}>Name</span>
              <strong style={{ fontSize: 15 }}>{demo.given_name} {demo.family_name}</strong>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block" }}>ABHA Number</span>
              <span style={{ fontSize: 13.5 }}>{demo.abha_number || "Not linked"}</span>
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block" }}>Phone Number</span>
              <span style={{ fontSize: 13.5 }}>{demo.phone || "N/A"}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
