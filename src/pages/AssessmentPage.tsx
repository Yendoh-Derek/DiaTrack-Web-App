
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from '@/components/layout/AppLayout';
import { calculateBMI, getBMICategory } from '@/utils/bmiCalculator';
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { calculateRisk } from '@/services/prediction/predictionService';
import { savePrediction, getPatients, getPatientById } from '@/stores/demoStore';
import type { Patient } from '@/types/patient';
import type { PredictionInput, PredictionResult, SmokingHistory } from '@/types/prediction';
import RiskAssessmentResults from '@/components/assessment/RiskAssessmentResults';

interface AssessmentForm {
  patient_id: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  hypertension: boolean;
  heart_disease: boolean;
  smoking_history: SmokingHistory;
  HbA1c_level: string;
  blood_glucose_level: string;
}

const PREDICTION_STEPS = [
  'Validating inputs',
  'Running model',
  'Computing SHAP',
  'Done',
] as const;

const AssessmentPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string>("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<PredictionResult | null>(null);
  const [predictionStep, setPredictionStep] = useState(0);

  const [form, setForm] = useState<AssessmentForm>({
    patient_id: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    hypertension: false,
    heart_disease: false,
    smoking_history: 'never',
    HbA1c_level: '',
    blood_glucose_level: ''
  });

  const loadPatients = () => setPatients(getPatients());

  useEffect(() => {
    loadPatients();
    const patientId = searchParams.get('patientId');
    if (patientId) setForm(prev => ({ ...prev, patient_id: patientId }));
  }, [searchParams]);

  useEffect(() => {
    if (form.height && form.weight) {
      const height = parseFloat(form.height);
      const weight = parseFloat(form.weight);
      if (height > 0 && weight > 0) {
        const calculatedBMI = calculateBMI(height, weight);
        setBmi(parseFloat(calculatedBMI.toFixed(1)));
        setBmiCategory(getBMICategory(calculatedBMI));
      }
    }
  }, [form.height, form.weight]);

  const handleChange = (field: keyof AssessmentForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = Boolean(
    form.patient_id && form.age && form.gender && form.height &&
    form.weight && form.HbA1c_level && form.blood_glucose_level
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hba1c = parseFloat(form.HbA1c_level);
    const glucose = parseInt(form.blood_glucose_level);

    if (hba1c > 15 || hba1c < 3) {
      toast({ title: "Invalid HbA1c Level", description: "HbA1c should be between 3% and 15%.", variant: "destructive" });
      return;
    }
    if (glucose > 600 || glucose < 50) {
      toast({ title: "Invalid Blood Glucose", description: "Blood glucose should be between 50 and 600 mg/dL.", variant: "destructive" });
      return;
    }

    const patient = getPatientById(form.patient_id);
    if (!patient) {
      toast({ title: "Patient not found", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setPredictionStep(0);

    try {
      setPredictionStep(1);
      const predictionInput: PredictionInput = {
        patient_id: patient.patient_id,
        age: parseInt(form.age),
        gender: form.gender === 'male' ? 1 : 0,
        bmi: bmi || 0,
        hypertension: form.hypertension ? 1 : 0,
        heart_disease: form.heart_disease ? 1 : 0,
        smoking_history: form.smoking_history,
        HbA1c_level: hba1c,
        blood_glucose_level: glucose
      };

      setPredictionStep(2);
      const result = await calculateRisk({ ...predictionInput, patient_id: form.patient_id });
      savePrediction(result);

      setPredictionStep(3);
      setAssessmentResult(result);
      setShowResults(true);

      toast({
        title: "Assessment Complete",
        description: `Risk level: ${result.risk_level} (${(result.probability * 100).toFixed(1)}% probability)`,
      });
    } catch {
      toast({ title: "Assessment Error", description: "Failed to complete assessment.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setPredictionStep(0);
    }
  };

  const SectionCard = ({ number, title, children }: { number: number; title: string; children: React.ReactNode }) => (
    <div className="clinical-card mb-4">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{ background: 'var(--color-brand-600)', color: 'var(--color-text-inverse)' }}
        >
          {number}
        </span>
        <h2 className="clinical-card-title">{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <AppLayout>
      <header className="mb-6">
        <h1 className="font-semibold" style={{ fontSize: 'var(--text-display)' }}>
          Diabetes Risk Assessment
        </h1>
        <p style={{ fontSize: 'var(--text-body-md)', color: 'var(--color-text-secondary)' }}>
          ML-powered risk assessment (demo model — not for clinical diagnosis)
        </p>
      </header>

      <form onSubmit={handleSubmit}>
        <SectionCard number={1} title="Demographic & Biometric">
          <div className="space-y-4">
            <div className="form-field">
              <Label htmlFor="patient_id">Select Patient *</Label>
              <div className="flex items-center gap-2">
                <Select value={form.patient_id} onValueChange={(value) => handleChange('patient_id', value)}>
                  <SelectTrigger className="min-w-[260px]">
                    <SelectValue placeholder="Choose a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name} (MRN: {patient.patient_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" onClick={loadPatients} aria-label="Refresh patient list">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              {patients.length === 0 && (
                <p className="field-hint">
                  No patients found.{' '}
                  <button type="button" className="text-[var(--color-text-brand)] underline" onClick={() => navigate('/patients')}>
                    Add a patient first
                  </button>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-field">
                <Label htmlFor="age">Age *</Label>
                <Input id="age" type="number" placeholder="Enter age" value={form.age} onChange={(e) => handleChange('age', e.target.value)} />
              </div>
              <div className="form-field">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={form.gender} onValueChange={(value) => handleChange('gender', value)}>
                  <SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-field">
                <Label htmlFor="height">Height *</Label>
                <div className="flex items-center gap-0">
                  <Input id="height" type="number" placeholder="170" value={form.height} onChange={(e) => handleChange('height', e.target.value)} className="rounded-r-none" />
                  <span className="h-9 px-3 flex items-center border border-l-0 rounded-r-[var(--radius-md)] text-sm" style={{ borderColor: 'var(--color-border-default)', background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}>cm</span>
                </div>
              </div>
              <div className="form-field">
                <Label htmlFor="weight">Weight *</Label>
                <div className="flex items-center gap-0">
                  <Input id="weight" type="number" placeholder="75" value={form.weight} onChange={(e) => handleChange('weight', e.target.value)} className="rounded-r-none" />
                  <span className="h-9 px-3 flex items-center border border-l-0 rounded-r-[var(--radius-md)] text-sm" style={{ borderColor: 'var(--color-border-default)', background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}>kg</span>
                </div>
              </div>
            </div>

            {bmi && (
              <div className="p-3 rounded-[var(--radius-md)]" style={{ background: 'var(--color-bg-subtle)' }}>
                <p style={{ fontSize: 'var(--text-body-md)' }}>
                  <span className="field-label inline mr-2">BMI</span>
                  <span className="tabular-nums font-medium">{bmi} kg/m²</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}> ({bmiCategory})</span>
                </p>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard number={2} title="Laboratory Values">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-field">
              <Label htmlFor="HbA1c_level">HbA1c Level *</Label>
              <div className="flex items-center gap-0">
                <Input id="HbA1c_level" type="number" step="0.1" value={form.HbA1c_level} onChange={(e) => handleChange('HbA1c_level', e.target.value)} className="rounded-r-none" />
                <span className="h-9 px-3 flex items-center border border-l-0 rounded-r-[var(--radius-md)] text-sm" style={{ borderColor: 'var(--color-border-default)', background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}>%</span>
              </div>
            </div>
            <div className="form-field">
              <Label htmlFor="blood_glucose_level">Blood Glucose *</Label>
              <div className="flex items-center gap-0">
                <Input id="blood_glucose_level" type="number" value={form.blood_glucose_level} onChange={(e) => handleChange('blood_glucose_level', e.target.value)} className="rounded-r-none" />
                <span className="h-9 px-3 flex items-center border border-l-0 rounded-r-[var(--radius-md)] text-sm" style={{ borderColor: 'var(--color-border-default)', background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}>mg/dL</span>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard number={3} title="Lifestyle Factors">
          <div className="form-field max-w-sm">
            <Label htmlFor="smoking_history">Smoking History</Label>
            <Select value={form.smoking_history} onValueChange={(value) => handleChange('smoking_history', value as SmokingHistory)}>
              <SelectTrigger id="smoking_history"><SelectValue placeholder="Select smoking history" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="former">Former</SelectItem>
                <SelectItem value="current">Current</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SectionCard>

        <SectionCard number={4} title="Medical History & Comorbidities">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch id="hypertension" checked={form.hypertension} onCheckedChange={(checked) => handleChange('hypertension', checked)} />
              <Label htmlFor="hypertension" className="normal-case tracking-normal text-sm font-normal" style={{ color: 'var(--color-text-primary)' }}>
                Hypertension
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="heart_disease" checked={form.heart_disease} onCheckedChange={(checked) => handleChange('heart_disease', checked)} />
              <Label htmlFor="heart_disease" className="normal-case tracking-normal text-sm font-normal" style={{ color: 'var(--color-text-primary)' }}>
                Heart Disease
              </Label>
            </div>
          </div>
        </SectionCard>

        <div className="sticky-form-footer">
          <Button type="button" variant="outline" onClick={() => navigate('/patients')}>
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={isLoading || !isFormValid}>
            {isLoading ? 'Running Prediction…' : 'Run Prediction'}
          </Button>
        </div>
      </form>

      {isLoading && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'var(--color-bg-overlay)' }}
          role="status"
          aria-live="polite"
        >
          <div className="clinical-card w-full max-w-md mx-4">
            <h3 className="clinical-card-title mb-4">Computing Prediction</h3>
            <div className="space-y-3">
              {PREDICTION_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  {i < predictionStep ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: 'var(--color-risk-low-accent)' }} />
                  ) : i === predictionStep ? (
                    <div className="h-4 w-4 rounded-full border-2 border-[var(--color-brand-600)] border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border shrink-0" style={{ borderColor: 'var(--color-border-default)' }} />
                  )}
                  <span
                    style={{
                      fontSize: 'var(--text-body-md)',
                      color: i <= predictionStep ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                    }}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showResults && assessmentResult && (
        <RiskAssessmentResults
          result={assessmentResult}
          onClose={() => { setShowResults(false); setAssessmentResult(null); }}
          onSaveToHistory={() => navigate(`/patient-history/${assessmentResult.patient_id}`)}
        />
      )}
    </AppLayout>
  );
};

export default AssessmentPage;
