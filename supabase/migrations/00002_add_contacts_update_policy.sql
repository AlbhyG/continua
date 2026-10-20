-- Add UPDATE policy for contacts table to support upsert (INSERT + UPDATE)
-- Required because Supabase upsert with onConflict needs UPDATE permission
-- when a matching record exists.
CREATE POLICY "Allow anonymous update on contacts for upsert"
  ON public.contacts
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
