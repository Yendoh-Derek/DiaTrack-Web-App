-- Phase 1: Database Security - Clean up data and enable RLS

-- First, enable RLS on tables without foreign key constraints
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alembic_version ENABLE ROW LEVEL SECURITY;

-- Create profiles table for user data linked to Supabase Auth
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  email text,
  role text DEFAULT 'patient' CHECK (role IN ('patient', 'clinician', 'admin')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clean up orphaned records in prediction_logs (remove records with invalid user_ids)
DELETE FROM public.prediction_logs 
WHERE user_id IS NOT NULL 
AND user_id NOT IN (SELECT id FROM auth.users);

-- Now enable RLS on prediction_logs
ALTER TABLE public.prediction_logs ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint to prediction_logs after cleanup
ALTER TABLE public.prediction_logs 
ADD CONSTRAINT prediction_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create RLS policies for profiles
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

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create RLS policies for prediction_logs (medical data protection)
CREATE POLICY "Users can view their own medical data" 
ON public.prediction_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medical data" 
ON public.prediction_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clinicians can view patient data" 
ON public.prediction_logs 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  public.get_current_user_role() IN ('clinician', 'admin')
);

-- Admin policies for profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Restrict access to old users table (deprecated)
CREATE POLICY "Restrict access to old users table" 
ON public.users 
FOR ALL 
USING (false);

-- Restrict alembic_version access to authenticated users only
CREATE POLICY "Only authenticated users can access alembic_version" 
ON public.alembic_version 
FOR SELECT 
TO authenticated 
USING (true);

-- Create trigger for automatic profile creation
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

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update function for profiles updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();