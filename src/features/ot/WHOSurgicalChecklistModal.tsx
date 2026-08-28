import React, { useState } from "react";
import { Modal, Button } from "../../ui/components";

interface WHOSurgicalChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  surgery: any;
  onSuccess: (updatedSurgery: any) => void;
}

export default function WHOSurgicalChecklistModal({
  isOpen,
  onClose,
  surgery,
  onSuccess,
}: WHOSurgicalChecklistModalProps) {
  // Stage 1: SIGN IN (Before Induction)
  const [signInSiteMarked, setSignInSiteMarked] = useState(true);
  const [signInAnesthesiaChecked, setSignInAnesthesiaChecked] = useState(true);
  const [signInPulseOx, setSignInPulseOx] = useState(true);
  const [signInAllergyRisk, setSignInAllergyRisk] = useState("NO");
  const [signInAirwayRisk, setSignInAirwayRisk] = useState("NO");
  const [signInBloodLossRisk, setSignInBloodLossRisk] = useState("YES_PLANNED");

  // Stage 2: TIME OUT (Before Incision)
  const [timeOutTeamIntro, setTimeOutTeamIntro] = useState(true);
  const [timeOutConfirmIdentity, setTimeOutConfirmIdentity] = useState(true);
  const [timeOutAntibioticsGiven, setTimeOutAntibioticsGiven] = useState(true);
  const [timeOutImagingDisplayed, setTimeOutImagingDisplayed] = useState(true);
  const [timeOutSterilityVerified, setTimeOutSterilityVerified] = useState(true);

  // Stage 3: SIGN OUT (Before Leaving OT)
  const [signOutProcedureName, setSignOutProcedureName] = useState(true);
  const [signOutCountCorrect, setSignOutCountCorrect] = useState(true);
  const [signOutSpecimenLabeled, setSignOutSpecimenLabeled] = useState(true);
  const [signOutEquipmentClean, setSignOutEquipmentClean] = useState(true);
  const [signOutPacuConcerns, setSignOutPacuConcerns] = useState(true);

  if (!isOpen || !surgery) return null;

  const handleComplete = () => {
    onSuccess({
      ...surgery,
      whoChecklistDone: true,
      status: "PACU_RECOVERY",
      whoCertifiedAt: new Date().toLocaleTimeString("en-IN", { timeStyle: "short" }),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="WHO Surgical Safety Checklist Verification (WHO-001)">
      <div style={{ display: "grid", gap: 14, maxWidth: 760, minWidth: 600, fontFamily: "var(--font-body)", color: "var(--ink)", maxHeight: "78vh", overflowY: "auto", paddingRight: 4 }}>
        
        {/* Header Summary */}
        <div style={{ background: "var(--wash-a)", border: "1.5px solid var(--indigo)", padding: "10px 14px", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong style={{ fontSize: 14, color: "var(--indigo)" }}>
              {surgery.patientName} ({surgery.patientUhid})
            </strong>
            <span style={{ fontSize: 12, color: "var(--slate)", display: "block" }}>
              Procedure: <strong>{surgery.procedure}</strong> · Theatre: <strong>{surgery.theatre.split(" ")[0]}</strong>
            </span>
          </div>
          <div style={{ textAlign: "right", fontSize: 12 }}>
            <span style={{ color: "var(--slate)" }}>Surgeon:</span> <strong>{surgery.team.leadSurgeon.split("(")[0]}</strong>
          </div>
        </div>

        {/* 3-Stage Columns Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          
          {/* STAGE 1: SIGN IN */}
          <div style={{ background: "#EFF6FF", border: "1.5px solid #3B82F6", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, borderBottom: "1px solid #BFDBFE", paddingBottom: 6 }}>
              <span style={{ background: "#3B82F6", color: "#fff", fontSize: 10, fontWeight: 900, padding: "2px 6px", borderRadius: 4 }}>
                STAGE 1
              </span>
              <strong style={{ fontSize: 12, color: "#1E40AF", textTransform: "uppercase" }}>
                SIGN IN (Pre-Induction)
              </strong>
            </div>

            <div style={{ display: "grid", gap: 8, fontSize: 11.5, color: "#1E3A8A" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={signInSiteMarked} onChange={(e) => setSignInSiteMarked(e.target.checked)} style={{ marginTop: 2 }} />
                <span>Patient ID, site confirmed & marked</span>
              </label>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={signInAnesthesiaChecked} onChange={(e) => setSignInAnesthesiaChecked(e.target.checked)} style={{ marginTop: 2 }} />
                <span>Anesthesia safety check complete</span>
              </label>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={signInPulseOx} onChange={(e) => setSignInPulseOx(e.target.checked)} style={{ marginTop: 2 }} />
                <span>Pulse oximeter on & functioning</span>
              </label>

              <div style={{ background: "#fff", padding: 6, borderRadius: 6, border: "1px solid #BFDBFE", fontSize: 11 }}>
                <span style={{ fontWeight: 700, display: "block" }}>Known Allergy:</span>
                <span style={{ color: "#166534", fontWeight: 700 }}>✓ None / Documented</span>
              </div>

              <div style={{ background: "#fff", padding: 6, borderRadius: 6, border: "1px solid #BFDBFE", fontSize: 11 }}>
                <span style={{ fontWeight: 700, display: "block" }}>Difficult Airway Risk:</span>
                <span style={{ color: "#166534", fontWeight: 700 }}>✓ Equipment / Video Laryngoscope ready</span>
              </div>

              <div style={{ background: "#fff", padding: 6, borderRadius: 6, border: "1px solid #BFDBFE", fontSize: 11 }}>
                <span style={{ fontWeight: 700, display: "block" }}>Risk of &gt; 500mL Blood Loss:</span>
                <span style={{ color: "#1D4ED8", fontWeight: 700 }}>✓ 2 Large Bore IV lines + PRBC</span>
              </div>
            </div>
          </div>

          {/* STAGE 2: TIME OUT */}
          <div style={{ background: "#FEFCE8", border: "1.5px solid #EAB308", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, borderBottom: "1px solid #FEF08A", paddingBottom: 6 }}>
              <span style={{ background: "#D97706", color: "#fff", fontSize: 10, fontWeight: 900, padding: "2px 6px", borderRadius: 4 }}>
                STAGE 2
              </span>
              <strong style={{ fontSize: 12, color: "#854D0E", textTransform: "uppercase" }}>
                TIME OUT (Pre-Incision)
              </strong>
            </div>

            <div style={{ display: "grid", gap: 8, fontSize: 11.5, color: "#713F12" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={timeOutTeamIntro} onChange={(e) => setTimeOutTeamIntro(e.target.checked)} style={{ marginTop: 2 }} />
                <span>All team members introduced by name</span>
              </label>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={timeOutConfirmIdentity} onChange={(e) => setTimeOutConfirmIdentity(e.target.checked)} style={{ marginTop: 2 }} />
                <span>Surgeon & Anesthetist confirm site & procedure</span>
              </label>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={timeOutAntibioticsGiven} onChange={(e) => setTimeOutAntibioticsGiven(e.target.checked)} style={{ marginTop: 2 }} />
                <span>Antibiotic prophylaxis given &lt; 60 mins</span>
              </label>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={timeOutSterilityVerified} onChange={(e) => setTimeOutSterilityVerified(e.target.checked)} style={{ marginTop: 2 }} />
                <span>Sterility indicators & autoclave verified</span>
              </label>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={timeOutImagingDisplayed} onChange={(e) => setTimeOutImagingDisplayed(e.target.checked)} style={{ marginTop: 2 }} />
                <span>Essential MRI/CT/X-Ray displayed on OT screen</span>
              </label>
            </div>
          </div>

          {/* STAGE 3: SIGN OUT */}
          <div style={{ background: "#F0FDF4", border: "1.5px solid #22C55E", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, borderBottom: "1px solid #BBF7D0", paddingBottom: 6 }}>
              <span style={{ background: "#16A34A", color: "#fff", fontSize: 10, fontWeight: 900, padding: "2px 6px", borderRadius: 4 }}>
                STAGE 3
              </span>
              <strong style={{ fontSize: 12, color: "#166534", textTransform: "uppercase" }}>
                SIGN OUT (Pre-Exit)
              </strong>
            </div>

            <div style={{ display: "grid", gap: 8, fontSize: 11.5, color: "#14532D" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={signOutProcedureName} onChange={(e) => setSignOutProcedureName(e.target.checked)} style={{ marginTop: 2 }} />
                <span>Procedure name accurately recorded</span>
              </label>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={signOutCountCorrect} onChange={(e) => setSignOutCountCorrect(e.target.checked)} style={{ marginTop: 2 }} />
                <span>Instrument, sponge & needle count 100% CORRECT</span>
              </label>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={signOutSpecimenLabeled} onChange={(e) => setSignOutSpecimenLabeled(e.target.checked)} style={{ marginTop: 2 }} />
                <span>Biopsy specimen labeled with patient UHID</span>
              </label>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={signOutEquipmentClean} onChange={(e) => setSignOutEquipmentClean(e.target.checked)} style={{ marginTop: 2 }} />
                <span>No equipment malfunction reported</span>
              </label>

              <label style={{ display: "flex", alignItems: "flex-start", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={signOutPacuConcerns} onChange={(e) => setSignOutPacuConcerns(e.target.checked)} style={{ marginTop: 2 }} />
                <span>Key PACU recovery plan handed over</span>
              </label>
            </div>
          </div>

        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8, borderTop: "1px solid var(--line)", paddingTop: 10 }}>
          <Button ghost type="button" onClick={onClose}>Cancel</Button>
          <Button
            type="button"
            onClick={handleComplete}
            style={{ background: "#16A34A", color: "#fff", fontWeight: 800 }}
          >
            ✓ Certify WHO Safety Compliance & Shift to PACU
          </Button>
        </div>
      </div>
    </Modal>
  );
}
