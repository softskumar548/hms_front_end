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
  { code: "G44.2", display: "Tension-type headache / Migraine" },
  { code: "K21.9", display: "Gastro-esophageal reflux disease without esophagitis (GERD)" },
  { code: "J45.9", display: "Bronchial asthma, unspecified" },
  { code: "M17.9", display: "Osteoarthritis of knee, unspecified" },
  { code: "N39.0", display: "Urinary tract infection, site not specified (UTI)" },
  { code: "R50.9", display: "Fever / Viral Pyrexia, unspecified" },
  { code: "A09", display: "Infectious gastroenteritis and colitis" },
  { code: "K29.7", display: "Gastritis, unspecified" },
];

const quickSymptomsList = [
  "High Fever & Chills",
  "Productive Cough",
  "Severe Headache",
  "Chest Heaviness",
  "Acute Dyspepsia / Acidity",
  "Bilateral Knee Pain",
  "Shortness of Breath",
  "Sore Throat & Cold",
  "Dizziness & Fatigue",
  "Generalized Weakness",
  "Abdominal Cramps",
];

const quickAdviceList = [
  "Low salt & low oil diet; regular 30 min brisk walk",
  "Avoid spicy, fried foods; drink lukewarm water",
  "Steam inhalation twice daily for 5 days",
  "Warm saline gargling 3 times daily",
  "Maintain adequate hydration (3-4 litres water daily)",
  "Report immediately to emergency casualty if chest pain or severe breathlessness occurs",
  "Fasting & post-prandial blood sugar tracking for 3 days",
];

const commonLabTestsList = [
  { code: "LAB-CBC", name: "Complete Blood Count (CBC)", dept: "Hematology", price: 350 },
  { code: "LAB-LFT", name: "Liver Function Test (LFT)", dept: "Biochemistry", price: 750 },
  { code: "LAB-RFT", name: "Renal Function Test (KFT/RFT)", dept: "Biochemistry", price: 650 },
  { code: "LAB-LIPID", name: "Lipid Profile Comprehensive", dept: "Biochemistry", price: 800 },
  { code: "LAB-HBA1C", name: "HbA1c Glycated Hemoglobin", dept: "Biochemistry", price: 600 },
  { code: "LAB-URINE", name: "Urine Complete Analysis", dept: "Clinical Pathology", price: 250 },
  { code: "RAD-XRAY", name: "Chest X-Ray (PA View)", dept: "Radiology", price: 450 },
  { code: "RAD-ECG", name: "12-Lead Diagnostic ECG", dept: "Cardiology", price: 300 },
  { code: "RAD-USG", name: "USG Abdomen & Pelvis", dept: "Radiology", price: 1200 },
  { code: "LAB-THYROID", name: "Thyroid Profile (T3, T4, TSH)", dept: "Biochemistry", price: 700 },
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
  const [composerOpen, setComposerOpen] = useState(true);
  const [signoffError, setSignoffError] = useState("");

  // Vitals inputs state
  const [bps, setBps] = useState("");
  const [bpd, setBpd] = useState("");
  const [pulse, setPulse] = useState("");
  const [temp, setTemp] = useState("");
  const [spo2, setSpo2] = useState("");
  const [respRate, setRespRate] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  // Diagnostic Lab orders state
  const [selectedLabTests, setSelectedLabTests] = useState<any[]>([]);

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
      if (sc.icd10_code) {
        setDxQuery(`(${sc.icd10_code}) ${sc.icd10_display || ""}`);
      }
      isInitialLoad.current = false;
    }
  }, [encounter]);

  // Vitals entry mutation
  const vitalsMutation = useMutation({
    mutationFn: (body: any) => api.recordVitalSign(token, encounterId || "", body),
    onSuccess: () => {
      triggerToast("Vitals registered successfully.");
      qc.invalidateQueries({ queryKey: ["patientSummary", patientId] });
      setBps("");
      setBpd("");
      setPulse("");
      setTemp("");
      setSpo2("");
      setRespRate("");
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
      triggerToast("Please fill at least Blood Pressure, Pulse, and Temperature.");
      return;
    }
    vitalsMutation.mutate({ bps, bpd, pulse, temp, spo2, respRate, heightCm, weightKg });
  };

  const handleAddAddendum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addendumText.trim()) return;
    addendumMutation.mutate(addendumText);
  };

  // BMI Calculation
  const heightM = Number(heightCm) / 100;
  const weightVal = Number(weightKg);
  const bmi = heightM > 0 && weightVal > 0 ? (weightVal / (heightM * heightM)).toFixed(1) : null;

  // BP classification indicator
  const systolicNum = Number(bps);
  const diastolicNum = Number(bpd);
  const bpCategory = systolicNum >= 140 || diastolicNum >= 90
    ? "Stage 2 Hypertension"
    : systolicNum >= 130 || diastolicNum >= 80
    ? "Stage 1 Hypertension"
    : systolicNum >= 120
    ? "Elevated BP"
    : systolicNum > 0
    ? "Normal BP"
    : null;

  // Patient Allergies List (EMR-005)
  const allergiesList = summary?.allergies || [];
  const hasAllergies = allergiesList.length > 0;

  if (!encounter) {
    return (
      <div style={{ display: "grid", gap: 20 }}>
        <Skeleton height={100} />
        <Skeleton height={300} />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Sticky patient clinical demographics header */}
      {patient && <PatientHeader patient={patient} />}

      {/* Persistent Allergy Warning Banner (EMR-005) */}
      {hasAllergies && (
        <div
          data-testid="allergy-warning-banner"
          style={{
            background: "linear-gradient(135deg, #FEF2F2 0%, #FFFBEB 100%)",
            border: "2px solid #DC2626",
            borderRadius: 14,
            padding: "12px 18px",
            color: "#991B1B",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            boxShadow: "0 2px 10px rgba(220, 38, 38, 0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🚨</span>
            <div>
              <strong style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em", color: "#B91C1C" }}>
                Active Allergy Warning (EMR-005)
              </strong>
              <div style={{ fontSize: 13, marginTop: 2, color: "#7F1D1D" }}>
                Patient has documented contraindications:{" "}
                <strong>
                  {allergiesList.map((a: any) => a.substance_display || a.name).join(", ")}
                </strong>
              </div>
            </div>
          </div>
          <span style={{ fontSize: 11.5, background: "#DC2626", color: "#fff", padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
            HIGH RISK CONTRAINDICATION
          </span>
        </div>
      )}

      {/* Navigation and Sign Status Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to={`/patients/${patientId}`} style={{ textDecoration: "none", color: "var(--indigo)", fontWeight: 700, fontSize: 14 }}>
            ← Back to Patient Summary
          </Link>
          <Link to={`/emr/patients/${patientId}/print`} style={{ textDecoration: "none" }}>
            <button
              type="button"
              style={{
                background: "#EEF2FF",
                border: "1px solid var(--indigo)",
                color: "var(--indigo)",
                borderRadius: 8,
                padding: "6px 14px",
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              🖨️ Print Prescription & Summary Stub
            </button>
          </Link>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {isSigned ? (
            <StatusPill data-testid="note-locked-badge" kind="success">SIGNED & LOCKED NOTE</StatusPill>
          ) : (
            <span style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>
              🟢 {autosaveStatus} {lastSavedTime && `at ${lastSavedTime}`}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Left Column: SOAP Note & Prescription Workspace */}
        <div style={{ display: "grid", gap: 20 }}>
          {/* Main SOAP Card */}
          <Card style={{ borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, color: "var(--indigo)", margin: 0 }}>
                🩺 SOAP Clinical Encounter Documentation
              </h3>
              <span style={{ fontSize: 12, color: "var(--slate)" }}>
                Encounter ID: <strong style={{ fontFamily: "monospace" }}>{encounterId?.slice(0, 8)}</strong>
              </span>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              {/* Subjective (S) */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--indigo)" }}>
                    1. Subjective (S) — Chief Complaints & Symptoms
                  </label>
                </div>

                {!isSigned && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {quickSymptomsList.map((symp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSubjective((prev) => (prev ? `${prev}, ${symp}` : symp));
                        }}
                        style={{
                          background: "var(--wash-a)",
                          border: "1px solid var(--line)",
                          borderRadius: 20,
                          padding: "3px 10px",
                          fontSize: 11.5,
                          cursor: "pointer",
                          color: "var(--ink)",
                        }}
                      >
                        + {symp}
                      </button>
                    ))}
                  </div>
                )}

                <textarea
                  data-testid="note-section-subjective"
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  disabled={isSigned}
                  placeholder="Describe patient's presenting symptoms, onset, duration, and pain scale..."
                  rows={3}
                  style={{
                    width: "100%",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--r-field)",
                    padding: 12,
                    fontSize: 14,
                    fontFamily: "var(--font-body)",
                    background: isSigned ? "var(--wash-a)" : "#fff",
                  }}
                />
              </div>

              {/* Objective (O) */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--indigo)" }}>
                    2. Objective (O) — Physical Examination & Clinical Findings
                  </label>
                  {!isSigned && (
                    <button
                      type="button"
                      onClick={() => setObjective("CVS: S1 S2 heard, no murmurs. RS: Bilateral clear, no wheeze. P/A: Soft, non-tender. CNS: Conscious, oriented.")}
                      style={{ background: "none", border: "none", color: "var(--indigo)", fontSize: 11.5, cursor: "pointer", fontWeight: 700 }}
                    >
                      ⚡ Insert Normal Exam Template
                    </button>
                  )}
                </div>

                <textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  disabled={isSigned}
                  placeholder="Systemic examination (CVS, RS, P/A, CNS, ENT, skin examination findings)..."
                  rows={3}
                  style={{
                    width: "100%",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--r-field)",
                    padding: 12,
                    fontSize: 14,
                    fontFamily: "var(--font-body)",
                    background: isSigned ? "var(--wash-a)" : "#fff",
                  }}
                />
              </div>

              {/* Assessment (A) with ICD-10 */}
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--indigo)", display: "block", marginBottom: 6 }}>
                  3. Assessment & Diagnosis (A) — ICD-10 Assertion <span style={{ color: "red" }}>*</span>
                </label>

                {!isSigned && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {icd10List.slice(0, 6).map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => {
                          setIcdCode(item.code);
                          setDxQuery(`(${item.code}) ${item.display}`);
                          setSignoffError("");
                          if (patientId) {
                            api.createProblem(token, patientId, { code: item.code, display: item.display });
                          }
                        }}
                        style={{
                          background: icdCode === item.code ? "var(--indigo)" : "var(--wash-a)",
                          color: icdCode === item.code ? "#fff" : "var(--ink)",
                          border: "1px solid var(--line)",
                          borderRadius: 20,
                          padding: "3px 10px",
                          fontSize: 11.5,
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        {item.display.split(" ")[0]} ({item.code})
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ position: "relative", marginBottom: 10 }}>
                  <Input
                    data-testid="dx-search"
                    value={dxQuery}
                    onChange={(e) => { setDxQuery(e.target.value); setIcdCode(""); setSignoffError(""); }}
                    disabled={isSigned}
                    placeholder="Search ICD-10 diagnosis (e.g. Hypertension, Diabetes, Asthma, GERD)..."
                  />
                  {!isSigned && dxQuery.trim() !== "" && !icdCode && (
                    <div style={{ position: "absolute", zIndex: 20, top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--r-field)", marginTop: 4, maxHeight: 220, overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                      {icd10List
                        .filter((i) => `${i.code} ${i.display}`.toLowerCase().includes(dxQuery.toLowerCase()))
                        .map((i) => (
                          <div
                            key={i.code}
                            data-testid="dx-option"
                            onClick={() => {
                              setIcdCode(i.code);
                              setDxQuery(`(${i.code}) ${i.display}`);
                              setSignoffError("");
                              if (patientId) {
                                api.createProblem(token, patientId, { code: i.code, display: i.display });
                              }
                              saveNoteMutation.mutate({
                                subjective,
                                objective,
                                assessment,
                                plan,
                                icd10_code: i.code,
                                icd10_display: i.display,
                              });
                            }}
                            style={{ padding: "10px 14px", fontSize: 13.5, cursor: "pointer", borderBottom: "1px solid var(--wash-a)" }}
                            onMouseOver={(e) => (e.currentTarget.style.background = "var(--wash-a)")}
                            onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
                          >
                            <strong style={{ color: "var(--indigo)" }}>({i.code})</strong> {i.display}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <textarea
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  disabled={isSigned}
                  placeholder="Clinical assessment summary, differential diagnosis..."
                  rows={2}
                  style={{
                    width: "100%",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--r-field)",
                    padding: 10,
                    fontSize: 13.5,
                    fontFamily: "var(--font-body)",
                    background: isSigned ? "var(--wash-a)" : "#fff",
                  }}
                />
              </div>

              {/* Plan (P) */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--indigo)" }}>
                    4. Plan & Patient Instructions (P)
                  </label>
                </div>

                {!isSigned && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {quickAdviceList.slice(0, 4).map((adv, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPlan((prev) => (prev ? `${prev}\n• ${adv}` : `• ${adv}`));
                        }}
                        style={{
                          background: "var(--wash-a)",
                          border: "1px solid var(--line)",
                          borderRadius: 20,
                          padding: "3px 10px",
                          fontSize: 11.5,
                          cursor: "pointer",
                          color: "var(--ink)",
                        }}
                      >
                        + {adv.slice(0, 25)}...
                      </button>
                    ))}
                  </div>
                )}

                <textarea
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  disabled={isSigned}
                  placeholder="Diet advice, activity modifications, red-flag emergency symptoms, review timelines..."
                  rows={3}
                  style={{
                    width: "100%",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--r-field)",
                    padding: 12,
                    fontSize: 14,
                    fontFamily: "var(--font-body)",
                    background: isSigned ? "var(--wash-a)" : "#fff",
                  }}
                />
              </div>
            </div>

            {signoffError && (
              <div data-testid="signoff-error" style={{ color: "var(--danger)", background: "#fbe3e3", padding: 12, borderRadius: "var(--r-field)", fontSize: 13, fontWeight: 600, marginTop: 14 }}>
                ⚠️ {signoffError}
              </div>
            )}

            {/* Final Sign Off controls */}
            {!isSigned && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                <span style={{ fontSize: 12, color: "var(--slate)" }}>
                  Autosaves automatically · ICD-10 required to sign
                </span>
                <Button
                  data-testid="note-signoff"
                  disabled={signOffMutation.isPending}
                  onClick={handleSignOff}
                  style={{ background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)", color: "#fff" }}
                >
                  {signOffMutation.isPending ? "Finalizing Note..." : "🖋️ Sign-off Encounter & Lock"}
                </Button>
              </div>
            )}
          </Card>

          {/* Diagnostic Lab & Imaging Test Requisition Desk */}
          <Card style={{ borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: 0 }}>
                  🔬 Diagnostic Lab & Radiology Orders
                </h3>
                <span style={{ fontSize: 12, color: "var(--slate)" }}>
                  Order tests directly from standard hospital catalogs
                </span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--indigo)" }}>
                {selectedLabTests.length} Tests Selected (₹{selectedLabTests.reduce((acc, t) => acc + t.price, 0)})
              </span>
            </div>

            {!isSigned && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {commonLabTestsList.map((test) => {
                  const isSelected = selectedLabTests.some((t) => t.code === test.code);
                  return (
                    <button
                      key={test.code}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedLabTests(selectedLabTests.filter((t) => t.code !== test.code));
                        } else {
                          setSelectedLabTests([...selectedLabTests, test]);
                          triggerToast(`Added ${test.name} to lab requisition.`);
                        }
                      }}
                      style={{
                        background: isSelected ? "#00BCD4" : "var(--wash-a)",
                        color: isSelected ? "#fff" : "var(--ink)",
                        border: "1px solid var(--line)",
                        borderRadius: 8,
                        padding: "6px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {isSelected ? "✓ " : "+ "}{test.name} (₹{test.price})
                    </button>
                  );
                })}
              </div>
            )}

            {selectedLabTests.length > 0 && (
              <div style={{ background: "var(--wash-a)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
                <strong style={{ fontSize: 12, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  ORDERED INVESTIGATIONS REQUISITION:
                </strong>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {selectedLabTests.map((t, idx) => (
                    <div key={idx} style={{ fontSize: 13, color: "var(--ink)", display: "flex", justifyContent: "space-between" }}>
                      <span>• {t.name}</span>
                      <span style={{ fontWeight: 700, color: "var(--indigo)" }}>₹{t.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* E-Prescription Composer */}
          <PrescriptionComposer encounterId={encounterId || ""} patientId={patientId || ""} isLocked={isSigned} />

          {/* Follow up Next visit configuration */}
          <NextVisitPanel encounterId={encounterId || ""} patientId={patientId || ""} isLocked={isSigned} />
        </div>

        {/* Right Column: Vitals entry and signed addenda */}
        <div style={{ display: "grid", gap: 20 }}>
          {/* Record Vitals Panel (EMR-007) */}
          <Card style={{ borderRadius: 16 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--indigo)", margin: "0 0 12px" }}>
              📊 Clinical Triage & Vital Signs
            </h3>

            {!isSigned && (
              <form onSubmit={handleAddVitals} style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Systolic BP (mmHg)</label>
                    <Input
                      type="number"
                      value={bps}
                      onChange={(e) => setBps(e.target.value)}
                      placeholder="120"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Diastolic BP (mmHg)</label>
                    <Input
                      type="number"
                      value={bpd}
                      onChange={(e) => setBpd(e.target.value)}
                      placeholder="80"
                      required
                    />
                  </div>
                </div>

                {bpCategory && (
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: systolicNum >= 130 ? "#DC2626" : "#16A34A" }}>
                    BP Status: {bpCategory}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Pulse (bpm)</label>
                    <Input
                      type="number"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      placeholder="72"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Temp (°F)</label>
                    <Input
                      type="number"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      placeholder="98.6"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>SpO2 (%)</label>
                    <Input
                      type="number"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      placeholder="99"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Resp Rate (/min)</label>
                    <Input
                      type="number"
                      value={respRate}
                      onChange={(e) => setRespRate(e.target.value)}
                      placeholder="16"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Height (cm)</label>
                    <Input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder="170"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Weight (kg)</label>
                    <Input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="70"
                    />
                  </div>
                </div>

                {bmi && (
                  <div style={{ background: "var(--wash-a)", padding: "8px 12px", borderRadius: 8, fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>BMI Calculation:</span>
                    <strong style={{ color: Number(bmi) > 25 ? "#D97706" : "var(--indigo)" }}>
                      {bmi} kg/m² ({Number(bmi) < 18.5 ? "Underweight" : Number(bmi) < 25 ? "Normal" : "Overweight"})
                    </strong>
                  </div>
                )}

                <Button disabled={vitalsMutation.isPending} style={{ width: "100%", marginTop: 4 }}>
                  {vitalsMutation.isPending ? "Recording..." : "Record Vitals"}
                </Button>
              </form>
            )}

            {/* Historical Vitals from Summary */}
            {(summary as any)?.vitals && (summary as any).vitals.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--line)" }}>
                <strong style={{ fontSize: 12, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  RECENT VITALS LOG:
                </strong>
                <div style={{ display: "grid", gap: 6 }}>
                  {(summary as any).vitals.slice(0, 3).map((v: any, idx: number) => (
                    <div key={idx} style={{ background: "var(--wash-a)", padding: "8px 10px", borderRadius: 8, fontSize: 12 }}>
                      <div style={{ fontWeight: 700, color: "var(--indigo)" }}>
                        BP: {v.bps}/{v.bpd} mmHg · Pulse: {v.pulse} bpm
                      </div>
                      <div style={{ color: "var(--slate)", fontSize: 11 }}>
                        Temp: {v.temp}°F · {v.created_at ? new Date(v.created_at).toLocaleDateString("en-IN") : "Today"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Addenda Card for finalized encounters (EMR-003) */}
          {isSigned && (
            <Card style={{ borderRadius: 16 }}>
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
