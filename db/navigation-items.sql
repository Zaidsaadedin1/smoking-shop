begin;

create extension if not exists pgcrypto;

create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.navigation_items(id) on delete cascade,
  label text not null,
  label_ar text,
  path text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists navigation_items_parent_sort_idx
on public.navigation_items(parent_id, sort_order, created_at);

create or replace function public.set_navigation_item_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_navigation_item_updated_at on public.navigation_items;
create trigger set_navigation_item_updated_at
before update on public.navigation_items
for each row
execute function public.set_navigation_item_updated_at();

alter table public.navigation_items enable row level security;

drop policy if exists "public_can_read_active_navigation_items" on public.navigation_items;
create policy "public_can_read_active_navigation_items"
on public.navigation_items
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "admins_can_read_all_navigation_items" on public.navigation_items;
create policy "admins_can_read_all_navigation_items"
on public.navigation_items
for select
to authenticated
using (public.current_user_is_admin());

drop policy if exists "admins_can_insert_navigation_items" on public.navigation_items;
create policy "admins_can_insert_navigation_items"
on public.navigation_items
for insert
to authenticated
with check (public.current_user_is_admin());

drop policy if exists "admins_can_update_navigation_items" on public.navigation_items;
create policy "admins_can_update_navigation_items"
on public.navigation_items
for update
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "admins_can_delete_navigation_items" on public.navigation_items;
create policy "admins_can_delete_navigation_items"
on public.navigation_items
for delete
to authenticated
using (public.current_user_is_admin());

commit;
