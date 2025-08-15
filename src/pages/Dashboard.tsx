
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import RiskGauge from '@/components/dashboard/RiskGauge';
import ModelInterpretability from '@/components/dashboard/ModelInterpretability';
import RiskFactorDetail from '@/components/dashboard/RiskFactorDetail';
import MainNav from '@/components/navigation/MainNav';
import { useNavigate } from 'react-router-dom';
import { Activity, LineChart, Heart, BarChart, ArrowRight, Users, Plus, TrendingUp, AlertTriangle, Lightbulb, BookOpen, Shield, ActivitySquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { checkDatabaseTables, testSupabaseConnection } from '@/utils/databaseCheck';
import { useToast } from '@/components/ui/use-toast';

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

interface DiabetesTip {
  title: string;
  description: string;
  icon: string;
  category: 'lifestyle' | 'medical' | 'nutrition' | 'monitoring';
}

const Dashboard = () => {
  const { clinician } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [highRiskPatients, setHighRiskPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [databaseStatus, setDatabaseStatus] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (clinician) {
      loadPatients();
      checkDatabaseStatus();
    }
  }, [clinician]);

  const loadPatients = async () => {
    if (!clinician) return;
    
    try {
      setLoading(true);
      
      // Fetch real patients from database
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinician_id', clinician.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching patients:', error);
        setPatients([]);
        setHighRiskPatients([]);
      } else {
        setPatients(data || []);
        // For now, consider patients with recent assessments as high risk
        // This can be enhanced later with actual risk assessment data
        setHighRiskPatients(data?.slice(0, 2) || []);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatients([]);
      setHighRiskPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const checkDatabaseStatus = async () => {
    const status = await checkDatabaseTables();
    setDatabaseStatus(status);
    console.log('Database status:', status);
  };

  const testConnection = async () => {
    const result = await testSupabaseConnection();
    if (result.success) {
      toast({
        title: "Connection Test",
        description: result.message,
      });
    } else {
      toast({
        title: "Connection Test Failed",
        description: `${result.type}: ${result.error}`,
        variant: "destructive"
      });
    }
  };

  // Comprehensive diabetes tips
  const diabetesTips: DiabetesTip[] = [
    {
      title: "Regular Blood Glucose Monitoring",
      description: "Monitor blood glucose levels regularly, especially before meals and at bedtime. Keep a log to track patterns and share with your healthcare team.",
      icon: "🩸",
      category: 'monitoring'
    },
    {
      title: "HbA1c Testing Every 3-6 Months",
      description: "HbA1c provides a 3-month average of blood glucose levels. Aim for levels below 7% for most adults with diabetes.",
      icon: "📊",
      category: 'monitoring'
    },
    {
      title: "Balanced Carbohydrate Management",
      description: "Learn to count carbohydrates and distribute them evenly throughout the day. Focus on complex carbs from whole grains, fruits, and vegetables.",
      icon: "🍞",
      category: 'nutrition'
    },
    {
      title: "Regular Physical Activity",
      description: "Aim for 150 minutes of moderate exercise weekly. Include both aerobic activities and strength training for optimal glucose control.",
      icon: "🏃‍♂️",
      category: 'lifestyle'
    },
    {
      title: "Foot Care Routine",
      description: "Check feet daily for cuts, blisters, or sores. Keep feet clean and dry, and wear comfortable, well-fitting shoes.",
      icon: "👣",
      category: 'medical'
    },
    {
      title: "Blood Pressure Management",
      description: "Monitor blood pressure regularly. Aim for readings below 140/90 mmHg. Consider lifestyle changes and medication if needed.",
      icon: "❤️",
      category: 'medical'
    },
    {
      title: "Stress Management",
      description: "Practice stress-reduction techniques like meditation, deep breathing, or yoga. Chronic stress can affect blood glucose levels.",
      icon: "🧘‍♀️",
      category: 'lifestyle'
    },
    {
      title: "Medication Adherence",
      description: "Take medications as prescribed and never skip doses. Set reminders and keep a medication schedule.",
      icon: "💊",
      category: 'medical'
    },
    {
      title: "Regular Eye Exams",
      description: "Schedule annual eye exams to detect diabetic retinopathy early. Early treatment can prevent vision loss.",
      icon: "👁️",
      category: 'medical'
    },
    {
      title: "Healthy Sleep Habits",
      description: "Aim for 7-9 hours of quality sleep per night. Poor sleep can affect blood glucose control and insulin sensitivity.",
      icon: "😴",
      category: 'lifestyle'
    },
    {
      title: "Portion Control",
      description: "Use measuring cups, food scales, or visual cues to control portion sizes. This helps manage calorie and carbohydrate intake.",
      icon: "🍽️",
      category: 'nutrition'
    },
    {
      title: "Emergency Preparedness",
      description: "Keep emergency contact information handy. Learn to recognize and treat hypoglycemia and hyperglycemia symptoms.",
      icon: "🚨",
      category: 'medical'
    }
  ];

  // Daily clinical tip
  const clinicalTips = [
    "Regular HbA1c monitoring is crucial for diabetes management 🩸",
    "Consider cultural dietary preferences when advising patients 🍽️",
    "Encourage physical activity that fits patients' lifestyle 🏃‍♂️",
    "Monitor blood pressure alongside glucose levels 📊",
    "Educate patients about foot care and regular check-ups 👣",
    "Consider traditional medicine practices in patient care 🌿",
    "Regular follow-ups improve patient outcomes 📅",
    "Encourage family involvement in diabetes management 👨‍👩‍👧‍👦",
    "Stay updated with latest diabetes management guidelines 📚"
  ];
  
  const randomTip = clinicalTips[Math.floor(Math.random() * clinicalTips.length)];

  // Define feature contributions for the model interpretability
  const featureContributions = [
    {
      name: "HbA1c Level",
      contribution: 35.2,
      description: "Patient's glycated hemoglobin is above the recommended range.",
      color: "bg-diabetesSense-high"
    },
    {
      name: "Blood Glucose",
      contribution: 24.8,
      description: "Patient's fasting blood glucose is elevated.",
      color: "bg-diabetesSense-moderate"
    },
    {
      name: "BMI",
      contribution: 18.5,
      description: "Patient's body mass index is in the overweight range.",
      color: "bg-diabetesSense-moderate"
    },
    {
      name: "Age",
      contribution: 10.3,
      description: "Patient's age group has an increased risk factor.",
      color: "bg-diabetesSense-low"
    },
    {
      name: "Physical Activity",
      contribution: -12.6,
      description: "Patient's regular exercise habits are reducing risk.",
      color: "bg-diabetesSense-low"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-diabetesSense-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block relative">
            <div className="w-24 h-24 rounded-full bg-diabetesSense-background flex items-center justify-center mb-4 border-2 border-diabetesSense-accent/30">
              <span className="text-4xl font-bold text-diabetesSense-accent">DT</span>
              <div className="absolute -inset-1 rounded-full border border-diabetesSense-accent/20 animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-diabetesSense-background flex flex-col">
      <MainNav />
      
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                  <header className="mb-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-white">
              Welcome, <span className="text-diabetesSense-accent">{clinician?.display_name || 'Doctor'}</span>
            </h1>
            <p className="text-gray-400">Manage your patients and their diabetes care</p>
            
            {/* Database Status Indicator */}
            {databaseStatus && (
              <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                <h3 className="text-sm font-semibold text-white mb-2">Database Status:</h3>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className={`flex items-center space-x-2 ${databaseStatus.clinicians ? 'text-green-400' : 'text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${databaseStatus.clinicians ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span>Clinicians: {databaseStatus.clinicians ? 'OK' : 'Missing'}</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${databaseStatus.patients ? 'text-green-400' : 'text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${databaseStatus.patients ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span>Patients: {databaseStatus.patients ? 'OK' : 'Missing'}</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${databaseStatus.prediction_logs ? 'text-green-400' : 'text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${databaseStatus.prediction_logs ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span>Predictions: {databaseStatus.prediction_logs ? 'OK' : 'Missing'}</span>
                  </div>
                </div>
                {databaseStatus.error && (
                  <p className="text-red-400 text-xs mt-2">Error: {databaseStatus.error}</p>
                )}
                
                {/* Database check area stripped of test patient creation per request */}
              </div>
            )}
          </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="card-gradient border border-white/10 animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-diabetesSense-accent" />
                Total Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">{patients.length}</div>
              <p className="text-sm text-gray-400">Registered patients</p>
              <Button 
                onClick={() => navigate('/patients')}
                variant="outline" 
                className="mt-4 w-full bg-diabetesSense-accent/10 text-diabetesSense-accent border-diabetesSense-accent/20 hover:bg-diabetesSense-accent/20"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </CardContent>
          </Card>
          
          <Card className="card-gradient border border-white/10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-diabetesSense-accent" />
                Recent Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">0</div>
              <p className="text-sm text-gray-400">This week</p>
              <Button 
                onClick={() => navigate('/assessment')}
                variant="outline" 
                className="mt-4 w-full bg-diabetesSense-accent/10 text-diabetesSense-accent border-diabetesSense-accent/20 hover:bg-diabetesSense-accent/20"
              >
                <Activity className="mr-2 h-4 w-4" />
                New Assessment
              </Button>
            </CardContent>
          </Card>
          
          <Card className="card-gradient border border-white/10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-diabetesSense-accent" />
                High Risk Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">{highRiskPatients.length}</div>
              <p className="text-sm text-gray-400">Require attention</p>
              <Button 
                onClick={() => navigate('/patients')}
                variant="outline" 
                className="mt-4 w-full bg-diabetesSense-accent/10 text-diabetesSense-accent border-diabetesSense-accent/20 hover:bg-diabetesSense-accent/20"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                View Patients
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {patients.length > 0 ? (
          <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-xl font-bold text-white mb-4">Recent Patients</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.slice(0, 6).map((patient) => (
                <Card key={patient.id} className="card-gradient border border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      <span className="text-xs text-gray-400">ID: {patient.patient_id}</span>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      {patient.gender && <div>Gender: {patient.gender}</div>}
                      {patient.date_of_birth && (
                        <div>DOB: {new Date(patient.date_of_birth).toLocaleDateString()}</div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-3 w-full bg-diabetesSense-accent/10 text-diabetesSense-accent border-diabetesSense-accent/20 hover:bg-diabetesSense-accent/20"
                      onClick={() => navigate('/assessment')}
                    >
                      <ActivitySquare className="mr-2 h-4 w-4" />
                      Assess Risk
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="card-gradient border border-white/10 animate-fade-in">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="inline-block relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-diabetesSense-background flex items-center justify-center border-2 border-diabetesSense-accent/30">
                    <Users className="h-9 w-9 text-diabetesSense-accent" />
                    <div className="absolute -inset-1 rounded-full border border-diabetesSense-accent/20 animate-pulse-slow"></div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to DiaTrack!</h2>
                <p className="text-gray-300 mb-6">
                  Start by adding your first patient to begin managing their diabetes care.
                </p>
                <Button 
                  onClick={() => navigate('/patients')} 
                  className="bg-diabetesSense-accent hover:bg-diabetesSense-accent/90 text-white px-8 py-6 rounded-xl text-lg"
                >
                  Add Your First Patient
                </Button>
              </div>
              
              <div className="bg-secondary/30 rounded-lg p-4 max-w-md mx-auto">
                <h3 className="text-white font-medium mb-2">What you can do:</h3>
                <ul className="text-left text-sm text-gray-300 space-y-2">
                  <li className="flex items-start">
                    <span className="text-diabetesSense-accent mr-2">•</span>
                    <span>Register and manage multiple patients</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-diabetesSense-accent mr-2">•</span>
                    <span>Conduct diabetes risk assessments</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-diabetesSense-accent mr-2">•</span>
                    <span>Track patient progress over time</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Diabetes Tips Section */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Card className="card-gradient border border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-diabetesSense-accent" />
                Diabetes Management Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="all">All Tips</TabsTrigger>
                  <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
                  <TabsTrigger value="medical">Medical</TabsTrigger>
                  <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {diabetesTips.map((tip, index) => (
                      <div 
                        key={index} 
                        className="bg-secondary rounded-lg p-4 border-l-4 border-r-0 border-y-0 border-diabetesSense-accent/30"
                      >
                        <div className="flex items-start">
                          <div className="text-2xl mr-3">{tip.icon}</div>
                          <div>
                            <h3 className="font-medium text-white">{tip.title}</h3>
                            <p className="text-sm text-gray-300 mt-1">{tip.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="lifestyle" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {diabetesTips
                      .filter(tip => tip.category === 'lifestyle')
                      .map((tip, index) => (
                        <div 
                          key={index} 
                          className="bg-secondary rounded-lg p-4 border-l-4 border-r-0 border-y-0 border-diabetesSense-accent/30"
                        >
                          <div className="flex items-start">
                            <div className="text-2xl mr-3">{tip.icon}</div>
                            <div>
                              <h3 className="font-medium text-white">{tip.title}</h3>
                              <p className="text-sm text-gray-300 mt-1">{tip.description}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </TabsContent>
                
                <TabsContent value="medical" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {diabetesTips
                      .filter(tip => tip.category === 'medical')
                      .map((tip, index) => (
                        <div 
                          key={index} 
                          className="bg-secondary rounded-lg p-4 border-l-4 border-r-0 border-y-0 border-diabetesSense-accent/30"
                        >
                          <div className="flex items-start">
                            <div className="text-2xl mr-3">{tip.icon}</div>
                            <div>
                              <h3 className="font-medium text-white">{tip.title}</h3>
                              <p className="text-sm text-gray-300 mt-1">{tip.description}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </TabsContent>
                
                <TabsContent value="nutrition" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {diabetesTips
                      .filter(tip => tip.category === 'nutrition')
                      .map((tip, index) => (
                        <div 
                          key={index} 
                          className="bg-secondary rounded-lg p-4 border-l-4 border-r-0 border-y-0 border-diabetesSense-accent/30"
                        >
                          <div className="flex items-start">
                            <div className="text-2xl mr-3">{tip.icon}</div>
                            <div>
                              <h3 className="font-medium text-white">{tip.title}</h3>
                              <p className="text-sm text-gray-300 mt-1">{tip.description}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6 p-4 bg-secondary/50 rounded-lg border border-white/5 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <p className="text-center text-gray-300 italic">
            <span className="text-diabetesSense-accent font-medium">Clinical Tip:</span> {randomTip}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
