-- Raters now choose named or anonymous on the first screen, before answering,
-- and confirm (or change) that choice at the end. This records what they
-- chose first, for research on whether people switch after answering. It is
-- never shown to the person being rated.
ALTER TABLE public.observer_ratings
  ADD COLUMN IF NOT EXISTS initial_is_named BOOLEAN;
