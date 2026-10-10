-- Publish the 22 vape products from the photo catalog at 15 JOD each.
-- The storefront only queries products whose status is 'active'.
BEGIN;

UPDATE public.products
SET status = 'active',
    base_price = 15.00,
    currency = 'JOD',
    updated_at = now()
WHERE slug IN (
  'oxbar-dualblend-50k', 'vozol-gear-hookah-40000', 'crown-bar-cloud-x-60k',
  'geek-bar-ice-prince-50k', 'mazaya-cloud-aura-50k', 'lost-mary-mt35000-turbo',
  'vozol-star-40000', 'geek-bar-strazz-clr', 'al-nakhla-30000', 'geek-bar-somax-80k',
  'crown-bar-e-hosex-60k', 'vozol-surge-vape-25k', 'horizontech-100k-watermelon-slush',
  'geek-bar-burj-80k', 'lost-mary-nera-fullview-70k', 'geek-bar-pulse-x-25k',
  'oxva-tasteflex-ultralock-50k', 'crown-bar-megamax-40k', 'vozol-nook-60000',
  'vozol-rave-40000', 'vozol-gear-ice-sweet-50k', 'crown-bar-hookah-mango-pineapple'
);

COMMIT;
