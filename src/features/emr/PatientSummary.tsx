import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, StatusPill, Skeleton, Toast } from "../../ui/components";
import PatientHeader from "../patients/PatientHeader";

export default function PatientSummary() {
  const { id: patientId } = useParams<{ id: string }>();
  const { token, role, tenant } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Fetch Patient Demographics
  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => api.getPatient(token, patientId || ""),
    enabled: !!patientId,
  });

  // Fetch Patient Summary (UI-401)
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ["patientSummary", patientId],
    queryFn: () => api.getPatientSummary(token, patientId || ""),
    enabled: !!patientId,
  });

  // Create new encounter mutation
  const createEncounterMutation = useMutation({
    mutationFn: () =>
      api.createEncounter(token, {
        patient_id: patientId || "",
        practitioner_id: `doc_${tenant}_1`, // seeded practitioner for the active tenant
        site_id: `site_${tenant}_main`,
      }),
    onSuccess: (data) => {
      triggerToast("New clinical encounter initialized.");
      qc.invalidateQueries({ queryKey: ["patientSummary", patientId] });
      navigate(`/emr/patients/${patientId}/encounter/${data.id}`);
    },
    onError: () => {
      triggerToast("Failed to initialize new encounter.");
    },
  });

  if (isLoading) {
    return (
      <div style={{ display: "grid", gap: 20 }}>
        <Skeleton height={120} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
          <Skeleton height={300} />
          <Skeleton height={300} />
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div style={{ color: "var(--danger)", padding: 20, textAlign: "center" }}>
        ⚠️ Failed to load clinical summary details. Please verify connections.
      </div>
    );
  }

  const { demographics, allergies, problems, medications, recent_vitals, encounters } = summary;

  // BP validation logic: BP > 140/90 is flagged warning (UI-401)
  const checkHighBP = (bps: number, bpd: number) => bps > 140 || bpd > 90;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Demographics Header & Allergy Banner (UI-204) */}
      {patient && <PatientHeader patient={patient} />}

      {/* Main Clinical Summary Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, alignItems: "start" }}>
        {/* Left Side: Problems & Medications */}
        <div style={{ display: "grid", gap: 20 }}>
          {/* Active Problems Card */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: 0 }}>
                Active Conditions / Problems
              </h3>
            </div>
            {problems.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--slate)", fontStyle: "italic", margin: 0 }}>
                No active conditions recorded.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {problems.map((p: any) => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", border: "1px solid var(--line)", borderRadius: "10px" }}>
                    <div>
                      <strong style={{ fontSize: 13.5, color: "var(--ink)" }}>{p.display}</strong>
                      <span style={{ fontSize: 11.5, color: "var(--slate)", display: "block" }}>
                        ICD-10: {p.code} · Recorded: {new Date(p.recorded_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <StatusPill kind="info">{p.status}</StatusPill>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Current Medications Card */}
          <Card>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 12px" }}>
              Active Medications
            </h3>
            {medications.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--slate)", fontStyle: "italic", margin: 0 }}>
                No active medications statements.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {medications.map((m: any) => (
                  <div key={m.id} style={{ padding: "8px 12px", border: "1px solid var(--line)", borderRadius: "10px" }}>
                    <strong style={{ fontSize: 13.5, color: "var(--ink)" }}>{m.drug_name}</strong>
                    <span style={{ fontSize: 12, color: "var(--slate)", display: "block", marginTop: 2 }}>
                      SIG: {m.sig}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Vitals Trend & Encounter Timeline */}
        <div style={{ display: "grid", gap: 20 }}>
          {/* Vitals Trend Visual Card (UI-401) */}
          <Card>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
              Vitals Historical Trend
            </h3>
            {recent_vitals.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--slate)", fontStyle: "italic", margin: 0 }}>
                No vitals data recorded yet.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 16 }}>
                {/* Visual Chart Bars for Systolic / Diastolic Pressure */}
                <div style={{ display: "flex", gap: 14, height: 120, alignItems: "flex-end", background: "var(--wash-a)", padding: 14, borderRadius: "14px", border: "1px solid var(--line)" }}>
                  {recent_vitals.map((v: any, idx: number) => {
                    const hasHigh = checkHighBP(v.bps, v.bpd);
                    return (
                      <div key={v.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: hasHigh ? "var(--danger)" : "var(--indigo)" }}>
                          {v.bps}/{v.bpd}
                        </span>
                        {/* Mock vertical bar height representing BP magnitude */}
                        <div style={{ display: "flex", width: 14, height: 50, background: "var(--line)", borderRadius: 6, overflow: "hidden", flexDirection: "column", justifyContent: "flex-end" }}>
                          <div style={{ height: `${(v.bps / 200) * 100}%`, background: hasHigh ? "var(--danger)" : "var(--indigo)", width: "100%" }}></div>
                        </div>
                        <span style={{ fontSize: 10, color: "var(--slate)" }}>
                          T-{idx + 1}
                        </span>
                      </div>
                    );
                  })}
                  <div style={{ marginLeft: "auto", display: "grid", gap: 6, fontSize: 11, color: "var(--slate)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 8, height: 8, background: "var(--indigo)", borderRadius: "50%" }}></span> Normal BP
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 8, height: 8, background: "var(--danger)", borderRadius: "50%" }}></span> Out of range
                    </div>
                  </div>
                </div>

                {/* Vitals Detail List */}
                <div style={{ display: "grid", gap: 8 }}>
                  {recent_vitals.map((v: any) => {
                    const highBP = checkHighBP(v.bps, v.bpd);
                    return (
                      <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--line)", borderRadius: "10px" }}>
                        <span style={{ fontSize: 12, color: "var(--slate)" }}>
                          Recorded: {new Date(v.recorded_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                        <div style={{ display: "flex", gap: 12 }}>
                          <div>
                            <span style={{ fontSize: 11, color: "var(--slate)", display: "block" }}>Blood Pressure</span>
                            <strong style={{ color: highBP ? "var(--danger)" : "var(--ink)", fontSize: 13.5 }}>
                              {v.bps}/{v.bpd} mmHg {highBP && "⚠️"}
                            </strong>
                          </div>
                          <div>
                            <span style={{ fontSize: 11, color: "var(--slate)", display: "block" }}>Pulse</span>
                            <strong style={{ fontSize: 13.5 }}>{v.pulse} bpm</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: 11, color: "var(--slate)", display: "block" }}>Temp</span>
                            <strong style={{ fontSize: 13.5 }}>{v.temp} °F</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          {/* Care Workspace Actions Card (Sprint U5) */}
          <Card>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 12px" }}>
              Quick Care Workspaces & Actions
            </h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to={`/orders/${patientId}`} style={{ textDecoration: "none" }}>
                <Button type="button" style={{ fontSize: 12.5, padding: "8px 16px" }}>
                  🧪 Diagnostics Order Catalog
                </Button>
              </Link>
              <Link to={`/billing/${patientId}`} style={{ textDecoration: "none" }}>
                <Button type="button" style={{ fontSize: 12.5, padding: "8px 16px", background: "var(--orange)" }}>
                  💳 Invoice & Cashless Ledger
                </Button>
              </Link>
              <Link to={`/referrals/timeline/${patientId}`} style={{ textDecoration: "none" }}>
                <Button type="button" style={{ fontSize: 12.5, padding: "8px 16px", background: "var(--indigo-soft)", color: "var(--indigo)" }}>
                  🔄 Care Loop Timeline
                </Button>
              </Link>
            </div>
          </Card>

          {/* Encounter Timeline Card (UI-401 / EMR-010) */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: 0 }}>
                Clinical Encounter History
              </h3>
              {role === "physician" && (
                <Button
                  data-testid="start-encounter"
                  type="button"
                  style={{ fontSize: 12, padding: "4px 14px" }}
                  onClick={() => createEncounterMutation.mutate()}
                  disabled={createEncounterMutation.isPending}
                >
                  {createEncounterMutation.isPending ? "Starting..." : "+ Start Encounter"}
                </Button>
              )}
            </div>

            {encounters.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--slate)", fontStyle: "italic", margin: 0 }}>
                No clinical encounters registered for this patient.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {encounters.map((e: any) => (
                  <div
                    key={e.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 12,
                      borderRadius: "var(--r-field)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <div>
                      <strong style={{ color: "var(--ink)", fontSize: 14 }}>
                        Encounter on {new Date(e.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}
                      </strong>
                      <span style={{ fontSize: 12, color: "var(--slate)", display: "block", marginTop: 2 }}>
                        Status: <strong style={{ textTransform: "capitalize" }}>{e.status}</strong> · Practitioner: Dr. Srinivas
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <Link to={`/emr/patients/${patientId}/encounter/${e.id}`}>
                        <Button type="button" ghost style={{ fontSize: 11, padding: "4px 12px" }}>
                          {e.status === "signed" ? "View Records" : "Resume Note"}
                        </Button>
                      </Link>
                      {e.status === "signed" && (
                        <Link to={`/emr/patients/${patientId}/print`}>
                          <Button type="button" ghost style={{ fontSize: 11, padding: "4px 12px", borderColor: "var(--green)", color: "var(--green)" }}>
                            🖨️ Instructions
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
