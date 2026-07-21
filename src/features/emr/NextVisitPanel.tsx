import React, { useState } from "react";
import { Card, Button, StatusPill, Chip, Toast } from "../../ui/components";

// Pre-defined pre-visit prerequisites from library (EMR-013)
const prereqsLibrary = [
  { code: "FASTING", label: "Fasting for 12 hours before test (12 గంటలు ఖాళీ కడుపుతో ఉండాలి)", type: "hard-stop" },
  { code: "SCAN_PREVIOUS", label: "Bring previous report scans (మునుపటి నివేదిక తీసుకురండి)", type: "advisory" },
  { code: "DUES_CLEAR", label: "Clear billing dues before check-in (బిల్లు బకాయిలను క్లియర్ చేయండి)", type: "advisory" }
];

interface NextVisitPanelProps {
  encounterId: string;
  patientId: string;
  isLocked: boolean;
}

export default function NextVisitPanel({ encounterId, patientId, isLocked }: NextVisitPanelProps) {
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Interval selections
  const [selectedInterval, setSelectedInterval] = useState("2w"); // 1w, 2w, 1m, custom
  const [customDate, setCustomDate] = useState("");
  
  // Selected prerequisites list
  const [selectedPrereqs, setSelectedPrereqs] = useState<string[]>([]);
  const [savedFollowUp, setSavedFollowUp] = useState<any>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handlePrereqToggle = (code: string) => {
    if (selectedPrereqs.includes(code)) {
      setSelectedPrereqs(selectedPrereqs.filter((c) => c !== code));
    } else {
      setSelectedPrereqs([...selectedPrereqs, code]);
    }
  };

  const handleSaveFollowUp = () => {
    let targetDate = "";
    const today = new Date();
    
    if (selectedInterval === "1w") {
      today.setDate(today.getDate() + 7);
      targetDate = today.toISOString().split("T")[0];
    } else if (selectedInterval === "2w") {
      today.setDate(today.getDate() + 14);
      targetDate = today.toISOString().split("T")[0];
    } else if (selectedInterval === "1m") {
      today.setMonth(today.getMonth() + 1);
      targetDate = today.toISOString().split("T")[0];
    } else {
      if (!customDate) {
        triggerToast("Please specify a custom date.");
        return;
      }
      targetDate = customDate;
    }

    const followUpData = {
      interval: selectedInterval,
      follow_up_date: targetDate,
      specialty: "Cardiology",
      prerequisites: selectedPrereqs,
    };

    setSavedFollowUp(followUpData);
    
    // In production/MSW sign workflow, we attach this metadata to the prescription sign payload.
    // For demo convenience, we cache it here and pass it during signing.
    (window as any)._pendingFollowUp = followUpData;

    triggerToast("Next visit follow-up instructions staged.");
  };

  const isConfigLocked = isLocked || !!savedFollowUp;

  return (
    <Card style={{ border: "1px solid var(--line)", background: "#fff" }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
        Next-Visit Follow-Up Panel (EMR-013 / Flag F1)
      </h3>

      <div style={{ display: "grid", gap: 16 }}>
        {/* Interval selections */}
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 8 }}>
            Suggested Follow-Up Interval
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Chip
              active={selectedInterval === "1w"}
              onClick={() => !isConfigLocked && setSelectedInterval("1w")}
            >
              1 Week
            </Chip>
            <Chip
              active={selectedInterval === "2w"}
              onClick={() => !isConfigLocked && setSelectedInterval("2w")}
            >
              2 Weeks
            </Chip>
            <Chip
              active={selectedInterval === "1m"}
              onClick={() => !isConfigLocked && setSelectedInterval("1m")}
            >
              1 Month
            </Chip>
            <Chip
              active={selectedInterval === "custom"}
              onClick={() => !isConfigLocked && setSelectedInterval("custom")}
            >
              Custom Date
            </Chip>

            {selectedInterval === "custom" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                disabled={isConfigLocked}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r-field)",
                  padding: "4px 8px",
                  fontSize: 13,
                  marginLeft: 10,
                }}
              />
            )}
          </div>
        </div>

        {/* Prerequisites selection Checklist */}
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 8 }}>
            Prerequisites Checklist for Next Visit (REF-060)
          </span>
          <div style={{ display: "grid", gap: 8 }}>
            {prereqsLibrary.map((p) => {
              const active = selectedPrereqs.includes(p.code);
              return (
                <div
                  key={p.code}
                  onClick={() => !isConfigLocked && handlePrereqToggle(p.code)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "var(--r-field)",
                    border: active ? "1px solid var(--indigo)" : "1px solid var(--line)",
                    background: active ? "var(--wash-a)" : "#fff",
                    cursor: isConfigLocked ? "default" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: active ? 700 : 400 }}>
                    {p.label}
                  </span>
                  <StatusPill kind={p.type === "hard-stop" ? "danger" : "warn"}>
                    {p.type === "hard-stop" ? "Hard-Stop" : "Advisory"}
                  </StatusPill>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action saves buttons */}
        {!isConfigLocked && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <Button type="button" onClick={handleSaveFollowUp}>
              Staged Follow-up
            </Button>
          </div>
        )}

        {isConfigLocked && (
          <div style={{ background: "rgba(19, 26, 143, 0.05)", border: "1px solid var(--indigo)", color: "var(--indigo)", padding: 12, borderRadius: "14px", fontSize: 13, fontWeight: 600 }}>
            ✓ Follow-up scheduled for{" "}
            {savedFollowUp
              ? new Date(savedFollowUp.follow_up_date).toLocaleDateString("en-IN", { dateStyle: "long" })
              : "Next Scheduled Consultation"}{" "}
            with prerequisites ({selectedPrereqs.join(", ") || "None"}).
          </div>
        )}
      </div>

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </Card>
  );
}
