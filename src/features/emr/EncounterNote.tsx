import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Input, Select, StatusPill, Skeleton, Toast } from "../../ui/components";
import PatientHeader from "../patients/PatientHeader";
import PrescriptionComposer from "./PrescriptionComposer";
import NextVisitPanel from "./NextVisitPanel";

const icd10List = [
  { code: "I10", display: "Essential (primary) hypertension" },
  { code: "E11.9", display: "Type 2 diabetes mellitus without complications" },
  { code: "J00", display: "Acute nasopharyngitis [common cold]" },
  { code: "J06.9", display: "Acute upper respiratory infection, unspecified" },
  { code: "G44.2", display: "Tension-type headache" },
  { code: "K21.9", display: "Gastro-esophageal reflux disease without esophagitis" },
];

export default function EncounterNote() {
  const { id: patientId, encounterId } = useParams<{ id: string; encounterId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // SOAP fields state
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [icdCode, setIcdCode] = useState("");
  const [dxQuery, setDxQuery] = useState("");
  const [signoffError, setSignoffError] = useState("");
  
  // Vitals inputs state
  const [bps, setBps] = useState("");
  const [bpd, setBpd] = useState("");
  const [pulse, setPulse] = useState("");
  const [temp, setTemp] = useState("");

  // Addendum input
  const [addendumText, setAddendumText] = useState("");

  // Autosave status state
  const [autosaveStatus, setAutosaveStatus] = useState("Saved"); // Saved, Saving..., Error
  const [lastSavedTime, setLastSavedTime] = useState("");
  const isInitialLoad = useRef(true);

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

  // Fetch Patient Summary to get patient details
  const { data: summary } = useQuery({
    queryKey: ["patientSummary", patientId],
    queryFn: () => api.getPatientSummary(token, patientId || ""),
    enabled: !!patientId,
  });

  // Find this encounter from summary history
  const encounter = summary?.encounters?.find((e: any) => e.id === encounterId);
  const isSigned = encounter?.status === "signed";

  // Pre-fill fields once summary loads
  useEffect(() => {
    if (encounter && isInitialLoad.current) {
      const sc = (encounter as any).notes?.structured_content || {};
      setSubjective(sc.subjective || "");
      setObjective(sc.objective || "");
      setAssessment(sc.assessment || "");
      setPlan(sc.plan || "");
      setIcdCode(sc.icd10_code || "");
      isInitialLoad.current = false;
    }
  }, [encounter]);

  // Vitals entry mutation
  const vitalsMutation = useMutation({
    mutationFn: (body: any) => api.recordVitalSign(token, encounterId || "", body),
    onSuccess: () => {
      triggerToast("Vitals sign registered successfully.");
      qc.invalidateQueries({ queryKey: ["patientSummary", patientId] });
      setBps("");
      setBpd("");
      setPulse("");
      setTemp("");
    },
    onError: () => {
      triggerToast("Failed to record vitals.");
    },
  });

  // Autosave mutation note PUT
  const saveNoteMutation = useMutation({
    mutationFn: (sc: any) =>
      api.saveClinicalNote(token, encounterId || "", {
        template_type: "SOAP",
        structured_content: sc,
        rich_text_content: "",
      }),
    onSuccess: () => {
      setAutosaveStatus("Saved");
      setLastSavedTime(new Date().toLocaleTimeString("en-IN", { timeStyle: "short" }));
      qc.invalidateQueries({ queryKey: ["patientSummary", patientId] });
    },
    onError: () => {
      setAutosaveStatus("Error saving draft");
    },
  });

  // Trigger autosave when values change (UI-402)
  useEffect(() => {
    if (isInitialLoad.current || isSigned) return;

    setAutosaveStatus("Saving...");
    const timeout = setTimeout(() => {
      const selectedIcd = icd10List.find((i) => i.code === icdCode);
      saveNoteMutation.mutate({
        subjective,
        objective,
        assessment,
        plan,
        icd10_code: icdCode,
        icd10_display: selectedIcd ? selectedIcd.display : "",
      });
    }, 1000); // 1s debounce

    return () => clearTimeout(timeout);
  }, [subjective, objective, assessment, plan, icdCode]);

  // Sign-Off Mutation
  const signOffMutation = useMutation({
    mutationFn: () => api.signOffEncounter(token, encounterId || ""),
    onSuccess: () => {
      triggerToast("Encounter note finalized and signed off.");
      qc.invalidateQueries({ queryKey: ["patientSummary", patientId] });
    },
    onError: (err: any) => {
      triggerToast(err.message || "Failed to sign off encounter note.");
    },
  });

  // Add Addendum Mutation
  const addendumMutation = useMutation({
    mutationFn: (text: string) => api.addEncounterAddendum(token, encounterId || "", { content: text }),
    onSuccess: () => {
      triggerToast("Addendum added successfully.");
      setAddendumText("");
      qc.invalidateQueries({ queryKey: ["patientSummary", patientId] });
    },
    onError: () => {
      triggerToast("Failed to add addendum.");
    },
  });

  const handleSignOff = () => {
    if (!icdCode) {
      setSignoffError("An ICD-10 diagnosis selection is required before sign-off.");
      triggerToast("Error: An ICD-10 diagnosis selection is required before sign-off.");
      return;
    }
    setSignoffError("");
    signOffMutation.mutate();
  };

  const handleAddVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bps || !bpd || !pulse || !temp) {
      triggerToast("Please fill all vitals fields.");
      return;
    }
    vitalsMutation.mutate({ bps, bpd, pulse, temp });
  };

  const handleAddAddendum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addendumText.trim()) return;
    addendumMutation.mutate(addendumText);
  };

  if (!encounter) {
    return (
      <div style={{ display: "grid", gap: 20 }}>
        <Skeleton height={100} />
        <Skeleton height={300} />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Sticky patient clinical demographics header */}
      {patient && <PatientHeader patient={patient} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to={`/patients/${patientId}`} style={{ textDecoration: "none", color: "var(--indigo)", fontWeight: 700 }}>
          ← Back to Clinical Summary
        </Link>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {isSigned ? (
            <StatusPill data-testid="note-locked-badge" kind="success">SIGNED NOTE</StatusPill>
          ) : (
            <span style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>
              🟢 {autosaveStatus} {lastSavedTime && `at ${lastSavedTime}`}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, alignItems: "start" }}>
        {/* SOAP Note Form Card */}
        <div style={{ display: "grid", gap: 20 }}>
          <Card>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 16px" }}>
              SOAP Encounter Note Draft (EMR-002)
            </h3>

            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Subjective (Symptoms, patient complains)
                </label>
                <textarea
                  data-testid="note-section-subjective"
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  disabled={isSigned}
                  placeholder="Type subjective symptoms..."
                  rows={4}
                  style={{
                    width: "100%",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--r-field)",
                    padding: 12,
                    fontSize: 14.5,
                    fontFamily: "var(--font-body)",
                    background: isSigned ? "var(--wash-a)" : "#fff",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Objective (Clinical findings, vitals checks)
                </label>
                <textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  disabled={isSigned}
                  placeholder="Type objective examination notes..."
                  rows={4}
                  style={{
                    width: "100%",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--r-field)",
                    padding: 12,
                    fontSize: 14.5,
                    fontFamily: "var(--font-body)",
                    background: isSigned ? "var(--wash-a)" : "#fff",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  ICD-10 Diagnostic Assertion * (EMR-008)
                </label>
                <div style={{ position: "relative" }}>
                  <Input
                    data-testid="dx-search"
                    value={dxQuery}
                    onChange={(e) => { setDxQuery(e.target.value); setIcdCode(""); setSignoffError(""); }}
                    disabled={isSigned}
                    placeholder="Search ICD-10 code or term…"
                  />
                  {!isSigned && dxQuery.trim() !== "" && !icdCode && (
                    <div style={{ position: "absolute", zIndex: 20, top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--r-field)", marginTop: 4, maxHeight: 200, overflowY: "auto", boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}>
                      {icd10List
                        .filter((i) => `${i.code} ${i.display}`.toLowerCase().includes(dxQuery.toLowerCase()))
                        .map((i) => (
                          <div
                            key={i.code}
                            data-testid="dx-option"
                            onClick={() => { setIcdCode(i.code); setDxQuery(`(${i.code}) ${i.display}`); setSignoffError(""); }}
                            style={{ padding: "8px 12px", fontSize: 13.5, cursor: "pointer", borderBottom: "1px solid var(--wash-a)" }}
                          >
                            ({i.code}) {i.display}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Assessment Summary
                </label>
                <textarea
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  disabled={isSigned}
                  placeholder="Type assessment codes summary..."
                  rows={3}
                  style={{
                    width: "100%",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--r-field)",
                    padding: 12,
                    fontSize: 14.5,
                    fontFamily: "var(--font-body)",
                    background: isSigned ? "var(--wash-a)" : "#fff",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Clinical Plan (Next steps, treatment details)
                </label>
                <textarea
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  disabled={isSigned}
                  placeholder="Type treatment plan instructions..."
                  rows={3}
                  style={{
                    width: "100%",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--r-field)",
                    padding: 12,
                    fontSize: 14.5,
                    fontFamily: "var(--font-body)",
                    background: isSigned ? "var(--wash-a)" : "#fff",
                  }}
                />
              </div>
            </div>

            {signoffError && (
              <div data-testid="signoff-error" style={{ color: "var(--danger)", background: "#fbe3e3", padding: 12, borderRadius: "var(--r-field)", fontSize: 13, fontWeight: 600, marginTop: 12 }}>
                ⚠️ {signoffError}
              </div>
            )}

            {/* Final Sign Off controls */}
            {!isSigned && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                <Button data-testid="note-signoff" disabled={signOffMutation.isPending} onClick={handleSignOff}>
                  {signOffMutation.isPending ? "Finalizing Note..." : "🖋️ Sign-off Note & Lock"}
                </Button>
              </div>
            )}
          </Card>

          {/* Prescription composer block */}
          <PrescriptionComposer encounterId={encounterId || ""} patientId={patientId || ""} isLocked={isSigned} />

          {/* Follow up Next visit configuration */}
          <NextVisitPanel encounterId={encounterId || ""} patientId={patientId || ""} isLocked={isSigned} />
        </div>

        {/* Right Column: Vitals entry and signed addenda */}
        <div style={{ display: "grid", gap: 20 }}>
          {/* Record Vitals (EMR-007) */}
          {!isSigned && (
            <Card>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--indigo)", margin: "0 0 12px" }}>
                Add Current Vital Signs
              </h3>
              <form onSubmit={handleAddVitals} style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Systolic BP</label>
                    <Input
                      type="number"
                      value={bps}
                      onChange={(e) => setBps(e.target.value)}
                      placeholder="e.g. 120"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Diastolic BP</label>
                    <Input
                      type="number"
                      value={bpd}
                      onChange={(e) => setBpd(e.target.value)}
                      placeholder="e.g. 80"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Pulse (bpm)</label>
                  <Input
                    type="number"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    placeholder="e.g. 72"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Temp (°F)</label>
                  <Input
                    type="number"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    placeholder="e.g. 98.6"
                    required
                  />
                </div>
                <Button disabled={vitalsMutation.isPending} style={{ width: "100%", marginTop: 6 }}>
                  {vitalsMutation.isPending ? "Recording..." : "Record Vitals"}
                </Button>
              </form>
            </Card>
          )}

          {/* Addenda Card for finalized encounters (EMR-003) */}
          {isSigned && (
            <Card>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--indigo)", margin: "0 0 12px" }}>
                Signed Addenda / Audit Notes
              </h3>

              {(encounter as any).addenda?.length > 0 && (
                <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
                  {(encounter as any).addenda.map((ad: any, idx: number) => (
                    <div key={idx} style={{ background: "var(--wash-a)", padding: 10, borderRadius: "10px", border: "1px solid var(--line)" }}>
                      <p style={{ fontSize: 13, margin: "0 0 4px", color: "var(--ink)" }}>{ad.content}</p>
                      <span style={{ fontSize: 11, color: "var(--slate)" }}>
                        {ad.created_by} · {new Date(ad.created_at).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddAddendum} style={{ display: "grid", gap: 10 }}>
                <textarea
                  value={addendumText}
                  onChange={(e) => setAddendumText(e.target.value)}
                  placeholder="Type encounter addendum note..."
                  rows={3}
                  style={{
                    width: "100%",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--r-field)",
                    padding: 10,
                    fontSize: 13.5,
                    fontFamily: "var(--font-body)",
                  }}
                  required
                />
                <Button data-testid="note-add-addendum" disabled={addendumMutation.isPending} style={{ width: "100%" }}>
                  Add Addendum Comment
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
