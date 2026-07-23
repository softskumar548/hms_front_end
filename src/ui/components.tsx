/** Core MediGo components — every screen composes from these. Keep this file the
 * only place styles for these primitives live, so 40 screens stay one product. */
import React from "react";

const s = {
  btnPrimary: {
    border: 0, borderRadius: "var(--r-pill)", fontWeight: 800, cursor: "pointer",
    background: "var(--indigo)", color: "#fff", padding: "12px 32px", fontSize: 15,
    boxShadow: "0 10px 24px rgba(19,26,143,.35)", fontFamily: "inherit",
  } as React.CSSProperties,
  btnGhost: {
    borderRadius: "var(--r-pill)", fontWeight: 800, cursor: "pointer",
    background: "#fff", color: "var(--indigo)", border: "1.5px solid var(--line)",
    padding: "9px 18px", fontSize: 13.5, fontFamily: "inherit",
  } as React.CSSProperties,
  card: {
    background: "var(--card)", borderRadius: "var(--r-card)",
    boxShadow: "var(--shadow-card)", padding: 20,
  } as React.CSSProperties,
};

export function Button({ ghost, disabled, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { ghost?: boolean }) {
  const base = ghost ? s.btnGhost : s.btnPrimary;
  const style = disabled ? { ...base, background: "#B9BFD9", boxShadow: "none", cursor: "not-allowed" } : base;
  return <button style={style} disabled={disabled} {...rest} />;
}

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ ...s.card, ...style }}>{children}</div>;
}

/** Airline-style field cell: tiny gray label over bold indigo value. */
export function FieldCell({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: "var(--r-field)", padding: "12px 16px" }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--slate)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, color: "var(--indigo)" }}>{children}</div>
      {sub && <div style={{ fontSize: 11.5, color: "var(--slate)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

const statusColors: Record<string, { bg: string; fg: string }> = {
  info:    { bg: "#E1F4FB", fg: "#1585AC" },   // e.g. Arrived
  warn:    { bg: "#FDEBDA", fg: "#C4620F" },   // e.g. In consult / attention
  success: { bg: "#E3F5EA", fg: "#1C9A4E" },   // e.g. Done
  brand:   { bg: "var(--indigo-soft)", fg: "var(--indigo)" },
  danger:  { bg: "#FBE3E3", fg: "#B22B2B" },   // e.g. hard-stop prerequisite unmet
};

export function StatusPill({ kind = "brand", children, ...props }: React.HTMLAttributes<HTMLSpanElement> & { kind?: keyof typeof statusColors; children: React.ReactNode }) {
  const c = statusColors[kind] || statusColors.brand;
  return (
    <span {...props} style={{ display: "inline-block", padding: "4px 12px", borderRadius: "var(--r-pill)", fontSize: 12, fontWeight: 800, background: c.bg, color: c.fg, ...props.style }}>
      {children}
    </span>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        border: "1.5px solid var(--line)", borderRadius: "var(--r-field)", padding: "11px 14px",
        fontFamily: "inherit", fontSize: 14.5, width: "100%", ...props.style,
      }}
    />
  );
}

export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 30, color: "var(--ink)", margin: "0 0 16px" }}>
      {children}
    </h1>
  );
}

export function Select({ style, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        border: "1.5px solid var(--line)", borderRadius: "var(--r-field)", padding: "11px 14px",
        fontFamily: "inherit", fontSize: 14.5, width: "100%", background: "#fff", cursor: "pointer", ...style,
      }}
    />
  );
}

export function Skeleton({ width = "100%", height = "1em", style, circular }: { width?: string | number; height?: string | number; style?: React.CSSProperties; circular?: boolean }) {
  return (
    <div
      className="skeleton-pulse"
      style={{
        width,
        height,
        borderRadius: circular ? "var(--r-pill)" : "var(--r-field)",
        ...style,
      }}
    />
  );
}

export function Chip({ active, children, onClick, style, "data-testid": testId }: { active?: boolean; children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties; "data-testid"?: string }) {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 16px",
    borderRadius: "var(--r-pill)",
    fontSize: 13.5,
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.15s ease",
    border: "1.5px solid var(--line)",
    background: "#fff",
    color: "var(--ink)",
    ...style,
  };

  const activeStyle: React.CSSProperties = active
    ? {
        background: "var(--indigo-soft)",
        border: "1.5px solid var(--indigo)",
        color: "var(--indigo)",
      }
    : {};

  return (
    <button onClick={onClick} style={{ ...baseStyle, ...activeStyle }} type="button" data-testid={testId}>
      {children}
    </button>
  );
}

export interface RadioPillOption<T> {
  value: T;
  label: string;
}

export function RadioPill<T>({ options, value, onChange, name }: { options: RadioPillOption<T>[]; value: T; onChange: (v: T) => void; name: string }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((opt) => (
        <Chip key={String(opt.value)} active={opt.value === value} onClick={() => onChange(opt.value)}>
          {opt.label}
        </Chip>
      ))}
    </div>
  );
}

export interface DateChipOption {
  date: string;
  label: string;
  sub?: string;
}

export function DateChips({ options, value, onChange }: { options: DateChipOption[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((opt) => {
        const active = opt.date === value;
        return (
          <button
            key={opt.date}
            onClick={() => onChange(opt.date)}
            type="button"
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "10px 18px",
              borderRadius: "var(--r-pill)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              border: active ? "1.5px solid var(--indigo)" : "1.5px solid var(--line)",
              background: active ? "var(--indigo-soft)" : "#fff",
              color: active ? "var(--indigo)" : "var(--ink)",
              transition: "all 0.15s ease",
            }}
          >
            <span style={{ fontSize: 13.5 }}>{opt.label}</span>
            {opt.sub && <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 600 }}>{opt.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      const focusables = modalRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex="0"]');
      if (focusables && focusables.length > 0) {
        (focusables[0] as HTMLElement).focus();
      }
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(10, 17, 102, 0.4)", display: "grid", placeItems: "center",
        zIndex: 1000, padding: 20,
      }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          background: "#fff", borderRadius: "var(--r-card)", width: "100%", maxWidth: 500,
          padding: 24, boxShadow: "var(--shadow-pop)", position: "relative",
          animation: "fadeInScale 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 id="modal-title" style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, margin: 0, color: "var(--indigo)" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              border: 0, background: "transparent", fontSize: 20, cursor: "pointer",
              color: "var(--slate)", display: "grid", placeItems: "center", padding: 4
            }}
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export function Drawer({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const drawerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      const focusables = drawerRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex="0"]');
      if (focusables && focusables.length > 0) {
        (focusables[0] as HTMLElement).focus();
      }
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(10, 17, 102, 0.4)", zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        style={{
          position: "absolute", top: 0, right: 0, bottom: 0,
          background: "#fff", width: "100%", maxWidth: 380, padding: 24,
          boxShadow: "var(--shadow-pop)", display: "flex", flexDirection: "column",
          animation: "slideInRight 0.25s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 id="drawer-title" style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, margin: 0, color: "var(--indigo)" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            style={{
              border: 0, background: "transparent", fontSize: 20, cursor: "pointer",
              color: "var(--slate)", display: "grid", placeItems: "center", padding: 4
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

export function Toast({ message, isVisible, onClose, duration = 2500 }: { message: string; isVisible: boolean; onClose: () => void; duration?: number }) {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      data-testid="toast"
      role="status"
      aria-live="polite"
      style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
        background: "var(--indigo-deep)", color: "#fff", padding: "12px 24px",
        borderRadius: "var(--r-pill)", boxShadow: "var(--shadow-pop)",
        zIndex: 1100, fontSize: 14.5, fontWeight: 600, display: "flex",
        alignItems: "center", gap: 10, animation: "fadeInUp 0.2s ease-out",
      }}
    >
      <span>{message}</span>
    </div>
  );
}

