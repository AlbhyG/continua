-- Comparisons are deleted, not kept, once they are over.
--
-- From this change, ending a comparison or declining an invitation deletes the
-- comparison and its participant rows (invited email, responses, which result
-- each person compared). Invitations left unanswered for 30 days are deleted
-- too. See src/lib/comparison/service.ts.
--
-- 1. A small log for the daily invitation cap. It holds only the sender's
--    account id and the time, and entries are deleted after a day. The cap
--    used to count rows in comparisons, which no longer works once ended
--    comparisons are deleted.
CREATE TABLE IF NOT EXISTS public.comparison_invite_log (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS comparison_invite_log_user_idx
  ON public.comparison_invite_log (user_id, sent_at);

-- Server-only, like the comparison tables: RLS on, no policies, and only the
-- service role has access.
ALTER TABLE public.comparison_invite_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.comparison_invite_log FROM anon, authenticated;
GRANT ALL ON TABLE public.comparison_invite_log TO service_role;

-- Carry over the last day's invitations so the cap stays correct today.
INSERT INTO public.comparison_invite_log (user_id, sent_at)
SELECT created_by, created_at
FROM public.comparisons
WHERE created_at > NOW() - INTERVAL '1 day';

-- 2. Delete what the old behavior kept: ended or declined comparisons, and
--    invitations unanswered for more than 30 days. Participant rows go with
--    them (ON DELETE CASCADE).
DELETE FROM public.comparisons WHERE status IN ('declined', 'revoked');
DELETE FROM public.comparisons
WHERE status = 'pending' AND created_at < NOW() - INTERVAL '30 days';

-- 3. A daily job for the same cleanup, so unanswered invitations are deleted
--    on time even if nobody visits the site. The app also runs this cleanup
--    whenever someone opens or sends a comparison. If pg_cron can't be enabled
--    here, this step is skipped with a notice and the rest still applies.
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
  PERFORM cron.schedule(
    'continua-expire-comparisons',
    '17 9 * * *',
    $job$
      DELETE FROM public.comparisons
      WHERE status = 'pending' AND created_at < NOW() - INTERVAL '30 days';
      DELETE FROM public.comparison_invite_log
      WHERE sent_at < NOW() - INTERVAL '1 day';
    $job$
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron not available (%); the app-side cleanup still runs.', SQLERRM;
END
$$;
