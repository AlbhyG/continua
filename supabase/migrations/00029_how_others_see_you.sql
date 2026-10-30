-- How Others See You: people who know someone rate them on the six axes.
--
-- The person being rated (the subject) invites raters by email. A rater signs
-- in with that email, answers the same questions the subject last answered
-- (written about the subject), may say "Can't tell" for any question, and
-- chooses to be named or anonymous. Anonymous ratings are shown only as an
-- average, and only once at least two anonymous ratings exist. Raters can
-- withdraw their rating; the subject can remove any rating. Unanswered
-- invitations are deleted after 30 days. Everything is deleted with either
-- person's account.
--
-- Only the server-side service-role client reads or writes these tables
-- (see src/lib/ratings/service.ts): RLS on, no policies.

-- Pronoun used when other people's questions are written about this person.
ALTER TABLE public.people
  ADD COLUMN IF NOT EXISTS pronoun TEXT NOT NULL DEFAULT 'they'
  CHECK (pronoun IN ('he', 'she', 'they'));

CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Normalized (lowercase) email the invitation was sent to.
  rater_email TEXT NOT NULL,
  -- Set when the rater submits.
  rater_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- The questionnaire the subject had last answered when the invitation was sent.
  questionnaire_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'submitted')),
  visibility TEXT CHECK (visibility IN ('named', 'anonymous')),
  -- One entry per question, 1-5, or 0 for "Can't tell".
  answers JSONB,
  -- Six axis scores, 1-10; an axis is null when too few questions were answered.
  scores JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ratings_subject_idx ON public.ratings (subject_user_id);
CREATE INDEX IF NOT EXISTS ratings_rater_email_idx ON public.ratings (rater_email);
CREATE INDEX IF NOT EXISTS ratings_rater_user_idx ON public.ratings (rater_user_id);

-- Daily invitation cap (account id and time only; entries older than a day are deleted).
CREATE TABLE IF NOT EXISTS public.rating_invite_log (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS rating_invite_log_user_idx
  ON public.rating_invite_log (user_id, sent_at);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_invite_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.ratings FROM anon, authenticated;
REVOKE ALL ON TABLE public.rating_invite_log FROM anon, authenticated;
GRANT ALL ON TABLE public.ratings TO service_role;
GRANT ALL ON TABLE public.rating_invite_log TO service_role;
