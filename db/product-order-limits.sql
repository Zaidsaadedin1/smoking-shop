-- Product-level maximum quantity allowed in a single order.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS max_order_quantity integer NOT NULL DEFAULT 5;

ALTER TABLE public.products
  ALTER COLUMN max_order_quantity SET DEFAULT 5;

ALTER TABLE public.product_variants
  ALTER COLUMN stock_quantity SET DEFAULT 10;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_max_order_quantity_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_max_order_quantity_check
  CHECK (max_order_quantity >= 1);
