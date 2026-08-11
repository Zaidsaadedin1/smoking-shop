begin;

create or replace function public.current_user_is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  claims jsonb;
  jwt_role text;
  admin_allowed boolean;
begin
  claims := auth.jwt();
  jwt_role := coalesce(
    claims ->> 'user_role',
    claims -> 'app_metadata' ->> 'role',
    claims -> 'user_metadata' ->> 'role'
  );

  if jwt_role in ('admin', 'super_admin') then
    return true;
  end if;

  if to_regclass('public.profiles') is null then
    return false;
  end if;

  execute $sql$
    select exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('admin', 'super_admin')
        and coalesce(is_blocked, false) = false
    )
  $sql$
  into admin_allowed;

  return coalesce(admin_allowed, false);
end;
$$;

revoke all on function public.current_user_is_admin() from public;
grant execute on function public.current_user_is_admin() to anon, authenticated;

commit;
