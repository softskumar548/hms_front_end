import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button } from "../../ui/components";

export default function OnboardingChecklist() {
  const { token } = useAuth();
  const [selectedTip, setSelectedTip] = useState<string | null>(null);

  // Fetch metrics/summary list to determine checklist status dynamically
  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api.listPatients(token),
  });

  const { data: visits = [] } = useQuery({
    queryKey: ["portalVisits"],
    queryFn: () => api.getPortalVisits(token),
  });

  // Checklist verification rules
  const hasPatient = patients.length > 0;
  const hasAppointment = visits.length > 0;
  const hasEncounter = visits.some((v: any) => v.status === "signed" || v.forms_completed);
  const hasPayments = visits.some((v: any) => v.status === "paid");

  const checklistItems = [
    {
      key: "register",
      title: "1. Register First Patient (వ్యక్తిగత నమోదు)",
      desc: "Go to Patient Registry form and assert custom Apollo cashless identifiers.",
      status: hasPatient,
      link: "/patients/new",
      tip: "Apollo requires National ID; KIMS requires ABDM ABHA. Check settings to verify rules.",
    },
    {
      key: "appointment",
      title: "2. Schedule Queue Consultations (నియామకం షెడ్యూల్)",
      desc: "Assign a calendar consultation OPD slot to trigger pre-visit preparation checks.",
      status: hasAppointment,
      link: "/scheduling",
      tip: "Select a practitioner, search availability, and book to print their flight pass style MediPass ticket.",
    },
    {
      key: "emr",
      title: "3. Complete EMR SOAP check (వైద్య నివేదిక)",
      desc: "Document clinical diagnosis assertations and penicillin safety drug overrides.",
      status: hasEncounter,
      link: "/emr",
      tip: "SOAP saves debounces drafts. ICD-10 is mandatory to authorize and sign off clinical notes.",
    },
    {
      key: "billing",
      title: "4. Settle cashless invoices (బిల్లు చెల్లింపు)",
      desc: "Verify 100% cashless PMJAY splits and cashier daily till reconciliation counters.",
      status: hasPayments,
      link: "/billing",
      tip: "Cashier payments till tracks partial collections and expected drawer balances discrepancies.",
    }
  ];

  return (
    <Card style={{ background: "var(--indigo-soft)", border: "1px solid var(--indigo)", color: "var(--indigo)" }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "var(--indigo)", margin: "0 0 10px" }}>
        🚀 Seeded Tour Checklist (గెట్టింగ్ స్టార్టెడ్)
      </h3>
      <p style={{ fontSize: 12.5, color: "var(--indigo-deep)", margin: "0 0 14px", lineHeight: 1.5 }}>
        Welcome to your first run experience! Complete these onboarding milestones to prepare the clinic workspace.
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        {checklistItems.map((item) => (
          <div
            key={item.key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: "#fff",
              borderRadius: "14px",
              border: item.status ? "1px solid var(--green)" : "1px solid var(--line)",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: item.status ? "var(--green)" : "var(--indigo-deep)", textDecoration: item.status ? "line-through" : "none" }}>
                  {item.title}
                </span>
                {item.status ? (
                  <span style={{ color: "var(--green)", fontSize: 12, fontWeight: 700 }}>✓ Done</span>
                ) : (
                  <span style={{ color: "var(--slate)", fontSize: 11 }}>Pending</span>
                )}
              </div>
              <span style={{ fontSize: 11.5, color: "var(--slate)", display: "block", marginTop: 2 }}>
                {item.desc}
              </span>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setSelectedTip(selectedTip === item.key ? null : item.key)}
                style={{
                  border: "none",
                  background: "var(--wash-a)",
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--indigo)"
                }}
                title="Workflow tips guide"
              >
                ?
              </button>
              {!item.status && (
                <Link to={item.link} style={{ textDecoration: "none" }}>
                  <Button style={{ fontSize: 11.5, padding: "4px 10px", background: "var(--indigo)" }}>
                    Go
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTip && (
        <div style={{ marginTop: 14, background: "#fff", borderLeft: "4px solid var(--indigo)", padding: 12, borderRadius: "8px", fontSize: 12, color: "var(--ink)", lineHeight: 1.5 }}>
          <strong>Guide Hint:</strong> {checklistItems.find(i => i.key === selectedTip)?.tip}
        </div>
      )}
    </Card>
  );
}
