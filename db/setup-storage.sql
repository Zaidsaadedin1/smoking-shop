-- PUFF Jordan storage setup. Run this file by itself in Supabase SQL Editor.
-- The application uses one public bucket and separates uploads into folders:
-- products, categories, brands, hero-slides, and flash-sales.

BEGIN;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "puff_media_public_read" ON storage.objects;
CREATE POLICY "puff_media_public_read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'media');

DROP POLICY IF EXISTS "puff_media_admin_insert" ON storage.objects;
CREATE POLICY "puff_media_admin_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media' AND public.current_user_is_admin());

DROP POLICY IF EXISTS "puff_media_admin_update" ON storage.objects;
CREATE POLICY "puff_media_admin_update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'media' AND public.current_user_is_admin())
WITH CHECK (bucket_id = 'media' AND public.current_user_is_admin());

DROP POLICY IF EXISTS "puff_media_admin_delete" ON storage.objects;
CREATE POLICY "puff_media_admin_delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'media' AND public.current_user_is_admin());

COMMIT;
