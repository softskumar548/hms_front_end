import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, AppointmentOut, QueueItemOut } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, StatusPill, Skeleton, Toast } from "../../ui/components";

export default function MyScheduleView() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const qc = useQueryClient();

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Fetch today's appointments
  const apptsQuery = useQuery({
    queryKey: ["my-schedule-appts"],
    queryFn: () => api.listAppointments(token).then((res) => res || []),
  });

  // Fetch active clinic queue
  const queueQuery = useQuery({
    queryKey: ["my-schedule-queue"],
    queryFn: () => api.getClinicQueue(token, ""),
  });

  // Status advance mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateAppointmentStatus(token, id, status),
    onSuccess: (data) => {
      triggerToast(`Appointment status updated to ${data.status}`);
      qc.invalidateQueries({ queryKey: ["my-schedule-appts"] });
      qc.invalidateQueries({ queryKey: ["my-schedule-queue"] });
    },
    onError: () => {
      triggerToast("Failed to update consultation status.");
    },
  });

  const isLoading = apptsQuery.isLoading || queueQuery.isLoading;
  const isError = apptsQuery.isError || queueQuery.isError;

  const appts: AppointmentOut[] = apptsQuery.data || [];
  const queue: QueueItemOut[] = queueQuery.data || [];

  // Filter active consult & waiting list from queue or appointments
  const activeQueueItem = queue.find((q) => q.status === "IN_CONSULTATION");
  const activeApptItem = appts.find((a) => a.status === "IN_CONSULTATION");

  const nextQueueItem = queue.find((q) => q.status === "ARRIVED");
  const nextApptItem = appts.find((a) => a.status === "ARRIVED");

  const activeConsult = activeQueueItem
    ? {
        id: activeQueueItem.appointment_id,
        patient_id: activeQueueItem.patient_id,
        patient_name: activeQueueItem.patient_name,
        service_name: activeQueueItem.service_name,
        start_time: activeQueueItem.start_time,
      }
    : activeApptItem
    ? {
        id: activeApptItem.id,
        patient_id: activeApptItem.patient_id,
        patient_name: (activeApptItem as any).patient_name || activeApptItem.patient_id,
        service_name: (activeApptItem as any).service_name || activeApptItem.service_id || "General Consult",
        start_time: activeApptItem.start_time,
      }
    : null;

  const nextWaiting = nextQueueItem
    ? {
        id: nextQueueItem.appointment_id,
        patient_id: nextQueueItem.patient_id,
        patient_name: nextQueueItem.patient_name,
        service_name: nextQueueItem.service_name,
        start_time: nextQueueItem.start_time,
      }
    : nextApptItem
    ? {
        id: nextApptItem.id,
        patient_id: nextApptItem.patient_id,
        patient_name: (nextApptItem as any).patient_name || nextApptItem.patient_id,
        service_name: (nextApptItem as any).service_name || nextApptItem.service_id || "General Consult",
        start_time: nextApptItem.start_time,
      }
    : null;

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      return new Date(isoString).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Header title block */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--indigo)", margin: 0 }}>
            {t("my_schedule_title", "My Schedule & Clinical Queue")}
          </h2>
          <span style={{ fontSize: 13, color: "var(--slate)" }}>
            {t("my_schedule_subtitle", "Today's consultations, active queue, and quick encounter sign-off.")}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button
            ghost
            style={{ fontSize: 13 }}
            onClick={() => {
              apptsQuery.refetch();
              queueQuery.refetch();
            }}
          >
            {t("refresh", "Refresh Schedule")}
          </Button>
        </div>
      </div>

      {/* States: Loading */}
      {isLoading && (
        <div style={{ display: "grid", gap: 14 }}>
          <Skeleton height={120} />
          <Skeleton height={220} />
        </div>
      )}

      {/* States: Error */}
      {isError && (
        <Card style={{ textAlign: "center", padding: 32 }}>
          <StatusPill kind="danger">{t("failed_to_load", "Failed to load schedule data")}</StatusPill>
          <div style={{ marginTop: 14 }}>
            <Button
              ghost
              onClick={() => {
                apptsQuery.refetch();
                queueQuery.refetch();
              }}
            >
              {t("retry", "Retry")}
            </Button>
          </div>
        </Card>
      )}

      {/* Active Consult / Next Patient Callout Cards */}
      {!isLoading && !isError && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* In Consultation Card */}
          <Card style={{ borderLeft: "4px solid var(--orange)", background: activeConsult ? "#FFFDF9" : "#FFF" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--orange)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Current Consultation
            </span>
            {activeConsult ? (
              <div style={{ marginTop: 8 }}>
                <strong style={{ fontSize: 18, color: "var(--ink)", display: "block" }}>
                  {activeConsult.patient_name}
                </strong>
                <span style={{ fontSize: 12.5, color: "var(--slate)", display: "block", marginTop: 2 }}>
                  {activeConsult.service_name} · Started at {formatTime(activeConsult.start_time)}
                </span>
                <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
                  <Link
                    to={`/emr/patients/${activeConsult.patient_id}/encounter/${activeConsult.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Button style={{ fontSize: 12, padding: "6px 16px" }}>Open Encounter Note</Button>
                  </Link>
                  <Button
                    ghost
                    style={{ fontSize: 12, padding: "6px 14px" }}
                    onClick={() =>
                      statusMutation.mutate({
                        id: activeConsult.id,
                        status: "COMPLETED",
                      })
                    }
                    disabled={statusMutation.isPending}
                  >
                    Complete Consult
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px 0", color: "var(--slate)", fontSize: 13 }}>
                No active consultation in progress.
              </div>
            )}
          </Card>

          {/* Next Patient Waiting Card */}
          <Card style={{ borderLeft: "4px solid var(--cyan)", background: nextWaiting ? "#F5FCFF" : "#FFF" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Next Patient Waiting
            </span>
            {nextWaiting ? (
              <div style={{ marginTop: 8 }}>
                <strong style={{ fontSize: 18, color: "var(--ink)", display: "block" }}>
                  {nextWaiting.patient_name}
                </strong>
                <span style={{ fontSize: 12.5, color: "var(--slate)", display: "block", marginTop: 2 }}>
                  {nextWaiting.service_name} · Scheduled {formatTime(nextWaiting.start_time)}
                </span>
                <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
                  <Button
                    style={{ fontSize: 12, padding: "6px 16px" }}
                    onClick={() =>
                      statusMutation.mutate({
                        id: nextWaiting.id,
                        status: "IN_CONSULTATION",
                      })
                    }
                    disabled={statusMutation.isPending}
                  >
                    Call Patient In
                  </Button>
                  <Link to={`/patients/${nextWaiting.patient_id}`} style={{ textDecoration: "none" }}>
                    <Button ghost style={{ fontSize: 12, padding: "6px 14px" }}>
                      View EMR Profile
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px 0", color: "var(--slate)", fontSize: 13 }}>
                No waiting patients in queue right now.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Full Schedule List Card */}
      {!isLoading && !isError && (
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 16px" }}>
            Today's Appointments Worklist ({appts.length})
          </h3>

          {appts.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "var(--slate)", fontSize: 14 }}>
              No appointments scheduled for today.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {appts.map((appt) => {
                const status = appt.status || "BOOKED";
                const isDone = status === "COMPLETED";
                const isConsult = status === "IN_CONSULTATION";
                const isArrived = status === "ARRIVED";
                const apptPatientName = (appt as any).patient_name || appt.patient_id;
                const apptServiceName = (appt as any).service_name || appt.service_id || "OPD Consult";

                let pillKind: "info" | "warn" | "success" | "danger" | "brand" = "brand";
                if (isArrived) pillKind = "info";
                if (isConsult) pillKind = "warn";
                if (isDone) pillKind = "success";

                return (
                  <div
                    key={appt.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 18px",
                      borderRadius: "var(--r-field)",
                      border: "1px solid var(--line)",
                      background: isConsult ? "#FFFDF9" : "#FFF",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <strong style={{ fontSize: 15, color: "var(--ink)" }}>
                          {apptPatientName}
                        </strong>
                        <span style={{ fontSize: 12, color: "var(--slate)" }}>
                          {apptServiceName}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: "var(--slate)" }}>
                        🕒 Scheduled: {formatTime(appt.start_time)}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <StatusPill kind={pillKind}>{status}</StatusPill>

                      {isArrived && (
                        <Button
                          style={{ fontSize: 12, padding: "4px 12px" }}
                          onClick={() =>
                            statusMutation.mutate({
                              id: appt.id,
                              status: "IN_CONSULTATION",
                            })
                          }
                          disabled={statusMutation.isPending}
                        >
                          Start Consult
                        </Button>
                      )}

                      {isConsult && (
                        <Link
                          to={`/emr/patients/${appt.patient_id}/encounter/${appt.id}`}
                          style={{ textDecoration: "none" }}
                        >
                          <Button style={{ fontSize: 12, padding: "4px 12px" }}>Encounter Note</Button>
                        </Link>
                      )}

                      <Link to={`/patients/${appt.patient_id}`} style={{ textDecoration: "none" }}>
                        <Button ghost style={{ fontSize: 12, padding: "4px 12px" }}>
                          EMR
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Toast alert */}
      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
