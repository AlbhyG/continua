-- How statements about a person read when other people describe them
-- ("How others see you"). The person chooses by example sentence on /others:
-- "Albhy treats his / her / their calendar as a commitment to himself /
-- herself / themselves." Null means not chosen yet, which reads as "they".
-- Only used to word the statements raters see; never shown anywhere else.
ALTER TABLE public.people
  ADD COLUMN IF NOT EXISTS pronoun TEXT
  CHECK (pronoun IS NULL OR pronoun IN ('he', 'she', 'they'));
