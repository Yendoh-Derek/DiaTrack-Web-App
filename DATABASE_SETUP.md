# Database Setup Guide for DiaTrack

## Quick Fix for Database Issues

If you're experiencing issues with the "Add Patient" functionality, it's likely due to missing database tables or incorrect RLS policies. Follow these steps to fix it:

## Option 1: Apply Migration via Supabase CLI

### Prerequisites
1. Install Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`

### Steps
1. **Link your project** (if not already linked):
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

2. **Apply the migration**:
   ```bash
   supabase db push
   ```

## Option 2: Manual SQL Execution

If you don't have Supabase CLI, you can run the SQL manually:

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run the following SQL commands**:

```sql
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
```

## Option 3: Test Database Connection

Run this SQL to test if tables exist:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('clinicians', 'patients');

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('clinicians', 'patients');
```

## Troubleshooting

### Common Error Codes:
- **42P01**: Table doesn't exist → Run migration
- **42501**: Permission denied → Check RLS policies
- **23505**: Duplicate key → Patient ID already exists
- **23503**: Foreign key violation → Clinician doesn't exist

### Debug Steps:
1. **Check browser console** for error messages
2. **Verify tables exist** in Supabase Dashboard
3. **Check RLS policies** are properly configured
4. **Ensure clinician profile** exists for the logged-in user

## After Setup

1. **Refresh your application**
2. **Try adding a patient** again
3. **Check browser console** for any remaining errors
4. **Verify the patient** appears in the list

If you still have issues, check the browser console for specific error messages and refer to the troubleshooting section above.
