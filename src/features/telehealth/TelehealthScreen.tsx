import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Input, Select, StatusPill, Toast } from "../../ui/components";
import TelehealthBookingModal from "./TelehealthBookingModal";

export interface TelehealthSession {
  id: string;
  sessionCode: string;
  patientName: string;
  patientUhid: string;
  phone: string;
  doctorName: string;
  scheduledTime: string;
  reason: string;
  status: "WAITING_IN_ROOM" | "IN_CONSULTATION" | "COMPLETED";
  waitingSince?: string;
  deviceStatus?: {
    camera: string;
    mic: string;
    network: string;
  };
  duration?: string;
  rxItems?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    instructionsTe: string;
  }>;
}

const initialWaitingSessions: TelehealthSession[] = [
  {
    id: "tel-01",
    sessionCode: "TEL-2026-9181",
    patientName: "V. Ananya Sharma",
    patientUhid: "UHID-2026-90875",
    phone: "+91 9849012345",
    doctorName: "Dr. K R Murali (General Medicine)",
    scheduledTime: "11:00 AM",
    reason: "Hypertension review & dry cough evaluation",
    status: "IN_CONSULTATION",
    waitingSince: "5 mins ago",
    deviceStatus: {
      camera: "READY",
      mic: "READY",
      network: "EXCELLENT (42 Mbps)",
    },
    rxItems: [
      {
        name: "Tab. Telma 40mg",
        dosage: "40mg",
        frequency: "1-0-0 (Morning After Breakfast)",
        instructionsTe: "ఉదయం టిఫిన్ తర్వాత ప్రతిరోజూ క్రమం తప్పకుండా వేసుకోండి",
      },
      {
        name: "Syp. Ascoril-D",
        dosage: "10ml",
        frequency: "1-0-1 (Twice Daily After Food)",
        instructionsTe: "ఉదయం మరియు రాత్రి భోజనం తర్వాత 10ml తాగండి",
      },
    ],
  },
  {
    id: "tel-02",
    sessionCode: "TEL-2026-9182",
    patientName: "M. Subba Rao",
    patientUhid: "UHID-2026-90876",
    phone: "+91 9849054321",
    doctorName: "Dr. Sreenivasulu (Cardiology)",
    scheduledTime: "11:30 AM",
    reason: "Post-Angioplasty 3-month ECG & Lipid profile follow-up",
    status: "WAITING_IN_ROOM",
    waitingSince: "8 mins ago",
    deviceStatus: {
      camera: "READY",
      mic: "READY",
      network: "GOOD (18 Mbps)",
    },
  },
  {
    id: "tel-03",
    sessionCode: "TEL-2026-9183",
    patientName: "P. Sunitha Rani",
    patientUhid: "UHID-2026-90877",
    phone: "+91 9849088776",
    doctorName: "Dr. V Ramana (Orthopedics)",
    scheduledTime: "12:00 PM",
    reason: "Left knee arthroscopy post-op physiotherapy check",
    status: "WAITING_IN_ROOM",
    waitingSince: "2 mins ago",
    deviceStatus: {
      camera: "READY",
      mic: "READY",
      network: "EXCELLENT (55 Mbps)",
    },
  },
];

export default function TelehealthScreen() {
  const { tenant } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "room"; // room, queue, schedule, history

  const [sessions, setSessions] = useState<TelehealthSession[]>(initialWaitingSessions);
  const [activeSession, setActiveSession] = useState<TelehealthSession | null>(initialWaitingSessions[0]);

  // Video Controls State
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [callTimer, setCallTimer] = useState(384); // seconds

  // Live EMR Note State
  const [clinicalNotes, setClinicalNotes] = useState("Patient reports mild dry cough for 3 days. BP recorded at home: 134/84 mmHg. Lungs clear on remote assessment. No shortness of breath or chest tightness.");
  const [newRxName, setNewRxName] = useState("Tab. Pan-D");
  const [newRxFreq, setNewRxFreq] = useState("1-0-0 (Morning Empty Stomach)");
  const [newRxTe, setNewRxTe] = useState("ఉదయం పరిగడుపున టిఫిన్ ముందు వేసుకోండి");

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Call timer increment
  useEffect(() => {
    const timer = setInterval(() => {
      setCallTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleTabChange = (tabKey: string) => {
    setSearchParams({ tab: tabKey });
  };

  // Add Medication to active consultation
  const handleAddMedication = () => {
    if (!activeSession) return;
    const newItem = {
      name: newRxName,
      dosage: "Standard",
      frequency: newRxFreq,
      instructionsTe: newRxTe,
    };
    setActiveSession({
      ...activeSession,
      rxItems: [...(activeSession.rxItems || []), newItem],
    });
    setNewRxName("");
    triggerToast(`Added ${newRxName} to digital prescription.`);
  };

  // Complete consultation
  const handleCompleteConsult = () => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? { ...s, status: "COMPLETED", duration: `${Math.floor(callTimer / 60)} mins` }
          : s
      )
    );
    triggerToast(`Consultation completed. Digital e-Prescription dispatched to ${activeSession.phone} via WhatsApp.`);
  };

  // Switch active session from queue
  const handleLaunchConsult = (sess: TelehealthSession) => {
    setActiveSession(sess);
    setCallTimer(0);
    setSearchParams({ tab: "room" });
    triggerToast(`Connected to remote video stream with ${sess.patientName}.`);
  };

  // Booking Success
  const handleBookingSuccess = (newAppt: TelehealthSession) => {
    setSessions((prev) => [newAppt, ...prev]);
    setBookingModalOpen(false);
    triggerToast(`Video consult booked. Instant WhatsApp invitation link sent to ${newAppt.phone}.`);
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Top Cyan Breadcrumb Banner */}
      <div
        style={{
          background: "#00BCD4",
          borderRadius: "14px 14px 0 0",
          padding: "12px 20px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>📹</span>
          <span>Telehealth WebRTC Video Consultations & Digital Rx Desk</span>
        </div>
        <div style={{ fontSize: 12, background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20 }}>
          {tenant ? `${tenant.replace("_", " ")} Telehealth` : "ZEN CLINIC TELEHEALTH"} · WebRTC Encrypted HD · WhatsApp Gateway Live
        </div>
      </div>

      {/* 5 Top Telehealth KPI Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <Card style={{ borderLeft: "4px solid #00BCD4", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Today's Appointments</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>{sessions.length}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Scheduled Video</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #F59E0B", padding: "14px 18px", background: "#FEFCE8" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#D97706", textTransform: "uppercase" }}>Virtual Waiting Room</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#D97706" }}>
              {sessions.filter(s => s.status === "WAITING_IN_ROOM").length}
            </strong>
            <span style={{ fontSize: 12, color: "#B45309", fontWeight: 700 }}>Patients Online</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #16A34A", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Completed Today</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#16A34A" }}>14</strong>
            <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>Rx Dispatched</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid var(--indigo)", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Avg Call Duration</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>11.4m</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Per Patient</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #EC4899", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Patient Rating</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#EC4899" }}>4.9 ⭐</strong>
            <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>5.0 Rating</span>
          </div>
        </Card>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid var(--line)", paddingBottom: 6 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { key: "room", label: "📹 Live Video Consult Room", count: "HD WebRTC" },
            { key: "queue", label: "📋 Virtual Waiting Queue", count: sessions.filter(s => s.status === "WAITING_IN_ROOM").length },
            { key: "history", label: "📜 Completed Encounters", count: "14 Today" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              style={{
                padding: "10px 18px",
                borderRadius: "10px 10px 0 0",
                border: "none",
                background: activeTab === tab.key ? "var(--indigo)" : "transparent",
                color: activeTab === tab.key ? "#ffffff" : "var(--slate)",
                fontWeight: 800,
                fontSize: 13.5,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.15s ease",
              }}
            >
              <span>{tab.label}</span>
              <span style={{ fontSize: 11, background: activeTab === tab.key ? "rgba(255,255,255,0.25)" : "var(--wash-b)", color: activeTab === tab.key ? "#fff" : "var(--indigo)", padding: "2px 6px", borderRadius: 10 }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div>
          <Button
            type="button"
            onClick={() => setBookingModalOpen(true)}
            style={{ background: "linear-gradient(135deg, #131A8F 0%, #0A1166 100%)", color: "#fff", fontWeight: 800, fontSize: 13, padding: "9px 18px" }}
          >
            📅 Book Video Consultation
          </Button>
        </div>
      </div>

      {/* TAB 1: LIVE IN-BROWSER VIDEO CONSULT ROOM */}
      {activeTab === "room" && activeSession && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
          
          {/* LEFT: WebRTC Video Stream Player */}
          <Card style={{ borderRadius: 16, padding: 0, overflow: "hidden", background: "#0F172A", color: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 560 }}>
            
            {/* Top Video Header */}
            <div style={{ padding: "14px 18px", background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E", display: "inline-block", boxShadow: "0 0 8px #22C55E" }}></span>
                  <strong style={{ fontSize: 15 }}>{activeSession.patientName}</strong>
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>({activeSession.patientUhid})</span>
                </div>
                <span style={{ fontSize: 11.5, color: "#38BDF8", display: "block", marginTop: 2 }}>
                  Session: {activeSession.sessionCode} · WebRTC End-to-End Encrypted (HD 1080p)
                </span>
              </div>

              {/* Call Duration Pill */}
              <div style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #EF4444", color: "#FCA5A5", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", display: "inline-block" }}></span>
                <span>REC {formatTimer(callTimer)}</span>
              </div>
            </div>

            {/* Simulated Remote Video Canvas & Self-View Overlay */}
            <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, #1E293B 0%, #0F172A 100%)", minHeight: 380 }}>
              
              {/* Patient Video Placeholder */}
              <div style={{ textAlign: "center", padding: 20 }}>
                <div style={{ width: 110, height: 110, borderRadius: "50%", background: "linear-gradient(135deg, #00BCD4 0%, #131A8F 100%)", color: "#fff", display: "grid", placeItems: "center", fontSize: 44, margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(0, 188, 212, 0.3)" }}>
                  👩
                </div>
                <strong style={{ fontSize: 18, display: "block" }}>{activeSession.patientName}</strong>
                <span style={{ fontSize: 12, color: "#94A3B8" }}>Connected via Patient Portal App (Vizag, AP)</span>
                
                {/* Simulated Audio Waveform Bar */}
                <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 14 }}>
                  {[12, 24, 18, 30, 20, 28, 14, 22, 10].map((h, i) => (
                    <span key={i} style={{ width: 3, height: h, background: "#38BDF8", borderRadius: 2, display: "inline-block" }}></span>
                  ))}
                </div>
              </div>

              {/* Self-View Picture-in-Picture (Doctor) */}
              <div style={{ position: "absolute", bottom: 16, right: 16, width: 130, height: 95, borderRadius: 10, background: "#334155", border: "2px solid #38BDF8", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 6, boxShadow: "0 4px 14px rgba(0,0,0,0.5)" }}>
                <span style={{ fontSize: 9.5, color: "#94A3B8" }}>Self View (You)</span>
                <div style={{ textAlign: "center", fontSize: 24 }}>👨‍⚕️</div>
                <span style={{ fontSize: 9, color: "#38BDF8", fontWeight: 700 }}>Dr. K R Murali</span>
              </div>
            </div>

            {/* Video Call Controls Bar */}
            <div style={{ padding: "14px 20px", background: "rgba(15, 23, 42, 0.95)", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
              
              {/* Mic Toggle */}
              <button
                type="button"
                onClick={() => {
                  setMicMuted(!micMuted);
                  triggerToast(micMuted ? "Microphone unmuted." : "Microphone muted.");
                }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "none",
                  background: micMuted ? "#EF4444" : "#334155",
                  color: "#fff",
                  fontSize: 18,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  transition: "all 0.15s ease",
                }}
                title={micMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {micMuted ? "🔇" : "🎤"}
              </button>

              {/* Camera Toggle */}
              <button
                type="button"
                onClick={() => {
                  setCameraOff(!cameraOff);
                  triggerToast(cameraOff ? "Camera turned on." : "Camera turned off.");
                }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "none",
                  background: cameraOff ? "#EF4444" : "#334155",
                  color: "#fff",
                  fontSize: 18,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  transition: "all 0.15s ease",
                }}
                title={cameraOff ? "Turn Camera On" : "Turn Camera Off"}
              >
                {cameraOff ? "🚫" : "📷"}
              </button>

              {/* Screen Share */}
              <button
                type="button"
                onClick={() => {
                  setScreenSharing(!screenSharing);
                  triggerToast(screenSharing ? "Screen sharing stopped." : "Sharing diagnostic reports to patient screen.");
                }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "none",
                  background: screenSharing ? "#00BCD4" : "#334155",
                  color: "#fff",
                  fontSize: 18,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  transition: "all 0.15s ease",
                }}
                title="Share Screen"
              >
                🖥️
              </button>

              {/* WhatsApp Link Generator */}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(activeSession.phone);
                  triggerToast(`Patient video join link copied for WhatsApp sharing.`);
                }}
                style={{
                  padding: "0 14px",
                  height: 44,
                  borderRadius: 22,
                  border: "none",
                  background: "#22C55E",
                  color: "#fff",
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>💬 WhatsApp Invite</span>
              </button>

              {/* End Call Button */}
              <button
                type="button"
                onClick={handleCompleteConsult}
                style={{
                  padding: "0 18px",
                  height: 44,
                  borderRadius: 22,
                  border: "none",
                  background: "#DC2626",
                  color: "#fff",
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>🔴 End & Sign Rx</span>
              </button>

            </div>
          </Card>

          {/* RIGHT: Side-by-Side EMR & Bilingual Rx Composer */}
          <Card style={{ borderRadius: 16, display: "flex", flexDirection: "column", gap: 14, maxHeight: 680, overflowY: "auto" }}>
            
            {/* Allergy Warning Banner */}
            <div style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B", padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <div>
                <strong style={{ fontSize: 12, color: "#B45309", display: "block" }}>
                  Persistent Allergy Alert (EMR-005):
                </strong>
                <span style={{ fontSize: 11, color: "#92400E" }}>
                  Patient has known allergy to <strong>PENICILLIN</strong> (Severe Urticaria).
                </span>
              </div>
            </div>

            {/* Live Clinical Notes & Diagnosis */}
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 4 }}>
                Clinical Encounter Notes & Assessment:
              </label>
              <textarea
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--line)", fontFamily: "var(--font-body)", fontSize: 12.5 }}
              />
            </div>

            {/* Instant e-Prescription (Rx) Composer */}
            <div style={{ background: "var(--wash-a)", border: "1.5px solid var(--indigo)", padding: 12, borderRadius: 10 }}>
              <strong style={{ fontSize: 12.5, color: "var(--indigo)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                💊 Real-Time e-Prescription (Rx) Composer:
              </strong>

              {/* Existing Prescribed Medicines */}
              <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
                {activeSession.rxItems?.map((item, idx) => (
                  <div key={idx} style={{ background: "#fff", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 12 }}>
                    <strong style={{ color: "var(--ink)" }}>{item.name}</strong>
                    <span style={{ color: "var(--slate)", marginLeft: 6 }}>({item.frequency})</span>
                    <span style={{ fontSize: 11, color: "#166534", display: "block", marginTop: 2 }}>
                      తెలుగు: {item.instructionsTe}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Medicine Inputs */}
              <div style={{ display: "grid", gap: 8 }}>
                <Input
                  placeholder="Medicine Name (e.g. Tab. Pan-D)"
                  value={newRxName}
                  onChange={(e) => setNewRxName(e.target.value)}
                />
                <Input
                  placeholder="Frequency (e.g. 1-0-0 Before Food)"
                  value={newRxFreq}
                  onChange={(e) => setNewRxFreq(e.target.value)}
                />
                <Input
                  placeholder="Telugu Instructions (e.g. ఉదయం పరిగడుపున)"
                  value={newRxTe}
                  onChange={(e) => setNewRxTe(e.target.value)}
                />

                <Button
                  type="button"
                  onClick={handleAddMedication}
                  style={{ background: "var(--indigo)", color: "#fff", fontSize: 12, padding: "8px 12px" }}
                >
                  + Add Medication to Prescription
                </Button>
              </div>
            </div>

            {/* Complete & Dispatch Button */}
            <Button
              type="button"
              onClick={handleCompleteConsult}
              style={{ background: "#16A34A", color: "#fff", fontWeight: 800, padding: "10px 16px" }}
            >
              📤 Dispatch e-Prescription to Patient WhatsApp & Finish
            </Button>
          </Card>

        </div>
      )}

      {/* TAB 2: VIRTUAL WAITING ROOM QUEUE */}
      {activeTab === "queue" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                📋 Remote Patients in Virtual Waiting Lounge
              </h3>
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                Patients logged in and awaiting doctor connection with verified camera, mic & network readiness
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {sessions.filter(s => s.status === "WAITING_IN_ROOM").map((sess) => (
              <div key={sess.id} style={{ background: "var(--wash-a)", border: "1px solid var(--line)", padding: "16px 20px", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <strong style={{ fontSize: 16, color: "var(--ink)" }}>{sess.patientName}</strong>
                    <span style={{ fontSize: 12, color: "var(--slate)" }}>({sess.patientUhid} · {sess.phone})</span>
                    <span style={{ fontSize: 11, background: "#FEF3C7", color: "#B45309", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                      Waiting {sess.waitingSince}
                    </span>
                  </div>
                  <span style={{ fontSize: 12.5, color: "var(--slate)", display: "block", marginTop: 4 }}>
                    Reason: <strong>{sess.reason}</strong> · Doctor: {sess.doctorName}
                  </span>
                  
                  {/* Device Status Pills */}
                  <div style={{ display: "flex", gap: 8, marginTop: 6, fontSize: 11 }}>
                    <span style={{ color: "#166534", background: "#DCFCE7", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                      ✓ Camera Ready
                    </span>
                    <span style={{ color: "#166534", background: "#DCFCE7", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                      ✓ Mic Active
                    </span>
                    <span style={{ color: "#1E40AF", background: "#EFF6FF", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                      📶 {sess.deviceStatus?.network || "Strong Network"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <Button
                    type="button"
                    onClick={() => handleLaunchConsult(sess)}
                    style={{ background: "#00BCD4", color: "#fff", fontWeight: 800, fontSize: 13, padding: "8px 18px" }}
                  >
                    📹 Connect Video Stream
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: PAST COMPLETED ENCOUNTERS */}
      {activeTab === "history" && (
        <Card style={{ borderRadius: 16 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
            📜 Completed Telehealth Consultations & Prescription Ledger
          </h3>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Session Code</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Patient Name</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Doctor</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Diagnosis / Complaint</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Duration</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.filter(s => s.status === "COMPLETED").map((sess) => (
                  <tr key={sess.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "var(--indigo)", fontWeight: 700 }}>
                      {sess.sessionCode}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <strong style={{ display: "block" }}>{sess.patientName}</strong>
                      <span style={{ fontSize: 11.5, color: "var(--slate)" }}>{sess.patientUhid}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>{sess.doctorName}</td>
                    <td style={{ padding: "12px 14px" }}>{sess.reason}</td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>{sess.duration || "12 mins"}</td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <span style={{ fontSize: 11, background: "#DCFCE7", color: "#166534", padding: "3px 8px", borderRadius: 4, fontWeight: 800 }}>
                        ✓ COMPLETED & DISPATCHED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Booking Modal */}
      {bookingModalOpen && (
        <TelehealthBookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
