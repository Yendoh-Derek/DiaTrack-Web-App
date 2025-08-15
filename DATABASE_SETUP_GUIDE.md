# Database Setup Guide for DiaTrack

## Issue Identified
The application is currently using mock data instead of real database data because the required database tables haven't been created in your Supabase project yet.

## Step-by-Step Solution

### 1. Access Your Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your DiaTrack project (the one with URL: `https://wvnqsoofydgppqmwbivp.supabase.co`)

### 2. Create Database Tables
1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy and paste the following SQL code:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT,
    hashed_password TEXT,
    username TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    display_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'clinician',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clinicians table
CREATE TABLE IF NOT EXISTS public.clinicians (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    work_id TEXT UNIQUE NOT NULL,
    display_name TEXT,
    email TEXT,
    specialization TEXT,
    license_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinician_id UUID REFERENCES public.clinicians(id) ON DELETE CASCADE,
    patient_id TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    date_of_birth DATE,
    gender TEXT,
    contact_number TEXT,
    email TEXT,
    address TEXT,
    emergency_contact TEXT,
    medical_history JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prediction_logs table
CREATE TABLE IF NOT EXISTS public.prediction_logs (
    prediction_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    feature_input JSONB NOT NULL,
    prediction NUMERIC,
    probability NUMERIC,
    confidence_interval JSONB,
    shap_values JSONB NOT NULL,
    recommendations TEXT,
    prediction_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alembic_version table (for migrations)
CREATE TABLE IF NOT EXISTS public.alembic_version (
    version_num VARCHAR(32) PRIMARY KEY
);

-- Insert initial alembic version
INSERT INTO public.alembic_version (version_num) VALUES ('20250808002738') 
ON CONFLICT (version_num) DO NOTHING;

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for clinicians table
CREATE POLICY "Clinicians can view their own profile" ON public.clinicians
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Clinicians can update their own profile" ON public.clinicians
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Clinicians can insert their own profile" ON public.clinicians
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Create policies for patients table
CREATE POLICY "Clinicians can view their patients" ON public.patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.clinicians 
            WHERE clinicians.id = patients.clinician_id 
            AND clinicians.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Clinicians can insert patients" ON public.patients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clinicians 
            WHERE clinicians.id = patients.clinician_id 
            AND clinicians.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Clinicians can update their patients" ON public.patients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.clinicians 
            WHERE clinicians.id = patients.clinician_id 
            AND clinicians.user_id::text = auth.uid()::text
        )
    );

-- Create policies for prediction_logs table
CREATE POLICY "Users can view their own predictions" ON public.prediction_logs
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert predictions" ON public.prediction_logs
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clinicians_user_id ON public.clinicians(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinician_id ON public.patients(clinician_id);
CREATE INDEX IF NOT EXISTS idx_prediction_logs_user_id ON public.prediction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_prediction_logs_patient_id ON public.prediction_logs(patient_id);
```

4. Click **Run** to execute the SQL

### 3. Verify Tables Created
1. Go to **Table Editor** in the left sidebar
2. You should see these tables:
   - `users`
   - `profiles` 
   - `clinicians`
   - `patients`
   - `prediction_logs`
   - `alembic_version`

### 4. Test the Application
1. Refresh your DiaTrack application
2. The database status indicator should now show green for all tables
3. You should no longer see mock data
4. The welcome message should show your actual name instead of "Dr. Smith"

## Troubleshooting

### If tables still show as missing:
1. Check the browser console for error messages
2. Verify your Supabase URL and API key in `src/integrations/supabase/client.ts`
3. Make sure you're signed in to the correct Supabase project

### If you get permission errors:
1. Go to **Authentication > Policies** in Supabase
2. Verify that RLS policies are properly set up
3. Check that your user has the correct role

### If authentication works but data doesn't load:
1. Check the browser console for specific error messages
2. Verify that the clinician record was created during signup
3. Check that the user_id in the clinicians table matches your auth user ID

## Next Steps
Once the database is working:
1. The application will automatically fetch real data instead of mock data
2. You can add real patients through the Patients page
3. All assessments will be stored in the database
4. The chatbot and other features will work with real patient data

## Support
If you continue to have issues:
1. Check the browser console for error messages
2. Verify your Supabase project settings
3. Ensure your environment variables are correctly set
