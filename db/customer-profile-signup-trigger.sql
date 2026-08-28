CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles
  (
    id,
    full_name,
    phone
  )
  VALUES
  (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    COALESCE(
      NULLIF(NEW.phone, ''),
      NEW.raw_user_meta_data->>'phone'
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill users who registered before the trigger was installed.
INSERT INTO public.profiles (id, full_name, phone)
SELECT
  users.id,
  COALESCE(users.raw_user_meta_data->>'full_name', users.raw_user_meta_data->>'name'),
  COALESCE(NULLIF(users.phone, ''), users.raw_user_meta_data->>'phone')
FROM auth.users AS users
LEFT JOIN public.profiles AS profiles ON profiles.id = users.id
WHERE profiles.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Fallback for signups that return a session before the auth trigger is present.
DROP POLICY IF EXISTS profiles_insert_self ON public.profiles;

CREATE POLICY profiles_insert_self
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  id = auth.uid()
  AND role = 'customer'
  AND COALESCE(is_blocked, false) = false
);
