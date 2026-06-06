import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info } from "lucide-react";
import type { PredictionResult } from "@/types/prediction";
import RiskHero from "@/components/risk/RiskHero.tsx";
import RiskBadge from "@/components/risk/RiskBadge.tsx";
import ModelInterpretability from "@/components/dashboard/ModelInterpretability.tsx";
import { MODEL_VERSION } from "@/constants/riskThresholds";

interface RiskAssessmentResultsProps {
  result: PredictionResult;
  onClose: () => void;
  onSaveToHistory?: () => void;
}

const RiskAssessmentResults: React.FC<RiskAssessmentResultsProps> = ({
  result,
  onClose,
  onSaveToHistory,
}) => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ background: "var(--color-bg-overlay)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="results-title"
    >
      <div
        className="rounded-[var(--radius-xl)] max-w-3xl w-full max-h-[90vh] overflow-y-auto border"
        style={{
          background: "var(--color-bg-elevated)",
          borderColor: "var(--color-border-default)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <Card className="border-0 shadow-none">
          <CardHeader
            className="border-b"
            style={{ borderColor: "var(--color-border-default)" }}
          >
            <div className="flex items-center justify-between">
              <CardTitle id="results-title">Prediction Results</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close results"
              >
                ✕
              </Button>
            </div>
            <p
              style={{
                fontSize: "var(--text-body-sm)",
                color: "var(--color-text-tertiary)",
              }}
            >
              Demo model v{MODEL_VERSION} — not for clinical diagnosis
            </p>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <RiskHero
              probability={result.probability}
              level={result.risk_level}
              updatedAt={result.prediction_time}
              modelVersion={MODEL_VERSION}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="clinical-card !p-4">
                <p className="field-label mb-1">Prediction</p>
                <RiskBadge level={result.risk_level} />
              </div>
              <div className="clinical-card !p-4">
                <p className="field-label mb-1">Result</p>
                <p
                  className="font-semibold"
                  style={{ fontSize: "var(--text-body-md)" }}
                >
                  {result.prediction_result}
                </p>
              </div>
            </div>

            {result.flagged_conditions.length > 0 && (
              <div
                className="rounded-[var(--radius-lg)] p-4 border"
                style={{
                  background: "var(--color-risk-high-bg)",
                  borderColor: "var(--color-risk-high-border)",
                }}
                role="alert"
              >
                <h3
                  className="font-semibold flex items-center gap-2 mb-2"
                  style={{
                    color: "var(--color-risk-high-text)",
                    fontSize: "var(--text-heading-sm)",
                  }}
                >
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  Clinical Flags
                </h3>
                <ul className="space-y-1">
                  {result.flagged_conditions.map((condition, index) => (
                    <li
                      key={index}
                      style={{
                        fontSize: "var(--text-body-sm)",
                        color: "var(--color-risk-high-text)",
                      }}
                    >
                      {condition}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.feature_contributions.length > 0 && (
              <div className="clinical-card">
                <ModelInterpretability
                  contributions={result.feature_contributions}
                />
              </div>
            )}

            <div className="clinical-card">
              <h3 className="clinical-card-title flex items-center gap-2 mb-3">
                <Info
                  className="h-4 w-4"
                  style={{ color: "var(--color-brand-600)" }}
                  aria-hidden="true"
                />
                Recommendations
              </h3>
              <p
                style={{
                  fontSize: "var(--text-body-md)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {result.recommendations}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {onSaveToHistory && (
                <Button onClick={onSaveToHistory} className="flex-1">
                  View Patient History
                </Button>
              )}
              <Button onClick={onClose} variant="outline" className="flex-1">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiskAssessmentResults;
