import i18n from "i18next";
import { initReactI18next } from "react-i18next";

let savedLng = "en";
try {
  const stored = typeof window !== "undefined" ? localStorage.getItem("i18next-lng") : null;
  if (stored) {
    savedLng = stored.startsWith("te") ? "te" : "en";
  } else if (typeof navigator !== "undefined") {
    const navLng = navigator.language || "";
    savedLng = navLng.startsWith("te") ? "te" : "en";
  }
} catch (e) {
  savedLng = "en";
}

const resources = {
  en: {
    translation: {
      // Patients screen
      patients_title: "Patients",
      search_placeholder: "Search by name…",
      loading: "Loading…",
      failed_to_load: "Failed to load — is the backend up?",
      no_patients_match: "No patients match.",
      retry: "Retry",
      quick_register: "Quick register",
      given_name: "Given name",
      family_name: "Family name",
      register: "Register",
      saving: "Saving…",
      abha_linked: "ABHA linked",
      no_abha: "No ABHA",
      registration_disclaimer: "Full registration with Aadhaar verification, ABHA linking, and insurance capture.",
      register_patient_btn: "Register Patient",
      gender: "Sex/Gender",
      phone: "Mobile Phone Number",
      email: "Email Address",
      national_id: "National ID (Aadhaar)",
      abha_number: "ABHA Health ID Number",
      abha_address: "ABHA Address",
      aadhaar_last_four: "Aadhaar Last 4 Digits",
      address_line1: "Street / Area Address",
      address_city: "City / Town",
      address_state: "State",
      address_postal_code: "Postal Code",
      next_of_kin_name: "Emergency Contact Name",
      next_of_kin_relationship: "Relationship",
      next_of_kin_phone: "Contact Phone",
      aarogyasri_id: "Dr. YSR Aarogyasri Card ID",
      pmjay_id: "Ayushman Bharat PMJAY ID",
      referred_by_type: "Referrer Type",
      referred_by_name: "Referrer Name",
      referral_reason: "Referral Reason",
      requested_service: "Requested Treatment / Service",
      consent_general: "General Treatment Consent (v1.2)",
      consent_sharing: "ABDM Data Exchange Consent (v2.0)",

      // Sign In & Landing screen
      sign_in: "Sign in",
      dev_login_desc: "For local testing only.",
      login_primary_cta: "Log in",
      login_tagline: "Sign in to your clinic workspace.",
      dev_login_toggle: "Developer login",
      tenant: "Tenant",
      role: "Role",
      continue: "Continue",
      session_expired: "Session expired. Please sign in again.",

      // Header shell
      nav_home: "Home",
      nav_patients: "Patients",
      nav_my_schedule: "My Schedule",
      nav_billing: "Billing",
      nav_emr: "EMR / Clinical",
      nav_referrals: "Referrals",
      nav_reports: "Reports & Dashboard",
      nav_settings: "Settings",
      nav_scheduling: "Scheduling",
      nav_queue: "Queue Board",
      nav_reminders: "Reminders Preview",
      nav_operator_tenants: "Tenants Management",
      nav_operator_onboarding: "Onboarding Wizard",
      nav_operator_ops: "Platform Billing & Ops",
      nav_design: "Design",
      logout: "Log out",

      // Gating & Routing errors
      access_denied: "Access Denied",
      unauthorized_access: "Unauthorized Access",
      unauthorized_desc: "Your current role ({{role}}) does not have permission to view this section.",
      return_to_patients: "Return to Patients",
      error_404: "404 Error",
      page_not_found: "Page Not Found",
      page_not_found_desc: "The requested page does not exist or has been moved.",
      system_error: "System Error",
      something_went_wrong: "Something went wrong",
      critical_error_desc: "A critical application error occurred.",
      reload_page: "Reload Page",

      // Stubs
      billing_title: "Billing & Invoices",
      pending_bills: "Pending Bills",
      awaiting_cash: "Awaiting cash collection",
      emr_title: "Electronic Medical Records (EMR)",
      active_consultations: "Active Consultations",
      emr_desc: "EMR workflow, SOAP notes templates, and structured prescriptions.",
      settings_title: "Tenant Settings",
      branding_config: "Branding & Region Config",
      target_market: "Target Market",
      referral_commission: "Referral Attributions",
      nmc_regulation_note: "NMC regulations lock fee sharing in India",

      // Design System Showcase
      design_system_title: "MediGo Design System",
      buttons_statuses: "1. Buttons & Statuses",
      btn_primary: "Primary",
      btn_ghost: "Ghost",
      btn_disabled: "Disabled",
      status_brand: "Brand",
      status_info: "Arrived",
      status_warn: "In consult",
      status_success: "Done",
      status_danger: "Prereq unmet",
      form_custom_inputs: "2. Form & Custom Inputs",
      field_specialty: "Specialty",
      specialty_sub: "Search by symptom or department",
      field_selected_date: "Selected Date",
      selected_date_sub: "From DateChips control below",
      dropdown_select: "Dropdown Select",
      filter_chips: "Filter Chips",
      all_visits: "All Visits",
      active: "Active",
      pending_billing: "Pending Billing",
      radio_pill_selector: "Radio Pill Selector",
      date_selection_chips: "Date Selection Chips",
      loading_skeletons: "3. Loading Skeletons",
      overlays_notifications: "4. Overlays & Notifications",
      open_modal: "Open Modal",
      open_drawer: "Open Drawer",
      trigger_toast: "Trigger Toast",
      confirm_action: "Confirm Action",
      modal_desc: "Are you sure you want to proceed? This overlay modal traps focus and uses a smooth scale animation.",
      cancel: "Cancel",
      confirm: "Confirm",
      patient_record_summary: "Patient Record Summary",
      full_name: "Full Name",
      abha_status: "ABHA Status",
      mobile_number: "Mobile Number",
      open_full_record: "Open Full Record"
    }
  },
  te: {
    translation: {
      // Patients screen
      patients_title: "రోగులు",
      search_placeholder: "పేరుతో వెతకండి…",
      loading: "లోడ్ అవుతోంది…",
      failed_to_load: "లోడ్ చేయడం విఫలమైంది — బ్యాకెండ్ ఆన్‌లో ఉందా?",
      no_patients_match: "రోగులెవరూ సరిపోలలేదు.",
      retry: "మళ్లీ ప్రయత్నించండి",
      quick_register: "త్వరిత నమోదు",
      given_name: "మొదటి పేరు",
      family_name: "ఇంటి పేరు",
      register: "నమోదు చేయండి",
      saving: "సేవ్ అవుతోంది…",
      abha_linked: "ABHA లింక్ చేయబడింది",
      no_abha: "ABHA లేదు",
      registration_disclaimer: "ఆధార్ ధృవీకరణ, ABHA లింకింగ్ మరియు ఇన్సూరెన్స్‌తో పూర్తి నమోదు.",
      register_patient_btn: "రోగిని నమోదు చేయండి",
      gender: "లింగము",
      phone: "మొబైల్ ఫోన్ నంబర్",
      email: "ఇమెయిల్ చిరునామా",
      national_id: "జాతీయ ఐడి (ఆధార్)",
      abha_number: "ABHA హెల్త్ ఐడి సంఖ్య",
      abha_address: "ABHA చిరునామా",
      aadhaar_last_four: "ఆధార్ చివరి 4 అంకెలు",
      address_line1: "వీధి / ప్రాంతం చిరునామా",
      address_city: "నగరం / పట్టణం",
      address_state: "రాష్ట్రం",
      address_postal_code: "పోస్టల్ కోడ్",
      next_of_kin_name: "అత్యవసర సంప్రదింపు వ్యక్తి పేరు",
      next_of_kin_relationship: "సంబంధం",
      next_of_kin_phone: "సంప్రదింపు ఫోన్",
      aarogyasri_id: "డా. వైఎస్ఆర్ ఆరోగ్యశ్రీ కార్డ్ ఐడి",
      pmjay_id: "ఆయుష్మాన్ భారత్ PMJAY ఐడి",
      referred_by_type: "రెఫరర్ రకం",
      referred_by_name: "రెఫరర్ పేరు",
      referral_reason: "రెఫరల్ కారణం",
      requested_service: "అభ్యర్థించిన చికిత్స / సేవ",
      consent_general: "సాధారణ చికిత్స సమ్మతి (v1.2)",
      consent_sharing: "ABDM డేటా మార్పిడి సమ్మతి (v2.0)",

      // Sign In & Landing screen
      sign_in: "సైన్ ఇన్",
      dev_login_desc: "స్థానిక పరీక్ష కోసం మాత్రమే.",
      login_primary_cta: "లాగిన్",
      login_tagline: "మీ క్లినిక్ వర్క్‌స్పేస్‌కి లాగిన్ చేయండి.",
      dev_login_toggle: "డెవలపర్ లాగిన్",
      tenant: "టెనెంట్",
      role: "పాత్ర (రోల్)",
      continue: "కొనసాగించు",
      session_expired: "సెషన్ గడువు ముగిసింది. దయచేసి మళ్లీ లాగిన్ అవ్వండి.",

      // Header shell
      nav_patients: "రోగులు",
      nav_billing: "బిల్లింగ్",
      nav_emr: "ఈఎంఆర్",
      nav_settings: "సెట్టింగులు",
      nav_scheduling: "షెడ్యూలింగ్",
      nav_queue: "క్యూ బోర్డు",
      nav_reminders: "రిమైండర్లు",
      nav_design: "డిజైన్",
      logout: "లాగ్ అవుట్",

      // Gating & Routing errors
      access_denied: "యాక్సెస్ తిరస్కరించబడింది",
      unauthorized_access: "అనధికారిక యాక్సెస్",
      unauthorized_desc: "మీ ప్రస్తుత పాత్ర ({{role}})కు ఈ విభాగాన్ని వీక్షించడానికి అనుమతి లేదు.",
      return_to_patients: "రోగుల విభాగానికి తిరిగి వెళ్లండి",
      error_404: "404 లోపం",
      page_not_found: "పేజీ కనుగొనబడలేదు",
      page_not_found_desc: "అభ్యర్థించిన పేజీ ఉనికిలో లేదు లేదా తరలించబడింది.",
      system_error: "సిస్టమ్ లోపం",
      something_went_wrong: "ఏదో తప్పు జరిగింది",
      critical_error_desc: "ఒక క్లిష్టమైన అప్లికేషన్ లోపం సంభవించింది.",
      reload_page: "పేజీని మళ్లీ లోడ్ చేయి",

      // Stubs
      billing_title: "బిల్లింగ్ & ఇన్వాయిస్లు",
      pending_bills: "పెండింగ్ బిల్లులు",
      awaiting_cash: "నగదు సేకరణ కోసం ఎదురుచూస్తోంది",
      emr_title: "ఎలక్ట్రానిక్ మెడికల్ రికార్డ్స్ (ఈఎంఆర్)",
      active_consultations: "క్రియాశీల సంప్రదింపులు",
      emr_desc: "ఈఎంఆర్ వర్క్‌ఫ్లో, SOAP నోట్స్ టెంప్లేట్లు మరియు నిర్మాణాత్మక ప్రిస్క్రిప్షన్లు చురుకైన అభివృద్ధిలో ఉన్నాయి.",
      settings_title: "టెనెంట్ సెట్టింగులు",
      branding_config: "బ్రాండింగ్ & ప్రాంతీయ కాన్ఫిగరేషన్",
      target_market: "లక్ష్య మార్కెట్",
      referral_commission: "రెఫరల్ సమాచారం",
      locked_prohibited: "లాక్ చేయబడింది / నిషేధించబడింది",
      nmc_regulation_note: "ఎన్ఎమ్సి నిబంధనలు రుసుము భాగస్వామ్యాన్ని లాక్ చేస్తాయి",

      // Design System Showcase
      design_system_title: "మెడిగో డిజైన్ సిస్టమ్",
      buttons_statuses: "1. బటన్లు & స్థితులు",
      btn_primary: "ప్రాథమిక",
      btn_ghost: "ఘోస్ట్",
      btn_disabled: "నిలిపివేయబడింది",
      status_brand: "బ్రాండ్",
      status_info: "చేరుకున్నారు",
      status_warn: "సంప్రదింపులలో",
      status_success: "పూర్తయింది",
      status_danger: "ముందస్తు అవసరం తీరలేదు",
      form_custom_inputs: "2. ఫారమ్ & అనుకూల ఇన్‌పుట్‌లు",
      field_specialty: "ప్రత్యేకత",
      specialty_sub: "లక్షణం లేదా విభాగం ద్వారా శోధించండి",
      field_selected_date: "ఎంచుకున్న తేదీ",
      selected_date_sub: "క్రింది తేదీ చిప్స్ నియంత్రణ నుండి",
      dropdown_select: "డ్రాప్‌డౌన్ ఎంపిక",
      filter_chips: "ఫిల్టర్ చిప్స్",
      all_visits: "అన్ని సందర్శనలు",
      active: "క్రియాశీల",
      pending_billing: "పెండింగ్ బిల్లింగ్",
      radio_pill_selector: "రేడియో పిల్ సెలెక్టర్",
      date_selection_chips: "తేదీ ఎంపిక చిప్స్",
      loading_skeletons: "3. లోడింగ్ అస్థిపంజరాలు",
      overlays_notifications: "4. ఓవర్‌లేలు & నోటిఫికేషన్‌లు",
      open_modal: "మోడల్ తెరువు",
      open_drawer: "డ్రాయర్ తెరువు",
      trigger_toast: "టోస్ట్ ట్రిగ్గర్ చేయి",
      confirm_action: "చర్యను ధృవీకరించండి",
      modal_desc: "మీరు కొనసాగించాలనుకుంటున్నారా? ఈ మోడల్ ఓవర్‌లే దృష్టిని బంధిస్తుంది మరియు సున్నితమైన యానిమేషన్‌ను ఉపయోగిస్తుంది.",
      cancel: "రద్దు చేయి",
      confirm: "ధృవీకరించు",
      patient_record_summary: "రోగి రికార్డు సారాంశం",
      full_name: "పూర్తి పేరు",
      abha_status: "ABHA స్థితి",
      mobile_number: "మొబైల్ సంఖ్య",
      open_full_record: "పూర్తి రికార్డును తెరువు"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLng,
    fallbackLng: "en",
    supportedLngs: ["en", "te"],
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    debug: true,
    interpolation: {
      escapeValue: false
    }
  });

i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem("i18next-lng", lng);
  } catch (e) {
    // Ignore storage blocks in sandboxed/restricted environments
  }
});

export default i18n;
