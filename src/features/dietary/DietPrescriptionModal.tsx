import React, { useState } from "react";
import { Modal, Button, Input, Select } from "../../ui/components";

interface DietPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: any;
  onSuccess: (newDiet: any) => void;
}

export default function DietPrescriptionModal({
  isOpen,
  onClose,
  patient,
  onSuccess,
}: DietPrescriptionModalProps) {
  const [patientName, setPatientName] = useState(patient?.patientName || "K. Venkateswara Rao");
  const [patientUhid, setPatientUhid] = useState(patient?.patientUhid || "UHID-2026-90841");
  const [bedLocation, setBedLocation] = useState(patient?.bedLocation || "Bed 204 (Floor 2 - Post-Op Ward)");
  const [dietCategory, setDietCategory] = useState("DIABETIC");
  const [calories, setCalories] = useState("1800");
  const [protein, setProtein] = useState("65");
  const [fluidLimit, setFluidLimit] = useState("1500");
  const [feedingRoute, setFeedingRoute] = useState("ORAL_NORMAL");
  const [foodType, setFoodType] = useState("VEG");
  const [allergies, setAllergies] = useState("No Simple Sugar · Low Salt");
  const [instructionsTe, setInstructionsTe] = useState("చక్కెర పూర్తిగా నిషిద్ధం, ఉప్పు తక్కువగా తీసుకోవాలి");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dietPrescription = {
      id: `diet-${Date.now()}`,
      patientName,
      patientUhid,
      bedLocation,
      dietCategory,
      macros: {
        calories: parseInt(calories) || 1800,
        protein: parseInt(protein) || 65,
        fluidLimit: parseInt(fluidLimit) || 1500,
      },
      feedingRoute,
      foodType,
      allergies,
      instructionsTe,
      prescribedDate: new Date().toLocaleDateString("en-IN"),
      status: "ACTIVE",
      breakfast: "DELIVERED",
      lunch: "DISPATCHING",
      snacks: "PENDING",
      dinner: "PENDING",
    };

    onSuccess(dietPrescription);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Prescribe Inpatient Therapeutic Diet (NUT-001)">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, maxWidth: 580, minWidth: 460, fontFamily: "var(--font-body)", color: "var(--ink)" }}>
        
        {/* Patient & Bed Details */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Patient Full Name
            </label>
            <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              UHID Number
            </label>
            <Input value={patientUhid} onChange={(e) => setPatientUhid(e.target.value)} required />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
            Assigned Bed & Hospital Floor
          </label>
          <Select value={bedLocation} onChange={(e) => setBedLocation(e.target.value)}>
            <option value="Bed 102 (Floor 1 - Daycare Ward)">🛏️ Bed 102 (Floor 1 - Daycare Surgical)</option>
            <option value="Bed 204 (Floor 2 - Ortho Post-Op)">🛏️ Bed 204 (Floor 2 - Ortho Post-Op Ward)</option>
            <option value="Bed 308 (Floor 3 - Semi-Private)">🛏️ Bed 308 (Floor 3 - Surgical Semi-Private)</option>
            <option value="Bed 401 (Floor 4 - ICU Bed 01)">🛏️ Bed 401 (Floor 4 - Critical Care ICU-01)</option>
          </Select>
        </div>

        {/* Therapeutic Diet Plan Category */}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Therapeutic Clinical Diet Category
            </label>
            <Select value={dietCategory} onChange={(e) => setDietCategory(e.target.value)}>
              <option value="DIABETIC">🟡 Diabetic Diet (Low GI · 1800 kcal)</option>
              <option value="RENAL_LOW_SALT">🔵 Renal Low Sodium & Low Potassium</option>
              <option value="CARDIAC_DASH">❤️ Cardiac DASH (Low Fat · Low Salt)</option>
              <option value="ENTERAL_RYLES_TUBE">🟣 Enteral Ryle's Tube (2-Hourly Liquid)</option>
              <option value="SOFT_POST_OP">🟠 Soft Gastro / Post-Op Khichdi</option>
              <option value="HIGH_PROTEIN_SURGICAL">🟢 High Protein Surgical Recovery (85g)</option>
              <option value="REGULAR_BALANCED">🥗 Standard Balanced Inpatient Diet</option>
            </Select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Dietary Preference
            </label>
            <Select value={foodType} onChange={(e) => setFoodType(e.target.value)}>
              <option value="VEG">🌱 Pure Vegetarian</option>
              <option value="NON_VEG">🍗 Non-Vegetarian (Boiled Egg/Chicken)</option>
              <option value="EGGITARIAN">🥚 Eggitarian</option>
              <option value="JAIN_VEG">🌿 Jain Vegetarian (No Root Veg)</option>
            </Select>
          </div>
        </div>

        {/* Macros: Calories, Protein, Fluid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, background: "var(--wash-a)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
          <div>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Target Calories (kcal)
            </label>
            <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Target Protein (g)
            </label>
            <Input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} required />
          </div>

          <div>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Fluid Limit (mL/day)
            </label>
            <Input type="number" value={fluidLimit} onChange={(e) => setFluidLimit(e.target.value)} required />
          </div>
        </div>

        {/* Feeding Route & Allergies */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Feeding Route
            </label>
            <Select value={feedingRoute} onChange={(e) => setFeedingRoute(e.target.value)}>
              <option value="ORAL_NORMAL">🍽️ Oral Normal Solid Feed</option>
              <option value="ORAL_SOFT">🥣 Oral Soft / Semi-Solid Puree</option>
              <option value="ENTERAL_RYLES_TUBE">🧪 Enteral Ryle's Tube / NG Feed</option>
              <option value="TPN_PARENTERAL">💉 TPN Total Parenteral IV</option>
            </Select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Allergies & Exclusions
            </label>
            <Input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g. No dairy, No egg" />
          </div>
        </div>

        {/* Telugu Patient Instructions */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
            Bilingual Telugu Patient Instructions (తెలుగు డైట్ సూచనలు):
          </label>
          <Input value={instructionsTe} onChange={(e) => setInstructionsTe(e.target.value)} />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
          <Button ghost type="button" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            style={{ background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)", color: "#fff", fontWeight: 800 }}
          >
            🥗 Save & Dispatch to Kitchen
          </Button>
        </div>
      </form>
    </Modal>
  );
}
