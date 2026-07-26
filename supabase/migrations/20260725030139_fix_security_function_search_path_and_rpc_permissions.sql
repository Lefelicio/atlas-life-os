/*
# Fix Security Issues: Function Search Path & RPC Execution Permissions

## Summary
This migration addresses three security advisories:
1. **Function Search Path Mutable** — `public.update_updated_at()` had a mutable search_path, allowing search_path hijacking. We set an immutable `search_path = public` so the function always resolves objects in the public schema.
2. **Public Can Execute SECURITY DEFINER Function** — `public.handle_new_user()` was executable by `anon` via `/rest/v1/rpc/handle_new_user`, exposing an internal trigger function. We revoke EXECUTE from `anon` and `authenticated` and `public` so it can only be invoked by the database system as a trigger, not via REST RPC.
3. **Signed-In Users Can Execute SECURITY DEFINER Function** — same `handle_new_user()` function, same fix (revoked from `authenticated` too).

## Why handle_new_user stays SECURITY DEFINER
`handle_new_user()` is a trigger that fires on `auth.users` INSERT to create a matching row in `public.profiles`. It must run with elevated privileges because the inserting role (anon/authenticated) cannot write to `public.profiles` during signup. SECURITY DEFINER is correct here — the fix is to remove direct RPC execution, not to change the security context.

## Changes
- `ALTER FUNCTION public.update_updated_at() SET search_path = public` — locks the search path.
- `ALTER FUNCTION public.handle_new_user() SET search_path = public` — locks the search path.
- `REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated` — blocks REST RPC access.
*/

-- 1. Lock search_path on update_updated_at (mutable search_path fix)
ALTER FUNCTION public.update_updated_at() SET search_path = public;

-- 2. Lock search_path on handle_new_user
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 3. Revoke direct execution of handle_new_user from all non-superuser roles
--    This prevents anon and authenticated from calling it via /rest/v1/rpc/handle_new_user
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;