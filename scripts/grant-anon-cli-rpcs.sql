-- ============================================================================
-- grant-anon-cli-rpcs.sql
-- Run this once in the self-hosted Supabase SQL editor to allow the Capgo CLI
-- to call every RPC it needs. The CLI authenticates with the anon key
-- (no Supabase user session), so each function must be EXECUTE-granted to
-- the `anon` role. The matching list was extracted from the CLI bundle
-- (`.rpc("...")` calls in @capgo/cli@8.28.1).
-- ============================================================================

DO $$
DECLARE
  fn record;
  fn_names text[] := ARRAY[
    'check_org_members_2fa_enabled',
    'check_org_members_password_policy',
    'cli_check_permission',
    'exist_app_v2',
    'exist_app_versions',
    'get_app_versions',
    'get_identity_apikey_only',
    'get_org_members',
    'get_org_perm_for_apikey',
    'get_organization_cli_warnings',
    'get_orgs_v6',
    'get_orgs_v7',
    'get_user_id',
    'has_2fa_enabled',
    'is_allowed_action',
    'is_allowed_action_org',
    'is_allowed_action_org_action',
    'is_paying_org',
    'is_trial_org',
    'reject_access_due_to_2fa_for_app',
    'reject_access_due_to_2fa_for_org'
  ];
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = ANY(fn_names)
  LOOP
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon', fn.sig);
    RAISE NOTICE 'Granted anon EXECUTE on %', fn.sig;
  END LOOP;
END
$$;
