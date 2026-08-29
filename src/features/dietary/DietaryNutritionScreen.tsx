import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { Card, Button, Input, Select, StatusPill, Toast } from "../../ui/components";
import DietPrescriptionModal from "./DietPrescriptionModal";
import MealTrayLabelModal from "./MealTrayLabelModal";

export interface InpatientDiet {
  id: string;
  patientName: string;
  patientUhid: string;
  bedLocation: string;
  dietCategory: string;
  macros: {
    calories: number;
    protein: number;
    fluidLimit: number;
  };
  feedingRoute: string;
  foodType: string;
  allergies: string;
  instructionsTe: string;
  prescribedDate: string;
  status: "ACTIVE" | "DISCHARGED";
  breakfast: "DELIVERED" | "PENDING";
  lunch: "DELIVERED" | "DISPATCHING" | "PENDING";
  snacks: "DELIVERED" | "PENDING";
  dinner: "DELIVERED" | "PENDING";
}

export default function DietaryNutritionScreen() {
  const { tenant } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "board"; // board, prescriptions, kitchen, labels

  const [diets, setDiets] = useState<InpatientDiet[]>(() => {
    const saved = localStorage.getItem(`hms-diet-orders-${tenant || "default"}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState("");

  const saveDiets = (nextDiets: InpatientDiet[]) => {
    setDiets(nextDiets);
    localStorage.setItem(`hms-diet-orders-${tenant || "default"}`, JSON.stringify(nextDiets));
  };

  // Modals state
  const [prescribeModalOpen, setPrescribeModalOpen] = useState(false);
  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const [selectedDietForLabel, setSelectedDietForLabel] = useState<InpatientDiet | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const handleTabChange = (tabKey: string) => {
    setSearchParams({ tab: tabKey });
  };

  // Metrics
  const activeDietsCount = diets.length;
  const dispatchingLunchCount = diets.filter((d) => d.lunch === "DISPATCHING").length;
  const enteralFeedsCount = diets.filter((d) => d.dietCategory === "ENTERAL_RYLES_TUBE").length;

  const filteredDiets = diets.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.patientName.toLowerCase().includes(q) ||
      d.patientUhid.toLowerCase().includes(q) ||
      d.bedLocation.toLowerCase().includes(q) ||
      d.dietCategory.toLowerCase().includes(q)
    );
  });

  // Action: Add new diet prescription
  const handlePrescribeSuccess = (newDiet: InpatientDiet) => {
    const next = [newDiet, ...diets];
    saveDiets(next);
    setPrescribeModalOpen(false);
    triggerToast(`Prescribed ${newDiet.dietCategory.replace(/_/g, " ")} for ${newDiet.patientName}.`);
  };

  // Action: Mark lunch delivered
  const handleMarkDelivered = (dietId: string) => {
    const next = diets.map((d) => (d.id === dietId ? { ...d, lunch: "DELIVERED" as const } : d));
    saveDiets(next);
    triggerToast("Lunch meal tray marked as DELIVERED to patient bedside.");
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
          <span style={{ fontSize: 18 }}>🥗</span>
          <span>Inpatient Dietary & Clinical Nutrition Workstation</span>
        </div>
        <div style={{ fontSize: 12, background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20 }}>
          {tenant ? `${tenant.replace("_", " ")} Dietary` : "ZEN CLINIC CATERING"} · HACCP Certified Kitchen · FSSAI License: 10126001982
        </div>
      </div>

      {/* 5 Top Dietary KPI Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <Card style={{ borderLeft: "4px solid #16A34A", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Total Meals Today</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#16A34A" }}>84</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Trays Scheduled</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid var(--indigo)", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Active Inpatient Diets</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>{activeDietsCount}</strong>
            <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>Customized Plans</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #F59E0B", padding: "14px 18px", background: "#FEFCE8" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#D97706", textTransform: "uppercase" }}>Lunch Dispatches</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#D97706" }}>{dispatchingLunchCount}</strong>
            <span style={{ fontSize: 12, color: "#B45309", fontWeight: 700 }}>In Transit Now</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #8B5CF6", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Enteral RT Feeds</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "#8B5CF6" }}>{enteralFeedsCount}</strong>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Liquid Tubes</span>
          </div>
        </Card>

        <Card style={{ borderLeft: "4px solid #00BCD4", padding: "14px 18px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--slate)", textTransform: "uppercase" }}>Dietitian Consults</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
            <strong style={{ fontSize: 24, color: "var(--indigo)" }}>8</strong>
            <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 700 }}>Completed</span>
          </div>
        </Card>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid var(--line)", paddingBottom: 6 }}>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { key: "board", label: "🥗 Meal Tray Delivery Board", count: activeDietsCount },
            { key: "prescriptions", label: "📝 Diet Prescriptions", count: activeDietsCount },
            { key: "kitchen", label: "🍳 Kitchen Batch Prep", count: "4 Menus" },
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
            onClick={() => setPrescribeModalOpen(true)}
            style={{ background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)", color: "#fff", fontWeight: 800, fontSize: 13, padding: "9px 18px" }}
          >
            📝 Prescribe Therapeutic Diet
          </Button>
        </div>
      </div>

      {/* TAB 1: MEAL TRAY DELIVERY BOARD */}
      {activeTab === "board" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                🥗 Inpatient Bed Meal Tray Delivery Board (Floors 1 to 4)
              </h3>
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                Track breakfast, lunch, evening snack, and dinner meal dispatch with 50×25mm thermal tray stickers
              </span>
            </div>

            <Input
              placeholder="Search by patient, bed, diet category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 280 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
            {filteredDiets.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "48px 24px", background: "var(--wash-a)", borderRadius: 14, border: "1px dashed var(--line)" }}>
                <span style={{ fontSize: 36, display: "block", marginBottom: 12 }}>🥗</span>
                <strong style={{ fontSize: 16, color: "var(--ink)", display: "block", marginBottom: 6 }}>
                  No Active Inpatient Meal Tray Orders
                </strong>
                <span style={{ fontSize: 13, color: "var(--slate)", maxWidth: 440, margin: "0 auto 18px", display: "block" }}>
                  Clinical diet prescriptions ordered for admitted patients across hospital wards will appear here for kitchen preparation and bedside delivery.
                </span>
                <Button type="button" onClick={() => setPrescribeModalOpen(true)} style={{ background: "linear-gradient(135deg, var(--indigo) 0%, var(--indigo-deep) 100%)", color: "#fff", fontWeight: 800 }}>
                  📝 Prescribe Clinical Diet Plan
                </Button>
              </div>
            ) : (
              filteredDiets.map((diet) => (
                <div
                  key={diet.id}
                  style={{
                    background: "var(--wash-a)",
                    border: "1.5px solid var(--line)",
                    borderRadius: 14,
                    padding: "16px 18px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    {/* Bed & Diet Badge Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <strong style={{ fontSize: 13, color: "var(--indigo)" }}>
                        🛏️ {diet.bedLocation}
                      </strong>
                      <span style={{ fontSize: 11, fontWeight: 900, background: diet.dietCategory === "DIABETIC" ? "#FEF3C7" : diet.dietCategory === "RENAL_LOW_SALT" ? "#EFF6FF" : "#DCFCE7", color: diet.dietCategory === "DIABETIC" ? "#B45309" : diet.dietCategory === "RENAL_LOW_SALT" ? "#1D4ED8" : "#166534", padding: "3px 8px", borderRadius: 6, textTransform: "uppercase" }}>
                        {diet.dietCategory.replace(/_/g, " ")}
                      </span>
                    </div>

                    <strong style={{ fontSize: 16, color: "var(--ink)", display: "block" }}>
                      {diet.patientName}
                    </strong>
                    <span style={{ fontSize: 12, color: "var(--slate)" }}>
                      {diet.patientUhid} · {diet.foodType} ({diet.feedingRoute.replace("_", " ")})
                    </span>

                    {/* Macros & Telugu Instructions */}
                    <div style={{ background: "#fff", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", margin: "10px 0", fontSize: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "var(--indigo)", marginBottom: 4 }}>
                        <span>🔥 {diet.macros.calories} kcal</span>
                        <span>🥩 {diet.macros.protein}g Protein</span>
                        <span>💧 {diet.macros.fluidLimit} mL Limit</span>
                      </div>
                      <span style={{ fontSize: 11.5, color: "#047857", fontWeight: 700, display: "block" }}>
                        తెలుగు: {diet.instructionsTe}
                      </span>
                    </div>

                    {/* 4-Meal Status Checkpoints */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, textAlign: "center", fontSize: 11, marginBottom: 12 }}>
                      <div style={{ background: "#DCFCE7", color: "#166534", padding: "4px 2px", borderRadius: 4, fontWeight: 700 }}>
                        ✓ Breakfast
                      </div>
                      <div style={{ background: diet.lunch === "DELIVERED" ? "#DCFCE7" : "#FEF3C7", color: diet.lunch === "DELIVERED" ? "#166534" : "#B45309", padding: "4px 2px", borderRadius: 4, fontWeight: 700 }}>
                        {diet.lunch === "DELIVERED" ? "✓ Lunch" : "🟡 Lunch In-Transit"}
                      </div>
                      <div style={{ background: "#F1F5F9", color: "#64748B", padding: "4px 2px", borderRadius: 4 }}>
                        ⏳ Snacks
                      </div>
                      <div style={{ background: "#F1F5F9", color: "#64748B", padding: "4px 2px", borderRadius: 4 }}>
                        ⏳ Dinner
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 8 }}>
                    {diet.lunch === "DISPATCHING" ? (
                      <Button
                        type="button"
                        onClick={() => handleMarkDelivered(diet.id)}
                        style={{ background: "#16A34A", color: "#fff", fontSize: 11.5, padding: "7px 10px", fontWeight: 800 }}
                      >
                        ✓ Mark Lunch Delivered
                      </Button>
                    ) : (
                      <span style={{ fontSize: 11.5, color: "#166534", fontWeight: 700, display: "flex", alignItems: "center" }}>
                        ✓ Lunch Delivered
                      </span>
                    )}

                    <Button
                      type="button"
                      ghost
                      onClick={() => {
                        setSelectedDietForLabel(diet);
                        setLabelModalOpen(true);
                      }}
                      style={{ fontSize: 11.5, padding: "7px 8px" }}
                    >
                      🏷️ Print Tray Label
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* TAB 2: DIET PRESCRIPTIONS TABLE */}
      {activeTab === "prescriptions" && (
        <Card style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 2px" }}>
                📝 Active Inpatient Clinical Diet Prescriptions
              </h3>
              <span style={{ fontSize: 12.5, color: "var(--slate)" }}>
                Nutritional plans prescribed by consulting physicians and clinical dietitians
              </span>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--wash-a)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Patient & UHID</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Bed Location</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Therapeutic Diet Plan</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Calories / Protein</th>
                  <th style={{ textAlign: "left", padding: "10px 14px", color: "var(--slate)" }}>Telugu Diet Precautions</th>
                  <th style={{ textAlign: "center", padding: "10px 14px", color: "var(--slate)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiets.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "36px 14px", color: "var(--slate)", fontStyle: "italic" }}>
                      No clinical diet prescriptions recorded.
                    </td>
                  </tr>
                ) : (
                  filteredDiets.map((diet) => (
                    <tr key={diet.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "12px 14px" }}>
                        <strong style={{ display: "block" }}>{diet.patientName}</strong>
                        <span style={{ fontSize: 11.5, color: "var(--slate)" }}>{diet.patientUhid}</span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <strong>{diet.bedLocation.split("(")[0]}</strong>
                        <span style={{ fontSize: 11, color: "var(--slate)", display: "block" }}>{diet.bedLocation.split("(")[1]?.replace(")", "")}</span>
                      </td>

                      <td style={{ padding: "12px 14px" }}>
                        <strong style={{ color: "var(--indigo)" }}>{diet.dietCategory.replace(/_/g, " ")}</strong>
                        <span style={{ fontSize: 11, color: "var(--slate)", display: "block" }}>{diet.foodType} · {diet.feedingRoute.replace("_", " ")}</span>
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700 }}>
                        {diet.macros.calories} kcal / {diet.macros.protein}g
                      </td>

                      <td style={{ padding: "12px 14px", color: "#047857", fontSize: 12 }}>
                        {diet.instructionsTe}
                      </td>

                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <StatusPill kind="success">ACTIVE</StatusPill>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: CENTRAL KITCHEN BATCH PREP */}
      {activeTab === "kitchen" && (
        <Card style={{ borderRadius: 16 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--indigo)", margin: "0 0 14px" }}>
            🍳 Central Kitchen Batch Recipe Aggregation
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            <div style={{ background: "#FEFCE8", border: "1.5px solid #EAB308", padding: 14, borderRadius: 10 }}>
              <strong style={{ fontSize: 14, color: "#854D0E", display: "block", marginBottom: 4 }}>
                🟡 Diabetic Veg Diet (1800 kcal)
              </strong>
              <span style={{ fontSize: 24, fontWeight: 900, color: "#854D0E", display: "block", margin: "4px 0" }}>
                18 Trays
              </span>
              <span style={{ fontSize: 12, color: "#713F12" }}>
                Brown rice / multigrain roti, methi dal, cucumber salad, boiled beans, curd.
              </span>
            </div>

            <div style={{ background: "#EFF6FF", border: "1.5px solid #3B82F6", padding: 14, borderRadius: 10 }}>
              <strong style={{ fontSize: 14, color: "#1E40AF", display: "block", marginBottom: 4 }}>
                🔵 Renal Low-Sodium Diet
              </strong>
              <span style={{ fontSize: 24, fontWeight: 900, color: "#1E40AF", display: "block", margin: "4px 0" }}>
                12 Trays
              </span>
              <span style={{ fontSize: 12, color: "#1E3A8A" }}>
                Salt-free preparation, bottle gourd curry, boiled rice, restricted fluid cup (150mL).
              </span>
            </div>

            <div style={{ background: "#F3E8FF", border: "1.5px solid #A855F7", padding: 14, borderRadius: 10 }}>
              <strong style={{ fontSize: 14, color: "#6B21A8", display: "block", marginBottom: 4 }}>
                🟣 Enteral Ryle's Tube Liquid Feed
              </strong>
              <span style={{ fontSize: 24, fontWeight: 900, color: "#6B21A8", display: "block", margin: "4px 0" }}>
                6 Liters
              </span>
              <span style={{ fontSize: 12, color: "#581C87" }}>
                High-protein peptide enteral blend, milk base, maltodextrin, strained pure liquid.
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Prescribe Modal */}
      {prescribeModalOpen && (
        <DietPrescriptionModal
          isOpen={prescribeModalOpen}
          onClose={() => setPrescribeModalOpen(false)}
          onSuccess={handlePrescribeSuccess}
        />
      )}

      {/* Label Modal */}
      {labelModalOpen && selectedDietForLabel && (
        <MealTrayLabelModal
          isOpen={labelModalOpen}
          onClose={() => setLabelModalOpen(false)}
          diet={selectedDietForLabel}
        />
      )}

      <Toast message={toastMessage} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
