/** Thin API client. Types come from src/api/schema.d.ts, generated from the
 * backend's OpenAPI spec via `npm run generate:api` — regenerate after any
 * backend change and COMMIT the result, so contract drift shows as a diff and
 * a compile error, never a runtime surprise. */

import { components } from "./schema";

export type PatientOut = components["schemas"]["PatientOut"];
export type PatientCreate = components["schemas"]["PatientCreate"];
export type AllergyIntoleranceOut = components["schemas"]["AllergyIntoleranceOut"];
export type AllergyIntoleranceCreate = components["schemas"]["AllergyIntoleranceCreate"];
export type AppointmentOut = components["schemas"]["AppointmentOut"];
export type AppointmentDetailOut = components["schemas"]["AppointmentDetailOut"];
export type AppointmentCreate = components["schemas"]["AppointmentCreate"];
export type QueueItemOut = components["schemas"]["QueueItemOut"];


export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function request<T>(path: string, token: string | null, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent("auth-401"));
    }
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body || res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listPatients: (token: string | null) => request<PatientOut[]>("/patients", token),
  createPatient: (token: string | null, body: PatientCreate, force = false) =>
    request<PatientOut>(`/patients${force ? "?force=true" : ""}`, token, { method: "POST", body: JSON.stringify(body) }),
  getPatient: (token: string | null, id: string) => request<PatientOut>(`/patients/${id}`, token),
  updatePatient: (token: string | null, id: string, body: PatientCreate) =>
    request<PatientOut>(`/patients/${id}`, token, { method: "PUT", body: JSON.stringify(body) }),
  listAllergies: (token: string | null, patientId: string) =>
    request<any>(`/emr/patients/${patientId}/summary`, token).then((res) => res?.allergies || []),
  assertAllergy: (token: string | null, patientId: string, body: AllergyIntoleranceCreate) =>
    request<AllergyIntoleranceOut>(`/patients/${patientId}/allergies`, token, { method: "POST", body: JSON.stringify(body) }),
  listAppointments: (token: string | null, status?: string) =>
    request<AppointmentOut[]>(`/scheduling/appointments${status ? `?status=${status}` : ""}`, token),
  bookAppointment: (token: string | null, body: AppointmentCreate) =>
    request<AppointmentOut>("/scheduling/appointments", token, { method: "POST", body: JSON.stringify(body) }),
  getAppointment: (token: string | null, id: string) =>
    request<AppointmentDetailOut>(`/scheduling/appointments/${id}`, token),
  checkInAppointment: (token: string | null, id: string) =>
    request<AppointmentOut>(`/scheduling/appointments/${id}/check-in`, token, { method: "POST" }),
  updateAppointmentStatus: (token: string | null, id: string, status: string) =>
    request<AppointmentOut>(`/scheduling/appointments/${id}/status?status=${status}`, token, { method: "POST" }),
  satisfyPrerequisite: (token: string | null, id: string, prereqId: string) =>
    request<AppointmentDetailOut>(`/scheduling/appointments/${id}/prerequisites/${prereqId}/satisfy`, token, { method: "POST" }),
  getClinicQueue: (token: string | null, room?: string) =>
    request<QueueItemOut[]>(`/scheduling/queue${room ? `?room=${room}` : ""}`, token),
  
  // EMR Endpoints (Sprint U4)
  getPatientSummary: (token: string | null, patientId: string) =>
    request<components["schemas"]["PatientSummaryOut"]>(`/emr/patients/${patientId}/summary`, token),
  createEncounter: (token: string | null, body: components["schemas"]["EncounterCreate"]) =>
    request<components["schemas"]["EncounterOut"]>("/emr/encounters", token, { method: "POST", body: JSON.stringify(body) }),
  saveClinicalNote: (token: string | null, encounterId: string, body: components["schemas"]["ClinicalNoteSave"]) =>
    request<components["schemas"]["ClinicalNoteOut"]>(`/emr/encounters/${encounterId}/notes`, token, { method: "PUT", body: JSON.stringify(body) }),
  signOffEncounter: (token: string | null, encounterId: string) =>
    request<components["schemas"]["EncounterOut"]>(`/emr/encounters/${encounterId}/sign-off`, token, { method: "POST" }),
  addEncounterAddendum: (token: string | null, encounterId: string, body: { content: string }) =>
    request<any>(`/emr/encounters/${encounterId}/addenda`, token, { method: "POST", body: JSON.stringify(body) }),
  recordVitalSign: (token: string | null, encounterId: string, body: any) =>
    request<any>(`/emr/encounters/${encounterId}/vitals`, token, { method: "POST", body: JSON.stringify(body) }),
  createProblem: (token: string | null, patientId: string, body: any) =>
    request<any>(`/emr/patients/${patientId}/problems`, token, { method: "POST", body: JSON.stringify(body) }),
  
  // Prescription Endpoints (Sprint U4)
  searchDrugs: (token: string | null, query: string) =>
    request<components["schemas"]["MedicationCatalogOut"][]>(`/rx/drugs?q=${encodeURIComponent(query)}`, token),
  createPrescription: (token: string | null, body: components["schemas"]["PrescriptionCreate"]) =>
    request<components["schemas"]["PrescriptionOut"]>("/rx/prescriptions", token, { method: "POST", body: JSON.stringify(body) }),
  signPrescription: (token: string | null, prescriptionId: string, body: components["schemas"]["PrescriptionSign"]) =>
    request<components["schemas"]["PrescriptionOut"]>(`/rx/prescriptions/${prescriptionId}/sign`, token, { method: "POST", body: JSON.stringify(body) }),

  // Orders & Catalog Endpoints (Sprint U5)
  listCatalogItems: (token: string | null, query: string) =>
    request<any[]>(`/ord/catalog?q=${encodeURIComponent(query)}`, token),
  createOrder: (token: string | null, body: any) =>
    request<any>("/ord/orders", token, { method: "POST", body: JSON.stringify(body) }),
  getOrders: (token: string | null, patientId: string) =>
    request<any[]>(`/ord/orders?patient_id=${patientId}`, token),
  
  // Results Endpoints (Sprint U5)
  listClinicianInbox: (token: string | null) =>
    request<any[]>("/ord/clinicians/inbox", token),
  acknowledgeResult: (token: string | null, resultId: string) =>
    request<any>(`/ord/results/${resultId}/acknowledge`, token, { method: "POST" }),
  listPatientAnalytes: (token: string | null, patientId: string) =>
    request<any[]>(`/ord/patients/${patientId}/analytes`, token),

  // Billing Endpoints (Sprint U5)
  listInvoices: (token: string | null, patientId: string) =>
    request<any[]>(`/bil/invoices?patient_id=${patientId}`, token),
  createInvoice: (token: string | null, body: any) =>
    request<any>("/bil/invoices", token, { method: "POST", body: JSON.stringify(body) }),
  finalizeInvoice: (token: string | null, invoiceId: string) =>
    request<any>(`/bil/invoices/${invoiceId}/finalize`, token, { method: "POST" }),
  recordPayment: (token: string | null, body: any) =>
    request<any>("/bil/payments", token, { method: "POST", body: JSON.stringify(body) }),
  getTillSummary: (token: string | null) =>
    request<any>("/bil/till-summary", token),

  // Patient Portal Endpoints (Sprint U6)
  activatePortal: (token: string | null, body: any) =>
    request<any>("/por/activate", token, { method: "POST", body: JSON.stringify(body) }),
  getPortalVisits: (token: string | null) =>
    request<any[]>("/por/visits", token),
  submitIntakeForms: (token: string | null, appointmentId: string, body: any) =>
    request<any>(`/por/intake?appointment_id=${appointmentId}`, token, { method: "POST", body: JSON.stringify(body) }),
  
  // Reports & Analytics Endpoints (Sprint U6)
  listOpsMetrics: (token: string | null, siteId: string) =>
    request<any>(`/rpt/ops-metrics?site_id=${siteId}`, token),
  listReferralAnalytics: (token: string | null) =>
    request<any[]>("/rpt/referrals", token),

  // Tenant Operations & Platform Control Endpoints (Sprints N3, N4, N5)
  listTenants: (token: string | null) =>
    request<any[]>("/tenants", token),
  provisionTenant: (token: string | null, body: any) =>
    request<any>("/tenants", token, { method: "POST", body: JSON.stringify(body) }),
  getTenant: (token: string | null, id: string) =>
    request<any>(`/tenants/${id}`, token),
  updateTenantStatus: (token: string | null, id: string, body: any) =>
    request<any>(`/tenants/${id}/status`, token, { method: "PATCH", body: JSON.stringify(body) }),
  configureSetupWizard: (token: string | null, id: string, body: any) =>
    request<any>(`/tenants/${id}/wizard/config`, token, { method: "POST", body: JSON.stringify(body) }),
  inviteStaff: (token: string | null, id: string, body: any) =>
    request<any>(`/tenants/${id}/invitations`, token, { method: "POST", body: JSON.stringify(body) }),
  stageMigration: (token: string | null, id: string, body: any) =>
    request<any>(`/tenants/${id}/migration/stage`, token, { method: "POST", body: JSON.stringify(body) }),
  reconcileMigration: (token: string | null, id: string, body: any) =>
    request<any>(`/tenants/${id}/migration/reconcile`, token, { method: "POST", body: JSON.stringify(body) }),
  getReadinessChecklist: (token: string | null, id: string) =>
    request<any>(`/tenants/${id}/readiness`, token),
  goLiveTenant: (token: string | null, id: string) =>
    request<any>(`/tenants/${id}/go-live`, token, { method: "POST" }),
  exportTenantFhir: (token: string | null, id: string) =>
    request<any>(`/tenants/${id}/export/fhir`, token),
  getTenantMetrics: (token: string | null) =>
    request<any>("/tenants/metrics", token),
  createSubscriptionInvoice: (token: string | null, id: string, body: any) =>
    request<any>(`/tenants/${id}/invoices`, token, { method: "POST", body: JSON.stringify(body) }),
  processPreAuthClaim: (token: string | null, id: string, body: any) =>
    request<any>(`/tenants/${id}/claims/pre-auth`, token, { method: "POST", body: JSON.stringify(body) }),
  suspendTenant: (token: string | null, id: string, body: any) =>
    request<any>(`/tenants/${id}/suspend`, token, { method: "POST", body: JSON.stringify(body) }),
  overrideTenant: (token: string | null, id: string, body: any) =>
    request<any>(`/tenants/${id}/override`, token, { method: "POST", body: JSON.stringify(body) }),
};
