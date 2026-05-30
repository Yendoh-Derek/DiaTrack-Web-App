import type { PredictionInput } from "@/types/prediction";

export interface ModelMetadata {
  feature_names: string[];
  scaler_mean: number[];
  scaler_scale: number[];
  coefficients: number[];
  intercept: number;
  class_labels: string[];
  version: string;
  disclaimer: string;
}

const SMOKING_ONE_HOT: Record<string, [number, number, number]> = {
  never: [1, 0, 0],
  former: [0, 1, 0],
  current: [0, 0, 1],
};

export function encodeFeatures(input: PredictionInput): number[] {
  const smoke = SMOKING_ONE_HOT[input.smoking_history] ?? [1, 0, 0];
  return [
    input.age,
    input.gender,
    input.bmi,
    input.hypertension,
    input.heart_disease,
    ...smoke,
    input.HbA1c_level,
    input.blood_glucose_level,
  ];
}

export function scaleFeatures(raw: number[], metadata: ModelMetadata): Float32Array {
  const scaled = raw.map(
    (value, i) => (value - metadata.scaler_mean[i]) / metadata.scaler_scale[i]
  );
  return new Float32Array(scaled);
}

export function predictWithMetadata(
  input: PredictionInput,
  metadata: ModelMetadata
): number {
  const raw = encodeFeatures(input);
  const scaled = scaleFeatures(raw, metadata);
  let logit = metadata.intercept;
  for (let i = 0; i < scaled.length; i++) {
    logit += metadata.coefficients[i] * scaled[i];
  }
  return 1 / (1 + Math.exp(-logit));
}

export function getFeatureContributions(
  input: PredictionInput,
  metadata: ModelMetadata
): Array<{ name: string; contribution: number; description: string; risk_factor: boolean }> {
  const raw = encodeFeatures(input);
  const scaled = scaleFeatures(raw, metadata);
  const labels: Record<string, string> = {
    age: "Age",
    gender: "Gender (male)",
    bmi: "BMI",
    hypertension: "Hypertension",
    heart_disease: "Heart disease",
    smoking_never: "Never smoked",
    smoking_former: "Former smoker",
    smoking_current: "Current smoker",
    HbA1c_level: "HbA1c level",
    blood_glucose_level: "Blood glucose",
  };

  return metadata.feature_names.map((name, i) => {
    const contribution = metadata.coefficients[i] * scaled[i];
    return {
      name: labels[name] ?? name,
      contribution,
      description: `${labels[name] ?? name}: contribution ${contribution.toFixed(3)}`,
      risk_factor: contribution > 0,
    };
  }).sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
}
