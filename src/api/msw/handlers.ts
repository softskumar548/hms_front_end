import { http, HttpResponse } from "msw";
import { PatientOut, PatientCreate, AllergyIntoleranceOut, AllergyIntoleranceCreate } from "../client";

// In-memory mock patient database using Indian synthetic names (AGENTS.md)
let mockPatients: PatientOut[] = [
  {
    id: "p-001",
    given_name: "Venkata",
    family_name: "Rama Rao",
    dob: "1972-04-15",
    national_id: "12-3456-7890",
    phone: "+919876543210",
    gender: "male",
    preferred_language: "te",
  },
  {
    id: "p-002",
    given_name: "Sita",
    family_name: "Devi",
    dob: "1980-08-20",
    national_id: null,
    phone: "+918765432109",
    gender: "female",
    preferred_language: "te",
  },
  {
    id: "p-003",
    given_name: "Krishna",
    family_name: "Murthy",
    dob: "1965-12-05",
    national_id: "98-7654-3210",
    phone: "+917654321098",
    gender: "male",
    preferred_language: "en",
  }
];

// In-memory mock allergies database
let mockAllergies: Record<string, AllergyIntoleranceOut[]> = {
  "p-001": [
    {
      id: "a-001",
      patient_id: "p-001",
      substance_display: "Penicillin",
      severity: "severe",
      is_no_known: false,
      asserted_at: new Date().toISOString(),
      asserted_by: "Dr. Srinivas"
    }
  ],
  "p-002": [
    {
      id: "a-002",
      patient_id: "p-002",
      substance_display: "Sulfa Drugs",
      severity: "moderate",
      is_no_known: false,
      asserted_at: new Date().toISOString(),
      asserted_by: "Dr. Srinivas"
    }
  ]
};

// In-memory mock appointments database (Sprint U3)
interface MockPrerequisite {
  prerequisite_id: string;
  satisfied: boolean;
  satisfied_at?: string | null;
  satisfied_by?: string | null;
  code: string;
  description: string;
  enforcement_type: string; // hard-stop, advisory
}

interface MockAppointment {
  id: string;
  patient_id: string;
  patient_name: string;
  practitioner_id: string;
  practitioner_name: string;
  site_id: string;
  site_name: string;
  room_id: string;
  room_name: string;
  service_id: string;
  service_name: string;
  status: string; // PENDING, ARRIVED, IN_CONSULTATION, COMPLETED, CANCELLED
  start_time: string;
  end_time: string;
  referred_by_id?: string | null;
  referred_by_name?: string | null;
  prerequisites: MockPrerequisite[];
}

let mockAppointments: MockAppointment[] = [
  {
    id: "appt-1",
    patient_id: "p-001",
    patient_name: "Venkata Rama Rao",
    practitioner_id: "doc-1",
    practitioner_name: "Dr. Srinivas",
    site_id: "site-1",
    site_name: "Apollo Visakhapatnam",
    room_id: "room-101",
    room_name: "Room 101 - Cardiology OPD",
    service_id: "service-1",
    service_name: "CT Scan Cardiology",
    status: "PENDING",
    start_time: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // in 2 hours
    end_time: new Date(Date.now() + 1000 * 60 * 60 * 2.5).toISOString(),
    prerequisites: [
      {
        prerequisite_id: "prereq-1",
        satisfied: false,
        code: "FASTING",
        description: "Fast for 12 hours before test (12 గంటలు ఖాళీ కడుపుతో ఉండాలి)",
        enforcement_type: "hard-stop",
      },
      {
        prerequisite_id: "prereq-2",
        satisfied: false,
        code: "CONTRAST_CONSENT",
        description: "Contrast injection consent signed (ఇంజెక్షన్ సమ్మతి పత్రం)",
        enforcement_type: "advisory",
      }
    ],
  },
  {
    id: "appt-2",
    patient_id: "p-002",
    patient_name: "Sita Devi",
    practitioner_id: "doc-2",
    practitioner_name: "Dr. Prasad",
    site_id: "site-1",
    site_name: "Apollo Visakhapatnam",
    room_id: "room-102",
    room_name: "Room 102 - General OPD",
    service_id: "service-2",
    service_name: "General Health Checkup",
    status: "ARRIVED",
    start_time: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    end_time: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    prerequisites: [],
  }
];

export const handlers = [
  // Intercept GET /api/patients
  http.get("/api/patients", () => {
    return HttpResponse.json(mockPatients);
  }),

  // Intercept POST /api/patients
  http.post("/api/patients", async ({ request }) => {
    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "true";
    const body = (await request.json()) as PatientCreate;

    // Run duplicate detection check if force parameter is false
    if (!force) {
      const duplicates = mockPatients.filter((p) => {
        // Deterministic matching on exact identifiers
        if (body.national_id && p.national_id === body.national_id) return true;
        if (body.abha_number && p.abha_number === body.abha_number) return true;
        if (body.aarogyasri_id && p.aarogyasri_id === body.aarogyasri_id) return true;
        if (body.pmjay_id && p.pmjay_id === body.pmjay_id) return true;

        // Probabilistic matching criteria
        let matchScore = 0;
        if (body.phone && p.phone === body.phone) matchScore += 0.4;
        if (body.dob && p.dob === body.dob) matchScore += 0.3;
        if (body.given_name && p.given_name.toLowerCase() === body.given_name.toLowerCase()) matchScore += 0.2;
        if (body.family_name && p.family_name.toLowerCase() === body.family_name.toLowerCase()) matchScore += 0.2;
        return matchScore >= 0.7;
      }).map(p => ({
        id: p.id,
        given_name: p.given_name,
        family_name: p.family_name,
        dob: p.dob,
        phone: p.phone,
        match_reason: "Matches name/DOB/contact criteria",
        score: 0.85
      }));

      if (duplicates.length > 0) {
        return HttpResponse.json(
          { detail: { message: "Duplicate patient detected", candidates: duplicates } },
          { status: 409 }
        );
      }
    }

    const newPatient: PatientOut = {
      id: `p-${Math.random().toString(36).substring(2, 11)}`,
      given_name: body.given_name,
      family_name: body.family_name,
      dob: body.dob || null,
      national_id: body.national_id || null,
      phone: body.phone || null,
      gender: body.gender || null,
      preferred_language: body.preferred_language || null,
      abha_number: body.abha_number || null,
      abha_address: body.abha_address || null,
      aarogyasri_id: body.aarogyasri_id || null,
      pmjay_id: body.pmjay_id || null,
      aadhaar_last_four: body.aadhaar_last_four || null,
      referred_by_type: body.referred_by_type || null,
      referred_by_name: body.referred_by_name || null,
      referred_by_id: body.referred_by_id || null,
      address: body.address || null,
      next_of_kin: body.next_of_kin || null,
    };
    mockPatients.push(newPatient);
    return HttpResponse.json(newPatient, { status: 201 });
  }),

  // Intercept GET /api/patients/:id
  http.get("/api/patients/:id", ({ params }) => {
    const { id } = params;
    const patient = mockPatients.find((p) => p.id === id);
    if (!patient) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(patient);
  }),

  // Intercept PUT /api/patients/:id
  http.put("/api/patients/:id", async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as PatientCreate;
    const index = mockPatients.findIndex((p) => p.id === id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    const updated = {
      ...mockPatients[index],
      ...body,
    };
    mockPatients[index] = updated;
    return HttpResponse.json(updated);
  }),

  // Intercept GET /api/emr/patients/:patientId/allergies
  http.get("/api/emr/patients/:patientId/allergies", ({ params }) => {
    const { patientId } = params;
    return HttpResponse.json(mockAllergies[patientId as string] || []);
  }),

  // Intercept POST /api/emr/patients/:patientId/allergies
  http.post("/api/emr/patients/:patientId/allergies", async ({ params, request }) => {
    const { patientId } = params;
    const body = (await request.json()) as AllergyIntoleranceCreate;
    const newAllergy: AllergyIntoleranceOut = {
      id: `a-${Math.random().toString(36).substring(2, 11)}`,
      patient_id: patientId as string,
      substance_code: body.substance_code || null,
      substance_display: body.substance_display || null,
      reaction: body.reaction || null,
      severity: body.severity || null,
      criticality: body.criticality || null,
      is_no_known: body.is_no_known,
      asserted_at: new Date().toISOString(),
      asserted_by: "Dr. Srinivas",
    };
    if (!mockAllergies[patientId as string]) {
      mockAllergies[patientId as string] = [];
    }
    mockAllergies[patientId as string].push(newAllergy);
    return HttpResponse.json(newAllergy, { status: 201 });
  }),

  // Intercept GET /api/scheduling/queue
  http.get("/api/scheduling/queue", ({ request }) => {
    const url = new URL(request.url);
    const room = url.searchParams.get("room");
    
    let list = mockAppointments.filter(
      (a) => a.status === "ARRIVED" || a.status === "IN_CONSULTATION"
    );
    if (room) {
      list = list.filter((a) => a.room_id === room);
    }
    
    const items = list.map((a) => ({
      appointment_id: a.id,
      patient_id: a.patient_id,
      patient_name: a.patient_name,
      status: a.status,
      start_time: a.start_time,
      service_name: a.service_name,
      practitioner_name: a.practitioner_name,
      site_name: a.site_name,
    }));
    return HttpResponse.json(items);
  }),

  // Intercept POST /api/scheduling/appointments
  http.post("/api/scheduling/appointments", async ({ request }) => {
    const body = (await request.json()) as any;
    
    // Check conflicts (practitioner overbook rule SCH-004)
    const hasConflict = mockAppointments.some((a) => {
      if (a.practitioner_id !== body.practitioner_id) return false;
      if (a.status === "CANCELLED") return false;
      
      const apptStart = new Date(a.start_time).getTime();
      const apptEnd = new Date(a.end_time).getTime();
      const bodyStart = new Date(body.start_time).getTime();
      const bodyEnd = new Date(body.end_time).getTime();
      
      return apptStart < bodyEnd && apptEnd > bodyStart; // overlap check
    });

    if (hasConflict) {
      return new HttpResponse("Appointment conflict: Practitioner is booked.", {
        status: 409,
        statusText: "Conflict",
      });
    }

    const patient = mockPatients.find((p) => p.id === body.patient_id);
    const patientName = patient ? `${patient.given_name} ${patient.family_name}` : "Unknown Patient";
    const apptId = `appt-${Math.random().toString(36).substring(2, 9)}`;

    // Resolve helpers based on IDs
    const practitionerName = body.practitioner_id === "doc-2" ? "Dr. Prasad (General)" : "Dr. Srinivas (Cardiology)";
    const roomId = body.practitioner_id === "doc-2" ? "room-102" : "room-101";
    const roomName = body.practitioner_id === "doc-2" ? "Room 102 - General OPD" : "Room 101 - Cardiology OPD";
    const serviceName = body.service_id === "service-2"
      ? "General Health Checkup"
      : body.service_id === "service-3"
      ? "Consultation Follow-up"
      : "CT Scan Cardiology";

    // Add mock prerequisites if booking a CT scan service (UI-302)
    const isScan = serviceName.toLowerCase().includes("scan") || body.service_id === "service-1";
    const prereqs: MockPrerequisite[] = isScan
      ? [
          {
            prerequisite_id: `prereq-${Math.random().toString(36).substring(2, 6)}`,
            satisfied: false,
            code: "FASTING",
            description: "Fast for 12 hours before test (12 గంటలు ఖాళీ కడుపుతో ఉండాలి)",
            enforcement_type: "hard-stop",
          },
          {
            prerequisite_id: `prereq-${Math.random().toString(36).substring(2, 6)}`,
            satisfied: false,
            code: "CONTRAST_CONSENT",
            description: "Contrast injection consent signed (ఇంజెక్షన్ సమ్మతి పత్రం)",
            enforcement_type: "advisory",
          }
        ]
      : [];

    const newAppt: MockAppointment = {
      id: apptId,
      patient_id: body.patient_id,
      patient_name: patientName,
      practitioner_id: body.practitioner_id,
      practitioner_name: practitionerName,
      site_id: body.site_id || "site-1",
      site_name: body.site_name || "Apollo Visakhapatnam",
      room_id: roomId,
      room_name: roomName,
      service_id: body.service_id,
      service_name: serviceName,
      status: "PENDING",
      start_time: body.start_time,
      end_time: body.end_time,
      referred_by_id: patient?.referred_by_id || null,
      referred_by_name: patient?.referred_by_name || null,
      prerequisites: prereqs,
    };

    mockAppointments.push(newAppt);
    return HttpResponse.json(newAppt, { status: 201 });
  }),

  // Intercept GET /api/scheduling/appointments/:id
  http.get("/api/scheduling/appointments/:id", ({ params }) => {
    const { id } = params;
    const appt = mockAppointments.find((a) => a.id === id);
    if (!appt) {
      return new HttpResponse("Appointment not found", { status: 404 });
    }
    return HttpResponse.json(appt);
  }),

  // Intercept POST /api/scheduling/appointments/:id/check-in
  http.post("/api/scheduling/appointments/:id/check-in", ({ params }) => {
    const { id } = params;
    const appt = mockAppointments.find((a) => a.id === id);
    if (!appt) {
      return new HttpResponse("Appointment not found", { status: 404 });
    }

    // Hard-stop validation (REF-061)
    const unmetHardStop = appt.prerequisites.some(
      (p) => !p.satisfied && p.enforcement_type === "hard-stop"
    );
    if (unmetHardStop) {
      return new HttpResponse(
        "Check-in blocked: unmet hard-stop clinical prerequisites exist.",
        { status: 400 }
      );
    }

    appt.status = "ARRIVED";
    return HttpResponse.json(appt);
  }),

  // Intercept POST /api/scheduling/appointments/:id/status
  http.post("/api/scheduling/appointments/:id/status", async ({ params, request }) => {
    const { id } = params;
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    
    const appt = mockAppointments.find((a) => a.id === id);
    if (!appt) {
      return new HttpResponse("Appointment not found", { status: 404 });
    }
    if (status) {
      appt.status = status.toUpperCase();
    }
    return HttpResponse.json(appt);
  }),

  // Intercept POST /api/scheduling/appointments/:id/prerequisites/:prereqId/satisfy
  http.post("/api/scheduling/appointments/:id/prerequisites/:prereqId/satisfy", ({ params }) => {
    const { id, prereqId } = params;
    const appt = mockAppointments.find((a) => a.id === id);
    if (!appt) {
      return new HttpResponse("Appointment not found", { status: 404 });
    }
    const prereq = appt.prerequisites.find((p) => p.prerequisite_id === prereqId);
    if (!prereq) {
      return new HttpResponse("Prerequisite not found", { status: 404 });
    }
    prereq.satisfied = true;
    prereq.satisfied_at = new Date().toISOString();
    prereq.satisfied_by = "Staff User";
    return HttpResponse.json(appt);
  }),

  // EMR & Prescription Endpoints (Sprint U4)
  http.get("/api/emr/patients/:patientId/summary", ({ params }) => {
    const { patientId } = params;
    const patient = mockPatients.find(p => p.id === patientId);
    if (!patient) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({
      demographics: patient,
      allergies: mockAllergies[patientId as string] || [],
      problems: mockProblems[patientId as string] || [],
      medications: mockMedications[patientId as string] || [],
      recent_vitals: mockVitals[patientId as string] || [],
      encounters: mockEncounters.filter(e => e.patient_id === patientId)
    });
  }),

  http.post("/api/emr/encounters", async ({ request }) => {
    const body = await request.json() as any;
    const encId = `enc-${Math.random().toString(36).substring(2, 9)}`;
    const newEnc = {
      id: encId,
      appointment_id: body.appointment_id || null,
      patient_id: body.patient_id,
      practitioner_id: body.practitioner_id,
      site_id: body.site_id || "site-1",
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: {
        id: `note-${Math.random().toString(36).substring(2, 9)}`,
        encounter_id: encId,
        template_type: "SOAP",
        structured_content: {
          subjective: "",
          objective: "",
          assessment: "",
          plan: "",
          icd10_code: "",
          icd10_display: ""
        },
        rich_text_content: "",
        version: 1
      },
      addenda: []
    };
    mockEncounters.push(newEnc);
    return HttpResponse.json(newEnc, { status: 201 });
  }),

  http.put("/api/emr/encounters/:encounterId/notes", async ({ params, request }) => {
    const { encounterId } = params;
    const body = await request.json() as any;
    const enc = mockEncounters.find(e => e.id === encounterId);
    if (!enc) return new HttpResponse(null, { status: 404 });
    if (enc.status === "signed") {
      return new HttpResponse("Cannot edit notes: Encounter is signed off.", { status: 400 });
    }
    enc.notes = {
      ...enc.notes,
      structured_content: body.structured_content || {},
      rich_text_content: body.rich_text_content || "",
      version: (enc.notes?.version || 1) + 1
    };
    enc.updated_at = new Date().toISOString();
    return HttpResponse.json(enc.notes);
  }),

  http.post("/api/emr/encounters/:encounterId/sign-off", ({ params }) => {
    const { encounterId } = params;
    const enc = mockEncounters.find(e => e.id === encounterId);
    if (!enc) return new HttpResponse(null, { status: 404 });
    
    const code = enc.notes?.structured_content?.icd10_code;
    if (!code) {
      return new HttpResponse("Diagnosis (ICD-10) is required before sign-off.", { status: 400 });
    }
    
    enc.status = "signed";
    enc.signed_at = new Date().toISOString();
    enc.signed_by = "Dr. Srinivas";
    enc.updated_at = new Date().toISOString();

    const patientId = enc.patient_id;
    if (!mockProblems[patientId]) {
      mockProblems[patientId] = [];
    }
    const exists = mockProblems[patientId].some(p => p.code === code);
    if (!exists) {
      mockProblems[patientId].push({
        id: `cond-${Math.random().toString(36).substring(2, 9)}`,
        patient_id: patientId,
        code: code,
        display: enc.notes?.structured_content?.icd10_display || code,
        status: "active",
        recorded_at: new Date().toISOString()
      });
    }

    return HttpResponse.json(enc);
  }),

  http.post("/api/emr/encounters/:encounterId/addenda", async ({ params, request }) => {
    const { encounterId } = params;
    const body = await request.json() as any;
    const enc = mockEncounters.find(e => e.id === encounterId);
    if (!enc) return new HttpResponse(null, { status: 404 });
    const newAddendum = {
      content: body.content,
      created_at: new Date().toISOString(),
      created_by: "Dr. Srinivas"
    };
    if (!enc.addenda) enc.addenda = [];
    enc.addenda.push(newAddendum);
    return HttpResponse.json(enc);
  }),

  http.post("/api/emr/encounters/:encounterId/vitals", async ({ params, request }) => {
    const { encounterId } = params;
    const body = await request.json() as any;
    const enc = mockEncounters.find(e => e.id === encounterId);
    if (!enc) return new HttpResponse(null, { status: 404 });
    const patientId = enc.patient_id;
    const newVital = {
      id: `v-${Math.random().toString(36).substring(2, 9)}`,
      patient_id: patientId,
      bps: Number(body.bps),
      bpd: Number(body.bpd),
      pulse: Number(body.pulse),
      temp: Number(body.temp),
      recorded_at: new Date().toISOString()
    };
    if (!mockVitals[patientId]) {
      mockVitals[patientId] = [];
    }
    mockVitals[patientId].push(newVital);
    return HttpResponse.json(newVital);
  }),

  http.post("/api/emr/patients/:patientId/problems", async ({ params, request }) => {
    const { patientId } = params;
    const body = await request.json() as any;
    const newProblem = {
      id: `cond-${Math.random().toString(36).substring(2, 9)}`,
      patient_id: patientId as string,
      code: body.code,
      display: body.display,
      status: "active",
      recorded_at: new Date().toISOString()
    };
    if (!mockProblems[patientId as string]) {
      mockProblems[patientId as string] = [];
    }
    mockProblems[patientId as string].push(newProblem);
    return HttpResponse.json(newProblem);
  }),

  http.get("/api/rx/drugs", ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    const list = mockDrugs.filter(d =>
      d.name.toLowerCase().includes(q.toLowerCase()) ||
      d.brand_name.toLowerCase().includes(q.toLowerCase())
    );
    return HttpResponse.json(list);
  }),

  http.post("/api/rx/prescriptions", async ({ request }) => {
    const body = await request.json() as any;
    const rxId = `rx-${Math.random().toString(36).substring(2, 9)}`;
    const newRx = {
      id: rxId,
      patient_id: body.patient_id,
      practitioner_id: body.practitioner_id,
      encounter_id: body.encounter_id || null,
      status: "draft",
      created_at: new Date().toISOString(),
      items: body.items || []
    };
    mockPrescriptions.push(newRx);
    return HttpResponse.json(newRx, { status: 201 });
  }),

  http.post("/api/rx/prescriptions/:prescriptionId/sign", async ({ params, request }) => {
    const { prescriptionId } = params;
    const body = await request.json() as any;
    const rx = mockPrescriptions.find(r => r.id === prescriptionId);
    if (!rx) return new HttpResponse(null, { status: 404 });

    const patientAllergies = mockAllergies[rx.patient_id] || [];
    const hasPenicillinAllergy = patientAllergies.some(a =>
      a.substance_display?.toLowerCase().includes("penicillin")
    );
    const hasPenicillinPrescribed = rx.items?.some((item: any) =>
      item.drug_name?.toLowerCase().includes("amoxicillin")
    );

    if (hasPenicillinAllergy && hasPenicillinPrescribed && !body.override_code) {
      return HttpResponse.json({
        detail: "Drug-Allergy interaction conflict: Penicillin allergy detected with Amoxicillin."
      }, { status: 409 });
    }

    rx.status = "signed";
    rx.signed_at = new Date().toISOString();
    rx.signed_by = "Dr. Srinivas";
    rx.override_code = body.override_code || null;
    rx.override_reason = body.override_reason || null;

    if (!mockMedications[rx.patient_id]) {
      mockMedications[rx.patient_id] = [];
    }
    rx.items.forEach((item: any) => {
      mockMedications[rx.patient_id].push({
        id: `med-stmt-${Math.random().toString(36).substring(2, 9)}`,
        patient_id: rx.patient_id,
        drug_id: item.drug_id,
        drug_name: item.drug_name,
        sig: `${item.dose} ${item.route} ${item.frequency} for ${item.duration}`,
        status: "active"
      });
    });

    if (body.follow_up_date) {
      const followUpAppt = {
        id: `appt-f-${Math.random().toString(36).substring(2, 9)}`,
        patient_id: rx.patient_id,
        patient_name: "Follow-up Draft",
        practitioner_id: rx.practitioner_id,
        practitioner_name: "Dr. Srinivas (Cardiology)",
        site_id: "site-1",
        site_name: "Apollo Visakhapatnam",
        room_id: "room-101",
        room_name: "Room 101 - Cardiology OPD",
        service_id: "service-3",
        service_name: "Consultation Follow-up",
        status: "DRAFT",
        start_time: body.follow_up_date,
        end_time: new Date(new Date(body.follow_up_date).getTime() + 1000 * 60 * 30).toISOString(),
        prerequisites: body.prerequisites?.map((code: string) => ({
          prerequisite_id: `prereq-${Math.random().toString(36).substring(2, 6)}`,
          satisfied: false,
          code: code,
          description: code === "FASTING"
            ? "Fast for 12 hours before test (12 గంటలు ఖాళీ కడుపుతో ఉండాలి)"
            : "Bring previous report scans (మునుపటి నివేదిక తీసుకురండి)",
          enforcement_type: code === "FASTING" ? "hard-stop" : "advisory"
        })) || []
      };
      mockAppointments.push(followUpAppt as any);
    }

    return HttpResponse.json(rx);
  }),

  // Order catalog and creation (Sprint U5)
  http.get("/api/ord/catalog", ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    const results = mockCatalogItems.filter(item =>
      item.display.toLowerCase().includes(q.toLowerCase()) ||
      item.code.includes(q)
    );
    return HttpResponse.json(results);
  }),

  http.get("/api/ord/orders", ({ request }) => {
    const url = new URL(request.url);
    const patientId = url.searchParams.get("patient_id");
    const results = patientId ? mockOrders.filter(o => o.patient_id === patientId) : mockOrders;
    return HttpResponse.json(results);
  }),

  http.post("/api/ord/orders", async ({ request }) => {
    const body = await request.json() as any;
    const newOrder = {
      id: `ord-${Math.random().toString(36).substring(2, 9)}`,
      patient_id: body.patient_id,
      code: body.code,
      display: body.display,
      priority: body.priority || "ROUTINE",
      status: "ordered",
      specimen: body.specimen || "Blood",
      prep: body.prep || "None",
      created_at: new Date().toISOString()
    };
    mockOrders.push(newOrder);
    
    // Add charges automatically to the draft invoice as a draft line item! (UI-503 auto-capture)
    let draftInv = mockInvoices.find(inv => inv.patient_id === body.patient_id && inv.status === "draft");
    if (!draftInv) {
      draftInv = {
        id: `inv-${Math.random().toString(36).substring(2, 9)}`,
        patient_id: body.patient_id,
        status: "draft",
        created_at: new Date().toISOString(),
        lines: [],
        payments: []
      };
      mockInvoices.push(draftInv);
    }
    draftInv.lines.push({
      id: `line-${Math.random().toString(36).substring(2, 9)}`,
      description: `${body.display} - Service Order Charge`,
      amount: body.specimen === "Imaging" ? 4500 : 800
    });

    return HttpResponse.json(newOrder, { status: 201 });
  }),

  // Clinician Results Inbox (Sprint U5)
  http.get("/api/ord/clinicians/inbox", () => {
    return HttpResponse.json(mockResultsInbox);
  }),

  http.post("/api/ord/results/:resultId/acknowledge", ({ params }) => {
    const { resultId } = params;
    const result = mockResultsInbox.find(r => r.id === resultId);
    if (!result) return new HttpResponse(null, { status: 404 });
    result.status = "acknowledged";
    result.acknowledged_at = new Date().toISOString();
    result.acknowledged_by = "Dr. Srinivas";
    return HttpResponse.json(result);
  }),

  http.get("/api/ord/patients/:patientId/analytes", ({ params }) => {
    const { patientId } = params;
    const results = mockResultsInbox.filter(r => r.patient_id === patientId);
    return HttpResponse.json(results);
  }),

  // Billing Invoices & Payments (Sprint U5)
  http.get("/api/bil/invoices", ({ request }) => {
    const url = new URL(request.url);
    const patientId = url.searchParams.get("patient_id");
    const results = patientId ? mockInvoices.filter(i => i.patient_id === patientId) : mockInvoices;
    return HttpResponse.json(results);
  }),

  http.post("/api/bil/invoices", async ({ request }) => {
    const body = await request.json() as any;
    const newInvoice = {
      id: `inv-${Math.random().toString(36).substring(2, 9)}`,
      patient_id: body.patient_id,
      status: "draft",
      created_at: new Date().toISOString(),
      lines: body.lines || [],
      payments: []
    };
    mockInvoices.push(newInvoice);
    return HttpResponse.json(newInvoice, { status: 201 });
  }),

  http.post("/api/bil/invoices/:invoiceId/finalize", ({ params }) => {
    const { invoiceId } = params;
    const invoice = mockInvoices.find(i => i.id === invoiceId);
    if (!invoice) return new HttpResponse(null, { status: 404 });
    invoice.status = "finalized";
    invoice.finalized_at = new Date().toISOString();
    return HttpResponse.json(invoice);
  }),

  http.post("/api/bil/payments", async ({ request }) => {
    const body = await request.json() as any;
    const paymentId = `pmt-${Math.random().toString(36).substring(2, 9)}`;
    const newPayment = {
      id: paymentId,
      invoice_id: body.invoice_id,
      amount: body.amount,
      mode: body.mode || "CASH", // CASH, CARD, UPI
      receipt_number: `REC-${100000 + Math.floor(Math.random() * 900000)}`,
      created_at: new Date().toISOString()
    };
    mockPayments.push(newPayment);

    // Update invoice status if fully paid
    const invoice = mockInvoices.find(i => i.id === body.invoice_id);
    if (invoice) {
      invoice.payments.push(newPayment);
      const totalPaid = invoice.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      const totalAmount = invoice.lines.reduce((sum: number, l: any) => sum + l.amount, 0);
      if (totalPaid >= totalAmount) {
        invoice.status = "paid";
      }
    }
    return HttpResponse.json(newPayment, { status: 201 });
  }),

  http.get("/api/bil/till-summary", () => {
    const cashTotal = mockPayments.filter(p => p.mode === "CASH").reduce((sum, p) => sum + p.amount, 0);
    const cardTotal = mockPayments.filter(p => p.mode === "CARD" || p.mode === "UPI").reduce((sum, p) => sum + p.amount, 0);
    const expected = cashTotal + cardTotal;
    
    return HttpResponse.json({
      expected_balance: expected,
      collected_cash: cashTotal,
      collected_digital: cardTotal,
      actual_balance: expected,
      difference: 0,
      till_status: "CLOSED",
      closed_at: new Date().toISOString()
    });
  }),

  // Patient Portal Endpoints (Sprint U6)
  http.post("/api/por/activate", async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({ success: true, token: "portal-session-active", patient_id: "p-001" });
  }),

  http.get("/api/por/visits", () => {
    // Return all mock appointments for portal context
    return HttpResponse.json(mockAppointments);
  }),

  http.post("/api/por/intake", async ({ request }) => {
    const url = new URL(request.url);
    const apptId = url.searchParams.get("appointment_id");
    const appt = mockAppointments.find(a => a.id === apptId);
    if (appt) {
      (appt as any).forms_completed = true;
    }
    return HttpResponse.json({ success: true });
  }),

  // Reports & Analytics Endpoints (Sprint U6)
  http.get("/api/rpt/ops-metrics", ({ request }) => {
    const url = new URL(request.url);
    const siteId = url.searchParams.get("site_id") || "site-1";
    const revenue = mockPayments.reduce((sum, p) => sum + p.amount, 0) + 5300;
    
    return HttpResponse.json({
      today_visits: mockAppointments.length + 3,
      avg_wait_minutes: 18,
      no_shows: 2,
      today_revenue: revenue,
      timestamp: new Date().toISOString()
    });
  }),

  http.get("/api/rpt/referrals", () => {
    return HttpResponse.json([
      { referrer_name: "Dr. A. K. Sastry", visits: 12, revenue: 54000, site: "Apollo Visakhapatnam" },
      { referrer_name: "Dr. G. Sunitha", visits: 8, revenue: 32000, site: "Apollo Visakhapatnam" },
      { referrer_name: "Dr. Ramana Rao", visits: 5, revenue: 15000, site: "KIMS Nellore" },
    ]);
  }),
];

// EMR & Prescription Mock Databases
let mockDrugs = [
  { id: "drug-1", name: "Amoxicillin 500mg (Oral Capsule)", brand_name: "Amoxil", description: "Penicillin antibiotic" },
  { id: "drug-2", name: "Paracetamol 650mg (Oral Tablet)", brand_name: "Dolo 650", description: "Analgesic/Antipyretic" },
  { id: "drug-3", name: "Telmisartan 40mg (Oral Tablet)", brand_name: "Telma 40", description: "Angiotensin II Receptor Blocker" },
  { id: "drug-4", name: "Metformin 500mg (Oral Tablet)", brand_name: "Glycomet 500", description: "Oral Hypoglycemic" },
  { id: "drug-5", name: "Amlodipine 5mg (Oral Tablet)", brand_name: "Amlokind 5", description: "Calcium Channel Blocker" }
];

let mockProblems: Record<string, any[]> = {
  "p-001": [
    { id: "cond-1", patient_id: "p-001", code: "I10", display: "Essential Hypertension", status: "active", recorded_at: "2026-06-15T10:00:00Z" }
  ],
  "p-002": [
    { id: "cond-2", patient_id: "p-002", code: "E11", display: "Type 2 Diabetes Mellitus", status: "active", recorded_at: "2026-05-10T11:00:00Z" }
  ]
};

let mockMedications: Record<string, any[]> = {
  "p-001": [
    { id: "med-stmt-1", patient_id: "p-001", drug_id: "drug-3", drug_name: "Telmisartan 40mg", sig: "Once daily in the morning", status: "active" }
  ],
  "p-002": [
    { id: "med-stmt-2", patient_id: "p-002", drug_id: "drug-4", drug_name: "Metformin 500mg", sig: "Twice daily after meals", status: "active" }
  ]
};

let mockVitals: Record<string, any[]> = {
  "p-001": [
    { id: "v-1", patient_id: "p-001", bps: 130, bpd: 80, pulse: 72, temp: 98.6, recorded_at: "2026-06-15T10:15:00Z" },
    { id: "v-2", patient_id: "p-001", bps: 142, bpd: 92, pulse: 85, temp: 99.1, recorded_at: "2026-07-10T09:30:00Z" },
    { id: "v-3", patient_id: "p-001", bps: 138, bpd: 88, pulse: 78, temp: 98.4, recorded_at: new Date().toISOString() }
  ],
  "p-002": [
    { id: "v-4", patient_id: "p-002", bps: 120, bpd: 80, pulse: 68, temp: 98.6, recorded_at: "2026-05-10T11:15:00Z" }
  ]
};

let mockEncounters: any[] = [
  {
    id: "enc-1",
    appointment_id: "appt-2",
    patient_id: "p-002",
    practitioner_id: "doc-2",
    site_id: "site-1",
    status: "draft",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    notes: {
      id: "note-1",
      encounter_id: "enc-1",
      template_type: "SOAP",
      structured_content: {
        subjective: "Patient complains of mild headache for past three days.",
        objective: "BP 120/80, Pulse 68, Chest clear, no focal neurological deficits.",
        assessment: "Mild tension headache",
        plan: "Rest, hydration, take Paracetamol 650mg SOS",
        icd10_code: "G44.2",
        icd10_display: "Tension-type headache"
      },
      rich_text_content: "",
      version: 1
    },
    addenda: []
  }
];

let mockPrescriptions: any[] = [];

// Orders, Results & Billing Mock Databases (Sprint U5)
let mockCatalogItems = [
  { id: "cat-1", code: "30934-4", display: "Complete Blood Count (CBC) with differential", specimen: "Blood", prep: "No special preparation required." },
  { id: "cat-2", code: "2345-7", display: "Thyroid Stimulating Hormone (TSH)", specimen: "Blood", prep: "Fast for 8 hours before blood draw." },
  { id: "cat-3", code: "74211-1", display: "CT Scan - Chest with IV Contrast", specimen: "Imaging", prep: "Fasting for 4 hours; bring kidney function serum creatinine report." },
  { id: "cat-4", code: "29436-7", display: "Electrocardiogram (ECG)", specimen: "Diagnostic", prep: "No metallic objects, rest for 5 minutes." },
];

let mockOrders: any[] = [
  {
    id: "ord-101",
    patient_id: "p-001",
    code: "74211-1",
    display: "CT Scan - Chest with IV Contrast",
    priority: "URGENT",
    status: "resulted",
    specimen: "Imaging",
    prep: "Fasting for 4 hours; bring kidney function serum creatinine report.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  }
];

let mockResultsInbox: any[] = [
  {
    id: "res-201",
    patient_id: "p-001",
    patient_name: "Kalyan Chakravarthy",
    analyte_id: "analyte-trop-t",
    analyte_name: "Troponin T (Serum)",
    value: 1.5,
    unit: "ng/mL",
    reference_range: "0.0 - 0.04",
    clinical_flag: "critical", // critical, abnormal, normal
    status: "unacknowledged", // unacknowledged, acknowledged
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago -> triggers 30-min escalation warning!
    history: [
      { date: "2026-07-01", value: 0.02 },
      { date: "2026-07-10", value: 0.03 },
      { date: "2026-07-21", value: 1.5 },
    ]
  },
  {
    id: "res-202",
    patient_id: "p-001",
    patient_name: "Kalyan Chakravarthy",
    analyte_id: "analyte-hb",
    analyte_name: "Hemoglobin",
    value: 11.2,
    unit: "g/dL",
    reference_range: "13.0 - 17.0",
    clinical_flag: "abnormal",
    status: "unacknowledged",
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    history: [
      { date: "2026-07-01", value: 14.1 },
      { date: "2026-07-10", value: 13.5 },
      { date: "2026-07-21", value: 11.2 },
    ]
  },
  {
    id: "res-203",
    patient_id: "p-002",
    patient_name: "Venkata Rama Rao",
    analyte_id: "analyte-tsh",
    analyte_name: "TSH (Serum)",
    value: 2.4,
    unit: "uIU/mL",
    reference_range: "0.4 - 4.5",
    clinical_flag: "normal",
    status: "acknowledged",
    acknowledged_at: new Date().toISOString(),
    acknowledged_by: "Dr. Srinivas",
    created_at: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    history: [
      { date: "2026-05-10", value: 2.1 },
      { date: "2026-07-21", value: 2.4 },
    ]
  }
];

let mockInvoices: any[] = [
  {
    id: "inv-301",
    patient_id: "p-001",
    status: "draft",
    created_at: new Date().toISOString(),
    lines: [
      { id: "line-1", description: "Cardiology Specialist Consultation Fee", amount: 800 },
      { id: "line-2", description: "CT Chest scan with IV Contrast fee (LOINC 74211-1)", amount: 4500 }
    ],
    payments: []
  }
];

let mockPayments: any[] = [];

