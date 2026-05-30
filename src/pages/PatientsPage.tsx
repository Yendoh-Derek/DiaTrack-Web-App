
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from '@/components/layout/AppLayout';
import RiskBadge from '@/components/risk/RiskBadge';
import EmptyState from '@/components/ui/EmptyState';
import { Plus, Search } from "lucide-react";
import { getPatients, addPatient, getPredictionsForPatient } from '@/stores/demoStore';
import type { Patient } from '@/types/patient';

const PatientsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'mrn' | 'risk'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    patient_id: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    contact_number: '',
    email: '',
  });

  const loadPatients = () => setPatients(getPatients());

  useEffect(() => { loadPatients(); }, []);

  const getLatestRisk = (patientId: string) => {
    const preds = getPredictionsForPatient(patientId);
    return preds[0] ?? null;
  };

  const filtered = patients
    .filter(p =>
      `${p.first_name} ${p.last_name} ${p.patient_id}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') {
        cmp = `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`);
      } else if (sortField === 'mrn') {
        cmp = a.patient_id.localeCompare(b.patient_id);
      } else {
        const ra = getLatestRisk(a.id)?.probability ?? -1;
        const rb = getLatestRisk(b.id)?.probability ?? -1;
        cmp = ra - rb;
      }
      return sortAsc ? cmp : -cmp;
    });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const handleAddPatient = () => {
    if (!newPatient.patient_id || !newPatient.first_name || !newPatient.last_name) {
      toast({ title: "Missing fields", description: "Patient ID, first name, and last name are required.", variant: "destructive" });
      return;
    }
    addPatient(newPatient);
    loadPatients();
    setIsAddDialogOpen(false);
    setNewPatient({ patient_id: '', first_name: '', last_name: '', date_of_birth: '', gender: '', contact_number: '', email: '' });
    toast({ title: "Patient added", description: `${newPatient.first_name} ${newPatient.last_name} registered.` });
  };

  return (
    <AppLayout>
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-semibold" style={{ fontSize: 'var(--text-display)' }}>Patients</h1>
          <p style={{ fontSize: 'var(--text-body-md)', color: 'var(--color-text-secondary)' }}>
            {patients.length} patients in demo store
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Patient</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Register New Patient</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="form-field">
                <Label>Patient ID *</Label>
                <Input value={newPatient.patient_id} onChange={e => setNewPatient(p => ({ ...p, patient_id: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-field">
                  <Label>First Name *</Label>
                  <Input value={newPatient.first_name} onChange={e => setNewPatient(p => ({ ...p, first_name: e.target.value }))} />
                </div>
                <div className="form-field">
                  <Label>Last Name *</Label>
                  <Input value={newPatient.last_name} onChange={e => setNewPatient(p => ({ ...p, last_name: e.target.value }))} />
                </div>
              </div>
              <div className="form-field">
                <Label>Gender</Label>
                <Select value={newPatient.gender} onValueChange={v => setNewPatient(p => ({ ...p, gender: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="form-field">
                <Label>Date of Birth</Label>
                <Input type="date" value={newPatient.date_of_birth} onChange={e => setNewPatient(p => ({ ...p, date_of_birth: e.target.value }))} />
              </div>
              <Button onClick={handleAddPatient} className="w-full">Save Patient</Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="relative mb-6 max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
          style={{ color: 'var(--color-text-tertiary)' }}
          aria-hidden="true"
        />
        <Input
          placeholder="Search patients..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-9"
          aria-label="Search patients"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={searchTerm ? 'No matching patients' : 'No patients registered'}
          description={searchTerm ? 'Try adjusting your search terms.' : 'Add a patient to begin risk assessments.'}
          action={!searchTerm ? { label: 'Add Patient', onClick: () => setIsAddDialogOpen(true) } : undefined}
        />
      ) : (
        <div className="clinical-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="cursor-pointer">
                  Patient {sortField === 'name' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('mrn')} className="cursor-pointer">
                  MRN {sortField === 'mrn' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
                <th>DOB</th>
                <th onClick={() => handleSort('risk')} className="numeric cursor-pointer">
                  Risk Score {sortField === 'risk' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(patient => {
                const latest = getLatestRisk(patient.id);
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
                    <td style={{ color: 'var(--color-text-secondary)' }}>
                      {patient.date_of_birth ?? '—'}
                    </td>
                    <td className="numeric tabular-nums font-semibold">
                      {latest ? `${(latest.probability * 100).toFixed(0)}%` : '—'}
                    </td>
                    <td>
                      {latest ? <RiskBadge level={latest.risk_level} /> : (
                        <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-tertiary)' }}>
                          Not assessed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
};

export default PatientsPage;
