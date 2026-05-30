
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import AppLayout from '@/components/layout/AppLayout';
import RiskDistributionChart from '@/components/dashboard/RiskDistributionChart';
import RiskBadge from '@/components/risk/RiskBadge';
import EmptyState from '@/components/ui/EmptyState';
import { ArrowRight, Users, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { getPatients, getPredictions, getHighRiskPatientIds, getPatientById } from '@/stores/demoStore';
import type { Patient } from '@/types/patient';
import type { PredictionResult } from '@/types/prediction';
import { MODEL_VERSION } from '@/constants/riskThresholds';

const Dashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [highRiskPatients, setHighRiskPatients] = useState<Patient[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);

  useEffect(() => {
    const allPatients = getPatients();
    setPatients(allPatients);
    const highRiskIds = getHighRiskPatientIds(0.5);
    setHighRiskPatients(allPatients.filter(p => highRiskIds.includes(p.id)));
    setPredictions(getPredictions());
  }, []);

  const avgRisk = predictions.length
    ? predictions.reduce((s, p) => s + p.probability, 0) / predictions.length
    : 0;

  const stats = {
    total: patients.length,
    highRisk: highRiskPatients.length,
    avgRisk: Math.round(avgRisk * 100),
    modelAccuracy: 82,
  };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const demoBanner = (
    <div className="info-banner rounded-[var(--radius-md)] mb-6">
      <span>Demo mode — data stored locally in your browser. Not for clinical diagnosis.</span>
    </div>
  );

  return (
    <AppLayout>
      {demoBanner}
      <header className="mb-6">
        <h1 className="font-semibold" style={{ fontSize: 'var(--text-display)' }}>
          Clinician Dashboard
        </h1>
        <p style={{ fontSize: 'var(--text-body-md)', color: 'var(--color-text-secondary)' }}>
          {today}
        </p>
      </header>

      <div className="dashboard-grid mb-6">
        {[
          { label: 'Patients Screened', value: stats.total, icon: Users },
          { label: 'High-Risk Count', value: stats.highRisk, icon: AlertTriangle, accent: true },
          { label: 'Avg Risk Score', value: `${stats.avgRisk}%`, icon: TrendingUp },
          { label: 'Model Accuracy', value: `${stats.modelAccuracy}%`, icon: Target },
        ].map((kpi) => (
          <div key={kpi.label} className="clinical-card col-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="field-label mb-2">{kpi.label}</p>
                <p
                  className="tabular-nums font-bold"
                  style={{
                    fontSize: 'var(--text-data-lg)',
                    color: kpi.accent ? 'var(--color-risk-high-text)' : 'var(--color-text-primary)',
                  }}
                >
                  {kpi.value}
                </p>
              </div>
              <kpi.icon
                className="h-5 w-5"
                style={{ color: kpi.accent ? 'var(--color-risk-high-accent)' : 'var(--color-brand-600)' }}
                aria-hidden="true"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid mb-6">
        <div className="clinical-card col-4">
          <div className="clinical-card-header">
            <h2 className="clinical-card-title">Risk Distribution</h2>
          </div>
          {predictions.length > 0 ? (
            <RiskDistributionChart probabilities={predictions.map(p => p.probability)} />
          ) : (
            <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-tertiary)' }}>
              No prediction data yet.
            </p>
          )}
        </div>

        <div className="clinical-card col-8">
          <div className="clinical-card-header">
            <h2 className="clinical-card-title">Recent Predictions</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/history')}>
              View All
            </Button>
          </div>
          {predictions.length === 0 ? (
            <EmptyState
              title="No predictions yet"
              description="Run your first assessment to see recent prediction results here."
              action={{ label: 'Run Assessment', onClick: () => navigate('/assessment') }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th className="numeric">Score</th>
                    <th>Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.slice(0, 8).map(p => {
                    const patient = getPatientById(p.patient_id);
                    return (
                      <tr
                        key={p.prediction_id}
                        onClick={() => patient && navigate(`/patient-history/${patient.id}`)}
                        className={p.risk_level === 'Critical' ? 'row--critical' : undefined}
                      >
                        <td>
                          {patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown'}
                        </td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>
                          {new Date(p.prediction_time).toLocaleDateString()}
                        </td>
                        <td className="numeric tabular-nums font-semibold">
                          {(p.probability * 100).toFixed(0)}%
                        </td>
                        <td>
                          <RiskBadge level={p.risk_level} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="clinical-card col-12">
        <div className="clinical-card-header">
          <h2 className="clinical-card-title">High-Risk Patient Queue</h2>
          <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-tertiary)' }}>
            Model v{MODEL_VERSION}
          </span>
        </div>
        {highRiskPatients.length === 0 ? (
          <p style={{ fontSize: 'var(--text-body-md)', color: 'var(--color-text-secondary)' }}>
            No high-risk patients identified in the current cohort.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>MRN</th>
                  <th className="numeric">Latest Score</th>
                  <th>Risk Level</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {highRiskPatients.map(patient => {
                  const latest = predictions.find(pr => pr.patient_id === patient.id);
                  return (
                    <tr
                      key={patient.id}
                      className={latest?.risk_level === 'Critical' ? 'row--critical' : undefined}
                      onClick={() => navigate(`/patient-history/${patient.id}`)}
                    >
                      <td className="font-medium">
                        {patient.first_name} {patient.last_name}
                      </td>
                      <td className="tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
                        {patient.patient_id}
                      </td>
                      <td className="numeric tabular-nums font-semibold">
                        {latest ? `${(latest.probability * 100).toFixed(0)}%` : '—'}
                      </td>
                      <td>
                        {latest && <RiskBadge level={latest.risk_level} />}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/patient-history/${patient.id}`);
                          }}
                        >
                          Review <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
