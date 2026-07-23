-- Verification and quiz reads now go through server-side RPC/API handlers that
-- perform explicit token or account ownership checks. These legacy policies
-- exposed whole rows to direct anonymous PostgREST callers.

DROP POLICY IF EXISTS "Allow anonymous select by verification token"
  ON public.contacts;

DROP POLICY IF EXISTS "Anyone can read quiz users"
  ON public.quiz_users;

DROP POLICY IF EXISTS "Anyone can read quiz results"
  ON public.quiz_results;
