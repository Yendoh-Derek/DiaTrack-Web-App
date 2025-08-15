-- Fix Database Permissions and RLS Policies for DiaTrack
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS on all tables
ALTER TABLE public.clinicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for clinicians table
-- Allow users to insert their own clinician profile
CREATE POLICY "Users can insert their own clinician profile" ON public.clinicians
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own clinician profile
CREATE POLICY "Users can view their own clinician profile" ON public.clinicians
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own clinician profile
CREATE POLICY "Users can update their own clinician profile" ON public.clinicians
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own clinician profile
CREATE POLICY "Users can delete their own clinician profile" ON public.clinicians
    FOR DELETE USING (auth.uid() = user_id);

-- 3. Create RLS policies for patients table
-- Allow clinicians to insert patients for themselves
CREATE POLICY "Clinicians can insert patients" ON public.patients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clinicians 
            WHERE clinicians.id = patients.clinician_id 
            AND clinicians.user_id = auth.uid()
        )
    );

-- Allow clinicians to view their own patients
CREATE POLICY "Clinicians can view their own patients" ON public.patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.clinicians 
            WHERE clinicians.id = patients.clinician_id 
            AND clinicians.user_id = auth.uid()
        )
    );

-- Allow clinicians to update their own patients
CREATE POLICY "Clinicians can update their own patients" ON public.patients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.clinicians 
            WHERE clinicians.id = patients.clinician_id 
            AND clinicians.user_id = auth.uid()
        )
    );

-- Allow clinicians to delete their own patients
CREATE POLICY "Clinicians can delete their own patients" ON public.patients
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.clinicians 
            WHERE clinicians.id = patients.clinician_id 
            AND clinicians.user_id = auth.uid()
        )
    );

-- 4. Create RLS policies for prediction_logs table
-- Allow clinicians to insert prediction logs for their patients
CREATE POLICY "Clinicians can insert prediction logs" ON public.prediction_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.patients 
            JOIN public.clinicians ON patients.clinician_id = clinicians.id
            WHERE patients.id = prediction_logs.patient_id 
            AND clinicians.user_id = auth.uid()
        )
    );

-- Allow clinicians to view prediction logs for their patients
CREATE POLICY "Clinicians can view prediction logs" ON public.prediction_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.patients 
            JOIN public.clinicians ON patients.clinician_id = clinicians.id
            WHERE patients.id = prediction_logs.patient_id 
            AND clinicians.user_id = auth.uid()
        )
    );

-- Allow clinicians to update prediction logs for their patients
CREATE POLICY "Clinicians can update prediction logs" ON public.prediction_logs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.patients 
            JOIN public.clinicians ON patients.clinician_id = clinicians.id
            WHERE patients.id = prediction_logs.patient_id 
            AND clinicians.user_id = auth.uid()
        )
    );

-- Allow clinicians to delete prediction logs for their patients
CREATE POLICY "Clinicians can delete prediction logs" ON public.prediction_logs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.patients 
            JOIN public.clinicians ON patients.clinician_id = clinicians.id
            WHERE patients.id = prediction_logs.patient_id 
            AND clinicians.user_id = auth.uid()
        )
    );

-- 5. Create RLS policies for profiles table
-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- 6. Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.clinicians TO authenticated;
GRANT ALL ON public.patients TO authenticated;
GRANT ALL ON public.prediction_logs TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- 7. Grant sequence permissions for auto-incrementing IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 8. Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('clinicians', 'patients', 'prediction_logs', 'profiles')
ORDER BY tablename, policyname;
