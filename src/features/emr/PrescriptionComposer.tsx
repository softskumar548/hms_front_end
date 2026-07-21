import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Input, Select, StatusPill, Toast } from "../../ui/components";

// Prescriber favorite SIG templates (RX-007)
const favoriteTemplates = [
  { id: "fav-1", drug_id: "drug-2", drug_name: "Paracetamol 650mg (Oral Tablet)", brand_name: "Dolo 650", dose: "650mg", route: "Oral", frequency: "TDS", duration: "5 days", qty: "15" },
  { id: "fav-2", drug_id: "drug-1", drug_name: "Amoxicillin 500mg (Oral Capsule)", brand_name: "Amoxil", dose: "500mg", route: "Oral", frequency: "TDS", duration: "7 days", qty: "21" },
  { id: "fav-3", drug_id: "drug-3", drug_name: "Telmisartan 40mg (Oral Tablet)", brand_name: "Telma 40", dose: "40mg", route: "Oral", frequency: "Once daily", duration: "30 days", qty: "30" },
];

interface PrescriptionComposerProps {
  encounterId: string;
  patientId: string;
  isLocked: boolean;
}

export default function PrescriptionComposer({ encounterId, patientId, isLocked }: PrescriptionComposerProps) {
  const { token } = useAuth();
  const qc = useQueryClient();

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Search query & selected drug details
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDrug, setSelectedDrug] = useState<any>(null);

  // Structured SIG state
  const [dose, setDose] = useState("");
  const [route, setRoute] = useState("Oral");
  const [frequency, setFrequency] = useState("Once daily");
  const [duration, setDuration] = useState("5 days");
  const [qty, setQty] = useState("5");
  const [refills, setRefills] = useState("0");

  // Local draft items list
  const [addedItems, setAddedItems] = useState<any[]>([]);
  const [signedRx, setSignedRx] = useState<any>(null);

  // Override fields for Penicillin allergy alert (RX-003)
  const [overrideCode, setOverrideCode] = useState("");
  const [overrideNote, setOverrideNote] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Fetch patient summary to look up allergy list
  const { data: summary } = useQuery({
    queryKey: ["patientSummary", patientId],
    queryFn: () => api.getPatientSummary(token, patientId),
    enabled: !!patientId,
  });

  // Query catalog for drug search
  const { data: drugResults = [] } = useQuery({
    queryKey: ["drugSearch", searchQuery],
    queryFn: () => api.searchDrugs(token, searchQuery),
    enabled: searchQuery.length >= 2,
  });

  // Compose / save draft prescription mutation
  const draftMutation = useMutation({
    mutationFn: (items: any[]) =>
      api.createPrescription(token, {
        patient_id: patientId,
        encounter_id: encounterId,
        items: items,
      } as any),
    onSuccess: (data) => {
      setSignedRx(data);
      triggerToast("Draft prescription generated.");
    },
    onError: () => {
      triggerToast("Failed to create draft prescription.");
    },
  });

  // Sign prescription mutation (supporting override parameters)
  const signMutation = useMutation({
    mutationFn: (body: any) => api.signPrescription(token, signedRx?.id || "", body),
    onSuccess: (data) => {
      setSignedRx(data);
      triggerToast("Prescription signed successfully.");
      qc.invalidateQueries({ queryKey: ["patientSummary", patientId] });
    },
    onError: (err: any) => {
      triggerToast(err.message || "Failed to sign prescription.");
    },
  });

  const handleSelectDrug = (drug: any) => {
    setSelectedDrug(drug);
    setSearchQuery("");
  };

  const handleApplyFavorite = (fav: any) => {
    setSelectedDrug({
      id: fav.drug_id,
      name: fav.drug_name,
      brand_name: fav.brand_name,
    });
    setDose(fav.dose);
    setRoute(fav.route);
    setFrequency(fav.frequency);
    setDuration(fav.duration);
    setQty(fav.qty);
    setRefills("0");
    triggerToast("Favorite template applied.");
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrug) {
      triggerToast("Please select a drug before adding.");
      return;
    }
    const newItem = {
      drug_id: selectedDrug.id,
      drug_name: selectedDrug.name,
      dose: dose || "1 tab",
      route,
      frequency,
      duration,
      qty: Number(qty) || 10,
      refills: Number(refills) || 0,
    };
    const updated = [...addedItems, newItem];
    setAddedItems(updated);
    
    // Auto-save draft prescription
    draftMutation.mutate(updated);

    // Reset drug form inputs
    setSelectedDrug(null);
    setDose("");
    setRoute("Oral");
    setFrequency("Once daily");
    setDuration("5 days");
    setQty("5");
    setRefills("0");
  };

  const handleSign = () => {
    if (!signedRx) return;
    
    // Check if penicillin override is required
    if (hasAllergyConflict && !overrideCode) {
      triggerToast("Error: Allergy warning override code is required.");
      return;
    }

    signMutation.mutate({
      override_code: overrideCode || undefined,
      override_reason: overrideNote || undefined,
    });
  };

  // Allergy warning assessment (RX-003)
  const patientAllergies = summary?.allergies || [];
  const hasPenicillinAllergy = patientAllergies.some((a: any) =>
    a.substance_display?.toLowerCase().includes("penicillin")
  );
  
  const hasPenicillinPrescribed =
    addedItems.some((i) => i.drug_name?.toLowerCase().includes("amoxicillin")) ||
    selectedDrug?.name?.toLowerCase().includes("amoxicillin");

  const hasAllergyConflict = hasPenicillinAllergy && hasPenicillinPrescribed;
  const isRxSigned = signedRx?.status === "signed" || isLocked;

  return (
    <Card style={{ border: "1px solid var(--line)", background: "#fff" }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
        Structured Rx Medication Composer (RX-002)
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 20 }}>
        {/* Left Column: Favorites templates (RX-007) */}
        {!isRxSigned && (
          <div style={{ borderRight: "1px solid var(--line)", paddingRight: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 10 }}>
              Prescriber Favorites
            </span>
            <div style={{ display: "grid", gap: 8 }}>
              {favoriteTemplates.map((fav) => (
                <button
                  key={fav.id}
                  type="button"
                  onClick={() => handleApplyFavorite(fav)}
                  style={{
                    textAlign: "left",
                    background: "var(--wash-a)",
                    border: "1px solid var(--line)",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    fontSize: 12,
                    cursor: "pointer",
                    transition: "transform 0.1s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <strong style={{ color: "var(--indigo)", display: "block" }}>{fav.brand_name}</strong>
                  <span style={{ color: "var(--ink)" }}>{fav.dose} · {fav.frequency}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Right Column: Prescription editor workspace */}
        <div style={{ display: "grid", gap: 14 }}>
          {/* Drug Search Catalog Input */}
          {!isRxSigned && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                Search Catalog Medication Brand *
              </label>
              <div style={{ position: "relative" }}>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type drug name (e.g. Paracetamol, Amoxicillin)..."
                />
                
                {drugResults.length > 0 && searchQuery.length >= 2 && (
                  <div style={{ position: "absolute", background: "#fff", border: "1px solid var(--line)", borderRadius: "10px", width: "100%", zIndex: 10, boxShadow: "var(--shadow-pop)", maxHeight: 180, overflowY: "auto" }}>
                    {drugResults.map((drug) => (
                      <div
                        key={drug.id}
                        onClick={() => handleSelectDrug(drug)}
                        style={{ padding: "10px 14px", borderBottom: "1px solid var(--wash-b)", cursor: "pointer", fontSize: 13.5 }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "var(--wash-a)")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
                      >
                        <strong>{(drug as any).brand_name}</strong> · {drug.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selected Drug Details Summary */}
          {selectedDrug && (
            <div style={{ background: "var(--indigo-soft)", padding: "12px 14px", borderRadius: "14px" }}>
              <span style={{ fontSize: 11, color: "var(--slate)", textTransform: "uppercase", fontWeight: 700 }}>
                Selected Formulation
              </span>
              <strong style={{ fontSize: 14, color: "var(--indigo)", display: "block", marginTop: 2 }}>
                {selectedDrug.name} ({(selectedDrug as any).brand_name})
              </strong>
            </div>
          )}

          {/* SIG Builder Form Grid */}
          {!isRxSigned && selectedDrug && (
            <form onSubmit={handleAddItem} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, alignItems: "flex-end" }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>Dose (e.g. 500mg)</label>
                <Input
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  placeholder="500mg"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Route
                </label>
                <Select value={route} onChange={(e) => setRoute(e.target.value)}>
                  <option value="Oral">Oral Capsule/Tablet</option>
                  <option value="IV">Intravenous (IV)</option>
                  <option value="Topical">Topical Cream</option>
                  <option value="Inhalation">Inhalation</option>
                </Select>
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                  Frequency
                </label>
                <Select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily (BD)</option>
                  <option value="TDS">Thrice daily (TDS)</option>
                  <option value="QDS">Four times daily</option>
                  <option value="SOS">As needed (SOS)</option>
                </Select>
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>Duration</label>
                <Input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="5 days"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>Qty</label>
                <Input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="10"
                  required
                />
              </div>
              <Button type="submit" style={{ width: "100%" }}>
                Add to Rx
              </Button>
            </form>
          )}

          {/* Current Prescribed Medication List */}
          {addedItems.length > 0 && (
            <div style={{ borderTop: "1px dashed var(--line)", paddingTop: 12 }}>
              <strong style={{ fontSize: 13, color: "var(--indigo)", display: "block", marginBottom: 8 }}>
                Medication SIG Items List
              </strong>
              <div style={{ display: "grid", gap: 6 }}>
                {addedItems.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--wash-a)", borderRadius: "10px", border: "1px solid var(--line)" }}>
                    <div>
                      <strong style={{ fontSize: 13.5, color: "var(--ink)" }}>{item.drug_name}</strong>
                      <span style={{ fontSize: 12, color: "var(--slate)", display: "block" }}>
                        SIG: {item.dose} · {item.route} · {item.frequency} for {item.duration} (Qty: {item.qty})
                      </span>
                    </div>
                    {!isRxSigned && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = addedItems.filter((_, i) => i !== idx);
                          setAddedItems(updated);
                          draftMutation.mutate(updated);
                        }}
                        style={{ border: "none", background: "transparent", color: "var(--danger)", cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drug-Allergy Warning safety display alerts (RX-003) */}
          {hasAllergyConflict && !isRxSigned && (
            <div style={{ background: "#fbe3e3", border: "1px solid var(--danger)", color: "#b22b2b", padding: 14, borderRadius: "14px", fontSize: 13 }}>
              <strong style={{ display: "block", marginBottom: 6 }}>⚠️ CRITICAL ALLERGY ALERT (RX-003)</strong>
              Patient has a documented <strong>Penicillin Allergy</strong>. Prescribing <strong>Amoxicillin</strong> is blocked.
              To override and proceed, you must provide a clinical override justification.

              <div style={{ display: "grid", gap: 8, marginTop: 10, borderTop: "1px solid rgba(178,43,43,0.2)", paddingTop: 8 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4 }}>
                    Override Coded Reason *
                  </label>
                  <Select value={overrideCode} onChange={(e) => setOverrideCode(e.target.value)} style={{ borderColor: "var(--danger)" }}>
                    <option value="">-- Choose override reason code --</option>
                    <option value="BENEFIT_OUTWEIGHS_RISK">Clinical benefit outweighs documented risk</option>
                    <option value="NO_ALTERNATIVE">No viable therapeutic alternative exists</option>
                    <option value="PATIENT_TOLERATED">Patient has previously tolerated formulation</option>
                  </Select>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Override Clinical Justification Note</label>
                  <Input
                    value={overrideNote}
                    onChange={(e) => setOverrideNote(e.target.value)}
                    placeholder="Provide additional clinical notes..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Prescription signing options */}
          {signedRx && !isRxSigned && (
            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px dashed var(--line)", paddingTop: 12 }}>
              <Button
                type="button"
                disabled={signMutation.isPending || (hasAllergyConflict && !overrideCode)}
                onClick={handleSign}
              >
                {signMutation.isPending ? "Signing Prescription..." : "🖋️ Sign & Authorize Prescription"}
              </Button>
            </div>
          )}

          {isRxSigned && (
            <div style={{ background: "rgba(28, 154, 78, 0.05)", border: "1px solid var(--green)", color: "var(--green)", padding: 12, borderRadius: "14px", fontSize: 13, fontWeight: 600 }}>
              ✓ Prescription finalized and signed off by prescriber.
              {signedRx?.override_code && (
                <div style={{ fontSize: 12, color: "var(--ink)", fontWeight: 400, marginTop: 4 }}>
                  <strong>Allergy Override Code:</strong> {signedRx.override_code}
                  <br />
                  <strong>Override Justification:</strong> {signedRx.override_reason || "None"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </Card>
  );
}
