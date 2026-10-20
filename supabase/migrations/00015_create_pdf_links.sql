-- Short, unguessable tokens that map a book PDF to the password it should be
-- encrypted with on download. Served by the /d/[token] route, which streams the
-- password-protected PDF from the private `books` bucket.
create table if not exists public.pdf_links (
  token text primary key,
  file_path text not null,
  user_password text not null,
  label text,
  contact_id bigint,
  created_at timestamptz not null default now()
);

-- Only server-side code (service role, which bypasses RLS) reads or writes these
-- rows. Enabling RLS with no public policies prevents anon/auth clients from
-- enumerating or reading tokens.
alter table public.pdf_links enable row level security;
