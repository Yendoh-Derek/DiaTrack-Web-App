import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout.tsx";
import RiskBadge from "@/components/risk/RiskBadge.tsx";
import RiskTrendChart from "@/components/dashboard/RiskTrendChart.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import {
  getPredictions,
  getPatients,
  getPatientById,
} from "@/stores/demoStore";

const HistoryPage = () => {
  const navigate = useNavigate();
  const predictions = getPredictions();
  const patients = getPatients();

  const chartData = useMemo(
    () =>
      [...predictions]
        .reverse()
        .slice(-20)
        .map((p) => ({
          date: new Date(p.prediction_time).toLocaleDateString(),
          risk: Math.round(p.probability * 100),
        })),
    [predictions],
  );

  return (
    <AppLayout>
      <header className="mb-6">
        <h1
          className="font-semibold"
          style={{ fontSize: "var(--text-display)" }}
        >
          All Assessments
        </h1>
        <p
          style={{
            fontSize: "var(--text-body-md)",
            color: "var(--color-text-secondary)",
          }}
        >
          {predictions.length} assessments across {patients.length} patients
        </p>
      </header>

      {predictions.length === 0 ? (
        <EmptyState
          title="No assessments recorded"
          description="Run a risk assessment to begin building patient history."
          action={{
            label: "Run First Assessment",
            onClick: () => navigate("/assessment"),
          }}
        />
      ) : (
        <>
          {chartData.length > 1 && (
            <div className="clinical-card mb-6">
              <div className="clinical-card-header">
                <h2 className="clinical-card-title">Recent Risk Scores</h2>
              </div>
              <RiskTrendChart data={chartData} />
            </div>
          )}

          <div className="clinical-card overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th className="numeric">Score</th>
                  <th>Risk Level</th>
                  <th>Result</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p) => {
                  const patient = getPatientById(p.patient_id);
                  return (
                    <tr
                      key={p.prediction_id}
                      className={
                        p.risk_level === "Critical"
                          ? "row--critical"
                          : undefined
                      }
                      onClick={() =>
                        patient && navigate(`/patient-history/${patient.id}`)
                      }
                    >
                      <td className="font-medium">
                        {patient
                          ? `${patient.first_name} ${patient.last_name}`
                          : "Unknown"}
                      </td>
                      <td style={{ color: "var(--color-text-secondary)" }}>
                        {new Date(p.prediction_time).toLocaleString()}
                      </td>
                      <td className="numeric tabular-nums font-semibold">
                        {(p.probability * 100).toFixed(1)}%
                      </td>
                      <td>
                        <RiskBadge level={p.risk_level} />
                      </td>
                      <td style={{ color: "var(--color-text-secondary)" }}>
                        {p.prediction_result}
                      </td>
                      <td>
                        {patient && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/patient-history/${patient.id}`);
                            }}
                          >
                            Details
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default HistoryPage;
