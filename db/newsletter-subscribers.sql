begin;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  locale text,
  created_at timestamptz not null default now()
);

create unique index if not exists newsletter_subscribers_email_lower_idx
on public.newsletter_subscribers (lower(email));

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "public_can_insert_newsletter_subscribers" on public.newsletter_subscribers;
create policy "public_can_insert_newsletter_subscribers"
on public.newsletter_subscribers
for insert
to anon, authenticated
with check (email is not null and length(trim(email)) > 3);

commit;
