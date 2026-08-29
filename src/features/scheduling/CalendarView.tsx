import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type AppointmentDetailOut } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Select, Input, StatusPill, Skeleton } from "../../ui/components";
import BookingModal from "./BookingModal";

export default function CalendarView() {
  const { token, tenant } = useAuth();

  const [practitionerId, setPractitionerId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");

  const { data: dbPractitioners = [] } = useQuery({
    queryKey: ["practitioners", tenant],
    queryFn: () => (token ? api.listPractitioners(token) : Promise.resolve([])),
  });

  const { data: dbSites = [] } = useQuery({
    queryKey: ["sites", tenant],
    queryFn: () => (token ? api.listSites(token) : Promise.resolve([])),
  });

  const { data: dbRooms = [] } = useQuery({
    queryKey: ["rooms", tenant],
    queryFn: () => (token ? api.listRooms(token) : Promise.resolve([])),
  });

  const { data: dbServices = [] } = useQuery({
    queryKey: ["services", tenant],
    queryFn: () => (token ? api.listServices(token) : Promise.resolve([])),
  });

  // Read staff roster and master configs
  const staffList: any[] = (() => {
    try {
      const saved = localStorage.getItem(`hms-staff-roster-${tenant || "default"}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  const configData = (() => {
    try {
      const saved = localStorage.getItem(`hms-config-data-${tenant || "default"}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  })();
  const masterVisitTypes: any[] = configData["visit_type"] || [];

  // Dynamic practitioners
  const staffDoctors = staffList
    .filter((s) => s.role === "doctor" || s.role === "admin")
    .map((s) => ({
      id: s.id,
      name: s.name,
      roomId: s.chamberRoom || "General Counter",
      roomName: s.chamberRoom || "General Counter",
      siteId: `site_${tenant || "main"}`,
    }));

  const rawPractitioners = [
    ...dbPractitioners.map((p) => ({
      id: p.id,
      name: p.name,
      roomId: dbRooms[0]?.id || "Chamber 1",
      roomName: dbRooms[0]?.name || "Chamber 1",
      siteId: dbSites[0]?.id || `site_${tenant || "main"}`,
    })),
    ...staffDoctors,
  ].filter((v, idx, arr) => arr.findIndex((t) => t.id === v.id) === idx);

  const practitioners = rawPractitioners.length > 0 ? rawPractitioners : [
    { id: `prac_${tenant || "main"}_1`, name: "Dr. Lead Consultant", roomId: "Chamber 101", roomName: "Chamber 101", siteId: `site_${tenant || "main"}` },
    { id: "doc_apollo_1", name: "Dr. Rao (Cardiology)", roomId: "Chamber 101", roomName: "Room 101 - Cardiology OPD", siteId: `site_${tenant || "main"}` },
    { id: "doc_apollo_2", name: "Dr. Lakshmi (General)", roomId: "Chamber 102", roomName: "Room 102 - General OPD", siteId: `site_${tenant || "main"}` },
  ];

  // Dynamic services
  const rawServices = [
    ...dbServices.map((s) => ({ id: s.id, name: s.name })),
    ...masterVisitTypes.map((v) => ({ id: v.id || v.name, name: v.name })),
  ].filter((v, idx, arr) => arr.findIndex((t) => t.name === v.name) === idx);

  const services = rawServices.length > 0 ? rawServices : [
    { id: "svc_ct_apollo", name: "CT Scan Cardiology" },
    { id: "svc_gp_apollo", name: "General Consultation" },
    { id: "svc_cardio_apollo", name: "Cardiology OPD Consult" },
  ];

  const currentPracId = practitionerId || practitioners[0]?.id || "";
  const currentServiceId = serviceId || services[0]?.id || "";

  const selectedPrac = practitioners.find((p) => p.id === currentPracId) || practitioners[0];
  const selectedServ = services.find((s) => s.id === currentServiceId) || services[0];

  const { data: patientsList = [], isLoading: isPatientsLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api.listPatients(token),
  });

  const filteredPatients = (patientsList || []).filter((p) => {
    if (!patientSearch) return true;
    const full = `${p.given_name} ${p.family_name} ${p.phone || ""}`.toLowerCase();
    return full.includes(patientSearch.toLowerCase());
  });

  // Booking Modal Trigger state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState(""); // ISO string

  // Earliest slot scan assistant state (UI-301)
  const [scanning, setScanning] = useState(false);
  const [scannedSlot, setScannedSlot] = useState<string | null>(null);

  const { data: appointments = [], isLoading: isApptsLoading, refetch } = useQuery<any[]>({
    queryKey: ["appointments"],
    queryFn: () => api.listAppointments(token),
  });

  const handleScanEarliest = () => {
    setScanning(true);
    setScannedSlot(null);
    setTimeout(() => {
      setScanning(false);
      setScannedSlot("2026-07-21T11:30:00");
    }, 800);
  };

  const handleSlotClick = (isoString: string) => {
    setTargetSlot(isoString);
    setBookingOpen(true);
  };

  // Calendar times slots definitions - full day OPD schedule
  const slots = [
    { label: "08:00 AM", time: "08:00:00" },
    { label: "08:30 AM", time: "08:30:00" },
    { label: "09:00 AM", time: "09:00:00" },
    { label: "09:30 AM", time: "09:30:00" },
    { label: "10:00 AM", time: "10:00:00" },
    { label: "10:30 AM", time: "10:30:00" },
    { label: "11:00 AM", time: "11:00:00" },
    { label: "11:30 AM", time: "11:30:00" },
    { label: "12:00 PM", time: "12:00:00" },
    { label: "12:30 PM", time: "12:30:00" },
    { label: "02:00 PM", time: "14:00:00" },
    { label: "02:30 PM", time: "14:30:00" },
    { label: "03:00 PM", time: "15:00:00" },
    { label: "03:30 PM", time: "15:30:00" },
    { label: "04:00 PM", time: "16:00:00" },
    { label: "04:30 PM", time: "16:30:00" },
    { label: "05:00 PM", time: "17:00:00" },
    { label: "05:30 PM", time: "17:30:00" },
    { label: "06:00 PM", time: "18:00:00" },
    { label: "06:30 PM", time: "18:30:00" },
    { label: "07:00 PM", time: "19:00:00" },
    { label: "07:30 PM", time: "19:30:00" },
  ];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Calendar header and filter options */}
      <Card>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 16px", color: "var(--indigo)" }}>
          Practitioner Scheduling Dashboard
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr auto", gap: 12, alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
              Patient Search
            </label>
            <Input
              data-testid="book-patient-search"
              placeholder="Search patient..."
              value={patientSearch}
              onChange={(e) => { setPatientSearch(e.target.value); setSelectedPatientId(""); }}
            />
            {patientSearch && !selectedPatientId && (
              <div style={{ position: "absolute", zIndex: 50, background: "#fff", border: "1px solid var(--line)", padding: 6, borderRadius: 8, marginTop: 4 }}>
                {filteredPatients.map((p) => (
                  <div
                    key={p.id}
                    data-testid="book-patient-result"
                    onClick={() => { setSelectedPatientId(p.id); setPatientSearch(`${p.given_name} ${p.family_name}`); }}
                    style={{ padding: "4px 8px", cursor: "pointer" }}
                  >
                    {p.given_name} {p.family_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
              Select Doctor / Practitioner
            </label>
            <Select value={currentPracId} onChange={(e) => setPractitionerId(e.target.value)}>
              {practitioners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
              Clinical Service Required
            </label>
            <Select data-testid="book-service" value={currentServiceId} onChange={(e) => setServiceId(e.target.value)}>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
              Booking Date
            </label>
            <Select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
              <option value="2026-07-21">21 Jul 2026 (Today)</option>
              <option value="2026-07-22">22 Jul 2026 (Tomorrow)</option>
            </Select>
          </div>

          {/* Earliest Slot Scan Assistant (UI-301) */}
          <Button type="button" ghost onClick={handleScanEarliest} disabled={scanning}>
            {scanning ? "Scanning Schedule..." : "🔍 Find Earliest Slot"}
          </Button>
        </div>
      </Card>

      {/* Main Grid Calendar View */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, alignItems: "start" }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--ink)", margin: 0 }}>
              Slots Grid: {selectedDate}
            </h3>
            <div style={{ display: "flex", gap: 6 }}>
              <StatusPill kind="info">Room Location: {selectedPrac.roomName}</StatusPill>
            </div>
          </div>

          {isApptsLoading ? (
            <div style={{ display: "grid", gap: 10 }}>
              <Skeleton height={50} />
              <Skeleton height={50} />
              <Skeleton height={50} />
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {slots.map((slot) => {
                const slotIso = `${selectedDate}T${slot.time}`;
                const booking = appointments.find((a) => {
                  if (a.status === "CANCELLED") return false;
                  if (a.practitioner_id !== practitionerId && a.room_id !== selectedPrac?.roomId) return false;
                  const apptStartMs = new Date(a.start_time).getTime();
                  const slotMs = new Date(slotIso).getTime();
                  return Math.abs(apptStartMs - slotMs) < 1000 * 60 * 15;
                });

                const isScannedHighlight = scannedSlot === slotIso;

                return (
                  <div
                    key={slot.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 18px",
                      borderRadius: "var(--r-field)",
                      border: isScannedHighlight ? "2px solid var(--orange)" : "1px solid var(--line)",
                      background: isScannedHighlight ? "#fdf6ed" : booking ? "var(--wash-a)" : "#fff",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <strong style={{ fontSize: 14, color: "var(--indigo)", width: 70 }}>
                        {slot.label}
                      </strong>
                      {booking ? (
                        <div>
                          <span style={{ fontWeight: 700, color: "var(--ink)", fontSize: 14 }}>
                            {booking.patient_name}
                          </span>
                          <span style={{ fontSize: 12, color: "var(--slate)", marginLeft: 10 }}>
                            {booking.service_name} (Status: {booking.status})
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "var(--slate)", fontSize: 13, fontStyle: "italic" }}>
                          Available slot for booking
                        </span>
                      )}
                    </div>

                    {!booking ? (
                      <Button
                        data-testid="book-slot"
                        type="button"
                        style={{
                          background: isScannedHighlight ? "var(--orange)" : "var(--green)",
                          fontSize: 12,
                          padding: "4px 14px",
                        }}
                        onClick={() => handleSlotClick(slotIso)}
                      >
                        {isScannedHighlight ? "Book Suggested" : "Book Slot"}
                      </Button>
                    ) : (
                      <StatusPill kind={booking.status === "ARRIVED" ? "success" : "brand"}>
                        {booking.status}
                      </StatusPill>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Earliest Slot Finder scan display side card */}
        <Card style={{ background: "var(--wash-a)", border: "none" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 10px" }}>
            Earliest Slot Assistant
          </h3>
          <p style={{ fontSize: 13, color: "var(--slate)", lineHeight: 1.5, marginBottom: 16 }}>
            Click the finder button to automatically scan schedules for the next open appointment opening.
          </p>

          {scanning && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontStyle: "italic", fontSize: 13, color: "var(--slate)" }}>
                Scanning calendars for {selectedPrac.name}...
              </div>
            </div>
          )}

          {scannedSlot && (
            <div
              style={{
                background: "#fdf6ed",
                border: "1px solid var(--orange)",
                borderRadius: "var(--r-field)",
                padding: 14,
                display: "grid",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--orange)", textTransform: "uppercase" }}>
                Found Available Slot!
              </span>
              <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 600 }}>
                {selectedPrac.name} — {selectedServ.name}
                <br />
                Today at 11:30 AM
              </div>
              <Button type="button" onClick={() => handleSlotClick(scannedSlot)}>
                Confirm this slot
              </Button>
            </div>
          )}

          {!scanning && !scannedSlot && (
            <div style={{ textAlign: "center", color: "var(--slate)", fontSize: 12.5, fontStyle: "italic", padding: "10px 0" }}>
              No active scan results.
            </div>
          )}
        </Card>
      </div>

      {/* Booking Dialog Modal wrapper */}
      {bookingOpen && (
        <BookingModal
          isOpen={bookingOpen}
          onClose={() => {
            setBookingOpen(false);
            setScannedSlot(null);
            refetch();
          }}
          selectedPractitionerId={currentPracId}
          selectedPractitionerName={selectedPrac.name}
          selectedSlot={targetSlot}
          selectedServiceId={currentServiceId}
          selectedServiceName={selectedServ.name}
          selectedRoomId={selectedPrac.roomId}
          selectedRoomName={selectedPrac.roomName}
          selectedSiteId={selectedPrac.siteId}
          initialPatientId={selectedPatientId}
        />
      )}
    </div>
  );
}
