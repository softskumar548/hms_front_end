import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Link } from "react-router-dom";

interface ChamberDisplayData {
  chamberId: string;
  chamberName: string;
  doctorName: string;
  specialty: string;
  currentToken: string;
  patientName: string;
  status: "CALLING" | "IN_CONSULTATION" | "AVAILABLE" | "ON_BREAK";
  nextTokens: string[];
  lastCalledAt?: number;
}

const initialChambers: ChamberDisplayData[] = [
  {
    chamberId: "101",
    chamberName: "Chamber 101",
    doctorName: "Dr. K R Murali (Dean)",
    specialty: "General Medicine",
    currentToken: "T-101",
    patientName: "Venkata Rama Rao",
    status: "IN_CONSULTATION",
    nextTokens: ["T-106", "T-111", "T-117"],
  },
  {
    chamberId: "102",
    chamberName: "Chamber 102",
    doctorName: "Dr. Sreenivasulu",
    specialty: "Cardiology",
    currentToken: "T-104",
    patientName: "Sita Devi",
    status: "CALLING",
    nextTokens: ["T-108", "T-114"],
    lastCalledAt: Date.now(),
  },
  {
    chamberId: "103",
    chamberName: "Chamber 103",
    doctorName: "Dr. V Ramana",
    specialty: "Orthopedics",
    currentToken: "T-102",
    patientName: "Ramesh Babu",
    status: "IN_CONSULTATION",
    nextTokens: ["T-107", "T-112"],
  },
  {
    chamberId: "104",
    chamberName: "Chamber 104",
    doctorName: "Dr. Ananya Reddy",
    specialty: "Pediatrics",
    currentToken: "T-105",
    patientName: "Baby Aaradhya",
    status: "CALLING",
    nextTokens: ["T-109", "T-115"],
    lastCalledAt: Date.now() - 5000,
  },
  {
    chamberId: "105",
    chamberName: "Chamber 105",
    doctorName: "Dr. Shanti Kumari",
    specialty: "Obstetrics & Gynaecology",
    currentToken: "T-103",
    patientName: "Lakshmi Prasanna",
    status: "IN_CONSULTATION",
    nextTokens: ["T-110", "T-116"],
  },
  {
    chamberId: "106",
    chamberName: "Chamber 106",
    doctorName: "Dr. K. Venkateswarlu",
    specialty: "General & Laparoscopic Surgery",
    currentToken: "—",
    patientName: "Waiting for next patient",
    status: "AVAILABLE",
    nextTokens: ["T-113", "T-118"],
  },
];

const marqueeAnnouncements = [
  "🏥 Welcome to ZEN CLINIC Outpatient Center · Please keep your token slips ready · PMJAY / Dr. YSR Aarogyasri 100% Cashless Helpdesk is available at Counter No. 3",
  "🩺 Free Comprehensive Cardiac & Diabetic Health Screening Camp this Sunday from 09:00 AM to 02:00 PM at Main Auditorium",
  "🚨 24/7 Emergency Casualty & Critical Ambulance Care: Call 0891-2548900 / Toll Free 108",
  "💊 In-house 24/7 Pharmacy & Diagnostic Sample Collection available at Ground Floor Wing B",
  "📱 ABDM ABHA Card creation & QR Code scan check-in enabled at Reception Self-Kiosks",
];

// Synthesize 2-Tone Polyphonic Hospital Chime via Web Audio API
function playHospitalChime(volume: number = 0.8) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;

    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(volume * 0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.8);

    // Tone 2: 880.00 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.0, now + 0.35);
    gain2.gain.setValueAtTime(volume * 0.5, now + 0.35);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.35);
    osc2.stop(now + 1.2);
  } catch (err) {
    console.warn("AudioContext error:", err);
  }
}

// Speak token callout via Web Speech API
function speakTokenAnnouncement(
  tokenNumber: string,
  chamberName: string,
  doctorName: string,
  specialty: string,
  patientName: string,
  langMode: "bilingual" | "english" | "telugu" = "bilingual",
  muted: boolean = false
) {
  if (muted || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel(); // Stop any pending speech

  const cleanToken = tokenNumber.replace("-", " ");

  const englishText = `Token ${cleanToken}, please proceed to ${chamberName}, ${doctorName}, ${specialty}.`;
  const teluguText = `టోకెన్ ${cleanToken}, దయచేసి ${chamberName}, ${specialty} వద్దకు వెళ్ళండి.`;

  const voices = window.speechSynthesis.getVoices();
  const teluguVoice = voices.find((v) => v.lang.includes("te") || v.lang.includes("tel"));
  const englishVoice = voices.find((v) => v.lang.includes("en-IN") || v.lang.includes("en-GB") || v.lang.includes("en"));

  if (langMode === "english" || langMode === "bilingual") {
    const enUtterance = new SpeechSynthesisUtterance(englishText);
    enUtterance.rate = 0.92;
    enUtterance.pitch = 1.05;
    if (englishVoice) enUtterance.voice = englishVoice;

    if (langMode === "bilingual") {
      enUtterance.onend = () => {
        setTimeout(() => {
          const teUtterance = new SpeechSynthesisUtterance(teluguText);
          teUtterance.rate = 0.9;
          if (teluguVoice) teUtterance.voice = teluguVoice;
          window.speechSynthesis.speak(teUtterance);
        }, 300);
      };
    }
    window.speechSynthesis.speak(enUtterance);
  } else if (langMode === "telugu") {
    const teUtterance = new SpeechSynthesisUtterance(teluguText);
    teUtterance.rate = 0.9;
    if (teluguVoice) teUtterance.voice = teluguVoice;
    window.speechSynthesis.speak(teUtterance);
  }
}

export function QueueDisplayScreen() {
  const { tenant } = useAuth();

  const [chambers, setChambers] = useState<ChamberDisplayData[]>(initialChambers);
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [announcementLang, setAnnouncementLang] = useState<"bilingual" | "english" | "telugu">("bilingual");
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControlDrawer, setShowControlDrawer] = useState(false);
  const [recentlyCalledChamber, setRecentlyCalledChamber] = useState<string | null>("102");

  // Real-time ticking digital clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Call Next Token for a specific Chamber
  const handleCallNextToken = (chamberId: string) => {
    setChambers((prev) =>
      prev.map((c) => {
        if (c.chamberId === chamberId) {
          const nextToken = c.nextTokens[0] || `T-${Math.floor(Math.random() * 80 + 120)}`;
          const remainingNext = c.nextTokens.slice(1);
          if (remainingNext.length === 0) {
            remainingNext.push(`T-${Number(nextToken.replace("T-", "")) + 5}`);
          }

          const updated = {
            ...c,
            currentToken: nextToken,
            status: "CALLING" as const,
            nextTokens: remainingNext,
            lastCalledAt: Date.now(),
          };

          setRecentlyCalledChamber(chamberId);

          if (!isMuted) {
            playHospitalChime(0.8);
            setTimeout(() => {
              speakTokenAnnouncement(
                updated.currentToken,
                updated.chamberName,
                updated.doctorName,
                updated.specialty,
                updated.patientName,
                announcementLang,
                isMuted
              );
            }, 600);
          }

          return updated;
        }
        return c;
      })
    );
  };

  // Re-announce current token
  const handleReannounce = (chamber: ChamberDisplayData) => {
    if (chamber.currentToken === "—") return;
    setRecentlyCalledChamber(chamber.chamberId);
    if (!isMuted) {
      playHospitalChime(0.8);
      setTimeout(() => {
        speakTokenAnnouncement(
          chamber.currentToken,
          chamber.chamberName,
          chamber.doctorName,
          chamber.specialty,
          chamber.patientName,
          announcementLang,
          isMuted
        );
      }, 600);
    }
  };

  // Set chamber status
  const handleSetChamberStatus = (chamberId: string, status: ChamberDisplayData["status"]) => {
    setChambers((prev) =>
      prev.map((c) => (c.chamberId === chamberId ? { ...c, status } : c))
    );
  };

  const isDark = themeMode === "dark";

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isDark
          ? "radial-gradient(ellipse at top, #0D1B2A 0%, #080D1A 100%)"
          : "linear-gradient(135deg, #F0F4F8 0%, #E2E8F0 100%)",
        color: isDark ? "#FFFFFF" : "#1E293B",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "0",
        margin: "0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* 1. TOP HEADER BAR FOR TV SCREENS */}
      <header
        style={{
          background: isDark ? "rgba(13, 27, 42, 0.95)" : "#FFFFFF",
          borderBottom: isDark ? "2px solid #1E3A8A" : "2px solid #CBD5E1",
          padding: "14px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 14px rgba(0,0,0,0.06)",
          zIndex: 10,
        }}
      >
        {/* Left Hospital Logo & Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #00BCD4 0%, #131A8F 100%)",
              display: "grid",
              placeItems: "center",
              fontSize: 26,
              boxShadow: "0 4px 12px rgba(0, 188, 212, 0.35)",
            }}
          >
            🏥
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 900,
                letterSpacing: "0.03em",
                color: isDark ? "#38BDF8" : "#131A8F",
                textTransform: "uppercase",
              }}
            >
              {tenant ? `${tenant.replace("_", " ")} HOSPITAL` : "ZEN CLINIC"}
            </h1>
            <span style={{ fontSize: 13, color: isDark ? "#94A3B8" : "#64748B", fontWeight: 600 }}>
              OUTPATIENT WAITING LOUNGE & TOKEN CALLING DISPLAY
            </span>
          </div>
        </div>

        {/* Center Calling Banner (Active Flash) */}
        {recentlyCalledChamber && (
          <div
            style={{
              background: isDark ? "rgba(56, 189, 248, 0.15)" : "#E0F2FE",
              border: "2px solid #0284C7",
              borderRadius: 30,
              padding: "6px 22px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              animation: "pulse 2s infinite",
            }}
          >
            <span style={{ fontSize: 16 }}>🔔</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: isDark ? "#38BDF8" : "#0369A1" }}>
              NOW CALLING IN CHAMBER {recentlyCalledChamber}
            </span>
          </div>
        )}

        {/* Right Live Clock & TV Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Digital Clock */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                fontFamily: "'Courier New', Courier, monospace",
                color: isDark ? "#F8FAFC" : "#0F172A",
                letterSpacing: "0.08em",
              }}
            >
              {formatTime(currentDateTime)}
            </div>
            <div style={{ fontSize: 12, color: isDark ? "#94A3B8" : "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
              {formatDate(currentDateTime)}
            </div>
          </div>

          {/* Quick TV Control Buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              title="Toggle Dark / Light TV Theme"
              onClick={() => setThemeMode(isDark ? "light" : "dark")}
              style={{
                background: isDark ? "#1E293B" : "#F1F5F9",
                border: "1px solid " + (isDark ? "#334155" : "#CBD5E1"),
                color: isDark ? "#F8FAFC" : "#0F172A",
                borderRadius: 8,
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>

            <button
              type="button"
              title="Toggle Fullscreen Mode"
              onClick={toggleFullscreen}
              style={{
                background: isDark ? "#1E293B" : "#F1F5F9",
                border: "1px solid " + (isDark ? "#334155" : "#CBD5E1"),
                color: isDark ? "#F8FAFC" : "#0F172A",
                borderRadius: 8,
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {isFullscreen ? "🪟 Exit Full" : "⛶ Fullscreen"}
            </button>

            <button
              type="button"
              title="Open Token Call Console"
              onClick={() => setShowControlDrawer(!showControlDrawer)}
              style={{
                background: "linear-gradient(135deg, #0284C7 0%, #131A8F 100%)",
                border: "none",
                color: "#FFFFFF",
                borderRadius: 8,
                padding: "8px 14px",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 800,
                boxShadow: "0 2px 8px rgba(2, 132, 199, 0.4)",
              }}
            >
              ⚙️ Call Console
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN ACTIVE CHAMBERS CALLING MATRIX */}
      <main
        style={{
          flex: 1,
          padding: "24px 32px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 20,
          alignContent: "start",
          overflowY: "auto",
        }}
      >
        {chambers.map((ch) => {
          const isCalling = ch.status === "CALLING";
          const isInConsult = ch.status === "IN_CONSULTATION";
          const isAvailable = ch.status === "AVAILABLE";
          const isOnBreak = ch.status === "ON_BREAK";

          return (
            <div
              key={ch.chamberId}
              style={{
                background: isDark
                  ? isCalling
                    ? "linear-gradient(145deg, #1E3A8A 0%, #0F172A 100%)"
                    : "#111827"
                  : isCalling
                  ? "#EFF6FF"
                  : "#FFFFFF",
                borderRadius: 20,
                border: isCalling
                  ? "3px solid #38BDF8"
                  : isDark
                  ? "2px solid #1F2937"
                  : "2px solid #E2E8F0",
                padding: "20px 24px",
                boxShadow: isCalling
                  ? isDark
                    ? "0 0 30px rgba(56, 189, 248, 0.35)"
                    : "0 8px 25px rgba(2, 132, 199, 0.25)"
                  : "0 4px 12px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.3s ease",
                position: "relative",
              }}
            >
              {/* Top Row: Chamber Badge & Status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      background: isDark ? "#1E293B" : "#F1F5F9",
                      color: isDark ? "#38BDF8" : "#131A8F",
                      padding: "6px 14px",
                      borderRadius: 12,
                      fontSize: 16,
                      fontWeight: 900,
                      letterSpacing: "0.04em",
                    }}
                  >
                    📍 {ch.chamberName.toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? "#94A3B8" : "#64748B" }}>
                    {ch.specialty}
                  </span>
                </div>

                {/* Status Pill */}
                <div
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    background: isCalling
                      ? "#38BDF8"
                      : isInConsult
                      ? "#F59E0B"
                      : isAvailable
                      ? "#10B981"
                      : "#6B7280",
                    color: isCalling ? "#0F172A" : "#FFFFFF",
                    boxShadow: isCalling ? "0 0 12px #38BDF8" : "none",
                  }}
                >
                  {isCalling ? "🔔 CALLING NOW" : isInConsult ? "🩺 IN CONSULT" : isAvailable ? "🟢 AVAILABLE" : "☕ ON BREAK"}
                </div>
              </div>

              {/* Doctor Details */}
              <div style={{ marginBottom: 16 }}>
                <strong style={{ fontSize: 16, color: isDark ? "#F8FAFC" : "#0F172A", display: "block" }}>
                  {ch.doctorName}
                </strong>
              </div>

              {/* Big Impact Current Token Calling Box */}
              <div
                style={{
                  background: isDark ? "rgba(0, 0, 0, 0.4)" : "var(--wash-a, #F8FAFC)",
                  borderRadius: 16,
                  border: isCalling ? "2px dashed #38BDF8" : "1px solid " + (isDark ? "#374151" : "#CBD5E1"),
                  padding: "16px 20px",
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: isDark ? "#94A3B8" : "#64748B", textTransform: "uppercase", display: "block" }}>
                  {isCalling ? "PROCEED TO CHAMBER" : "CURRENTLY CONSULTING"}
                </span>

                <div
                  style={{
                    fontSize: 52,
                    fontWeight: 900,
                    fontFamily: "'Baloo 2', Impact, sans-serif",
                    color: isCalling
                      ? "#38BDF8"
                      : isInConsult
                      ? isDark
                        ? "#F8FAFC"
                        : "#131A8F"
                      : "#9CA3AF",
                    letterSpacing: "0.04em",
                    margin: "4px 0",
                    lineHeight: 1.1,
                  }}
                >
                  {ch.currentToken}
                </div>

                <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? "#CBD5E1" : "#334155" }}>
                  {ch.patientName}
                </div>
              </div>

              {/* Bottom: Next Upcoming Tokens List */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: isDark ? "#1F2937" : "#F1F5F9",
                  padding: "10px 14px",
                  borderRadius: 12,
                  fontSize: 12.5,
                }}
              >
                <span style={{ fontWeight: 700, color: isDark ? "#94A3B8" : "#64748B" }}>
                  Next in Queue:
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  {ch.nextTokens.length > 0 ? (
                    ch.nextTokens.map((tk, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: isDark ? "#374151" : "#E2E8F0",
                          color: isDark ? "#F8FAFC" : "#0F172A",
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontWeight: 800,
                          fontFamily: "monospace",
                        }}
                      >
                        {tk}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: "#9CA3AF" }}>None</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* 3. MARQUEE ANNOUNCEMENT FOOTER TICKER */}
      <footer
        style={{
          background: isDark ? "#070B14" : "#131A8F",
          borderTop: isDark ? "2px solid #1E3A8A" : "2px solid #0A1166",
          padding: "12px 24px",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 -4px 16px rgba(0,0,0,0.3)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: "#00BCD4",
            color: "#0F172A",
            padding: "4px 14px",
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: 900,
            whiteSpace: "nowrap",
            letterSpacing: "0.04em",
          }}
        >
          📢 HOSPITAL NOTICES
        </div>

        {/* CSS Scrolling Marquee */}
        <div style={{ flex: 1, overflow: "hidden", whiteSpace: "nowrap", position: "relative" }}>
          <div
            style={{
              display: "inline-block",
              paddingLeft: "100%",
              animation: "marquee 45s linear infinite",
              fontSize: 14.5,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            {marqueeAnnouncements.join("  ·  ⭐  ·  ")}
          </div>
        </div>

        <Link
          to="/queue"
          style={{
            textDecoration: "none",
            color: "#38BDF8",
            fontSize: 12,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          ← Reception Queue
        </Link>
      </footer>

      {/* 4. FLOATING OPERATOR / NURSE TOKEN CALL CONTROL DRAWER */}
      {showControlDrawer && (
        <div
          style={{
            position: "fixed",
            bottom: 65,
            right: 24,
            width: 440,
            background: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: 20,
            border: isDark ? "2px solid #38BDF8" : "2px solid #131A8F",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            padding: "20px 24px",
            zIndex: 9999,
            color: isDark ? "#F8FAFC" : "#0F172A",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: isDark ? "#38BDF8" : "#131A8F" }}>
              📢 Token Calling Station Console
            </h3>
            <button
              type="button"
              onClick={() => setShowControlDrawer(false)}
              style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: isDark ? "#94A3B8" : "#64748B" }}
            >
              ✕
            </button>
          </div>

          {/* Audio Synthesizer Settings */}
          <div style={{ background: isDark ? "#0F172A" : "#F8FAFC", padding: 12, borderRadius: 12, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? "#94A3B8" : "#64748B" }}>
                VOICE SYNTHESIZER
              </span>
              <button
                type="button"
                onClick={() => {
                  playHospitalChime(0.8);
                  speakTokenAnnouncement("T-100", "Chamber 101", "Dr. Murali", "General Medicine", "Demo Patient", announcementLang, false);
                }}
                style={{
                  background: "#0284C7",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🔊 Test Chime & Voice
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: isDark ? "#94A3B8" : "#64748B", display: "block", marginBottom: 4 }}>Language</label>
                <select
                  value={announcementLang}
                  onChange={(e) => setAnnouncementLang(e.target.value as any)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid " + (isDark ? "#334155" : "#CBD5E1"),
                    background: isDark ? "#1E293B" : "#FFF",
                    color: isDark ? "#FFF" : "#000",
                    fontSize: 12,
                  }}
                >
                  <option value="bilingual">English + Telugu (Bilingual)</option>
                  <option value="english">English Only</option>
                  <option value="telugu">Telugu Only (తెలుగు)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, color: isDark ? "#94A3B8" : "#64748B", display: "block", marginBottom: 4 }}>Mute Audio</label>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid " + (isDark ? "#334155" : "#CBD5E1"),
                    background: isMuted ? "#DC2626" : isDark ? "#1E293B" : "#FFF",
                    color: isMuted ? "#FFF" : isDark ? "#FFF" : "#000",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {isMuted ? "🔇 Audio Muted" : "🔊 Sound Active"}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Matrix for Chambers */}
          <div style={{ display: "grid", gap: 8, maxHeight: 220, overflowY: "auto" }}>
            {chambers.map((ch) => (
              <div
                key={ch.chamberId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: isDark ? "#0F172A" : "#F1F5F9",
                  fontSize: 12.5,
                }}
              >
                <div>
                  <strong style={{ display: "block" }}>{ch.chamberName}</strong>
                  <span style={{ color: isDark ? "#94A3B8" : "#64748B", fontSize: 11 }}>
                    Token: <strong style={{ color: "#38BDF8" }}>{ch.currentToken}</strong>
                  </span>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => handleCallNextToken(ch.chamberId)}
                    style={{
                      background: "#10B981",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 10px",
                      fontSize: 11.5,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    🔔 Next
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReannounce(ch)}
                    style={{
                      background: "#0284C7",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 10px",
                      fontSize: 11.5,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    📢 Recall
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSetChamberStatus(
                        ch.chamberId,
                        ch.status === "ON_BREAK" ? "AVAILABLE" : "ON_BREAK"
                      )
                    }
                    style={{
                      background: ch.status === "ON_BREAK" ? "#F59E0B" : isDark ? "#374151" : "#E2E8F0",
                      color: ch.status === "ON_BREAK" ? "#FFF" : isDark ? "#FFF" : "#000",
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 8px",
                      fontSize: 11.5,
                      cursor: "pointer",
                    }}
                  >
                    ☕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Embedded Marquee Animation CSS */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.03); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
export default QueueDisplayScreen;
