begin;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update
set public = true;

drop policy if exists "public_can_read_media_objects" on storage.objects;
create policy "public_can_read_media_objects"
on storage.objects
for select
to public
using (bucket_id = 'media');

drop policy if exists "admins_can_insert_media_objects" on storage.objects;
create policy "admins_can_insert_media_objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'media'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
      and coalesce(profiles.is_blocked, false) = false
  )
);

drop policy if exists "admins_can_update_media_objects" on storage.objects;
create policy "admins_can_update_media_objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'media'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
      and coalesce(profiles.is_blocked, false) = false
  )
)
with check (
  bucket_id = 'media'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
      and coalesce(profiles.is_blocked, false) = false
  )
);

drop policy if exists "admins_can_delete_media_objects" on storage.objects;
create policy "admins_can_delete_media_objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'media'
  and exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
      and coalesce(profiles.is_blocked, false) = false
  )
);

commit;
