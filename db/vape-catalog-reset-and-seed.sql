-- Full store reset and vape catalog seed for the 25 photos provided on
-- 2026-10-06. This removes public store data and non-admin auth users while
-- preserving the schema and admin/super-admin accounts. All new products are
-- drafts with JOD 0.00 because no selling prices or inventory counts were
-- supplied. Set prices and stock before publishing.
-- Uploaded photos in media/vape-catalog/2026-10-06 are preserved.

BEGIN;

-- Reset every public table except profiles. Keeping profiles until auth.users
-- is cleaned preserves admin/super-admin accounts; customer profiles are
-- removed by the auth.users cascade below.
DO $reset$
DECLARE
  tables_to_clear text;
BEGIN
  SELECT string_agg(format('%I.%I', schemaname, tablename), ', ' ORDER BY tablename)
    INTO tables_to_clear
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename <> 'profiles';

  IF tables_to_clear IS NOT NULL THEN
    EXECUTE 'TRUNCATE TABLE ' || tables_to_clear;
  END IF;
END;
$reset$;

-- Remove customer accounts and orphaned non-admin auth users, retaining any
-- account that has an admin or super-admin profile.
DELETE FROM auth.users AS u
WHERE NOT EXISTS (
  SELECT 1
  FROM public.profiles AS p
  WHERE p.id = u.id
    AND p.role IN ('admin', 'super_admin')
);

INSERT INTO public.categories
  (name, name_ar, slug, slug_ar, description, description_ar, sort_order, is_active)
VALUES
  ('Vape Devices', 'أجهزة الفيب', 'vape-devices', 'اجهزة-الفيب', 'Disposable vape devices and related products.', 'أجهزة فيب ومنتجاتها.', 10, true);

INSERT INTO public.brands (name, slug, is_active)
VALUES
  ('OXBAR', 'oxbar', true),
  ('VOZOL', 'vozol', true),
  ('Crown Bar Al Fakher', 'crown-bar-al-fakher', true),
  ('Geek Bar', 'geek-bar', true),
  ('Mazaya', 'mazaya', true),
  ('Lost Mary', 'lost-mary', true),
  ('Al Nakhla', 'al-nakhla', true),
  ('HorizonTech', 'horizontech', true),
  ('OXVA', 'oxva', true);

WITH seed AS MATERIALIZED (
  SELECT *
  FROM jsonb_to_recordset($catalog$
  [
    {"slug":"oxbar-dualblend-50k","name":"OXBAR Dualblend 50K","brand_slug":"oxbar","flavor_group":"Flavor combination","flavors":["Mango Ice + Peach"],"photos":["16.29.33"]},
    {"slug":"vozol-gear-hookah-40000","name":"VOZOL Gear Hookah 40000","brand_slug":"vozol","flavor_group":"Flavor","flavors":["Cherry Cola","Berry Mint","Passion Fruit Lychee Orange"],"photos":["16.29.58"]},
    {"slug":"crown-bar-cloud-x-60k","name":"Crown Bar CloudX 60K","brand_slug":"crown-bar-al-fakher","flavor_group":"Flavor","flavors":["Grape","Strawberry Punch"],"photos":["16.31.26"]},
    {"slug":"geek-bar-ice-prince-50k","name":"Geek Bar Ice Prince 50K","brand_slug":"geek-bar","flavor_group":"Flavor","flavors":["Lemon Lime Ice","Grape Ice","Strawberry Kiwi Ice"],"photos":["16.30.44"]},
    {"slug":"mazaya-cloud-aura-50k","name":"Mazaya Cloud Aura 50K","brand_slug":"mazaya","flavor_group":"Flavor","flavors":["Lemon Mint","Two Apple Max"],"photos":["16.26.45","16.26.33"]},
    {"slug":"lost-mary-mt35000-turbo","name":"Lost Mary MT35000 Turbo","brand_slug":"lost-mary","flavor_group":"Flavor","flavors":["Mango Ice","Peach Mango","Watermelon Bubblegum","Strawberry Ice","Mango Peach Watermelon","Taro Ice Cream","Mixed Passion Fruit Guava"],"photos":["16.28.16","16.28.09"]},
    {"slug":"vozol-star-40000","name":"VOZOL Star 40000","brand_slug":"vozol","flavor_group":"Flavor","flavors":["Strawberry Ice","Strawberry Watermelon","Dragon Fruit Banana","Melon Gum"],"photos":["16.28.37"]},
    {"slug":"geek-bar-strazz-clr","name":"Geek Bar Strazz CLR","brand_slug":"geek-bar","flavor_group":"Flavor","flavors":[],"photos":["16.29.39","16.29.44"]},
    {"slug":"al-nakhla-30000","name":"Al Nakhla 30000","brand_slug":"al-nakhla","flavor_group":"Flavor","flavors":["Grape Ice"],"photos":["16.29.39"]},
    {"slug":"geek-bar-somax-80k","name":"Geek Bar Somax 80K","brand_slug":"geek-bar","flavor_group":"Flavor","flavors":["Black Grape","Grape Raspberry Ice","Juicy Peach Ice","Watermelon Ice","Grape Ice"],"photos":["16.29.44","16.26.33","16.26.32"]},
    {"slug":"crown-bar-e-hosex-60k","name":"Crown Bar E-HoseX 60K","brand_slug":"crown-bar-al-fakher","flavor_group":"Flavor","flavors":["Two Apple","Watermelon Pineapple","Watermelon Lime","Watermelon Kiwi"],"photos":["16.31.22"]},
    {"slug":"vozol-surge-vape-25k","name":"VOZOL Surge Vape 25K","brand_slug":"vozol","flavor_group":"Flavor","flavors":["Cool Mint"],"photos":["16.28.53"]},
    {"slug":"horizontech-100k-watermelon-slush","name":"HorizonTech 100K","brand_slug":"horizontech","flavor_group":"Flavor","flavors":["Watermelon Slush"],"photos":["16.28.53"]},
    {"slug":"geek-bar-burj-80k","name":"Geek Bar Burj 80K","brand_slug":"geek-bar","flavor_group":"Flavor","flavors":["Strawberry","Strawberry Watermelon","Strawberry Kiwi","Blue Razz"],"photos":["16.30.22"]},
    {"slug":"lost-mary-nera-fullview-70k","name":"Lost Mary Nera Fullview Kit 70K","brand_slug":"lost-mary","flavor_group":"Flavor combination","flavors":["Blue Razz Ice","Watermelon Ice + Watermelon Fcking Fab","Pink Lemonade + Pink & Blue","Pomegranate Blast","Scary Berry"],"photos":["16.25.02","16.25.06","16.24.51"]},
    {"slug":"geek-bar-pulse-x-25k","name":"Geek Bar Pulse X","brand_slug":"geek-bar","flavor_group":"Flavor","flavors":["Sour Mango Pineapple","Watermelon Ice","Grapefruit Refresher","Miami Mint"],"photos":["16.29.28"]},
    {"slug":"oxva-tasteflex-ultralock-50k","name":"OXVA Tasteflex UltraLock 50K","brand_slug":"oxva","flavor_group":"Flavor","flavors":["Strawberry Kiwi Guava","Mango","Blueberry Raspberry","Red Gummy Bears","Grape"],"photos":["16.23.16","16.26.32"]},
    {"slug":"crown-bar-megamax-40k","name":"Crown Bar MegaMax 40K","brand_slug":"crown-bar-al-fakher","flavor_group":"Flavor","flavors":["Lush Ice","Two Apple"],"photos":["16.27.23"]},
    {"slug":"vozol-nook-60000","name":"VOZOL Nook 60000","brand_slug":"vozol","flavor_group":"Flavor","flavors":["Strawberry Mango","Cherry Cola"],"photos":["16.31.49"]},
    {"slug":"vozol-rave-40000","name":"VOZOL Rave 40000","brand_slug":"vozol","flavor_group":"Flavor","flavors":["Strawberry Ice","Watermelon Ice","Blueberry Watermelon","Strawberry Watermelon","Strawberry Kiwi","Strawberry Mango","Peach Ice","Watermelon Bubblegum","Grape Ice","Peach Raspberry Lemonade","Strawberry Watermelon Peach"],"photos":["16.24.24","16.24.28"]},
    {"slug":"vozol-gear-ice-sweet-50k","name":"VOZOL Gear Ice & Sweet 50K","brand_slug":"vozol","flavor_group":"Flavor","flavors":["Blueberry Watermelon","Peach Ice","Strawberry Raspberry Cherry","Black Raspberry Smoothie","Mixed Berries","Watermelon Bubblegum","Gum Mint"],"photos":["16.27.18"]},
    {"slug":"crown-bar-hookah-mango-pineapple","name":"Crown Bar Al Fakher Hookah","brand_slug":"crown-bar-al-fakher","flavor_group":"Flavor","flavors":["Mango Pineapple"],"photos":["16.31.26"]}
  ]
  $catalog$::jsonb) AS p(
    slug text,
    name text,
    brand_slug text,
    flavor_group text,
    flavors jsonb,
    photos jsonb
  )
),
inserted_products AS (
  INSERT INTO public.products
    (category_id, brand_id, name, slug, base_price, currency, status, is_featured, tags)
  SELECT
    c.id,
    b.id,
    s.name,
    s.slug,
    0.00,
    'JOD',
    'draft',
    false,
    ARRAY['vape', 'nicotine']
  FROM seed AS s
  JOIN public.categories AS c ON c.slug = 'vape-devices'
  JOIN public.brands AS b ON b.slug = s.brand_slug
  RETURNING id, slug, name
),
inserted_groups AS (
  INSERT INTO public.product_option_groups
    (code, name, name_ar, description, description_ar, selection_type, is_active, sort_order)
  SELECT
    'flavor-' || p.slug,
    s.flavor_group,
    CASE WHEN s.flavor_group = 'Flavor combination' THEN 'خلطة النكهات' ELSE 'النكهة' END,
    'Choose one flavor shown on the package.',
    'اختر نكهة واحدة من النكهات الظاهرة على العبوة.',
    'radio',
    true,
    10
  FROM inserted_products AS p
  JOIN seed AS s ON s.slug = p.slug
  WHERE jsonb_array_length(s.flavors) > 0
  RETURNING id, code
),
inserted_items AS (
  INSERT INTO public.product_option_items
    (group_id, code, name, price_delta, stock_quantity, track_inventory, allow_backorder, is_default, is_active, sort_order)
  SELECT
    g.id,
    trim(both '-' from regexp_replace(lower(f.name), '[^a-z0-9]+', '-', 'g')),
    f.name,
    0.00,
    0,
    false,
    true,
    false,
    true,
    f.ordinality::integer * 10
  FROM inserted_groups AS g
  JOIN inserted_products AS p ON g.code = 'flavor-' || p.slug
  JOIN seed AS s ON s.slug = p.slug
  CROSS JOIN LATERAL jsonb_array_elements_text(s.flavors) WITH ORDINALITY AS f(name, ordinality)
  RETURNING id, group_id, sort_order
),
inserted_group_links AS (
  INSERT INTO public.product_option_group_links
    (product_id, option_group_id, is_required, min_selections, max_selections, sort_order, selection_type)
  SELECT p.id, g.id, true, 1, 1, 10, 'radio'
  FROM inserted_products AS p
  JOIN inserted_groups AS g ON g.code = 'flavor-' || p.slug
  RETURNING product_id, option_group_id
),
inserted_item_links AS (
  INSERT INTO public.product_option_item_links
    (product_id, option_group_id, option_item_id, sort_order)
  SELECT gl.product_id, gl.option_group_id, i.id, i.sort_order
  FROM inserted_group_links AS gl
  JOIN inserted_items AS i ON i.group_id = gl.option_group_id
  RETURNING product_id
),
photo_manifest AS (
  SELECT
    p.photo_code,
    'vape-catalog/2026-10-06/WhatsApp-Image-2026-10-06-at-' || p.photo_code || '.jpeg' AS storage_path
  FROM (VALUES
    ('16.23.16'), ('16.24.24'), ('16.24.28'), ('16.24.51'), ('16.25.02'),
    ('16.25.06'), ('16.26.32'), ('16.26.33'), ('16.26.45'), ('16.27.18'),
    ('16.27.23'), ('16.28.09'), ('16.28.16'), ('16.28.37'), ('16.28.53'),
    ('16.29.28'), ('16.29.33'), ('16.29.39'), ('16.29.44'), ('16.29.58'),
    ('16.30.22'), ('16.30.44'), ('16.31.22'), ('16.31.26'),
    ('16.31.49')
  ) AS p(photo_code)
),
photo_map AS (
  SELECT
    p.id AS product_id,
    p.name AS product_name,
    m.storage_path,
    row_number() OVER (PARTITION BY p.id ORDER BY m.storage_path) AS image_order
  FROM inserted_products AS p
  JOIN seed AS s ON s.slug = p.slug
  CROSS JOIN LATERAL jsonb_array_elements_text(s.photos) AS photo(photo_code)
  JOIN photo_manifest AS m ON m.photo_code = photo.photo_code
)
INSERT INTO public.product_images
  (product_id, image_url, alt_text, sort_order, is_primary)
SELECT
  product_id,
  'https://mazokskwwzvfrwozxepa.supabase.co/storage/v1/object/public/media/' || storage_path,
  product_name,
  (image_order - 1)::integer,
  image_order = 1
FROM photo_map;

COMMIT;

-- Flavor options above are the only add-ons visible in the supplied photos.
-- Products remain drafts until you set the real price and stock for each one.
SELECT
  (SELECT count(*) FROM public.products WHERE slug IN (
    'oxbar-dualblend-50k', 'vozol-gear-hookah-40000', 'crown-bar-cloud-x-60k',
    'geek-bar-ice-prince-50k', 'mazaya-cloud-aura-50k', 'lost-mary-mt35000-turbo',
    'vozol-star-40000', 'geek-bar-strazz-clr', 'al-nakhla-30000', 'geek-bar-somax-80k',
    'crown-bar-e-hosex-60k', 'vozol-surge-vape-25k', 'horizontech-100k-watermelon-slush',
    'geek-bar-burj-80k', 'lost-mary-nera-fullview-70k', 'geek-bar-pulse-x-25k',
    'oxva-tasteflex-ultralock-50k', 'crown-bar-megamax-40k', 'vozol-nook-60000',
    'vozol-rave-40000', 'vozol-gear-ice-sweet-50k', 'crown-bar-hookah-mango-pineapple'
  )) AS seeded_products,
  (SELECT count(*) FROM public.product_option_items AS i
   JOIN public.product_option_groups AS g ON g.id = i.group_id
   WHERE g.code LIKE 'flavor-%') AS flavor_options,
  (SELECT count(*) FROM public.product_images AS i
   JOIN public.products AS p ON p.id = i.product_id
   WHERE p.tags @> ARRAY['vape']) AS product_photo_links;
