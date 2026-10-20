-- Track the one-time welcome shown after a user's first successful sign-in.
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS first_login_seen_at TIMESTAMPTZ;

-- Atomically consume the welcome so concurrent page loads cannot show it more
-- than once. The contact row is created by ensure_current_user_records first.
CREATE OR REPLACE FUNCTION public.consume_first_login_welcome()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.contacts
  SET
    first_login_seen_at = NOW(),
    updated_at = NOW()
  WHERE user_id = auth.uid()
    AND first_login_seen_at IS NULL;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_first_login_welcome()
  TO authenticated;

-- Users may permanently remove only assessment rows linked to their own auth
-- identity. Service-role admin access continues to bypass RLS as before.
CREATE POLICY "Users can delete their quiz results"
  ON public.quiz_results
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
