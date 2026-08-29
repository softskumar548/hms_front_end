import React, { useState } from "react";
import { Card, Button, StatusPill, Select, Input } from "../../ui/components";

interface FeedbackItem {
  id: string;
  patientName: string;
  uhid: string;
  date: string;
  visitType: "OPD Consultation" | "Inpatient Stay" | "Emergency Casualty" | "Diagnostic Lab";
  doctorName: string;
  overallRating: number; // 1-5
  categoryScores: {
    doctorCare: number;
    nursingCare: number;
    cleanliness: number;
    billingTransparency: number;
    waitingTime: number;
  };
  comments: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  status: "Resolved" | "Under Review" | "Action Required";
}

export default function PatientFeedbacksScreen() {
  const [filterSentiment, setFilterSentiment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
    {
      id: "FB-101",
      patientName: "K. Ramesh Babu",
      uhid: "PAT-00084",
      date: "Today, 11:20 AM",
      visitType: "OPD Consultation",
      doctorName: "Dr. K R Murali",
      overallRating: 5,
      categoryScores: { doctorCare: 5, nursingCare: 5, cleanliness: 5, billingTransparency: 5, waitingTime: 4 },
      comments: "Excellent consultation by Dr. Murali. The Telugu instructions on the prescription made it very easy for my mother to take medicines properly.",
      sentiment: "Positive",
      status: "Resolved",
    },
    {
      id: "FB-102",
      patientName: "S. Lakshmi",
      uhid: "PAT-00092",
      date: "Today, 10:45 AM",
      visitType: "Diagnostic Lab",
      doctorName: "Dr. A. Pathologist",
      overallRating: 4,
      categoryScores: { doctorCare: 4, nursingCare: 4, cleanliness: 5, billingTransparency: 4, waitingTime: 3 },
      comments: "Phlebotomy blood draw was very smooth and painless. Waiting time for test results was around 35 mins.",
      sentiment: "Positive",
      status: "Resolved",
    },
    {
      id: "FB-103",
      patientName: "V. Srinivas",
      uhid: "PAT-00103",
      date: "Yesterday",
      visitType: "Inpatient Stay",
      doctorName: "Dr. S. R. Reddy",
      overallRating: 2,
      categoryScores: { doctorCare: 4, nursingCare: 3, cleanliness: 2, billingTransparency: 3, waitingTime: 2 },
      comments: "AC in Ward Room 204 had intermittent cooling issue. Nursing staff was responsive but technician took 2 hours to fix.",
      sentiment: "Negative",
      status: "Under Review",
    },
    {
      id: "FB-104",
      patientName: "G. Anitha",
      uhid: "PAT-00115",
      date: "2 days ago",
      visitType: "OPD Consultation",
      doctorName: "Dr. P. Swathi",
      overallRating: 5,
      categoryScores: { doctorCare: 5, nursingCare: 4, cleanliness: 5, billingTransparency: 5, waitingTime: 5 },
      comments: "Very clean waiting lounge and fast token calling display. Cashier billing with UPI QR was instantaneous.",
      sentiment: "Positive",
      status: "Resolved",
    },
  ]);

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesSentiment = filterSentiment === "all" || fb.sentiment.toLowerCase() === filterSentiment.toLowerCase();
    const matchesSearch =
      fb.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.comments.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSentiment && matchesSearch;
  });

  const avgRating = (feedbacks.reduce((acc, f) => acc + f.overallRating, 0) / feedbacks.length).toFixed(1);
  const npsScore = "+78";

  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 1140, margin: "0 auto" }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--indigo-deep) 0%, var(--indigo) 100%)",
          borderRadius: 14,
          padding: "22px 28px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 4px 20px rgba(13, 92, 99, 0.2)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 24 }}>💬</span>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)" }}>
              Patient Experience & Feedbacks Desk
            </h1>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700 }}>
              Live CSAT / NPS
            </span>
          </div>
          <p style={{ margin: 0, opacity: 0.9, fontSize: 13.5, maxWidth: 640 }}>
            Real-time outpatient and inpatient feedback, Net Promoter Score (NPS), clinical service ratings, and patient grievance tracking.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ background: "rgba(255,255,255,0.15)", padding: "8px 16px", borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", opacity: 0.85 }}>Hospital NPS</div>
            <strong style={{ fontSize: 20 }}>{npsScore}</strong>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <Card style={{ padding: "14px 18px", borderLeft: "4px solid #16A34A" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Average CSAT</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#16A34A" }}>{avgRating} / 5.0</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>⭐ 92% Positive</span>
          </div>
        </Card>

        <Card style={{ padding: "14px 18px", borderLeft: "4px solid var(--indigo)" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Doctor Care Rating</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>4.8 / 5.0</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Clinical trust</span>
          </div>
        </Card>

        <Card style={{ padding: "14px 18px", borderLeft: "4px solid #0284C7" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Cleanliness & Hygiene</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#0284C7" }}>4.7 / 5.0</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Facility audits</span>
          </div>
        </Card>

        <Card style={{ padding: "14px 18px", borderLeft: "4px solid #F59E0B" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Grievances Pending</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#F59E0B" }}>1</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>In review</span>
          </div>
        </Card>
      </div>

      {/* Main Feedback List */}
      <Card style={{ borderRadius: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 10, flex: 1, minWidth: 260 }}>
            <Input
              placeholder="Search feedback by patient, UHID, or comment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", maxWidth: 360 }}
            />
            <Select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              style={{ width: 160 }}
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </Select>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {filteredFeedbacks.map((fb) => (
            <div
              key={fb.id}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: "16px 18px",
                background: "var(--wash-a)",
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: 14, color: "var(--ink)" }}>{fb.patientName}</strong>
                  <span style={{ fontSize: 12, color: "var(--slate)", marginLeft: 8 }}>
                    ({fb.uhid}) · {fb.visitType} · {fb.date}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#F59E0B", fontWeight: 800, fontSize: 14 }}>
                    {"⭐".repeat(fb.overallRating)}
                  </span>
                  <StatusPill kind={fb.sentiment === "Positive" ? "success" : fb.sentiment === "Negative" ? "danger" : "brand"}>
                    {fb.sentiment}
                  </StatusPill>
                  <StatusPill kind={fb.status === "Resolved" ? "success" : "warn"}>
                    {fb.status}
                  </StatusPill>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: 13, color: "var(--ink)", lineHeight: 1.4 }}>
                "{fb.comments}"
              </p>

              <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "var(--slate)", marginTop: 4 }}>
                <span>Doctor: <strong>{fb.categoryScores.doctorCare}/5</strong></span>
                <span>Nursing: <strong>{fb.categoryScores.nursingCare}/5</strong></span>
                <span>Cleanliness: <strong>{fb.categoryScores.cleanliness}/5</strong></span>
                <span>Billing: <strong>{fb.categoryScores.billingTransparency}/5</strong></span>
                <span>Wait Time: <strong>{fb.categoryScores.waitingTime}/5</strong></span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
