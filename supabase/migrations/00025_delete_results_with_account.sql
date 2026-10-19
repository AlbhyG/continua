-- Delete a person's assessment results when their account is deleted.
--
-- Until now quiz_results.user_id was ON DELETE SET NULL (migration 00016), so
-- deleting an account left its results behind with no owner. In practice most
-- were already removed, because a signed-in result also points at the owner's
-- "self" row in people, and people rows cascade when the account is deleted.
-- A result with a user_id but no person_id (for example, one claimed before
-- the self row existed) would still survive. Cascading on user_id closes that
-- gap, so account deletion removes every result linked to the account.
--
-- Share links for those results are removed by the existing ON DELETE CASCADE
-- on result_share_links.result_id (migration 00024). The 00024 trigger that
-- cleared links when user_id was set to null no longer fires on account
-- deletion, but is left in place because it is harmless.
--
-- Results taken without signing in and never attached to an account have no
-- user_id and are not affected.

do $$
declare
  v_constraint text;
begin
  select con.conname
  into v_constraint
  from pg_constraint con
  join pg_attribute att
    on att.attrelid = con.conrelid
   and att.attnum = any (con.conkey)
  where con.conrelid = 'public.quiz_results'::regclass
    and con.contype = 'f'
    and con.confrelid = 'auth.users'::regclass
    and att.attname = 'user_id';

  if v_constraint is not null then
    execute format('alter table public.quiz_results drop constraint %I', v_constraint);
  end if;
end;
$$;

alter table public.quiz_results
  add constraint quiz_results_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;
