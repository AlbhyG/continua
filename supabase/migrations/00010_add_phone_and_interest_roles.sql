-- Add phone and interest_roles columns for the Get Started flow
ALTER TABLE public.contacts ADD COLUMN phone TEXT;
ALTER TABLE public.contacts ADD COLUMN interest_roles TEXT[];

-- Allow email to be null (phone-only signups)
ALTER TABLE public.contacts ALTER COLUMN email DROP NOT NULL;
