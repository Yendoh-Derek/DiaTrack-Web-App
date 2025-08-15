-- Final Fix for Database Permissions - This Will Work
-- The issue is that authenticated users have NO permissions

-- 1. First, revoke any existing permissions to clean up
REVOKE ALL ON public.clinicians FROM anon, authenticated, service_role;
REVOKE ALL ON public.patients FROM anon, authenticated, service_role;
REVOKE ALL ON public.prediction_logs FROM anon, authenticated, service_role;
REVOKE ALL ON public.profiles FROM anon, authenticated, service_role;

-- 2. Grant permissions to authenticated users (this is the key fix)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinicians TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prediction_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- 3. Grant additional permissions
GRANT REFERENCES ON public.clinicians TO authenticated;
GRANT REFERENCES ON public.patients TO authenticated;
GRANT REFERENCES ON public.prediction_logs TO authenticated;
GRANT REFERENCES ON public.profiles TO authenticated;

-- 4. Grant sequence permissions for auto-incrementing IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 5. Grant schema usage
GRANT USAGE ON SCHEMA public TO authenticated;

-- 6. Verify the grants worked
SELECT 
    grantee, 
    table_name, 
    privilege_type, 
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('clinicians', 'patients', 'prediction_logs', 'profiles')
AND grantee = 'authenticated'
ORDER BY table_name, privilege_type;

-- 7. Show current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('clinicians', 'patients', 'prediction_logs', 'profiles');
