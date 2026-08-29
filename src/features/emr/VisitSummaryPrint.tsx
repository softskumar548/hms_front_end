import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Button, FieldCell, Skeleton } from "../../ui/components";

export default function VisitSummaryPrint() {
  const { id: patientId } = useParams<{ id: string }>();
  const { token, tenant } = useAuth();
  const navigate = useNavigate();

  // Fetch Patient Summary
  const { data: summary, isLoading } = useQuery({
    queryKey: ["patientSummary", patientId],
    queryFn: () => api.getPatientSummary(token, patientId || ""),
    enabled: !!patientId,
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !summary) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Skeleton height={200} />
      </div>
    );
  }

  const demographics = (summary as any).demographics || {};
  const { allergies = [], problems = [], medications = [] } = summary as any;
  const vitals = (summary as any).vitals || [];
  const latestVitals = vitals.length > 0 ? vitals[0] : null;

  return (
    <div style={{ padding: "16px 0" }}>
      {/* Control bar - hidden in print layout */}
      <div
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          background: "var(--wash-a)",
          padding: "12px 20px",
          borderRadius: "14px",
          border: "1px solid var(--line)",
          maxWidth: 820,
          margin: "0 auto 20px",
        }}
      >
        <div>
          <strong style={{ fontSize: 14, color: "var(--indigo)" }}>
            MediPass Electronic Prescription & Clinical Summary
          </strong>
          <span style={{ fontSize: 12, color: "var(--slate)", display: "block" }}>
            Formatted for standard A4 clinical discharge & pharmacy dispenses
          </span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button ghost onClick={() => navigate(-1)}>← Back</Button>
          <Button
            onClick={handlePrint}
            style={{ background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)", color: "#fff" }}
          >
            🖨️ Print Prescription (A4)
          </Button>
        </div>
      </div>

      {/* Styled Printable A4 Document Container */}
      <div
        className="print-container"
        style={{
          background: "#fff",
          border: "1px solid var(--line)",
          padding: "36px 44px",
          borderRadius: 16,
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          maxWidth: 820,
          margin: "0 auto",
          fontFamily: "var(--font-body)",
          color: "var(--ink)",
        }}
      >
        {/* Hospital Letterhead Header */}
        <div style={{ borderBottom: "3px solid var(--indigo)", paddingBottom: 14, marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 24 }}>🏥</span>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--indigo)", margin: 0, textTransform: "uppercase" }}>
                {tenant ? `${tenant.replace("_", " ")} HOSPITAL` : "ZEN CLINIC"}
              </h1>
            </div>
            <span style={{ fontSize: 12, color: "var(--slate)", display: "block", marginTop: 3 }}>
              Health City, Arilova, Visakhapatnam, Andhra Pradesh · PIN: 530040 · Ph: +91 891 2548900
            </span>
            <span style={{ fontSize: 11, color: "var(--indigo)", fontWeight: 700 }}>
              ABDM HFR Facility ID: AP-HFR-2026-90214 · NMC/APMC Licensed Medical Center
            </span>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ background: "var(--indigo-soft)", color: "var(--indigo)", padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 800, textTransform: "uppercase", display: "inline-block", marginBottom: 4 }}>
              OUTPATIENT RX & SUMMARY
            </div>
            <div style={{ fontSize: 12, color: "var(--slate)" }}>
              Date: <strong>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</strong>
            </div>
            <div style={{ fontSize: 11, color: "var(--slate)" }}>
              Time: {new Date().toLocaleTimeString("en-IN", { timeStyle: "short" })}
            </div>
          </div>
        </div>

        {/* Demographics Card Grid */}
        <div style={{ background: "var(--wash-a)", padding: 14, borderRadius: 12, display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1.2fr", gap: 10, marginBottom: 18, border: "1px solid var(--line)" }}>
          <FieldCell label="Patient Name">
            <strong>{demographics.given_name} {demographics.family_name}</strong>
          </FieldCell>
          <FieldCell label="Gender / Age">
            {demographics.gender || "M"}, {demographics.dob || "Adult"}
          </FieldCell>
          <FieldCell label="UHID / National ID">
            <span style={{ fontFamily: "monospace", fontWeight: 700 }}>
              {demographics.national_id || `UHID-${demographics.id?.slice(0, 6) || "90812"}`}
            </span>
          </FieldCell>
          <FieldCell label="Mobile / Contact">
            +91 {demographics.phone || "9876543210"}
          </FieldCell>
        </div>

        {/* Persistent Allergy Warning (EMR-005) */}
        {allergies.length > 0 && (
          <div style={{ background: "#FEF2F2", border: "1px solid #DC2626", borderRadius: 8, padding: "8px 14px", color: "#991B1B", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12 }}>
              🚨 <strong>KNOWN DRUG ALLERGIES:</strong> {allergies.map((a: any) => a.substance_display || a.name).join(", ")}
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 800, background: "#DC2626", color: "#fff", padding: "2px 8px", borderRadius: 4 }}>
              CONTRAINDICATION
            </span>
          </div>
        )}

        {/* Encounter Vitals Check */}
        {latestVitals && (
          <div style={{ display: "flex", gap: 16, background: "var(--wash-a)", padding: "8px 14px", borderRadius: 8, fontSize: 12, marginBottom: 16, border: "1px solid var(--line)" }}>
            <span><strong>BP:</strong> {latestVitals.bps}/{latestVitals.bpd} mmHg</span>
            <span><strong>Pulse:</strong> {latestVitals.pulse} bpm</span>
            <span><strong>Temp:</strong> {latestVitals.temp}°F</span>
            {latestVitals.spo2 && <span><strong>SpO2:</strong> {latestVitals.spo2}%</span>}
          </div>
        )}

        {/* Active Conditions Section */}
        <div style={{ marginBottom: 18 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--indigo)", margin: "0 0 8px", borderBottom: "1px solid var(--line)", paddingBottom: 4 }}>
            Diagnosed Clinical Assessment (ICD-10)
          </h3>
          {problems.length === 0 ? (
            <p style={{ fontSize: 12.5, fontStyle: "italic", margin: 0 }}>Clinical consultation review complete.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: "var(--wash-b)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", width: 120 }}>ICD Code</th>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Diagnosis Description</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", width: 100 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "6px 8px", fontWeight: 700, fontFamily: "monospace" }}>{p.code}</td>
                    <td style={{ padding: "6px 8px" }}>{p.display}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", color: "#16A34A", fontWeight: 700 }}>{p.status || "Active"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* E-Prescription Medication Rx Table with Telugu */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid var(--indigo)", paddingBottom: 4, marginBottom: 8 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--indigo)", margin: 0 }}>
              ℞ Prescribed Medications & Dosage Instructions (ఔషధాల వివరాలు)
            </h3>
            <span style={{ fontSize: 11, color: "var(--slate)" }}>Take strictly as directed</span>
          </div>

          {medications.length === 0 ? (
            <p style={{ fontSize: 12.5, fontStyle: "italic", margin: 0 }}>No prescription medications issued for this visit.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: "var(--wash-b)" }}>
                  <th style={{ textAlign: "left", padding: "8px 10px", width: "35%" }}>Medicine / Brand</th>
                  <th style={{ textAlign: "left", padding: "8px 10px", width: "25%" }}>Dosage & Route</th>
                  <th style={{ textAlign: "left", padding: "8px 10px", width: "40%" }}>Timing & Telugu Instructions</th>
                </tr>
              </thead>
              <tbody>
                {medications.map((m: any, idx: number) => (
                  <tr key={m.id || idx} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "8px 10px" }}>
                      <strong style={{ display: "block", color: "var(--ink)" }}>
                        {idx + 1}. {m.drug_name || m.name}
                      </strong>
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      <div style={{ fontWeight: 600, color: "var(--indigo)" }}>
                        {m.sig || `${m.dose || "1 Tab"} · ${m.frequency || "1-0-1"}`}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--slate)" }}>
                        Duration: {m.duration || "5 Days"}
                      </span>
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      <div style={{ fontWeight: 600 }}>{m.timing || "After Food (ఆహారం తర్వాత)"}</div>
                      {m.telugu && (
                        <div style={{ fontSize: 11.5, color: "#166534", marginTop: 2 }}>
                          🗣️ {m.telugu}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Follow-up & Prerequisites */}
        <div style={{ marginBottom: 24, background: "var(--wash-a)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
          <strong style={{ fontSize: 12.5, color: "var(--indigo)", display: "block", marginBottom: 4 }}>
            📅 Clinical Follow-up & Lifestyle Advice:
          </strong>
          <p style={{ fontSize: 12.5, margin: "0 0 6px", color: "var(--ink)" }}>
            Please return for review consultation after <strong>1 week</strong> or sooner if symptoms persist.
          </p>
          <div style={{ fontSize: 11.5, color: "#92400E", background: "#FEF3C7", padding: "6px 10px", borderRadius: 6 }}>
            ⚠️ <strong>Fasting Pre-requisite:</strong> If blood tests are ordered, maintain 10-12 hours overnight fasting prior to sample collection.
          </div>
        </div>

        {/* Doctor Signature & Stamp Block */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 30, paddingTop: 14, borderTop: "1px dashed var(--line)" }}>
          <div style={{ fontSize: 11, color: "var(--slate)", maxWidth: 360 }}>
            <div>Valid electronic prescription generated via MediGo HMS.</div>
            <div style={{ fontFamily: "monospace", letterSpacing: 4, marginTop: 4, fontWeight: 700 }}>
              ||| | |||| ||| ||||| ||||
            </div>
          </div>

          <div style={{ textAlign: "center", width: 220 }}>
            <div style={{ height: 35 }}></div>
            <strong style={{ fontSize: 13, color: "var(--indigo)", display: "block" }}>
              Dr. K R Murali (Dean)
            </strong>
            <div style={{ fontSize: 11.5, color: "var(--slate)" }}>
              MBBS, MD (General Medicine)
            </div>
            <div style={{ fontSize: 11, color: "var(--slate)", fontFamily: "monospace" }}>
              APMC Reg No: APMC-2026-98124
            </div>
          </div>
        </div>
      </div>

      {/* Embedded print CSS overrides */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #fff !important;
          }
          .print-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
