export type SmokingHistory = "never" | "former" | "current";
export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";
export type PredictionResultLabel = "Positive" | "Negative";

export interface PredictionInput {
  patient_id: string;
  age: number;
  gender: 0 | 1;
  bmi: number;
  hypertension: 0 | 1;
  heart_disease: 0 | 1;
  smoking_history: SmokingHistory;
  HbA1c_level: number;
  blood_glucose_level: number;
}

export interface FeatureContribution {
  name: string;
  contribution: number;
  description: string;
  risk_factor: boolean;
}

export interface PredictionResult {
  prediction_id: string;
  patient_id: string;
  prediction_time: string;
  prediction_result: PredictionResultLabel;
  confidence_score: number;
  risk_level: RiskLevel;
  probability: number;
  recommendations: string;
  feature_contributions: FeatureContribution[];
  flagged_conditions: string[];
  confidence_interval: {
    lower: number;
    upper: number;
  };
  feature_input: PredictionInput;
}

export interface AssessmentHistoryEntry {
  id: string;
  date: string;
  risk_score: number;
  risk_level: RiskLevel;
  bmi: number;
  hba1c: number;
  blood_glucose: number;
  recommendations: string[];
  prediction_result: PredictionResultLabel;
}
