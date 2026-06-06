import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout.tsx";
import RiskHero from "@/components/risk/RiskHero.tsx";
import RiskBadge from "@/components/risk/RiskBadge.tsx";
import ModelInterpretability from "@/components/dashboard/ModelInterpretability";
import RiskTrendChart from "@/components/dashboard/RiskTrendChart";
import EmptyState from "@/components/ui/EmptyState";
import { ArrowLeft, ActivitySquare, Download } from "lucide-react";
import { getPatientById, getPredictionsForPatient } from "@/stores/demoStore";
import type { PredictionResult } from "@/types/prediction";
import { MODEL_VERSION } from "@/constants/riskThresholds";

const PatientHistoryPage = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const patient = patientId ? getPatientById(patientId) : undefined;
  const predictions: PredictionResult[] = patientId
    ? getPredictionsForPatient(patientId)
    : [];
  const latest = predictions[0];

  if (!patient) {
    return (
      <AppLayout>
        <EmptyState
          title="Patient not found"
          description="The requested patient record could not be located."
          action={{
            label: "Back to Patients",
            onClick: () => navigate("/patients"),
          }}
        />
      </AppLayout>
    );
  }

  const chartData = [...predictions].reverse().map((p) => ({
    date: new Date(p.prediction_time).toLocaleDateString(),
    risk: Math.round(p.probability * 100),
  }));

  const exportCsv = () => {
    const rows = [
      ["Date", "Risk %", "Level", "Result", "Recommendations"],
      ...predictions.map((p) => [
        new Date(p.prediction_time).toISOString(),
        (p.probability * 100).toFixed(1),
        p.risk_level,
        p.prediction_result,
        p.recommendations.replace(/,/g, ";"),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${patient.patient_id}-history.csv`;
    a.click();
  };

  const input = latest?.feature_input;

  return (
    <AppLayout
      activePatient={{
        name: `${patient.first_name} ${patient.last_name}`,
        mrn: patient.patient_id,
      }}
    >
      <header className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 -ml-2"
          onClick={() => navigate("/patients")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Patients
        </Button>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1
            className="font-semibold"
            style={{ fontSize: "var(--text-display)" }}
          >
            {patient.first_name} {patient.last_name}
          </h1>
          <span
            style={{
              fontSize: "var(--text-body-md)",
              color: "var(--color-text-secondary)",
            }}
          >
            DOB: {patient.date_of_birth ?? "—"}
          </span>
          <span
            className="tabular-nums"
            style={{
              fontSize: "var(--text-body-md)",
              color: "var(--color-text-secondary)",
            }}
          >
            MRN: {patient.patient_id}
          </span>
        </div>
      </header>

      {latest ? (
        <div className="dashboard-grid mb-6">
          <div className="col-4">
            <RiskHero
              probability={latest.probability}
              level={latest.risk_level}
              updatedAt={latest.prediction_time}
              modelVersion={MODEL_VERSION}
            />
          </div>
          <div className="clinical-card col-8">
            <div className="clinical-card-header">
              <h2 className="clinical-card-title">Feature Importance</h2>
            </div>
            <ModelInterpretability
              contributions={latest.feature_contributions}
            />
          </div>
        </div>
      ) : (
        <EmptyState
          title="No assessments yet"
          description="Run a risk assessment for this patient to view their risk score and feature analysis."
          action={{
            label: "Run Assessment",
            onClick: () => navigate(`/assessment?patientId=${patient.id}`),
          }}
        />
      )}

      {predictions.length > 0 && (
        <>
          <div className="dashboard-grid mb-6">
            <div className="clinical-card col-5">
              <div className="clinical-card-header">
                <h2 className="clinical-card-title">Clinical Inputs</h2>
              </div>
              {input ? (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    { label: "Age", value: `${input.age} yrs` },
                    {
                      label: "Gender",
                      value: input.gender === 1 ? "Male" : "Female",
                    },
                    { label: "BMI", value: `${input.bmi.toFixed(1)} kg/m²` },
                    { label: "HbA1c", value: `${input.HbA1c_level}%` },
                    {
                      label: "Blood Glucose",
                      value: `${input.blood_glucose_level} mg/dL`,
                    },
                    {
                      label: "Hypertension",
                      value: input.hypertension ? "Yes" : "No",
                    },
                    {
                      label: "Heart Disease",
                      value: input.heart_disease ? "Yes" : "No",
                    },
                    { label: "Smoking", value: input.smoking_history },
                  ].map((item) => (
                    <div key={item.label}>
                      <dt className="field-label">{item.label}</dt>
                      <dd
                        className="tabular-nums mt-1"
                        style={{ fontSize: "var(--text-body-md)" }}
                      >
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p
                  style={{
                    fontSize: "var(--text-body-sm)",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  Input data not available for latest prediction.
                </p>
              )}
            </div>

            <div className="clinical-card col-7">
              <div className="clinical-card-header">
                <h2 className="clinical-card-title">Risk Trend Over Time</h2>
              </div>
              {chartData.length > 1 ? (
                <RiskTrendChart data={chartData} />
              ) : (
                <p
                  style={{
                    fontSize: "var(--text-body-sm)",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  Multiple assessments required to show trend.
                </p>
              )}
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="clinical-card col-6">
              <div className="clinical-card-header">
                <h2 className="clinical-card-title">Clinician Notes</h2>
              </div>
              <p
                style={{
                  fontSize: "var(--text-body-md)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {latest.recommendations}
              </p>
              <p
                className="mt-3"
                style={{
                  fontSize: "var(--text-body-sm)",
                  color: "var(--color-text-tertiary)",
                }}
              >
                System · {new Date(latest.prediction_time).toLocaleString()}
              </p>
            </div>

            <div className="clinical-card col-6">
              <div className="clinical-card-header">
                <h2 className="clinical-card-title">Model Prediction Log</h2>
                <Button size="sm" variant="outline" onClick={exportCsv}>
                  <Download className="h-4 w-4 mr-1" /> Export CSV
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {predictions.map((p) => (
                  <div
                    key={p.prediction_id}
                    className="flex items-center justify-between py-2 border-b"
                    style={{ borderColor: "var(--color-border-default)" }}
                  >
                    <div>
                      <p style={{ fontSize: "var(--text-body-sm)" }}>
                        {new Date(p.prediction_time).toLocaleString()}
                      </p>
                      <p
                        style={{
                          fontSize: "var(--text-body-sm)",
                          color: "var(--color-text-tertiary)",
                        }}
                      >
                        {p.prediction_result} · Model v{MODEL_VERSION}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums font-semibold">
                        {(p.probability * 100).toFixed(0)}%
                      </span>
                      <RiskBadge level={p.risk_level} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mt-6">
        <Button onClick={() => navigate(`/assessment?patientId=${patient.id}`)}>
          <ActivitySquare className="h-4 w-4 mr-2" /> New Assessment
        </Button>
      </div>
    </AppLayout>
  );
};

export default PatientHistoryPage;
