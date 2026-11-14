-- ==============================================================================
-- SREE SAKTHI ENGINEERING COLLEGE - CENTRAL SMART LIBRARY
-- Supabase Row Level Security (RLS) & Table Permissions Configuration
-- ==============================================================================
-- Execute this script in your Supabase Project Dashboard -> SQL Editor -> New Query.
-- It resolves error 42501 ("permission denied for table Students") and ensures
-- student records created by the Admin are saved directly to public."Students".
-- ==============================================================================

-- 1. Grant schema and table permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public."Students" TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 2. Configure table schema and Row Level Security (RLS) on public."Students"
ALTER TABLE public."Students" ADD COLUMN IF NOT EXISTS auth_id text;
ALTER TABLE public."Students" ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public."Students" ADD COLUMN IF NOT EXISTS year text;
ALTER TABLE public."Students" ADD COLUMN IF NOT EXISTS college text;
ALTER TABLE public."Students" ADD COLUMN IF NOT EXISTS section text;
ALTER TABLE public."Students" ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

ALTER TABLE public."Students" ENABLE ROW LEVEL SECURITY;

-- Clean up any prior policies
DROP POLICY IF EXISTS "Allow select for all" ON public."Students";
DROP POLICY IF EXISTS "Allow insert for all" ON public."Students";
DROP POLICY IF EXISTS "Allow update for all" ON public."Students";
DROP POLICY IF EXISTS "Allow delete for all" ON public."Students";
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public."Students";

-- Policy: Allow reading student profiles (for Admin dashboard & Student login)
CREATE POLICY "Allow select for all"
  ON public."Students"
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Allow inserting new student records (when Admin creates a student account)
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
CREATE POLICY "Allow delete for authenticated"
  ON public."Students"
  FOR DELETE
  TO authenticated, service_role
  USING (true);

-- 3. Configure table schema and Row Level Security (RLS) on public."Books"
GRANT ALL ON TABLE public."Books" TO anon, authenticated, service_role;
ALTER TABLE public."Books" ADD COLUMN IF NOT EXISTS shelf_location text DEFAULT 'Main Stacks';
ALTER TABLE public."Books" ADD COLUMN IF NOT EXISTS cover_image text DEFAULT 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop';
ALTER TABLE public."Books" ADD COLUMN IF NOT EXISTS description text DEFAULT 'Central Library engineering reference book.';
ALTER TABLE public."Books" ADD COLUMN IF NOT EXISTS publication_year integer DEFAULT 2024;
ALTER TABLE public."Books" ADD COLUMN IF NOT EXISTS total_copies integer DEFAULT 5;

ALTER TABLE public."Books" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select books for all" ON public."Books";
CREATE POLICY "Allow select books for all"
  ON public."Books"
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow insert books for all" ON public."Books";
DROP POLICY IF EXISTS "Allow insert books for authenticated" ON public."Books";
CREATE POLICY "Allow insert books for all"
  ON public."Books"
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update books for all" ON public."Books";
DROP POLICY IF EXISTS "Allow update books for authenticated" ON public."Books";
CREATE POLICY "Allow update books for all"
  ON public."Books"
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete books for all" ON public."Books";
DROP POLICY IF EXISTS "Allow delete books for authenticated" ON public."Books";
CREATE POLICY "Allow delete books for all"
  ON public."Books"
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- 4. Grant permissions and configure RLS on public.membership
GRANT ALL ON TABLE public.membership TO anon, authenticated, service_role;
ALTER TABLE public.membership ADD COLUMN IF NOT EXISTS student_id text;
ALTER TABLE public.membership ADD COLUMN IF NOT EXISTS membership_id text;
ALTER TABLE public.membership ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE public.membership ADD COLUMN IF NOT EXISTS expiry_date text;
ALTER TABLE public.membership ADD COLUMN IF NOT EXISTS photo text;
ALTER TABLE public.membership ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.membership ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.membership ADD COLUMN IF NOT EXISTS year text;

DO $$
BEGIN
  ALTER TABLE public.membership ALTER COLUMN "Roll Number" TYPE text USING "Roll Number"::text;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.membership ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for all" ON public.membership;
CREATE POLICY "Allow select for all"
  ON public.membership
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow insert for all" ON public.membership;
CREATE POLICY "Allow insert for all"
  ON public.membership
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for all" ON public.membership;
CREATE POLICY "Allow update for all"
  ON public.membership
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete for all" ON public.membership;
CREATE POLICY "Allow delete for all"
  ON public.membership
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

