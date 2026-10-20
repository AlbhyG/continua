-- Fix: Replace functional unique index with column-level unique constraint
-- Supabase PostgREST's onConflict parameter requires a column name, not an expression.
-- LOWER(email) index can't be referenced by .upsert({ onConflict: 'email' }).
-- Safe because Zod transform lowercases all emails before database write.

-- Drop expression-based unique index
DROP INDEX IF EXISTS idx_contacts_email_unique;

-- Add standard unique constraint on email column (works with onConflict: 'email')
ALTER TABLE public.contacts ADD CONSTRAINT contacts_email_unique UNIQUE (email);

-- idx_contacts_email_lower (non-unique) remains for query performance
