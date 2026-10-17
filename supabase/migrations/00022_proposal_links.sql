-- Per-recipient links to the book proposal, with a record of each open.
-- Proposal links reuse pdf_links (label = 'proposal', file_path = 'proposal.pdf')
-- and add who the link was made for and whether it has been turned off.

alter table public.pdf_links
  add column if not exists recipient text,
  add column if not exists note text,
  add column if not exists revoked_at timestamptz;

create table if not exists public.pdf_link_opens (
  id bigserial primary key,
  token text not null references public.pdf_links(token) on delete cascade,
  opened_at timestamptz not null default now(),
  user_agent text
);

create index if not exists pdf_link_opens_token_idx
  on public.pdf_link_opens (token, opened_at desc);

-- Server-side code only (service role bypasses RLS); no public policies.
alter table public.pdf_link_opens enable row level security;
