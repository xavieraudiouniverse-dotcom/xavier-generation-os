REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.redeem_admin_code_for(_user_id uuid, _code text)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE result public.profiles;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _code IS DISTINCT FROM '963010' THEN RAISE EXCEPTION 'Invalid access code'; END IF;
  UPDATE public.profiles
    SET tier = 'founder', subscription_status = 'active', admin_code_used = true
    WHERE id = _user_id
    RETURNING * INTO result;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'admin') ON CONFLICT DO NOTHING;
  RETURN result;
END; $$;

REVOKE ALL ON FUNCTION public.redeem_admin_code_for(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_admin_code_for(uuid, text) TO service_role;

DROP FUNCTION IF EXISTS public.redeem_admin_code(text);