-- Shawerma 3a Saj menu seed.
-- Run after db/food-product-options.sql.

BEGIN;

INSERT INTO public.brands
  (name, name_ar, slug, slug_ar, description, description_ar, is_active)
VALUES
  (
    'Shawerma 3a Saj',
    'شاورما ع ساج',
    'shawerma-3a-saj',
    'شاورما-ع-ساج',
    'World''s best shawerma menu.',
    'قائمة شاورما ع ساج.',
    true
  )
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  slug_ar = EXCLUDED.slug_ar,
  description = EXCLUDED.description,
  description_ar = EXCLUDED.description_ar,
  is_active = true;

INSERT INTO public.categories
  (name, name_ar, slug, slug_ar, description, description_ar, sort_order, is_active)
VALUES
  ('Sandwiches', 'الساندويشات', 'sandwiches', 'الساندويشات', 'Saj shawerma sandwiches and signature wraps.', 'ساندويشات الشاورما والصاج.', 10, true),
  ('Classic Sandwiches', 'الكلاسيكيات', 'classic-sandwiches', 'الكلاسيكيات', 'Small classic shawerma wraps.', 'ساندويشات كلاسيك صغيرة.', 20, true),
  ('Individual Meals', 'الوجبات الفردية', 'individual-meals', 'الوجبات-الفردية', 'Single meal boxes with shawerma, fries, sauces, and pickles.', 'وجبات فردية مع شاورما وبطاطا وصوص ومخلل.', 30, true),
  ('Family Meals', 'الوجبات العائلية', 'family-meals', 'الوجبات-العائلية', 'Sharing boxes for groups and families.', 'وجبات مشاركة للعائلة والمجموعات.', 40, true),
  ('Fatat and Bowls', 'الفّتات', 'fatat-bowls', 'الفّتات', 'Fatteh, hummus bowls, and kibbeh.', 'فتات وحمص وكبة.', 50, true),
  ('Rice Meals', 'الرز والشاورما', 'rice-meals', 'الرز-والشاورما', 'Rice topped with chicken shawerma.', 'رز مع شاورما الدجاج.', 60, true),
  ('Sides and Add-ons', 'الإضافات', 'sides-add-ons', 'الإضافات', 'Fries, salads, sauces, and extras.', 'بطاطا وسلطات وصوصات وإضافات.', 70, true),
  ('Drinks', 'المشروبات', 'drinks', 'المشروبات', 'Cold drinks.', 'مشروبات باردة.', 80, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  slug_ar = EXCLUDED.slug_ar,
  description = EXCLUDED.description,
  description_ar = EXCLUDED.description_ar,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

INSERT INTO public.sizes
  (code, name, name_ar, sort_order, is_active)
VALUES
  ('regular', 'Regular', 'عادي', 10, true),
  ('combo', 'Combo', 'كومبو', 20, true),
  ('small', 'Small', 'صغير', 30, true),
  ('large', 'Large', 'كبير', 40, true),
  ('chicken', 'Chicken', 'دجاج', 50, true),
  ('meat', 'Meat', 'لحمة', 60, true),
  ('mixed', 'Mixed', 'مكس', 70, true),
  ('double', 'Double', 'دبل', 80, true),
  ('triple', 'Triple', 'تربل', 90, true)
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

WITH menu_products (
  slug,
  slug_ar,
  category_slug,
  name,
  name_ar,
  short_description,
  short_description_ar,
  description,
  description_ar,
  base_price,
  compare_at_price,
  is_featured,
  sort_hint
) AS (
  VALUES
    ('world-champion-sandwich', 'ساندويش-بطل-العالم', 'sandwiches', 'World Champion Sandwich', 'ساندويش بطل العالم', 'Chicken shawerma with mayonnaise, garlic, pickles, fries, and coleslaw.', 'شرائح الدجاج المتبلة مع المايونيز والثوم والمخلل والبطاطا والكولسلو.', 'Signature Shawerma 3a Saj wrap shown as Batal Al Alam.', 'ساندويش شاورما ع ساج المميز بطل العالم.', 2.45, null, true, 10),
    ('chicken-saj-shawerma', 'شاورما-صاج-دجاج', 'sandwiches', 'Chicken Saj Shawerma', 'شاورما صاج دجاج', 'Chicken shawerma saj with garlic, mayonnaise, pickles, and crispy fries.', 'شاورما دجاج صاج مع الثوم والمايونيز والمخلل والبطاطا المقرمشة.', 'Main chicken saj shawerma sandwich from the menu.', 'ساندويش شاورما صاج دجاج من القائمة.', 1.80, null, true, 20),
    ('meat-saj-shawerma', 'شاورما-صاج-لحمة', 'sandwiches', 'Meat Saj Shawerma', 'شاورما صاج لحمة', 'Meat shawerma saj with tahini-style sauce, pickles, tomato, onion, and parsley.', 'شاورما لحمة صاج مع صوص الطحينة والمخلل والبندورة والبصل والبقدونس.', 'Main meat saj shawerma sandwich from the menu.', 'ساندويش شاورما صاج لحمة من القائمة.', 2.30, null, true, 30),
    ('ronaldo-rocket', 'صاروخ-رونالدو', 'sandwiches', 'Ronaldo Rocket', 'صاروخ رونالدو', 'Fries, kashkawan cheese, cheddar cheese, coleslaw, mayonnaise, and ketchup.', 'بطاطا مقلية وجبنة قشقوان وجبنة شيدر وكولسلو ومايونيز وكاتشب.', 'Football themed loaded saj wrap.', 'ساندويش صاروخ مستوحى من كرة القدم.', 1.95, null, false, 40),
    ('messi-rocket', 'صاروخ-ميسي', 'sandwiches', 'Messi Rocket', 'صاروخ ميسي', 'Fries, kashkawan cheese, cheddar, coleslaw, meat shawerma, mayonnaise, and black olives.', 'بطاطا مقلية وجبنة قشقوان وجبنة شيدر وكولسلو وشاورما لحمة ومايونيز وزيتون أسود.', 'Football themed loaded saj wrap.', 'ساندويش صاروخ مستوحى من كرة القدم.', 1.95, null, false, 50),
    ('classic-regular', 'كلاسيك-عادي', 'classic-sandwiches', 'Classic Regular', 'كلاسيك عادي', 'Chicken shawerma with mayonnaise, garlic, crispy fries, and pickles.', 'شرائح من شاورما الدجاج مع مايونيز وثوم وبطاطا مقرمشة ومخلل.', 'Classic 99 piasters regular wrap.', 'كلاسيك عادي بسعر 99 قرش.', 0.99, null, false, 60),
    ('classic-sweet', 'كلاسيك-حلو', 'classic-sandwiches', 'Classic Sweet', 'كلاسيك حلو', 'Chicken shawerma with mayonnaise, crispy fries, pomegranate molasses, lettuce, and pickles.', 'شرائح من شاورما الدجاج مع مايونيز وبطاطا وصوص الرمان والخس ومخلل.', 'Sweet classic wrap.', 'كلاسيك حلو.', 0.99, null, false, 70),
    ('classic-hot', 'كلاسيك-حار', 'classic-sandwiches', 'Classic Hot', 'كلاسيك حار', 'Chicken shawerma with mayonnaise, crispy fries, jalapeno, hot sauce, and pickles.', 'شرائح من شاورما الدجاج مع مايونيز وبطاطا وهالبينو وصوص حار ومخلل.', 'Hot classic wrap.', 'كلاسيك حار.', 0.99, null, false, 80),
    ('chicken-shawerma-rice', 'رز-وشاورما', 'rice-meals', 'Rice and Chicken Shawerma', 'رز وشاورما', 'Rice topped with chicken shawerma, tomato salad, and garlic sauce.', 'رز مع شاورما الدجاج وسلطة بندورة وصوص الثوم.', 'Rice and shawerma bowl available small or large.', 'رز وشاورما بحجم صغير أو كبير.', 2.20, null, false, 90),
    ('regular-meal', 'الوجبة-العادية', 'individual-meals', 'Regular Meal', 'الوجبة العادية', 'Individual shawerma meal with fries, pickles, and sauce.', 'وجبة شاورما فردية مع بطاطا ومخلل وصوص.', 'Regular individual meal.', 'الوجبة الفردية العادية.', 2.95, null, true, 100),
    ('super-meal', 'وجبة-سوبر', 'individual-meals', 'Super Meal', 'وجبة سوبر', 'Bigger individual shawerma meal with fries, pickles, and sauce.', 'وجبة شاورما أكبر مع بطاطا ومخلل وصوص.', 'Super individual meal.', 'وجبة سوبر فردية.', 3.70, null, false, 110),
    ('double-meal', 'وجبة-دبل', 'individual-meals', 'Double Meal', 'وجبة دبل', 'Double shawerma meal with fries, pickles, and sauce.', 'وجبة دبل شاورما مع بطاطا ومخلل وصوص.', 'Double individual meal.', 'وجبة دبل.', 4.45, null, false, 120),
    ('triple-meal', 'وجبة-تربل', 'individual-meals', 'Triple Meal', 'وجبة تربل', 'Triple shawerma meal with fries, pickles, and sauce.', 'وجبة تربل شاورما مع بطاطا ومخلل وصوص.', 'Triple individual meal.', 'وجبة تربل.', 6.00, null, false, 130),
    ('mixed-meal', 'وجبة-مكس', 'individual-meals', 'Mixed Meal', 'وجبة مكس', 'Mixed meal with chicken and meat shawerma.', 'وجبة مكس مع شاورما الدجاج واللحمة.', 'Mixed individual meal.', 'وجبة مكس فردية.', 4.95, null, false, 140),
    ('saving-meal', 'وجبة-التوفير', 'family-meals', 'Saving Meal', 'وجبة التوفير', 'Sharing box with mini shawerma pieces, fries, sauces, pickles, and salads.', 'بوكس مشاركة مع قطع شاورما وبطاطا وصوص ومخلل وسلطات.', 'Saving meal for groups.', 'وجبة التوفير للمشاركة.', 11.25, null, true, 150),
    ('family-meal', 'الوجبة-العائلية', 'family-meals', 'Family Meal', 'الوجبة العائلية', 'Large family box with mini shawerma pieces, fries, sauces, pickles, and salads.', 'بوكس عائلي كبير مع قطع شاورما وبطاطا وصوص ومخلل وسلطات.', 'Family sharing meal.', 'الوجبة العائلية.', 16.25, null, true, 160),
    ('chicken-fatteh', 'فتة-دجاج', 'fatat-bowls', 'Chicken Fatteh', 'فتة دجاج', 'Chicken shawerma fatteh with special sauce.', 'فتة شاورما دجاج مع صوص خاص.', 'Chicken fatteh bowl.', 'فتة دجاج.', 2.00, null, false, 170),
    ('meat-fatteh', 'فتة-لحمة', 'fatat-bowls', 'Meat Fatteh', 'فتة لحمة', 'Meat shawerma fatteh with special sauce.', 'فتة شاورما لحمة مع صوص خاص.', 'Meat fatteh bowl.', 'فتة لحمة.', 2.35, null, false, 180),
    ('hummus-chicken', 'حمص-دجاج', 'fatat-bowls', 'Hummus with Chicken', 'حمص دجاج', 'Hummus topped with chicken shawerma.', 'حمص مع شاورما الدجاج.', 'Hummus chicken bowl.', 'حمص دجاج.', 1.25, null, false, 190),
    ('hummus-meat', 'حمص-لحمة', 'fatat-bowls', 'Hummus with Meat', 'حمص لحمة', 'Hummus topped with meat shawerma.', 'حمص مع شاورما اللحمة.', 'Hummus meat bowl.', 'حمص لحمة.', 2.00, null, false, 200),
    ('kibbeh-box', 'كبة', 'fatat-bowls', 'Kibbeh Box', 'كبة', 'Crispy kibbeh pieces.', 'حبات كبة مقرمشة.', 'Kibbeh side box.', 'علبة كبة.', 1.15, null, false, 210),
    ('vegetable-box', 'علبة-الخضار', 'sides-add-ons', 'Vegetable Box', 'علبة الخضار', 'Fresh vegetable side box.', 'علبة خضار طازجة.', 'Fresh vegetable side.', 'إضافة خضار.', 0.35, null, false, 220),
    ('coleslaw-box', 'علبة-الكولسلو', 'sides-add-ons', 'Coleslaw Box', 'علبة الكولسلو', 'Creamy coleslaw side box.', 'علبة كولسلو.', 'Coleslaw side.', 'إضافة كولسلو.', 0.50, null, false, 230),
    ('fries-regular', 'بطاطا-عادي', 'sides-add-ons', 'Regular Fries', 'بطاطا عادي', 'Regular fries.', 'بطاطا عادي.', 'Fries side.', 'بطاطا.', 1.00, null, false, 240),
    ('fries-with-sauce', 'بطاطا-وصوص', 'sides-add-ons', 'Fries with Sauce', 'بطاطا وصوص', 'Fries served with sauce.', 'بطاطا مع صوص.', 'Fries and sauce side.', 'بطاطا وصوص.', 1.25, null, false, 250),
    ('large-fries', 'بطاطا-كبير', 'sides-add-ons', 'Large Fries', 'بطاطا كبير', 'Large fries box.', 'علبة بطاطا كبيرة.', 'Large fries side.', 'بطاطا كبير.', 1.50, null, false, 260),
    ('soft-drink', 'مشروب-غازي', 'drinks', 'Soft Drink', 'مشروب غازي', 'Can soft drink.', 'مشروب غازي.', 'Cold soft drink.', 'مشروب غازي بارد.', 0.50, null, false, 270),
    ('juice', 'عصير', 'drinks', 'Juice', 'عصير', 'Cold juice.', 'عصير بارد.', 'Cold juice.', 'عصير.', 0.50, null, false, 280),
    ('shanineh', 'شنينة', 'drinks', 'Shanineh', 'شنينة', 'Cold shanineh yogurt drink.', 'شنينة باردة.', 'Yogurt drink.', 'مشروب شنينة.', 0.45, null, false, 290)
)
INSERT INTO public.products
  (
    category_id,
    brand_id,
    name,
    name_ar,
    slug,
    slug_ar,
    short_description,
    short_description_ar,
    description,
    description_ar,
    base_price,
    compare_at_price,
    currency,
    status,
    is_featured,
    tags
  )
SELECT
  c.id,
  b.id,
  p.name,
  p.name_ar,
  p.slug,
  p.slug_ar,
  p.short_description,
  p.short_description_ar,
  p.description,
  p.description_ar,
  p.base_price::numeric,
  p.compare_at_price::numeric,
  'JOD',
  'active',
  p.is_featured,
  ARRAY['shawerma', 'saj', p.category_slug]
FROM menu_products p
JOIN public.categories c ON c.slug = p.category_slug
JOIN public.brands b ON b.slug = 'shawerma-3a-saj'
ON CONFLICT (slug) DO UPDATE
SET
  category_id = EXCLUDED.category_id,
  brand_id = EXCLUDED.brand_id,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  slug_ar = EXCLUDED.slug_ar,
  short_description = EXCLUDED.short_description,
  short_description_ar = EXCLUDED.short_description_ar,
  description = EXCLUDED.description,
  description_ar = EXCLUDED.description_ar,
  base_price = EXCLUDED.base_price,
  compare_at_price = EXCLUDED.compare_at_price,
  currency = EXCLUDED.currency,
  status = EXCLUDED.status,
  is_featured = EXCLUDED.is_featured,
  tags = EXCLUDED.tags,
  updated_at = now();

WITH menu_variants (product_slug, size_code, sku, price, stock_quantity, sort_order) AS (
  VALUES
    ('world-champion-sandwich', 'regular', 'S3S-WORLD-REG', 2.45, 100, 10),
    ('world-champion-sandwich', 'combo', 'S3S-WORLD-COMBO', 3.45, 100, 20),
    ('chicken-saj-shawerma', 'regular', 'S3S-CHICKEN-SAJ-REG', 1.80, 100, 30),
    ('meat-saj-shawerma', 'regular', 'S3S-MEAT-SAJ-REG', 2.30, 100, 40),
    ('ronaldo-rocket', 'regular', 'S3S-RONALDO-REG', 1.95, 100, 50),
    ('ronaldo-rocket', 'combo', 'S3S-RONALDO-COMBO', 2.95, 100, 60),
    ('messi-rocket', 'regular', 'S3S-MESSI-REG', 1.95, 100, 70),
    ('messi-rocket', 'combo', 'S3S-MESSI-COMBO', 2.95, 100, 80),
    ('classic-regular', 'regular', 'S3S-CLASSIC-REGULAR', 0.99, 100, 90),
    ('classic-sweet', 'regular', 'S3S-CLASSIC-SWEET', 0.99, 100, 100),
    ('classic-hot', 'regular', 'S3S-CLASSIC-HOT', 0.99, 100, 110),
    ('chicken-shawerma-rice', 'small', 'S3S-RICE-SMALL', 2.20, 100, 120),
    ('chicken-shawerma-rice', 'large', 'S3S-RICE-LARGE', 3.60, 100, 130),
    ('regular-meal', 'chicken', 'S3S-REG-MEAL-CHICKEN', 2.95, 100, 140),
    ('regular-meal', 'meat', 'S3S-REG-MEAL-MEAT', 3.50, 100, 150),
    ('super-meal', 'chicken', 'S3S-SUPER-MEAL-CHICKEN', 3.70, 100, 160),
    ('super-meal', 'meat', 'S3S-SUPER-MEAL-MEAT', 4.45, 100, 170),
    ('double-meal', 'chicken', 'S3S-DOUBLE-MEAL-CHICKEN', 4.45, 100, 180),
    ('double-meal', 'meat', 'S3S-DOUBLE-MEAL-MEAT', 5.45, 100, 190),
    ('triple-meal', 'chicken', 'S3S-TRIPLE-MEAL-CHICKEN', 6.00, 100, 200),
    ('triple-meal', 'meat', 'S3S-TRIPLE-MEAL-MEAT', 7.30, 100, 210),
    ('mixed-meal', 'double', 'S3S-MIXED-MEAL-DOUBLE', 4.95, 100, 220),
    ('mixed-meal', 'triple', 'S3S-MIXED-MEAL-TRIPLE', 6.50, 100, 230),
    ('saving-meal', 'chicken', 'S3S-SAVING-CHICKEN', 11.25, 50, 240),
    ('saving-meal', 'meat', 'S3S-SAVING-MEAT', 13.25, 50, 250),
    ('saving-meal', 'mixed', 'S3S-SAVING-MIXED', 12.25, 50, 260),
    ('family-meal', 'chicken', 'S3S-FAMILY-CHICKEN', 16.25, 50, 270),
    ('family-meal', 'meat', 'S3S-FAMILY-MEAT', 18.75, 50, 280),
    ('family-meal', 'mixed', 'S3S-FAMILY-MIXED', 17.75, 50, 290),
    ('chicken-fatteh', 'regular', 'S3S-FATTEH-CHICKEN', 2.00, 100, 300),
    ('meat-fatteh', 'regular', 'S3S-FATTEH-MEAT', 2.35, 100, 310),
    ('hummus-chicken', 'regular', 'S3S-HUMMUS-CHICKEN', 1.25, 100, 320),
    ('hummus-meat', 'regular', 'S3S-HUMMUS-MEAT', 2.00, 100, 330),
    ('kibbeh-box', 'regular', 'S3S-KIBBEH', 1.15, 100, 340),
    ('vegetable-box', 'regular', 'S3S-VEG-BOX', 0.35, 100, 350),
    ('coleslaw-box', 'regular', 'S3S-COLESLAW-BOX', 0.50, 100, 360),
    ('fries-regular', 'regular', 'S3S-FRIES-REG', 1.00, 100, 370),
    ('fries-with-sauce', 'regular', 'S3S-FRIES-SAUCE', 1.25, 100, 380),
    ('large-fries', 'large', 'S3S-FRIES-LARGE', 1.50, 100, 390),
    ('soft-drink', 'regular', 'S3S-DRINK-SOFT', 0.50, 100, 400),
    ('juice', 'regular', 'S3S-DRINK-JUICE', 0.50, 100, 410),
    ('shanineh', 'regular', 'S3S-DRINK-SHANINEH', 0.45, 100, 420)
)
INSERT INTO public.product_variants
  (
    product_id,
    size_id,
    color_id,
    sku,
    barcode,
    price,
    compare_at_price,
    stock_quantity,
    low_stock_threshold,
    track_inventory,
    allow_backorder,
    weight_grams,
    is_active
  )
SELECT
  p.id,
  s.id,
  null::uuid,
  v.sku,
  null::text,
  v.price::numeric,
  null::numeric,
  v.stock_quantity,
  5,
  true,
  false,
  300,
  true
FROM menu_variants v
JOIN public.products p ON p.slug = v.product_slug
JOIN public.sizes s ON s.code = v.size_code
ON CONFLICT (sku) DO UPDATE
SET
  product_id = EXCLUDED.product_id,
  size_id = EXCLUDED.size_id,
  color_id = null,
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  low_stock_threshold = EXCLUDED.low_stock_threshold,
  track_inventory = EXCLUDED.track_inventory,
  allow_backorder = EXCLUDED.allow_backorder,
  weight_grams = EXCLUDED.weight_grams,
  is_active = true,
  updated_at = now();

INSERT INTO public.product_option_items
  (group_id, code, name, name_ar, price_delta, stock_quantity, track_inventory, allow_backorder, is_default, sort_order)
VALUES
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'cheese', 'Cheese', 'جبنة', 0.25, 100, true, false, false, 50),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'pomegranate-molasses', 'Pomegranate molasses', 'دبس رمان', 0.25, 100, true, false, false, 60),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'extra-sauce', 'Extra sauce', 'صوص إضافي', 0.25, 100, true, false, false, 70),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'mixed-cheese', 'Mixed cheese', 'جبنة مكس', 0.35, 100, true, false, false, 80),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'mutawameh', 'Mutawameh', 'مثومة', 0.45, 100, true, false, false, 90),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'tabbouleh', 'Tabbouleh', 'تبولة', 0.45, 100, true, false, false, 100),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'jalapeno', 'Jalapeno', 'هالبينو', 0.40, 100, true, false, false, 110),
  ((SELECT id FROM public.product_option_groups WHERE code = 'shawerma-add-ons'), 'hot-pepper', 'Hot pepper', 'فلفل حار', 0.35, 100, true, false, false, 120)
ON CONFLICT (group_id, code) DO UPDATE
SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price_delta = EXCLUDED.price_delta,
  stock_quantity = EXCLUDED.stock_quantity,
  track_inventory = EXCLUDED.track_inventory,
  allow_backorder = EXCLUDED.allow_backorder,
  is_default = EXCLUDED.is_default,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

WITH attachable_products (slug, sort_order) AS (
  VALUES
    ('world-champion-sandwich', 10),
    ('chicken-saj-shawerma', 20),
    ('meat-saj-shawerma', 30),
    ('ronaldo-rocket', 40),
    ('messi-rocket', 50),
    ('classic-regular', 60),
    ('classic-sweet', 70),
    ('classic-hot', 80),
    ('regular-meal', 90),
    ('super-meal', 100),
    ('double-meal', 110),
    ('triple-meal', 120),
    ('mixed-meal', 130)
),
groups_to_attach (code, is_required, min_selections, max_selections, offset_order) AS (
  VALUES
    ('sauce-choice', true, 1, 1, 0),
    ('spice-level', false, 0, 1, 1),
    ('shawerma-add-ons', false, 0, null::integer, 2)
)
INSERT INTO public.product_option_group_links
  (product_id, option_group_id, is_required, min_selections, max_selections, sort_order)
SELECT
  p.id,
  g.id,
  gtl.is_required,
  gtl.min_selections,
  gtl.max_selections,
  ap.sort_order + gtl.offset_order
FROM attachable_products ap
JOIN public.products p ON p.slug = ap.slug
CROSS JOIN groups_to_attach gtl
JOIN public.product_option_groups g ON g.code = gtl.code
ON CONFLICT (product_id, option_group_id) DO UPDATE
SET
  is_required = EXCLUDED.is_required,
  min_selections = EXCLUDED.min_selections,
  max_selections = EXCLUDED.max_selections,
  sort_order = EXCLUDED.sort_order;

COMMIT;
