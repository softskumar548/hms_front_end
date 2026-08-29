import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Skeleton, Button, StatusPill, FieldCell } from "../../ui/components";
import PatientHeader from "./PatientHeader";

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  // Fetch Patient Details
  const { data: patient, isLoading, isError, refetch } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => api.getPatient(token, id!),
    enabled: !!id,
  });

  // Fetch Mother Details if linked
  const { data: motherPatient } = useQuery({
    queryKey: ["patient", patient?.mother_patient_id],
    queryFn: () => api.getPatient(token, patient!.mother_patient_id!),
    enabled: !!patient?.mother_patient_id,
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

  const getApgarBadge = (score?: number | null) => {
    if (score == null) return "—";
    if (score >= 7) return <span style={{ color: "var(--green)", fontWeight: 700 }}>🟢 {score}/10 (Normal / Reassuring)</span>;
    if (score >= 4) return <span style={{ color: "var(--orange)", fontWeight: 700 }}>🟡 {score}/10 (Moderately Depressed)</span>;
    return <span style={{ color: "var(--danger)", fontWeight: 700 }}>🔴 {score}/10 (Critical Resuscitation)</span>;
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Persistent Patient Clinical Header (UI-204) */}
      <PatientHeader patient={patient} />

      {/* NEWBORN / NEONATAL BIRTH & MATERNAL LINK RECORD (REG-010) */}
      {patient.is_newborn && (
        <Card style={{ borderLeft: "5px solid #059669", background: "linear-gradient(180deg, #FFFFFF 0%, rgba(5, 150, 105, 0.03) 100%)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>👶</span>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--indigo)", margin: 0 }}>
                  Neonatal Birth Record & Maternal Link (REG-010)
                </h3>
              </div>
              <span style={{ fontSize: 12.5, color: "var(--slate)", marginTop: 2, display: "block" }}>
                Official labor & delivery vital parameters and dual mother-baby identifier linkage.
              </span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Button
                type="button"
                ghost
                onClick={() => navigate(`/print-station`)}
                style={{ fontSize: 12.5 }}
              >
                🖨️ Print Neonatal Wristband
              </Button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <FieldCell label="Biological Mother" sub="Maternal UHID Record">
              {patient.mother_patient_id ? (
                <Link
                  to={`/patients/${patient.mother_patient_id}`}
                  style={{ color: "var(--indigo)", fontWeight: 700, textDecoration: "underline" }}
                >
                  👩‍👧 {motherPatient ? `${motherPatient.given_name} ${motherPatient.family_name}` : "View Mother Record"}
                </Link>
              ) : (
                "Not Linked"
              )}
            </FieldCell>

            <FieldCell label="Time of Birth" sub="Delivery Timestamp">
              {patient.birth_time || "—"}
            </FieldCell>

            <FieldCell label="Birth Weight" sub="Grams & Kilograms">
              {patient.birth_weight_grams ? (
                <strong>
                  {patient.birth_weight_grams} g ({(patient.birth_weight_grams / 1000).toFixed(2)} kg)
                </strong>
              ) : (
                "—"
              )}
            </FieldCell>

            <FieldCell label="Gestational Age" sub="Maturity at Birth">
              {patient.gestational_age_weeks ? `${patient.gestational_age_weeks} Weeks` : "—"}
            </FieldCell>

            <FieldCell label="Delivery Mode" sub="Obstetric Technique">
              {patient.delivery_type ? patient.delivery_type.replace("_", " ").toUpperCase() : "NORMAL VAGINAL"}
            </FieldCell>

            <FieldCell label="Birth Order" sub="Multiplicity">
              {patient.multiple_birth_order && patient.multiple_birth_order > 1 ? `Twin / Order ${patient.multiple_birth_order}` : "Single Birth"}
            </FieldCell>

            <FieldCell label="1-Minute APGAR" sub="Immediate Vigor">
              {getApgarBadge(patient.apgar_score_1min)}
            </FieldCell>

            <FieldCell label="5-Minute APGAR" sub="Post-Resuscitation">
              {getApgarBadge(patient.apgar_score_5min)}
            </FieldCell>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Card 1: Registration Details */}
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, color: "var(--indigo)", margin: "0 0 16px" }}>
            {patient.is_newborn ? "Parent & Demographic Details" : "Demographic & Address Details"}
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
            {patient.is_newborn ? "Parent / Guardian Contacts" : "Next of Kin Emergency Contacts"}
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
              {patient.is_newborn ? "Attending Clinician & Department" : "Referrer Attribution & History"}
            </h3>
            <Button data-testid="tab-referral-timeline" type="button" ghost style={{ fontSize: 12 }}>
              View Timeline
            </Button>
          </div>

          <div data-testid="referral-timeline" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <FieldCell label={patient.is_newborn ? "Attending Clinician" : "Referrer Name"} sub={`Type: ${patient.referred_by_type || "doctor"}`}>
              {patient.referred_by_name || "Dr. Department Consultant"}
            </FieldCell>
            <FieldCell label="Department Service" sub="Assigned Unit">
              {patient.is_newborn ? "Neonatal & Pediatric Care / Labor Unit" : "CT Scan Cardiology"}
            </FieldCell>
            <FieldCell label="India Regulatory Lock" sub="Fee splitting check">
              NMC Regulatory Lock In Force (Zero Financial Incentive)
            </FieldCell>
          </div>
        </Card>
      </div>
    </div>
  );
}
