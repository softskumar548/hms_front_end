import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, PatientOut, AllergyIntoleranceCreate } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Button, Card, StatusPill, Chip, Modal, Input, Select, Toast } from "../../ui/components";

interface PatientHeaderProps {
  patient: PatientOut;
}

export default function PatientHeader({ patient }: PatientHeaderProps) {
  const { token } = useAuth();
  const qc = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Form states for allergy assertion (EMR-005)
  const [allergen, setAllergen] = useState("");
  const [severity, setSeverity] = useState("moderate");
  const [noKnown, setNoKnown] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Fetch Patient Allergies (EMR-005)
  const { data: allergies = [], isLoading } = useQuery({
    queryKey: ["allergies", patient.id],
    queryFn: () => api.listAllergies(token, patient.id),
    enabled: !!patient.id,
  });

  // Allergy assert mutation
  const assertMutation = useMutation({
    mutationFn: (body: AllergyIntoleranceCreate) => api.assertAllergy(token, patient.id, body),
    onSuccess: () => {
      triggerToast("Allergy status asserted successfully!");
      qc.invalidateQueries({ queryKey: ["allergies", patient.id] });
      setModalOpen(false);
      setAllergen("");
      setNoKnown(false);
    },
    onError: () => {
      triggerToast("Failed to assert allergy.");
    },
  });

  const calculateAge = (dobString?: string | null) => {
    if (!dobString) return "Age unknown";
    try {
      const birth = new Date(dobString);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      return `${age}y`;
    } catch (e) {
      return "Age unknown";
    }
  };

  const handleAssertSubmit = () => {
    if (!noKnown && !allergen) return;
    assertMutation.mutate({
      substance_display: noKnown ? "No known allergies" : allergen,
      substance_code: noKnown ? "160244002" : allergen.substring(0, 3).toUpperCase(),
      severity: noKnown ? null : severity,
      is_no_known: noKnown,
      reaction: noKnown ? null : "hypersensitivity",
      criticality: noKnown ? null : "high",
    });
  };

  const hasNoKnown = allergies.some((a) => a.is_no_known);
  const allergyList = allergies.filter((a) => !a.is_no_known);

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100, background: "var(--wash-a)", paddingBottom: 16 }}>
      {/* 1. Patient Demographics & ABDM/ABHA Badges Card */}
      <Card style={{ borderRadius: "22px 22px 0 0", padding: "18px 20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
          {/* Patient name & sex/age signature */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--ink)", margin: 0 }}>
              {patient.given_name} {patient.family_name}
            </span>
            <span style={{ color: "var(--slate)", fontSize: 13.5, fontWeight: 600 }}>
              {patient.gender ? patient.gender.toUpperCase() : "UNSPECIFIED"} · {calculateAge(patient.dob)} ({patient.dob || "DOB Unknown"})
            </span>
          </div>

          {/* ABDM/ABHA Connection Badges */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: "auto" }}>
            <StatusPill kind={patient.national_id ? "brand" : "warn"}>
              {patient.national_id ? `Aadhaar Verified` : "No Aadhaar Linked"}
            </StatusPill>
            <StatusPill kind={patient.abha_number ? "brand" : "info"}>
              {patient.abha_number ? `ABHA: ${patient.abha_number}` : "No ABHA Link"}
            </StatusPill>
          </div>
        </div>

        {/* Info chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, borderTop: "1px solid var(--line)", paddingTop: 10 }}>
          <Chip active={false}>Mobile: {patient.phone || "—"}</Chip>
          {patient.abha_address && <Chip active={false}>ABHA Address: {patient.abha_address}</Chip>}
          {patient.aarogyasri_id && <Chip active={false}>Aarogyasri ID: {patient.aarogyasri_id}</Chip>}
          {patient.pmjay_id && <Chip active={false}>PMJAY ID: {patient.pmjay_id}</Chip>}
          {patient.referred_by_name && (
            <Chip active={false}>
              Referred by: {patient.referred_by_name} ({patient.referred_by_type})
            </Chip>
          )}
        </div>
      </Card>

      {/* 2. EMR Allergy banner (EMR-005) - Non-negotiable sticky warning banner */}
      <div
        style={{
          background: allergies.length === 0 ? "var(--orange)" : hasNoKnown ? "#e3f5ea" : "#fbe3e3",
          borderTop: "1px solid var(--line)",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: allergies.length === 0 ? "#fff" : hasNoKnown ? "#1c9a4e" : "#b22b2b",
          fontWeight: 700,
          fontSize: 13.5,
          borderRadius: "0 0 22px 22px",
          boxShadow: "0 4px 10px rgba(19, 26, 143, 0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <span>
            {isLoading ? (
              "Checking clinical allergy declarations..."
            ) : allergies.length === 0 ? (
              "No allergy assertion has been declared for this patient."
            ) : hasNoKnown ? (
              "Confirmed: No known allergies (EMR-005)"
            ) : (
              `ACTIVE CLINICAL ALLERGIES: ${allergyList.map((a) => `${a.substance_display} (${a.severity || "unknown"})`).join(", ")}`
            )}
          </span>
        </div>

        <Button
          type="button"
          ghost
          style={{
            borderColor: allergies.length === 0 ? "#fff" : hasNoKnown ? "#1c9a4e" : "#b22b2b",
            color: allergies.length === 0 ? "#fff" : hasNoKnown ? "#1c9a4e" : "#b22b2b",
            fontSize: 11.5,
            padding: "4px 12px",
          }}
          onClick={() => setModalOpen(true)}
        >
          {allergies.length === 0 ? "Assert Allergy Status" : "Update Assertion"}
        </Button>
      </div>

      {/* ALLERGY ASSERTION MODAL */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Assert Allergy Status (EMR-005)">
        <div style={{ display: "grid", gap: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="no_known"
              checked={noKnown}
              onChange={(e) => {
                setNoKnown(e.target.checked);
                if (e.target.checked) setAllergen("");
              }}
              style={{ transform: "scale(1.2)" }}
            />
            <label htmlFor="no_known" style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)", cursor: "pointer" }}>
              Assert "No Known Allergies"
            </label>
          </div>

          {!noKnown && (
            <>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Allergen / Substance Display Name
                </label>
                <Input
                  value={allergen}
                  onChange={(e) => setAllergen(e.target.value)}
                  placeholder="e.g. Penicillin, Eggs, Latex"
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Severity Level
                </label>
                <Select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </Select>
              </div>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button ghost onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button disabled={!noKnown && !allergen} onClick={handleAssertSubmit}>
            Save Assertion
          </Button>
        </div>
      </Modal>

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
