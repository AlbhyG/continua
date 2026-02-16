-- RPC function for upserting contact verification tokens.
-- Uses SECURITY DEFINER to bypass RLS, since PostgREST requires SELECT
-- policy visibility for UPDATE filters, and contacts may have both
-- email_verified=false AND verification_token=NULL (invisible to anon).
-- This matches the pattern used by verify_email_token.

CREATE OR REPLACE FUNCTION upsert_contact_verification(
  p_email TEXT,
  p_name TEXT,
  p_token TEXT,
  p_expires_at TIMESTAMPTZ,
  p_book_type TEXT
) RETURNS JSON AS $$
DECLARE
  v_contact_id BIGINT;
BEGIN
  -- Upsert contact: insert new or update existing with new verification token
  INSERT INTO public.contacts (email, name, verification_token, verification_token_expires_at)
  VALUES (LOWER(TRIM(p_email)), p_name, p_token, p_expires_at)
  ON CONFLICT (email) DO UPDATE SET
    verification_token = EXCLUDED.verification_token,
    verification_token_expires_at = EXCLUDED.verification_token_expires_at,
    updated_at = NOW()
  RETURNING id INTO v_contact_id;

  -- Insert book request (ignore if already requested this book type)
  BEGIN
    INSERT INTO public.book_requests (contact_id, book_type)
    VALUES (v_contact_id, p_book_type);
  EXCEPTION
    WHEN unique_violation THEN
      -- Already requested this book type, ignore
      NULL;
  END;

  RETURN json_build_object('contact_id', v_contact_id, 'status', 'ok');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION upsert_contact_verification TO anon;
