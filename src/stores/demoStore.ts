import type { Patient, NewPatient } from "@/types/patient";
import type { PredictionInput, PredictionResult } from "@/types/prediction";

const PATIENTS_KEY = "diatrack:patients";
const PREDICTIONS_KEY = "diatrack:predictions";
const SEEDED_KEY = "diatrack:seeded";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function nowIso(): string {
  return new Date().toISOString();
}

function uuid(): string {
  return crypto.randomUUID();
}

function seedPatients(): Patient[] {
  const base = nowIso();
  return [
    {
      id: uuid(),
      patient_id: "P-1001",
      first_name: "Maria",
      last_name: "Johnson",
      date_of_birth: "1968-03-15",
      gender: "female",
      contact_number: "555-0101",
      email: "maria.j@example.com",
      address: "123 Oak Street",
      created_at: base,
      updated_at: base,
    },
    {
      id: uuid(),
      patient_id: "P-1002",
      first_name: "James",
      last_name: "Chen",
      date_of_birth: "1975-11-22",
      gender: "male",
      contact_number: "555-0102",
      email: "jchen@example.com",
      created_at: base,
      updated_at: base,
    },
    {
      id: uuid(),
      patient_id: "P-1003",
      first_name: "Sarah",
      last_name: "Williams",
      date_of_birth: "1982-07-08",
      gender: "female",
      contact_number: "555-0103",
      created_at: base,
      updated_at: base,
    },
    {
      id: uuid(),
      patient_id: "P-1004",
      first_name: "Robert",
      last_name: "Davis",
      date_of_birth: "1959-01-30",
      gender: "male",
      contact_number: "555-0104",
      email: "rdavis@example.com",
      created_at: base,
      updated_at: base,
    },
  ];
}

function seedPredictions(patients: Patient[]): PredictionResult[] {
  const samples: Array<Partial<PredictionInput> & { risk: number }> = [
    { age: 58, gender: 0, bmi: 31.2, hypertension: 1, heart_disease: 0, smoking_history: "never", HbA1c_level: 6.8, blood_glucose_level: 142, risk: 0.72 },
    { age: 49, gender: 1, bmi: 27.5, hypertension: 0, heart_disease: 0, smoking_history: "former", HbA1c_level: 5.9, blood_glucose_level: 108, risk: 0.38 },
    { age: 63, gender: 1, bmi: 33.1, hypertension: 1, heart_disease: 1, smoking_history: "current", HbA1c_level: 7.2, blood_glucose_level: 165, risk: 0.85 },
    { age: 44, gender: 0, bmi: 24.1, hypertension: 0, heart_disease: 0, smoking_history: "never", HbA1c_level: 5.4, blood_glucose_level: 92, risk: 0.15 },
    { age: 55, gender: 1, bmi: 29.8, hypertension: 1, heart_disease: 0, smoking_history: "never", HbA1c_level: 6.1, blood_glucose_level: 118, risk: 0.52 },
  ];

  const predictions: PredictionResult[] = [];
  patients.forEach((patient, i) => {
    const sample = samples[i % samples.length];
    const input: PredictionInput = {
      patient_id: patient.patient_id,
      age: sample.age!,
      gender: sample.gender as 0 | 1,
      bmi: sample.bmi!,
      hypertension: sample.hypertension as 0 | 1,
      heart_disease: sample.heart_disease as 0 | 1,
      smoking_history: sample.smoking_history!,
      HbA1c_level: sample.HbA1c_level!,
      blood_glucose_level: sample.blood_glucose_level!,
    };
    const prob = sample.risk!;
    predictions.push({
      prediction_id: uuid(),
      patient_id: patient.id,
      prediction_time: new Date(Date.now() - (i + 1) * 86400000 * 7).toISOString(),
      prediction_result: prob >= 0.5 ? "Positive" : "Negative",
      confidence_score: 0.75 + (i % 3) * 0.05,
      risk_level: prob >= 0.85 ? "Critical" : prob >= 0.75 ? "High" : prob >= 0.5 ? "Moderate" : "Low",
      probability: prob,
      recommendations: "Maintain regular monitoring and follow clinical guidelines for lifestyle modification.",
      feature_contributions: [],
      flagged_conditions: prob >= 0.5 ? ["Elevated diabetes risk indicators"] : [],
      confidence_interval: { lower: Math.max(0, prob - 0.1), upper: Math.min(1, prob + 0.1) },
      feature_input: input,
    });
  });
  return predictions;
}

export function ensureSeeded(): void {
  if (localStorage.getItem(SEEDED_KEY)) return;
  const patients = seedPatients();
  const predictions = seedPredictions(patients);
  writeJson(PATIENTS_KEY, patients);
  writeJson(PREDICTIONS_KEY, predictions);
  localStorage.setItem(SEEDED_KEY, "true");
}

export function getPatients(): Patient[] {
  ensureSeeded();
  return readJson<Patient[]>(PATIENTS_KEY, []);
}

export function getPatientById(id: string): Patient | undefined {
  return getPatients().find((p) => p.id === id);
}

export function addPatient(data: NewPatient): Patient {
  ensureSeeded();
  const patients = getPatients();
  const patient: Patient = {
    ...data,
    id: uuid(),
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  patients.unshift(patient);
  writeJson(PATIENTS_KEY, patients);
  return patient;
}

export function updatePatient(id: string, updates: Partial<NewPatient>): Patient | undefined {
  const patients = getPatients();
  const index = patients.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  patients[index] = { ...patients[index], ...updates, updated_at: nowIso() };
  writeJson(PATIENTS_KEY, patients);
  return patients[index];
}

export function deletePatient(id: string): void {
  const patients = getPatients().filter((p) => p.id !== id);
  writeJson(PATIENTS_KEY, patients);
  const predictions = getPredictions().filter((p) => p.patient_id !== id);
  writeJson(PREDICTIONS_KEY, predictions);
}

export function getPredictions(): PredictionResult[] {
  ensureSeeded();
  return readJson<PredictionResult[]>(PREDICTIONS_KEY, []);
}

export function getPredictionsForPatient(patientId: string): PredictionResult[] {
  return getPredictions()
    .filter((p) => p.patient_id === patientId)
    .sort((a, b) => new Date(b.prediction_time).getTime() - new Date(a.prediction_time).getTime());
}

export function savePrediction(result: PredictionResult): PredictionResult {
  ensureSeeded();
  const predictions = getPredictions();
  predictions.unshift(result);
  writeJson(PREDICTIONS_KEY, predictions);
  return result;
}

export function exportDemoData(): string {
  return JSON.stringify(
    { patients: getPatients(), predictions: getPredictions() },
    null,
    2
  );
}

export function importDemoData(json: string): void {
  const data = JSON.parse(json) as { patients: Patient[]; predictions: PredictionResult[] };
  writeJson(PATIENTS_KEY, data.patients);
  writeJson(PREDICTIONS_KEY, data.predictions);
  localStorage.setItem(SEEDED_KEY, "true");
}

export function resetDemoData(): void {
  localStorage.removeItem(SEEDED_KEY);
  localStorage.removeItem(PATIENTS_KEY);
  localStorage.removeItem(PREDICTIONS_KEY);
  ensureSeeded();
}

export function getHighRiskPatientIds(threshold = 0.5): string[] {
  const latestByPatient = new Map<string, PredictionResult>();
  for (const p of getPredictions()) {
    const existing = latestByPatient.get(p.patient_id);
    if (!existing || new Date(p.prediction_time) > new Date(existing.prediction_time)) {
      latestByPatient.set(p.patient_id, p);
    }
  }
  return [...latestByPatient.entries()]
    .filter(([, pred]) => pred.probability >= threshold)
    .map(([id]) => id);
}
