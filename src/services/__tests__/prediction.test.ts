import { describe, it, expect } from "vitest";
import { calculateBMI, getBMICategory } from "@/utils/bmiCalculator";
import { encodeFeatures, predictWithMetadata } from "@/services/ml/featureEncoder";
import { getClinicalFlags } from "@/services/prediction/clinicalFlags";
import { getRiskLevelFromProbability } from "@/constants/riskThresholds";
import type { ModelMetadata } from "@/services/ml/featureEncoder";

const mockMetadata: ModelMetadata = {
  feature_names: ["age", "gender", "bmi", "hypertension", "heart_disease", "smoking_never", "smoking_former", "smoking_current", "HbA1c_level", "blood_glucose_level"],
  scaler_mean: [50, 0.5, 28, 0.3, 0.2, 0.6, 0.25, 0.15, 5.8, 110],
  scaler_scale: [15, 0.5, 5, 0.5, 0.4, 0.5, 0.4, 0.35, 1, 35],
  coefficients: [0.3, 0.2, 0.4, 0.5, 0.45, -0.2, 0.1, 0.35, 1.0, 0.02],
  intercept: -2.0,
  class_labels: ["Negative", "Positive"],
  version: "test",
  disclaimer: "test",
};

describe("bmiCalculator", () => {
  it("converts height from cm to meters", () => {
    const bmi = calculateBMI(170, 70);
    expect(bmi).toBeCloseTo(24.22, 1);
  });

  it("categorizes BMI correctly", () => {
    expect(getBMICategory(22)).toBe("Normal");
    expect(getBMICategory(32)).toBe("Obese");
  });
});

describe("featureEncoder", () => {
  it("encodes 10 features including smoking one-hot", () => {
    const features = encodeFeatures({
      patient_id: "p1",
      age: 55,
      gender: 1,
      bmi: 30,
      hypertension: 1,
      heart_disease: 0,
      smoking_history: "current",
      HbA1c_level: 6.5,
      blood_glucose_level: 140,
    });
    expect(features).toHaveLength(10);
    expect(features[7]).toBe(1);
    expect(features[5]).toBe(0);
  });

  it("returns probability between 0 and 1", () => {
    const prob = predictWithMetadata({
      patient_id: "p1",
      age: 60,
      gender: 1,
      bmi: 33,
      hypertension: 1,
      heart_disease: 1,
      smoking_history: "current",
      HbA1c_level: 7.0,
      blood_glucose_level: 160,
    }, mockMetadata);
    expect(prob).toBeGreaterThan(0);
    expect(prob).toBeLessThan(1);
  });
});

describe("clinicalFlags", () => {
  it("flags elevated HbA1c and glucose", () => {
    const flags = getClinicalFlags({
      patient_id: "p1",
      age: 50,
      gender: 0,
      bmi: 28,
      hypertension: 0,
      heart_disease: 0,
      smoking_history: "never",
      HbA1c_level: 6.8,
      blood_glucose_level: 130,
    });
    expect(flags.some(f => f.includes("HbA1c"))).toBe(true);
    expect(flags.some(f => f.includes("prediabetes"))).toBe(true);
  });
});

describe("riskThresholds", () => {
  it("maps probability to risk levels", () => {
    expect(getRiskLevelFromProbability(0.1)).toBe("Low");
    expect(getRiskLevelFromProbability(0.55)).toBe("Moderate");
    expect(getRiskLevelFromProbability(0.8)).toBe("High");
    expect(getRiskLevelFromProbability(0.9)).toBe("Critical");
  });
});
