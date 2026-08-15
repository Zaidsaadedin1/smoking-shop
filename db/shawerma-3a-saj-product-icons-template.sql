-- Shawerma 3a Saj product icon/image linker.
-- Upload images to Supabase Storage first, then replace the image_url values below.
-- This query updates by product slug and can be rerun safely.

BEGIN;

WITH product_icons (slug, image_url, alt_text, sort_order) AS (
  VALUES
    ('world-champion-sandwich', '', 'World Champion Sandwich', 0),
    ('chicken-saj-shawerma', '', 'Chicken Saj Shawerma', 0),
    ('meat-saj-shawerma', '', 'Meat Saj Shawerma', 0),
    ('ronaldo-rocket', '', 'Ronaldo Rocket', 0),
    ('messi-rocket', '', 'Messi Rocket', 0),
    ('classic-regular', '', 'Classic Regular', 0),
    ('classic-sweet', '', 'Classic Sweet', 0),
    ('classic-hot', '', 'Classic Hot', 0),
    ('chicken-shawerma-rice', '', 'Rice and Chicken Shawerma', 0),
    ('regular-meal', '', 'Regular Meal', 0),
    ('super-meal', '', 'Super Meal', 0),
    ('double-meal', '', 'Double Meal', 0),
    ('triple-meal', '', 'Triple Meal', 0),
    ('mixed-meal', '', 'Mixed Meal', 0),
    ('saving-meal', '', 'Saving Meal', 0),
    ('family-meal', '', 'Family Meal', 0),
    ('chicken-fatteh', '', 'Chicken Fatteh', 0),
    ('meat-fatteh', '', 'Meat Fatteh', 0),
    ('hummus-chicken', '', 'Hummus with Chicken', 0),
    ('hummus-meat', '', 'Hummus with Meat', 0),
    ('kibbeh-box', '', 'Kibbeh Box', 0),
    ('vegetable-box', '', 'Vegetable Box', 0),
    ('coleslaw-box', '', 'Coleslaw Box', 0),
    ('fries-regular', '', 'Regular Fries', 0),
    ('fries-with-sauce', '', 'Fries with Sauce', 0),
    ('large-fries', '', 'Large Fries', 0),
    ('soft-drink', '', 'Soft Drink', 0),
    ('juice', '', 'Juice', 0),
    ('shanineh', '', 'Shanineh', 0)
),
clean_icons AS (
  SELECT
    slug,
    nullif(trim(image_url), '') AS image_url,
    alt_text,
    sort_order
  FROM product_icons
),
target_icons AS (
  SELECT
    p.id AS product_id,
    c.image_url,
    c.alt_text,
    c.sort_order
  FROM clean_icons c
  JOIN public.products p ON p.slug = c.slug
  WHERE c.image_url IS NOT NULL
),
deleted_old_primary_icons AS (
  DELETE FROM public.product_images pi
  USING target_icons ti
  WHERE pi.product_id = ti.product_id
    AND pi.sort_order = ti.sort_order
  RETURNING pi.id
)
INSERT INTO public.product_images
  (product_id, image_url, alt_text, sort_order, is_primary)
SELECT
  product_id,
  image_url,
  alt_text,
  sort_order,
  sort_order = 0
FROM target_icons;

COMMIT;
