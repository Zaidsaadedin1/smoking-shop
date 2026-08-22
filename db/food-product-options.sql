CREATE TABLE IF NOT EXISTS public.product_option_groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  name_ar text,
  description text,
  description_ar text,
  selection_type text NOT NULL DEFAULT 'checkbox',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_option_groups_selection_type_check
    CHECK (selection_type IN ('radio', 'checkbox'))
);

CREATE TABLE IF NOT EXISTS public.product_option_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.product_option_groups(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  name_ar text,
  image_url text,
  price_delta numeric(12,2) NOT NULL DEFAULT 0,
  stock_quantity integer NOT NULL DEFAULT 0,
  track_inventory boolean NOT NULL DEFAULT false,
  allow_backorder boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_option_items_price_delta_check CHECK (price_delta >= 0),
  CONSTRAINT product_option_items_stock_quantity_check CHECK (stock_quantity >= 0),
  CONSTRAINT product_option_items_group_code_key UNIQUE (group_id, code)
);

ALTER TABLE public.product_option_items
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS track_inventory boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_backorder boolean NOT NULL DEFAULT true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'product_option_items_stock_quantity_check'
      AND conrelid = 'public.product_option_items'::regclass
  ) THEN
    ALTER TABLE public.product_option_items
      ADD CONSTRAINT product_option_items_stock_quantity_check CHECK (stock_quantity >= 0);
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.product_option_group_links (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  option_group_id uuid NOT NULL REFERENCES public.product_option_groups(id) ON DELETE CASCADE,
  selection_type text NOT NULL DEFAULT 'radio',
  is_required boolean NOT NULL DEFAULT false,
  min_selections integer,
  max_selections integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, option_group_id),
  CONSTRAINT product_option_group_links_min_check
    CHECK (min_selections IS NULL OR min_selections >= 0),
  CONSTRAINT product_option_group_links_max_check
    CHECK (max_selections IS NULL OR max_selections >= 1),
  CONSTRAINT product_option_group_links_range_check
    CHECK (
      min_selections IS NULL
      OR max_selections IS NULL
      OR min_selections <= max_selections
    )
);

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

CREATE INDEX IF NOT EXISTS product_option_items_group_idx
  ON public.product_option_items(group_id);

CREATE INDEX IF NOT EXISTS product_option_group_links_product_idx
  ON public.product_option_group_links(product_id);

ALTER TABLE public.product_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_group_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_item_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_option_groups_admin ON public.product_option_groups;
CREATE POLICY product_option_groups_admin
ON public.product_option_groups
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS product_option_groups_read ON public.product_option_groups;
CREATE POLICY product_option_groups_read
ON public.product_option_groups
FOR SELECT
USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS product_option_items_admin ON public.product_option_items;
CREATE POLICY product_option_items_admin
ON public.product_option_items
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS product_option_items_read ON public.product_option_items;
CREATE POLICY product_option_items_read
ON public.product_option_items
FOR SELECT
USING (
  is_active = true
  AND EXISTS (
    SELECT 1
    FROM public.product_option_groups g
    WHERE g.id = product_option_items.group_id
      AND g.is_active = true
  )
  OR public.is_admin()
);

DROP POLICY IF EXISTS product_option_group_links_admin ON public.product_option_group_links;
CREATE POLICY product_option_group_links_admin
ON public.product_option_group_links
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS product_option_group_links_read ON public.product_option_group_links;
CREATE POLICY product_option_group_links_read
ON public.product_option_group_links
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = product_option_group_links.product_id
      AND p.status = 'active'
  )
  OR public.is_admin()
);

DROP POLICY IF EXISTS product_option_item_links_admin ON public.product_option_item_links;
CREATE POLICY product_option_item_links_admin
ON public.product_option_item_links
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS product_option_item_links_read ON public.product_option_item_links;
CREATE POLICY product_option_item_links_read
ON public.product_option_item_links
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_option_item_links.product_id AND p.status = 'active'
  ) OR public.is_admin()
);

GRANT ALL ON TABLE public.product_option_groups TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.product_option_items TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.product_option_group_links TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.product_option_item_links TO anon, authenticated, service_role;

INSERT INTO public.product_option_groups
  (code, name, name_ar, description, description_ar, selection_type, sort_order)
VALUES
  ('sauce-choice', 'Sauce choice', 'اختيار الصوص', 'Choose one main sauce.', 'اختر صوصاً رئيسياً واحداً.', 'radio', 10),
  ('spice-level', 'Spice level', 'درجة الحرارة', 'Choose the spice level.', 'اختر درجة الحرارة.', 'radio', 20),
  ('shawerma-add-ons', 'Shawerma add-ons', 'إضافات الشاورما', 'Add extra sides or fillings.', 'أضف جوانب أو حشوات إضافية.', 'checkbox', 30)
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  description = EXCLUDED.description,
  description_ar = EXCLUDED.description_ar,
  selection_type = EXCLUDED.selection_type,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

INSERT INTO public.product_option_items
  (group_id, code, name, name_ar, image_url, price_delta, stock_quantity, track_inventory, allow_backorder, is_default, sort_order)
VALUES
  ((SELECT id FROM public.product_option_groups WHERE code = 'sauce-choice'), 'garlic', 'Garlic sauce', 'صوص الثوم', null, 0, 0, false, true, true, 10),
  ((SELECT id FROM public.product_option_groups WHERE code = 'sauce-choice'), 'tahini', 'Tahini sauce', 'صوص الطحينة', null, 0, 0, false, true, false, 20),
  ((SELECT id FROM public.product_option_groups WHERE code = 'sauce-choice'), 'spicy-garlic', 'Spicy garlic', 'ثوم حار', null, 0, 0, false, true, false, 30),
  ((SELECT id FROM public.product_option_groups WHERE code = 'spice-level'), 'regular', 'Regular', 'عادي', null, 0, 0, false, true, true, 10),
  ((SELECT id FROM public.product_option_groups WHERE code = 'spice-level'), 'spicy', 'Spicy', 'حار', null, 0, 0, false, true, false, 20),
  ((SELECT id FROM public.product_option_groups WHERE code = 'spice-level'), 'extra-spicy', 'Extra spicy', 'حار جداً', null, 0, 0, false, true, false, 30),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'extra-chicken', 'Extra chicken', 'دجاج إضافي', null, 1.00, 50, true, false, false, 10),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'extra-cheese', 'Extra cheese', 'جبنة إضافية', null, 0.50, 50, true, false, false, 20),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'garlic-fries', 'Garlic fries', 'بطاطا بالثوم', null, 1.25, 50, true, false, false, 30),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'pickles', 'Extra pickles', 'مخلل إضافي', null, 0.25, 50, true, false, false, 40)
ON CONFLICT (group_id, code) DO UPDATE
SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  image_url = COALESCE(EXCLUDED.image_url, public.product_option_items.image_url),
  price_delta = EXCLUDED.price_delta,
  stock_quantity = EXCLUDED.stock_quantity,
  track_inventory = EXCLUDED.track_inventory,
  allow_backorder = EXCLUDED.allow_backorder,
  is_default = EXCLUDED.is_default,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
