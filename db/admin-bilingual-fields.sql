BEGIN;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS slug_ar TEXT,
  ADD COLUMN IF NOT EXISTS description_ar TEXT;

ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS name_ar TEXT,
  ADD COLUMN IF NOT EXISTS slug_ar TEXT,
  ADD COLUMN IF NOT EXISTS description_ar TEXT;

ALTER TABLE public.sizes
  ADD COLUMN IF NOT EXISTS name_ar TEXT;

ALTER TABLE public.colors
  ADD COLUMN IF NOT EXISTS name_ar TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug_ar TEXT;

CREATE INDEX IF NOT EXISTS categories_slug_ar_idx
ON public.categories(slug_ar);

CREATE INDEX IF NOT EXISTS brands_slug_ar_idx
ON public.brands(slug_ar);

CREATE INDEX IF NOT EXISTS products_slug_ar_idx
ON public.products(slug_ar);

COMMIT;
