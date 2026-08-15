-- Shawerma 3a Saj navigation seed.
-- Run after db/navigation-items.sql, or after schema.sql if navigation_items already exists.

BEGIN;

WITH desired_parent_navigation (path, label, label_ar, sort_order) AS (
  VALUES
    ('/', 'Home', 'الرئيسية', 10),
    ('/shop', 'Menu', 'المنيو', 20),
    ('/shop?sort=featured', 'Best Sellers', 'الأكثر طلباً', 30),
    ('/about', 'About', 'عن المطعم', 40),
    ('/contact-us', 'Contact', 'تواصل معنا', 50)
)
UPDATE public.navigation_items n
SET
  parent_id = null,
  label = d.label,
  label_ar = d.label_ar,
  sort_order = d.sort_order,
  is_active = true,
  updated_at = now()
FROM desired_parent_navigation d
WHERE n.path = d.path;

WITH desired_parent_navigation (path, label, label_ar, sort_order) AS (
  VALUES
    ('/', 'Home', 'الرئيسية', 10),
    ('/shop', 'Menu', 'المنيو', 20),
    ('/shop?sort=featured', 'Best Sellers', 'الأكثر طلباً', 30),
    ('/about', 'About', 'عن المطعم', 40),
    ('/contact-us', 'Contact', 'تواصل معنا', 50)
)
INSERT INTO public.navigation_items
  (parent_id, label, label_ar, path, sort_order, is_active)
SELECT
  null,
  d.label,
  d.label_ar,
  d.path,
  d.sort_order,
  true
FROM desired_parent_navigation d
WHERE NOT EXISTS (
  SELECT 1
  FROM public.navigation_items n
  WHERE n.path = d.path
);

WITH desired_child_navigation (parent_path, path, label, label_ar, sort_order) AS (
  VALUES
    ('/shop', '/shop?category=sandwiches', 'Sandwiches', 'الساندويشات', 10),
    ('/shop', '/shop?category=classic-sandwiches', 'Classics', 'الكلاسيكيات', 20),
    ('/shop', '/shop?category=individual-meals', 'Individual Meals', 'الوجبات الفردية', 30),
    ('/shop', '/shop?category=family-meals', 'Family Meals', 'الوجبات العائلية', 40),
    ('/shop', '/shop?category=fatat-bowls', 'Fatat and Bowls', 'الفّتات', 50),
    ('/shop', '/shop?category=rice-meals', 'Rice Meals', 'الرز والشاورما', 60),
    ('/shop', '/shop?category=sides-add-ons', 'Sides and Add-ons', 'الإضافات', 70),
    ('/shop', '/shop?category=drinks', 'Drinks', 'المشروبات', 80)
),
parent_navigation AS (
  SELECT DISTINCT ON (path)
    id,
    path
  FROM public.navigation_items
  WHERE path IN (SELECT parent_path FROM desired_child_navigation)
  ORDER BY path, created_at
)
UPDATE public.navigation_items n
SET
  parent_id = p.id,
  label = d.label,
  label_ar = d.label_ar,
  sort_order = d.sort_order,
  is_active = true,
  updated_at = now()
FROM desired_child_navigation d
JOIN parent_navigation p ON p.path = d.parent_path
WHERE n.path = d.path;

WITH desired_child_navigation (parent_path, path, label, label_ar, sort_order) AS (
  VALUES
    ('/shop', '/shop?category=sandwiches', 'Sandwiches', 'الساندويشات', 10),
    ('/shop', '/shop?category=classic-sandwiches', 'Classics', 'الكلاسيكيات', 20),
    ('/shop', '/shop?category=individual-meals', 'Individual Meals', 'الوجبات الفردية', 30),
    ('/shop', '/shop?category=family-meals', 'Family Meals', 'الوجبات العائلية', 40),
    ('/shop', '/shop?category=fatat-bowls', 'Fatat and Bowls', 'الفّتات', 50),
    ('/shop', '/shop?category=rice-meals', 'Rice Meals', 'الرز والشاورما', 60),
    ('/shop', '/shop?category=sides-add-ons', 'Sides and Add-ons', 'الإضافات', 70),
    ('/shop', '/shop?category=drinks', 'Drinks', 'المشروبات', 80)
),
parent_navigation AS (
  SELECT DISTINCT ON (path)
    id,
    path
  FROM public.navigation_items
  WHERE path IN (SELECT parent_path FROM desired_child_navigation)
  ORDER BY path, created_at
)
INSERT INTO public.navigation_items
  (parent_id, label, label_ar, path, sort_order, is_active)
SELECT
  p.id,
  d.label,
  d.label_ar,
  d.path,
  d.sort_order,
  true
FROM desired_child_navigation d
JOIN parent_navigation p ON p.path = d.parent_path
WHERE NOT EXISTS (
  SELECT 1
  FROM public.navigation_items n
  WHERE n.path = d.path
);

COMMIT;
