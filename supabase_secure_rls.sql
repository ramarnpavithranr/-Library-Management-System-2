-- ==============================================================================
-- SREE SAKTHI ENGINEERING COLLEGE - CENTRAL SMART LIBRARY
-- PRODUCTION-GRADE SECURE ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Target Supabase Project: https://yvogbzoolyosvilgtyxi.supabase.co
--
-- Instructions:
-- Execute this entire script in your Supabase Dashboard:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run.
--
-- Existing Database Tables (No schema modification, no new tables):
--   1. public."Students" (id bigint PK, created_at, Name, Department, password, "Roll Number", "Phone Number", Username)
--   2. public."Books"    (id bigint PK, created_at, "Book Title", Author, Category, Edition, Publisher, "ISBN Number", "Available Copies")
--   3. public.membership (id bigint PK, created_at, Name, "Roll Number" bigint, Department)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: GRANT POSTGRESQL SCHEMA & TABLE PRIVILEGES
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON TABLE public."Students" TO authenticated, service_role;
GRANT SELECT ON TABLE public."Students" TO anon;

GRANT ALL ON TABLE public."Books" TO authenticated, service_role;
GRANT SELECT ON TABLE public."Books" TO anon;

GRANT ALL ON TABLE public.membership TO authenticated, service_role;

GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- STEP 2: DEFINE HELPER FUNCTIONS FOR ROLE & IDENTITY RESOLUTION
-- ------------------------------------------------------------------------------

-- Helper 1: Verify whether current authenticated user is an Administrator / Librarian
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    auth.role() = 'authenticated' AND (
      coalesce((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
      OR (auth.jwt() ->> 'email') ILIKE '%admin%'
      OR (auth.jwt() ->> 'email') ILIKE '%librarian%'
      OR (auth.jwt() ->> 'email') = 'library@sreesakthi.edu.in'
    )
  );
$$;

-- Helper 2: Extract student roll number string from JWT claims
CREATE OR REPLACE FUNCTION public.current_student_roll()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'roll_number'),
    ''
  );
$$;

-- Helper 3: Extract student numeric roll number as bigint from JWT claims (for public.membership)
CREATE OR REPLACE FUNCTION public.current_student_numeric_roll()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NULLIF(regexp_replace(coalesce(auth.jwt() -> 'user_metadata' ->> 'roll_number', ''), '\D', '', 'g'), '')::bigint;
$$;

-- Helper 4: Extract student username from JWT claims or email
CREATE OR REPLACE FUNCTION public.current_student_username()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'username'),
    split_part(coalesce(auth.jwt() ->> 'email', ''), '@', 1)
  );
$$;

-- ------------------------------------------------------------------------------
-- STEP 3: CONFIGURE SECURE RLS FOR TABLE: public."Books"
-- ------------------------------------------------------------------------------
-- Security Rules:
--   - SELECT: Public (anon and authenticated students/admins can browse books)
--   - INSERT: Admin only
--   - UPDATE: Admin only
--   - DELETE: Admin only
-- ------------------------------------------------------------------------------
ALTER TABLE public."Books" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select books for all" ON public."Books";
DROP POLICY IF EXISTS "Allow insert books for all" ON public."Books";
DROP POLICY IF EXISTS "Allow update books for all" ON public."Books";
DROP POLICY IF EXISTS "Allow delete books for all" ON public."Books";
DROP POLICY IF EXISTS "books_select_policy" ON public."Books";
DROP POLICY IF EXISTS "books_insert_admin_only" ON public."Books";
DROP POLICY IF EXISTS "books_update_admin_only" ON public."Books";
DROP POLICY IF EXISTS "books_delete_admin_only" ON public."Books";

-- 1. SELECT: Anyone can browse the book catalog
CREATE POLICY "books_select_policy"
  ON public."Books"
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. INSERT: Only Admin can add new books
CREATE POLICY "books_insert_admin_only"
  ON public."Books"
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() = true);

-- 3. UPDATE: Only Admin can update book details
CREATE POLICY "books_update_admin_only"
  ON public."Books"
  FOR UPDATE
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

-- 4. DELETE: Only Admin can delete books
CREATE POLICY "books_delete_admin_only"
  ON public."Books"
  FOR DELETE
  TO authenticated
  USING (public.is_admin() = true);

-- ------------------------------------------------------------------------------
-- STEP 4: CONFIGURE SECURE RLS FOR TABLE: public."Students"
-- ------------------------------------------------------------------------------
-- Security Rules:
--   - SELECT: Admin sees all; Student sees ONLY their own profile record
--   - INSERT: Admin only (Students cannot insert other students)
--   - UPDATE: Admin updates all; Student can ONLY update their own record
--   - DELETE: Admin only (Students cannot delete records)
-- ------------------------------------------------------------------------------
ALTER TABLE public."Students" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for all" ON public."Students";
DROP POLICY IF EXISTS "Allow insert for all" ON public."Students";
DROP POLICY IF EXISTS "Allow update for all" ON public."Students";
DROP POLICY IF EXISTS "Allow delete for all" ON public."Students";
DROP POLICY IF EXISTS "students_select_secure" ON public."Students";
DROP POLICY IF EXISTS "students_insert_admin_only" ON public."Students";
DROP POLICY IF EXISTS "students_update_secure" ON public."Students";
DROP POLICY IF EXISTS "students_delete_admin_only" ON public."Students";

-- 1. SELECT: Admin can view all students; Student can view only their own record
CREATE POLICY "students_select_secure"
  ON public."Students"
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin() = true
    OR lower("Username") = lower(public.current_student_username())
    OR "Roll Number" = public.current_student_roll()
  );

-- 2. INSERT: Only Admin can provision student accounts
CREATE POLICY "students_insert_admin_only"
  ON public."Students"
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin() = true);

-- 3. UPDATE: Admin can update all; Student can only update their own record
CREATE POLICY "students_update_secure"
  ON public."Students"
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() = true
    OR lower("Username") = lower(public.current_student_username())
    OR "Roll Number" = public.current_student_roll()
  )
  WITH CHECK (
    public.is_admin() = true
    OR lower("Username") = lower(public.current_student_username())
    OR "Roll Number" = public.current_student_roll()
  );

-- 4. DELETE: Only Admin can delete student records
CREATE POLICY "students_delete_admin_only"
  ON public."Students"
  FOR DELETE
  TO authenticated
  USING (public.is_admin() = true);

-- ------------------------------------------------------------------------------
-- STEP 5: CONFIGURE SECURE RLS FOR TABLE: public.membership
-- ------------------------------------------------------------------------------
-- Security Rules:
--   - SELECT: Admin sees all; Student sees ONLY their own membership record
--   - INSERT: Student can insert ONLY their own application; Admin can insert
--   - UPDATE: Admin only (Students CANNOT approve or modify status/approval)
--   - DELETE: Admin only (Students CANNOT delete membership applications)
-- ------------------------------------------------------------------------------
ALTER TABLE public.membership ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for all" ON public.membership;
DROP POLICY IF EXISTS "Allow insert for all" ON public.membership;
DROP POLICY IF EXISTS "Allow update for all" ON public.membership;
DROP POLICY IF EXISTS "Allow delete for all" ON public.membership;
DROP POLICY IF EXISTS "membership_select_secure" ON public.membership;
DROP POLICY IF EXISTS "membership_insert_secure" ON public.membership;
DROP POLICY IF EXISTS "membership_update_admin_only" ON public.membership;
DROP POLICY IF EXISTS "membership_delete_admin_only" ON public.membership;

-- 1. SELECT: Admin sees all; Student sees only their own membership
CREATE POLICY "membership_select_secure"
  ON public.membership
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin() = true
    OR (
      public.current_student_numeric_roll() IS NOT NULL
      AND "Roll Number" = public.current_student_numeric_roll()
    )
  );

-- 2. INSERT: Student can insert only their own application; Admin can insert
CREATE POLICY "membership_insert_secure"
  ON public.membership
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin() = true
    OR (
      public.current_student_numeric_roll() IS NOT NULL
      AND "Roll Number" = public.current_student_numeric_roll()
    )
  );

-- 3. UPDATE: Only Admin can approve/reject/modify membership applications
CREATE POLICY "membership_update_admin_only"
  ON public.membership
  FOR UPDATE
  TO authenticated
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

-- 4. DELETE: Only Admin can delete membership records
CREATE POLICY "membership_delete_admin_only"
  ON public.membership
  FOR DELETE
  TO authenticated
  USING (public.is_admin() = true);

-- ------------------------------------------------------------------------------
-- STEP 6: RELOAD POSTGREST SCHEMA CACHE
-- ------------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

