import React, { useState } from "react";
import { Modal, Button, Input, Select } from "../../ui/components";

interface TelehealthBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newAppointment: any) => void;
}

export default function TelehealthBookingModal({
  isOpen,
  onClose,
  onSuccess,
}: TelehealthBookingModalProps) {
  const [patientName, setPatientName] = useState("V. Ananya Sharma");
  const [patientUhid, setPatientUhid] = useState("UHID-2026-90875");
  const [phone, setPhone] = useState("9849012345");
  const [doctorName, setDoctorName] = useState("Dr. K R Murali (General Medicine)");
  const [scheduledTime, setScheduledTime] = useState("11:30 AM");
  const [reason, setReason] = useState("Follow-up on Blood Pressure & Medication Review");
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newAppointment = {
      id: `tel-${Date.now()}`,
      sessionCode: `TEL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName,
      patientUhid,
      phone: `+91 ${phone}`,
      doctorName,
      scheduledTime,
      reason,
      status: "WAITING_IN_ROOM",
      waitingSince: "Just now",
      deviceStatus: {
        camera: "READY",
        mic: "READY",
        network: "EXCELLENT",
      },
      inviteLink: `https://stage.zensynq.com/telehealth/join?session=TEL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    onSuccess(newAppointment);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book Remote Video Consultation (TEL-001)">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, maxWidth: 540, minWidth: 440, fontFamily: "var(--font-body)", color: "var(--ink)" }}>
        
        {/* Patient Name & UHID */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 10 }}>
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

        {/* Mobile Number for WhatsApp Link */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
            Patient Mobile Number (for Instant WhatsApp & SMS Video Invite Link)
          </label>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ padding: "8px 12px", background: "var(--wash-a)", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
              🇮🇳 +91
            </span>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              required
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Doctor & Time Slot */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Consulting Doctor
            </label>
            <Select value={doctorName} onChange={(e) => setDoctorName(e.target.value)}>
              <option value="Dr. K R Murali (General Medicine)">Dr. K R Murali (General Medicine)</option>
              <option value="Dr. Sreenivasulu (Cardiology)">Dr. Sreenivasulu (Cardiology)</option>
              <option value="Dr. V Ramana (Orthopedics)">Dr. V Ramana (Orthopedics)</option>
            </Select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
              Time Slot
            </label>
            <Select value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)}>
              <option value="11:00 AM">11:00 AM</option>
              <option value="11:30 AM">11:30 AM</option>
              <option value="12:00 PM">12:00 PM</option>
              <option value="02:30 PM">02:30 PM</option>
              <option value="03:00 PM">03:00 PM</option>
              <option value="04:30 PM">04:30 PM</option>
            </Select>
          </div>
        </div>

        {/* Reason for Consultation */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 2 }}>
            Chief Health Complaint / Consultation Reason
          </label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} required />
        </div>

        {/* WhatsApp Invite Toggle */}
        <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", padding: 10, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <strong style={{ fontSize: 12.5, color: "#166534", display: "block" }}>
              💬 Instant WhatsApp Video Link Dispatch
            </strong>
            <span style={{ fontSize: 11, color: "#15803D" }}>
              Sends direct 1-click video join link to +91 {phone}
            </span>
          </div>

          <input
            type="checkbox"
            checked={sendWhatsApp}
            onChange={(e) => setSendWhatsApp(e.target.checked)}
            style={{ width: 18, height: 18 }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
          <Button ghost type="button" onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            style={{ background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)", color: "#fff", fontWeight: 800 }}
          >
            📹 Book & Dispatch Video Invite
          </Button>
        </div>
      </form>
    </Modal>
  );
}
