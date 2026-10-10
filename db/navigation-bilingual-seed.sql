-- Bilingual storefront navigation for routes that exist in app/.
-- This query only disables/re-seeds navigation_items; it does not touch products,
-- categories, customers, orders, settings, or Storage.

BEGIN;

-- Start with a clean active menu while retaining old navigation rows for rollback.
UPDATE public.navigation_items
SET is_active = false,
    updated_at = now()
WHERE is_active = true;

WITH desired_root (path, label, label_ar, sort_order) AS (
  VALUES
    ('/', 'Home', 'الرئيسية', 10),
    ('/shop', 'Shop', 'المتجر', 20),
    ('/brands', 'Brands', 'العلامات التجارية', 30),
    ('/about', 'About', 'من نحن', 40)
),
ranked_existing AS (
  SELECT
    n.id,
    d.label,
    d.label_ar,
    d.path,
    d.sort_order,
    row_number() OVER (PARTITION BY d.path ORDER BY n.created_at, n.id) AS row_number
  FROM public.navigation_items AS n
  JOIN desired_root AS d ON d.path = n.path
)
UPDATE public.navigation_items AS n
SET parent_id = null,
    label = r.label,
    label_ar = r.label_ar,
    path = r.path,
    sort_order = r.sort_order,
    is_active = (r.row_number = 1),
    updated_at = now()
FROM ranked_existing AS r
WHERE n.id = r.id;

WITH desired_root (path, label, label_ar, sort_order) AS (
  VALUES
    ('/', 'Home', 'الرئيسية', 10),
    ('/shop', 'Shop', 'المتجر', 20),
    ('/brands', 'Brands', 'العلامات التجارية', 30),
    ('/about', 'About', 'من نحن', 40)
)
INSERT INTO public.navigation_items
  (parent_id, label, label_ar, path, sort_order, is_active)
SELECT null, d.label, d.label_ar, d.path, d.sort_order, true
FROM desired_root AS d
WHERE NOT EXISTS (
  SELECT 1
  FROM public.navigation_items AS n
  WHERE n.path = d.path AND n.is_active = true
);

WITH desired_child (parent_path, path, label, label_ar, sort_order) AS (
  VALUES
    ('/shop', '/category/vape-devices', 'Vape Devices', 'أجهزة الفيب', 10),
    ('/shop', '/shop/new-arrivals', 'New Arrivals', 'وصل حديثاً', 20),
    ('/about', '/contact-us', 'Contact Us', 'اتصل بنا', 10),
    ('/about', '/faq', 'FAQ', 'الأسئلة الشائعة', 20),
    ('/about', '/shipping', 'Shipping', 'الشحن والتوصيل', 30),
    ('/about', '/returns', 'Returns', 'الاسترجاع والاستبدال', 40)
),
ranked_existing AS (
  SELECT
    n.id,
    p.id AS desired_parent_id,
    d.label,
    d.label_ar,
    d.path,
    d.sort_order,
    row_number() OVER (PARTITION BY d.path ORDER BY n.created_at, n.id) AS row_number
  FROM public.navigation_items AS n
  JOIN desired_child AS d ON d.path = n.path
  JOIN public.navigation_items AS p ON p.path = d.parent_path AND p.is_active = true
)
UPDATE public.navigation_items AS n
SET parent_id = r.desired_parent_id,
    label = r.label,
    label_ar = r.label_ar,
    path = r.path,
    sort_order = r.sort_order,
    is_active = (r.row_number = 1),
    updated_at = now()
FROM ranked_existing AS r
WHERE n.id = r.id;

WITH desired_child (parent_path, path, label, label_ar, sort_order) AS (
  VALUES
    ('/shop', '/category/vape-devices', 'Vape Devices', 'أجهزة الفيب', 10),
    ('/shop', '/shop/new-arrivals', 'New Arrivals', 'وصل حديثاً', 20),
    ('/about', '/contact-us', 'Contact Us', 'اتصل بنا', 10),
    ('/about', '/faq', 'FAQ', 'الأسئلة الشائعة', 20),
    ('/about', '/shipping', 'Shipping', 'الشحن والتوصيل', 30),
    ('/about', '/returns', 'Returns', 'الاسترجاع والاستبدال', 40)
)
INSERT INTO public.navigation_items
  (parent_id, label, label_ar, path, sort_order, is_active)
SELECT p.id, d.label, d.label_ar, d.path, d.sort_order, true
FROM desired_child AS d
JOIN public.navigation_items AS p ON p.path = d.parent_path AND p.is_active = true
WHERE NOT EXISTS (
  SELECT 1
  FROM public.navigation_items AS n
  WHERE n.path = d.path AND n.is_active = true
);

COMMIT;

SELECT parent.label AS parent_label,
       parent.label_ar AS parent_label_ar,
       child.label AS child_label,
       child.label_ar AS child_label_ar,
       child.path,
       child.sort_order
FROM public.navigation_items AS child
LEFT JOIN public.navigation_items AS parent ON parent.id = child.parent_id
WHERE child.is_active = true
ORDER BY coalesce(parent.sort_order, child.sort_order), child.sort_order;
