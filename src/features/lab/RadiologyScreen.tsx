import React, { useState } from "react";
import { Card, Button, StatusPill, Select, Input, Modal } from "../../ui/components";
import { formatRupees } from "../../ui/helpers";

interface ModalityOrder {
  id: string;
  uhid: string;
  patientName: string;
  ageGender: string;
  modality: "X-Ray" | "CT Scan" | "MRI" | "Ultrasound (USG)" | "2D Echo";
  procedureName: string;
  referringDoctor: string;
  orderTime: string;
  status: "Ordered" | "In-Progress" | "Acquired" | "Report Verified";
  priority: "STAT" | "Routine" | "Urgent";
  radiologistNotes?: string;
  imageUrl?: string;
}

export default function RadiologyScreen() {
  const [selectedModality, setSelectedModality] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<ModalityOrder | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const [orders, setOrders] = useState<ModalityOrder[]>([
    {
      id: "RAD-2026-081",
      uhid: "PAT-00104",
      patientName: "Venkata Rao",
      ageGender: "58y / Male",
      modality: "X-Ray",
      procedureName: "Chest X-Ray (PA View)",
      referringDoctor: "Dr. K R Murali (General Medicine)",
      orderTime: "10:15 AM Today",
      status: "Report Verified",
      priority: "Routine",
      radiologistNotes: "Normal cardiac silhouette. No focal lung consolidation, pneumothorax, or pleural effusion noted. Bony cage intact.",
    },
    {
      id: "RAD-2026-082",
      uhid: "PAT-00118",
      patientName: "Lakshmi Devi",
      ageGender: "46y / Female",
      modality: "Ultrasound (USG)",
      procedureName: "USG Abdomen & Pelvis Complete",
      referringDoctor: "Dr. P. Swathi (Gastroenterology)",
      orderTime: "11:30 AM Today",
      status: "In-Progress",
      priority: "Urgent",
      radiologistNotes: "Patient prepared and scanned in USG Suite 2. Preliminary findings show mild fatty liver (Grade 1). Gallbladder unremarkable.",
    },
    {
      id: "RAD-2026-083",
      uhid: "PAT-00122",
      patientName: "UNKNOWN MALE #9021",
      ageGender: "32y / Male",
      modality: "CT Scan",
      procedureName: "NCCT Brain & Cervical Spine",
      referringDoctor: "Casualty Medical Officer (Emergency)",
      orderTime: "11:55 AM Today",
      status: "Acquired",
      priority: "STAT",
      radiologistNotes: "Trauma protocol CT acquired. No acute intracranial hemorrhage or midline shift. Minimal soft tissue swelling over left parieto-temporal region.",
    },
    {
      id: "RAD-2026-084",
      uhid: "PAT-00095",
      patientName: "Rajesh Kumar",
      ageGender: "42y / Male",
      modality: "MRI",
      procedureName: "MRI Lumbar Spine with Screening Whole Spine",
      referringDoctor: "Dr. S. R. Reddy (Orthopedics)",
      orderTime: "12:10 PM Today",
      status: "Ordered",
      priority: "Routine",
      radiologistNotes: "Scheduled for MRI Suite at 2:30 PM. Fasting verified.",
    },
  ]);

  const filteredOrders = orders.filter((o) => {
    const matchesModality = selectedModality === "all" || o.modality.toLowerCase().includes(selectedModality.toLowerCase());
    const matchesSearch =
      o.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.procedureName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModality && matchesSearch;
  });

  const handleUpdateStatus = (id: string, newStatus: ModalityOrder["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 1140, margin: "0 auto" }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          borderRadius: 14,
          padding: "22px 28px",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.25)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 24 }}>⚛️</span>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)" }}>
              Radiology & PACS Imaging Workstation
            </h1>
            <span style={{ background: "rgba(255,255,255,0.15)", padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700 }}>
              Digital Modality Worklist
            </span>
          </div>
          <p style={{ margin: 0, opacity: 0.9, fontSize: 13.5, maxWidth: 640 }}>
            Manage diagnostic radiology requisitions, digital imaging studies (X-Ray, CT, MRI, Ultrasound), and authorized radiologist verification.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "8px 14px", borderRadius: 8, fontSize: 12.5, textAlign: "right" }}>
            <div style={{ fontWeight: 800 }}>PACS Server: ONLINE</div>
            <div style={{ opacity: 0.8, fontSize: 11 }}>DICOM 3.0 Protocol Ready</div>
          </div>
        </div>
      </div>

      {/* KPI Header */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <Card style={{ padding: "14px 18px", borderLeft: "4px solid var(--indigo)" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Today's Orders</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>{orders.length}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Studies</span>
          </div>
        </Card>

        <Card style={{ padding: "14px 18px", borderLeft: "4px solid #DC2626" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>STAT Trauma CT/X-Ray</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#DC2626" }}>1</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Priority</span>
          </div>
        </Card>

        <Card style={{ padding: "14px 18px", borderLeft: "4px solid #F59E0B" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>In Acquisition</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#F59E0B" }}>1</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Active Scan</span>
          </div>
        </Card>

        <Card style={{ padding: "14px 18px", borderLeft: "4px solid #16A34A" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Reports Verified</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#16A34A" }}>1</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Signed Off</span>
          </div>
        </Card>
      </div>

      {/* Main Roster Card */}
      <Card style={{ borderRadius: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 10, flex: 1, minWidth: 260 }}>
            <Input
              placeholder="Search by patient, UHID, or procedure..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", maxWidth: 360 }}
            />
            <Select
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              style={{ width: 160 }}
            >
              <option value="all">All Modalities</option>
              <option value="x-ray">X-Ray (Plain)</option>
              <option value="ct">CT Scan</option>
              <option value="mri">MRI</option>
              <option value="usg">Ultrasound</option>
            </Select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Order ID / Time</th>
                <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Patient Details</th>
                <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Modality & Procedure</th>
                <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Priority</th>
                <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Status</th>
                <th style={{ textAlign: "right", padding: "10px 14px", color: "var(--slate)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <strong style={{ color: "var(--indigo)", fontFamily: "monospace", display: "block" }}>{o.id}</strong>
                    <span style={{ fontSize: 11.5, color: "var(--slate)" }}>{o.orderTime}</span>
                  </td>

                  <td style={{ padding: "12px 14px" }}>
                    <strong style={{ color: "var(--ink)", display: "block" }}>{o.patientName}</strong>
                    <span style={{ fontSize: 11.5, color: "var(--slate)" }}>
                      {o.ageGender} · <span style={{ fontFamily: "monospace" }}>{o.uhid}</span>
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ background: "var(--indigo-soft)", color: "var(--indigo)", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                        {o.modality}
                      </span>
                      <strong style={{ fontSize: 13, color: "var(--ink)" }}>{o.procedureName}</strong>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--slate)", marginTop: 2, display: "block" }}>
                      Ref: {o.referringDoctor}
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <StatusPill kind={o.priority === "STAT" ? "danger" : o.priority === "Urgent" ? "warn" : "brand"}>
                      {o.priority}
                    </StatusPill>
                  </td>

                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <StatusPill kind={o.status === "Report Verified" ? "success" : o.status === "Acquired" ? "cyan" : o.status === "In-Progress" ? "warn" : "brand"}>
                      {o.status}
                    </StatusPill>
                  </td>

                  <td style={{ padding: "12px 14px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 8 }}>
                      <Button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(o);
                          setShowReportModal(true);
                        }}
                        style={{ fontSize: 12, padding: "6px 12px" }}
                      >
                        📄 {o.status === "Report Verified" ? "View Report" : "Enter Report"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Report Modal */}
      {showReportModal && selectedOrder && (
        <Modal
          isOpen={showReportModal}
          title={`Radiology Report: ${selectedOrder.procedureName}`}
          onClose={() => setShowReportModal(false)}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ background: "var(--wash-a)", padding: 14, borderRadius: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12.5 }}>
              <div><strong>Patient:</strong> {selectedOrder.patientName} ({selectedOrder.ageGender})</div>
              <div><strong>UHID:</strong> {selectedOrder.uhid}</div>
              <div><strong>Modality:</strong> {selectedOrder.modality}</div>
              <div><strong>Referring Doctor:</strong> {selectedOrder.referringDoctor}</div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", display: "block", marginBottom: 6 }}>
                Radiological Findings & Impression:
              </label>
              <textarea
                value={selectedOrder.radiologistNotes || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedOrder({ ...selectedOrder, radiologistNotes: val });
                }}
                rows={5}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid var(--line)",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                }}
                placeholder="Enter radiological observations, impression, and diagnostic sign-off..."
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <Button ghost type="button" onClick={() => setShowReportModal(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  handleUpdateStatus(selectedOrder.id, "Report Verified");
                  setShowReportModal(false);
                }}
              >
                ✅ Verify & Sign Digital Report
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
