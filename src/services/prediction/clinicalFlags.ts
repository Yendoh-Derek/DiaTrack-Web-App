import type { PredictionInput } from "@/types/prediction";
import { RISK_THRESHOLDS } from "@/constants/riskThresholds";

export function getClinicalFlags(input: PredictionInput): string[] {
  const flags: string[] = [];

  if (input.HbA1c_level >= RISK_THRESHOLDS.HbA1c.diabetes) {
    flags.push(`HbA1c ${input.HbA1c_level}% meets diabetes diagnostic threshold (≥${RISK_THRESHOLDS.HbA1c.diabetes}%)`);
  } else if (input.HbA1c_level >= RISK_THRESHOLDS.HbA1c.normal) {
    flags.push(`HbA1c ${input.HbA1c_level}% in prediabetes range`);
  }

  if (input.blood_glucose_level >= RISK_THRESHOLDS.bloodGlucose.diabetes) {
    flags.push(`Blood glucose ${input.blood_glucose_level} mg/dL indicates diabetes range (≥${RISK_THRESHOLDS.bloodGlucose.diabetes})`);
  } else if (input.blood_glucose_level >= RISK_THRESHOLDS.bloodGlucose.prediabetes) {
    flags.push(`Blood glucose ${input.blood_glucose_level} mg/dL in prediabetes range`);
  }

  if (input.bmi >= RISK_THRESHOLDS.bmi.obese) {
    flags.push(`BMI ${input.bmi.toFixed(1)} indicates obesity (≥${RISK_THRESHOLDS.bmi.obese})`);
  } else if (input.bmi >= RISK_THRESHOLDS.bmi.overweight) {
    flags.push(`BMI ${input.bmi.toFixed(1)} indicates overweight`);
  }

  if (input.hypertension === 1) {
    flags.push("Hypertension reported");
  }

  if (input.heart_disease === 1) {
    flags.push("Heart disease reported");
  }

  if (input.smoking_history === "current") {
    flags.push("Current smoker");
  }

  if (input.age >= RISK_THRESHOLDS.age.increasedRisk) {
    flags.push(`Age ${input.age} is above increased-risk threshold`);
  }

  return flags;
}
