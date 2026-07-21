// Observability Telemetry Tracker Stub with PII Scrubbing Rules (UI-703)

const PII_KEYS = ["patient_name", "abha_number", "national_id", "phone", "given_name", "family_name", "email"];

// Check if tenant has opt-out configured
const isOptedOut = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("telemetry_opt_out") === "true";
  }
  return false;
};

// Deep clone and scrub any potential patient identifiers (PII)
const scrubPII = (obj: any): any => {
  if (!obj || typeof obj !== "object") return obj;

  const scrubbed = Array.isArray(obj) ? [] : {};
  
  for (const [key, val] of Object.entries(obj)) {
    if (PII_KEYS.includes(key.toLowerCase())) {
      (scrubbed as any)[key] = "[PII_SCRUBBED_BY_TELEMETRY]";
    } else if (typeof val === "object") {
      (scrubbed as any)[key] = scrubPII(val);
    } else {
      (scrubbed as any)[key] = val;
    }
  }
  return scrubbed;
};

export const telemetry = {
  trackPageView: (pageName: string, context?: any) => {
    if (isOptedOut()) return;
    const cleanContext = scrubPII(context || {});
    console.log(`[Telemetry PageView] ${pageName}`, {
      timestamp: new Date().toISOString(),
      release: "hms-web@0.1.0-readiness",
      context: cleanContext
    });
  },

  trackError: (error: any, context?: any) => {
    if (isOptedOut()) return;
    const cleanContext = scrubPII(context || {});
    console.error(`[Telemetry Error]`, {
      error: error.message || error.toString(),
      timestamp: new Date().toISOString(),
      release: "hms-web@0.1.0-readiness",
      context: cleanContext
    });
  }
};
