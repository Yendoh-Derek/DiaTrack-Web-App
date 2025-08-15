-- DiaTrack Database Setup Script
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Create prediction_logs table
CREATE TABLE IF NOT EXISTS public.prediction_logs (
    prediction_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    prediction_time timestamp with time zone DEFAULT now(),
    prediction numeric,
    probability numeric,
    feature_input jsonb,
    recommendations text,
    shap_values jsonb,
    confidence_interval jsonb,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id uuid
);

-- Create profiles table for user data linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name text,
    email text,
    role text DEFAULT 'patient' CHECK (role IN ('patient', 'clinician', 'admin')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create clinicians table
CREATE TABLE IF NOT EXISTS public.clinicians (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_clinicians_user_id ON public.clinicians(user_id);
CREATE INDEX IF NOT EXISTS idx_clinicians_work_id ON public.clinicians(work_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinician_id ON public.patients(clinician_id);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON public.patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_prediction_logs_patient_id ON public.prediction_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_prediction_logs_user_id ON public.prediction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.prediction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE FUNCTIONS
-- =====================================================

-- Update updated_at column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Handle new user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name, email)
    VALUES (
        new.id, 
        new.raw_user_meta_data ->> 'display_name',
        new.email
    );
    RETURN new;
END;
$$;

-- Get current user role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text AS $$
    SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- =====================================================
-- 5. CREATE RLS POLICIES
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Clinicians policies
CREATE POLICY "Clinicians can view their own profile" ON public.clinicians
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Clinicians can update their own profile" ON public.clinicians
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Clinicians can insert their own profile" ON public.clinicians
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Patients policies
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

-- Prediction logs policies
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

CREATE POLICY "Users can insert their own predictions" ON public.prediction_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 6. CREATE TRIGGERS
-- =====================================================

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinicians_updated_at
    BEFORE UPDATE ON public.clinicians
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 7. INSERT SAMPLE DATA (OPTIONAL)
-- =====================================================

-- You can add sample data here if needed for testing
-- INSERT INTO public.clinicians (user_id, work_id, display_name, email, specialization, license_number)
-- VALUES ('sample-user-id', 'CLIN001', 'Dr. John Smith', 'john.smith@example.com', 'Endocrinology', 'LIC123456');
