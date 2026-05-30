import type { RiskLevel } from "@/types/prediction";

export const RISK_THRESHOLDS = {
  probability: {
    low: 0.25,
    moderate: 0.5,
    high: 0.75,
    critical: 0.85,
  },
  HbA1c: {
    normal: 5.7,
    prediabetes: 6.5,
    diabetes: 6.5,
  },
  bloodGlucose: {
    normal: 100,
    prediabetes: 126,
    diabetes: 200,
  },
  bmi: {
    normal: 25,
    overweight: 30,
    obese: 35,
  },
  age: {
    increasedRisk: 45,
  },
} as const;

export type RiskTier = "low" | "mod" | "high" | "crit";

export function getRiskLevelFromProbability(probability: number): RiskLevel {
  if (probability >= RISK_THRESHOLDS.probability.critical) return "Critical";
  if (probability >= RISK_THRESHOLDS.probability.high) return "High";
  if (probability >= RISK_THRESHOLDS.probability.moderate) return "Moderate";
  return "Low";
}

export function getRiskTier(level: RiskLevel): RiskTier {
  switch (level) {
    case "Critical":
      return "crit";
    case "High":
      return "high";
    case "Moderate":
      return "mod";
    default:
      return "low";
  }
}

export function getRiskTierFromProbability(probability: number): RiskTier {
  return getRiskTier(getRiskLevelFromProbability(probability));
}

export function getRiskTierIcon(tier: RiskTier): string {
  switch (tier) {
    case "low":
      return "●";
    case "mod":
      return "◆";
    case "high":
      return "▲";
    case "crit":
      return "⚠";
  }
}

export function getRiskTierLabel(level: RiskLevel): string {
  switch (level) {
    case "Critical":
      return "CRITICAL";
    case "High":
      return "HIGH RISK";
    case "Moderate":
      return "MODERATE";
    default:
      return "LOW RISK";
  }
}

export const MODEL_VERSION = "1.0.0";
