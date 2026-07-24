-- ============================================================================
-- rotate-capgo-key.sql
-- Run this in your self-hosted Supabase SQL editor to mint a fresh admin
-- API key, then revoke the leaked one.
-- ============================================================================
-- IMPORTANT: do NOT paste the result of this query into Slack/chat/email.
-- Anyone who sees the new key value can authenticate as admin.
-- ============================================================================

-- 1) Mint a new 18-byte random key (36 hex chars), store both the raw key
--    in `key` and its SHA-256 hex in `key_hash`. The dashboard expects both
--    columns to be populated going forward (see migration
--    20251228080032_hashed_api_keys.sql).
WITH new_key AS (
  SELECT encode(gen_random_bytes(18), 'hex') AS raw
)
INSERT INTO public.apikeys
  (id, user_id, key, key_hash, mode, name, created_at, updated_at, version)
SELECT
  gen_random_uuid(),
  'a254dda7-30dc-4832-9246-8184a52c0c8c'::uuid,        -- your admin user_id
  raw,
  encode(sha256(raw::bytea), 'hex'),
  'admin',
  'admin-rotated-' || to_char(now(), 'YYYYMMDD-HH24MISS'),
  now(), now(), 1
FROM new_key
RETURNING id, key, key_hash, name, created_at;
-- ^^^ Copy the `key` value into GitHub Secret CAPGO_API_KEY NOW.
--     The `key` column is the only place the plaintext is recoverable.

-- 2) Revoke the leaked key. Run this in a SECOND step after you have
--    successfully updated the GitHub secret and verified a fresh
--    `capgo account id` returns the user UUID.
-- DELETE FROM public.apikeys
-- WHERE key = 'PASTE_LEAKED_KEY_HERE';
