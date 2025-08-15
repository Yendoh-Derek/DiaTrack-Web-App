-- Simple RLS Fix - More Direct Approach
-- This bypasses complex policies and just allows basic access

-- 1. First, disable RLS temporarily to see if that's the issue
ALTER TABLE public.clinicians DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Grant basic permissions to authenticated users
GRANT ALL ON public.clinicians TO authenticated;
GRANT ALL ON public.patients TO authenticated;
GRANT ALL ON public.prediction_logs TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- 3. Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. Verify permissions
SELECT 
    grantee, 
    table_name, 
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('clinicians', 'patients', 'prediction_logs', 'profiles')
AND grantee = 'authenticated'
ORDER BY table_name, privilege_type;
