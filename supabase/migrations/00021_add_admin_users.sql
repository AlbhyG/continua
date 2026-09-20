-- Replace the shared ADMIN_CONTACTS_PASSWORD gate with real per-account admin
-- access, tied to individual Supabase Auth identities instead of one secret
-- everyone with the password shares. Only the server-only service-role client
-- (see src/lib/supabase/admin.ts) ever reads this table, so no authenticated
-- or anon RLS policies are needed -- a signed-in user cannot query it
-- directly from the client.

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Seed the initial admins by email. Run this block once after applying the
-- migration, with the two real Continua sign-in addresses filled in -- these
-- users must already have signed in at least once (so a matching auth.users
-- row exists) before this insert will find them.
--
-- INSERT INTO public.admin_users (user_id, email)
-- SELECT id, LOWER(email) FROM auth.users
-- WHERE LOWER(email) IN ('albhy@example.com', 'jason@example.com')
-- ON CONFLICT (user_id) DO NOTHING;
