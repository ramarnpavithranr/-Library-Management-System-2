-- ==============================================================================
-- SREE SAKTHI ENGINEERING COLLEGE - CENTRAL SMART LIBRARY
-- Supabase Row Level Security (RLS) & Table Schema for public."Books"
-- ==============================================================================
-- Endpoint: https://yvogbzoolyosvilgtyxi.supabase.co/rest/v1/Books
-- Target Table: public."Books"
-- ==============================================================================
-- Execute this script in your Supabase Dashboard -> SQL Editor -> New Query.
-- It resolves error 42501 ("new row violates row-level security policy for table Books")
-- and allows book records to be stored, updated, and queried directly via the REST API.
-- ==============================================================================

-- 1. Grant table, schema, and sequence permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public."Books" TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 2. Add supplementary columns if not already present
ALTER TABLE public."Books" ADD COLUMN IF NOT EXISTS shelf_location text DEFAULT 'Main Stacks';
ALTER TABLE public."Books" ADD COLUMN IF NOT EXISTS cover_image text DEFAULT 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop';
ALTER TABLE public."Books" ADD COLUMN IF NOT EXISTS description text DEFAULT 'Central Library engineering reference book.';
ALTER TABLE public."Books" ADD COLUMN IF NOT EXISTS publication_year integer DEFAULT 2024;
ALTER TABLE public."Books" ADD COLUMN IF NOT EXISTS total_copies integer DEFAULT 5;

-- 3. Ensure sequence ownership on id column for auto-increment
DO $$
BEGIN
  ALTER SEQUENCE IF EXISTS public."Books_id_seq" OWNED BY public."Books".id;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public."Books" ENABLE ROW LEVEL SECURITY;

-- 5. Drop any prior conflicting policies on public."Books"
DROP POLICY IF EXISTS "Allow select books for all" ON public."Books";
DROP POLICY IF EXISTS "Allow insert books for all" ON public."Books";
DROP POLICY IF EXISTS "Allow insert books for authenticated" ON public."Books";
DROP POLICY IF EXISTS "Allow update books for all" ON public."Books";
DROP POLICY IF EXISTS "Allow update books for authenticated" ON public."Books";
DROP POLICY IF EXISTS "Allow delete books for all" ON public."Books";
DROP POLICY IF EXISTS "Allow delete books for authenticated" ON public."Books";

-- 6. Create permissive RLS policies for Book Catalog operations
CREATE POLICY "Allow select books for all"
  ON public."Books"
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert books for all"
  ON public."Books"
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update books for all"
  ON public."Books"
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete books for all"
  ON public."Books"
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- 7. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

