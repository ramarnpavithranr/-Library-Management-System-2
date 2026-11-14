-- ==============================================================================
-- SREE SAKTHI ENGINEERING COLLEGE - CENTRAL SMART LIBRARY
-- Supabase Row Level Security (RLS) & Table Schema for public.membership
-- ==============================================================================
-- Execute this script in your Supabase Dashboard -> SQL Editor -> New Query.
-- URL: https://yvogbzoolyosvilgtyxi.supabase.co
-- Table: public.membership
-- ==============================================================================

-- 1. Grant schema, table, and sequence access to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.membership TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 2. Add columns if not already present to store complete Digital Card pass details
ALTER TABLE public.membership ADD COLUMN IF NOT EXISTS student_id text;
ALTER TABLE public.membership ADD COLUMN IF NOT EXISTS membership_id text;
ALTER TABLE public.membership ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE public.membership ADD COLUMN IF NOT EXISTS expiry_date text;
ALTER TABLE public.membership ADD COLUMN IF NOT EXISTS photo text;
ALTER TABLE public.membership ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.membership ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.membership ADD COLUMN IF NOT EXISTS year text;

-- 3. Convert "Roll Number" column to text if it is currently bigint (to support alphanumeric roll numbers e.g. 24CS050)
DO $$
BEGIN
  ALTER TABLE public.membership ALTER COLUMN "Roll Number" TYPE text USING "Roll Number"::text;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.membership ENABLE ROW LEVEL SECURITY;

-- 5. Drop any prior conflicting policies on public.membership
DROP POLICY IF EXISTS "Allow select for all" ON public.membership;
DROP POLICY IF EXISTS "Allow insert for all" ON public.membership;
DROP POLICY IF EXISTS "Allow update for all" ON public.membership;
DROP POLICY IF EXISTS "Allow delete for all" ON public.membership;

-- 6. Create permissive RLS policies for instant cross-device student & admin sync
-- Policy: Allow reading membership cards (for Student view & Admin approvals)
CREATE POLICY "Allow select for all"
  ON public.membership
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Allow students to submit membership applications
CREATE POLICY "Allow insert for all"
  ON public.membership
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Allow Admin to approve or reject membership applications
CREATE POLICY "Allow update for all"
  ON public.membership
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow deleting or resetting membership records
CREATE POLICY "Allow delete for all"
  ON public.membership
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- 7. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

