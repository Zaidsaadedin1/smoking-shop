export type Category = {
  id: string;
  name: string;
  slug: string;
  accent: string;
  description: string;
};

export type ProductStatus = 'active' | 'limited' | 'new';
export type ProductLifecycleStatus = 'draft' | 'active' | 'inactive' | 'archived';

export type Product = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  price: number;
  status: ProductStatus | ProductLifecycleStatus;
  description: string;
  color: string;
  sizeRange: string;
};

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'failed'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered';

export type Order = {
  id: string;
  number: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  items: number;
};

export type Address = {
  id: string;
  label: string;
  fullName: string;
  city: string;
  area: string;
  phone: string;
  isDefault: boolean;
};
