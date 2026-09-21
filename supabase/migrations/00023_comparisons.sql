-- Two-person comparison, modeled for N participants from the start.
--
-- A comparison is requested by one signed-in user (the initiator) for another
-- person identified by email. Nothing is computed or shown until the invited
-- person has accepted. Either accepted participant can end it at any time,
-- which removes it for both sides. Each participant compares the assessment
-- result they had chosen (currently their latest) when they joined.
--
-- Only the server-side service-role client reads or writes these tables
-- (see src/lib/comparison/service.ts). RLS is enabled with no policies, so
-- browser clients cannot read them directly, and there is no administrative
-- read path.

CREATE TABLE IF NOT EXISTS public.comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'declined', 'revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  ended_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.comparison_participants (
  comparison_id UUID NOT NULL REFERENCES public.comparisons(id) ON DELETE CASCADE,
  -- Normalized (lowercase) email the invitation was sent to.
  invited_email TEXT NOT NULL,
  -- Set when the person accepts (the initiator's is set at creation).
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- The result this participant is comparing. If it is deleted the comparison
  -- can no longer be shown (the participant has effectively withdrawn it).
  result_id BIGINT REFERENCES public.quiz_results(id) ON DELETE SET NULL,
  response TEXT NOT NULL DEFAULT 'invited'
    CHECK (response IN ('invited', 'accepted', 'declined')),
  responded_at TIMESTAMPTZ,
  PRIMARY KEY (comparison_id, invited_email)
);

CREATE INDEX IF NOT EXISTS comparison_participants_user_idx
  ON public.comparison_participants (user_id);
CREATE INDEX IF NOT EXISTS comparison_participants_email_idx
  ON public.comparison_participants (invited_email);

ALTER TABLE public.comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparison_participants ENABLE ROW LEVEL SECURITY;
