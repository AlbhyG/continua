-- Revocable share links for assessment results.
--
-- A share link used to carry the scores inside the URL and was checked only by
-- a signature, so it could not be turned off. Now the link holds only a random
-- token. Viewing a shared result looks the token up here, so a link stops
-- working the moment it is revoked or the result (or its account) is deleted.
--
-- Only the server-side service-role client reads or writes this table
-- (see src/lib/supabase/admin.ts). RLS is enabled with no policies, so anon and
-- signed-in browser clients cannot read it directly.

CREATE TABLE IF NOT EXISTS public.result_shares (
  token TEXT PRIMARY KEY,
  result_id BIGINT NOT NULL REFERENCES public.quiz_results(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS result_shares_result_id_idx
  ON public.result_shares (result_id);

ALTER TABLE public.result_shares ENABLE ROW LEVEL SECURITY;
