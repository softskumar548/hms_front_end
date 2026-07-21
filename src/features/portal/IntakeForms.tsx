import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Toast } from "../../ui/components";

export default function IntakeForms() {
  const { apptId } = useParams<{ apptId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Questionnaire form states
  const [heartDisease, setHeartDisease] = useState(false);
  const [bloodThinners, setBloodThinners] = useState(false);

  // Consent agreement states (UI-602 versioned consent)
  const [consentChecked, setConsentChecked] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Submit Intake mutation
  const intakeMutation = useMutation({
    mutationFn: () =>
      api.submitIntakeForms(token, apptId || "", {
        heart_disease: heartDisease,
        blood_thinners: bloodThinners,
        consent_version: "v2.0-cashless",
        consent_signed: consentChecked,
      }),
    onSuccess: () => {
      triggerToast("Intake questionnaire & cashless consent submitted.");
      qc.invalidateQueries({ queryKey: ["portalVisits"] });
      // Redirect back to portal dashboard after a brief delay
      setTimeout(() => {
        navigate("/portal");
      }, 1500);
    },
    onError: () => {
      triggerToast("Failed to submit intake questionnaire.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) {
      triggerToast("You must sign the cashless consent pre-authorisation terms before submitting.");
      return;
    }
    intakeMutation.mutate();
  };

  return (
    <div style={{ display: "grid", justifyContent: "center", padding: "10px 0" }}>
      {/* Smartphone frame container capped at 380px */}
      <div
        style={{
          width: 380,
          height: 680,
          background: "var(--wash-a)",
          border: "12px solid #23263B",
          borderRadius: "40px",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 22px 60px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--font-body)",
        }}
      >
        {/* Header */}
        <div style={{ background: "var(--indigo)", padding: "12px 16px 8px", color: "#fff", display: "flex", gap: 10, alignItems: "center", fontSize: 13 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}
          >
            ←
          </button>
          <strong>Pre-Visit Intake & Consent</strong>
        </div>

        {/* Scrollable forms content */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: "16px 14px 20px", display: "grid", gap: 16 }}>
          
          {/* Card 1: Clinical questionnaire */}
          <Card style={{ padding: 14 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--indigo)", margin: "0 0 10px" }}>
              Medical History Questionnaire
            </h3>
            
            <div style={{ display: "grid", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, cursor: "pointer", minHeight: 44 }}>
                <input
                  type="checkbox"
                  checked={heartDisease}
                  onChange={(e) => setHeartDisease(e.target.checked)}
                  style={{ width: 20, height: 20 }}
                />
                Do you have a history of cardiovascular / heart disease? (గుండె జబ్బు చరిత్ర ఉందా?)
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, cursor: "pointer", minHeight: 44 }}>
                <input
                  type="checkbox"
                  checked={bloodThinners}
                  onChange={(e) => setBloodThinners(e.target.checked)}
                  style={{ width: 20, height: 20 }}
                />
                Are you currently taking prescription blood thinners? (రక్తం పలచబడే మందులు వాడుతున్నారా?)
              </label>
            </div>
          </Card>

          {/* Card 2: Versioned pre-auth consent agreement */}
          <Card style={{ padding: 14 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--indigo)", margin: "0 0 10px" }}>
              Aarogyasri Cashless Consent (v2.0)
            </h3>
            
            <p style={{ fontSize: 12, color: "var(--slate)", margin: "0 0 12px", lineHeight: 1.5 }}>
              I hereby authorize Apollo Hospital Visakhapatnam to verify, capture, and claim cashless coverage benefits under the Dr. NTR Aarogyasri Trust Scheme for today's diagnostic orders (including CT scans and consult fees).
              <br />
              <span style={{ fontSize: 11, fontStyle: "italic", marginTop: 4, display: "block" }}>
                Dr. NTR ఆరోగ్యశ్రీ ట్రస్ట్ పథకం కింద నగదు రహిత కవరేజ్ ప్రయోజనాలను ధృవీకరించడానికి నేను అంగీకరిస్తున్నాను.
              </span>
            </p>

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, cursor: "pointer", minHeight: 44 }}>
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                style={{ width: 20, height: 20, marginTop: 2 }}
                required
              />
              <span>
                I agree to the versioned cashless authorization consent terms. (నేను ఈ నిబంధనలకు అంగీకరిస్తున్నాను)
              </span>
            </label>
          </Card>

          {/* Action button */}
          <Button
            type="submit"
            disabled={intakeMutation.isPending}
            style={{ height: 44, width: "100%", fontSize: 14, marginTop: 10 }}
          >
            {intakeMutation.isPending ? "Submitting Forms..." : "Submit Forms & Consents"}
          </Button>

        </form>
      </div>

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
