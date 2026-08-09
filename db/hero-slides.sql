create extension if not exists pgcrypto;

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  eyebrow text,
  eyebrow_ar text,
  title text not null,
  title_ar text,
  description text,
  description_ar text,
  button_text text,
  button_text_ar text,
  button_url text,
  image_en_url text,
  image_ar_url text,
  display_seconds integer not null default 6 check (display_seconds >= 2),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists hero_slides_sort_order_idx on public.hero_slides (sort_order asc, created_at asc);

alter table public.hero_slides enable row level security;

drop policy if exists "public_can_read_active_hero_slides" on public.hero_slides;
create policy "public_can_read_active_hero_slides"
on public.hero_slides
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "admins_can_read_all_hero_slides" on public.hero_slides;
create policy "admins_can_read_all_hero_slides"
on public.hero_slides
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
      and coalesce(profiles.is_blocked, false) = false
  )
);

drop policy if exists "admins_can_insert_hero_slides" on public.hero_slides;
create policy "admins_can_insert_hero_slides"
on public.hero_slides
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
      and coalesce(profiles.is_blocked, false) = false
  )
);

drop policy if exists "admins_can_update_hero_slides" on public.hero_slides;
create policy "admins_can_update_hero_slides"
on public.hero_slides
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
      and coalesce(profiles.is_blocked, false) = false
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
      and coalesce(profiles.is_blocked, false) = false
  )
);

drop policy if exists "admins_can_delete_hero_slides" on public.hero_slides;
create policy "admins_can_delete_hero_slides"
on public.hero_slides
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
      and coalesce(profiles.is_blocked, false) = false
  )
);
