begin;

create extension if not exists pgcrypto;

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10, 2) not null check (discount_value >= 0),
  min_subtotal numeric(10, 2),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coupons_date_range_check check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

alter table public.coupons
  add column if not exists code text,
  add column if not exists name text,
  add column if not exists description text,
  add column if not exists discount_type text,
  add column if not exists discount_value numeric(10, 2),
  add column if not exists min_subtotal numeric(10, 2),
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists is_active boolean default true,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.coupons
set
  code = coalesce(code, id::text),
  name = coalesce(name, code, id::text),
  description = coalesce(description, null),
  discount_type = coalesce(discount_type, 'fixed'),
  discount_value = coalesce(discount_value, 0),
  is_active = coalesce(is_active, true),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now());

alter table public.coupons
  alter column code set not null,
  alter column name set not null,
  alter column discount_type set not null,
  alter column discount_value set not null,
  alter column is_active set not null,
  alter column created_at set not null,
  alter column updated_at set not null,
  alter column is_active set default true,
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table public.coupons
  drop constraint if exists coupons_discount_type_check,
  add constraint coupons_discount_type_check check (discount_type in ('percentage', 'fixed')),
  drop constraint if exists coupons_discount_value_check,
  add constraint coupons_discount_value_check check (discount_value >= 0),
  drop constraint if exists coupons_date_range_check,
  add constraint coupons_date_range_check check (ends_at is null or starts_at is null or ends_at >= starts_at);

create unique index if not exists coupons_code_upper_idx
on public.coupons (upper(code));

create index if not exists coupons_is_active_idx
on public.coupons (is_active, starts_at, ends_at);

create or replace function public.set_coupon_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_coupon_updated_at on public.coupons;
create trigger set_coupon_updated_at
before update on public.coupons
for each row
execute function public.set_coupon_updated_at();

alter table public.coupons enable row level security;

drop policy if exists "public_can_read_active_coupons" on public.coupons;
create policy "public_can_read_active_coupons"
on public.coupons
for select
to anon, authenticated
using (
  is_active = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

drop policy if exists "admins_can_read_all_coupons" on public.coupons;
create policy "admins_can_read_all_coupons"
on public.coupons
for select
to authenticated
using (public.current_user_is_admin());

drop policy if exists "admins_can_insert_coupons" on public.coupons;
create policy "admins_can_insert_coupons"
on public.coupons
for insert
to authenticated
with check (public.current_user_is_admin());

drop policy if exists "admins_can_update_coupons" on public.coupons;
create policy "admins_can_update_coupons"
on public.coupons
for update
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "admins_can_delete_coupons" on public.coupons;
create policy "admins_can_delete_coupons"
on public.coupons
for delete
to authenticated
using (public.current_user_is_admin());

commit;
