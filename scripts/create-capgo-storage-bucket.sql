-- ============================================================================
-- create-capgo-storage-bucket.sql
--
-- Creates the `capgo` Supabase Storage bucket that the TUS upload path
-- writes bundle ZIPs to. The fork's `app_versions.storage_provider` column
-- is set to 'r2-direct' on upload, but the file itself goes to Supabase
-- Storage — so without this bucket, devices get a 404 when fetching an
-- "active" bundle.
--
-- Also adds the RLS policies so the service_role can write (the CLI
-- uploads as anon, which needs an open bucket path with the right RLS).
--
-- RUN ONCE in the Supabase SQL editor.
-- ============================================================================

-- 1) Create the private bucket. `public = false` means files are served
--    via signed URLs only (the device's `updateUrl` / `channelUrl`
--    functions will mint a short-lived signed URL on demand).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'capgo',
  'capgo',
  false,
  524288000,  -- 500 MB per file (matches the fork's MAX_UPLOAD_LENGTH_BYTES)
  ARRAY['application/zip', 'application/octet-stream', 'application/x-zip-compressed', 'application/json']
)
ON CONFLICT (id) DO NOTHING;

-- 2) Allow the service_role to read/write everything in the bucket
--    (the backend's Supabase functions use service_role to mint signed
--    URLs and verify uploads).
CREATE POLICY "service_role full access on capgo bucket"
  ON storage.objects
  FOR ALL
  TO service_role
  USING  (bucket_id = 'capgo')
  WITH CHECK (bucket_id = 'capgo');

-- 3) Allow anon to INSERT (write) into specific upload paths so the
--    CLI's TUS upload — which authenticates with the anon key —
--    actually works. Reads stay locked to service_role (signed URLs).
CREATE POLICY "anon can upload via tus to capgo bucket"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'capgo');

-- 4) Allow authenticated users to read bundles for apps they belong to.
--    The backend mints a signed URL on the device's behalf, so this
--    isn't strictly required for the device flow, but it makes the
--    dashboard preview work.
CREATE POLICY "authenticated can read capgo bucket"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'capgo');

-- 5) Verify
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id = 'capgo';
