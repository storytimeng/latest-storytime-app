# Capgo Plan & Setup

> Owner: StoryTime Mobile
> Self-hosted Capgo instance: https://capgo.onrender.com (dashboard) + Supabase project `xssneissyscmaibeoojq` (API)
> Status: ✅ Installed and verified on `com.storytimeng` (2026-07-11)

---

## 1. What's already in place

| Item | Status |
|---|---|
| App registered in self-hosted Capgo | ✅ `com.storytimeng` |
| `CapacitorUpdater` plugin in `package.json` | ✅ `@capgo/capacitor-updater@8.50.2` |
| `CapacitorUpdater` registered in Android project | ✅ (via `npx cap sync android`) |
| `capacitor.config.ts` pointed at self-hosted Supabase | ✅ |
| CLI auth working | ✅ (`capgo account id` returns the user UUID) |
| Missing `anon` EXECUTE grant on `get_user_id` | ✅ Fixed via `supabase db query` |
| Key rotation after leak in chat | ⏳ TODO (see §6) |

---

## 2. Capgo packages — what to add and when

### Currently installed
- `@capgo/capacitor-updater` — OTA updates
- `@capgo/capacitor-media-session` — lock-screen / Bluetooth / Android Auto controls

### High priority — add this next
- `@capgo/capacitor-notifications` (0.1.13) — push notifications, badge counts, and silent OTA triggers.
  - Peer-deps: `@capacitor/core ^8`, `@capgo/capacitor-updater ^8` (both met).
  - Use case: "New story in your favourite genre" alerts, "your draft is ready" reminders, "your story got featured" pings.

### Not needed / not recommended
- `@capgo/capacitor-live-reload` — only useful in pure-dev iteration; we have a PWA dev server for that.
- `@capgo/capacitor-screen-recorder` / `native-audio` / `inappbrowser` / `downloads` etc. — third-party plugins, not officially first-party Capgo. Skip unless a specific need appears.
- For "performance", Capgo's wins come from configuration (channels, encryption, delay), not from more packages.

### Capgo CLI features we should be using
- `capgo channel` — split `production` / `staging` / `dev` so a broken build never reaches all users.
- `capgo bundle upload` — main deploy.
- `capgo bundle list` / `capgo bundle cleanup` — keep storage tidy.
- `capgo key` + `capgo encryption` — end-to-end encryption for premium content (paid stories, ambassador copy).
- `capgo notifications setup` — configures iOS push delegate for the notifications plugin.
- `capgo doctor` — health check (already green).

---

## 3. Workflow changes (this PR)

### Required GitHub secrets / variables
| Name | Type | Value | Used by |
|---|---|---|---|
| `CAPGO_API_KEY` | Secret | rotated key (see §6) | workflows |
| `CAPGO_API_HOST` | Secret or Var | `https://xssneissyscmaibeoojq.supabase.co/functions/v1` | workflows |
| `CAPGO_SUPA_HOST` | Secret or Var | `https://xssneissyscmaibeoojq.supabase.co` | workflows |
| `CAPGO_SUPA_ANON` | Secret | `sb_publishable_…` | workflows |

### Files changed
1. `.github/workflows/android-build.yml`
   - Add a Capgo `bundle upload` step after `cap sync android` and before the APK assemble (web bundle must exist before the APK is built, so the APK can fetch it on first launch).
   - Relax the `Verify required build vars` step: if `NEXT_PUBLIC_API_URL` is empty, **fall back to `https://back.storytime.ng`** instead of failing. The web app already supports this fallback in `src/heyapi-runtime.ts`.
   - Add `main` to the push and pull_request triggers (was `android` only).
2. `.github/workflows/android-nightly.yml` — same two changes + add `main` to triggers.
3. `.github/workflows/keep-capgo-api-alive.yml` — new: pings the Capgo API (Supabase functions) every 5 days.
4. `src/heyapi-runtime.ts` — already has the `back.storytime.ng` fallback; no change.
5. `app/providers.tsx` — added `CapgoUpdater.notifyAppReady()` on native boot.

### Capgo channel mapping (final)

| Trigger | Build type | Capgo channel |
|---|---|---|
| push to `main` (debug) | debug | `dev` |
| push to `android` (debug) | debug | `dev` |
| push tag `v*` | release | `production` |
| `workflow_dispatch` with `build_type=release` | release | `production` |
| `workflow_dispatch` with `build_type=debug` (default) | debug | `dev` |
| pull_request to `main` / `android` | debug | skipped (no secrets in forks) |
| nightly cron | debug | `dev` |

### Bundle upload command
```bash
npx @capgo/cli@latest bundle upload \
  --apikey "$CAPGO_API_KEY" \
  --api-url "$CAPGO_API_HOST" \
  --supa-host "$CAPGO_SUPA_HOST" \
  --supa-anon "$CAPGO_SUPA_ANON" \
  --channel "production" \
  --path "out" \
  --ignore-error "too_many_requests"
```

---

## 4. Mini test plan (do this once to prove the loop)

1. **Build the web bundle locally:**
   ```bash
   pnpm install --frozen-lockfile
   pnpm exec next build
   ```
2. **Sync to android assets:**
   ```bash
   pnpm exec cap sync android
   ```
3. **Upload a tiny test bundle to a `dev` channel** (so production is never at risk):
   ```bash
   CAPGO_API_HOST=https://xssneissyscmaibeoojq.supabase.co/functions/v1 \
   CAPGO_SUPA_HOST=https://xssneissyscmaibeoojq.supabase.co \
   CAPGO_SUPA_ANON=sb_publishable_wMAICJbQ1OYszQudDGg3sA_rMm1jFpC \
   CAPGO_TOKEN=<NEW_KEY> \
   npx @capgo/cli@latest bundle upload \
     --apikey "$CAPGO_TOKEN" \
     --api-url "$CAPGO_API_HOST" \
     --supa-host "$CAPGO_SUPA_HOST" \
     --supa-anon "$CAPGO_SUPA_ANON" \
     --channel "dev" \
     --path "out"
   ```
4. **Verify it shows up:**
   ```bash
   npx @capgo/cli@latest bundle list com.storytimeng --channel dev
   ```
5. **Wire the device**: install a debug APK built against `channel: "dev"`, open the app, confirm in Capgo dashboard that the device ID appears under `Devices` and that the bundle is delivered.

---

## 5. Backend fallback (for the env in the build)

The build sets `NEXT_PUBLIC_API_URL` from the GitHub Actions variable of the same name. To make a missing variable non-fatal:

In each workflow's `.env.local` step, replace the literal `${{ vars.NEXT_PUBLIC_API_URL }}` with an explicit fallback expression:

```yaml
NEXT_PUBLIC_API_URL=${{ vars.NEXT_PUBLIC_API_URL || 'https://back.storytime.ng' }}
NEXT_PUBLIC_BACKEND_URL=${{ vars.NEXT_PUBLIC_API_URL || 'https://back.storytime.ng' }}
```

And change the `Verify required build vars` step from "fail" to "warn" (or just drop the `exit 1`).

The web client (`src/heyapi-runtime.ts`) already has:
```ts
baseUrl:
  process.env.NEXT_PUBLIC_PROXY === "true"
    ? "/api/proxy"
    : process.env.NEXT_PUBLIC_API_URL ||
      "https://back.storytime.ng"
```
so the runtime is already safe.

---

## 6. Security follow-ups (do this week)

1. **Rotate the leaked key.** Run the SQL in `ROTATE_KEY.sql` (created alongside this plan) to mint a new key + hash, then delete the leaked one.
2. **Make the new key admin-scoped** and put it in GitHub Secrets as `CAPGO_API_KEY`.
3. **Add a `anon` EXECUTE grant migration to the Capgo fork** so the fix doesn't disappear on next redeploy:
   ```sql
   GRANT EXECUTE ON FUNCTION public.get_user_id(text)        TO anon;
   GRANT EXECUTE ON FUNCTION public.get_user_id(text, text)  TO anon;
   ```
   File: `supabase/migrations/20260711000000_grant_anon_get_user_id.sql` (or whatever the next timestamp is in your fork).
4. **Fix the dashboard "Create API key" path** so new keys get a non-null `key_hash`. Right now the dashboard's POST silently writes `null` — root cause is almost certainly the self-hosted backend on Render using the anon key instead of the service-role key for inserts.

---

## 7. Order of operations (this week)

1. [ ] Rotate the API key in the Supabase SQL editor (§6).
2. [ ] Add the 4 secrets/variables in repo Settings → Secrets and variables → Actions.
3. [ ] Add `ROTATE_KEY.sql` to the repo.
4. [ ] Add the migration file to the Capgo fork.
5. [ ] Update `android-build.yml` and `android-nightly.yml` per §3.
6. [ ] Run the mini test from §4 against the `dev` channel.
7. [ ] Cut a release branch, merge the workflow change, let the next nightly build push a bundle to `production`.
8. [ ] Add `@capgo/capacitor-notifications` (only after the OTA loop is proven end-to-end).
