-- Create clinicians table
CREATE TABLE IF NOT EXISTS public.clinicians (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    work_id text NOT NULL UNIQUE,
    display_name text,
    email text,
    specialization text,
    license_number text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    clinician_id uuid NOT NULL REFERENCES public.clinicians(id) ON DELETE CASCADE,
    patient_id text NOT NULL,
    first_name text,
    last_name text,
    date_of_birth date,
    gender text,
    contact_number text,
    email text,
    address text,
    emergency_contact text,
    medical_history jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(clinician_id, patient_id)
);

-- Add patient_id column to prediction_logs table
ALTER TABLE public.prediction_logs 
ADD COLUMN IF NOT EXISTS patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clinicians_user_id ON public.clinicians(user_id);
CREATE INDEX IF NOT EXISTS idx_clinicians_work_id ON public.clinicians(work_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinician_id ON public.patients(clinician_id);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_prediction_logs_patient_id ON public.prediction_logs(patient_id);

-- Enable Row Level Security
ALTER TABLE public.clinicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clinicians
CREATE POLICY "Clinicians can view their own profile" ON public.clinicians
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Clinicians can update their own profile" ON public.clinicians
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Clinicians can insert their own profile" ON public.clinicians
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for patients
CREATE POLICY "Clinicians can view their patients" ON public.patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.clinicians 
            WHERE clinicians.id = patients.clinician_id 
            AND clinicians.user_id = auth.uid()
        )
    );

CREATE POLICY "Clinicians can insert patients" ON public.patients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clinicians 
            WHERE clinicians.id = patients.clinician_id 
            AND clinicians.user_id = auth.uid()
        )
    );

CREATE POLICY "Clinicians can update their patients" ON public.patients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.clinicians 
            WHERE clinicians.id = patients.clinician_id 
            AND clinicians.user_id = auth.uid()
        )
    );

CREATE POLICY "Clinicians can delete their patients" ON public.patients
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.clinicians 
            WHERE clinicians.id = patients.clinician_id 
            AND clinicians.user_id = auth.uid()
        )
    );

-- Update prediction_logs RLS policy to include patient_id
DROP POLICY IF EXISTS "Users can view their own predictions" ON public.prediction_logs;
CREATE POLICY "Users can view their own predictions" ON public.prediction_logs
    FOR SELECT USING (
        user_id = auth.uid() OR
        patient_id IN (
            SELECT id FROM public.patients 
            WHERE clinician_id IN (
                SELECT id FROM public.clinicians 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Create updated_at trigger for clinicians
CREATE TRIGGER update_clinicians_updated_at
    BEFORE UPDATE ON public.clinicians
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for patients
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
