import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import MainNav from '@/components/navigation/MainNav';
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  ActivitySquare, 
  FileText, 
  Download
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { patientHistoryAPI } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';

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

interface PredictionRecord {
  prediction_id: string;
  prediction_time: string;
  prediction: number;
  probability: number; // stores confidence_score
  feature_input: any;
  recommendations: string;
  shap_values: any;
  confidence_interval: any;
}

const PatientHistoryPage = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPredictions, setLoadingPredictions] = useState(true);

  useEffect(() => {
    if (patientId) {
      loadPatientData();
      loadPredictionHistory();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) {
        console.error('Error loading patient:', error);
        toast({
          title: "Error",
          description: "Failed to load patient data.",
          variant: "destructive"
        });
        return;
      }

      setPatient(data);
    } catch (error) {
      console.error('Error loading patient:', error);
      toast({
        title: "Error",
        description: "Failed to load patient data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPredictionHistory = async () => {
    try {
      const response = await patientHistoryAPI.getPatientHistory(patientId!);
      
      if (!response.success) {
        toast({
          title: "Error",
          description: response.error || "Failed to load prediction history.",
          variant: "destructive"
        });
        return;
      }

      setPredictions(response.data || []);
    } catch (error) {
      console.error('Error loading predictions:', error);
      toast({
        title: "Error",
        description: "Failed to load prediction history.",
        variant: "destructive"
      });
    } finally {
      setLoadingPredictions(false);
    }
  };

  const getRiskLevel = (score: number): { level: string; color: string } => {
    if (score < 0.3) return { level: 'Low', color: 'bg-green-500' };
    if (score < 0.6) return { level: 'Moderate', color: 'bg-yellow-500' };
    return { level: 'High', color: 'bg-red-500' };
  };

  const formatData = (data: PredictionRecord[]) => {
    return data.map(item => ({
      name: new Date(item.prediction_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: parseFloat((item.prediction * 100).toFixed(1)),
      confidence: parseFloat((item.probability * 100).toFixed(1)),
      ciLow: item.confidence_interval?.lower ? parseFloat((item.confidence_interval.lower * 100).toFixed(1)) : undefined,
      ciHigh: item.confidence_interval?.upper ? parseFloat((item.confidence_interval.upper * 100).toFixed(1)) : undefined,
    }));
  };

  const exportHistory = () => {
    if (!patient || predictions.length === 0) return;

    const csvContent = [
      ['Date', 'Risk Score', 'Confidence', 'CI Lower', 'CI Upper', 'Risk Level', 'Recommendations'],
      ...predictions.map(pred => [
        new Date(pred.prediction_time).toLocaleDateString(),
        (pred.prediction * 100).toFixed(1) + '%',
        (pred.probability * 100).toFixed(1) + '%',
        pred.confidence_interval?.lower !== undefined ? (pred.confidence_interval.lower * 100).toFixed(1) + '%' : '',
        pred.confidence_interval?.upper !== undefined ? (pred.confidence_interval.upper * 100).toFixed(1) + '%' : '',
        getRiskLevel(pred.prediction).level,
        pred.recommendations || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${patient.first_name}_${patient.last_name}_history.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Patient history has been exported to CSV.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-diabetesSense-background flex flex-col">
        <MainNav />
        <div className="flex-1 p-4 md:p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-diabetesSense-accent mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading patient data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-diabetesSense-background flex flex-col">
        <MainNav />
        <div className="flex-1 p-4 md:p-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-lg">Patient not found</p>
            <Button 
              onClick={() => navigate('/patients')}
              className="mt-4 bg-diabetesSense-accent hover:bg-diabetesSense-accent/90"
            >
              Back to Patients
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-diabetesSense-background flex flex-col">
      <MainNav />
      
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/patients')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Patients
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {patient.first_name} {patient.last_name}
                </h1>
                <p className="text-gray-400">Patient ID: {patient.patient_id}</p>
              </div>
            </div>
            <Button
              onClick={exportHistory}
              disabled={predictions.length === 0}
              className="bg-diabetesSense-accent hover:bg-diabetesSense-accent/90"
            >
              <Download className="mr-2 h-4 w-4" />
              Export History
            </Button>
          </div>
        </header>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Assessment History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="details">Patient Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="card-gradient border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ActivitySquare className="mr-2 h-5 w-5 text-diabetesSense-accent" />
                    Total Assessments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{predictions.length}</div>
                  <p className="text-gray-400 text-sm">Risk assessments conducted</p>
                </CardContent>
              </Card>

              <Card className="card-gradient border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-green-500" />
                    Last Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {predictions.length > 0 ? (
                    <>
                      <div className="text-lg font-bold text-white">
                        {new Date(predictions[0].prediction_time).toLocaleDateString()}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {getRiskLevel(predictions[0].prediction).level} Risk
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-white">No assessments</div>
                      <p className="text-gray-400 text-sm">No risk assessments yet</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="card-gradient border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
                    Average Risk Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {predictions.length > 0 ? (
                    <>
                      <div className="text-3xl font-bold text-white">
                        {(predictions.reduce((sum, p) => sum + p.prediction, 0) / predictions.length * 100).toFixed(1)}%
                      </div>
                      <p className="text-gray-400 text-sm">Overall risk level</p>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-white">N/A</div>
                      <p className="text-gray-400 text-sm">No data available</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {predictions.length > 0 && (
              <Card className="card-gradient border border-white/10">
                <CardHeader>
                  <CardTitle>Risk Score Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatData(predictions)}
                        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="#8E9196" />
                        <YAxis stroke="#8E9196" domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(11, 29, 52, 0.9)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: '#fff'
                          }} 
                          formatter={(value: number) => [`${value}%`, 'Risk Score']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#2F80ED" 
                          strokeWidth={3} 
                          dot={{ 
                            stroke: "#2F80ED", 
                            strokeWidth: 2, 
                            r: 4, 
                            fill: 'rgba(11, 29, 52, 1)' 
                          }} 
                          activeDot={{ r: 6 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            {loadingPredictions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-diabetesSense-accent mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading assessment history...</p>
              </div>
            ) : predictions.length > 0 ? (
              <div className="space-y-4">
                {predictions.map((prediction) => {
                  const riskLevel = getRiskLevel(prediction.prediction);
                  const ciText = prediction.confidence_interval ? ` (CI ${(prediction.confidence_interval.lower * 100).toFixed(1)}%–${(prediction.confidence_interval.upper * 100).toFixed(1)}%)` : '';
                  return (
                    <Card key={prediction.prediction_id} className="card-gradient border border-white/10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">
                              {new Date(prediction.prediction_time).toLocaleDateString()} at{' '}
                              {new Date(prediction.prediction_time).toLocaleTimeString()}
                            </p>
                            <div className="flex items-center mt-2 space-x-2">
                              <Badge className={riskLevel.color}>
                                {riskLevel.level} Risk
                              </Badge>
                              <span className="text-sm text-gray-400">
                                Score: {(prediction.prediction * 100).toFixed(1)}%
                              </span>
                              <span className="text-sm text-gray-400">
                                Confidence: {(prediction.probability * 100).toFixed(1)}%{ciText}
                              </span>
                            </div>
                          </div>
                          <ActivitySquare className="h-5 w-5 text-diabetesSense-accent" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-white mb-2">Key Features</h4>
                            <div className="space-y-1">
                              {prediction.feature_input && Object.entries(prediction.feature_input).slice(0, 5).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm">
                                  <span className="text-gray-300">{key}:</span>
                                  <span className="text-white">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white mb-2">Recommendations</h4>
                            <p className="text-sm text-gray-300">
                              {prediction.recommendations || 'No specific recommendations provided.'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <ActivitySquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Assessment History</h3>
                <p className="text-gray-400 mb-4">
                  This patient hasn't had any assessments yet.
                </p>
                <Button 
                  className="bg-diabetesSense-accent hover:bg-diabetesSense-accent/90 text-white"
                  onClick={() => navigate(`/assessment?patientId=${patientId}`)}
                >
                  <ActivitySquare className="mr-2 h-4 w-4" />
                  Conduct First Assessment
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            {predictions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="card-gradient border border-white/10">
                  <CardHeader>
                    <CardTitle>Risk Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={formatData(predictions)}
                          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="name" stroke="#8E9196" />
                          <YAxis stroke="#8E9196" domain={[0, 100]} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(11, 29, 52, 0.9)', 
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '8px',
                              color: '#fff'
                            }} 
                            formatter={(value: number) => [`${value}%`, 'Risk Score']}
                          />
                          <Bar dataKey="score" fill="#2F80ED" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient border border-white/10">
                  <CardHeader>
                    <CardTitle>Confidence Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formatData(predictions)}
                          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="name" stroke="#8E9196" />
                          <YAxis stroke="#8E9196" domain={[0, 100]} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(11, 29, 52, 0.9)', 
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '8px',
                              color: '#fff'
                            }} 
                            formatter={(value: number, name: string, props: any) => {
                              if (name === 'confidence') {
                                const ciLow = props?.payload?.ciLow;
                                const ciHigh = props?.payload?.ciHigh;
                                const ciText = ciLow !== undefined && ciHigh !== undefined ? ` (CI ${ciLow}%–${ciHigh}%)` : '';
                                return [`${value}%${ciText}`, 'Confidence'];
                              }
                              return [`${value}%`, name];
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="confidence" 
                            stroke="#10B981" 
                            strokeWidth={3} 
                            dot={{ 
                              stroke: "#10B981", 
                              strokeWidth: 2, 
                              r: 4, 
                              fill: 'rgba(11, 29, 52, 1)' 
                            }} 
                            activeDot={{ r: 6 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Analytics Available</h3>
                <p className="text-gray-400">
                  Analytics will be available after the first assessment is conducted.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <Card className="card-gradient border border-white/10">
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-white mb-3">Personal Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Full Name:</span>
                        <span className="text-white">{patient.first_name} {patient.last_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Patient ID:</span>
                        <span className="text-white">{patient.patient_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Date of Birth:</span>
                        <span className="text-white">
                          {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Gender:</span>
                        <span className="text-white">{patient.gender || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Email:</span>
                        <span className="text-white">{patient.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Phone:</span>
                        <span className="text-white">{patient.contact_number || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Address:</span>
                        <span className="text-white">{patient.address || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Emergency Contact:</span>
                        <span className="text-white">{patient.emergency_contact || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientHistoryPage;
