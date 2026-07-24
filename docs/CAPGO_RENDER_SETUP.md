# Capgo Self-Hosted — Render Service Setup

> The self-hosted Capgo dashboard at **`https://capgo.onrender.com`** is a
> Render service that runs the Capgo backend (Supabase Edge Functions + a
> small Node/Express admin app). For bundle uploads to actually land on
> disk, the Render service needs a handful of environment variables set.
> Without them, the CLI reports "Active" but the file is nowhere — devices
> get a 404 when fetching the bundle.

---

## What we found in the fork

The Capgo fork at `C:\Github\capgo` (your `storytimeng/capgo` repo) has its
Cloudflare Worker config in `cloudflare_workers/files/wrangler.jsonc`. The
binding that holds bundle ZIPs is:

```jsonc
"r2_buckets": [
  { "binding": "ATTACHMENT_BUCKET", "bucket_name": "capgo" }
]
```

So the bucket name is **`capgo`** in Cloudflare R2 by default. The
Render-hosted version of the backend reads the same config from environment
variables instead of `wrangler.jsonc`.

---

## Two storage backends that both work

### Option A — Supabase Storage (recommended for your setup)

You already have the `capgo` bucket in your Supabase project (created by
[scripts/create-capgo-storage-bucket.sql](c:\Github\latest-storytime-app\storytime-ng\scripts\create-capgo-storage-bucket.sql)).
You also have 1 S3 access key in the Supabase dashboard
(`Settings → Storage → S3 Configuration`).

Add these to the Render service (`capgo.onrender.com` → Environment):

| Variable | Value |
|---|---|
| `S3_ENDPOINT` | `https://xssneissyscmaibeoojq.supabase.co/storage/v1/s3` |
| `S3_REGION` | `eu-west-1` (your Supabase project's region) |
| `S3_BUCKET` | `capgo` |
| `S3_ACCESS_KEY_ID` | *(the S3 access key ID from the Supabase dashboard)* |
| `S3_SECRET_ACCESS_KEY` | *(the matching secret — shown only once at creation)* |

### Option B — Cloudflare R2 (what the fork was originally written for)

Requires a Cloudflare account and an R2 bucket called `capgo`.

| Variable | Value |
|---|---|
| `S3_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |
| `S3_REGION` | `auto` |
| `S3_BUCKET` | `capgo` |
| `S3_ACCESS_KEY_ID` | R2 access key |
| `S3_SECRET_ACCESS_KEY` | R2 secret key |

---

## Other env vars the Render service probably needs

These are the standard ones for a self-hosted Capgo; check the fork's
`docker-compose.yml` or `render.yaml` for the full list.

| Variable | What it is |
|---|---|
| `SUPABASE_URL` | `https://xssneissyscmaibeoojq.supabase.co` |
| `SUPABASE_SERVICE_KEY` | **service_role** JWT (not the anon key) — needed for admin operations |
| `SUPABASE_ANON_KEY` | `sb_publishable_wMAICJbQ1OYszQudDGg3sA_rMm1jFpC` |
| `POSTGRES_URL` | `postgresql://postgres:<password>@db.xssneissyscmaibeoojq.supabase.co:5432/postgres` |
| `APP_URL` | `https://capgo.onrender.com` |
| `PORT` | `8080` (or whatever Render expects) |
| `COOKIE_DOMAIN` | `.onrender.com` |
| `RENDER_EXTERNAL_URL` | `https://capgo.onrender.com` |

---

## After the env vars are set

1. **Redeploy** the Render service (it picks up new env vars on a manual
   deploy, not hot).
2. **Re-run the laptop deploy script**:
   ```bash
   pnpm run capgo:dev
   ```
3. **Verify the file actually landed in storage**:
   ```bash
   supabase db query --linked \
     "SELECT name, (metadata->>'size')::bigint AS size_bytes
      FROM storage.objects
      WHERE bucket_id = 'capgo'
      ORDER BY created_at DESC LIMIT 5;"
   ```
   You should see one row with a `size_bytes` > 0 that matches your bundle.
4. **Verify the device flow** by installing the debug APK on a phone and
   watching the Capgo dashboard → Devices tab.

---

## What was already done (so you don't redo it)

- ✅ `capgo` bucket created in Supabase Storage (500 MB file size limit, private)
- ✅ RLS policies: `service_role` full access, `anon` can INSERT (TUS upload path), `authenticated` can SELECT
- ✅ `app_versions.storage_provider` left as `r2-direct` — the existing code
  uses that string regardless of whether the actual bytes live in R2 or
  Supabase Storage; the env vars above control the real location
- ✅ The three test bundles that landed in metadata with no file behind them
  have been soft-deleted (`deleted = true`)

---

## Quick verification (after Render env vars are set)

```bash
# 1. Laptop deploy
pnpm run capgo:dev

# 2. Bundle is in Supabase Storage
supabase db query --linked "SELECT count(*) FROM storage.objects WHERE bucket_id='capgo';"

# 3. The dashboard shows it as Active
#    https://capgo.onrender.com/app/com.storytimeng/bundles

# 4. Doctor says everything is healthy
pnpm run capgo:doctor
```
