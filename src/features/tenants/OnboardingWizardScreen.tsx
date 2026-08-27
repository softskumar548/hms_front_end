/** Operator Tenant Provisioning & Admin Access Handover Screen (TEN-101).
 * Minimalist, high-efficiency operator onboarding interface:
 * Stage 1: Organization Profile, Structured Address, Contact Details, Searchable Designation, Signatory Audit.
 * Clean, lightweight typography and subtle, non-intrusive focus and error states.
 * Stage 2: Tenant Admin Access Handover Certificate.
 */
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/client";

const RESERVED_SLUGS = new Set([
  "api", "admin", "app", "operator", "keycloak", "stage", "staging",
  "demo", "test", "null", "undefined", "system", "hms", "zensynq",
  "support", "auth", "mail", "portal", "root", "dev", "health"
]);

const DEFAULT_DESIGNATIONS = [
  "Medical Director",
  "Dean / Principal",
  "Chief Medical Officer (CMO)",
  "Managing Director (MD)",
  "Hospital Administrator",
  "Chief Operating Officer (COO)",
  "Operations Lead / Hospital GM",
  "Head of IT / CTO",
  "Medical Superintendent",
  "Head of Billing & Finance",
  "Lead Physician / Senior Consultant",
  "Nursing Superintendent",
  "Clinic In-Charge",
  "Authorized Signatory",
];

/** Minimalist Searchable & Creatable Designation Combobox */
const DesignationCombobox: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  availableOptions: string[];
  onAddOption?: (newOpt: string) => void;
  hasError?: boolean;
}> = ({ value, onChange, placeholder = "Search or select designation...", availableOptions, onAddOption, hasError = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const filteredOptions = availableOptions.filter((opt) =>
    opt.toLowerCase().includes((searchQuery || "").toLowerCase().trim())
  );

  const exactMatch = availableOptions.some(
    (opt) => opt.toLowerCase() === (searchQuery || "").toLowerCase().trim()
  );

  const isNewEntry = searchQuery.trim().length > 0 && !exactMatch;

  const handleSelect = (option: string) => {
    onChange(option);
    setSearchQuery(option);
    setIsOpen(false);
  };

  const handleAddNew = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    if (onAddOption) onAddOption(trimmed);
    onChange(trimmed);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div
        className="input-field-group"
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: 8,
          border: `1px solid ${hasError ? "#EF4444" : isOpen ? "#6366F1" : "#CBD5E1"}`,
          boxShadow: isOpen ? "0 0 0 1.5px #6366F1" : "none",
          background: "#FFF",
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          data-combobox-open={isOpen ? "true" : "false"}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            setTimeout(() => {
              if (isOpen) setIsOpen(false);
            }, 200);
          }}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              setIsOpen(false);
              return;
            }
            if (isOpen) {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightIndex((prev) => Math.min(prev + 1, (isNewEntry ? 1 : 0) + filteredOptions.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightIndex((prev) => Math.max(prev - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                if (isNewEntry && highlightIndex === 0) {
                  handleAddNew();
                } else {
                  const targetOpt = filteredOptions[isNewEntry ? highlightIndex - 1 : highlightIndex];
                  if (targetOpt) handleSelect(targetOpt);
                  else handleAddNew();
                }
              }
            }
          }}
          style={{
            border: "none",
            outline: "none",
            padding: "10px 12px",
            width: "100%",
            fontSize: 13.5,
            fontWeight: 500,
            borderRadius: 8,
            background: "transparent",
            color: "#1E293B",
          }}
        />

        {searchQuery && (
          <button
            tabIndex={-1}
            type="button"
            onClick={() => {
              setSearchQuery("");
              onChange("");
              inputRef.current?.focus();
            }}
            aria-label="Clear designation"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
              color: "#94A3B8",
              fontSize: 12,
            }}
          >
            ✕
          </button>
        )}

        <button
          tabIndex={-1}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle designation dropdown"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "10px 12px",
            color: "#64748B",
            fontSize: 11,
            userSelect: "none",
          }}
        >
          {isOpen ? "▲" : "▼"}
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#ffffff",
            borderRadius: 8,
            border: "1px solid #CBD5E1",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            maxHeight: 200,
            overflowY: "auto",
            zIndex: 99999,
            display: "grid",
            padding: 4,
            gap: 1,
          }}
        >
          {isNewEntry && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                handleAddNew();
              }}
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                background: highlightIndex === 0 ? "#EEF2FF" : "#F8FAFC",
                color: "#4F46E5",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: "1px dashed #CBD5E1",
              }}
            >
              <span>+</span> Add custom: <b>"{searchQuery.trim()}"</b>
            </div>
          )}

          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => {
              const itemIndex = isNewEntry ? idx + 1 : idx;
              const isHighlighted = highlightIndex === itemIndex;
              const isSelected = opt.toLowerCase() === value.toLowerCase().trim();

              return (
                <div
                  key={opt}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(opt);
                  }}
                  onMouseEnter={() => setHighlightIndex(itemIndex)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 6,
                    background: isSelected
                      ? "#F1F5F9"
                      : isHighlighted
                      ? "#EEF2FF"
                      : "transparent",
                    color: isSelected ? "#1E293B" : "#334155",
                    fontSize: 13,
                    fontWeight: isSelected ? 700 : 500,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{opt}</span>
                  {isSelected && <span style={{ color: "#4F46E5", fontSize: 12 }}>✓</span>}
                </div>
              );
            })
          ) : !isNewEntry ? (
            <div style={{ padding: "10px", textAlign: "center", color: "#94A3B8", fontSize: 12 }}>
              No designations found. Type to add new.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export const OnboardingWizardScreen: React.FC<{ token: string | null }> = ({ token }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const queryTenantId = queryParams.get("tenant_id") || queryParams.get("tenantId") || "";
  const queryOrgName = queryParams.get("name") || "";
  const stateTenantId = (location.state as { tenantId?: string })?.tenantId || "";
  const [tenantId, setTenantId] = useState(queryTenantId || stateTenantId || "");

  const [currentStage, setCurrentStage] = useState<number>(1);
  const [provisioned, setProvisioned] = useState<boolean>(false);
  const [existingTenantIds, setExistingTenantIds] = useState<string[]>([]);
  const [customDesignations, setCustomDesignations] = useState<string[]>(DEFAULT_DESIGNATIONS);

  const handleAddNewDesignation = (newOpt: string) => {
    if (!customDesignations.some((d) => d.toLowerCase() === newOpt.toLowerCase())) {
      setCustomDesignations((prev) => [newOpt, ...prev]);
    }
  };

  // Stage 1: Organization Profile & Subdomain
  const [orgName, setOrgName] = useState(queryOrgName || (queryTenantId ? queryTenantId.toUpperCase().replace(/[_|-]/g, " ") : ""));
  const [customUrl, setCustomUrl] = useState(queryTenantId ? `${queryTenantId}.hms.zensynq.com` : "");
  const [website, setWebsite] = useState("");
  const [region, setRegion] = useState("india");
  const [isolatedDb, setIsolatedDb] = useState(false);

  // Stage 1: Structured Physical Address
  const [doorNo, setDoorNo] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const stateFixed = "Andhra Pradesh";
  const [pinCode, setPinCode] = useState("");
  const countryFixed = "India";

  // Stage 1: Facility Landline & Mobile
  const [landlineStd, setLandlineStd] = useState("");
  const [landlineNumber, setLandlineNumber] = useState("");
  const [landlineExt, setLandlineExt] = useState("");
  const [orgMobileDigits, setOrgMobileDigits] = useState("");

  // Stage 1: Feature Modules
  const [featureReferrals, setFeatureReferrals] = useState(true);
  const [featureAbdm, setFeatureAbdm] = useState(true);
  const [featureTelehealth, setFeatureTelehealth] = useState(true);

  // Stage 1: Primary Contact
  const [primName, setPrimName] = useState("");
  const [primDesignation, setPrimDesignation] = useState("");
  const [primAadhaar, setPrimAadhaar] = useState("");
  const [primLandlineStd, setPrimLandlineStd] = useState("");
  const [primLandlineNumber, setPrimLandlineNumber] = useState("");
  const [primLandlineExt, setPrimLandlineExt] = useState("");
  const [primPhoneDigits, setPrimPhoneDigits] = useState("");
  const [primEmail, setPrimEmail] = useState("");

  // Stage 1: Secondary Contact
  const [secName, setSecName] = useState("");
  const [secDesignation, setSecDesignation] = useState("");
  const [secAadhaar, setSecAadhaar] = useState("");
  const [secLandlineStd, setSecLandlineStd] = useState("");
  const [secLandlineNumber, setSecLandlineNumber] = useState("");
  const [secLandlineExt, setSecLandlineExt] = useState("");
  const [secPhoneDigits, setSecPhoneDigits] = useState("");
  const [secEmail, setSecEmail] = useState("");

  const [adminContactTarget, setAdminContactTarget] = useState<"primary" | "secondary">("primary");

  // Stage 1: Contract & Signatory
  const [contractFileName, setContractFileName] = useState("");
  const [sigName, setSigName] = useState("");
  const [sigDesignation, setSigDesignation] = useState("");
  const [sigAadhaar, setSigAadhaar] = useState("");
  const [sigLandlineStd, setSigLandlineStd] = useState("");
  const [sigLandlineNumber, setSigLandlineNumber] = useState("");
  const [sigLandlineExt, setSigLandlineExt] = useState("");
  const [sigPhoneDigits, setSigPhoneDigits] = useState("");
  const [sigEmail, setSigEmail] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [signatoryError, setSignatoryError] = useState<string | null>(null);

  // Stage 2: Passcode State
  const [tempPasscode, setTempPasscode] = useState("");
  const [copiedToast, setCopiedToast] = useState(false);
  const [provisioningLoading, setProvisioningLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadExistingTenants = async () => {
      try {
        const res = await api.listTenants(token);
        if (Array.isArray(res)) {
          setExistingTenantIds(res.map((t: any) => t.id?.toLowerCase()).filter(Boolean));
        }
      } catch (err) {
        setExistingTenantIds(["apollo", "kims", "hospital_vizag", "t_a", "t_b"]);
      }
    };
    loadExistingTenants();
  }, [token]);

  useEffect(() => {
    const tid = queryTenantId || stateTenantId;
    if (tid) {
      setTenantId(tid);
    }
  }, [queryTenantId, stateTenantId]);

  const getSlugAvailability = () => {
    if (!tenantId) return { status: "empty", msg: "Enter Organization Name to generate subdomain" };
    if (tenantId.length < 3) return { status: "invalid", msg: "Slug must be at least 3 characters" };
    if (!/^[a-z0-9-]+$/.test(tenantId)) return { status: "invalid", msg: "Alphanumeric characters only" };
    if (RESERVED_SLUGS.has(tenantId)) return { status: "reserved", msg: `Slug '${tenantId}' is reserved by platform` };
    if (existingTenantIds.includes(tenantId) && tenantId !== queryTenantId) {
      return { status: "taken", msg: `Subdomain '${tenantId}' is already taken` };
    }
    return { status: "available", msg: `Available: https://${customUrl || `${tenantId}.hms.zensynq.com`}` };
  };

  const slugCheck = getSlugAvailability();

  const clearFieldError = (key: string) => {
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const handleOrgNameChange = (val: string) => {
    setOrgName(val);
    clearFieldError("orgName");
    const slug = val.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!queryTenantId) {
      setTenantId(slug);
      setCustomUrl(`${slug}.hms.zensynq.com`);
      clearFieldError("tenantId");
    }
  };

  const handleTenantIdChange = (val: string) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setTenantId(slug);
    setCustomUrl(`${slug}.hms.zensynq.com`);
    clearFieldError("tenantId");
  };

  const formatAadhaarInput = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 12);
    const parts = [];
    for (let i = 0; i < raw.length; i += 4) {
      parts.push(raw.slice(i, i + 4));
    }
    return parts.join(" ");
  };

  const isValidAadhaar = (val: string) => {
    if (!val) return false;
    const raw = val.replace(/\D/g, "");
    return raw.length === 12;
  };

  const handleAutofillSignatory = (target: "primary" | "secondary") => {
    if (target === "primary") {
      setSigName(primName);
      setSigDesignation(primDesignation);
      setSigAadhaar(primAadhaar);
      setSigLandlineStd(primLandlineStd);
      setSigLandlineNumber(primLandlineNumber);
      setSigLandlineExt(primLandlineExt);
      setSigPhoneDigits(primPhoneDigits);
      setSigEmail(primEmail);
    } else {
      setSigName(secName);
      setSigDesignation(secDesignation);
      setSigAadhaar(secAadhaar);
      setSigLandlineStd(secLandlineStd);
      setSigLandlineNumber(secLandlineNumber);
      setSigLandlineExt(secLandlineExt);
      setSigPhoneDigits(secPhoneDigits);
      setSigEmail(secEmail);
    }
    setSignatoryError(null);
    clearFieldError("sigName");
    clearFieldError("sigPhone");
    clearFieldError("sigEmail");
    clearFieldError("signatoryMismatch");
  };

  const isValidIndianMobile = (digits: string) => {
    if (!digits) return false;
    return /^[6-9]\d{9}$/.test(digits);
  };

  const isValidPinCode = (pin: string) => {
    if (!pin) return false;
    return /^\d{6}$/.test(pin);
  };

  const isValidEmail = (email: string) => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const validateSignatoryMatch = (): boolean => {
    if (!sigName && !sigEmail && !sigPhoneDigits && !sigAadhaar) return true;
    const sName = sigName.toLowerCase().trim();
    const sEmail = sigEmail.toLowerCase().trim();
    const sPhone = sigPhoneDigits.trim();
    const sAadhaar = sigAadhaar.replace(/\D/g, "");

    const pAadhaar = primAadhaar.replace(/\D/g, "");
    const sSecAadhaar = secAadhaar.replace(/\D/g, "");

    const pMatch =
      Boolean(primName) &&
      (sEmail === primEmail.toLowerCase().trim() ||
        sPhone === primPhoneDigits.trim() ||
        (sAadhaar && sAadhaar === pAadhaar) ||
        sName.includes(primName.toLowerCase().trim()) ||
        primName.toLowerCase().trim().includes(sName));

    const sMatch =
      Boolean(secName) &&
      (sEmail === secEmail.toLowerCase().trim() ||
        sPhone === secPhoneDigits.trim() ||
        (sAadhaar && sAadhaar === sSecAadhaar) ||
        sName.includes(secName.toLowerCase().trim()) ||
        secName.toLowerCase().trim().includes(sName));

    return pMatch || sMatch;
  };

  const scrollToFirstErrorField = (errs: Record<string, string>) => {
    const orderedFieldList = [
      { key: "orgName", id: "field-orgName" },
      { key: "tenantId", id: "field-tenantId" },
      { key: "addressLine1", id: "field-addressLine1" },
      { key: "city", id: "field-city" },
      { key: "pinCode", id: "field-pinCode" },
      { key: "orgMobile", id: "field-orgMobile" },
      { key: "primName", id: "field-primName" },
      { key: "primAadhaar", id: "field-primAadhaar" },
      { key: "primPhone", id: "field-primPhone" },
      { key: "primEmail", id: "field-primEmail" },
      { key: "secAadhaar", id: "field-secAadhaar" },
      { key: "secPhone", id: "field-secPhone" },
      { key: "secEmail", id: "field-secEmail" },
      { key: "sigName", id: "field-sigName" },
      { key: "sigAadhaar", id: "field-sigAadhaar" },
      { key: "sigPhone", id: "field-sigPhone" },
      { key: "sigEmail", id: "field-sigEmail" },
      { key: "signatoryMismatch", id: "field-signatoryMismatch" },
    ];

    for (const item of orderedFieldList) {
      if (errs[item.key]) {
        const el = document.getElementById(item.id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          const input = el.querySelector("input:not([disabled]), select, textarea") as HTMLElement | null;
          if (input) {
            setTimeout(() => input.focus(), 300);
          }
          break;
        }
      }
    }
  };

  const validateSingleField = (key: string) => {
    let err: string | undefined = undefined;
    switch (key) {
      case "orgName":
        if (!orgName.trim()) {
          err = "Organization Full Name is required.";
        } else if (orgName.trim().length < 3) {
          err = "Organization Name must be at least 3 characters.";
        }
        break;
      case "tenantId":
        if (!tenantId.trim()) {
          err = "Tenant Identifier (Slug) is required.";
        } else if (slugCheck.status === "taken") {
          err = `Subdomain '${tenantId}' is already registered.`;
        } else if (slugCheck.status === "reserved") {
          err = `Slug '${tenantId}' is reserved.`;
        } else if (slugCheck.status === "invalid") {
          err = "Slug must be at least 3 alphanumeric characters.";
        }
        break;
      case "addressLine1":
        if (!addressLine1.trim()) {
          err = "Address Line 1 is required.";
        }
        break;
      case "city":
        if (!city.trim()) {
          err = "City / Town is required.";
        }
        break;
      case "pinCode":
        if (!pinCode.trim()) {
          err = "Postal PIN Code is required.";
        } else if (!isValidPinCode(pinCode)) {
          err = "Postal PIN Code must be exactly 6 digits.";
        }
        break;
      case "orgMobile":
        if (orgMobileDigits && !isValidIndianMobile(orgMobileDigits)) {
          err = "Must be 10 digits starting with 6, 7, 8, or 9.";
        }
        break;
      case "primName":
        if (!primName.trim()) {
          err = "Primary Contact Full Name is required.";
        }
        break;
      case "primAadhaar":
        if (primAadhaar && !isValidAadhaar(primAadhaar)) {
          err = "Aadhaar number must be 12 digits.";
        }
        break;
      case "primPhone":
        if (!primPhoneDigits.trim()) {
          err = "Primary Contact Mobile Number is required.";
        } else if (!isValidIndianMobile(primPhoneDigits)) {
          err = "Mobile must be 10 digits starting with 6-9.";
        }
        break;
      case "primEmail":
        if (!primEmail.trim()) {
          err = "Primary Contact Work Email is required.";
        } else if (!isValidEmail(primEmail)) {
          err = "Please enter a valid work email address.";
        }
        break;
      case "secAadhaar":
        if (secAadhaar && !isValidAadhaar(secAadhaar)) {
          err = "Aadhaar number must be 12 digits.";
        }
        break;
      case "secPhone":
        if (secPhoneDigits && !isValidIndianMobile(secPhoneDigits)) {
          err = "Mobile must be 10 digits starting with 6-9.";
        }
        break;
      case "secEmail":
        if (secEmail && !isValidEmail(secEmail)) {
          err = "Please enter a valid work email.";
        }
        break;
      case "sigAadhaar":
        if (sigAadhaar && !isValidAadhaar(sigAadhaar)) {
          err = "Aadhaar number must be 12 digits.";
        }
        break;
      case "sigPhone":
        if (sigPhoneDigits && !isValidIndianMobile(sigPhoneDigits)) {
          err = "Mobile must be 10 digits starting with 6-9.";
        }
        break;
      case "sigEmail":
        if (sigEmail && !isValidEmail(sigEmail)) {
          err = "Please enter a valid email.";
        }
        break;
      case "signatoryMismatch":
        if ((sigName || sigEmail || sigPhoneDigits || sigAadhaar) && !validateSignatoryMatch()) {
          err = "Signatory must match Primary or Secondary contact.";
          setSignatoryError("⚠️ Contract signatory details must match either Primary Contact or Secondary Contact!");
        } else {
          setSignatoryError(null);
        }
        break;
      default:
        break;
    }

    setFieldErrors((prev) => {
      const copy = { ...prev };
      if (err) {
        copy[key] = err;
      } else {
        delete copy[key];
      }
      return copy;
    });
  };

  const navigateFields = (direction: "next" | "prev", currentTarget?: HTMLElement | null) => {
    const form = document.querySelector("form");
    if (!form) return;

    const focusables = Array.from(
      form.querySelectorAll<HTMLElement>(
        'input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), button[type="submit"]:not([disabled])'
      )
    ).filter((el) => el.offsetParent !== null);

    if (focusables.length === 0) return;

    const activeEl = (currentTarget || document.activeElement) as HTMLElement | null;
    const index = activeEl ? focusables.indexOf(activeEl) : -1;

    let nextTarget: HTMLElement;
    if (index === -1) {
      nextTarget = direction === "next" ? focusables[0] : focusables[focusables.length - 1];
    } else {
      if (direction === "next") {
        nextTarget = focusables[(index + 1) % focusables.length];
      } else {
        nextTarget = focusables[(index - 1 + focusables.length) % focusables.length];
      }
    }

    if (nextTarget) {
      nextTarget.focus();
      if (
        nextTarget instanceof HTMLInputElement &&
        (nextTarget.type === "text" || nextTarget.type === "tel" || nextTarget.type === "email" || nextTarget.type === "url")
      ) {
        nextTarget.select();
      }
      nextTarget.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (currentStage !== 1) return;

      const activeEl = document.activeElement as HTMLElement | null;
      const isInputActive =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "SELECT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "BUTTON");

      // When no interactive field is focused (e.g. clicked whitespace, active is BODY or DIV)
      if (!isInputActive) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          navigateFields("next");
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          navigateFields("prev");
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [currentStage]);

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;

    if (e.key === "Enter") {
      if (target.tagName === "TEXTAREA" || target.getAttribute("type") === "submit") {
        return;
      }
      if (target.getAttribute("data-combobox-open") === "true") {
        return;
      }
      e.preventDefault();
      navigateFields("next", target);
      return;
    }

    if (e.key === "ArrowDown") {
      if (target.tagName === "TEXTAREA") return;
      if (target.getAttribute("data-combobox-open") === "true") return;
      e.preventDefault();
      navigateFields("next", target);
      return;
    }

    if (e.key === "ArrowUp") {
      if (target.tagName === "TEXTAREA") return;
      if (target.getAttribute("data-combobox-open") === "true") return;
      e.preventDefault();
      navigateFields("prev", target);
      return;
    }
  };

  const handleProvisionTenantAndIssueAdmin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!orgName.trim()) {
      newErrors.orgName = "Organization Full Name is required.";
    } else if (orgName.trim().length < 3) {
      newErrors.orgName = "Organization Name must be at least 3 characters.";
    }

    if (!tenantId.trim()) {
      newErrors.tenantId = "Tenant Identifier (Slug) is required.";
    } else if (slugCheck.status === "taken") {
      newErrors.tenantId = `Subdomain '${tenantId}' is already registered.`;
    } else if (slugCheck.status === "reserved") {
      newErrors.tenantId = `Slug '${tenantId}' is reserved.`;
    } else if (slugCheck.status === "invalid") {
      newErrors.tenantId = "Slug must be at least 3 alphanumeric characters.";
    }

    if (!addressLine1.trim()) {
      newErrors.addressLine1 = "Address Line 1 is required.";
    }
    if (!city.trim()) {
      newErrors.city = "City / Town is required.";
    }
    if (!pinCode.trim()) {
      newErrors.pinCode = "Postal PIN Code is required.";
    } else if (!isValidPinCode(pinCode)) {
      newErrors.pinCode = "Postal PIN Code must be exactly 6 digits.";
    }

    if (orgMobileDigits && !isValidIndianMobile(orgMobileDigits)) {
      newErrors.orgMobile = "Must be 10 digits starting with 6, 7, 8, or 9.";
    }

    if (!primName.trim()) {
      newErrors.primName = "Primary Contact Full Name is required.";
    }
    if (primAadhaar && !isValidAadhaar(primAadhaar)) {
      newErrors.primAadhaar = "Aadhaar number must be 12 digits.";
    }
    if (!primPhoneDigits.trim()) {
      newErrors.primPhone = "Primary Contact Mobile Number is required.";
    } else if (!isValidIndianMobile(primPhoneDigits)) {
      newErrors.primPhone = "Mobile must be 10 digits starting with 6-9.";
    }
    if (!primEmail.trim()) {
      newErrors.primEmail = "Primary Contact Work Email is required.";
    } else if (!isValidEmail(primEmail)) {
      newErrors.primEmail = "Please enter a valid work email address.";
    }

    if (secAadhaar && !isValidAadhaar(secAadhaar)) {
      newErrors.secAadhaar = "Aadhaar number must be 12 digits.";
    }
    if (secPhoneDigits && !isValidIndianMobile(secPhoneDigits)) {
      newErrors.secPhone = "Mobile must be 10 digits starting with 6-9.";
    }
    if (secEmail && !isValidEmail(secEmail)) {
      newErrors.secEmail = "Please enter a valid work email.";
    }

    if (sigAadhaar && !isValidAadhaar(sigAadhaar)) {
      newErrors.sigAadhaar = "Aadhaar number must be 12 digits.";
    }
    if (sigPhoneDigits && !isValidIndianMobile(sigPhoneDigits)) {
      newErrors.sigPhone = "Mobile must be 10 digits starting with 6-9.";
    }
    if (sigEmail && !isValidEmail(sigEmail)) {
      newErrors.sigEmail = "Please enter a valid email.";
    }

    if ((sigName || sigEmail || sigPhoneDigits || sigAadhaar) && !validateSignatoryMatch()) {
      newErrors.signatoryMismatch = "Signatory must match Primary or Secondary contact.";
      setSignatoryError("⚠️ Contract signatory details must match either Primary Contact or Secondary Contact!");
    } else {
      setSignatoryError(null);
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setError(`Please correct the ${Object.keys(newErrors).length} required field(s) below.`);
      scrollToFirstErrorField(newErrors);
      return;
    }

    setFieldErrors({});
    setProvisioningLoading(true);
    setError(null);
    try {
      const formattedAddress = [
        doorNo ? `Door No. ${doorNo}` : "",
        addressLine1,
        addressLine2,
        city,
        `${stateFixed} - ${pinCode}`,
        countryFixed,
      ].filter(Boolean).join(", ");

      const formattedFacilityLandline = (landlineStd && landlineNumber)
        ? `${landlineStd}-${landlineNumber}${landlineExt ? ` Ext: ${landlineExt}` : ""}`
        : "";
      const formattedPrimPhone = primPhoneDigits ? `+91${primPhoneDigits}` : "+919876543210";
      const formattedSecPhone = secPhoneDigits ? `+91${secPhoneDigits}` : "";
      const formattedSigPhone = sigPhoneDigits ? `+91${sigPhoneDigits}` : "";

      const formattedPrimLandline = (primLandlineStd && primLandlineNumber)
        ? `${primLandlineStd}-${primLandlineNumber}${primLandlineExt ? ` Ext: ${primLandlineExt}` : ""}`
        : "";
      const formattedSecLandline = (secLandlineStd && secLandlineNumber)
        ? `${secLandlineStd}-${secLandlineNumber}${secLandlineExt ? ` Ext: ${secLandlineExt}` : ""}`
        : "";
      const formattedSigLandline = (sigLandlineStd && sigLandlineNumber)
        ? `${sigLandlineStd}-${sigLandlineNumber}${sigLandlineExt ? ` Ext: ${sigLandlineExt}` : ""}`
        : "";

      const payload: any = {
        id: tenantId,
        name: orgName,
        region: region,
        custom_url: customUrl || `${tenantId}.hms.zensynq.com`,
        isolated_db: isolatedDb,
        address: formattedAddress,
        website: website,
        admin_contact_target: adminContactTarget,
        features: {
          referrals: featureReferrals,
          abdm: featureAbdm,
          telehealth: featureTelehealth,
          landline: formattedFacilityLandline,
          door_no: doorNo,
          address_line1: addressLine1,
          address_line2: addressLine2,
          city: city,
          state: stateFixed,
          pin_code: pinCode,
          country: countryFixed,
          landline_ext: landlineExt,
        },
      };

      if (primName || primEmail) {
        payload.primary_contact = {
          name: primName || "Primary Admin",
          phone: formattedPrimPhone,
          email: primEmail || `admin@${tenantId}.com`,
          designation: primDesignation || "Medical Director",
          aadhaar: primAadhaar.replace(/\D/g, ""),
          landline: formattedPrimLandline,
        };
      }

      if (secName || secEmail) {
        payload.secondary_contact = {
          name: secName,
          phone: formattedSecPhone,
          email: secEmail,
          designation: secDesignation,
          aadhaar: secAadhaar.replace(/\D/g, ""),
          landline: formattedSecLandline,
        };
      }

      if (sigName || sigEmail) {
        payload.contract_attestation = {
          document_filename: contractFileName || "signed_terms_contract.pdf",
          signatory_name: sigName,
          signatory_designation: sigDesignation,
          signatory_phone: formattedSigPhone || formattedPrimPhone,
          signatory_email: sigEmail || primEmail,
          signatory_aadhaar: sigAadhaar.replace(/\D/g, ""),
          signatory_landline: formattedSigLandline || formattedPrimLandline,
        };
      }

      await api.provisionTenant(token, payload);
      setProvisioned(true);
      const generatedPass = `Hms${tenantId.charAt(0).toUpperCase() + tenantId.slice(1)}#2026!`;
      setTempPasscode(generatedPass);
      setMessage(`Tenant '${orgName}' provisioned successfully.`);
      setCurrentStage(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message || "Failed to provision tenant");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setProvisioningLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    const adminEmail = adminContactTarget === "secondary" ? secEmail || primEmail : primEmail;
    const adminName = adminContactTarget === "secondary" ? secName || primName : primName;
    const textToCopy = `HOSPITAL TENANT ADMIN HANDOVER CREDENTIALS
Organization: ${orgName}
Access URL: https://${customUrl || `${tenantId}.hms.zensynq.com`}
Tenant Admin: ${adminName} (${adminEmail})
Assigned Role: admin (Keycloak OIDC & PostgreSQL)
Initial Temporary Passcode: ${tempPasscode}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const adminTargetObj = adminContactTarget === "secondary" && secName
    ? { name: secName, email: secEmail, phone: secPhoneDigits ? `+91 ${secPhoneDigits}` : "", title: secDesignation || "Secondary Contact" }
    : { name: primName || "Primary Contact", email: primEmail, phone: primPhoneDigits ? `+91 ${primPhoneDigits}` : "", title: primDesignation || "Primary Contact" };

  // Minimal input style helper
  const inputStyle = (hasErr?: boolean) => ({
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: `1px solid ${hasErr ? "#EF4444" : "#CBD5E1"}`,
    fontSize: 13.5,
    fontWeight: 500,
    color: "#1E293B",
    background: "#FFF",
  });

  const labelStyle = {
    display: "block",
    fontSize: 11.5,
    fontWeight: 600,
    color: "#475569",
    marginBottom: 5,
    letterSpacing: 0.3,
  };

  return (
    <div style={{ padding: "20px 16px", maxWidth: 840, margin: "0 auto", fontFamily: "var(--font-body, system-ui, -apple-system, sans-serif)", color: "#1E293B" }}>
      {/* Header Banner - Minimalist Slate */}
      <div
        style={{
          background: "#0F172A",
          borderRadius: 12,
          padding: "20px 24px",
          color: "#FFF",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, background: "#334155", color: "#E2E8F0", padding: "2px 8px", borderRadius: 4, letterSpacing: 0.5 }}>
              OPERATOR CONSOLE
            </span>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>Tenant Fleet Provisioning</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: -0.2 }}>
            {currentStage === 1 ? "Provision Organization & Assign Tenant Admin" : "Tenant Admin Handover Credentials"}
          </h1>
        </div>

        <button
          tabIndex={-1}
          onClick={() => navigate("/tenants")}
          style={{
            background: "#1E293B",
            color: "#E2E8F0",
            border: "1px solid #334155",
            borderRadius: 6,
            padding: "8px 16px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          ← Back to Fleet Roster
        </button>
      </div>

      {/* 2-Step Indicator - Minimal */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div
          data-testid="stage-1-indicator"
          style={{
            background: currentStage === 1 ? "#F8FAFC" : "#FFF",
            borderRadius: 8,
            padding: "12px 16px",
            border: `1px solid ${currentStage === 1 ? "#0F172A" : "#E2E8F0"}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: currentStage === 1 ? "#0F172A" : "#E2E8F0", color: currentStage === 1 ? "#FFF" : "#64748B", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12 }}>
            1
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: currentStage === 1 ? "#0F172A" : "#64748B" }}>Credentials & Profile</div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>Hospital details, address & contacts</div>
          </div>
        </div>

        <div
          data-testid="stage-2-indicator"
          style={{
            background: currentStage === 2 ? "#F8FAFC" : "#FFF",
            borderRadius: 8,
            padding: "12px 16px",
            border: `1px solid ${currentStage === 2 ? "#0F172A" : "#E2E8F0"}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: currentStage === 2 ? "#0F172A" : "#E2E8F0", color: currentStage === 2 ? "#FFF" : "#64748B", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12 }}>
            2
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: currentStage === 2 ? "#0F172A" : "#64748B" }}>Admin Handover</div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>Keycloak role: admin credentials</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", color: "#166534", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600, fontSize: 13.5 }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 600, fontSize: 13.5 }}>
          ⚠️ {error}
        </div>
      )}

      {/* STAGE 1: Minimalist Vertical Form */}
      {currentStage === 1 && (
        <form onSubmit={handleProvisionTenantAndIssueAdmin} onKeyDown={handleFormKeyDown} noValidate style={{ display: "grid", gap: 16 }}>
          {signatoryError && (
            <div id="field-signatoryMismatch" style={{ background: "#FEF2F2", border: "1px solid #EF4444", color: "#991B1B", padding: "12px 16px", borderRadius: 8, fontWeight: 600, fontSize: 13 }}>
              {signatoryError}
            </div>
          )}

          {/* CARD 1: Organization Credentials & Subdomain */}
          <div style={{ background: "#FFF", borderRadius: 10, padding: 22, border: "1px solid #E2E8F0", display: "grid", gap: 14 }}>
            <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: 10 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                1. Organization Credentials & Domain Access
              </h2>
            </div>

            {/* 1.1 Organization Full Name */}
            <div id="field-orgName">
              <label style={labelStyle}>
                ORGANIZATION FULL NAME <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Apollo Specialty Hospital Vizag"
                value={orgName}
                onChange={(e) => handleOrgNameChange(e.target.value)}
                onBlur={() => validateSingleField("orgName")}
                style={inputStyle(Boolean(fieldErrors.orgName))}
                required
              />
              {fieldErrors.orgName && (
                <div style={{ color: "#EF4444", fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>
                  {fieldErrors.orgName}
                </div>
              )}
            </div>

            {/* 1.2 Tenant Identifier (Slug) */}
            <div id="field-tenantId">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>
                  TENANT IDENTIFIER (SLUG) <span style={{ color: "#EF4444" }}>*</span>
                </label>
                {slugCheck.status === "available" && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#16A34A" }}>● Available</span>
                )}
                {slugCheck.status === "taken" && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#DC2626" }}>● Taken</span>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. apollovizag"
                value={tenantId}
                onChange={(e) => handleTenantIdChange(e.target.value)}
                onBlur={() => validateSingleField("tenantId")}
                style={inputStyle(Boolean(fieldErrors.tenantId || slugCheck.status === "taken"))}
                required
              />
              {fieldErrors.tenantId && (
                <div style={{ color: "#EF4444", fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>
                  {fieldErrors.tenantId}
                </div>
              )}
            </div>

            {/* Subdomain Status Bar */}
            <div
              style={{
                background: slugCheck.status === "available" ? "#F0FDF4" : slugCheck.status === "taken" ? "#FEF2F2" : "#F8FAFC",
                border: `1px solid ${slugCheck.status === "available" ? "#DCFCE7" : slugCheck.status === "taken" ? "#FEE2E2" : "#E2E8F0"}`,
                padding: "8px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: slugCheck.status === "available" ? "#15803D" : slugCheck.status === "taken" ? "#B91C1C" : "#64748B",
              }}
            >
              {slugCheck.msg}
            </div>

            {/* 1.3 Custom Access URL */}
            <div>
              <label style={labelStyle}>CUSTOM ACCESS URL</label>
              <input
                type="text"
                placeholder="e.g. apollo.hms.zensynq.com"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                style={inputStyle()}
              />
            </div>

            {/* 1.4 Website URL */}
            <div>
              <label style={labelStyle}>OFFICIAL WEBSITE URL</label>
              <input
                type="url"
                placeholder="e.g. https://apollohospitals.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                style={inputStyle()}
              />
            </div>

            {/* 1.5 Launch Region */}
            <div>
              <label style={labelStyle}>LAUNCH REGION & DATA RESIDENCY</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)} style={inputStyle()}>
                <option value="india">India (Andhra Pradesh / Mumbai Region)</option>
                <option value="ap_local">AP Dedicated Healthcare Data Center</option>
              </select>
            </div>

            {/* 1.6 Dedicated Isolated DB Checkbox */}
            <div style={{ background: "#F8FAFC", padding: "10px 14px", borderRadius: 8, border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#0F172A" }}>Dedicated Isolated Database</div>
                <div style={{ fontSize: 11.5, color: "#64748B" }}>Separate physical DB instance vs shared multi-tenant Postgres RLS</div>
              </div>
              <input
                type="checkbox"
                checked={isolatedDb}
                onChange={(e) => setIsolatedDb(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "#0F172A", cursor: "pointer" }}
              />
            </div>
          </div>

          {/* CARD 2: Physical Facility Address & Telephony */}
          <div style={{ background: "#FFF", borderRadius: 10, padding: 22, border: "1px solid #E2E8F0", display: "grid", gap: 14 }}>
            <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: 10 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                2. Physical Facility Address & Telephony
              </h2>
            </div>

            {/* 2.1 Door No */}
            <div>
              <label style={labelStyle}>DOOR / FLAT / BUILDING NO.</label>
              <input
                type="text"
                placeholder="e.g. D.No 10-2-15/A, Block C"
                value={doorNo}
                onChange={(e) => setDoorNo(e.target.value)}
                style={inputStyle()}
              />
            </div>

            {/* 2.2 Address Line 1 */}
            <div id="field-addressLine1">
              <label style={labelStyle}>
                ADDRESS LINE 1 (STREET / AREA / ROAD) <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Main Road, Health City, Chinna Gadhili"
                value={addressLine1}
                onChange={(e) => {
                  setAddressLine1(e.target.value);
                  clearFieldError("addressLine1");
                }}
                onBlur={() => validateSingleField("addressLine1")}
                style={inputStyle(Boolean(fieldErrors.addressLine1))}
                required
              />
              {fieldErrors.addressLine1 && (
                <div style={{ color: "#EF4444", fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>
                  {fieldErrors.addressLine1}
                </div>
              )}
            </div>

            {/* 2.3 Address Line 2 */}
            <div>
              <label style={labelStyle}>ADDRESS LINE 2 (LANDMARK / LOCALITY)</label>
              <input
                type="text"
                placeholder="e.g. Near Super Specialty Block / Sector 4"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                style={inputStyle()}
              />
            </div>

            {/* 2.4 City */}
            <div id="field-city">
              <label style={labelStyle}>
                CITY / TOWN <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Visakhapatnam"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  clearFieldError("city");
                }}
                onBlur={() => validateSingleField("city")}
                style={inputStyle(Boolean(fieldErrors.city))}
                required
              />
              {fieldErrors.city && (
                <div style={{ color: "#EF4444", fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>
                  {fieldErrors.city}
                </div>
              )}
            </div>

            {/* 2.5 State (Fixed: Andhra Pradesh) */}
            <div>
              <label style={labelStyle}>STATE (Fixed)</label>
              <div
                style={{
                  ...inputStyle(),
                  background: "#F8FAFC",
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#475569",
                  fontWeight: 600,
                  userSelect: "none",
                }}
              >
                <span>Andhra Pradesh</span>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>Locked</span>
              </div>
            </div>

            {/* 2.6 PIN Code */}
            <div id="field-pinCode">
              <label style={labelStyle}>
                POSTAL PIN CODE (6 DIGITS) <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 530040"
                value={pinCode}
                onChange={(e) => {
                  setPinCode(e.target.value.replace(/\D/g, ""));
                  clearFieldError("pinCode");
                }}
                onBlur={() => validateSingleField("pinCode")}
                style={inputStyle(Boolean(fieldErrors.pinCode || (pinCode && !isValidPinCode(pinCode))))}
                required
              />
              {fieldErrors.pinCode && (
                <div style={{ color: "#EF4444", fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>
                  {fieldErrors.pinCode}
                </div>
              )}
            </div>

            {/* 2.7 Country (Fixed: India) */}
            <div>
              <label style={labelStyle}>COUNTRY (Jurisdiction)</label>
              <div
                style={{
                  ...inputStyle(),
                  background: "#F8FAFC",
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#475569",
                  fontWeight: 600,
                  userSelect: "none",
                }}
              >
                <span>India</span>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>Locked</span>
              </div>
            </div>

            {/* 2.8 Facility Landline */}
            <div>
              <label style={labelStyle}>FACILITY LANDLINE (STD — NUMBER — EXT)</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: "95px" }}>
                  <input
                    type="tel"
                    placeholder="STD (0891)"
                    maxLength={5}
                    value={landlineStd}
                    onChange={(e) => setLandlineStd(e.target.value.replace(/\D/g, ""))}
                    style={inputStyle()}
                  />
                </div>
                <span style={{ color: "#94A3B8" }}>—</span>
                <div style={{ flex: 1 }}>
                  <input
                    type="tel"
                    placeholder="Telephone (e.g. 2748900)"
                    maxLength={8}
                    value={landlineNumber}
                    onChange={(e) => setLandlineNumber(e.target.value.replace(/\D/g, ""))}
                    style={inputStyle()}
                  />
                </div>
                <span style={{ color: "#94A3B8" }}>—</span>
                <div style={{ width: "85px" }}>
                  <input
                    type="tel"
                    placeholder="Ext (104)"
                    maxLength={5}
                    value={landlineExt}
                    onChange={(e) => setLandlineExt(e.target.value.replace(/\D/g, ""))}
                    style={inputStyle()}
                  />
                </div>
              </div>
            </div>

            {/* 2.9 Official Mobile */}
            <div id="field-orgMobile">
              <label style={labelStyle}>OFFICIAL HELPDESK MOBILE (+91)</label>
              <div
                className="input-phone-group"
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 8,
                  border: `1px solid ${fieldErrors.orgMobile || (orgMobileDigits && !isValidIndianMobile(orgMobileDigits)) ? "#EF4444" : "#CBD5E1"}`,
                  background: "#FFF",
                  overflow: "hidden",
                }}
              >
                <span style={{ background: "#F8FAFC", color: "#475569", padding: "10px 12px", fontSize: 13, fontWeight: 600, borderRight: "1px solid #E2E8F0", userSelect: "none" }}>+91</span>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={orgMobileDigits}
                  onChange={(e) => {
                    setOrgMobileDigits(e.target.value.replace(/\D/g, ""));
                    clearFieldError("orgMobile");
                  }}
                  onBlur={() => validateSingleField("orgMobile")}
                  style={{ border: "none", outline: "none", padding: "10px 12px", width: "100%", fontSize: 13.5, fontWeight: 500, background: "transparent" }}
                />
              </div>
              {fieldErrors.orgMobile && (
                <div style={{ color: "#EF4444", fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>
                  {fieldErrors.orgMobile}
                </div>
              )}
            </div>
          </div>

          {/* CARD 3: Primary & Secondary Contacts */}
          <div style={{ background: "#FFF", borderRadius: 10, padding: 22, border: "1px solid #E2E8F0", display: "grid", gap: 16 }}>
            <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: 10 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                3. Primary & Secondary Organization Contacts
              </h2>
            </div>

            {/* Primary Contact Block */}
            <div style={{ background: "#F8FAFC", padding: 16, borderRadius: 8, border: "1px solid #E2E8F0", display: "grid", gap: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", textTransform: "uppercase" }}>PRIMARY CONTACT</div>

              {/* Name */}
              <div id="field-primName">
                <label style={labelStyle}>FULL NAME <span style={{ color: "#EF4444" }}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Dr. K. S. Rao"
                  value={primName}
                  onChange={(e) => {
                    setPrimName(e.target.value);
                    clearFieldError("primName");
                  }}
                  onBlur={() => validateSingleField("primName")}
                  style={inputStyle(Boolean(fieldErrors.primName))}
                  required
                />
                {fieldErrors.primName && (
                  <div style={{ color: "#EF4444", fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>
                    {fieldErrors.primName}
                  </div>
                )}
              </div>

              {/* Designation */}
              <div>
                <label style={labelStyle}>DESIGNATION</label>
                <DesignationCombobox
                  value={primDesignation}
                  onChange={setPrimDesignation}
                  placeholder="Select or type designation..."
                  availableOptions={customDesignations}
                  onAddOption={handleAddNewDesignation}
                />
              </div>

              {/* Aadhaar */}
              <div id="field-primAadhaar">
                <label style={labelStyle}>AADHAAR NUMBER (12 DIGITS)</label>
                <input
                  type="text"
                  placeholder="e.g. 5489 1234 5678"
                  maxLength={14}
                  value={primAadhaar}
                  onChange={(e) => {
                    setPrimAadhaar(formatAadhaarInput(e.target.value));
                    clearFieldError("primAadhaar");
                  }}
                  onBlur={() => validateSingleField("primAadhaar")}
                  style={inputStyle(Boolean(fieldErrors.primAadhaar || (primAadhaar && !isValidAadhaar(primAadhaar))))}
                />
                {fieldErrors.primAadhaar && (
                  <div style={{ color: "#EF4444", fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>
                    {fieldErrors.primAadhaar}
                  </div>
                )}
              </div>

              {/* Landline */}
              <div>
                <label style={labelStyle}>LANDLINE NUMBER (STD — NUMBER — EXT)</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: "95px" }}>
                    <input
                      type="tel"
                      placeholder="STD (0891)"
                      maxLength={5}
                      value={primLandlineStd}
                      onChange={(e) => setPrimLandlineStd(e.target.value.replace(/\D/g, ""))}
                      style={inputStyle()}
                    />
                  </div>
                  <span style={{ color: "#94A3B8" }}>—</span>
                  <div style={{ flex: 1 }}>
                    <input
                      type="tel"
                      placeholder="Telephone"
                      maxLength={8}
                      value={primLandlineNumber}
                      onChange={(e) => setPrimLandlineNumber(e.target.value.replace(/\D/g, ""))}
                      style={inputStyle()}
                    />
                  </div>
                  <span style={{ color: "#94A3B8" }}>—</span>
                  <div style={{ width: "85px" }}>
                    <input
                      type="tel"
                      placeholder="Ext"
                      maxLength={5}
                      value={primLandlineExt}
                      onChange={(e) => setPrimLandlineExt(e.target.value.replace(/\D/g, ""))}
                      style={inputStyle()}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile */}
              <div id="field-primPhone">
                <label style={labelStyle}>MOBILE NUMBER (+91) <span style={{ color: "#EF4444" }}>*</span></label>
                <div
                  className="input-phone-group"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 8,
                    border: `1px solid ${fieldErrors.primPhone || (primPhoneDigits && !isValidIndianMobile(primPhoneDigits)) ? "#EF4444" : "#CBD5E1"}`,
                    background: "#FFF",
                    overflow: "hidden",
                  }}
                >
                  <span style={{ background: "#F8FAFC", color: "#475569", padding: "10px 12px", fontSize: 13, fontWeight: 600, borderRight: "1px solid #E2E8F0", userSelect: "none" }}>+91</span>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    maxLength={10}
                    value={primPhoneDigits}
                    onChange={(e) => {
                      setPrimPhoneDigits(e.target.value.replace(/\D/g, ""));
                      clearFieldError("primPhone");
                    }}
                    onBlur={() => validateSingleField("primPhone")}
                    style={{ border: "none", outline: "none", padding: "10px 12px", width: "100%", fontSize: 13.5, fontWeight: 500, background: "transparent" }}
                    required
                  />
                </div>
                {fieldErrors.primPhone && (
                  <div style={{ color: "#EF4444", fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>
                    {fieldErrors.primPhone}
                  </div>
                )}
              </div>

              {/* Email */}
              <div id="field-primEmail">
                <label style={labelStyle}>WORK EMAIL <span style={{ color: "#EF4444" }}>*</span></label>
                <input
                  type="email"
                  placeholder="e.g. admin@apollo.com"
                  value={primEmail}
                  onChange={(e) => {
                    setPrimEmail(e.target.value);
                    clearFieldError("primEmail");
                  }}
                  onBlur={() => validateSingleField("primEmail")}
                  style={inputStyle(Boolean(fieldErrors.primEmail))}
                  required
                />
                {fieldErrors.primEmail && (
                  <div style={{ color: "#EF4444", fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>
                    {fieldErrors.primEmail}
                  </div>
                )}
              </div>
            </div>

            {/* Secondary Contact Block */}
            <div style={{ background: "#F8FAFC", padding: 16, borderRadius: 8, border: "1px solid #E2E8F0", display: "grid", gap: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>SECONDARY CONTACT (OPS / IT LEAD)</div>

              {/* Name */}
              <div>
                <label style={labelStyle}>FULL NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Suresh Verma"
                  value={secName}
                  onChange={(e) => setSecName(e.target.value)}
                  style={inputStyle()}
                />
              </div>

              {/* Designation */}
              <div>
                <label style={labelStyle}>DESIGNATION</label>
                <DesignationCombobox
                  value={secDesignation}
                  onChange={setSecDesignation}
                  placeholder="Select or type designation..."
                  availableOptions={customDesignations}
                  onAddOption={handleAddNewDesignation}
                />
              </div>

              {/* Aadhaar */}
              <div id="field-secAadhaar">
                <label style={labelStyle}>AADHAAR NUMBER (12 DIGITS)</label>
                <input
                  type="text"
                  placeholder="e.g. 5489 1234 5678"
                  maxLength={14}
                  value={secAadhaar}
                  onChange={(e) => {
                    setSecAadhaar(formatAadhaarInput(e.target.value));
                    clearFieldError("secAadhaar");
                  }}
                  onBlur={() => validateSingleField("secAadhaar")}
                  style={inputStyle(Boolean(fieldErrors.secAadhaar || (secAadhaar && !isValidAadhaar(secAadhaar))))}
                />
                {fieldErrors.secAadhaar && (
                  <div style={{ color: "#EF4444", fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>
                    {fieldErrors.secAadhaar}
                  </div>
                )}
              </div>

              {/* Landline */}
              <div>
                <label style={labelStyle}>LANDLINE NUMBER (STD — NUMBER — EXT)</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: "95px" }}>
                    <input
                      type="tel"
                      placeholder="STD (0891)"
                      maxLength={5}
                      value={secLandlineStd}
                      onChange={(e) => setSecLandlineStd(e.target.value.replace(/\D/g, ""))}
                      style={inputStyle()}
                    />
                  </div>
                  <span style={{ color: "#94A3B8" }}>—</span>
                  <div style={{ flex: 1 }}>
                    <input
                      type="tel"
                      placeholder="Telephone"
                      maxLength={8}
                      value={secLandlineNumber}
                      onChange={(e) => setSecLandlineNumber(e.target.value.replace(/\D/g, ""))}
                      style={inputStyle()}
                    />
                  </div>
                  <span style={{ color: "#94A3B8" }}>—</span>
                  <div style={{ width: "85px" }}>
                    <input
                      type="tel"
                      placeholder="Ext"
                      maxLength={5}
                      value={secLandlineExt}
                      onChange={(e) => setSecLandlineExt(e.target.value.replace(/\D/g, ""))}
                      style={inputStyle()}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile */}
              <div id="field-secPhone">
                <label style={labelStyle}>MOBILE NUMBER (+91)</label>
                <div
                  className="input-phone-group"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 8,
                    border: `1px solid ${fieldErrors.secPhone || (secPhoneDigits && !isValidIndianMobile(secPhoneDigits)) ? "#EF4444" : "#CBD5E1"}`,
                    background: "#FFF",
                    overflow: "hidden",
                  }}
                >
                  <span style={{ background: "#F8FAFC", color: "#475569", padding: "10px 12px", fontSize: 13, fontWeight: 600, borderRight: "1px solid #E2E8F0", userSelect: "none" }}>+91</span>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    maxLength={10}
                    value={secPhoneDigits}
                    onChange={(e) => {
                      setSecPhoneDigits(e.target.value.replace(/\D/g, ""));
                      clearFieldError("secPhone");
                    }}
                    onBlur={() => validateSingleField("secPhone")}
                    style={{ border: "none", outline: "none", padding: "10px 12px", width: "100%", fontSize: 13.5, fontWeight: 500, background: "transparent" }}
                  />
                </div>
                {fieldErrors.secPhone && (
                  <div style={{ color: "#EF4444", fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>
                    {fieldErrors.secPhone}
                  </div>
                )}
              </div>

              {/* Email */}
              <div id="field-secEmail">
                <label style={labelStyle}>WORK EMAIL</label>
                <input
                  type="email"
                  placeholder="e.g. ops@apollo.com"
                  value={secEmail}
                  onChange={(e) => {
                    setSecEmail(e.target.value);
                    clearFieldError("secEmail");
                  }}
                  onBlur={() => validateSingleField("secEmail")}
                  style={inputStyle(Boolean(fieldErrors.secEmail))}
                />
                {fieldErrors.secEmail && (
                  <div style={{ color: "#EF4444", fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>
                    {fieldErrors.secEmail}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CARD 4: Tenant Admin Assignment */}
          <div style={{ background: "#FFF", borderRadius: 10, padding: 22, border: "1px solid #E2E8F0", display: "grid", gap: 12 }}>
            <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: 10 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                4. Organization Tenant Admin Assignment
              </h2>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 8, border: `1px solid ${adminContactTarget === "primary" ? "#0F172A" : "#E2E8F0"}`, background: adminContactTarget === "primary" ? "#F8FAFC" : "#FFF", cursor: "pointer" }}>
                <input type="radio" name="adminTarget" checked={adminContactTarget === "primary"} onChange={() => setAdminContactTarget("primary")} style={{ accentColor: "#0F172A" }} />
                <div>
                  <div style={{ fontWeight: 600, color: "#0F172A", fontSize: 13.5 }}>Assign Primary Contact as Tenant Admin</div>
                  <div style={{ fontSize: 11.5, color: "#64748B" }}>{primName ? `${primName} (${primEmail || (primPhoneDigits ? `+91 ${primPhoneDigits}` : "")})` : "Primary contact details"}</div>
                </div>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 8, border: `1px solid ${adminContactTarget === "secondary" ? "#0F172A" : "#E2E8F0"}`, background: adminContactTarget === "secondary" ? "#F8FAFC" : "#FFF", cursor: "pointer" }}>
                <input type="radio" name="adminTarget" checked={adminContactTarget === "secondary"} onChange={() => setAdminContactTarget("secondary")} style={{ accentColor: "#0F172A" }} />
                <div>
                  <div style={{ fontWeight: 600, color: "#0F172A", fontSize: 13.5 }}>Assign Secondary Contact as Tenant Admin</div>
                  <div style={{ fontSize: 11.5, color: "#64748B" }}>{secName ? `${secName} (${secEmail || (secPhoneDigits ? `+91 ${secPhoneDigits}` : "")})` : "Secondary contact details"}</div>
                </div>
              </label>
            </div>
          </div>

          {/* CARD 5: Signed Contract Upload & Signatory Audit */}
          <div style={{ background: "#FFF", borderRadius: 10, padding: 22, border: "1px solid #E2E8F0", display: "grid", gap: 16 }}>
            <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: 10 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                5. Signed Physical Contract & Signatory Verification
              </h2>
            </div>

            {/* File Upload */}
            <div style={{ background: "#F8FAFC", padding: 16, borderRadius: 8, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>PHYSICAL CONTRACT FILE</div>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setContractFileName(e.target.files[0].name);
                  }
                }}
                style={{ fontSize: 13 }}
              />
              {contractFileName && (
                <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: "#16A34A" }}>
                  ✓ File Attached: {contractFileName}
                </div>
              )}
            </div>

            {/* Signatory Inputs */}
            <div style={{ background: "#FFF", padding: 16, borderRadius: 8, border: "1px solid #E2E8F0", display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>CONTRACT SIGNATORY DETAILS</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button tabIndex={-1} type="button" onClick={() => handleAutofillSignatory("primary")} style={{ background: "#F1F5F9", color: "#334155", border: "1px solid #CBD5E1", borderRadius: 4, padding: "4px 10px", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>Autofill Primary</button>
                  <button tabIndex={-1} type="button" onClick={() => handleAutofillSignatory("secondary")} style={{ background: "#F1F5F9", color: "#334155", border: "1px solid #CBD5E1", borderRadius: 4, padding: "4px 10px", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>Autofill Secondary</button>
                </div>
              </div>

              {/* Name */}
              <div id="field-sigName">
                <label style={labelStyle}>SIGNATORY FULL NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. K. S. Rao"
                  value={sigName}
                  onChange={(e) => {
                    setSigName(e.target.value);
                    clearFieldError("sigName");
                    clearFieldError("signatoryMismatch");
                  }}
                  onBlur={() => validateSingleField("sigName")}
                  style={inputStyle(Boolean(fieldErrors.sigName))}
                />
                {fieldErrors.sigName && (
                  <div style={{ color: "#EF4444", fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>
                    {fieldErrors.sigName}
                  </div>
                )}
              </div>

              {/* Designation */}
              <div>
                <label style={labelStyle}>DESIGNATION</label>
                <DesignationCombobox
                  value={sigDesignation}
                  onChange={setSigDesignation}
                  placeholder="Select or type designation..."
                  availableOptions={customDesignations}
                  onAddOption={handleAddNewDesignation}
                />
              </div>

              {/* Aadhaar */}
              <div id="field-sigAadhaar">
                <label style={labelStyle}>AADHAAR NUMBER (12 DIGITS)</label>
                <input
                  type="text"
                  placeholder="e.g. 5489 1234 5678"
                  maxLength={14}
                  value={sigAadhaar}
                  onChange={(e) => {
                    setSigAadhaar(formatAadhaarInput(e.target.value));
                    clearFieldError("sigAadhaar");
                    clearFieldError("signatoryMismatch");
                  }}
                  onBlur={() => validateSingleField("sigAadhaar")}
                  style={inputStyle(Boolean(fieldErrors.sigAadhaar || (sigAadhaar && !isValidAadhaar(sigAadhaar))))}
                />
                {fieldErrors.sigAadhaar && (
                  <div style={{ color: "#EF4444", fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>
                    {fieldErrors.sigAadhaar}
                  </div>
                )}
              </div>

              {/* Landline */}
              <div>
                <label style={labelStyle}>LANDLINE NUMBER (STD — NUMBER — EXT)</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: "95px" }}>
                    <input
                      type="tel"
                      placeholder="STD (0891)"
                      maxLength={5}
                      value={sigLandlineStd}
                      onChange={(e) => setSigLandlineStd(e.target.value.replace(/\D/g, ""))}
                      style={inputStyle()}
                    />
                  </div>
                  <span style={{ color: "#94A3B8" }}>—</span>
                  <div style={{ flex: 1 }}>
                    <input
                      type="tel"
                      placeholder="Telephone"
                      maxLength={8}
                      value={sigLandlineNumber}
                      onChange={(e) => setSigLandlineNumber(e.target.value.replace(/\D/g, ""))}
                      style={inputStyle()}
                    />
                  </div>
                  <span style={{ color: "#94A3B8" }}>—</span>
                  <div style={{ width: "85px" }}>
                    <input
                      type="tel"
                      placeholder="Ext"
                      maxLength={5}
                      value={sigLandlineExt}
                      onChange={(e) => setLandlineExt(e.target.value.replace(/\D/g, ""))}
                      style={inputStyle()}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile */}
              <div id="field-sigPhone">
                <label style={labelStyle}>MOBILE NUMBER (+91)</label>
                <div
                  className="input-phone-group"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 8,
                    border: `1px solid ${fieldErrors.sigPhone || (sigPhoneDigits && !isValidIndianMobile(sigPhoneDigits)) ? "#EF4444" : "#CBD5E1"}`,
                    background: "#FFF",
                    overflow: "hidden",
                  }}
                >
                  <span style={{ background: "#F8FAFC", color: "#475569", padding: "10px 12px", fontSize: 13, fontWeight: 600, borderRight: "1px solid #E2E8F0", userSelect: "none" }}>+91</span>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    maxLength={10}
                    value={sigPhoneDigits}
                    onChange={(e) => {
                      setSigPhoneDigits(e.target.value.replace(/\D/g, ""));
                      clearFieldError("sigPhone");
                      clearFieldError("signatoryMismatch");
                    }}
                    onBlur={() => validateSingleField("sigPhone")}
                    style={{ border: "none", outline: "none", padding: "10px 12px", width: "100%", fontSize: 13.5, fontWeight: 500, background: "transparent" }}
                  />
                </div>
                {fieldErrors.sigPhone && (
                  <div style={{ color: "#EF4444", fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>
                    {fieldErrors.sigPhone}
                  </div>
                )}
              </div>

              {/* Email */}
              <div id="field-sigEmail">
                <label style={labelStyle}>WORK EMAIL</label>
                <input
                  type="email"
                  placeholder="e.g. admin@apollo.com"
                  value={sigEmail}
                  onChange={(e) => {
                    setSigEmail(e.target.value);
                    clearFieldError("sigEmail");
                    clearFieldError("signatoryMismatch");
                  }}
                  onBlur={() => validateSingleField("sigEmail")}
                  style={inputStyle(Boolean(fieldErrors.sigEmail))}
                />
                {fieldErrors.sigEmail && (
                  <div style={{ color: "#EF4444", fontSize: 11.5, fontWeight: 600, marginTop: 4 }}>
                    {fieldErrors.sigEmail}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button
              type="submit"
              disabled={provisioningLoading}
              style={{
                background: "#0F172A",
                color: "#FFF",
                border: "none",
                borderRadius: 8,
                padding: "12px 32px",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
            >
              {provisioningLoading ? "Provisioning Organization..." : "⚡ Provision Organization & Issue Admin Access"}
            </button>
          </div>
        </form>
      )}

      {/* STAGE 2: Tenant Admin Handover Certificate */}
      {currentStage === 2 && (
        <div style={{ background: "#FFF", borderRadius: 10, padding: 28, border: "1px solid #E2E8F0", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
          <h2 style={{ color: "#0F172A", fontSize: 22, margin: "0 0 6px", fontWeight: 700 }}>
            Tenant Provisioned & Admin Issued
          </h2>
          <p style={{ color: "#64748B", fontSize: 14, maxWidth: 560, margin: "0 auto 24px" }}>
            Database instance and Keycloak administrative identity created. Provide credentials to the hospital administrator.
          </p>

          <div
            style={{
              background: "#0F172A",
              borderRadius: 10,
              padding: 22,
              color: "#FFF",
              maxWidth: 640,
              margin: "0 auto 24px",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155", paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: 0.5 }}>TENANT HANDOVER</span>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{orgName || tenantId.toUpperCase()}</div>
              </div>
              <span style={{ background: "#16A34A", color: "#FFF", borderRadius: 4, padding: "4px 10px", fontWeight: 600, fontSize: 11.5 }}>
                PROVISIONED
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>PORTAL URL</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#38BDF8" }}>https://{customUrl || `${tenantId}.hms.zensynq.com`}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>ADMINISTRATOR</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{adminTargetObj.name}</div>
                <div style={{ fontSize: 12, color: "#94A3B8" }}>{adminTargetObj.email || adminTargetObj.phone}</div>
              </div>
            </div>

            <div style={{ background: "#1E293B", borderRadius: 8, padding: 14, border: "1px solid #334155", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>INITIAL TEMPORARY PASSCODE</div>
                <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: "#FFF" }}>{tempPasscode}</div>
              </div>
              <button
                type="button"
                onClick={handleCopyCredentials}
                style={{
                  background: copiedToast ? "#16A34A" : "#38BDF8",
                  color: copiedToast ? "#FFF" : "#0F172A",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {copiedToast ? "✓ Copied" : "Copy Credentials"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, borderTop: "1px solid #334155", paddingTop: 12, fontSize: 11.5 }}>
              <div><span style={{ color: "#94A3B8" }}>DB:</span> <strong>{isolatedDb ? "Dedicated" : "Multi-Tenant"}</strong></div>
              <div><span style={{ color: "#94A3B8" }}>Region:</span> <strong>{region === "india" ? "India (AP)" : "AP Local"}</strong></div>
              <div><span style={{ color: "#94A3B8" }}>Scope:</span> <strong>`role: admin`</strong></div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <button
              onClick={() => navigate(`/tenants`)}
              style={{
                background: "#0F172A",
                color: "#FFF",
                border: "none",
                borderRadius: 6,
                padding: "10px 22px",
                fontWeight: 600,
                fontSize: 13.5,
                cursor: "pointer",
              }}
            >
              View in Tenant Roster →
            </button>
            <button
              onClick={() => {
                setCurrentStage(1);
                setOrgName("");
                setTenantId("");
                setCustomUrl("");
                setDoorNo("");
                setAddressLine1("");
                setAddressLine2("");
                setCity("");
                setPinCode("");
                setLandlineStd("");
                setLandlineNumber("");
                setLandlineExt("");
                setOrgMobileDigits("");
                setPrimName("");
                setPrimDesignation("");
                setPrimAadhaar("");
                setPrimLandlineStd("");
                setPrimLandlineNumber("");
                setPrimLandlineExt("");
                setPrimPhoneDigits("");
                setPrimEmail("");
                setSecName("");
                setSecDesignation("");
                setSecAadhaar("");
                setSecLandlineStd("");
                setSecLandlineNumber("");
                setSecLandlineExt("");
                setSecPhoneDigits("");
                setSecEmail("");
                setSigName("");
                setSigDesignation("");
                setSigAadhaar("");
                setSigLandlineStd("");
                setSigLandlineNumber("");
                setSigLandlineExt("");
                setSigPhoneDigits("");
                setSigEmail("");
                setFieldErrors({});
                setError(null);
              }}
              style={{
                background: "#FFF",
                color: "#0F172A",
                border: "1px solid #CBD5E1",
                borderRadius: 6,
                padding: "10px 18px",
                fontWeight: 600,
                fontSize: 13.5,
                cursor: "pointer",
              }}
            >
              + Onboard Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
