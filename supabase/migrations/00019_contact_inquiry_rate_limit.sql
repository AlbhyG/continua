-- Shared across serverless instances. Only stores a keyed hash and a timestamp,
-- not IP addresses, email addresses, or inquiry contents.
CREATE TABLE public.contact_inquiry_limits (
  sender_hash TEXT PRIMARY KEY CHECK (sender_hash ~ '^[0-9a-f]{64}$'),
  last_request_id UUID NOT NULL,
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_inquiry_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.contact_inquiry_limits FROM anon, authenticated;

CREATE FUNCTION public.consume_contact_inquiry_limit(p_sender_hash TEXT, p_request_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_allowed BOOLEAN;
BEGIN
  -- Drop inactive buckets; this data has no product or CRM use.
  DELETE FROM public.contact_inquiry_limits WHERE last_attempt_at < now() - interval '1 day';
  INSERT INTO public.contact_inquiry_limits(sender_hash, last_request_id, last_attempt_at)
    VALUES (p_sender_hash, p_request_id, now())
  ON CONFLICT (sender_hash) DO UPDATE
    SET last_request_id = EXCLUDED.last_request_id, last_attempt_at = EXCLUDED.last_attempt_at
    WHERE contact_inquiry_limits.last_attempt_at < now() - interval '1 minute'
  RETURNING TRUE INTO v_allowed;
  RETURN COALESCE(v_allowed, FALSE);
END;
$$;
REVOKE ALL ON FUNCTION public.consume_contact_inquiry_limit(TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_contact_inquiry_limit(TEXT, UUID) TO service_role;
