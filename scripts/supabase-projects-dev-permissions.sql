/*
 * ============================================================================
 * WARNING — INSECURE — LOCAL / DEVELOPMENT ONLY
 * ============================================================================
 * This script opens up public.projects to broad access so Node seed.js can run
 * with the anon (publishable) key: SELECT (duplicate check) + INSERT.
 *
 * - Anyone with your anon key can read/write this table while these grants and
 *   policies are in effect.
 * - Do NOT deploy this configuration to production.
 * - Replace with auth-based policies (e.g. USING (auth.uid() = user_id)) before
 *   going live, and revoke excessive GRANTs on anon where appropriate.
 *
 * How to apply:
 *   Supabase Dashboard → SQL Editor → paste → Run
 *
 * Optional cleanup later:
 *   DROP POLICY "Allow all for testing" ON public.projects;
 *   -- then add proper policies and tighten GRANTs.
 * ============================================================================
 */

-- Table privileges: anon (used by VITE_SUPABASE_ANON_KEY) and authenticated users.
-- Adjust schema if your table is not in public.
GRANT ALL ON TABLE public.projects TO anon;
GRANT ALL ON TABLE public.projects TO authenticated;

-- If projects.id uses a SERIAL/IDENTITY sequence in public, un-comment:
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Idempotent: drop dev policies if you re-run this script.
DROP POLICY IF EXISTS "Allow all for testing" ON public.projects;
DROP POLICY IF EXISTS "Allow inserts" ON public.projects;
DROP POLICY IF EXISTS "Allow seed select titles" ON public.projects;

/*
 * Option A — widest access (temporary testing): all operations for all roles
 * subject to RLS. Matches seed needs plus any ad-hoc browsing.
 */
CREATE POLICY "Allow all for testing"
ON public.projects
FOR ALL
USING (true)
WITH CHECK (true);

/*
 * Option B — cleaner minimum for seed.js only (requires SELECT + INSERT):
 *
 *   Uncomment the block below, comment out or DROP "Allow all for testing",
 *   then run again.
 *
 * DROP POLICY IF EXISTS "Allow all for testing" ON public.projects;
 *
 * CREATE POLICY "Allow seed select titles"
 * ON public.projects
 * FOR SELECT
 * USING (true);
 *
 * CREATE POLICY "Allow inserts"
 * ON public.projects
 * FOR INSERT
 * WITH CHECK (true);
 */
