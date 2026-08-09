export type StoreCategory = {
  id: string;
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
    facebook: string;
  };
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
