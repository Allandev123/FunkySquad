/*
 * Production-style RLS for public.projects
 * ========================================
 * - Anyone (anon + authenticated) can SELECT → portfolio still works with anon key.
 * - Only your dashboard user can INSERT / UPDATE / DELETE (matched by JWT email).
 *
 * BEFORE YOU RUN:
 * 1) Create the admin user: Supabase Dashboard → Authentication → Users → Add user
 *    (same email you use on /login for admin).
 * 2) Replace every YOUR_ADMIN_EMAIL@example.com below with that exact email address.
 * 3) Remove dev policies from scripts/supabase-projects-dev-permissions.sql if applied:
 *      DROP POLICY IF EXISTS "Allow all for testing" ON public.projects;
 *
 * Seed script (seed.js):
 * - Uses the anon key → INSERT will be denied after this migration.
 * - Run seeds with the service_role key in a trusted environment, or use SQL in the editor.
 *
 * JWT email check:
 * - (auth.jwt() ->> 'email') is the usual Supabase pattern in Postgres policies.
 */

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for testing" ON public.projects;
DROP POLICY IF EXISTS "Allow inserts" ON public.projects;
DROP POLICY IF EXISTS "Allow seed select titles" ON public.projects;

DROP POLICY IF EXISTS "projects_public_select" ON public.projects;
DROP POLICY IF EXISTS "projects_admin_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_admin_update" ON public.projects;
DROP POLICY IF EXISTS "projects_admin_delete" ON public.projects;

-- Public read (portfolio + anonymous browsing)
CREATE POLICY "projects_public_select"
ON public.projects
FOR SELECT
TO anon, authenticated
USING (true);

-- Admin writes — replace email before running
CREATE POLICY "projects_admin_insert"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL@example.com');

CREATE POLICY "projects_admin_update"
ON public.projects
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL@example.com')
WITH CHECK ((auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL@example.com');

CREATE POLICY "projects_admin_delete"
ON public.projects
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL@example.com');

/*
 * Storage (project-images bucket): lock Storage RLS separately so only authenticated admins
 * can upload. See scripts/supabase-storage-project-images.sql.
 */
