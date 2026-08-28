-- Run this separately if hero slides should be image-only.
ALTER TABLE public.hero_slides
ALTER COLUMN title DROP NOT NULL;
