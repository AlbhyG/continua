-- Book downloads table: tracks when verified contacts download Book PDFs
CREATE TABLE public.book_downloads (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  book_type TEXT NOT NULL CHECK (book_type IN ('publishers', 'agents', 'therapists')),
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for lookups by contact
CREATE INDEX idx_book_downloads_contact_id ON public.book_downloads (contact_id);

-- Index for analytics queries by book type
CREATE INDEX idx_book_downloads_book_type ON public.book_downloads (book_type);

-- Enable Row Level Security
ALTER TABLE public.book_downloads ENABLE ROW LEVEL SECURITY;

-- RLS INSERT policy for anon role
-- The download Route Handler uses createClient() from @/lib/supabase/server which
-- uses NEXT_PUBLIC_SUPABASE_ANON_KEY (anon role, NOT service_role). Therefore RLS
-- policies are required for the Route Handler to log downloads. Without this policy,
-- INSERTs from the Route Handler will be silently rejected.
CREATE POLICY "Allow anonymous insert on book_downloads"
  ON public.book_downloads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- RLS SELECT policy for anon role on contacts table
-- Allows the download Route Handler to verify email_verified status after
-- verification has cleared the token. The existing SELECT policy only allows
-- reads WHERE verification_token IS NOT NULL, which won't work for verified
-- contacts (token is cleared on verification). This policy enables the anon
-- client to check email_verified for download authorization.
CREATE POLICY "Allow anonymous select on verified contacts"
  ON public.contacts
  FOR SELECT
  TO anon
  USING (email_verified = true);
