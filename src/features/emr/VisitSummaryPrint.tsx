import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Button, Card, FieldCell, StatusPill, Skeleton } from "../../ui/components";

export default function VisitSummaryPrint() {
  const { id: patientId } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  // Fetch Patient Summary
  const { data: summary, isLoading } = useQuery({
    queryKey: ["patientSummary", patientId],
    queryFn: () => api.getPatientSummary(token, patientId || ""),
    enabled: !!patientId,
  });

  // Automatically trigger browser print dialog on load (optional but helpful!)
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

  const demographics = summary.demographics as any;
  const { allergies, problems, medications } = summary;

  return (
    <div style={{ padding: "20px 0" }}>
      {/* Control bar - hidden in print layout */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, background: "var(--wash-a)", padding: 12, borderRadius: "14px" }}>
        <span style={{ fontSize: 13.5, color: "var(--slate)" }}>
          🖨️ Printer Friendly Layout: formatted for standard A4 page sizes.
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <Button ghost onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={handlePrint}>Print Summary Instructions</Button>
        </div>
      </div>

      {/* Styled Printable A4 Document Container */}
      <div
        className="print-container"
        style={{
          background: "#fff",
          border: "1px solid var(--line)",
          padding: "40px 50px",
          borderRadius: "var(--r-card)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          maxWidth: 800,
          margin: "0 auto",
          fontFamily: "var(--font-body)",
          color: "var(--ink)",
        }}
      >
        {/* Hospital Letterhead Header */}
        <div style={{ borderBottom: "3px solid var(--indigo)", paddingBottom: 16, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--indigo)", margin: 0 }}>
              🏥 Apollo Visakhapatnam
            </h1>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>
              Health City, Arilova, Visakhapatnam, Andhra Pradesh - 530040
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <strong style={{ fontSize: 15, color: "var(--indigo)" }}>PATIENT INSTRUCTIONS SUMMARY</strong>
            <div style={{ fontSize: 12, color: "var(--slate)" }}>
              Date: {new Date().toLocaleDateString("en-IN")}
            </div>
          </div>
        </div>

        {/* Demographics Card Grid */}
        <div style={{ background: "var(--wash-a)", padding: 16, borderRadius: "14px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
          <FieldCell label="Patient Name">
            {demographics.given_name} {demographics.family_name}
          </FieldCell>
          <FieldCell label="Date of Birth / Age">
            {demographics.dob || "N/A"}
          </FieldCell>
          <FieldCell label="Gender">
            {demographics.gender || "N/A"}
          </FieldCell>
          <FieldCell label="ABHA Health ID">
            {demographics.abha_number || "Not linked"}
          </FieldCell>
          <FieldCell label="Contact Phone">
            {demographics.phone || "N/A"}
          </FieldCell>
          <FieldCell label="Referrer Attribution">
            {demographics.referred_by_name || "Self referred"}
          </FieldCell>
        </div>

        {/* Active Conditions Section */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 10px", borderBottom: "1px solid var(--line)", paddingBottom: 6 }}>
            Diagnosed Conditions / Problems
          </h3>
          {problems.length === 0 ? (
            <p style={{ fontSize: 13, fontStyle: "italic", margin: 0 }}>No active problems recorded.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: "var(--wash-b)" }}>
                  <th style={{ textAlign: "left", padding: 8 }}>ICD-10 Code</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Description</th>
                  <th style={{ textAlign: "right", padding: 8 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: 8, fontWeight: 700 }}>{p.code}</td>
                    <td style={{ padding: 8 }}>{p.display}</td>
                    <td style={{ padding: 8, textAlign: "right" }}>{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Active Prescriptions Medication SIG section */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 10px", borderBottom: "1px solid var(--line)", paddingBottom: 6 }}>
            Prescribed Medications & Administration SIG
          </h3>
          {medications.length === 0 ? (
            <p style={{ fontSize: 13, fontStyle: "italic", margin: 0 }}>No prescriptions registered.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: "var(--wash-b)" }}>
                  <th style={{ textAlign: "left", padding: 8 }}>Medication Formulation</th>
                  <th style={{ textAlign: "left", padding: 8 }}>SIG Instructions</th>
                </tr>
              </thead>
              <tbody>
                {medications.map((m: any) => (
                  <tr key={m.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: 8, fontWeight: 700 }}>{m.drug_name}</td>
                    <td style={{ padding: 8 }}>{m.sig}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Upcoming pre-visit prerequisites checks */}
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 10px", borderBottom: "1px solid var(--line)", paddingBottom: 6 }}>
            Clinical Follow-up & Prerequisites Checks
          </h3>
          <p style={{ fontSize: 14, margin: "0 0 12px" }}>
            Please return for follow-up evaluation in <strong>2 weeks</strong>.
          </p>

          <div style={{ background: "rgba(240, 129, 37, 0.05)", border: "1px solid var(--orange)", padding: 14, borderRadius: "14px" }}>
            <strong style={{ fontSize: 13, color: "var(--orange)", display: "block", marginBottom: 6 }}>
              Required pre-visit preparation checks (తెలుగు వివరణ):
            </strong>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13.5, display: "grid", gap: 6 }}>
              <li>
                <strong>FASTING (తప్పనిసరి):</strong> Fast for 12 hours before test (12 గంటలు ఖాళీ కడుపుతో ఉండాలి)
              </li>
              <li>
                <strong>SCAN_PREVIOUS (సలహా):</strong> Bring previous report scans (మునుపటి నివేదిక తీసుకురండి)
              </li>
            </ul>
          </div>
        </div>

        {/* Doctor Signature block */}
        <div style={{ marginTop: 40, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ textAlign: "center", width: 200 }}>
            <div style={{ borderBottom: "1px solid #000", height: 40, marginBottom: 6 }}></div>
            <strong style={{ fontSize: 13 }}>Dr. Srinivas (Cardiology)</strong>
            <div style={{ fontSize: 11, color: "var(--slate)" }}>Reg No: AP-403912</div>
          </div>
        </div>
      </div>

      {/* Embedded print css overrides */}
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
