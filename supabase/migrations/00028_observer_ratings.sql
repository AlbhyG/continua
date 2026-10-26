-- "How others see you": ratings of a person by people who know them.
--
-- A signed-in person (the subject) invites someone by email to answer the
-- assessment about them. Only the subject can start this: nobody can be rated
-- without having asked. The rater needs no account; the emailed link carries a
-- random token, and only its SHA-256 hash is stored here.
--
-- The rater chooses, before submitting, whether the subject sees their name
-- with their ratings or only as part of an anonymous average. For an anonymous
-- rating the invited email is cleared on submission, so nothing links the
-- rating to the address. The subject only ever sees per-axis scores, never
-- item answers, and anonymous ratings are only shown once there are at least
-- two of them (src/lib/observer/view.ts).
--
-- Unanswered invitations are deleted after 30 days. Submitted ratings are
-- kept until the subject deletes them, the rater withdraws (same link), or the
-- subject's account is deleted.
--
-- Only the server-side service-role client reads or writes these tables (see
-- src/lib/observer/service.ts). RLS is on with no policies, like the
-- comparison tables, so browser clients cannot read them.

CREATE TABLE IF NOT EXISTS public.observer_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- The questionnaire the rater answers: the one behind the subject's latest
  -- result when the invitation was made, so both describe the same items.
  questionnaire_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  -- Cleared when an anonymous rating is submitted.
  invited_email TEXT,
  status TEXT NOT NULL DEFAULT 'invited'
    CHECK (status IN ('invited', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Filled in when the rater submits.
  is_named BOOLEAN,
  rater_name TEXT CHECK (rater_name IS NULL OR char_length(rater_name) <= 60),
  relationship TEXT CHECK (relationship IS NULL OR relationship IN
    ('partner', 'family', 'friend', 'coworker', 'other')),
  known_for TEXT CHECK (known_for IS NULL OR known_for IN
    ('under_1', '1_to_5', '5_to_15', 'over_15')),
  -- One entry per item, in questionnaire order: 1 to 5 as in the self
  -- assessment, or 0 for "Can't tell". Kept for research on the items;
  -- never shown to the subject.
  answers SMALLINT[],
  -- Per-axis score on the 1 to 10 scale, or null where too few items were
  -- answered to score that axis.
  scores JSONB,
  -- Whether the rater agreed to their answers being used, without name or
  -- email, in research on how people see each other.
  research_consent BOOLEAN NOT NULL DEFAULT FALSE,

  CHECK (status = 'invited' OR (is_named IS NOT NULL AND answers IS NOT NULL AND scores IS NOT NULL)),
  CHECK (is_named IS NOT TRUE OR rater_name IS NOT NULL),
  CHECK (is_named IS NOT FALSE OR (rater_name IS NULL AND invited_email IS NULL))
);

CREATE INDEX IF NOT EXISTS observer_ratings_subject_idx
  ON public.observer_ratings (subject_user_id, status);

-- Daily invitation cap, counted separately because deleted invitations would
-- otherwise free up the cap (same approach as comparison_invite_log).
CREATE TABLE IF NOT EXISTS public.observer_invite_log (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS observer_invite_log_user_idx
  ON public.observer_invite_log (user_id, sent_at);

ALTER TABLE public.observer_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observer_invite_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.observer_ratings FROM anon, authenticated;
REVOKE ALL ON TABLE public.observer_invite_log FROM anon, authenticated;
GRANT ALL ON TABLE public.observer_ratings TO service_role;
GRANT ALL ON TABLE public.observer_invite_log TO service_role;

-- Daily cleanup of unanswered invitations and old cap entries, using pg_cron
-- (already enabled by migration 00027). The app also runs this cleanup
-- whenever the feature is used, so nothing depends on the job. Written without
-- a nested DO $$ block because the Supabase SQL editor can't parse one.
SELECT cron.schedule(
  'continua-expire-observer-invites',
  '23 9 * * *',
  $$
    DELETE FROM public.observer_ratings
    WHERE status = 'invited' AND created_at < NOW() - INTERVAL '30 days';
    DELETE FROM public.observer_invite_log
    WHERE sent_at < NOW() - INTERVAL '1 day';
  $$
);
