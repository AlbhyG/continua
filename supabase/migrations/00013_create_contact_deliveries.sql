-- Tracks automatic and manual fulfillment for Contact Me submissions.
CREATE OR REPLACE FUNCTION public.upsert_contact_submission(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_roles TEXT[]
) RETURNS JSON AS $$
DECLARE
  v_contact_id BIGINT;
BEGIN
  IF p_email IS NOT NULL AND LENGTH(TRIM(p_email)) > 0 THEN
    INSERT INTO public.contacts (email, name, phone, interest_roles, signed_up_at)
    VALUES (
      LOWER(TRIM(p_email)),
      TRIM(p_name),
      NULLIF(TRIM(COALESCE(p_phone, '')), ''),
      p_roles,
      NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      phone = EXCLUDED.phone,
      interest_roles = EXCLUDED.interest_roles,
      signed_up_at = EXCLUDED.signed_up_at,
      updated_at = NOW()
    RETURNING id INTO v_contact_id;
  ELSE
    INSERT INTO public.contacts (email, name, phone, interest_roles, signed_up_at)
    VALUES (
      NULL,
      TRIM(p_name),
      NULLIF(TRIM(COALESCE(p_phone, '')), ''),
      p_roles,
      NOW()
    )
    RETURNING id INTO v_contact_id;
  END IF;

  RETURN json_build_object('contact_id', v_contact_id, 'status', 'ok');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.upsert_contact_submission(TEXT, TEXT, TEXT, TEXT[]) TO anon;

CREATE TABLE public.contact_deliveries (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  roles TEXT[] NOT NULL DEFAULT '{}',
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'manual')),
  status TEXT NOT NULL CHECK (status IN ('sent', 'manual_follow_up', 'error')),
  recipient_email TEXT,
  recipient_phone TEXT,
  password_identifier TEXT,
  files_sent TEXT[] NOT NULL DEFAULT '{}',
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_deliveries_contact_id
  ON public.contact_deliveries (contact_id);

CREATE INDEX idx_contact_deliveries_status
  ON public.contact_deliveries (status);

ALTER TABLE public.contact_deliveries ENABLE ROW LEVEL SECURITY;

-- Contact submissions run through server actions that currently use the anon
-- Supabase client and existing anon contact insert/update policies.
CREATE POLICY "Allow anonymous insert on contact_deliveries"
  ON public.contact_deliveries
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE VIEW public.contact_delivery_log AS
SELECT
  d.id AS delivery_id,
  c.id AS contact_id,
  c.name,
  c.email,
  c.phone,
  COALESCE(d.roles, c.interest_roles, '{}') AS roles,
  d.delivery_method,
  d.status,
  d.files_sent,
  d.password_identifier,
  d.error,
  d.sent_at,
  d.created_at
FROM public.contact_deliveries d
JOIN public.contacts c ON c.id = d.contact_id
ORDER BY d.created_at DESC;
