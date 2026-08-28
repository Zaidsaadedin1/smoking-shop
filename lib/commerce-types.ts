export type StoreCategory = {
  id: string;
  parentId?: string | null;
  slug: string;
  slugAr?: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  accent: string;
  accentAr?: string;
  image: string;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  isPrimary?: boolean;
};

export type ProductVariant = {
  id: string;
  sku: string;
  color: string;
  colorAr?: string;
  colorHex: string;
  size: string;
  sizeAr?: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  allowBackorder?: boolean;
};

export type ProductOptionItem = {
  id: string;
  name: string;
  nameAr?: string;
  imageUrl?: string;
  priceDelta: number;
  stockQuantity: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  sortOrder: number;
  isDefault?: boolean;
};

export type ProductOptionGroup = {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  selectionType: 'radio' | 'checkbox';
  isRequired: boolean;
  minSelections?: number | null;
  maxSelections?: number | null;
  sortOrder: number;
  items: ProductOptionItem[];
};

export type StoreProduct = {
  id: string;
  slug: string;
  slugAr?: string;
  name: string;
  nameAr?: string;
  shortDescription: string;
  shortDescriptionAr?: string;
  description: string;
  descriptionAr?: string;
  categorySlug: string;
  brand: string;
  brandAr?: string;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  optionGroups?: ProductOptionGroup[];
  status: 'active' | 'draft' | 'inactive' | 'archived';
  isFeatured?: boolean;
  isNew?: boolean;
  rating: number;
  reviewCount: number;
};

export type FlashSale = {
  id: string;
  title: string;
  description: string;
  discountLabel: string;
  startsAt: string;
  endsAt: string;
  ctaText: string;
  ctaUrl: string;
  showAsModal?: boolean;
  image: string;
  modalTitle?: string;
  modalDescription?: string;
};

export type CouponDefinition = {
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSubtotal?: number;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
};

export type AppliedCoupon = {
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSubtotal?: number;
};

export type HeroSlide = {
  id: string;
  eyebrow: string;
  eyebrowAr?: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  buttonText: string;
  buttonTextAr?: string;
  buttonUrl: string;
  imageEnUrl: string;
  imageArUrl: string;
  displaySeconds: number;
};

export type StoreSettings = {
  announcement: string;
  brandName: string;
  supportEmail: string;
  supportPhone: string;
  socials: {
    instagram: string;
  };
};

export type NavigationItem = {
  id: string;
  parentId?: string | null;
  label: string;
  labelAr?: string;
  path: string;
  sortOrder: number;
  children?: NavigationItem[];
};

export type DeliveryZone = {
  id: string;
  country: string;
  countryAr?: string;
  city?: string | null;
  cityAr?: string;
  fee: number;
  sortOrder: number;
  isActive?: boolean;
};

export type CatalogFilters = {
  search?: string;
  category?: string;
  color?: string;
  size?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: 'in-stock' | 'low-stock';
  sale?: boolean;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'featured';
};

export type CartItemInput = {
  productId: string;
  variantId: string;
  quantity: number;
};
