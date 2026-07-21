import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Input, Select, StatusPill, Toast, Skeleton } from "../../ui/components";

export default function OrderCatalog() {
  const { id: patientId } = useParams<{ id: string }>();
  const { token } = useAuth();
  const qc = useQueryClient();

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<any>(null);
  const [priority, setPriority] = useState("ROUTINE");

  // Fetch Patient Summary
  const { data: summary } = useQuery({
    queryKey: ["patientSummary", patientId],
    queryFn: () => api.getPatientSummary(token, patientId || ""),
    enabled: !!patientId,
  });

  // Fetch Active Orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", patientId],
    queryFn: () => api.getOrders(token, patientId || ""),
    enabled: !!patientId,
  });

  // Search catalog items mutation or query
  const searchCatalog = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length >= 2) {
      const results = await api.listCatalogItems(token, q);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  // Place Order Mutation
  const placeOrderMutation = useMutation({
    mutationFn: () => {
      if (!selectedCatalogItem) throw new Error("No item selected");
      return api.createOrder(token, {
        patient_id: patientId || "",
        code: selectedCatalogItem.code,
        display: selectedCatalogItem.display,
        priority: priority,
        specimen: selectedCatalogItem.specimen,
        prep: selectedCatalogItem.prep,
      });
    },
    onSuccess: () => {
      triggerToast("Service order placed. Charges auto-captured to draft invoice.");
      setSelectedCatalogItem(null);
      setSearchQuery("");
      setSearchResults([]);
      qc.invalidateQueries({ queryKey: ["orders", patientId] });
      qc.invalidateQueries({ queryKey: ["invoices", patientId] });
    },
    onError: () => {
      triggerToast("Failed to place service order.");
    },
  });

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatalogItem) return;
    placeOrderMutation.mutate();
  };

  const getStatusKind = (status: string) => {
    switch (status.toLowerCase()) {
      case "ordered": return "brand";
      case "collected": return "info";
      case "in-lab": return "warn";
      case "resulted": return "success";
      case "reviewed": return "success";
      default: return "brand";
    }
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Patient header link */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to={`/patients/${patientId}`} style={{ textDecoration: "none", color: "var(--indigo)", fontWeight: 700 }}>
          ← Return to clinical dashboard
        </Link>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--indigo)", margin: 0 }}>
          Service & Diagnostics Catalog Order
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: 20, alignItems: "start" }}>
        {/* Left Side: Order Composer */}
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
            Compose New Lab/Imaging Order
          </h3>

          <form onSubmit={handlePlaceOrder} style={{ display: "grid", gap: 14 }}>
            {/* Catalog search field */}
            <div style={{ position: "relative" }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                Search Diagnostics Catalog (LOINC mapped)
              </label>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => searchCatalog(e.target.value)}
                placeholder="Type 'CT', 'TSH', 'Blood'..."
                required={!selectedCatalogItem}
              />

              {searchResults.length > 0 && searchQuery.length >= 2 && (
                <div style={{ position: "absolute", background: "#fff", border: "1px solid var(--line)", borderRadius: "10px", width: "100%", zIndex: 10, boxShadow: "var(--shadow-pop)", maxHeight: 180, overflowY: "auto" }}>
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedCatalogItem(item);
                        setSearchQuery(item.display);
                        setSearchResults([]);
                      }}
                      style={{ padding: "10px 14px", borderBottom: "1px solid var(--wash-b)", cursor: "pointer", fontSize: 13.5 }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "var(--wash-a)")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
                    >
                      <strong>{item.display}</strong>
                      <span style={{ display: "block", fontSize: 11, color: "var(--slate)" }}>
                        LOINC: {item.code} · Specimen: {item.specimen}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected catalog item details */}
            {selectedCatalogItem && (
              <div style={{ background: "var(--wash-a)", padding: 14, borderRadius: "14px", border: "1px solid var(--line)", display: "grid", gap: 10 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block" }}>LOINC Code</span>
                  <strong style={{ fontSize: 13.5, color: "var(--indigo)" }}>{selectedCatalogItem.code}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block" }}>Specimen Type</span>
                  <span style={{ fontSize: 13.5 }}>{selectedCatalogItem.specimen}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", display: "block" }}>Preparation / Instructions</span>
                  <span style={{ fontSize: 13, color: "var(--orange)", fontWeight: 600 }}>{selectedCatalogItem.prep}</span>
                </div>
              </div>
            )}

            {/* Priority selection */}
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                Order Clinical Priority
              </label>
              <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="ROUTINE">Routine (సాధారణం)</option>
                <option value="URGENT">Urgent / Stat (అత్యవసరం)</option>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={!selectedCatalogItem || placeOrderMutation.isPending}
              style={{ width: "100%", marginTop: 10 }}
            >
              {placeOrderMutation.isPending ? "Placing Order..." : "Place Diagnostics Order"}
            </Button>
          </form>
        </Card>

        {/* Right Side: Active Orders lifecycle tracking */}
        <Card>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
            Diagnostics Order History & Tracking
          </h3>

          {ordersLoading ? (
            <Skeleton height={140} />
          ) : orders.length === 0 ? (
            <p style={{ fontStyle: "italic", fontSize: 14, color: "var(--slate)", textAlign: "center", padding: "20px 0" }}>
              No active diagnostics orders registered.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {orders.map((o: any) => (
                <div
                  key={o.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderRadius: "14px",
                    border: "1px solid var(--line)",
                    background: "#fff",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 14.5, color: "var(--ink)", display: "block" }}>
                      {o.display}
                    </strong>
                    <span style={{ fontSize: 12, color: "var(--slate)" }}>
                      LOINC: {o.code} · Priority:{" "}
                      <span style={{ color: o.priority === "URGENT" ? "var(--danger)" : "var(--slate)", fontWeight: 700 }}>
                        {o.priority}
                      </span>
                    </span>
                    <span style={{ display: "block", fontSize: 11.5, color: "var(--slate)", marginTop: 4 }}>
                      Date: {new Date(o.created_at).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <StatusPill kind={getStatusKind(o.status)}>
                      {o.status.toUpperCase()}
                    </StatusPill>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
