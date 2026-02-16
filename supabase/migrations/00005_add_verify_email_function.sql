-- RPC function to verify an email token atomically.
-- Uses SECURITY DEFINER to bypass RLS (the anon SELECT policy on contacts
-- requires verification_token IS NOT NULL, which conflicts with clearing
-- the token during verification).
CREATE OR REPLACE FUNCTION verify_email_token(token_value TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  contact_record RECORD;
BEGIN
  -- Look up the token
  SELECT id, verification_token_expires_at
  INTO contact_record
  FROM contacts
  WHERE verification_token = token_value;

  -- Token not found or already used
  IF NOT FOUND THEN
    RETURN json_build_object('status', 'invalid');
  END IF;

  -- Token expired
  IF contact_record.verification_token_expires_at < NOW() THEN
    RETURN json_build_object('status', 'expired');
  END IF;

  -- Mark verified and clear token
  UPDATE contacts
  SET email_verified = true,
      verification_token = null,
      verification_token_expires_at = null,
      updated_at = NOW()
  WHERE id = contact_record.id;

  RETURN json_build_object('status', 'verified');
END;
$$;

-- Allow anon role to call this function
GRANT EXECUTE ON FUNCTION verify_email_token(TEXT) TO anon;
