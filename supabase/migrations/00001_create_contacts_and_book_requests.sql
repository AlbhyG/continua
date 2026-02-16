-- Contacts table: shared record for notification signups and Book requesters
CREATE TABLE public.contacts (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  signed_up_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case-insensitive unique constraint on email
CREATE UNIQUE INDEX idx_contacts_email_unique ON public.contacts (LOWER(email));

-- Index for email lookups (used by RLS policies and application queries)
CREATE INDEX idx_contacts_email_lower ON public.contacts (LOWER(email));

-- Book requests table: tracks which Book type was requested
CREATE TABLE public.book_requests (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  book_type TEXT NOT NULL CHECK (book_type IN ('publishers', 'agents', 'therapists')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for lookups by contact
CREATE INDEX idx_book_requests_contact_id ON public.book_requests (contact_id);

-- Enable Row Level Security on both tables
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow anonymous inserts only (phases 6-8 will use service role for reads/updates)
-- Anonymous users can submit their contact info (notification signup)
CREATE POLICY "Allow anonymous insert on contacts"
  ON public.contacts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anonymous users can submit Book requests
CREATE POLICY "Allow anonymous insert on book_requests"
  ON public.book_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Note: No SELECT/UPDATE/DELETE policies for anon role.
-- Server-side operations (email verification, PDF download auth) will use
-- the service_role key which bypasses RLS entirely.
-- If authenticated user policies are needed later, add them in a future migration.
