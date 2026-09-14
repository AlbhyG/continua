-- Account-scoped UX state only, never an authentication/authorization decision.
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS passkey_setup_offered_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.consume_passkey_setup_offer()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  UPDATE public.contacts
    SET passkey_setup_offered_at = now(), updated_at = now()
    WHERE user_id = auth.uid() AND passkey_setup_offered_at IS NULL;
  RETURN FOUND;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_passkey_setup_offer() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_passkey_setup_offer() TO authenticated;
