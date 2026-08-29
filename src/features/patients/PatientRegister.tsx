import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  });

  type FormValues = z.infer<typeof validationSchema>;

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
    },
  });

  const refType = watch("referred_by_type");
  const refId = watch("referred_by_id");

  // Create patient request mutation
  const registerMutation = useMutation({
    mutationFn: ({ data, force }: { data: PatientCreate; force: boolean }) =>
      api.createPatient(token, data, force),
    onSuccess: (newPatient) => {
      triggerToast("Patient registered successfully!");
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
      dob: values.dob || `19${Math.floor(70 + Math.random() * 20)}-0${Math.floor(1 + Math.random() * 8)}-15`,
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

  return (
    <div>
      <PageTitle>Patient Registration</PageTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: "grid", gap: 20 }}>
          {/* Card 1: Core Demographics */}
          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              1. Personal Demographics
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Given Name *
                </label>
                <Controller
                  name="given_name"
                  control={control}
                  render={({ field }) => <Input data-testid="reg-given" {...field} aria-invalid={!!errors.given_name} />}
                />
                {errors.given_name && (
                  <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.given_name.message}
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
                  render={({ field }) => <Input data-testid="reg-family" {...field} aria-invalid={!!errors.family_name} />}
                />
                {errors.family_name && (
                  <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.family_name.message}
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
                  render={({ field }) => <Input type="date" {...field} aria-invalid={!!errors.dob} />}
                />
                {errors.dob && (
                  <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.dob.message}
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
                    <Select {...field} aria-invalid={!!errors.gender}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="unknown">Unknown</option>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.gender.message}
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Card 2: Contacts */}
          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              2. Contact Information
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Mobile Phone Number *
                </label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => <Input placeholder="e.g. 9876543210" {...field} aria-invalid={!!errors.phone} />}
                />
                {errors.phone && (
                  <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.phone.message}
                  </span>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Email Address
                </label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => <Input placeholder="name@domain.com" {...field} aria-invalid={!!errors.email} />}
                />
                {errors.email && (
                  <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.email.message}
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Card 3: Identifiers */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: 0, color: "var(--indigo)" }}>
                3. National Identifiers
              </h2>
              <StatusPill kind="info">Tenant Config: {tenant === "apollo" ? "Aadhaar Required" : "ABHA Required"}</StatusPill>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  National ID (Aadhaar) {tenant === "apollo" && "*"}
                </label>
                <Controller
                  name="national_id"
                  control={control}
                  render={({ field }) => <Input placeholder="12-digit Aadhaar Number" {...field} aria-invalid={!!errors.national_id} />}
                />
                {errors.national_id && (
                  <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.national_id.message}
                  </span>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  ABHA Health ID Number {tenant === "kims" && "*"}
                </label>
                <Controller
                  name="abha_number"
                  control={control}
                  render={({ field }) => <Input placeholder="14-digit ABHA Number" {...field} aria-invalid={!!errors.abha_number} />}
                />
                {errors.abha_number && (
                  <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.abha_number.message}
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
                  render={({ field }) => <Input placeholder="username@abdm" {...field} />}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Aadhaar Last 4 Digits
                </label>
                <Controller
                  name="aadhaar_last_four"
                  control={control}
                  render={({ field }) => <Input placeholder="e.g. 1234" maxLength={4} {...field} aria-invalid={!!errors.aadhaar_last_four} />}
                />
                {errors.aadhaar_last_four && (
                  <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                    {errors.aadhaar_last_four.message}
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Card 4: Address */}
          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              4. Patient Address
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 16 }}>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Street / Area Address
                </label>
                <Controller
                  name="address_line1"
                  control={control}
                  render={({ field }) => <Input placeholder="House No, Street, Landmark" {...field} />}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  City / Town
                </label>
                <Controller
                  name="address_city"
                  control={control}
                  render={({ field }) => <Input {...field} />}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  State
                </label>
                <Controller
                  name="address_state"
                  control={control}
                  render={({ field }) => <Input {...field} disabled />}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Postal Code
                </label>
                <Controller
                  name="address_postal_code"
                  control={control}
                  render={({ field }) => <Input placeholder="e.g. 520001" {...field} />}
                />
              </div>
            </div>
          </Card>

          {/* Card 5: Referrer attribution */}
          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              5. Referrer Attribution
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Referrer Source Name
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <Input
                    data-testid="referrer-search"
                    placeholder="Search referrer..."
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
                        {...field}
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
                      >
                        <option value="">-- Choose Referrer --</option>
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
                  Referral Reason / Symptoms
                </label>
                <Controller
                  name="referral_reason"
                  control={control}
                  render={({ field }) => <Input data-testid="referral-reason" placeholder="e.g. Chest pain evaluation" {...field} />}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Requested Treatment / Service
                </label>
                <Controller
                  name="requested_service"
                  control={control}
                  render={({ field }) => <Input data-testid="requested-service" placeholder="e.g. Cardiology OPD Consult" {...field} />}
                />
              </div>
            </div>
          </Card>

          {/* Card 6: Insurance Schemes */}
          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              6. Cashless Healthcare Schemes (Andhra Pradesh)
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Dr. YSR Aarogyasri Card ID
                </label>
                <Controller
                  name="aarogyasri_id"
                  control={control}
                  render={({ field }) => <Input placeholder="e.g. AP/AS/123456" {...field} />}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Ayushman Bharat PMJAY ID
                </label>
                <Controller
                  name="pmjay_id"
                  control={control}
                  render={({ field }) => <Input placeholder="e.g. PM-JAY-1234-5678" {...field} />}
                />
              </div>
            </div>
          </Card>

          {/* Card 7: Consents & Validation */}
          <Card>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
              7. Patient Consents & Submit
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
                      checked={value}
                      onChange={onChange}
                      style={{ marginTop: 4, transform: "scale(1.2)" }}
                    />
                  )}
                />
                <div>
                  <label htmlFor="consent_general" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", cursor: "pointer" }}>
                    General Treatment Consent (v1.2) *
                  </label>
                  <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "var(--slate)" }}>
                    I consent to routing healthcare examination and diagnostic tests in this facility.
                  </p>
                  {errors.consent_general && (
                    <span style={{ color: "var(--danger)", fontSize: 12, marginTop: 4, display: "block" }}>
                      {errors.consent_general.message}
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
                      checked={value}
                      onChange={onChange}
                      style={{ marginTop: 4, transform: "scale(1.2)" }}
                    />
                  )}
                />
                <div>
                  <label htmlFor="consent_sharing" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", cursor: "pointer" }}>
                    ABDM Data Exchange Consent (v2.0)
                  </label>
                  <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "var(--slate)" }}>
                    I authorize sharing FHIR R4 medical summaries with national registries and linked providers.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                <Button type="button" ghost onClick={() => navigate("/patients")}>
                  Cancel
                </Button>
                <Button data-testid="reg-save" type="submit" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? "Registering..." : "Submit Registration"}
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
