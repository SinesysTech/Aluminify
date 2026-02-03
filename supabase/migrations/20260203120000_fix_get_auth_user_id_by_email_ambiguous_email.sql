-- Fix: get_auth_user_id_by_email(email) ambiguous reference
-- Production error seen: "column reference \"email\" is ambiguous"
-- Root cause: unqualified `email` can refer to both auth.users.email and the function argument.

CREATE OR REPLACE FUNCTION public.get_auth_user_id_by_email(email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Validate input
  IF email IS NULL OR btrim(email) = '' THEN
    RETURN NULL;
  END IF;

  -- Use positional argument ($1) to avoid ambiguity with auth.users.email
  SELECT u.id INTO user_id
  FROM auth.users u
  WHERE lower(u.email) = lower($1)
  LIMIT 1;

  RETURN user_id;
END;
$$;

-- Ensure only service_role can execute (used by server actions/scripts)
REVOKE ALL ON FUNCTION public.get_auth_user_id_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_user_id_by_email(text) TO service_role;

COMMENT ON FUNCTION public.get_auth_user_id_by_email IS 'Securely looks up an auth user ID by email. Used to handle user conflicts efficiently.';
