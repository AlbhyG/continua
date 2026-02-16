-- Update RPC function to return email and book_type after successful verification.
-- This allows the verification success page to automatically redirect to the appropriate
-- download link without requiring the user to re-enter their information.
CREATE OR REPLACE FUNCTION verify_email_token(token_value TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  contact_record RECORD;
  contact_email TEXT;
  requested_book_type TEXT;
BEGIN
  -- Look up the token
  SELECT id, email, verification_token_expires_at
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

  -- Store email for response
  contact_email := contact_record.email;

  -- Get the most recent book request for this contact
  SELECT book_type
  INTO requested_book_type
  FROM book_requests
  WHERE contact_id = contact_record.id
  ORDER BY requested_at DESC
  LIMIT 1;

  -- Return success with email and book_type
  RETURN json_build_object(
    'status', 'verified',
    'email', contact_email,
    'book_type', requested_book_type
  );
END;
$$;

-- Grant remains unchanged
GRANT EXECUTE ON FUNCTION verify_email_token(TEXT) TO anon;
