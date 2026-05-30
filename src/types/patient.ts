export interface Patient {
  id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  contact_number?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  medical_history?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type NewPatient = Omit<Patient, "id" | "created_at" | "updated_at">;
