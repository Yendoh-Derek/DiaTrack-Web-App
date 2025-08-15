-- Safe Fix for Database Permissions and RLS Policies for DiaTrack
-- Run this in your Supabase SQL Editor - it will handle existing policies safely

-- 1. Enable RLS on all tables (safe - won't error if already enabled)
ALTER TABLE public.clinicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts (if they exist)
DROP POLICY IF EXISTS "Users can insert their own clinician profile" ON public.clinicians;
DROP POLICY IF EXISTS "Users can view their own clinician profile" ON public.clinicians;
DROP POLICY IF EXISTS "Users can update their own clinician profile" ON public.clinicians;
DROP POLICY IF EXISTS "Users can delete their own clinician profile" ON public.clinicians;

DROP POLICY IF EXISTS "Clinicians can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Clinicians can view their own patients" ON public.patients;
DROP POLICY IF EXISTS "Clinicians can update their own patients" ON public.patients;
DROP POLICY IF EXISTS "Clinicians can delete their own patients" ON public.patients;

DROP POLICY IF EXISTS "Clinicians can insert prediction logs" ON public.prediction_logs;
DROP POLICY IF EXISTS "Clinicians can view prediction logs" ON public.prediction_logs;
DROP POLICY IF EXISTS "Clinicians can update prediction logs" ON public.prediction_logs;
DROP POLICY IF EXISTS "Clinicians can delete prediction logs" ON public.prediction_logs;

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- 3. Create RLS policies for clinicians table
CREATE POLICY "Users can insert their own clinician profile" ON public.clinicians
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own clinician profile" ON public.clinicians
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own clinician profile" ON public.clinicians
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clinician profile" ON public.clinicians
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Create RLS policies for patients table
CREATE POLICY "Clinicians can insert patients" ON public.patients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clinicians 
            WHERE clinicians.id = patients.clinician_id 
            AND clinicians.user_id = auth.uid()
        )
    );

CREATE POLICY "Clinicians can view their own patients" ON public.patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.clinicians 
            WHERE clinicians.id = patients.clinician_id 
            AND clinicians.user_id = auth.uid()
        )
    );

CREATE POLICY "Clinicians can update their own patients" ON public.patients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.clinicians 
            WHERE clinicians.id = patients.clinician_id 
            AND clinicians.user_id = auth.uid()
        )
    );

CREATE POLICY "Clinicians can delete their own patients" ON public.patients
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.clinicians 
            WHERE clinicians.id = patients.clinician_id 
            AND clinicians.user_id = auth.uid()
        )
    );

-- 5. Create RLS policies for prediction_logs table
CREATE POLICY "Clinicians can insert prediction logs" ON public.prediction_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.patients 
            JOIN public.clinicians ON patients.clinician_id = clinicians.id
            WHERE patients.id = prediction_logs.patient_id 
            AND clinicians.user_id = auth.uid()
        )
    );

CREATE POLICY "Clinicians can view prediction logs" ON public.prediction_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.patients 
            JOIN public.clinicians ON patients.clinician_id = clinicians.id
            WHERE patients.id = prediction_logs.patient_id 
            AND clinicians.user_id = auth.uid()
        )
    );

CREATE POLICY "Clinicians can update prediction logs" ON public.prediction_logs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.patients 
            JOIN public.clinicians ON patients.clinician_id = clinicians.id
            WHERE patients.id = prediction_logs.patient_id 
            AND clinicians.user_id = auth.uid()
        )
    );

CREATE POLICY "Clinicians can delete prediction logs" ON public.prediction_logs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.patients 
            JOIN public.clinicians ON patients.clinician_id = clinicians.id
            WHERE patients.id = prediction_logs.patient_id 
            AND clinicians.user_id = auth.uid()
        )
    );

-- 6. Create RLS policies for profiles table
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = user_id);

-- 7. Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.clinicians TO authenticated;
GRANT ALL ON public.patients TO authenticated;
GRANT ALL ON public.prediction_logs TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- 8. Grant sequence permissions for auto-incrementing IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 9. Verify the policies were created successfully
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('clinicians', 'patients', 'prediction_logs', 'profiles')
ORDER BY tablename, policyname;

-- 10. Show current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('clinicians', 'patients', 'prediction_logs', 'profiles');
