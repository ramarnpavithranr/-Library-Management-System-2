-- ==============================================================================
-- SREE SAKTHI ENGINEERING COLLEGE - CENTRAL SMART LIBRARY
-- MASTER DATABASE FIX: PERMISSIONS & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Project: https://yvogbzoolyosvilgtyxi.supabase.co
-- Execute this entire script in Supabase Dashboard -> SQL Editor -> New Query -> Run.
-- Resolves error 42501 across all 3 tables: Students, Books, and membership
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FIX TABLE: public."Students"
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public."Students" TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER TABLE public."Students" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for all" ON public."Students";
CREATE POLICY "Allow select for all"
  ON public."Students" FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow insert for all" ON public."Students";
CREATE POLICY "Allow insert for all"
  ON public."Students" FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for all" ON public."Students";
CREATE POLICY "Allow update for all"
  ON public."Students" FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete for all" ON public."Students";
CREATE POLICY "Allow delete for all"
  ON public."Students" FOR DELETE TO anon, authenticated USING (true);

-- ------------------------------------------------------------------------------
-- 2. FIX TABLE: public."Books"
-- ------------------------------------------------------------------------------
GRANT ALL ON TABLE public."Books" TO anon, authenticated, service_role;
ALTER TABLE public."Books" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select books for all" ON public."Books";
CREATE POLICY "Allow select books for all"
  ON public."Books" FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow insert books for all" ON public."Books";
DROP POLICY IF EXISTS "Allow insert books for authenticated" ON public."Books";
CREATE POLICY "Allow insert books for all"
  ON public."Books" FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update books for all" ON public."Books";
DROP POLICY IF EXISTS "Allow update books for authenticated" ON public."Books";
CREATE POLICY "Allow update books for all"
  ON public."Books" FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete books for all" ON public."Books";
DROP POLICY IF EXISTS "Allow delete books for authenticated" ON public."Books";
CREATE POLICY "Allow delete books for all"
  ON public."Books" FOR DELETE TO anon, authenticated USING (true);

-- ------------------------------------------------------------------------------
-- 3. FIX TABLE: public.membership
-- ------------------------------------------------------------------------------
GRANT ALL ON TABLE public.membership TO anon, authenticated, service_role;
ALTER TABLE public.membership ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for all" ON public.membership;
CREATE POLICY "Allow select for all"
  ON public.membership FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow insert for all" ON public.membership;
CREATE POLICY "Allow insert for all"
  ON public.membership FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update for all" ON public.membership;
CREATE POLICY "Allow update for all"
  ON public.membership FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete for all" ON public.membership;
CREATE POLICY "Allow delete for all"
  ON public.membership FOR DELETE TO anon, authenticated USING (true);

-- ------------------------------------------------------------------------------
-- 4. Reload PostgREST schema cache
-- ------------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

