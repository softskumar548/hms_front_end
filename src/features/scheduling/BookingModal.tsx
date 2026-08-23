import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, AppointmentCreate } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Modal, Button, Card, FieldCell, Select, StatusPill, Toast, Input } from "../../ui/components";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPractitionerId: string;
  selectedPractitionerName: string;
  selectedSlot: string; // ISO string
  selectedServiceId: string;
  selectedServiceName: string;
  selectedRoomId: string;
  selectedRoomName: string;
  selectedSiteId?: string;
  initialPatientId?: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  selectedPractitionerId,
  selectedPractitionerName,
  selectedSlot,
  selectedServiceId,
  selectedServiceName,
  selectedRoomId,
  selectedRoomName,
  selectedSiteId,
  initialPatientId,
}: BookingModalProps) {
  const { token, tenant } = useAuth();
  const qc = useQueryClient();

  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || "");
  const [patientSearch, setPatientSearch] = useState("");
  const [successAppt, setSuccessAppt] = useState<any>(null); // For MediPass boarding card
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Fetch Patients List
  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api.listPatients(token),
  });

  React.useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
      const match = patients.find((p) => p.id === initialPatientId);
      if (match) {
        setPatientSearch(`${match.given_name} ${match.family_name}`);
      }
    }
  }, [initialPatientId, patients]);

  const filteredPatients = (patients || []).filter((p) => {
    if (!patientSearch) return true;
    const full = `${p.given_name} ${p.family_name} ${p.phone || ""}`.toLowerCase();
    return full.includes(patientSearch.toLowerCase());
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Booking mutation
  const bookMutation = useMutation({
    mutationFn: (body: AppointmentCreate) => api.bookAppointment(token, body),
    onSuccess: (data) => {
      setSuccessAppt(data);
      qc.invalidateQueries({ queryKey: ["appointments"] });
      triggerToast("Appointment booked successfully!");
    },
    onError: (err: any) => {
      if (err.status === 409) {
        setErrorMsg("Conflict: Practitioner is already booked during this time slot.");
      } else {
        setErrorMsg(err.message || "Failed to book appointment.");
      }
    },
  });

  const handleConfirm = () => {
    if (!selectedPatientId) {
      setErrorMsg("Please select a patient to book the slot.");
      return;
    }
    setErrorMsg("");
    const startTime = new Date(selectedSlot);
    const endTime = new Date(startTime.getTime() + 1000 * 60 * 30); // 30 mins slot

    const activeTenant = tenant || "apollo";
    const prereqList = showPrereqs ? [`prq_fasting_${activeTenant}`, `prq_water_${activeTenant}`] : undefined;

    bookMutation.mutate({
      patient_id: selectedPatientId,
      practitioner_id: selectedPractitionerId,
      site_id: selectedSiteId || "site_vizag_1",
      room_id: selectedRoomId,
      service_id: selectedServiceId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      prerequisites: prereqList,
    });
  };

  const handleClose = () => {
    setSuccessAppt(null);
    setSelectedPatientId("");
    setErrorMsg("");
    onClose();
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  // Service prerequisites preview (UI-302 / REF-060)
  const showPrereqs = true;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={successAppt ? "Booking Confirmation" : "Confirm Booking Slot"}>
      {!successAppt ? (
        // Standard confirm screen
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FieldCell label="Practitioner">{selectedPractitionerName}</FieldCell>
            <FieldCell label="Room Location">{selectedRoomName}</FieldCell>
            <FieldCell label="Requested Service">{selectedServiceName}</FieldCell>
            <FieldCell label="Date & Slot Time">
              {new Date(selectedSlot).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </FieldCell>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
              Select Patient *
            </label>
            <Input
              data-testid="book-patient-search"
              placeholder="Search patient name..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <div style={{ maxHeight: 120, overflowY: "auto", border: "1px solid var(--line)", borderRadius: "var(--r-field)", padding: 6 }}>
              {filteredPatients.map((p) => (
                <div
                  key={p.id}
                  data-testid="book-patient-result"
                  onClick={() => { setSelectedPatientId(p.id); setPatientSearch(`${p.given_name} ${p.family_name}`); }}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                    background: selectedPatientId === p.id ? "var(--indigo-soft)" : "transparent",
                    color: selectedPatientId === p.id ? "var(--indigo)" : "var(--ink)",
                    fontWeight: selectedPatientId === p.id ? 700 : 500,
                  }}
                >
                  {p.given_name} {p.family_name} ({p.phone || "No phone"})
                </div>
              ))}
            </div>
          </div>

          {showPrereqs && (
            <Card style={{ border: "1px solid var(--line)" }}>
              <strong style={{ fontSize: 13, color: "var(--indigo)", display: "block", marginBottom: 8 }}>
                Required Service Prerequisites (UI-302 / REF-060)
              </strong>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <StatusPill data-testid="prereq-item-hardstop" kind="danger">Hard-Stop</StatusPill>
                  <span style={{ fontSize: 12.5, color: "var(--ink)" }}>
                    Fasting for 12 hours before test (12 గంటలు ఖాళీ కడుపుతో ఉండాలి)
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <StatusPill kind="warn">Advisory</StatusPill>
                  <span style={{ fontSize: 12.5, color: "var(--ink)" }}>
                    Contrast injection consent signed (ఇంజెక్షన్ సమ్మతి పత్రం)
                  </span>
                </div>
              </div>
            </Card>
          )}

          {errorMsg && (
            <div style={{ color: "var(--danger)", background: "#fbe3e3", padding: 12, borderRadius: "var(--r-field)", fontSize: 13, fontWeight: 600 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
            <Button ghost onClick={handleClose}>
              Cancel
            </Button>
            <Button data-testid="book-confirm" disabled={bookMutation.isPending} onClick={handleConfirm}>
              {bookMutation.isPending ? "Confirming..." : "Book Appointment"}
            </Button>
          </div>
        </div>
      ) : (
        // AIRLINE-STYLE MEDIPASS BOARDING PASS ON SUCCESS (UI-1.4 Signature Pattern)
        <div style={{ display: "grid", gap: 20 }}>
          <div
            data-testid="medipass"
            style={{
              background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)",
              color: "#fff",
              borderRadius: "22px",
              boxShadow: "var(--shadow-pop)",
              overflow: "hidden",
              border: "1px solid var(--line)",
            }}
          >
            {/* Boarding Pass Header */}
            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px dashed rgba(255,255,255,0.2)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
                ✈️ MediGo Boarding Pass
              </span>
              <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", padding: "4px 12px", borderRadius: "999px", fontSize: 12, fontWeight: 800 }}>
                CONFIRMED
              </span>
            </div>

            {/* Flight Route Style Mapping */}
            <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ textAlign: "left" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", display: "block" }}>
                  Patient
                </span>
                <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-display)" }}>
                  YOU
                </span>
              </div>
              <div style={{ fontSize: 24, opacity: 0.6 }}>➔</div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", display: "block" }}>
                  Destination
                </span>
                <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-display)" }}>
                  {successAppt.room_name?.includes("Cardiology") ? "CARDIOLOGY" : "OPD CLINIC"}
                </span>
              </div>
            </div>

            {/* Main Passenger Info Grid */}
            <div style={{ background: "#fff", color: "var(--ink)", padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <FieldCell label="Patient Name">
                {selectedPatient ? `${selectedPatient.given_name} ${selectedPatient.family_name}` : "Patient"}
              </FieldCell>
              <FieldCell label="Practitioner">
                {successAppt.practitioner_name || selectedPractitionerName}
              </FieldCell>
              <FieldCell label="Date & Time">
                {new Date(successAppt.start_time).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </FieldCell>
              <FieldCell label="Service Scheduled">
                {successAppt.service_name || selectedServiceName}
              </FieldCell>
              <FieldCell label="Clinic Room">
                {successAppt.room_name || selectedRoomName}
              </FieldCell>
              <FieldCell label="Queue Token">
                {successAppt.id?.substring(5, 8).toUpperCase() || "T-01"}
              </FieldCell>
            </div>

            {/* Perforated Ticket Stub with Mock Barcode */}
            <div style={{ background: "#f8fafd", color: "var(--ink)", padding: "18px 24px", borderTop: "2px dashed var(--line)", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--slate)", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>
                Booking Ref: {successAppt.id}
              </div>
              {/* Visual simulated Barcode */}
              <div style={{ display: "flex", justifyContent: "center", gap: 2, height: 36, background: "#fff", padding: "6px 20px", borderRadius: "10px", border: "1px solid var(--line)" }}>
                {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6].map((w, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: w % 3 === 0 ? 3 : w % 2 === 0 ? 2 : 1,
                      background: idx % 3 === 2 ? "transparent" : "#000",
                      height: "100%",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleClose}>Close Confirmation</Button>
          </div>
        </div>
      )}
      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </Modal>
  );
}
