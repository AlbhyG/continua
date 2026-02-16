-- Add verification token columns to contacts table
ALTER TABLE public.contacts
ADD COLUMN verification_token TEXT,
ADD COLUMN verification_token_expires_at TIMESTAMPTZ;

-- Unique constraint on verification_token to prevent collisions
ALTER TABLE public.contacts
ADD CONSTRAINT contacts_verification_token_unique UNIQUE (verification_token);

-- Partial index for fast token lookups (only indexes non-null tokens)
CREATE INDEX idx_contacts_verification_token
ON public.contacts (verification_token)
WHERE verification_token IS NOT NULL;

-- RLS SELECT policy for anon role to allow token lookup during verification
CREATE POLICY "Allow anonymous select by verification token"
  ON public.contacts
  FOR SELECT
  TO anon
  USING (verification_token IS NOT NULL);
