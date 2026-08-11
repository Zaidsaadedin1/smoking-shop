create extension if not exists "pgcrypto";

create table if not exists public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  country_ar text,
  city text,
  city_ar text,
  fee numeric(10, 2) not null default 0,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint delivery_zones_fee_non_negative check (fee >= 0)
);

alter table public.delivery_zones
  add column if not exists country text,
  add column if not exists country_ar text,
  add column if not exists city text,
  add column if not exists city_ar text,
  add column if not exists fee numeric(10, 2) default 0,
  add column if not exists sort_order integer default 0,
  add column if not exists is_active boolean default true,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.delivery_zones
  alter column country set not null,
  alter column fee set not null,
  alter column sort_order set not null,
  alter column is_active set not null,
  alter column created_at set not null,
  alter column updated_at set not null;

alter table public.delivery_zones
  drop constraint if exists delivery_zones_fee_non_negative;

alter table public.delivery_zones
  add constraint delivery_zones_fee_non_negative check (fee >= 0);

create unique index if not exists delivery_zones_country_city_unique_idx
  on public.delivery_zones (lower(country), lower(coalesce(city, '')));

create index if not exists delivery_zones_active_sort_idx
  on public.delivery_zones (is_active, sort_order, country, city);

create or replace function public.set_delivery_zones_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists delivery_zones_set_updated_at on public.delivery_zones;
create trigger delivery_zones_set_updated_at
before update on public.delivery_zones
for each row
execute function public.set_delivery_zones_updated_at();

alter table public.delivery_zones enable row level security;

drop policy if exists "delivery_zones_public_read_active" on public.delivery_zones;
create policy "delivery_zones_public_read_active"
on public.delivery_zones
for select
using (is_active = true);

drop policy if exists "delivery_zones_admin_manage" on public.delivery_zones;
create policy "delivery_zones_admin_manage"
on public.delivery_zones
for all
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

insert into public.delivery_zones (
  country,
  country_ar,
  city,
  city_ar,
  fee,
  sort_order,
  is_active
)
values (
  'Jordan',
  'الأردن',
  null,
  null,
  2.00,
  0,
  true
)
on conflict (lower(country), lower(coalesce(city, '')))
do update set
  country_ar = excluded.country_ar,
  city_ar = excluded.city_ar,
  fee = excluded.fee,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.delivery_zones (
  country,
  country_ar,
  city,
  city_ar,
  fee,
  sort_order,
  is_active
)
values
  ('Jordan', 'الأردن', 'Amman', 'عمّان', 2.00, 10, true),
  ('Jordan', 'الأردن', 'Zarqa', 'الزرقاء', 2.00, 20, true),
  ('Jordan', 'الأردن', 'Irbid', 'إربد', 2.00, 30, true),
  ('Jordan', 'الأردن', 'Aqaba', 'العقبة', 2.00, 40, true),
  ('Jordan', 'الأردن', 'Salt', 'السلط', 2.00, 50, true),
  ('Jordan', 'الأردن', 'Madaba', 'مادبا', 2.00, 60, true),
  ('Jordan', 'الأردن', 'Jerash', 'جرش', 2.00, 70, true),
  ('Jordan', 'الأردن', 'Ajloun', 'عجلون', 2.00, 80, true),
  ('Jordan', 'الأردن', 'Mafraq', 'المفرق', 2.00, 90, true),
  ('Jordan', 'الأردن', 'Karak', 'الكرك', 2.00, 100, true),
  ('Jordan', 'الأردن', 'Tafilah', 'الطفيلة', 2.00, 110, true),
  ('Jordan', 'الأردن', 'Ma''an', 'معان', 2.00, 120, true)
on conflict (lower(country), lower(coalesce(city, '')))
do update set
  country_ar = excluded.country_ar,
  city_ar = excluded.city_ar,
  fee = excluded.fee,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();
