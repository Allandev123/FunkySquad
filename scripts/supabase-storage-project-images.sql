-- Public bucket for admin-uploaded project images (adjust names if needed).
-- Set VITE_SUPABASE_PROJECT_IMAGES_BUCKET in .env if you use a different bucket id.

-- insert into storage.buckets (id, name, public) values ('project-images', 'project-images', true);

-- Example policies (run after bucket exists):
-- CREATE POLICY "Public read project images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
--
-- After locking down projects RLS, replace anon uploads with authenticated admin-only INSERT, e.g.:
-- CREATE POLICY "Admin upload project images" ON storage.objects FOR INSERT TO authenticated
--   WITH CHECK (
--     bucket_id = 'project-images'
--     AND (auth.jwt() ->> 'email') = 'YOUR_ADMIN_EMAIL@example.com'
--   );
