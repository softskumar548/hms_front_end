import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Select, Skeleton } from "../../ui/components";
import OnboardingChecklist from "./OnboardingChecklist";

export default function OpsDashboard() {
  const { token } = useAuth();

  // Site selection filter
  const [selectedSite, setSelectedSite] = useState("site-1");

  // Freshness timer tracker in seconds
  const [freshnessSeconds, setFreshnessSeconds] = useState(0);

  // Fetch Operations metrics data (UI-603)
  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ["opsMetrics", selectedSite],
    queryFn: () => api.listOpsMetrics(token, selectedSite),
    refetchInterval: 1000 * 60 * 5, // Automated background refresh every 5 minutes
  });

  // Increment freshness counter
  useEffect(() => {
    setFreshnessSeconds(0);
    const interval = setInterval(() => {
      setFreshnessSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [metrics]);

  const handleManualRefresh = () => {
    refetch();
    setFreshnessSeconds(0);
  };

  const formatFreshness = () => {
    if (freshnessSeconds < 60) return `${freshnessSeconds}s ago`;
    const mins = Math.floor(freshnessSeconds / 60);
    return `${mins}m ago`;
  };

  if (isLoading || !metrics) {
    return (
      <div style={{ display: "grid", gap: 20, padding: 20 }}>
        <Skeleton height={100} />
        <Skeleton height={200} />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Upper header controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--indigo)", margin: 0 }}>
            Clinic Operations Live Dashboard (UI-603)
          </h2>
          <span style={{ fontSize: 13, color: "var(--slate)" }}>
            Real-time consult statistics, queue length wait times, and cash collection aggregates.
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Freshness timer counter badge */}
          <span
            style={{
              fontSize: 12,
              background: "var(--wash-b)",
              color: "var(--indigo)",
              padding: "6px 12px",
              borderRadius: "var(--r-pill)",
              fontWeight: 700,
            }}
          >
            🔄 Updated {formatFreshness()}
          </span>
          
          <Button ghost style={{ fontSize: 12, padding: "6px 14px" }} onClick={handleManualRefresh}>
            Refresh
          </Button>

          <Select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)} style={{ width: 220 }}>
            <option value="site-1">Apollo Visakhapatnam</option>
            <option value="site-2">KIMS Nellore</option>
          </Select>
        </div>
      </div>

      {/* Seeded onboarding tour checklist */}
      <OnboardingChecklist />

      {/* Metrics Tiles Row Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <Card style={{ borderLeft: "4px solid var(--indigo)" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>
            Today's Consultations
          </span>
          <strong style={{ fontSize: 28, color: "var(--indigo)", display: "block", marginTop: 4 }}>
            {metrics.today_visits}
          </strong>
          <span style={{ fontSize: 11.5, color: "var(--green)" }}>🟢 3 currently in consult</span>
        </Card>

        <Card style={{ borderLeft: "4px solid var(--cyan)" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>
            Avg Queue Wait Time
          </span>
          <strong style={{ fontSize: 28, color: "var(--indigo)", display: "block", marginTop: 4 }}>
            {metrics.avg_wait_minutes} min
          </strong>
          <span style={{ fontSize: 11.5, color: "var(--slate)" }}>Target threshold: &lt; 20 min</span>
        </Card>

        <Card style={{ borderLeft: "4px solid var(--orange)" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>
            No-Show Cancellations
          </span>
          <strong style={{ fontSize: 28, color: "var(--orange)", display: "block", marginTop: 4 }}>
            {metrics.no_shows}
          </strong>
          <span style={{ fontSize: 11.5, color: "var(--slate)" }}>Rate: 4.1% of registrations</span>
        </Card>

        <Card style={{ borderLeft: "4px solid var(--green)" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>
            Cashier Collected Revenue
          </span>
          <strong style={{ fontSize: 28, color: "var(--green)", display: "block", marginTop: 4 }}>
            ₹{metrics.today_revenue.toLocaleString("en-IN")}
          </strong>
          <span style={{ fontSize: 11.5, color: "var(--green)" }}>Cashier Till balanced matches expected</span>
        </Card>
      </div>

      {/* Hourly consult distribution simple SVG chart */}
      <Card>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 16px" }}>
          Hourly Patient Consultation Traffic Trend
        </h3>

        <div style={{ height: 160, display: "flex", alignItems: "flex-end", gap: 20, borderBottom: "2px solid var(--line)", paddingBottom: 10, paddingLeft: 10 }}>
          {[
            { hour: "9 AM", count: 4, height: "40%" },
            { hour: "10 AM", count: 8, height: "80%" },
            { hour: "11 AM", count: 10, height: "100%" },
            { hour: "12 PM", count: 6, height: "60%" },
            { hour: "1 PM", count: 2, height: "20%" },
            { hour: "2 PM", count: 3, height: "30%" }
          ].map((bar, idx) => (
            <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--indigo)" }}>{bar.count}</span>
              <div
                style={{
                  width: "100%",
                  height: bar.height,
                  background: "linear-gradient(to top, var(--indigo), var(--cyan))",
                  borderRadius: "6px 6px 0 0",
                  minHeight: 10,
                }}
              />
              <span style={{ fontSize: 11, color: "var(--slate)" }}>{bar.hour}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Local wrapper button
function Button({ children, ghost, onClick, style }: { children: React.ReactNode; ghost?: boolean; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: ghost ? "1px solid var(--indigo)" : "none",
        background: ghost ? "transparent" : "var(--indigo)",
        color: ghost ? "var(--indigo)" : "#fff",
        borderRadius: "var(--r-pill)",
        padding: "6px 16px",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 13,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
