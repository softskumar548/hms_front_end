import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, StatusPill, Select, Skeleton, Toast } from "../../ui/components";
import CheckInDrawer from "./CheckInDrawer";

export default function QueueBoard() {
  const { token, tenant, role } = useAuth();
  const qc = useQueryClient();

  const [selectedRoom, setSelectedRoom] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Check-In drawer open trigger state
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [activeCheckInId, setActiveCheckInId] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Fetch configured rooms dynamically from backend
  const { data: dbRooms = [] } = useQuery({
    queryKey: ["rooms", tenant],
    queryFn: () => (token ? api.listRooms(token) : Promise.resolve([])),
  });

  // Read master config rooms and staff chambers
  const configData = (() => {
    try {
      const saved = localStorage.getItem(`hms-config-data-${tenant || "default"}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  })();
  const masterRooms: any[] = configData["room_type"] || [];

  const staffList: any[] = (() => {
    try {
      const saved = localStorage.getItem(`hms-staff-roster-${tenant || "default"}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();
  const staffChambers = staffList
    .filter((s) => s.chamberRoom && s.chamberRoom.trim() && s.chamberRoom !== "General Counter")
    .map((s) => ({ id: s.chamberRoom, name: `${s.chamberRoom} (${s.name})` }));

  // Combined unique list of consultation rooms
  const combinedRooms = [
    ...dbRooms.map((r: any) => ({ id: r.id, name: r.name })),
    ...masterRooms.map((r: any) => ({ id: r.id || r.name, name: r.name })),
    ...staffChambers,
  ].filter((v, idx, arr) => arr.findIndex((t) => t.id === v.id || t.name === v.name) === idx);

  // Fetch active queue items
  const { data: queue = [], isLoading: loadingQueue, refetch: refetchQueue } = useQuery({
    queryKey: ["queue", selectedRoom],
    queryFn: () => api.getClinicQueue(token, selectedRoom),
  });

  // Fetch all appointments to render check-in lists
  const { data: allAppointments = [], isLoading: loadingAppts, refetch: refetchAppts } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => api.listAppointments(token).then((appts) => appts || []),
  });

  // Status transition mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateAppointmentStatus(token, id, status),
    onSuccess: (data) => {
      triggerToast(`Status advanced to ${data.status}`);
      qc.invalidateQueries({ queryKey: ["queue"] });
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: () => {
      triggerToast("Failed to advance queue status.");
    },
  });

  const handleOpenCheckIn = (apptId: string) => {
    setActiveCheckInId(apptId);
    setCheckInOpen(true);
  };

  // Calculate simulated wait times in minutes
  const getWaitTimeText = (startTimeStr: string) => {
    try {
      const startTime = new Date(startTimeStr).getTime();
      const diffMs = Date.now() - startTime;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins <= 0) return "Just arrived";
      return `${diffMins} min wait`;
    } catch (e) {
      return "0 min wait";
    }
  };

  const pendingCheckIns = allAppointments.filter((a: any) => a.status === "BOOKED" || a.status === "PENDING");

  const sortedQueue = [...queue].sort((a, b) => {
    if (a.status === "ARRIVED" && b.status !== "ARRIVED") return -1;
    if (a.status !== "ARRIVED" && b.status === "ARRIVED") return 1;
    return 0;
  });

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Clinic queue board workspace (UI-304) */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 4px", color: "var(--indigo)" }}>
              OPD Outpatient Queue Management Board
            </h2>
            <span style={{ fontSize: 13, color: "var(--slate)" }}>
              Manage check-ins, call next tokens, and launch the Waiting Lounge TV display.
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link to="/queue/display" target="_blank" style={{ textDecoration: "none" }}>
              <button
                type="button"
                style={{
                  background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "var(--r-field)",
                  padding: "9px 16px",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "var(--shadow-card)",
                }}
              >
                🖥️ Launch Waiting Lounge TV Display ↗
              </button>
            </Link>

            <Select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
              <option value="">-- All consultation rooms --</option>
              {combinedRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {loadingQueue ? (
          <div style={{ display: "grid", gap: 10 }}>
            <Skeleton height={50} />
            <Skeleton height={50} />
          </div>
        ) : sortedQueue.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--slate)", fontSize: 14.5 }}>
            No checked-in patients in the queue for this section.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {sortedQueue.map((item) => {
              const isArrived = item.status === "ARRIVED";
              const isInConsult = item.status === "IN_CONSULTATION";

              return (
                <div
                  key={item.appointment_id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 18px",
                    borderRadius: "var(--r-field)",
                    border: "1px solid var(--line)",
                    background: isInConsult ? "#fdf6ed" : "#fff",
                    boxShadow: "0 2px 8px rgba(19,26,143,0.03)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <strong style={{ fontSize: 15, color: "var(--ink)" }}>{item.patient_name}</strong>
                      <span style={{ fontSize: 12, color: "var(--slate)" }}>
                        {item.service_name} ({item.practitioner_name})
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--orange)" }}>
                        🕒 {getWaitTimeText(item.start_time)}
                      </span>
                      <span style={{ fontSize: 11.5, color: "var(--slate)" }}>
                        · Scheduled: {new Date(item.start_time).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <StatusPill data-testid="queue-status" kind={isArrived ? "info" : "warn"}>
                      {isArrived ? "ARRIVED / WAITING" : "IN CONSULTATION"}
                    </StatusPill>

                    {role !== "billing" && (
                      <div style={{ display: "flex", gap: 8 }}>
                        {isArrived && (
                          <Button
                            type="button"
                            style={{ fontSize: 12, padding: "4px 12px" }}
                            onClick={() => statusMutation.mutate({ id: item.appointment_id, status: "IN_CONSULTATION" })}
                            disabled={statusMutation.isPending}
                          >
                            Start Consult
                          </Button>
                        )}
                        {isInConsult && (
                          <Button
                            type="button"
                            style={{ fontSize: 12, padding: "4px 12px", background: "var(--green)" }}
                            onClick={() => statusMutation.mutate({ id: item.appointment_id, status: "COMPLETED" })}
                            disabled={statusMutation.isPending}
                          >
                            Complete Visit
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Receptionist pending check-in list (UI-303) */}
      {(role === "receptionist" || role === "admin") && (
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
            Scheduled Arrivals Awaiting Check-In
          </h3>

          {loadingAppts ? (
            <Skeleton height={50} />
          ) : pendingCheckIns.length === 0 ? (
            <p style={{ fontSize: 13.5, color: "var(--slate)", fontStyle: "italic", margin: 0 }}>
              No scheduled appointments awaiting arrival today.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {pendingCheckIns.map((appt: any) => {
                const familyName = appt.patient_name?.split(" ").pop() || appt.id;
                return (
                  <div
                    key={appt.id}
                    data-testid={`checkin-row-${familyName}`}
                    onClick={() => handleOpenCheckIn(appt.id)}
                    style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "var(--r-field)",
                    border: "1px dashed var(--line)",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <strong style={{ color: "var(--ink)" }}>{appt.patient_name}</strong>
                    <span style={{ fontSize: 12.5, color: "var(--slate)", marginLeft: 10 }}>
                      {appt.service_name} with {appt.practitioner_name} at{" "}
                      {new Date(appt.start_time).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>

                  <Button type="button" ghost style={{ fontSize: 12, padding: "4px 12px" }} onClick={(e) => { e.stopPropagation(); handleOpenCheckIn(appt.id); }}>
                    Initiate Check-In
                  </Button>
                </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Check In Enforcement Drawer overlay */}
      {checkInOpen && (
        <CheckInDrawer
          isOpen={checkInOpen}
          onClose={() => {
            setCheckInOpen(false);
            refetchQueue();
            refetchAppts();
          }}
          appointmentId={activeCheckInId}
        />
      )}

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
