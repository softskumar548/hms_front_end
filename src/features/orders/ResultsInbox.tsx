import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, StatusPill, Toast, Skeleton } from "../../ui/components";

export default function ResultsInbox() {
  const { token } = useAuth();
  const qc = useQueryClient();

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Selected analyte details for cumulative trends panel
  const [selectedResult, setSelectedResult] = useState<any>(null);

  // Fetch Clinician Results Inbox (UI-502)
  const { data: inbox = [], isLoading } = useQuery({
    queryKey: ["resultsInbox"],
    queryFn: () => api.listClinicianInbox(token),
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Acknowledge Result Mutation
  const ackMutation = useMutation({
    mutationFn: (resultId: string) => api.acknowledgeResult(token, resultId),
    onSuccess: () => {
      triggerToast("Result acknowledged successfully.");
      qc.invalidateQueries({ queryKey: ["resultsInbox"] });
      // Refresh current open detail
      if (selectedResult) {
        const updated = inbox.find((r) => r.id === selectedResult.id);
        if (updated) {
          setSelectedResult({ ...updated, status: "acknowledged" });
        }
      }
    },
    onError: () => {
      triggerToast("Failed to acknowledge result.");
    },
  });

  // Check if result has expired 30-min escalation window
  const isEscalated = (res: any) => {
    if (res.status === "acknowledged" || res.clinical_flag !== "critical") return false;
    const minutesElapsed = (Date.now() - new Date(res.created_at).getTime()) / (1000 * 60);
    return minutesElapsed > 30; // Escalates after 30 mins
  };

  // Sort inbox: Critical ➔ Abnormal ➔ Normal
  const sortedInbox = [...inbox].sort((a, b) => {
    const priorityMap: Record<string, number> = { critical: 3, abnormal: 2, normal: 1 };
    const aPriority = priorityMap[a.clinical_flag] || 0;
    const bPriority = priorityMap[b.clinical_flag] || 0;
    return bPriority - aPriority;
  });

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--indigo)", margin: 0 }}>
          Clinician Diagnostic Results Review Inbox
        </h2>
        <span style={{ fontSize: 13, color: "var(--slate)" }}>
          Acknowledge and evaluate patient lab and imaging outcomes. Critical alerts escalate after 30 minutes.
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1.4fr", gap: 20, alignItems: "start" }}>
        {/* Left Side: Inbox List */}
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
            Inbox Items
          </h3>

          {isLoading ? (
            <Skeleton height={200} />
          ) : sortedInbox.length === 0 ? (
            <p style={{ fontStyle: "italic", color: "var(--slate)", padding: "20px 0", textAlign: "center" }}>
              Inbox clean. No results pending review.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {sortedInbox.map((res: any) => {
                const escalated = isEscalated(res);
                const isSelected = selectedResult?.id === res.id;
                
                return (
                  <div
                    key={res.id}
                    onClick={() => setSelectedResult(res)}
                    style={{
                      padding: "14px 18px",
                      borderRadius: "14px",
                      border: isSelected ? "2px solid var(--indigo)" : "1px solid var(--line)",
                      background: escalated ? "#fdf2f2" : isSelected ? "var(--wash-a)" : "#fff",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.2s",
                      animation: escalated ? "pulse-escalation 2s infinite" : "none",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <strong style={{ fontSize: 14.5, color: "var(--ink)" }}>{res.patient_name}</strong>
                        {escalated && (
                          <span style={{
                            background: "var(--danger)",
                            color: "#fff",
                            fontSize: 10,
                            padding: "2px 6px",
                            borderRadius: "var(--r-pill)",
                            fontWeight: 800,
                          }}>
                            🚨 ESCALATED (&gt;30m UNACKED)
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 13, color: "var(--slate)", display: "block", marginTop: 2 }}>
                        {res.analyte_name} : <strong style={{ color: res.clinical_flag === "critical" ? "var(--danger)" : "var(--ink)" }}>{res.value} {res.unit}</strong> (Ref: {res.reference_range})
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <StatusPill kind={res.clinical_flag === "critical" ? "danger" : res.clinical_flag === "abnormal" ? "warn" : "success"}>
                        {res.clinical_flag.toUpperCase()}
                      </StatusPill>
                      {res.status === "unacknowledged" ? (
                        <Button
                          type="button"
                          style={{ fontSize: 12, padding: "4px 12px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            ackMutation.mutate(res.id);
                          }}
                        >
                          Ack
                        </Button>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 700 }}>✓ Acked</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Right Side: Cumulative Trends Panel */}
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
            Cumulative Analytes Trends
          </h3>

          {!selectedResult ? (
            <p style={{ fontStyle: "italic", color: "var(--slate)", fontSize: 13.5, textAlign: "center", padding: "40px 0" }}>
              Select a result item from the inbox to display historical trend tables and cumulative sparkline charts.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: 16, color: "var(--indigo)", fontFamily: "var(--font-display)" }}>
                  {selectedResult.analyte_name} History
                </h4>
                <span style={{ fontSize: 12, color: "var(--slate)" }}>
                  Patient: {selectedResult.patient_name}
                </span>
              </div>

              {/* Sparkline chart trend indicator */}
              <div style={{ background: "var(--wash-a)", padding: 14, borderRadius: "14px", border: "1px solid var(--line)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 10 }}>
                  Cumulative Trend Graph (cumulative values)
                </span>
                
                {/* SVG trend chart representation */}
                <div style={{ height: 100, display: "flex", alignItems: "flex-end", borderLeft: "2px solid var(--line)", borderBottom: "2px solid var(--line)", paddingLeft: 10, paddingBottom: 6 }}>
                  <svg width="100%" height="80" viewBox="0 0 200 80" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="var(--indigo)"
                      strokeWidth="3"
                      points="20,60 100,50 180,10"
                    />
                    <circle cx="20" cy="60" r="4" fill="var(--indigo)" />
                    <circle cx="100" cy="50" r="4" fill="var(--indigo)" />
                    <circle cx="180" cy="10" r="4" fill="var(--danger)" />
                  </svg>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--slate)", marginTop: 6 }}>
                  <span>01 Jul 2026</span>
                  <span>10 Jul 2026</span>
                  <span>21 Jul 2026</span>
                </div>
              </div>

              {/* Values comparisons table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--wash-b)" }}>
                    <th style={{ textAlign: "left", padding: 8 }}>Date</th>
                    <th style={{ textAlign: "right", padding: 8 }}>Value Result ({selectedResult.unit})</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedResult.history?.map((h: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: 8 }}>{h.date}</td>
                      <td style={{ padding: 8, textAlign: "right", fontWeight: 700, color: h.value > 1.0 ? "var(--danger)" : "var(--ink)" }}>
                        {h.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selectedResult.status === "unacknowledged" && (
                <Button
                  onClick={() => ackMutation.mutate(selectedResult.id)}
                  style={{ width: "100%", marginTop: 8 }}
                >
                  ✓ Sign-Off & Acknowledge Result
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Local keyframes for critical alarm flash */}
      <style>{`
        @keyframes pulse-escalation {
          0% { border-color: var(--line); }
          50% { border-color: var(--danger); box-shadow: 0 0 10px rgba(217, 58, 58, 0.4); }
          100% { border-color: var(--line); }
        }
      `}</style>

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
