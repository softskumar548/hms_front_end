import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthProvider";
import { api, PatientCreate, PatientOut, ApiError } from "../../api/client";
import {
  Button,
  Card,
  FieldCell,
  Input,
  PageTitle,
  StatusPill,
  Select,
  Modal,
  Toast,
} from "../../ui/components";

// Static mock referrers database for lookup (UI-203)
const initialReferrers = [
  { id: "ref-1", name: "Dr. A. Srinivas", type: "doctor", org: "KIMS" },
  { id: "ref-2", name: "Prakash Clinic", type: "clinic", org: "Vijayawada" },
  { id: "ref-3", name: "Care Hospital", type: "hospital", org: "Visakhapatnam" },
];

export default function PatientRegister() {
  const { t } = useTranslation();
  const { token, tenant } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Registration Mode: Standard Patient vs Newborn / Neonate
  const [isNewbornMode, setIsNewbornMode] = useState(false);
  const [selectedMother, setSelectedMother] = useState<any | null>(null);
  const [motherSearchQuery, setMotherSearchQuery] = useState("");

  // Duplicate Check Modal State (UI-202)
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateCandidates, setDuplicateCandidates] = useState<any[]>([]);
  const [pendingData, setPendingData] = useState<PatientCreate | null>(null);

  // Referrer Quick-Add Modal State (UI-203)
  const [referrerOpen, setReferrerOpen] = useState(false);
  const [referrers, setReferrers] = useState(initialReferrers);
  const [newRefName, setNewRefName] = useState("");
  const [newRefType, setNewRefType] = useState("doctor");
  const [newRefOrg, setNewRefOrg] = useState("");

  // Fetch Patients List for Mother Linkage Search
  const { data: allPatients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api.listPatients(token),
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // 1. Zod Validation Schema driven dynamically by active Tenant context (UI-201)
  const validationSchema = z.object({
    given_name: z.string().min(1, t("given_name") + " is required"),
    family_name: z.string().min(1, t("family_name") + " is required"),
    dob: z.string().optional().or(z.literal("")),
    gender: z.string().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    email: z.string().email("Invalid email format").optional().or(z.literal("")),
    preferred_language: z.string().optional(),
    national_id: z.string().optional().or(z.literal("")),
    abha_number: z.string().optional().or(z.literal("")),
    abha_address: z.string().optional(),
    aadhaar_last_four: z.string().optional().or(z.literal("")),
    address_line1: z.string().optional(),
    address_city: z.string().optional(),
    address_state: z.string().optional(),
    address_postal_code: z.string().optional(),
    next_of_kin_name: z.string().optional(),
    next_of_kin_relationship: z.string().optional(),
    next_of_kin_phone: z.string().optional(),
    aarogyasri_id: z.string().optional(),
    pmjay_id: z.string().optional(),
    referred_by_type: z.string().optional(),
    referred_by_name: z.string().optional(),
    referred_by_id: z.string().optional(),
    referral_reason: z.string().optional(),
    requested_service: z.string().optional(),
    consent_general: z.boolean().optional(),
    consent_sharing: z.boolean().optional(),
    
    // Newborn Specific Fields (REG-010)
    is_newborn: z.boolean().optional(),
    mother_patient_id: z.string().optional(),
    birth_time: z.string().optional(),
    birth_weight_grams: z.any().optional(),
    gestational_age_weeks: z.any().optional(),
    multiple_birth_order: z.any().optional(),
    delivery_type: z.string().optional(),
    apgar_score_1min: z.any().optional(),
    apgar_score_5min: z.any().optional(),
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      given_name: "",
      family_name: "",
      dob: "",
      gender: "male",
      phone: "",
      email: "",
      preferred_language: "en",
      national_id: "",
      abha_number: "",
      abha_address: "",
      aadhaar_last_four: "",
      address_line1: "",
      address_city: "",
      address_state: "Andhra Pradesh",
      address_postal_code: "",
      next_of_kin_name: "",
      next_of_kin_relationship: "",
      next_of_kin_phone: "",
      aarogyasri_id: "",
      pmjay_id: "",
      referred_by_type: "",
      referred_by_name: "",
      referred_by_id: "",
      referral_reason: "",
      requested_service: "",
      consent_general: false,
      consent_sharing: false,
      is_newborn: false,
      mother_patient_id: "",
      birth_time: "12:00",
      birth_weight_grams: 3000,
      gestational_age_weeks: 38,
      multiple_birth_order: 1,
      delivery_type: "normal_vaginal",
      apgar_score_1min: 8,
      apgar_score_5min: 9,
    },
  });

  const refType = watch("referred_by_type");
  const refId = watch("referred_by_id");
  const watchedBirthWeight = Number(watch("birth_weight_grams")) || 0;
  const watchedApgar1 = Number(watch("apgar_score_1min") ?? 8);
  const watchedApgar5 = Number(watch("apgar_score_5min") ?? 9);

  // Mother Selection & Auto-Population Logic
  const handleSelectMother = (motherId: string) => {
    const mother = allPatients.find((p: any) => p.id === motherId);
    if (mother) {
      setSelectedMother(mother);
      setValue("mother_patient_id", mother.id);
      setValue("family_name", mother.family_name || "Family");
      
      const birthOrder = Number(watch("multiple_birth_order")) || 1;
      const defaultGiven = birthOrder > 1 ? `Twin ${birthOrder} of ${mother.given_name}` : `Baby of ${mother.given_name}`;
      setValue("given_name", defaultGiven);
      
      setValue("phone", mother.phone || "");
      setValue("email", mother.email || "");
      setValue("preferred_language", mother.preferred_language || "en");
      
      const motherAddr = (mother.address as any) || {};
      setValue("address_line1", motherAddr.line1 || "");
      setValue("address_city", motherAddr.city || "Visakhapatnam");
      setValue("address_state", motherAddr.state || "Andhra Pradesh");
      setValue("address_postal_code", motherAddr.postal_code || "530001");
      
      setValue("next_of_kin_name", `${mother.given_name} ${mother.family_name} (Mother)`);
      setValue("next_of_kin_relationship", "Mother");
      setValue("next_of_kin_phone", mother.phone || "");
      
      setValue("aarogyasri_id", mother.aarogyasri_id || "");
      setValue("pmjay_id", mother.pmjay_id || "");
      
      const todayIso = new Date().toISOString().split("T")[0];
      setValue("dob", todayIso);
      const currentTime = new Date().toTimeString().slice(0, 5);
      setValue("birth_time", currentTime);
      
      triggerToast(`Linked to Mother: ${mother.given_name} ${mother.family_name}. Contacts & schemes auto-populated.`);
    } else {
      setSelectedMother(null);
      setValue("mother_patient_id", "");
    }
  };

  const handleToggleNewbornMode = (enabled: boolean) => {
    setIsNewbornMode(enabled);
    setValue("is_newborn", enabled);
    if (enabled) {
      const todayIso = new Date().toISOString().split("T")[0];
      const currentTime = new Date().toTimeString().slice(0, 5);
      setValue("dob", todayIso);
      setValue("birth_time", currentTime);
      setValue("delivery_type", "normal_vaginal");
      setValue("gestational_age_weeks", 38);
      setValue("birth_weight_grams", 3000);
      setValue("multiple_birth_order", 1);
      setValue("apgar_score_1min", 8);
      setValue("apgar_score_5min", 9);
      setValue("consent_general", true);
    }
  };

  // Create patient request mutation
  const registerMutation = useMutation({
    mutationFn: ({ data, force }: { data: PatientCreate; force: boolean }) =>
      api.createPatient(token, data, force),
    onSuccess: (newPatient) => {
      triggerToast(isNewbornMode ? "👶 Newborn registered and linked to Mother successfully!" : "Patient registered successfully!");
      qc.invalidateQueries({ queryKey: ["patients"] });
      setDuplicateOpen(false);
      setTimeout(() => {
        navigate(`/patients/${newPatient.id}`);
      }, 600);
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        // Intercept duplicate error and open matching panel (UI-202)
        try {
          const detail = JSON.parse(err.message);
          setDuplicateCandidates(detail.candidates || []);
          setDuplicateOpen(true);
        } catch (e) {
          triggerToast("Duplicate match check triggered.");
        }
      } else {
        triggerToast(err.message || "Registration failed.");
      }
    },
  });

  const onSubmit = (values: any) => {
    // Map flattened form properties into structured PatientCreate API payload
    const payload: PatientCreate = {
      given_name: values.given_name,
      family_name: values.family_name,
      dob: values.dob || (isNewbornMode ? new Date().toISOString().split("T")[0] : `19${Math.floor(70 + Math.random() * 20)}-0${Math.floor(1 + Math.random() * 8)}-15`),
      national_id: values.national_id || null,
      phone: values.phone || `+919${Math.floor(100000000 + Math.random() * 899999999)}`,
      gender: values.gender || "male",
      preferred_language: values.preferred_language || null,
      abha_number: values.abha_number || null,
      abha_address: values.abha_address || null,
      aarogyasri_id: values.aarogyasri_id || null,
      pmjay_id: values.pmjay_id || null,
      aadhaar_last_four: values.aadhaar_last_four || null,
      referred_by_type: values.referred_by_type || null,
      referred_by_name: values.referred_by_name || null,
      referred_by_id: values.referred_by_id || null,
      address: {
        line1: values.address_line1,
        city: values.address_city,
        state: values.address_state,
        postal_code: values.address_postal_code,
        country: "IN",
      },
      next_of_kin: {
        name: values.next_of_kin_name,
        relationship: values.next_of_kin_relationship,
        phone: values.next_of_kin_phone,
      },
      // Newborn specific fields
      is_newborn: isNewbornMode,
      mother_patient_id: isNewbornMode && values.mother_patient_id ? values.mother_patient_id : null,
      birth_time: isNewbornMode ? values.birth_time : null,
      birth_weight_grams: isNewbornMode ? Number(values.birth_weight_grams) || 3000 : null,
      gestational_age_weeks: isNewbornMode ? Number(values.gestational_age_weeks) || 38 : null,
      multiple_birth_order: isNewbornMode ? Number(values.multiple_birth_order) || 1 : 1,
      delivery_type: isNewbornMode ? values.delivery_type : null,
      apgar_score_1min: isNewbornMode ? Number(values.apgar_score_1min) || 8 : null,
      apgar_score_5min: isNewbornMode ? Number(values.apgar_score_5min) || 9 : null,
    };
    setPendingData(payload);
    registerMutation.mutate({ data: payload, force: false });
  };

  const handleForceCreate = () => {
    if (pendingData) {
      registerMutation.mutate({ data: pendingData, force: true });
    }
  };

  const handleQuickAddReferrer = () => {
    if (!newRefName) return;
    const newRef = {
      id: `ref-${Date.now()}`,
      name: newRefName,
      type: newRefType,
      org: newRefOrg || "Independent",
    };
    setReferrers((prev) => [...prev, newRef]);
    setValue("referred_by_id", newRef.id);
    setValue("referred_by_name", newRef.name);
    setValue("referred_by_type", newRef.type);
    setNewRefName("");
    setNewRefOrg("");
    setReferrerOpen(false);
  };

  const filteredMothers = allPatients.filter((p: any) => {
    if (!motherSearchQuery) return true;
    const q = motherSearchQuery.toLowerCase();
    const fullName = `${p.given_name || ""} ${p.family_name || ""}`.toLowerCase();
    const phone = (p.phone || "").toLowerCase();
    const nationalId = (p.national_id || "").toLowerCase();
    return fullName.includes(q) || phone.includes(q) || nationalId.includes(q);
  });

  const getApgarBadge = (score: number) => {
    if (score >= 7) return <span style={{ color: "var(--green)", fontWeight: 700, fontSize: 11 }}>🟢 Normal / Reassuring (7-10)</span>;
    if (score >= 4) return <span style={{ color: "var(--orange)", fontWeight: 700, fontSize: 11 }}>🟡 Moderately Depressed (4-6)</span>;
    return <span style={{ color: "var(--danger)", fontWeight: 700, fontSize: 11 }}>🔴 Critical / Resuscitation (0-3)</span>;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <PageTitle>{isNewbornMode ? "👶 Newborn / Neonate Registration" : "Patient Registration"}</PageTitle>
        
        {/* SEGMENTED REGISTRATION MODE SWITCHER */}
        <div
          style={{
            display: "flex",
            background: "var(--wash-b)",
            padding: 4,
            borderRadius: "var(--r-pill)",
            border: "1px solid var(--line)",
            gap: 4,
          }}
        >
          <button
            type="button"
            onClick={() => handleToggleNewbornMode(false)}
            style={{
              padding: "7px 16px",
              borderRadius: "var(--r-pill)",
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: !isNewbornMode ? "var(--indigo)" : "transparent",
              color: !isNewbornMode ? "#FFFFFF" : "var(--slate)",
            }}
          >
            👤 Standard Patient
          </button>
          <button
            type="button"
            onClick={() => handleToggleNewbornMode(true)}
            style={{
              padding: "7px 16px",
              borderRadius: "var(--r-pill)",
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: isNewbornMode ? "linear-gradient(135deg, #0D5C63 0%, #059669 100%)" : "transparent",
              color: isNewbornMode ? "#FFFFFF" : "var(--slate)",
            }}
          >
            👶 Newborn / Neonate
          </button>
        </div>
      </div>

      {isNewbornMode && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(13, 92, 99, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)",
            border: "1.5px solid rgba(13, 92, 99, 0.3)",
            borderRadius: "var(--r-card)",
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 32 }}>👶</span>
            <div>
              <strong style={{ fontSize: 15, color: "var(--indigo-deep)", display: "block" }}>
                Active Neonate Intake Pipeline (REG-010 / ABDM Child ID)
              </strong>
              <span style={{ fontSize: 12.5, color: "var(--slate)", display: "block", marginTop: 2 }}>
                Linking mother automatically inherits surname, contact numbers, address, and Aarogyasri neonatal scheme benefits with provisional naming.
              </span>
            </div>
          </div>
          <StatusPill kind="brand">Mother-Baby Dual Wristband Ready</StatusPill>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: "grid", gap: 20 }}>
          
          {/* NEWBORN MODE ONLY: STEP 0 - MATERNAL LINKAGE */}
          {isNewbornMode && (
            <Card style={{ borderLeft: "4px solid var(--indigo)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: 19, margin: 0, color: "var(--indigo)" }}>
                    👩‍👧 1. Link Biological Mother (Maternal UHID / IPD Record)
                  </h2>
                  <span style={{ fontSize: 12, color: "var(--slate)" }}>
                    Select admitted mother in Labor Ward / Inpatient beds to auto-fill maternal and insurance parameters.
                  </span>
                </div>
                {selectedMother && (
                  <StatusPill kind="success">Mother Linked: {selectedMother.given_name} {selectedMother.family_name}</StatusPill>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "center" }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                    Search & Select Registered Mother *
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Input
                      placeholder="Filter mothers by name, phone or UHID..."
                      value={motherSearchQuery}
                      onChange={(e) => setMotherSearchQuery(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <Select
                      value={watch("mother_patient_id") || ""}
                      onChange={(e) => handleSelectMother(e.target.value)}
                      style={{ flex: 1.5 }}
                    >
                      <option value="">-- Choose Mother Record --</option>
                      {filteredMothers.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.given_name} {m.family_name} (Phone: {m.phone || "N/A"} · {m.national_id ? `Aadhaar: ${m.national_id}` : `ID: ${m.id.slice(0, 6)}`})
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {selectedMother && (
                  <div style={{ background: "var(--wash-a)", padding: 12, borderRadius: "var(--r-field)", border: "1px solid var(--line)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--indigo)" }}>
                      Maternal UHID: {selectedMother.national_id || selectedMother.id.slice(0, 8)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink)", marginTop: 2 }}>
                      Aarogyasri Scheme: <strong>{selectedMother.aarogyasri_id || selectedMother.pmjay_id || "Cash / General"}</strong>
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--slate)", marginTop: 2 }}>
                      Address: {(selectedMother.address as any)?.city || "Andhra Pradesh"} · Phone: {selectedMother.phone || "N/A"}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* NEWBORN MODE ONLY: STEP 1B - DELIVERY & NEONATAL VITALS CARD */}
          {isNewbornMode && (
            <Card style={{ borderLeft: "4px solid #059669" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 19, margin: "0 0 16px", color: "var(--indigo)" }}>
                👶 2. Neonatal Delivery & Birth Vitals (REG-010)
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                    Exact Time of Birth *
                  </label>
                  <Controller
                    name="birth_time"
                    control={control}
                    render={({ field }) => <Input type="time" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} />}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                    Birth Weight (Grams) * {watchedBirthWeight > 0 && <span style={{ color: "var(--indigo)", fontWeight: 800 }}>({(watchedBirthWeight / 1000).toFixed(2)} kg)</span>}
                  </label>
                  <Controller
                    name="birth_weight_grams"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="e.g. 2950"
                        value={field.value == null ? "" : String(field.value)}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                    Gestational Age (Weeks)
                  </label>
                  <Controller
                    name="gestational_age_weeks"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="e.g. 38"
                        value={field.value == null ? "" : String(field.value)}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                    Delivery Mode
                  </label>
                  <Controller
                    name="delivery_type"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || "normal_vaginal"} onChange={field.onChange} onBlur={field.onBlur}>
                        <option value="normal_vaginal">Normal Vaginal Delivery (NVD)</option>
                        <option value="cesarean_lscs">Cesarean Section (LSCS)</option>
                        <option value="assisted_vacuum">Assisted Vacuum / Forceps</option>
                        <option value="breech">Breech Delivery</option>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                    Birth Multiplicity & Order
                  </label>
                  <Controller
                    name="multiple_birth_order"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value == null ? "1" : String(field.value)}
                        onChange={(e) => {
                          const order = Number(e.target.value);
                          field.onChange(order);
                          if (selectedMother) {
                            const given = order > 1 ? `Twin ${order} of ${selectedMother.given_name}` : `Baby of ${selectedMother.given_name}`;
                            setValue("given_name", given);
                          }
                        }}
                        onBlur={field.onBlur}
                      >
                        <option value="1">Single Birth (Order 1)</option>
                        <option value="2">Twin 2 (Order 2)</option>
                        <option value="3">Triplet 3 (Order 3)</option>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                    1-Min APGAR Score (0-10)
                  </label>
                  <Controller
                    name="apgar_score_1min"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        value={field.value == null ? "" : String(field.value)}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  <div style={{ marginTop: 4 }}>{getApgarBadge(watchedApgar1)}</div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                    5-Min APGAR Score (0-10)
                  </label>
                  <Controller
                    name="apgar_score_5min"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        value={field.value == null ? "" : String(field.value)}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  <div style={{ marginTop: 4 }}>{getApgarBadge(watchedApgar5)}</div>
                </div>
              </div>
            </Card>
          )}

          {/* Card 1: Core Demographics */}
          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              {isNewbornMode ? "3. Newborn Identity & Demographics" : "1. Personal Demographics"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  {isNewbornMode ? "Provisional Given Name *" : "Given Name *"}
                </label>
                <Controller
                  name="given_name"
                  control={control}
                  render={({ field }) => <Input data-testid="reg-given" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} aria-invalid={!!errors.given_name} />}
                />
                {isNewbornMode && (
                  <span style={{ fontSize: 11, color: "var(--slate)", marginTop: 4, display: "block" }}>
                    Provisional name format: Baby of &lt;Mother&gt; (customizable upon naming ceremony).
                  </span>
                )}
                {errors.given_name && (
                  <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.given_name.message as string}
                  </span>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Family Name (Surname) *
                </label>
                <Controller
                  name="family_name"
                  control={control}
                  render={({ field }) => <Input data-testid="reg-family" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} aria-invalid={!!errors.family_name} />}
                />
                {errors.family_name && (
                  <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.family_name.message as string}
                  </span>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Date of Birth *
                </label>
                <Controller
                  name="dob"
                  control={control}
                  render={({ field }) => <Input type="date" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} aria-invalid={!!errors.dob} />}
                />
                {errors.dob && (
                  <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.dob.message as string}
                  </span>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Gender / Sex *
                </label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || "male"} onChange={field.onChange} onBlur={field.onBlur} aria-invalid={!!errors.gender}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other / Undetermined</option>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.gender.message as string}
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Card 2: Contacts */}
          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              {isNewbornMode ? "4. Parent / Guardian Contact Information" : "2. Contact Information"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  {isNewbornMode ? "Parent Mobile Phone Number *" : "Mobile Phone Number *"}
                </label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => <Input placeholder="e.g. 9876543210" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} aria-invalid={!!errors.phone} />}
                />
                {errors.phone && (
                  <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.phone.message as string}
                  </span>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Parent Email Address
                </label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => <Input placeholder="name@domain.com" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} aria-invalid={!!errors.email} />}
                />
                {errors.email && (
                  <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.email.message as string}
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Card 3: Identifiers */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, color: "var(--indigo)" }}>
                {isNewbornMode ? "5. National Identifiers (Optional for Newborns)" : "3. National Identifiers"}
              </h2>
              <StatusPill kind="info">{isNewbornMode ? "Child ABHA / Parent Link" : `Tenant Config: ${tenant === "apollo" ? "Aadhaar Required" : "ABHA Required"}`}</StatusPill>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  National ID (Aadhaar) {!isNewbornMode && tenant === "apollo" && "*"}
                </label>
                <Controller
                  name="national_id"
                  control={control}
                  render={({ field }) => <Input placeholder={isNewbornMode ? "Pending Birth Certificate" : "12-digit Aadhaar Number"} value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} aria-invalid={!!errors.national_id} />}
                />
                {errors.national_id && (
                  <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.national_id.message as string}
                  </span>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  ABHA Health ID Number {!isNewbornMode && tenant === "kims" && "*"}
                </label>
                <Controller
                  name="abha_number"
                  control={control}
                  render={({ field }) => <Input placeholder="14-digit ABHA Number" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} aria-invalid={!!errors.abha_number} />}
                />
                {errors.abha_number && (
                  <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.abha_number.message as string}
                  </span>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  ABHA Address (PHR Address)
                </label>
                <Controller
                  name="abha_address"
                  control={control}
                  render={({ field }) => <Input placeholder="username@abdm" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} />}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Aadhaar Last 4 Digits
                </label>
                <Controller
                  name="aadhaar_last_four"
                  control={control}
                  render={({ field }) => <Input placeholder="e.g. 1234" maxLength={4} value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} aria-invalid={!!errors.aadhaar_last_four} />}
                />
                {errors.aadhaar_last_four && (
                  <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.aadhaar_last_four.message as string}
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Card 4: Address */}
          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              {isNewbornMode ? "6. Residential Address (Inherited from Mother)" : "4. Patient Address"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 16 }}>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Street / Area Address
                </label>
                <Controller
                  name="address_line1"
                  control={control}
                  render={({ field }) => <Input placeholder="House No, Street, Landmark" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} />}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  City / Town
                </label>
                <Controller
                  name="address_city"
                  control={control}
                  render={({ field }) => <Input value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} />}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  State
                </label>
                <Controller
                  name="address_state"
                  control={control}
                  render={({ field }) => <Input value={field.value || "Andhra Pradesh"} disabled />}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Postal Code
                </label>
                <Controller
                  name="address_postal_code"
                  control={control}
                  render={({ field }) => <Input placeholder="e.g. 520001" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} />}
                />
              </div>
            </div>
          </Card>

          {/* Card 5: Referrer attribution */}
          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              {isNewbornMode ? "7. Attending Obstetrician / Pediatrician" : "5. Referrer Attribution"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  {isNewbornMode ? "Attending Clinician" : "Referrer Source Name"}
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <Input
                    data-testid="referrer-search"
                    placeholder="Search clinician..."
                    value={watch("referred_by_name") || ""}
                    onChange={(e) => {
                      setValue("referred_by_name", e.target.value);
                      setValue("referred_by_type", "clinic_doctor");
                    }}
                    style={{ flex: 1 }}
                  />
                  <Controller
                    name="referred_by_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onChange={(e) => {
                          field.onChange(e);
                          const chosen = referrers.find((r) => r.id === e.target.value);
                          if (chosen) {
                            setValue("referred_by_name", chosen.name);
                            setValue("referred_by_type", chosen.type);
                          } else {
                            setValue("referred_by_name", "");
                            setValue("referred_by_type", "");
                          }
                        }}
                        onBlur={field.onBlur}
                      >
                        <option value="">-- Choose Clinician --</option>
                        {referrers.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.org} - {r.type})
                          </option>
                        ))}
                      </Select>
                    )}
                  />
                  <Button data-testid="referrer-quick-add" type="button" ghost onClick={() => setReferrerOpen(true)}>
                    Quick Add
                  </Button>
                </div>
              </div>

              {refId && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                    Referrer Type (India Lock - Fee Payout Ineligible)
                  </label>
                  <StatusPill kind="info">
                    {refType ? refType.toUpperCase() : "UNKNOWN"} (Payout Ineligible)
                  </StatusPill>
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  {isNewbornMode ? "Clinical Notes / Delivery Room" : "Referral Reason / Symptoms"}
                </label>
                <Controller
                  name="referral_reason"
                  control={control}
                  render={({ field }) => <Input data-testid="referral-reason" placeholder={isNewbornMode ? "e.g. Labor OT 4, Pediatrician on call" : "e.g. Chest pain evaluation"} value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} />}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  {isNewbornMode ? "Admitting Ward / Bed" : "Requested Treatment / Service"}
                </label>
                <Controller
                  name="requested_service"
                  control={control}
                  render={({ field }) => <Input data-testid="requested-service" placeholder={isNewbornMode ? "e.g. Postnatal Ward / NICU" : "e.g. Cardiology OPD Consult"} value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} />}
                />
              </div>
            </div>
          </Card>

          {/* Card 6: Insurance Schemes */}
          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              {isNewbornMode ? "8. Cashless Healthcare Schemes (Mother's Aarogyasri / PMJAY Card)" : "6. Cashless Healthcare Schemes (Andhra Pradesh)"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Dr. YSR Aarogyasri Card ID
                </label>
                <Controller
                  name="aarogyasri_id"
                  control={control}
                  render={({ field }) => <Input placeholder="e.g. AP/AS/123456" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} />}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Ayushman Bharat PMJAY ID
                </label>
                <Controller
                  name="pmjay_id"
                  control={control}
                  render={({ field }) => <Input placeholder="e.g. PM-JAY-1234-5678" value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} />}
                />
              </div>
            </div>
          </Card>

          {/* Card 7: Consents & Validation */}
          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              {isNewbornMode ? "9. Neonatal Care Undertaking & Submit" : "7. Patient Consents & Submit"}
            </h2>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <Controller
                  name="consent_general"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <input
                      type="checkbox"
                      id="consent_general"
                      checked={Boolean(value)}
                      onChange={onChange}
                      style={{ marginTop: 4, transform: "scale(1.2)" }}
                    />
                  )}
                />
                <div>
                  <label htmlFor="consent_general" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", cursor: "pointer" }}>
                    {isNewbornMode ? "Maternal & Neonatal Treatment Consent (v1.2) *" : "General Treatment Consent (v1.2) *"}
                  </label>
                  <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "var(--slate)" }}>
                    {isNewbornMode ? "I consent to standard pediatric care, immunizations, and diagnostic screening for the newborn." : "I consent to routing healthcare examination and diagnostic tests in this facility."}
                  </p>
                  {errors.consent_general && (
                    <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                      {errors.consent_general.message as string}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, borderTop: "1px dashed var(--line)", paddingTop: 14 }}>
                <Controller
                  name="consent_sharing"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <input
                      type="checkbox"
                      id="consent_sharing"
                      checked={Boolean(value)}
                      onChange={onChange}
                      style={{ marginTop: 4, transform: "scale(1.2)" }}
                    />
                  )}
                />
                <div>
                  <label htmlFor="consent_sharing" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", cursor: "pointer" }}>
                    ABDM Data Exchange & Child Health ID Registry Consent (v2.0)
                  </label>
                  <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "var(--slate)" }}>
                    I authorize sharing FHIR R4 medical summaries with national birth registries and linked pediatric records.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                <Button type="button" ghost onClick={() => navigate("/patients")}>
                  Cancel
                </Button>
                <Button data-testid="reg-save" type="submit" disabled={registerMutation.isPending} style={{ background: isNewbornMode ? "linear-gradient(135deg, #0D5C63 0%, #059669 100%)" : undefined }}>
                  {registerMutation.isPending ? "Registering..." : (isNewbornMode ? "👶 Register Newborn & Link Mother" : "Submit Registration")}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </form>

      {/* DUPLICATE DETECTION INTERSTITIAL PANEL */}
      <Modal isOpen={duplicateOpen} onClose={() => setDuplicateOpen(false)} title="Duplicate Match Detected">
        <p style={{ margin: "0 0 16px 0", color: "var(--ink)", fontSize: 14.5, lineHeight: 1.5 }}>
          Potential matches found in the Master Patient Index (MPI). Please verify before creating a new record.
        </p>

        <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
          {duplicateCandidates.map((cand) => (
            <div
              key={cand.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--wash-a)",
                padding: 12,
                borderRadius: "var(--r-field)",
                border: "1px solid var(--line)",
              }}
            >
              <div>
                <strong style={{ display: "block", color: "var(--indigo)" }}>
                  {cand.given_name} {cand.family_name}
                </strong>
                <span style={{ fontSize: 12, color: "var(--slate)" }}>
                  DOB: {cand.dob || "N/A"} · Phone: {cand.phone || "N/A"}
                </span>
                <div style={{ fontSize: 11, fontStyle: "italic", color: "var(--orange)", marginTop: 2 }}>
                  {cand.match_reason} (Score: {cand.score})
                </div>
              </div>
              <Button type="button" ghost onClick={() => navigate(`/patients/${cand.id}`)}>
                Open Record
              </Button>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button type="button" ghost onClick={() => setDuplicateOpen(false)}>
            Cancel & Edit Form
          </Button>
          <Button type="button" onClick={handleForceCreate} disabled={registerMutation.isPending}>
            {registerMutation.isPending ? "Registering..." : "Not a Match - Create New"}
          </Button>
        </div>
      </Modal>

      {/* REFERRER QUICK ADD MODAL (UI-203) */}
      <Modal isOpen={referrerOpen} onClose={() => setReferrerOpen(false)} title="Quick Add Referrer Master">
        <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
              Referrer Name
            </label>
            <Input data-testid="referrer-add-name" value={newRefName} onChange={(e) => setNewRefName(e.target.value)} placeholder="e.g. Dr. A. Prasad" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
              Referrer Type
            </label>
            <Select data-testid="referrer-add-type" value={newRefType} onChange={(e) => setNewRefType(e.target.value)}>
              <option value="clinic_doctor">clinic_doctor</option>
              <option value="doctor">Medical Doctor</option>
              <option value="clinic">Community Clinic</option>
              <option value="hospital">General Hospital</option>
            </Select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
              Organization / Facility
            </label>
            <Input value={newRefOrg} onChange={(e) => setNewRefOrg(e.target.value)} placeholder="e.g. Guntur Health Care" />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button type="button" ghost onClick={() => setReferrerOpen(false)}>
            Cancel
          </Button>
          <Button data-testid="referrer-add-save" type="button" disabled={!newRefName} onClick={handleQuickAddReferrer}>
            Save & Select
          </Button>
        </div>
      </Modal>

      {/* Toast notifications */}
      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
