-- Run after db/food-product-options.sql on existing installations.
ALTER TABLE public.product_option_groups
  DROP COLUMN IF EXISTS price_delta;

ALTER TABLE public.product_option_group_links
  ADD COLUMN IF NOT EXISTS selection_type text NOT NULL DEFAULT 'radio';

CREATE TABLE IF NOT EXISTS public.product_option_item_links (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  option_group_id uuid NOT NULL REFERENCES public.product_option_groups(id) ON DELETE CASCADE,
  option_item_id uuid NOT NULL REFERENCES public.product_option_items(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, option_group_id, option_item_id)
);

CREATE INDEX IF NOT EXISTS product_option_item_links_product_idx
  ON public.product_option_item_links(product_id);

ALTER TABLE public.product_option_item_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_option_item_links_admin ON public.product_option_item_links;
CREATE POLICY product_option_item_links_admin ON public.product_option_item_links
USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS product_option_item_links_read ON public.product_option_item_links;
CREATE POLICY product_option_item_links_read ON public.product_option_item_links
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_option_item_links.product_id AND p.status = 'active'
  ) OR public.is_admin()
);

GRANT ALL ON TABLE public.product_option_item_links TO anon, authenticated, service_role;

-- Starter option catalog. These rows can be edited later from Admin > Products > Options.
INSERT INTO public.product_option_groups
  (code, name, name_ar, description, description_ar, selection_type, is_active, sort_order)
VALUES
  ('sauce-choice', 'Sauce choice', 'اختيار الصوص', 'Choose a sauce.', 'اختر الصوص.', 'radio', true, 10),
  ('spice-level', 'Spice level', 'درجة الحرارة', 'Choose the spice level.', 'اختر درجة الحرارة.', 'radio', true, 20),
  ('shawerma-add-ons', 'Shawerma add-ons', 'إضافات الشاورما', 'Choose extra fillings and sides.', 'اختر الحشوات والجوانب الإضافية.', 'checkbox', true, 30)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  description = EXCLUDED.description,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Starter add-on catalog. Every add-on belongs to one option and has its own price.
INSERT INTO public.product_option_items
  (group_id, code, name, name_ar, price_delta, stock_quantity, track_inventory, allow_backorder, is_default, is_active, sort_order)
VALUES
  ((SELECT id FROM public.product_option_groups WHERE code = 'sauce-choice'), 'garlic', 'Garlic sauce', 'صوص الثوم', 0, 0, false, true, true, true, 10),
  ((SELECT id FROM public.product_option_groups WHERE code = 'sauce-choice'), 'tahini', 'Tahini sauce', 'صوص الطحينة', 0, 0, false, true, false, true, 20),
  ((SELECT id FROM public.product_option_groups WHERE code = 'sauce-choice'), 'spicy-garlic', 'Spicy garlic', 'ثوم حار', 0, 0, false, true, false, true, 30),
  ((SELECT id FROM public.product_option_groups WHERE code = 'spice-level'), 'regular', 'Regular', 'عادي', 0, 0, false, true, true, true, 10),
  ((SELECT id FROM public.product_option_groups WHERE code = 'spice-level'), 'spicy', 'Spicy', 'حار', 0, 0, false, true, false, true, 20),
  ((SELECT id FROM public.product_option_groups WHERE code = 'spice-level'), 'extra-spicy', 'Extra spicy', 'حار جداً', 0, 0, false, true, false, true, 30),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'extra-chicken', 'Extra chicken', 'دجاج إضافي', 1.00, 100, true, false, false, true, 10),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'extra-cheese', 'Extra cheese', 'جبنة إضافية', 0.50, 100, true, false, false, true, 20),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'garlic-fries', 'Garlic fries', 'بطاطا بالثوم', 1.25, 100, true, false, false, true, 30),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'pickles', 'Extra pickles', 'مخلل إضافي', 0.25, 100, true, false, false, true, 40),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'cheese', 'Cheese', 'جبنة', 0.25, 100, true, false, false, true, 50),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'pomegranate-molasses', 'Pomegranate molasses', 'دبس رمان', 0.25, 100, true, false, false, true, 60),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'extra-sauce', 'Extra sauce', 'صوص إضافي', 0.25, 100, true, false, false, true, 70),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'mixed-cheese', 'Mixed cheese', 'جبنة مكس', 0.35, 100, true, false, false, true, 80),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'mutawameh', 'Mutawameh', 'مثومة', 0.45, 100, true, false, false, true, 90),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'tabbouleh', 'Tabbouleh', 'تبولة', 0.45, 100, true, false, false, true, 100),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'jalapeno', 'Jalapeno', 'هالبينو', 0.40, 100, true, false, false, true, 110),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'hot-pepper', 'Hot pepper', 'فلفل حار', 0.35, 100, true, false, false, true, 120)
ON CONFLICT (group_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price_delta = EXCLUDED.price_delta,
  stock_quantity = EXCLUDED.stock_quantity,
  track_inventory = EXCLUDED.track_inventory,
  allow_backorder = EXCLUDED.allow_backorder,
  is_default = EXCLUDED.is_default,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Preserve the options currently visible on existing products.
INSERT INTO public.product_option_item_links (product_id, option_group_id, option_item_id, sort_order)
SELECT l.product_id, l.option_group_id, i.id, i.sort_order
FROM public.product_option_group_links l
JOIN public.product_option_items i ON i.group_id = l.option_group_id
ON CONFLICT DO NOTHING;
