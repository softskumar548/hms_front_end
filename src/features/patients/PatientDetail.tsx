import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Skeleton, Button, StatusPill, FieldCell } from "../../ui/components";
import PatientHeader from "./PatientHeader";

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  // Fetch Patient Details
  const { data: patient, isLoading, isError, refetch } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => api.getPatient(token, id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <Skeleton height={140} />
        <Skeleton height={200} />
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <Card style={{ margin: "40px auto", maxWidth: 500, textAlign: "center", padding: 32 }}>
        <StatusPill kind="danger">Error</StatusPill>
        <h2 style={{ fontFamily: "var(--font-display)", marginTop: 16, marginBottom: 8, color: "var(--ink)" }}>
          Failed to load patient
        </h2>
        <p style={{ color: "var(--slate)", fontSize: 14.5, marginBottom: 24 }}>
          Could not retrieve the patient record details.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Button ghost onClick={() => refetch()}>
            Retry
          </Button>
          <Link
            to="/patients"
            style={{
              display: "inline-block",
              background: "var(--indigo)",
              color: "#fff",
              textDecoration: "none",
              padding: "10px 24px",
              borderRadius: "var(--r-pill)",
              fontWeight: 800,
              fontSize: 13.5,
            }}
          >
            Return to Patients
          </Link>
        </div>
      </Card>
    );
  }

  // Cast nested objects from unknown
  const address = (patient.address as any) || {};
  const nextOfKin = (patient.next_of_kin as any) || {};

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Persistent Patient Clinical Header (UI-204) */}
      <PatientHeader patient={patient} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Card 1: Registration Details */}
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, color: "var(--indigo)", margin: "0 0 16px" }}>
            Demographic & Address Details
          </h3>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)" }}>Street Address</span>
              <span style={{ fontSize: 14, color: "var(--ink)" }}>{address.line1 || "—"}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)" }}>City & State</span>
              <span style={{ fontSize: 14, color: "var(--ink)" }}>
                {address.city ? `${address.city}, ` : ""}{address.state || "Andhra Pradesh"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)" }}>Postal Code</span>
              <span style={{ fontSize: 14, color: "var(--ink)" }}>{address.postal_code || "—"}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, borderTop: "1px dashed var(--line)", paddingTop: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)" }}>Preferred Language</span>
              <span style={{ fontSize: 14, color: "var(--ink)" }}>
                {patient.preferred_language === "te" ? "Telugu (తెలుగు)" : "English"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)" }}>Email Address</span>
              <span style={{ fontSize: 14, color: "var(--ink)" }}>{patient.email || "—"}</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Next of Kin & Contacts */}
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, color: "var(--indigo)", margin: "0 0 16px" }}>
            Next of Kin Emergency Contacts
          </h3>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)" }}>Contact Name</span>
              <span style={{ fontSize: 14, color: "var(--ink)" }}>{nextOfKin.name || "—"}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)" }}>Relationship</span>
              <span style={{ fontSize: 14, color: "var(--ink)" }}>{nextOfKin.relationship || "—"}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)" }}>Phone Number</span>
              <span style={{ fontSize: 14, color: "var(--ink)" }}>{nextOfKin.phone || "—"}</span>
            </div>
          </div>
        </Card>

        {/* Card 3: Referral attribution summary & timeline (UI-203 / REF-064) */}
        <Card style={{ gridColumn: "span 2" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, color: "var(--indigo)", margin: 0 }}>
              Referrer Attribution & History (REF-061)
            </h3>
            <Button data-testid="tab-referral-timeline" type="button" ghost style={{ fontSize: 12 }}>
              View Timeline
            </Button>
          </div>

          <div data-testid="referral-timeline" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <FieldCell label="Referrer Name" sub={`Type: ${patient.referred_by_type || "doctor"}`}>
              {patient.referred_by_name || "Dr. A. Srinivas"}
            </FieldCell>
            <FieldCell label="Referrer Status" sub="Payout Lock Status (REF-010)">
              <span style={{ color: "var(--danger)", fontWeight: 700 }}>Fee Payout Blocked (India Market)</span>
            </FieldCell>
            <FieldCell label="India Referral Lock" sub="Fee splitting check">
              NMC Regulatory Lock In Force
            </FieldCell>
          </div>
        </Card>
      </div>
    </div>
  );
}
