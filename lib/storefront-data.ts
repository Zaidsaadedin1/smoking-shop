import { Address, Category, Order, OrderStatus, Product } from './storefront-types';

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Checkout', href: '/checkout' },
  { label: 'Account', href: '/account' },
  { label: 'Admin', href: '/admin' },
];

export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Occult Jewelry',
    slug: 'occult-jewelry',
    accent: 'Silver sigils',
    description: 'Statement rings, moonlit chains, and ceremonial adornments.',
  },
  {
    id: 'cat-2',
    name: 'Velvet Apparel',
    slug: 'velvet-apparel',
    accent: 'Dark tailoring',
    description: 'Corseted silhouettes, velvet layers, and dramatic cuts.',
  },
  {
    id: 'cat-3',
    name: 'Ritual Objects',
    slug: 'ritual-objects',
    accent: 'Sanctum details',
    description: 'Candles, altar pieces, and atmospheric decor objects.',
  },
];

export const products: Product[] = [
  {
    id: 'prd-1',
    slug: 'nocturne-veil-dress',
    name: 'Nocturne Veil Dress',
    categorySlug: 'velvet-apparel',
    price: 168,
    status: 'active',
    description: 'Bias-cut velvet with cathedral sleeves and silver clasp hardware.',
    color: 'Midnight plum',
    sizeRange: 'XS-XL',
  },
  {
    id: 'prd-2',
    slug: 'lunar-thorn-ring',
    name: 'Lunar Thorn Ring',
    categorySlug: 'occult-jewelry',
    price: 74,
    status: 'limited',
    description: 'Blackened sterling wrapped around a moonstone center.',
    color: 'Oxidized silver',
    sizeRange: '5-10',
  },
  {
    id: 'prd-3',
    slug: 'coven-smoke-candle',
    name: 'Coven Smoke Candle',
    categorySlug: 'ritual-objects',
    price: 36,
    status: 'new',
    description: 'Resin, clove, and plum layered into a slow ritual burn.',
    color: 'Obsidian glass',
    sizeRange: 'Single size',
  },
  {
    id: 'prd-4',
    slug: 'cathedral-lace-top',
    name: 'Cathedral Lace Top',
    categorySlug: 'velvet-apparel',
    price: 92,
    status: 'active',
    description: 'Stretch lace with elongated cuffs and a sculpted neckline.',
    color: 'Ink black',
    sizeRange: 'XS-L',
  },
  {
    id: 'prd-5',
    slug: 'thorn-altar-tray',
    name: 'Thorn Altar Tray',
    categorySlug: 'ritual-objects',
    price: 58,
    status: 'active',
    description: 'Cast metal tray for candles, jewelry, or ritual offerings.',
    color: 'Smoked pewter',
    sizeRange: 'Single size',
  },
  {
    id: 'prd-6',
    slug: 'eclipse-signet',
    name: 'Eclipse Signet',
    categorySlug: 'occult-jewelry',
    price: 88,
    status: 'active',
    description: 'Heavy signet ring with engraved celestial crest.',
    color: 'Polished graphite',
    sizeRange: '6-12',
  },
];

export const orderStatuses: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
];

export const orders: Order[] = [
  {
    id: 'ord-1',
    number: 'TC-1042',
    createdAt: 'August 3, 2026',
    status: 'processing',
    total: 242,
    items: 3,
  },
  {
    id: 'ord-2',
    number: 'TC-1031',
    createdAt: 'July 28, 2026',
    status: 'delivered',
    total: 88,
    items: 1,
  },
];

export const addresses: Address[] = [
  {
    id: 'addr-1',
    label: 'Coven House',
    fullName: 'Lina Haddad',
    city: 'Amman',
    area: 'Abdoun',
    phone: '+962 7 9000 1234',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Studio',
    fullName: 'Lina Haddad',
    city: 'Amman',
    area: 'Jabal Amman',
    phone: '+962 7 9000 5678',
    isDefault: false,
  },
];

export const brandHighlights = [
  'Mantine-only UI system',
  'Purple gothic identity',
  'Schema-driven commerce structure',
];
