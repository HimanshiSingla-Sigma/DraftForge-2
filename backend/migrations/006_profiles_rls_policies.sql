-- Migration: 006_profiles_rls_policies.sql
-- Purpose: Formalize Row Level Security (RLS) on public.profiles ensuring read, update, and service role bypass

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Authenticated users can view all profiles (needed for teacher rosters, evaluations, and invitations)
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- 2. Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- 3. Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 5. Service role has unrestricted access across all operations
DROP POLICY IF EXISTS "Service role unrestricted profiles access" ON public.profiles;
CREATE POLICY "Service role unrestricted profiles access"
ON public.profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
