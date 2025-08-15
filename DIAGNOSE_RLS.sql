-- Diagnostic Script to Check RLS Status and Policies
-- Run this to see what's happening with your RLS setup

-- 1. Check if RLS is actually enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN 'RLS ON'
        ELSE 'RLS OFF'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('clinicians', 'patients', 'prediction_logs', 'profiles')
ORDER BY tablename;

-- 2. Check what policies actually exist
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

-- 3. Check if the clinicians table has the right structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'clinicians'
ORDER BY ordinal_position;

-- 4. Check current user and role
SELECT 
    current_user,
    current_setting('role'),
    session_user;

-- 5. Check if authenticated role exists
SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin
FROM pg_roles 
WHERE rolname = 'authenticated';

-- 6. Check grants on clinicians table
SELECT 
    grantee, 
    table_name, 
    privilege_type, 
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name = 'clinicians'
ORDER BY grantee, privilege_type;
