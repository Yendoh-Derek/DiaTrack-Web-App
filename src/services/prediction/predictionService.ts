import type { PredictionInput, PredictionResult } from "@/types/prediction";
import { getRiskLevelFromProbability } from "@/constants/riskThresholds";
import { getClinicalFlags } from "./clinicalFlags";
import { predictProbability, loadModel, getMetadata } from "@/services/ml/onnxModel";
import { getFeatureContributions } from "@/services/ml/featureEncoder";

function generateRecommendations(
  input: PredictionInput,
  riskLevel: string,
  flags: string[]
): string {
  const parts: string[] = [];

  if (riskLevel === "Critical" || riskLevel === "High") {
    parts.push("Schedule urgent clinical follow-up and comprehensive metabolic panel.");
  } else if (riskLevel === "Moderate") {
    parts.push("Recommend lifestyle counseling and repeat screening in 3–6 months.");
  } else {
    parts.push("Continue routine screening per clinical guidelines.");
  }

  if (input.bmi >= 30) {
    parts.push("Consider structured weight management program.");
  }
  if (input.HbA1c_level >= 5.7) {
    parts.push("Monitor HbA1c regularly and review dietary carbohydrate intake.");
  }
  if (input.smoking_history === "current") {
    parts.push("Provide smoking cessation resources.");
  }
  if (flags.length > 0) {
    parts.push(`Clinical flags noted: ${flags.length} item(s) require attention.`);
  }

  return parts.join(" ");
}

export async function calculateRisk(input: PredictionInput): Promise<PredictionResult> {
  await loadModel();
  const metadata = getMetadata();
  const probability = await predictProbability(input);
  const confidenceScore = Math.min(0.95, 0.6 + Math.abs(probability - 0.5) * 0.7);
  const riskLevel = getRiskLevelFromProbability(probability);
  const flaggedConditions = getClinicalFlags(input);
  const featureContributions = metadata
    ? getFeatureContributions(input, metadata)
    : [];

  const margin = (1 - confidenceScore) * 0.15;

  return {
    prediction_id: crypto.randomUUID(),
    patient_id: input.patient_id,
    prediction_time: new Date().toISOString(),
    prediction_result: probability >= 0.5 ? "Positive" : "Negative",
    confidence_score: confidenceScore,
    risk_level: riskLevel,
    probability,
    recommendations: generateRecommendations(input, riskLevel, flaggedConditions),
    feature_contributions: featureContributions,
    flagged_conditions: flaggedConditions,
    confidence_interval: {
      lower: Math.max(0, probability - margin),
      upper: Math.min(1, probability + margin),
    },
    feature_input: input,
  };
}
