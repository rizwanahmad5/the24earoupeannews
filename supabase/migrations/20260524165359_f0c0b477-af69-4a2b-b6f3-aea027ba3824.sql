
-- has_role must remain callable by authenticated users so RLS policies that reference it work.
-- This is the canonical Supabase pattern; the previous revoke broke admin checks.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
