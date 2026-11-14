-- ==============================================================================
-- SREE SAKTHI ENGINEERING COLLEGE - CENTRAL SMART LIBRARY
-- Supabase Row Level Security (RLS) & Table Schema for public."Students"
-- ==============================================================================
-- Endpoint: https://yvogbzoolyosvilgtyxi.supabase.co/rest/v1/Students
-- Target Table: public."Students"
-- ==============================================================================
-- Execute this script in your Supabase Dashboard -> SQL Editor -> New Query.
-- It resolves error 42501 ("new row violates row-level security policy for table Students")
-- and allows student records to be stored directly via the REST API.
-- ==============================================================================

-- 1. Grant schema, table, and sequence permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public."Students" TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 2. Add supplementary columns if not already present (safe & idempotent)
ALTER TABLE public."Students" ADD COLUMN IF NOT EXISTS auth_id text;
ALTER TABLE public."Students" ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public."Students" ADD COLUMN IF NOT EXISTS year text;
ALTER TABLE public."Students" ADD COLUMN IF NOT EXISTS college text;
ALTER TABLE public."Students" ADD COLUMN IF NOT EXISTS section text;
ALTER TABLE public."Students" ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- 3. Ensure sequence ownership on id column for auto-increment
DO $$
BEGIN
  ALTER SEQUENCE IF EXISTS public."Students_id_seq" OWNED BY public."Students".id;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public."Students" ENABLE ROW LEVEL SECURITY;

-- 5. Drop any prior conflicting policies on public."Students"
DROP POLICY IF EXISTS "Allow select for all" ON public."Students";
DROP POLICY IF EXISTS "Allow insert for all" ON public."Students";
DROP POLICY IF EXISTS "Allow update for all" ON public."Students";
DROP POLICY IF EXISTS "Allow delete for all" ON public."Students";
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public."Students";

-- 6. Create permissive RLS policies for student data storage & retrieval
-- Policy: Allow reading student profiles (Admin dashboard & Student login)
CREATE POLICY "Allow select for all"
  ON public."Students"
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Allow inserting new student accounts via REST API
CREATE POLICY "Allow insert for all"
  ON public."Students"
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Allow updating student profile data
CREATE POLICY "Allow update for all"
  ON public."Students"
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow deleting student records
CREATE POLICY "Allow delete for all"
  ON public."Students"
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- 7. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

