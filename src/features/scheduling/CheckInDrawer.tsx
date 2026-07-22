import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Drawer, Button, Card, StatusPill, Toast } from "../../ui/components";

interface CheckInDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
}

export default function CheckInDrawer({ isOpen, onClose, appointmentId }: CheckInDrawerProps) {
  const { token } = useAuth();
  const qc = useQueryClient();

  const [acknowledged, setAcknowledged] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Fetch Appointment Details (including prerequisites checklist)
  const { data: appt, isLoading } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: () => api.getAppointment(token, appointmentId),
    enabled: !!appointmentId && isOpen,
  });

  // Reset acknowledgment when appointment changes
  useEffect(() => {
    setAcknowledged(false);
  }, [appointmentId]);

  // Satisfy prerequisite mutation
  const satisfyMutation = useMutation({
    mutationFn: (prereqId: string) => api.satisfyPrerequisite(token, appointmentId, prereqId),
    onSuccess: () => {
      triggerToast("Prerequisite satisfied successfully!");
      qc.invalidateQueries({ queryKey: ["appointment", appointmentId] });
      qc.invalidateQueries({ queryKey: ["queue"] });
    },
    onError: () => {
      triggerToast("Failed to satisfy prerequisite.");
    },
  });

  // Check in mutation
  const checkInMutation = useMutation({
    mutationFn: () => api.checkInAppointment(token, appointmentId),
    onSuccess: () => {
      triggerToast("Patient checked in successfully!");
      qc.invalidateQueries({ queryKey: ["queue"] });
      qc.invalidateQueries({ queryKey: ["appointments"] });
      onClose();
    },
    onError: (err: any) => {
      triggerToast(err.message || "Failed to check in patient.");
    },
  });

  if (isLoading || !appt) {
    return (
      <Drawer isOpen={isOpen} onClose={onClose} title="Patient Check-In">
        <div style={{ padding: 20 }}>Loading check-in diagnostics...</div>
      </Drawer>
    );
  }

  const prereqs = appt.prerequisites || [];
  const unmetHardStops = prereqs.filter((p) => !p.satisfied && p.enforcement_type === "hard-stop");
  const unmetAdvisories = prereqs.filter((p) => !p.satisfied && p.enforcement_type === "advisory");

  const isBlocked = unmetHardStops.length > 0;
  const showWarning = unmetAdvisories.length > 0;

  // Check-in is enabled if not blocked AND (no warnings OR warning is acknowledged)
  const checkInEnabled = !isBlocked && (!showWarning || acknowledged);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Patient Check-In (REF-061)">
      <div style={{ display: "grid", gap: 18, paddingBottom: 60 }}>
        {/* Patient header card */}
        <Card style={{ background: "var(--indigo-soft)", border: "none" }}>
          <strong style={{ fontSize: 16, color: "var(--indigo)", display: "block" }}>
            {appt.patient_name}
          </strong>
          <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
            Service: {appt.service_name} · Practitioner: {appt.practitioner_name}
          </span>
        </Card>

        {/* Prerequisites Checklist */}
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, margin: "0 0 10px", color: "var(--ink)" }}>
            Clinical Prerequisites Verification Checklist
          </h3>

          {prereqs.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--slate)", fontStyle: "italic" }}>
              No prerequisites defined for this service. Ready for immediate check-in.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {prereqs.map((p) => (
                <div
                  key={p.prerequisite_id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 12,
                    borderRadius: "var(--r-field)",
                    border: "1px solid var(--line)",
                    background: p.satisfied ? "rgba(28, 154, 78, 0.05)" : "#fff",
                  }}
                >
                  <div style={{ flex: 1, marginRight: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>
                        {p.code}
                      </span>
                      <StatusPill kind={p.satisfied ? "success" : p.enforcement_type === "hard-stop" ? "danger" : "warn"}>
                        {p.satisfied ? "Satisfied" : p.enforcement_type === "hard-stop" ? "Hard-Stop" : "Advisory"}
                      </StatusPill>
                    </div>
                    <span style={{ fontSize: 12.5, color: "var(--ink)" }}>
                      {p.description}
                    </span>
                  </div>

                  {!p.satisfied && (
                    <Button
                      data-testid="prereq-resolve"
                      type="button"
                      ghost
                      style={{ fontSize: 11, padding: "4px 10px" }}
                      onClick={() => satisfyMutation.mutate(p.prerequisite_id)}
                      disabled={satisfyMutation.isPending}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hard-stop block display (REF-061) */}
        {isBlocked && (
          <div
            data-testid="checkin-blocked-panel"
            style={{
              background: "#fbe3e3",
              border: "1px solid var(--danger)",
              color: "#b22b2b",
              padding: 14,
              borderRadius: "var(--r-field)",
              fontSize: 13.5,
              fontWeight: 600,
            }}
          >
            <strong style={{ display: "block", marginBottom: 4 }}>⚠️ CHECK-IN BLOCKED (REF-061)</strong>
            Cannot proceed. The patient has unmet hard-stop clinical prerequisites ({unmetHardStops.map((h) => h.code).join(", ")}).
            Please resolve the items above to clear the check-in lock.
          </div>
        )}

        {/* Advisory warnings (REF-061) */}
        {!isBlocked && showWarning && (
          <div
            style={{
              background: "#fdeda5",
              border: "1px solid var(--orange)",
              color: "#c4620f",
              padding: 14,
              borderRadius: "var(--r-field)",
              fontSize: 13.5,
            }}
          >
            <strong style={{ display: "block", marginBottom: 4 }}>⚠️ Advisory Warnings Pending</strong>
            An advisory check ({unmetAdvisories.map((a) => a.code).join(", ")}) is not marked as completed.

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, borderTop: "1px solid rgba(196,98,15,0.2)", paddingTop: 8 }}>
              <input
                type="checkbox"
                id="ack_checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                style={{ transform: "scale(1.1)" }}
              />
              <label htmlFor="ack_checkbox" style={{ fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
                I acknowledge and verify that patient is cleared to proceed.
              </label>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <Button ghost onClick={onClose}>
            Close
          </Button>
          <Button data-testid="checkin-submit" disabled={!checkInEnabled || checkInMutation.isPending} onClick={() => checkInMutation.mutate()}>
            {checkInMutation.isPending ? "Checking in..." : "Perform Check-In"}
          </Button>
        </div>
      </div>

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </Drawer>
  );
}
