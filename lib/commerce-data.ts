import {
  CouponDefinition,
  FlashSale,
  NavigationItem,
  StoreCategory,
  StoreProduct,
  StoreSettings,
} from '@/lib/commerce-types';

export const storeSettings: StoreSettings = {
  announcement: 'DELIVERY ACROSS JORDAN 🇯🇴  •  NEW DROP AVAILABLE NOW',
  brandName: 'Tourmaline Coven',
  supportEmail: 'orders@tourmalinecoven.com',
  supportPhone: '+962 7 9000 8888',
  socials: {
    instagram: 'https://www.instagram.com/tourmalinecoven/?hl=en',
    facebook: 'https://www.facebook.com/profile.php?id=61592041071634',
  },
};

export const storeCategories: StoreCategory[] = [
  {
    id: 'cat-tops',
    slug: 'tops',
    name: 'Tops',
    description: 'Mesh, lace, satin, and sculpted silhouettes for after-dark wardrobes.',
    accent: 'Dramatic tailoring',
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cat-nails',
    slug: 'nails',
    name: 'Nails',
    description: 'Press-on sets with sharp finishes, chrome details, and dangerous polish stories.',
    accent: 'Small details',
    image:
      'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cat-new',
    slug: 'new-drop',
    name: 'New Drop',
    description: 'Fresh arrivals with limited quantities and first-look styling.',
    accent: 'Just landed',
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cat-accessories',
    slug: 'accessories',
    name: 'Accessories',
    description: 'Bags, chokers, and finishing pieces that complete the mood.',
    accent: 'Finishing ritual',
    image:
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
  },
];

export const storeCoupons: CouponDefinition[] = [
  {
    code: 'WELCOME10',
    name: 'Welcome 10',
    description: '10% off orders above 25 JOD.',
    discountType: 'percentage',
    discountValue: 10,
    minSubtotal: 25,
    isActive: true,
  },
  {
    code: 'NAILS5',
    name: 'Nails 5',
    description: '5 JOD off orders above 20 JOD.',
    discountType: 'fixed',
    discountValue: 5,
    minSubtotal: 20,
    isActive: true,
  },
];

export const fallbackNavigationItems: NavigationItem[] = [
  { id: 'nav-new', label: 'NEW', labelAr: 'الجديد', path: '/shop?sort=newest', sortOrder: 0 },
  { id: 'nav-shop', label: 'SHOP', labelAr: 'تسوقي', path: '/shop', sortOrder: 1 },
  { id: 'nav-tops', label: 'TOPS', labelAr: 'القمصان', path: '/shop?category=tops', sortOrder: 2 },
  { id: 'nav-nails', label: 'NAILS', labelAr: 'الأظافر', path: '/shop?category=nails', sortOrder: 3 },
  { id: 'nav-sale', label: 'SALE', labelAr: 'التخفيضات', path: '/shop?sale=true', sortOrder: 4 },
];

function product(
  id: string,
  slug: string,
  name: string,
  categorySlug: string,
  brand: string,
  shortDescription: string,
  description: string,
  images: string[],
  variants: StoreProduct['variants'],
  tags: string[],
  meta: Partial<StoreProduct> = {}
): StoreProduct {
  return {
    id,
    slug,
    name,
    categorySlug,
    brand,
    shortDescription,
    description,
    images: images.map((url, index) => ({
      id: `${id}-img-${index + 1}`,
      url,
      alt: name,
      isPrimary: index === 0,
    })),
    variants,
    tags,
    status: 'active',
    rating: meta.rating ?? 4.8,
    reviewCount: meta.reviewCount ?? 18,
    isFeatured: meta.isFeatured ?? false,
    isNew: meta.isNew ?? false,
  };
}

export const fallbackProducts: StoreProduct[] = [
  product(
    'prd-1',
    'black-lace-top',
    'Black Lace Top',
    'tops',
    'Tourmaline Coven',
    'Sheer lace, a sharp neckline, and sleeves that know exactly what they are doing.',
    'A fitted gothic top cut from stretch lace with a sculpted neckline, thumbhole sleeves, and a refined silhouette that layers beautifully under leather or satin.',
    [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
    ],
    [
      { id: 'v1', sku: 'BLT-BLK-S', color: 'Black', colorHex: '#111111', size: 'S', price: 32, compareAtPrice: 40, stockQuantity: 4 },
      { id: 'v2', sku: 'BLT-BLK-M', color: 'Black', colorHex: '#111111', size: 'M', price: 32, compareAtPrice: 40, stockQuantity: 2 },
      { id: 'v3', sku: 'BLT-BLK-L', color: 'Black', colorHex: '#111111', size: 'L', price: 32, compareAtPrice: 40, stockQuantity: 0 },
      { id: 'v4', sku: 'BLT-BRG-S', color: 'Burgundy', colorHex: '#6D1835', size: 'S', price: 34, compareAtPrice: 42, stockQuantity: 3 },
    ],
    ['gothic', 'lace', 'top', 'coquette'],
    { isFeatured: true, isNew: true }
  ),
  product(
    'prd-2',
    'velvet-corset-top',
    'Velvet Corset Top',
    'tops',
    'Tourmaline Coven',
    'Structured velvet with a softer edge than it looks.',
    'A corset-inspired velvet top with internal boning channels, adjustable straps, and a deep plum-black finish that catches light subtly.',
    [
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=1200&q=80',
    ],
    [
      { id: 'v5', sku: 'VCT-BLK-XS', color: 'Black', colorHex: '#161616', size: 'XS', price: 39, compareAtPrice: null, stockQuantity: 5 },
      { id: 'v6', sku: 'VCT-BLK-S', color: 'Black', colorHex: '#161616', size: 'S', price: 39, compareAtPrice: null, stockQuantity: 5 },
      { id: 'v7', sku: 'VCT-BLK-M', color: 'Black', colorHex: '#161616', size: 'M', price: 39, compareAtPrice: null, stockQuantity: 1 },
    ],
    ['velvet', 'corset', 'dark feminine'],
    { isFeatured: true }
  ),
  product(
    'prd-3',
    'after-dark-press-ons',
    'After Dark Press-Ons',
    'nails',
    'Tourmaline Coven',
    'Gloss black tips with chrome edges and a dangerous little shine.',
    'Reusable gothic press-on nails with mirror chrome micro-lines, pre-numbered sizing, and a shape that reads polished instead of costume.',
    [
      'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80',
    ],
    [
      { id: 'v8', sku: 'ADP-STD-OS', color: 'Obsidian', colorHex: '#0f0f10', size: 'ONE SIZE', price: 18, compareAtPrice: 24, stockQuantity: 8 },
    ],
    ['nails', 'press-on', 'chrome'],
    { isFeatured: true, isNew: true, rating: 4.9, reviewCount: 42 }
  ),
  product(
    'prd-4',
    'blood-rose-press-ons',
    'Blood Rose Press-Ons',
    'nails',
    'Tourmaline Coven',
    'Deep burgundy gloss with tiny silver thorn details.',
    'A dark feminine nail set with almond tips, subtle metallic detailing, and enough edge to turn a neutral outfit into a statement.',
    [
      'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1607779097040-26e80aa4576a?auto=format&fit=crop&w=1200&q=80',
    ],
    [
      { id: 'v9', sku: 'BRP-OS', color: 'Burgundy', colorHex: '#6D1835', size: 'ONE SIZE', price: 19, compareAtPrice: null, stockQuantity: 6 },
    ],
    ['nails', 'burgundy', 'press-on'],
    { isNew: true, rating: 4.7, reviewCount: 16 }
  ),
  product(
    'prd-5',
    'cathedral-mesh-top',
    'Cathedral Mesh Top',
    'tops',
    'Tourmaline Coven',
    'Lightweight mesh that sits close and layers even better.',
    'A high-neck mesh top with flocked detailing and a body-hugging cut designed for layering under slip dresses, corsets, and oversized jackets.',
    [
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    ],
    [
      { id: 'v10', sku: 'CMT-BLK-S', color: 'Black', colorHex: '#101010', size: 'S', price: 26, compareAtPrice: null, stockQuantity: 7 },
      { id: 'v11', sku: 'CMT-BLK-M', color: 'Black', colorHex: '#101010', size: 'M', price: 26, compareAtPrice: null, stockQuantity: 4 },
      { id: 'v12', sku: 'CMT-CRM-S', color: 'Bone', colorHex: '#d8d1cc', size: 'S', price: 26, compareAtPrice: null, stockQuantity: 2 },
    ],
    ['mesh', 'top', 'layering'],
    { rating: 4.6, reviewCount: 12 }
  ),
  product(
    'prd-6',
    'midnight-choker',
    'Midnight Choker',
    'accessories',
    'Tourmaline Coven',
    'Velvet ribbon, silver hardware, no unnecessary sweetness.',
    'A refined choker with an adjustable clasp, soft velvet strap, and polished hardware that keeps the styling dark without sliding into novelty.',
    [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80',
    ],
    [
      { id: 'v13', sku: 'MCH-BLK-OS', color: 'Black', colorHex: '#111111', size: 'ONE SIZE', price: 16, compareAtPrice: null, stockQuantity: 11 },
    ],
    ['accessories', 'choker', 'velvet'],
    { isFeatured: true }
  ),
  product(
    'prd-7',
    'ritual-mini-bag',
    'Ritual Mini Bag',
    'accessories',
    'Tourmaline Coven',
    'Compact satin bag with chain strap and enough menace.',
    'A mini shoulder bag with satin body, silver chain, magnetic closure, and enough structure to dress up denim or disappear into an all-black look.',
    [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=80',
    ],
    [
      { id: 'v14', sku: 'RMB-BLK-OS', color: 'Black', colorHex: '#0a0a0a', size: 'ONE SIZE', price: 45, compareAtPrice: 58, stockQuantity: 2 },
    ],
    ['bag', 'accessories', 'satin'],
    { rating: 4.9, reviewCount: 8 }
  ),
  product(
    'prd-8',
    'ivory-lace-bow-top',
    'Ivory Lace Bow Top',
    'tops',
    'Tourmaline Coven',
    'Soft blush energy without losing the edge.',
    'A coquette-leaning lace top with a structured bow front, sheer sleeves, and a silhouette designed to contrast darker styling pieces.',
    [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1200&q=80',
    ],
    [
      { id: 'v15', sku: 'ILB-IVY-S', color: 'Ivory', colorHex: '#ede7e3', size: 'S', price: 31, compareAtPrice: null, stockQuantity: 3 },
      { id: 'v16', sku: 'ILB-IVY-M', color: 'Ivory', colorHex: '#ede7e3', size: 'M', price: 31, compareAtPrice: null, stockQuantity: 5 },
    ],
    ['lace', 'coquette', 'ivory'],
    { isNew: true, rating: 4.5, reviewCount: 10 }
  ),
];
