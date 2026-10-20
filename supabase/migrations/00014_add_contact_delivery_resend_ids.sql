-- Store provider IDs so accepted emails can be traced in Resend.
ALTER TABLE public.contact_deliveries
ADD COLUMN IF NOT EXISTS resend_email_id TEXT,
ADD COLUMN IF NOT EXISTS resend_notification_id TEXT;

DROP VIEW IF EXISTS public.contact_delivery_log;

CREATE OR REPLACE VIEW public.contact_delivery_log AS
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
  d.resend_email_id,
  d.resend_notification_id,
  d.error,
  d.sent_at,
  d.created_at
FROM public.contact_deliveries d
JOIN public.contacts c ON c.id = d.contact_id
ORDER BY d.created_at DESC;
