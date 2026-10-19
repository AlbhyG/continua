-- Revocable share links for individual assessment results.
--
-- Previously a share link carried the scores inside the URL (base64 + HMAC),
-- so it could not be turned off and deleting the result did not affect it.
-- Now the link carries only a random token. The scores stay in quiz_results
-- and are looked up on every view, so:
--   * deleting the result (or the account that owns it) deletes its links
--     through ON DELETE CASCADE, and
--   * the owner can turn off every link for a result at any time.
--
-- Only a SHA-256 hash of each token is stored, so a copy of this table does
-- not reveal working links.

create table if not exists public.result_share_links (
  token_hash text primary key,
  result_id bigint not null references public.quiz_results(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists result_share_links_result_idx
  on public.result_share_links (result_id);

-- Server-side code only (service role bypasses RLS); no public policies.
alter table public.result_share_links enable row level security;

-- Deleting an account does not delete its results: quiz_results.user_id is
-- ON DELETE SET NULL (migration 00016). Without this trigger, links to those
-- results would keep working after the account was gone. When a result loses
-- its account, its share links are removed.
create or replace function public.remove_share_links_when_account_removed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.user_id is not null and new.user_id is null then
    delete from public.result_share_links where result_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists quiz_results_remove_share_links on public.quiz_results;
create trigger quiz_results_remove_share_links
  after update of user_id on public.quiz_results
  for each row
  execute function public.remove_share_links_when_account_removed();

revoke all on function public.remove_share_links_when_account_removed() from public, anon, authenticated;
