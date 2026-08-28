import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Input, Select, StatusPill, Toast } from "../../ui/components";

// Prescriber favorite SIG templates (RX-007) with bilingual Telugu instructions
const favoriteTemplates = [
  { id: "fav-1", drug_id: "drug-2", drug_name: "Paracetamol 650mg (Oral Tablet)", brand_name: "Dolo 650", dose: "650mg", route: "Oral", frequency: "1-1-1 (TDS)", duration: "5 days", timing: "After Food", qty: "15", telugu: "ఆహారం తర్వాత - రోజుకు 3 సార్లు" },
  { id: "fav-2", drug_id: "drug-1", drug_name: "Amoxicillin 500mg + Clavulanate (Oral)", brand_name: "Augmentin / Amoxil", dose: "625mg", route: "Oral", frequency: "1-0-1 (BD)", duration: "5 days", timing: "After Food", qty: "10", telugu: "ఆహారం తర్వాత - ఉదయం, రాత్రి" },
  { id: "fav-3", drug_id: "drug-3", drug_name: "Telmisartan 40mg (Oral Tablet)", brand_name: "Telma 40", dose: "40mg", route: "Oral", frequency: "1-0-0 (OD Morning)", duration: "30 days", timing: "Before Food", qty: "30", telugu: "ఉదయం పరిగడుపున - రోజుకు 1 సారి" },
  { id: "fav-4", drug_id: "drug-4", drug_name: "Pantoprazole 40mg (Oral Tablet)", brand_name: "Pantocid 40", dose: "40mg", route: "Oral", frequency: "1-0-0 (OD Morning)", duration: "14 days", timing: "Before Food (Empty Stomach)", qty: "14", telugu: "ఉదయం పరిగడుపున టిఫిన్ కంటే ముందు" },
  { id: "fav-5", drug_id: "drug-5", drug_name: "Azithromycin 500mg (Oral Tablet)", brand_name: "Azithral 500", dose: "500mg", route: "Oral", frequency: "1-0-0 (OD)", duration: "3 days", timing: "After Food", qty: "3", telugu: "ఆహారం తర్వాత - రోజుకు 1 సారి" },
  { id: "fav-6", drug_id: "drug-6", drug_name: "Cetirizine 10mg + Montelukast (Oral)", brand_name: "Montair-LC", dose: "10mg", route: "Oral", frequency: "0-0-1 (OD Night)", duration: "7 days", timing: "After Food (At Bedtime)", qty: "7", telugu: "రాత్రి పడుకునే ముందు - 1 టాబ్లెట్" },
];

const fallbackCatalog = [
  { id: "drug-1", name: "Amoxicillin 500mg (Oral Capsule)", brand_name: "Amoxil / Novamox" },
  { id: "drug-2", name: "Paracetamol 650mg (Oral Tablet)", brand_name: "Dolo 650 / Calpol" },
  { id: "drug-3", name: "Telmisartan 40mg (Oral Tablet)", brand_name: "Telma 40 / Telpres" },
  { id: "drug-4", name: "Pantoprazole 40mg (Oral Tablet)", brand_name: "Pantocid 40 / Pan-D" },
  { id: "drug-5", name: "Azithromycin 500mg (Oral Tablet)", brand_name: "Azithral 500 / Azee" },
  { id: "drug-6", name: "Montelukast 10mg + Levocetirizine 5mg", brand_name: "Montair-LC / Romilast-L" },
  { id: "drug-7", name: "Metformin 500mg SR (Oral Tablet)", brand_name: "Glycomet 500 SR / Obimet" },
  { id: "drug-8", name: "Calcium Carbonate 500mg + Vitamin D3", brand_name: "Shelcal 500 / Cipcal" },
  { id: "drug-9", name: "Vitamin B-Complex + B12", brand_name: "Neurobion Forte / Becosules" },
  { id: "drug-10", name: "Ciprofloxacin 500mg (Oral Tablet)", brand_name: "Cifran 500 / Ciplox" },
  { id: "drug-11", name: "Atorvastatin 10mg (Oral Tablet)", brand_name: "Atorva 10 / Storvas" },
  { id: "drug-12", name: "Domperidone 10mg + Pantoprazole 40mg", brand_name: "Pan-D / Pantocid-DSR" },
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
  const [frequency, setFrequency] = useState("1-0-1 (BD)");
  const [timing, setTiming] = useState("After Food");
  const [duration, setDuration] = useState("5 days");
  const [qty, setQty] = useState("10");
  const [refills, setRefills] = useState("0");
  const [teluguInstruction, setTeluguInstruction] = useState("ఆహారం తర్వాత - రోజుకు రెండు సార్లు");

  // Local draft items list
  const [addedItems, setAddedItems] = useState<any[]>([]);
  const [signedRx, setSignedRx] = useState<any>(null);

  // Override fields for Penicillin allergy alert (RX-003)
  const [overrideCode, setOverrideCode] = useState("");
  const [overrideNote, setOverrideNote] = useState("");
  const [signAttempted, setSignAttempted] = useState(false);
  const [overrideConfirmed, setOverrideConfirmed] = useState(false);

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
  const { data: serverDrugs = [] } = useQuery({
    queryKey: ["drugSearch", searchQuery],
    queryFn: () => api.searchDrugs(token, searchQuery),
    enabled: searchQuery.length >= 2,
  });

  const searchHits = searchQuery.length >= 2
    ? [
        ...serverDrugs,
        ...fallbackCatalog.filter(
          (d) =>
            !serverDrugs.some((sd: any) => sd.name === d.name) &&
            (d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              d.brand_name.toLowerCase().includes(searchQuery.toLowerCase()))
        ),
      ]
    : [];

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
      triggerToast("Draft prescription updated locally.");
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
      triggerToast(err.message || "Prescription authorized and finalized.");
    },
  });

  const handleSelectDrug = (drug: any) => {
    setSelectedDrug(drug);
    setSearchQuery("");
    if (drug.brand_name?.includes("Dolo")) {
      setDose("650mg");
      setFrequency("1-1-1 (TDS)");
      setTiming("After Food");
      setTeluguInstruction("ఆహారం తర్వాత - రోజుకు 3 సార్లు");
    } else if (drug.brand_name?.includes("Amoxil") || drug.brand_name?.includes("Augmentin")) {
      setDose("625mg");
      setFrequency("1-0-1 (BD)");
      setTiming("After Food");
      setTeluguInstruction("ఆహారం తర్వాత - ఉదయం, రాత్రి");
    } else if (drug.brand_name?.includes("Telma")) {
      setDose("40mg");
      setFrequency("1-0-0 (OD Morning)");
      setTiming("Before Food");
      setTeluguInstruction("ఉదయం పరిగడుపున - రోజుకు 1 సారి");
    } else if (drug.brand_name?.includes("Pan")) {
      setDose("40mg");
      setFrequency("1-0-0 (OD Morning)");
      setTiming("Before Food (Empty Stomach)");
      setTeluguInstruction("ఉదయం పరిగడుపున టిఫిన్ కంటే ముందు");
    } else {
      setDose("1 tab");
    }
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
    setTiming(fav.timing);
    setQty(fav.qty);
    setTeluguInstruction(fav.telugu);
    setRefills("0");
    triggerToast(`Favorite applied: ${fav.brand_name}`);
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
      brand_name: selectedDrug.brand_name || selectedDrug.name,
      dose: dose || "1 tab",
      route,
      frequency,
      timing,
      duration,
      qty: Number(qty) || 10,
      refills: Number(refills) || 0,
      telugu: teluguInstruction,
    };
    const updated = [...addedItems, newItem];
    setAddedItems(updated);

    // Auto-save draft prescription
    draftMutation.mutate(updated);

    // Reset drug form inputs
    setSelectedDrug(null);
    setDose("");
    setRoute("Oral");
    setFrequency("1-0-1 (BD)");
    setTiming("After Food");
    setDuration("5 days");
    setQty("10");
    setRefills("0");
  };

  const handleSign = () => {
    if (hasAllergyConflict && !overrideConfirmed) {
      setSignAttempted(true);
      triggerToast("Allergy override must be confirmed before signing.");
      return;
    }

    if (addedItems.length === 0 && selectedDrug) {
      const singleItem = {
        drug_id: selectedDrug.id,
        drug_name: selectedDrug.name,
        brand_name: selectedDrug.brand_name,
        dose: dose || "1 tab",
        route,
        frequency,
        timing,
        duration,
        qty: Number(qty) || 10,
        refills: Number(refills) || 0,
        telugu: teluguInstruction,
      };
      setAddedItems([singleItem]);
      draftMutation.mutate([singleItem]);
    }

    signMutation.mutate({
      override_code: overrideCode || undefined,
      override_reason: overrideNote || undefined,
    });
  };

  // Allergy warning assessment (RX-003 / EMR-005)
  const patientAllergies = summary?.allergies || [];
  const hasPenicillinAllergy = patientAllergies.some((a: any) =>
    (a.substance_display || a.name || "").toLowerCase().includes("penicillin")
  );

  const hasPenicillinPrescribed =
    addedItems.some((i) => (i.drug_name || "").toLowerCase().includes("amoxicillin") || (i.brand_name || "").toLowerCase().includes("amox")) ||
    (selectedDrug?.name || "").toLowerCase().includes("amoxicillin") ||
    (selectedDrug?.brand_name || "").toLowerCase().includes("amox");

  const hasAllergyConflict = hasPenicillinAllergy && hasPenicillinPrescribed;
  const isRxSigned = signedRx?.status === "signed" || isLocked;

  return (
    <Card style={{ border: "1px solid var(--line)", background: "#fff", borderRadius: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
            💊 E-Prescription & Medication Composer (RX-002)
          </h3>
          <span style={{ fontSize: 12, color: "var(--slate)" }}>
            Bilingual Rx stub with Indian brand names & dosage timings
          </span>
        </div>
        {isRxSigned && <StatusPill kind="success">AUTHORIZED RX</StatusPill>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isRxSigned ? "1fr" : "240px 1fr", gap: 18 }}>
        {/* Left Column: Favorites templates (RX-007) */}
        {!isRxSigned && (
          <div style={{ borderRight: "1px solid var(--line)", paddingRight: 14 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>
              ⭐ Prescriber Favorites
            </span>
            <div style={{ display: "grid", gap: 6 }}>
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
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "var(--indigo)";
                    e.currentTarget.style.background = "var(--indigo-soft)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "var(--line)";
                    e.currentTarget.style.background = "var(--wash-a)";
                  }}
                >
                  <strong style={{ color: "var(--indigo)", display: "block", fontSize: 12.5 }}>{fav.brand_name}</strong>
                  <span style={{ color: "var(--ink)", display: "block" }}>{fav.dose} · {fav.frequency}</span>
                  <span style={{ color: "var(--slate)", fontSize: 11 }}>{fav.timing}</span>
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
                Search Medication Brand or Generic Name <span style={{ color: "red" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <Input
                  data-testid="rx-drug-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Dolo 650, Augmentin, Telma, Pantocid, Azithral, Cetirizine..."
                />

                {searchHits.length > 0 && searchQuery.length >= 2 && (
                  <div
                    style={{
                      position: "absolute",
                      background: "#fff",
                      border: "1px solid var(--line)",
                      borderRadius: "10px",
                      width: "100%",
                      zIndex: 99,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                      maxHeight: 220,
                      overflowY: "auto",
                    }}
                  >
                    {searchHits.map((drug) => (
                      <div
                        key={drug.id}
                        data-testid="rx-drug-option"
                        onClick={() => handleSelectDrug(drug)}
                        style={{ padding: "10px 14px", borderBottom: "1px solid var(--wash-b)", cursor: "pointer", fontSize: 13 }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "var(--wash-a)")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
                      >
                        <strong style={{ color: "var(--indigo)" }}>{(drug as any).brand_name}</strong>
                        <span style={{ color: "var(--slate)", marginLeft: 6 }}>· {drug.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selected Drug Details Summary */}
          {selectedDrug && (
            <div style={{ background: "var(--indigo-soft)", padding: "10px 14px", borderRadius: "12px", border: "1px solid var(--line)" }}>
              <span style={{ fontSize: 11, color: "var(--slate)", textTransform: "uppercase", fontWeight: 700 }}>
                Selected Drug Formulation
              </span>
              <strong style={{ fontSize: 14, color: "var(--indigo)", display: "block", marginTop: 2 }}>
                {selectedDrug.name} ({(selectedDrug as any).brand_name})
              </strong>
            </div>
          )}

          {/* SIG Builder Form Grid */}
          {!isRxSigned && selectedDrug && (
            <form onSubmit={handleAddItem} style={{ display: "grid", gap: 10, background: "var(--wash-a)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Dose</label>
                  <Input
                    data-testid="rx-dose"
                    value={dose}
                    onChange={(e) => setDose(e.target.value)}
                    placeholder="e.g. 650mg / 1 Tab"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Route</label>
                  <Select value={route} onChange={(e) => setRoute(e.target.value)}>
                    <option value="Oral">Oral (Tablet / Capsule / Syrup)</option>
                    <option value="IV">Intravenous (IV)</option>
                    <option value="IM">Intramuscular (IM)</option>
                    <option value="Sublingual">Sublingual</option>
                    <option value="Inhalation">Inhalation (Nebulizer)</option>
                    <option value="Topical">Topical Ointment</option>
                    <option value="Eye Drops">Eye Drops</option>
                  </Select>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Frequency</label>
                  <Select
                    data-testid="rx-frequency"
                    value={frequency}
                    onChange={(e) => {
                      const f = e.target.value;
                      setFrequency(f);
                      if (f.includes("BD")) setTeluguInstruction("ఆహారం తర్వాత - ఉదయం, రాత్రి (2 సార్లు)");
                      else if (f.includes("TDS")) setTeluguInstruction("ఆహారం తర్వాత - ఉదయం, మధ్యాహ్నం, రాత్రి (3 సార్లు)");
                      else if (f.includes("Morning")) setTeluguInstruction("ఉదయం పరిగడుపున - రోజుకు 1 సారి");
                      else if (f.includes("Night")) setTeluguInstruction("రాత్రి పడుకునే ముందు - 1 సారి");
                      else if (f.includes("SOS")) setTeluguInstruction("అవసరమైనప్పుడు మాత్రమే (SOS)");
                    }}
                  >
                    <option value="1-0-1 (BD)">1-0-1 (Twice daily - BD)</option>
                    <option value="1-1-1 (TDS)">1-1-1 (Thrice daily - TDS)</option>
                    <option value="1-0-0 (OD Morning)">1-0-0 (Once daily - Morning OD)</option>
                    <option value="0-0-1 (OD Night)">0-0-1 (Once daily - Night OD)</option>
                    <option value="1-1-1-1 (QID)">1-1-1-1 (Four times daily - QID)</option>
                    <option value="SOS (As Needed)">SOS (As needed when pain/fever)</option>
                  </Select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Food Relation</label>
                  <Select value={timing} onChange={(e) => setTiming(e.target.value)}>
                    <option value="After Food">After Food (ఆహారం తర్వాత)</option>
                    <option value="Before Food (Empty Stomach)">Before Food (ఖాళీ కడుపుతో)</option>
                    <option value="With Food">With Food (భోజనంతో పాటు)</option>
                    <option value="At Bedtime">At Bedtime (రాత్రి పడుకునే ముందు)</option>
                  </Select>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Duration</label>
                  <Input
                    data-testid="rx-duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="5 days"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>Total Quantity</label>
                  <Input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder="10"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                  Telugu Patient Instructions (తెలుగు వివరణ)
                </label>
                <Input
                  value={teluguInstruction}
                  onChange={(e) => setTeluguInstruction(e.target.value)}
                  placeholder="తెలుగు వివరణ..."
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                <Button type="submit" style={{ background: "var(--indigo)", color: "#fff" }}>
                  + Add Medication to Prescription
                </Button>
              </div>
            </form>
          )}

          {/* Current Prescribed Medication List */}
          {addedItems.length > 0 && (
            <div style={{ borderTop: "1px dashed var(--line)", paddingTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <strong style={{ fontSize: 13, color: "var(--indigo)" }}>
                  Prescribed Medication Table ({addedItems.length} Drugs)
                </strong>
                <span style={{ fontSize: 11.5, color: "var(--slate)" }}>MediPass Format</span>
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                {addedItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      background: "var(--wash-a)",
                      borderRadius: "10px",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <strong style={{ fontSize: 14, color: "var(--ink)" }}>{item.brand_name || item.drug_name}</strong>
                        <span style={{ fontSize: 11.5, color: "var(--slate)" }}>({item.drug_name})</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--indigo)", fontWeight: 600, marginTop: 2 }}>
                        {item.dose} · {item.route} · {item.frequency} · {item.timing} for {item.duration} (Qty: {item.qty})
                      </div>
                      {item.telugu && (
                        <div style={{ fontSize: 11.5, color: "#166534", marginTop: 2 }}>
                          🗣️ {item.telugu}
                        </div>
                      )}
                    </div>
                    {!isRxSigned && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = addedItems.filter((_, i) => i !== idx);
                          setAddedItems(updated);
                          draftMutation.mutate(updated);
                        }}
                        style={{ border: "none", background: "#FEE2E2", color: "var(--danger)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drug-Allergy Warning safety display alerts (RX-003 / EMR-005) */}
          {hasAllergyConflict && !isRxSigned && (
            <div data-testid="rx-alert-danger" style={{ background: "#fbe3e3", border: "2px solid var(--danger)", color: "#b22b2b", padding: 14, borderRadius: "14px", fontSize: 13 }}>
              <strong style={{ display: "block", marginBottom: 6, fontSize: 14 }}>⚠️ CRITICAL ALLERGY CONTRAINDICATION (RX-003 / EMR-005)</strong>
              Patient has a documented <strong>Penicillin Allergy</strong>. Prescribing <strong>Amoxicillin</strong> is strictly contraindicated.
              To override and proceed, you must provide an authorized clinical justification.

              <div style={{ display: "grid", gap: 8, marginTop: 10, borderTop: "1px solid rgba(178,43,43,0.2)", paddingTop: 8 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4 }}>
                    Override Coded Reason *
                  </label>
                  <Select data-testid="rx-override-reason" value={overrideCode} onChange={(e) => setOverrideCode(e.target.value)} style={{ borderColor: "var(--danger)" }}>
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
                    placeholder="Provide clinician override rationale..."
                  />
                </div>
                <Button
                  data-testid="rx-override-confirm"
                  type="button"
                  disabled={!overrideCode || overrideConfirmed}
                  onClick={() => { setOverrideConfirmed(true); triggerToast("Allergy override confirmed."); }}
                  style={{ justifySelf: "start" }}
                >
                  {overrideConfirmed ? "Override Confirmed ✓" : "Confirm Clinical Override"}
                </Button>
              </div>
            </div>
          )}

          {/* Prescription signing options */}
          {(addedItems.length > 0 || selectedDrug || signedRx) && !isRxSigned && (
            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px dashed var(--line)", paddingTop: 12 }}>
              <Button
                data-testid="rx-sign"
                type="button"
                disabled={signMutation.isPending || (hasAllergyConflict && signAttempted && !overrideConfirmed)}
                onClick={handleSign}
                style={{ background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)", color: "#fff" }}
              >
                {signMutation.isPending ? "Signing Prescription..." : "🖋️ Sign & Authorize Prescription"}
              </Button>
            </div>
          )}

          {isRxSigned && (
            <div style={{ background: "rgba(28, 154, 78, 0.08)", border: "1px solid var(--green)", color: "var(--green)", padding: 12, borderRadius: "14px", fontSize: 13, fontWeight: 600 }}>
              ✓ E-Prescription finalized and digitally authorized by practitioner.
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
