-- Make the pronoun an explicit choice. Until someone picks he, she or they,
-- it is empty, and they are asked to choose before their first invitation
-- (src/lib/ratings/service.ts). Nobody had chosen "they" deliberately yet.
ALTER TABLE public.people ALTER COLUMN pronoun DROP NOT NULL;
ALTER TABLE public.people ALTER COLUMN pronoun DROP DEFAULT;
UPDATE public.people SET pronoun = NULL WHERE pronoun = 'they';
