
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import MainNav from '@/components/navigation/MainNav';
import { calculateBMI, getBMICategory } from '@/utils/bmiCalculator';
import { Users, AlertTriangle } from "lucide-react";
import { RefreshCw } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { riskPredictionService, RiskPredictionInput, RiskPredictionResult } from '@/services/riskPredictionService';
import RiskAssessmentResults from '@/components/assessment/RiskAssessmentResults';

interface Patient {
  id: string;
  clinician_id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  contact_number?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  medical_history?: any;
  created_at: string;
  updated_at: string;
}

interface AssessmentForm {
  patient_id: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  hypertension: boolean;
  heart_disease: boolean;
  smoking_history: string;
  HbA1c_level: string;
  blood_glucose_level: string;
}

const AssessmentPage = () => {
  const { toast } = useToast();
  const { clinician } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string>("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<RiskPredictionResult | null>(null);
  const [showProcessing, setShowProcessing] = useState(false);
  
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

  useEffect(() => {
    if (clinician) {
      loadPatients();
    }
  }, [clinician]);

  // Reload patients when window regains focus (e.g., after creating a patient)
  useEffect(() => {
    const onFocus = () => {
      if (clinician) loadPatients();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [clinician]);

  // Check for pre-selected patient from patient details
  useEffect(() => {
    const selectedPatientData = localStorage.getItem('selectedPatientForAssessment');
    if (selectedPatientData) {
      try {
        const patient = JSON.parse(selectedPatientData);
        setForm(prev => ({
          ...prev,
          patient_id: patient.id
        }));
        // Clear the localStorage after using it
        localStorage.removeItem('selectedPatientForAssessment');
      } catch (error) {
        console.error('Error parsing selected patient data:', error);
      }
    }
  }, []);

  const loadPatients = async () => {
    if (!clinician) return;
    
    try {
      // Fetch real patients from database
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinician_id', clinician.id)
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching patients:', error);
        toast({
          title: "Error",
          description: "Failed to load patients. Please try again.",
          variant: "destructive"
        });
        setPatients([]);
      } else {
        setPatients(data || []);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients. Please try again.",
        variant: "destructive"
      });
      setPatients([]);
    }
  };

  useEffect(() => {
    // Calculate BMI whenever height or weight changes
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
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation with specific thresholds
    const requiredFields = ['patient_id', 'age', 'gender', 'height', 'weight', 'HbA1c_level', 'blood_glucose_level'];
    const missingFields = requiredFields.filter(field => !form[field as keyof AssessmentForm]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing information",
        description: `Please complete all required fields.`,
        variant: "destructive"
      });
      return;
    }

    // Validate critical values
    const hba1c = parseFloat(form.HbA1c_level);
    const glucose = parseInt(form.blood_glucose_level);
    
    if (hba1c > 15 || hba1c < 3) {
      toast({
        title: "Invalid HbA1c Level",
        description: "HbA1c level should be between 3% and 15%. Please verify the value.",
        variant: "destructive"
      });
      return;
    }

    if (glucose > 600 || glucose < 50) {
      toast({
        title: "Invalid Blood Glucose Level",
        description: "Blood glucose level should be between 50 and 600 mg/dL. Please verify the value.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare enhanced risk prediction input
      const predictionInput: RiskPredictionInput = {
        patient_id: form.patient_id,
        age: parseInt(form.age),
        gender: form.gender === 'male' ? 1 : 0,
        bmi: bmi || 0,
        hypertension: form.hypertension ? 1 : 0,
        heart_disease: form.heart_disease ? 1 : 0,
        smoking_history: form.smoking_history,
        HbA1c_level: hba1c,
        blood_glucose_level: glucose
      };
      
      // Calculate comprehensive risk assessment
      const result = await riskPredictionService.calculateRisk(predictionInput);
      
      // Simulate brief processing before displaying results
      setShowProcessing(true);
      setTimeout(() => {
        setAssessmentResult(result);
        setShowResults(true);
        setShowProcessing(false);
      }, 800);
      
      // Store in localStorage for backup
      localStorage.setItem('lastAssessment', JSON.stringify({
        ...result,
        patient_id: form.patient_id,
        timestamp: new Date().toISOString()
      }));
      
      toast({
        title: "Assessment Complete",
        description: `Risk assessment completed. Risk level: ${result.risk_level}`,
      });
      
    } catch (error) {
      console.error('Assessment error:', error);
      toast({
        title: "Assessment Error",
        description: "Failed to complete assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove the clinician check since all authenticated users should be clinicians
  // The clinician profile will be created automatically during signup

  return (
    <div className="min-h-screen bg-diabetesSense-background flex flex-col">
      <MainNav />
      
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <header className="mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-white">Diabetes Risk Assessment</h1>
          <p className="text-gray-400">Conduct comprehensive diabetes risk assessment for your patients</p>
        </header>

        <Card className="card-gradient border border-white/10 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-diabetesSense-accent" />
              Patient Assessment Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Selection */}
              <div className="space-y-2">
                <Label htmlFor="patient_id" className="text-white">Select Patient *</Label>
                <div className="flex items-center gap-2">
                  <Select value={form.patient_id} onValueChange={(value) => handleChange('patient_id', value)}>
                    <SelectTrigger className="bg-secondary border-white/10 min-w-[260px]">
                      <SelectValue placeholder="Choose a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.first_name} {patient.last_name} (ID: {patient.patient_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={loadPatients}
                    title="Refresh patients"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                {patients.length === 0 && (
                  <p className="text-sm text-gray-400">
                    No patients found. <Button 
                      variant="link" 
                      className="p-0 h-auto text-diabetesSense-accent"
                      onClick={() => navigate('/patients')}
                    >
                      Add a patient first
                    </Button>
                  </p>
                )}
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-white">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter age"
                    value={form.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    className="bg-secondary border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-white">Gender *</Label>
                  <Select value={form.gender} onValueChange={(value) => handleChange('gender', value)}>
                    <SelectTrigger className="bg-secondary border-white/10">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Physical Measurements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-white">Height (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="Enter height in cm"
                    value={form.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    className="bg-secondary border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-white">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="Enter weight in kg"
                    value={form.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    className="bg-secondary border-white/10"
                  />
                </div>
              </div>

              {/* BMI Display */}
              {bmi && (
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-white">
                    <span className="font-medium">BMI:</span> {bmi} kg/m² ({bmiCategory})
                  </p>
                </div>
              )}

              {/* Medical Conditions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Medical Conditions</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hypertension"
                      checked={form.hypertension}
                      onCheckedChange={(checked) => handleChange('hypertension', checked)}
                    />
                    <Label htmlFor="hypertension" className="text-white">Hypertension</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="heart_disease"
                      checked={form.heart_disease}
                      onCheckedChange={(checked) => handleChange('heart_disease', checked)}
                    />
                    <Label htmlFor="heart_disease" className="text-white">Heart Disease</Label>
                  </div>
                </div>
              </div>

              {/* Smoking History */}
              <div className="space-y-2">
                <Label htmlFor="smoking_history" className="text-white">Smoking History</Label>
                <Select value={form.smoking_history} onValueChange={(value) => handleChange('smoking_history', value)}>
                  <SelectTrigger className="bg-secondary border-white/10">
                    <SelectValue placeholder="Select smoking history" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="former">Former</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Diabetes Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="HbA1c_level" className="text-white">HbA1c Level (%) *</Label>
                  <Input
                    id="HbA1c_level"
                    type="number"
                    step="0.1"
                    placeholder="Enter HbA1c level"
                    value={form.HbA1c_level}
                    onChange={(e) => handleChange('HbA1c_level', e.target.value)}
                    className="bg-secondary border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood_glucose_level" className="text-white">Blood Glucose (mg/dL) *</Label>
                  <Input
                    id="blood_glucose_level"
                    type="number"
                    placeholder="Enter blood glucose level"
                    value={form.blood_glucose_level}
                    onChange={(e) => handleChange('blood_glucose_level', e.target.value)}
                    className="bg-secondary border-white/10"
                  />
                </div>
              </div>

              {/* Inline risk alert removed per request. Risk level will only be shown after submission in results modal. */}

              <Button 
                type="submit" 
                disabled={isLoading || !(
                  form.patient_id && form.age && form.gender && form.height && form.weight && form.HbA1c_level && form.blood_glucose_level
                )} 
                className="w-full bg-diabetesSense-accent hover:bg-diabetesSense-accent/90 text-white py-6 rounded-xl font-medium text-lg"
              >
                {isLoading ? "Processing Assessment..." : "Complete Assessment"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Enhanced Risk Assessment Results */}
        {showProcessing && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-diabetesSense-accent mx-auto"></div>
              <p className="text-gray-300 mt-3">Analyzing risk factors...</p>
            </div>
          </div>
        )}
        {showResults && assessmentResult && (
          <RiskAssessmentResults
            result={assessmentResult}
            onClose={() => {
              setShowResults(false);
              setAssessmentResult(null);
            }}
            onSaveToHistory={() => {
              // Navigate to patient history or dashboard
              navigate('/dashboard');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AssessmentPage;
