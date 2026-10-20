-- Add real user accounts, editable profiles, people, groups, and ownership-aware
-- assessment results. Supabase Auth remains the identity provider; public
-- contacts continue to support the existing Contact Me flow.

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_user_id_unique
  ON public.contacts (user_id)
  WHERE user_id IS NOT NULL;

-- The original anonymous update policy was only needed by an early direct
-- upsert implementation. Current public writes use SECURITY DEFINER RPCs, and
-- leaving this policy in place would let anonymous callers update all contacts.
DROP POLICY IF EXISTS "Allow anonymous update on contacts for upsert"
  ON public.contacts;

DROP POLICY IF EXISTS "Allow anonymous insert on contacts"
  ON public.contacts;

CREATE POLICY "Allow anonymous contact signup"
  ON public.contacts
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Users can read their contact profile"
  ON public.contacts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their contact profile"
  ON public.contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND LOWER(email) = LOWER(auth.jwt() ->> 'email')
  );

CREATE POLICY "Users can update their contact profile"
  ON public.contacts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND LOWER(email) = LOWER(auth.jwt() ->> 'email')
  );

-- Public Contact Me submissions may refresh an unclaimed CRM contact, but they
-- must not overwrite the profile fields of an authenticated account that
-- happens to use the submitted email address.
CREATE OR REPLACE FUNCTION public.upsert_contact_submission(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_roles TEXT[]
) RETURNS JSON AS $$
DECLARE
  v_contact_id BIGINT;
BEGIN
  IF p_email IS NOT NULL AND LENGTH(TRIM(p_email)) > 0 THEN
    INSERT INTO public.contacts (email, name, phone, interest_roles, signed_up_at)
    VALUES (
      LOWER(TRIM(p_email)),
      TRIM(p_name),
      NULLIF(TRIM(COALESCE(p_phone, '')), ''),
      p_roles,
      NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
      name = CASE
        WHEN contacts.user_id IS NULL THEN EXCLUDED.name
        ELSE contacts.name
      END,
      phone = CASE
        WHEN contacts.user_id IS NULL THEN EXCLUDED.phone
        ELSE contacts.phone
      END,
      interest_roles = CASE
        WHEN contacts.user_id IS NULL THEN EXCLUDED.interest_roles
        ELSE contacts.interest_roles
      END,
      signed_up_at = EXCLUDED.signed_up_at,
      updated_at = NOW()
    RETURNING id INTO v_contact_id;
  ELSE
    INSERT INTO public.contacts (email, name, phone, interest_roles, signed_up_at)
    VALUES (
      NULL,
      TRIM(p_name),
      NULLIF(TRIM(COALESCE(p_phone, '')), ''),
      p_roles,
      NOW()
    )
    RETURNING id INTO v_contact_id;
  END IF;

  RETURN json_build_object('contact_id', v_contact_id, 'status', 'ok');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.upsert_contact_submission(TEXT, TEXT, TEXT, TEXT[])
  TO anon;

-- The legacy download handler now uses the server-only service role. Removing
-- these policies prevents anonymous callers from enumerating verified contacts,
-- inserting fake download logs, or fetching private book files directly.
DROP POLICY IF EXISTS "Allow anonymous select on verified contacts"
  ON public.contacts;

DROP POLICY IF EXISTS "Allow anonymous insert on book_downloads"
  ON public.book_downloads;

DROP POLICY IF EXISTS "Allow anon download from books bucket"
  ON storage.objects;

CREATE TABLE IF NOT EXISTS public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (LENGTH(TRIM(name)) BETWEEN 1 AND 100),
  email TEXT,
  is_self BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_people_one_self_per_owner
  ON public.people (owner_user_id)
  WHERE is_self = TRUE;

CREATE INDEX IF NOT EXISTS idx_people_owner
  ON public.people (owner_user_id);

ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own people"
  ON public.people
  FOR ALL
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (LENGTH(TRIM(name)) BETWEEN 1 AND 100),
  kind TEXT NOT NULL CHECK (kind IN ('family', 'friend', 'team', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groups_owner
  ON public.groups (owner_user_id);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own groups"
  ON public.groups
  FOR ALL
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.group_members (
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, person_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_person
  ON public.group_members (person_id);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read members of their groups"
  ON public.group_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.groups
      WHERE groups.id = group_members.group_id
        AND groups.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users add members to their groups"
  ON public.group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.groups
      WHERE groups.id = group_members.group_id
        AND groups.owner_user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.people
      WHERE people.id = group_members.person_id
        AND people.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Users remove members from their groups"
  ON public.group_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.groups
      WHERE groups.id = group_members.group_id
        AND groups.owner_user_id = auth.uid()
    )
  );

ALTER TABLE public.quiz_results
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS person_id UUID REFERENCES public.people(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_quiz_results_user
  ON public.quiz_results (user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_results_person_taken
  ON public.quiz_results (person_id, taken_at DESC);

DROP POLICY IF EXISTS "Anyone can insert quiz results"
  ON public.quiz_results;

CREATE POLICY "Anonymous users can insert anonymous quiz results"
  ON public.quiz_results
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL AND person_id IS NULL);

CREATE POLICY "Users can insert owned quiz results"
  ON public.quiz_results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      person_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.people
        WHERE people.id = quiz_results.person_id
          AND people.owner_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can read their quiz results"
  ON public.quiz_results
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create quiz identity"
  ON public.quiz_users
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can read quiz identity"
  ON public.quiz_users
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Keep a CRM contact and a "You" person in sync with every auth identity.
CREATE OR REPLACE FUNCTION public.ensure_current_user_records()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_email TEXT := LOWER(auth.jwt() ->> 'email');
  v_name TEXT := COALESCE(
    NULLIF(TRIM(auth.jwt() -> 'user_metadata' ->> 'name'), ''),
    NULLIF(TRIM(auth.jwt() -> 'user_metadata' ->> 'full_name'), ''),
    SPLIT_PART(LOWER(auth.jwt() ->> 'email'), '@', 1)
  );
  v_contact_id BIGINT;
  v_person_id UUID;
BEGIN
  IF v_user_id IS NULL OR v_email IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.contacts (
    email,
    name,
    user_id,
    email_verified,
    signed_up_at
  )
  VALUES (
    v_email,
    v_name,
    v_user_id,
    TRUE,
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    email_verified = TRUE,
    updated_at = NOW()
  WHERE contacts.user_id IS NULL OR contacts.user_id = EXCLUDED.user_id
  RETURNING id INTO v_contact_id;

  IF v_contact_id IS NULL THEN
    SELECT id
    INTO v_contact_id
    FROM public.contacts
    WHERE user_id = v_user_id;
  END IF;

  INSERT INTO public.people (owner_user_id, name, email, is_self)
  VALUES (v_user_id, v_name, v_email, TRUE)
  ON CONFLICT (owner_user_id) WHERE is_self = TRUE
  DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW()
  RETURNING id INTO v_person_id;

  RETURN json_build_object(
    'contact_id', v_contact_id,
    'person_id', v_person_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_current_user_records() TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_anonymous_quiz_results(p_token TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_person_id UUID;
  v_count INTEGER;
BEGIN
  IF v_user_id IS NULL OR p_token IS NULL OR LENGTH(TRIM(p_token)) < 20 THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT id
  INTO v_person_id
  FROM public.people
  WHERE owner_user_id = v_user_id
    AND is_self = TRUE;

  UPDATE public.quiz_results
  SET
    user_id = v_user_id,
    person_id = COALESCE(person_id, v_person_id)
  WHERE anonymous_token = p_token
    AND user_id IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_anonymous_quiz_results(TEXT)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''),
    SPLIT_PART(LOWER(NEW.email), '@', 1)
  );
BEGIN
  IF NEW.email IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.contacts (
    email,
    name,
    user_id,
    email_verified,
    signed_up_at
  )
  VALUES (
    LOWER(NEW.email),
    v_name,
    NEW.id,
    NEW.email_confirmed_at IS NOT NULL,
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    email_verified = EXCLUDED.email_verified,
    updated_at = NOW()
  WHERE contacts.user_id IS NULL OR contacts.user_id = EXCLUDED.user_id;

  INSERT INTO public.people (owner_user_id, name, email, is_self)
  VALUES (NEW.id, v_name, LOWER(NEW.email), TRUE)
  ON CONFLICT (owner_user_id) WHERE is_self = TRUE
  DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email, email_confirmed_at
  ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- Backfill records for any users who already authenticated before this
-- migration was installed.
INSERT INTO public.contacts (
  email,
  name,
  user_id,
  email_verified,
  signed_up_at
)
SELECT
  LOWER(users.email),
  COALESCE(
    NULLIF(TRIM(users.raw_user_meta_data ->> 'name'), ''),
    NULLIF(TRIM(users.raw_user_meta_data ->> 'full_name'), ''),
    SPLIT_PART(LOWER(users.email), '@', 1)
  ),
  users.id,
  users.email_confirmed_at IS NOT NULL,
  COALESCE(users.created_at, NOW())
FROM auth.users
WHERE users.email IS NOT NULL
ON CONFLICT (email) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  email_verified = EXCLUDED.email_verified,
  updated_at = NOW()
WHERE contacts.user_id IS NULL OR contacts.user_id = EXCLUDED.user_id;

INSERT INTO public.people (owner_user_id, name, email, is_self)
SELECT
  users.id,
  COALESCE(
    NULLIF(TRIM(users.raw_user_meta_data ->> 'name'), ''),
    NULLIF(TRIM(users.raw_user_meta_data ->> 'full_name'), ''),
    SPLIT_PART(LOWER(users.email), '@', 1)
  ),
  LOWER(users.email),
  TRUE
FROM auth.users
WHERE users.email IS NOT NULL
ON CONFLICT (owner_user_id) WHERE is_self = TRUE
DO NOTHING;
