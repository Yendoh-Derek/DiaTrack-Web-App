import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainNav from '@/components/navigation/MainNav';
import { Plus, Search, User, Phone, Mail, Calendar, MapPin, Users, ActivitySquare, History, FileText, AlertTriangle, TrendingUp, Heart, Scale, RefreshCw } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
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

interface AssessmentHistory {
  id: string;
  date: string;
  risk_score: number;
  risk_level: 'Low' | 'Moderate' | 'High';
  bmi: number;
  hba1c: number;
  blood_glucose: number;
  recommendations: string[];
}

const PatientsPage = () => {
  const { toast } = useToast();
  const { clinician } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingPatient, setAddingPatient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPatientDetailsOpen, setIsPatientDetailsOpen] = useState(false);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Debug dialog state
  useEffect(() => {
    console.log('Dialog state changed:', isAddDialogOpen);
  }, [isAddDialogOpen]);
  
  // Form state for adding new patient
  const [newPatient, setNewPatient] = useState({
    patient_id: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    contact_number: '',
    email: '',
    address: '',
    emergency_contact: ''
  });

  useEffect(() => {
    if (clinician) {
      loadPatients();
    }
  }, [clinician]);

  // Refresh patients when window regains focus
  useEffect(() => {
    const onFocus = () => clinician && loadPatients();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [clinician]);

  // Refresh patients when add dialog closes (after successful add)
  useEffect(() => {
    if (!isAddDialogOpen && clinician) {
      loadPatients();
    }
  }, [isAddDialogOpen, clinician]);

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
    } finally {
      setLoading(false);
    }
  };

  // Mock function for now - will be replaced with API calls
  const loadPatientsForClinician = async (clinicianData: any) => {
    // This function will be replaced with API calls
    console.log('Loading patients for clinician:', clinicianData);
  };

  const loadAssessmentHistory = async (patientId: string) => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('prediction_logs')
        .select('prediction_id, prediction_time, prediction, shap_values, feature_input, recommendations, probability, confidence_interval')
        .eq('patient_id', patientId)
        .order('prediction_time', { ascending: false });

      if (error) throw error;

      const transformed: AssessmentHistory[] = (data || []).map((row: any) => ({
        id: row.prediction_id,
        date: row.prediction_time,
        risk_score: Number(row.prediction ?? 0),
        risk_level: Number(row.prediction ?? 0) >= 0.6 ? 'High' : Number(row.prediction ?? 0) >= 0.4 ? 'Moderate' : 'Low',
        bmi: Number(row.feature_input?.bmi ?? 0),
        hba1c: Number(row.feature_input?.HbA1c_level ?? 0),
        blood_glucose: Number(row.feature_input?.blood_glucose_level ?? 0),
        recommendations: row.recommendations ? [row.recommendations] : []
      }));

      setAssessmentHistory(transformed);
    } catch (error) {
      console.error('Error loading assessment history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assessment history.',
        variant: 'destructive'
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePatientDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsPatientDetailsOpen(true);
    loadAssessmentHistory(patient.id);
  };

  const handleNewAssessment = (patient: Patient) => {
    // Navigate to assessment page with patient pre-selected
    // Store patient info in localStorage for assessment page
    localStorage.setItem('selectedPatientForAssessment', JSON.stringify(patient));
    window.location.href = '/assessment';
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Moderate':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Low':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const handleAddPatient = async () => {
    console.log('handleAddPatient called');
    console.log('New patient data:', newPatient);

    if (!clinician?.id) {
      toast({ title: 'Error', description: 'No clinician profile found.', variant: 'destructive' });
      return;
    }

    if (!newPatient.patient_id || !newPatient.first_name || !newPatient.last_name) {
      toast({ title: 'Missing fields', description: 'Patient ID, first name and last name are required.', variant: 'destructive' });
      return;
    }

    setAddingPatient(true);

    try {
      const payload: any = {
        clinician_id: clinician.id,
        patient_id: newPatient.patient_id.trim(),
        first_name: newPatient.first_name.trim(),
        last_name: newPatient.last_name.trim(),
        date_of_birth: newPatient.date_of_birth || null,
        gender: newPatient.gender || null,
        contact_number: newPatient.contact_number || null,
        email: newPatient.email || null,
        address: newPatient.address || null,
        emergency_contact: newPatient.emergency_contact || null,
        medical_history: null
      };

      const { data, error } = await supabase
        .from('patients')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        // Unique violation friendly message
        const isUnique = (error as any)?.message?.toLowerCase().includes('unique');
        toast({
          title: 'Add Patient Failed',
          description: isUnique
            ? 'A patient with this ID already exists for your account.'
            : (error as any).message || 'Unable to add patient. Please try again.',
          variant: 'destructive'
        });
        return;
      }

      toast({ title: 'Success', description: 'Patient added successfully.' });

      // Refresh list from DB so it persists on reload
      await loadPatients();

      // Close dialog and reset form
      setIsAddDialogOpen(false);
      setNewPatient({
        patient_id: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        contact_number: '',
        email: '',
        address: '',
        emergency_contact: ''
      });
    } catch (error: any) {
      console.error('Error adding patient:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add patient. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setAddingPatient(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Patient Management
              </h1>
              <p className="text-gray-400">Manage your patients and their diabetes care</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              console.log('Dialog state changing to:', open);
              setIsAddDialogOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-diabetesSense-accent hover:bg-diabetesSense-accent/90 text-white"
                  onClick={() => {
                    console.log('Add Patient button clicked');
                    setIsAddDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-secondary border-white/10" aria-describedby="add-patient-desc">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Patient</DialogTitle>
                  <p id="add-patient-desc" className="text-sm text-gray-300">Enter the patient details below to register them under your care.</p>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patient_id" className="text-white">Patient ID *</Label>
                      <Input
                        id="patient_id"
                        value={newPatient.patient_id}
                        onChange={(e) => setNewPatient({...newPatient, patient_id: e.target.value})}
                        className="bg-background border-white/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender" className="text-white">Gender</Label>
                      <Select value={newPatient.gender} onValueChange={(value) => setNewPatient({...newPatient, gender: value})}>
                        <SelectTrigger className="bg-background border-white/20">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name" className="text-white">First Name *</Label>
                      <Input
                        id="first_name"
                        value={newPatient.first_name}
                        onChange={(e) => setNewPatient({...newPatient, first_name: e.target.value})}
                        className="bg-background border-white/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name" className="text-white">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={newPatient.last_name}
                        onChange={(e) => setNewPatient({...newPatient, last_name: e.target.value})}
                        className="bg-background border-white/20"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth" className="text-white">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={newPatient.date_of_birth}
                      onChange={(e) => setNewPatient({...newPatient, date_of_birth: e.target.value})}
                      className="bg-background border-white/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_number" className="text-white">Contact Number</Label>
                      <Input
                        id="contact_number"
                        value={newPatient.contact_number}
                        onChange={(e) => setNewPatient({...newPatient, contact_number: e.target.value})}
                        className="bg-background border-white/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newPatient.email}
                        onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                        className="bg-background border-white/20"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address" className="text-white">Address</Label>
                    <Input
                      id="address"
                      value={newPatient.address}
                      onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                      className="bg-background border-white/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact" className="text-white">Emergency Contact</Label>
                    <Input
                      id="emergency_contact"
                      value={newPatient.emergency_contact}
                      onChange={(e) => setNewPatient({...newPatient, emergency_contact: e.target.value})}
                      className="bg-background border-white/20"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                       type="button"
                       onClick={() => {
                         console.log('Add Patient button in dialog clicked');
                         console.log('Form validation:', {
                           patient_id: newPatient.patient_id,
                           first_name: newPatient.first_name,
                           last_name: newPatient.last_name,
                           addingPatient
                         });
                         handleAddPatient();
                       }}
                       disabled={!newPatient.patient_id || !newPatient.first_name || !newPatient.last_name || addingPatient}
                       className="bg-diabetesSense-accent hover:bg-diabetesSense-accent/90"
                     >
                       {addingPatient ? "Adding Patient..." : "Add Patient"}
                     </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary border-white/10"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={loadPatients}
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="card-gradient border border-white/10 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-white">
                    {patient.first_name} {patient.last_name}
                  </span>
                  <span className="text-sm text-gray-400">ID: {patient.patient_id}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-300">
                  <User className="mr-2 h-4 w-4" />
                  <span>{patient.gender || 'Not specified'}</span>
                </div>
                {patient.date_of_birth && (
                  <div className="flex items-center text-sm text-gray-300">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{new Date(patient.date_of_birth).toLocaleDateString()}</span>
                  </div>
                )}
                {patient.contact_number && (
                  <div className="flex items-center text-sm text-gray-300">
                    <Phone className="mr-2 h-4 w-4" />
                    <span>{patient.contact_number}</span>
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center text-sm text-gray-300">
                    <Mail className="mr-2 h-4 w-4" />
                    <span>{patient.email}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-center text-sm text-gray-300">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span className="truncate">{patient.address}</span>
                  </div>
                )}
                <div className="pt-2 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full bg-diabetesSense-accent/10 text-diabetesSense-accent border-diabetesSense-accent/20 hover:bg-diabetesSense-accent/20"
                    onClick={() => handlePatientDetails(patient)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                    onClick={() => handleNewAssessment(patient)}
                  >
                    <ActivitySquare className="mr-2 h-4 w-4" />
                    New Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <Card className="card-gradient border border-white/10 animate-fade-in">
            <CardContent className="p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No patients found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm ? 'No patients match your search.' : 'Start by adding your first patient.'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-diabetesSense-accent hover:bg-diabetesSense-accent/90 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Patient
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Patient Details Dialog */}
        <Dialog open={isPatientDetailsOpen} onOpenChange={setIsPatientDetailsOpen}>
          <DialogContent className="bg-secondary border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                Patient Details: {selectedPatient?.first_name} {selectedPatient?.last_name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedPatient && (
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Patient Info</TabsTrigger>
                  <TabsTrigger value="history">Assessment History</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white">Personal Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <User className="mr-3 h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-400">Name</p>
                            <p className="text-white">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-3 h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-400">Date of Birth</p>
                            <p className="text-white">
                              {selectedPatient.date_of_birth ? new Date(selectedPatient.date_of_birth).toLocaleDateString() : 'Not specified'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <User className="mr-3 h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-400">Gender</p>
                            <p className="text-white">{selectedPatient.gender || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Phone className="mr-3 h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-400">Contact Number</p>
                            <p className="text-white">{selectedPatient.contact_number || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Mail className="mr-3 h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-400">Email</p>
                            <p className="text-white">{selectedPatient.email || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-3 h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-400">Address</p>
                            <p className="text-white">{selectedPatient.address || 'Not specified'}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <AlertTriangle className="mr-3 h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-400">Emergency Contact</p>
                            <p className="text-white">{selectedPatient.emergency_contact || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white">Medical Summary</h3>
                      <div className="space-y-3">
                        <div className="p-4 bg-background/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Patient ID</span>
                            <span className="text-white font-medium">{selectedPatient.patient_id}</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Registration Date</span>
                            <span className="text-white">
                              {new Date(selectedPatient.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Last Updated</span>
                            <span className="text-white">
                              {new Date(selectedPatient.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-background/50 rounded-lg">
                          <h4 className="text-sm font-medium text-white mb-2">Quick Actions</h4>
                          <div className="space-y-2">
                            <Button 
                              size="sm"
                              className="w-full bg-diabetesSense-accent/10 text-diabetesSense-accent border-diabetesSense-accent/20 hover:bg-diabetesSense-accent/20"
                              onClick={() => handleNewAssessment(selectedPatient)}
                            >
                              <ActivitySquare className="mr-2 h-4 w-4" />
                              New Assessment
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={() => navigate(`/patient-history/${selectedPatient.id}`)}
                            >
                              <History className="mr-2 h-4 w-4" />
                              View Full History
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-white">Assessment History</h3>
                      <Button 
                        size="sm"
                        className="bg-diabetesSense-accent/10 text-diabetesSense-accent border-diabetesSense-accent/20 hover:bg-diabetesSense-accent/20"
                        onClick={() => handleNewAssessment(selectedPatient)}
                      >
                        <ActivitySquare className="mr-2 h-4 w-4" />
                        New Assessment
                      </Button>
                    </div>
                    
                    {loadingHistory ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-diabetesSense-accent mx-auto"></div>
                        <p className="text-gray-400 mt-2">Loading assessment history...</p>
                      </div>
                    ) : assessmentHistory.length > 0 ? (
                      <div className="space-y-4">
                        {assessmentHistory.map((assessment) => (
                          <Card key={assessment.id} className="bg-background/50 border-white/10">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-400">
                                    {new Date(assessment.date).toLocaleDateString()}
                                  </p>
                                  <div className="flex items-center mt-1">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(assessment.risk_level)}`}>
                                      {assessment.risk_level} Risk
                                    </span>
                                    <span className="ml-2 text-sm text-gray-400">
                                      Score: {(assessment.risk_score * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                                <TrendingUp className="h-5 w-5 text-diabetesSense-accent" />
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center">
                                  <Scale className="mr-2 h-4 w-4 text-gray-400" />
                                  <div>
                                    <p className="text-xs text-gray-400">BMI</p>
                                    <p className="text-white font-medium">{assessment.bmi}</p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <Heart className="mr-2 h-4 w-4 text-gray-400" />
                                  <div>
                                    <p className="text-xs text-gray-400">HbA1c (%)</p>
                                    <p className="text-white font-medium">{assessment.hba1c}</p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <ActivitySquare className="mr-2 h-4 w-4 text-gray-400" />
                                  <div>
                                    <p className="text-xs text-gray-400">Blood Glucose</p>
                                    <p className="text-white font-medium">{assessment.blood_glucose} mg/dL</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-white mb-2">Recommendations</h4>
                                <ul className="space-y-1">
                                  {assessment.recommendations.map((rec, index) => (
                                    <li key={index} className="text-sm text-gray-300 flex items-start">
                                      <span className="text-diabetesSense-accent mr-2">•</span>
                                      {rec}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No Assessment History</h3>
                        <p className="text-gray-400 mb-4">
                          This patient hasn't had any assessments yet.
                        </p>
                        <Button 
                          className="bg-diabetesSense-accent hover:bg-diabetesSense-accent/90 text-white"
                          onClick={() => handleNewAssessment(selectedPatient)}
                        >
                          <ActivitySquare className="mr-2 h-4 w-4" />
                          Conduct First Assessment
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="actions" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Available Actions</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-background/50 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center mb-3">
                            <ActivitySquare className="mr-3 h-5 w-5 text-diabetesSense-accent" />
                            <h4 className="font-medium text-white">Risk Assessment</h4>
                          </div>
                          <p className="text-sm text-gray-300 mb-3">
                            Conduct a comprehensive diabetes risk assessment for this patient.
                          </p>
                          <Button 
                            className="w-full bg-diabetesSense-accent/10 text-diabetesSense-accent border-diabetesSense-accent/20 hover:bg-diabetesSense-accent/20"
                            onClick={() => handleNewAssessment(selectedPatient)}
                          >
                            Start Assessment
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-background/50 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center mb-3">
                            <History className="mr-3 h-5 w-5 text-green-500" />
                            <h4 className="font-medium text-white">View History</h4>
                          </div>
                          <p className="text-sm text-gray-300 mb-3">
                            View complete assessment and treatment history.
                          </p>
                          <Button 
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate(`/patient-history/${selectedPatient.id}`)}
                          >
                            View History
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-background/50 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center mb-3">
                            <FileText className="mr-3 h-5 w-5 text-blue-500" />
                            <h4 className="font-medium text-white">Generate Report</h4>
                          </div>
                          <p className="text-sm text-gray-300 mb-3">
                            Generate a comprehensive patient report.
                          </p>
                          <Button 
                            variant="outline"
                            className="w-full"
                          >
                            Generate Report
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-background/50 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center mb-3">
                            <Mail className="mr-3 h-5 w-5 text-purple-500" />
                            <h4 className="font-medium text-white">Send Reminder</h4>
                          </div>
                          <p className="text-sm text-gray-300 mb-3">
                            Send appointment or follow-up reminders.
                          </p>
                          <Button 
                            variant="outline"
                            className="w-full"
                          >
                            Send Reminder
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PatientsPage;
