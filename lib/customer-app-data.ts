import { addresses, categories, orders, products } from './storefront-data';

export const mainTabs = [
  { label: 'Home', href: '/home' },
  { label: 'Categories', href: '/categories' },
  { label: 'Favorites', href: '/favorites' },
  { label: 'Cart', href: '/cart' },
  { label: 'Profile', href: '/profile' },
];

export const promoBanners = [
  'Moonlit archive drop',
  'Velvet silhouettes this week',
  'Flash sale on ritual objects',
];

export const flashSale = {
  title: 'Midnight flash sale',
  subtitle: 'Selected ritual pieces are marked down for the next 06:14:27.',
  discount: 'Up to 30% off',
};

export const featuredProducts = products.slice(0, 4);
export const newArrivals = products.slice(2, 6);
export const bestSellers = [products[1], products[0], products[5]].filter(Boolean);
export const favoriteProducts = [products[1], products[4]].filter(Boolean);
export const cartProducts = [products[0], products[2]].filter(Boolean);
export const recentProducts = [products[3], products[5]].filter(Boolean);
export const allCategories = categories;
export const customerOrders = orders;
export const customerAddresses = addresses;

export const notifications = [
  'Your TC-1042 order moved to processing.',
  'Flash sale is live for ritual objects.',
  'A new velvet apparel drop has arrived.',
];

export const reviews = [
  {
    id: 'rev-1',
    author: 'Lina',
    product: 'Nocturne Veil Dress',
    rating: 5,
    body: 'Structured beautifully and feels premium in hand.',
  },
  {
    id: 'rev-2',
    author: 'Maya',
    product: 'Lunar Thorn Ring',
    rating: 4,
    body: 'Heavy, dark, and exactly on-brand.',
  },
];

export const adminMetrics = [
  { label: 'Products', value: '48', detail: 'Catalog entries mapped to categories and statuses.' },
  { label: 'Orders', value: '126', detail: 'Current order pipeline across all states.' },
  { label: 'Customers', value: '312', detail: 'Profiles with address and order history.' },
  { label: 'Revenue', value: '$18.4k', detail: 'Mock monthly gross sales snapshot.' },
];
