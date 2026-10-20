-- Explicit Data API grants for every table in public.
--
-- From Oct 30, 2026, Supabase no longer auto-grants API access to newly
-- created tables in public. Production already has these grants, so this
-- migration is a no-op there. It exists so that rebuilt databases (a new
-- project, preview branches, `supabase db reset`) end up with the same
-- access production has today.
--
-- These match Supabase's previous default grants. Row Level Security
-- policies still decide which rows each role can see or change.

grant all on table
  public.contacts,
  public.book_requests,
  public.book_downloads,
  public.quiz_users,
  public.quiz_results,
  public.contact_deliveries,
  public.pdf_links,
  public.pdf_link_opens,
  public.people,
  public.groups,
  public.group_members,
  public.comparisons,
  public.comparison_participants,
  public.result_share_links
to anon, authenticated, service_role;

-- Rate-limit table: server-only on purpose (see 00019, which revokes
-- anon/authenticated). Keep it that way.
grant all on table public.contact_inquiry_limits to service_role;
