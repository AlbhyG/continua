-- Create a private storage bucket for Book PDFs.
-- Files are served through the Route Handler (which validates email verification),
-- not directly from storage URLs.

INSERT INTO storage.buckets (id, name, public)
VALUES ('books', 'books', false)
ON CONFLICT (id) DO NOTHING;

-- Allow the anon role to download files from the books bucket.
-- The Route Handler uses the anon-key client (createClient from @/lib/supabase/server),
-- so it needs this policy to call storage.from('books').download().
CREATE POLICY "Allow anon download from books bucket"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'books');
