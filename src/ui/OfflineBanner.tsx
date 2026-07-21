import React, { useState, useEffect } from "react";

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div
        style={{
          background: "var(--orange)",
          color: "#fff",
          padding: "8px 16px",
          textAlign: "center",
          fontWeight: 700,
          fontSize: 13,
          position: "sticky",
          top: 0,
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <span>⚠️ Network Disconnected: running offline mock buffer. Progress will cache locally. (నెట్‌వర్క్ కనెక్షన్ లేదు)</span>
      </div>
    );
  }

  if (showRestored) {
    return (
      <div
        style={{
          background: "var(--green)",
          color: "#fff",
          padding: "8px 16px",
          textAlign: "center",
          fontWeight: 700,
          fontSize: 13,
          position: "sticky",
          top: 0,
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <span>✓ Connection restored. Syncing active queue changes...</span>
      </div>
    );
  }

  return null;
}
