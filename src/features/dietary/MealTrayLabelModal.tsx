import React from "react";
import { Modal, Button } from "../../ui/components";

interface MealTrayLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  diet: any;
  mealName?: string;
}

export default function MealTrayLabelModal({
  isOpen,
  onClose,
  diet,
  mealName = "LUNCH TRAY (12:30 PM)",
}: MealTrayLabelModalProps) {
  if (!isOpen || !diet) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Print Thermal Meal Tray Barcode Label (50×25mm)" maxWidth={580}>
      <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: "100%", fontFamily: "var(--font-body)", color: "var(--ink)", boxSizing: "border-box" }}>
        
        {/* Printable Thermal Sticker Preview */}
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0", background: "var(--wash-a)", borderRadius: 10 }}>
          
          <div
            id="meal-tray-thermal-sticker"
            style={{
              width: "360px",
              height: "180px",
              background: "#ffffff",
              border: "2px dashed #94A3B8",
              borderRadius: 6,
              padding: "10px 12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
              fontFamily: "var(--font-body)",
              color: "#000000",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #000", paddingBottom: 3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 900 }}>🥗 ZEN CLINIC DIETARY</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 900, background: "#000", color: "#fff", padding: "1px 5px", borderRadius: 3 }}>
                {mealName}
              </span>
            </div>

            {/* Patient & Location */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 2 }}>
              <div>
                <strong style={{ fontSize: 13, display: "block", lineHeight: 1.1 }}>{diet.patientName}</strong>
                <span style={{ fontSize: 9.5, color: "#333" }}>{diet.patientUhid}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <strong style={{ fontSize: 12, color: "var(--indigo)" }}>{diet.bedLocation.split("(")[0]}</strong>
                <span style={{ fontSize: 9, color: "#555", display: "block" }}>{diet.bedLocation.split("(")[1]?.replace(")", "")}</span>
              </div>
            </div>

            {/* Diet Plan Badge & Macros */}
            <div style={{ background: "#F1F5F9", padding: "3px 6px", borderRadius: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10.5, fontWeight: 900, color: "#0F172A" }}>
                {diet.dietCategory.replace(/_/g, " ")} ({diet.foodType})
              </span>
              <span style={{ fontSize: 9.5, fontWeight: 700 }}>
                {diet.macros?.calories || 1800} kcal · {diet.macros?.protein || 65}g Prot
              </span>
            </div>

            {/* Telugu Instructions & Allergies */}
            <div style={{ borderTop: "1px dashed #64748B", paddingTop: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ maxWidth: "78%" }}>
                <span style={{ fontSize: 9.5, color: "#047857", fontWeight: 700, display: "block", lineHeight: 1.1 }}>
                  తెలుగు: {diet.instructionsTe || "ఉప్పు తక్కువగా తీసుకోవాలి"}
                </span>
                <span style={{ fontSize: 8.5, color: "#DC2626", fontWeight: 700, display: "block" }}>
                  Allergies: {diet.allergies || "None"}
                </span>
              </div>

              {/* 2D QR Code Simulator */}
              <div style={{ width: 28, height: 28, background: "#000", color: "#fff", display: "grid", placeItems: "center", fontSize: 8, fontWeight: 900, borderRadius: 2 }}>
                QR
              </div>
            </div>

          </div>
        </div>

        {/* Print Stylesheet */}
        <style>
          {`
            @media print {
              body * {
                visibility: hidden;
              }
              #meal-tray-thermal-sticker, #meal-tray-thermal-sticker * {
                visibility: visible;
              }
              #meal-tray-thermal-sticker {
                position: absolute;
                left: 0;
                top: 0;
                width: 50mm !important;
                height: 25mm !important;
                border: none !important;
                box-shadow: none !important;
                padding: 1.5mm !important;
                margin: 0 !important;
              }
              @page {
                size: 50mm 25mm;
                margin: 0;
              }
            }
          `}
        </style>

        {/* Action Controls */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button ghost type="button" onClick={onClose}>Close</Button>
          <Button
            type="button"
            onClick={handlePrint}
            style={{ background: "var(--indigo)", color: "#fff", fontWeight: 800 }}
          >
            🖨️ Print 50×25mm Thermal Label
          </Button>
        </div>

      </div>
    </Modal>
  );
}
