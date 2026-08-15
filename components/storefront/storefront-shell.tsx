'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ChefHat,
  Clock,
  Heart,
  Home,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  Utensils,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { LocaleSwitcher, useLocale } from '@/components/storefront/locale-provider';
import { ThemeSwitcher, useThemeMode } from '@/components/storefront/theme-provider';
import { FlashSale, NavigationItem, StoreSettings } from '@/lib/commerce-types';
import { formatCurrency } from '@/lib/commerce-utils';
import { getCartProducts, useCartStore } from '@/stores/use-cart-store';
import { useUiStore } from '@/stores/use-ui-store';

const mobileNav = [
  { label: 'HOME', href: '/', icon: Home },
  { label: 'MENU', href: '/shop', icon: Utensils },
  { label: '♡', href: '/favorites', icon: Heart },
  { label: 'CART', href: '/cart', icon: ShoppingBag },
  { label: 'YOU', href: '/account', icon: User },
];

export function StorefrontShell({
  children,
  settings,
  flashSale,
  navigationItems,
}: {
  children: ReactNode;
  settings: StoreSettings;
  flashSale: FlashSale | null;
  navigationItems: NavigationItem[];
}) {
  const pathname = usePathname();
  const { t } = useLocale();
  useThemeMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isCartOpen, openCart, closeCart, toasts, dismissToast, pushToast } = useUiStore();
  const items = useCartStore((state) => state.items);
  const isCheckout = pathname.startsWith('/checkout');
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!flashSale?.showAsModal) {
      return;
    }

    const storageKey = `flash-sale-dismissed:${flashSale.id}`;
    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }

    const timeout = window.setTimeout(() => {
      pushToast({
        title: t(flashSale.title),
        description: t(flashSale.description),
      });
    }, 1600);

    return () => window.clearTimeout(timeout);
  }, [flashSale, pushToast]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <AnnouncementBar text={t(settings.announcement)} />
      <Header
        brandName={settings.brandName}
        cartCount={items.reduce((sum, item) => sum + item.quantity, 0)}
        scrolled={scrolled || pathname !== '/'}
        onMenu={() => setMenuOpen(true)}
        onCart={openCart}
        navigationItems={navigationItems}
      />
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        brandName={settings.brandName}
        navigationItems={navigationItems}
      />
      <main className="pb-24 md:pb-10">{children}</main>
      {!isCheckout ? <MobileBottomNav /> : null}
      <Footer settings={settings} navigationItems={navigationItems} />
      <CartDrawer open={isCartOpen} onClose={closeCart} />
      <FlashSaleModal sale={flashSale} />
      <ToastViewport toasts={toasts} dismissToast={dismissToast} />
    </div>
  );
}

function AnnouncementBar({ text }: { text: string }) {
  return (
    <div
      className="border-b px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-white md:text-xs"
      style={{
        borderColor: 'rgba(0,0,0,0.08)',
        background: 'linear-gradient(90deg, #111111 0%, #c7202f 48%, #111111 100%)',
      }}
    >
      {text}
    </div>
  );
}

function Header({
  brandName,
  cartCount,
  scrolled,
  onMenu,
  onCart,
  navigationItems,
}: {
  brandName: string;
  cartCount: number;
  scrolled: boolean;
  onMenu: () => void;
  onCart: () => void;
  navigationItems: NavigationItem[];
}) {
  const { localize } = useLocale();
  const { isDark } = useThemeMode();
  const navHoverClassName = isDark ? 'hover:text-white' : 'hover:text-[#c7202f]';
  const badgeTextColor = '#ffffff';
  const controlBorderColor = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(199,32,47,0.16)';
  const controlBackground = isDark ? 'rgba(255,255,255,0.06)' : '#fff8f2';
  const headerBackground = isDark ? 'rgba(8,8,8,0.9)' : 'rgba(255,252,248,0.94)';
  const headerTextColor = isDark ? 'var(--text)' : '#181211';
  const secondaryTextColor = isDark ? 'var(--text-secondary)' : '#5f514b';
  const badgeBackground = 'var(--accent)';
  return (
    <header
      className={`sticky top-0 z-40 transition duration-300 ${
        scrolled ? 'border-b backdrop-blur-xl' : 'backdrop-blur-xl'
      }`}
      style={{
        borderColor: scrolled ? 'var(--border)' : 'transparent',
        background: isDark && !scrolled ? 'transparent' : headerBackground,
        color: headerTextColor,
      }}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 md:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenu}
            className="rounded-full border p-2 text-[var(--text)] md:hidden"
            style={{
              borderColor: controlBorderColor,
              background: controlBackground,
            }}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/"
            className="inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border bg-white p-1.5 shadow-[0_12px_30px_rgba(199,32,47,0.12)] transition hover:-translate-y-0.5 md:h-16 md:w-16"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(199,32,47,0.16)' }}
            aria-label={brandName}
          >
            <img src="/shawerma-3a-saj-logo.jpg" alt="" className="h-full w-full object-contain" />
            <span className="sr-only">{brandName}</span>
          </Link>
        </div>

        <nav
          className="hidden max-w-[46rem] items-center justify-center gap-1 rounded-full border px-2 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] shadow-[0_18px_45px_rgba(24,18,17,0.06)] md:flex"
          style={{
            color: secondaryTextColor,
            borderColor: controlBorderColor,
            background: controlBackground,
          }}
        >
          {navigationItems.map((item) => (
            <div key={item.id} className="group relative">
              <Link
                href={item.path}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition ${navHoverClassName} hover:bg-white`}
              >
                <span>{localize(item.label, item.labelAr)}</span>
                {item.children?.length ? (
                  <span className="text-[8px] opacity-60 transition duration-200 group-hover:opacity-100">
                    ▾
                  </span>
                ) : null}
              </Link>
              {item.children?.length ? (
                <div className="invisible absolute left-0 top-full z-50 min-w-64 pt-3 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100">
                  <div className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--background)] shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
                    <div className="space-y-0.5 p-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.path}
                          className="block rounded-[12px] border border-transparent px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--text-secondary)] transition hover:border-[var(--border)] hover:bg-[var(--card)] hover:text-[var(--text)]"
                        >
                          {localize(child.label, child.labelAr)}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3" style={{ color: secondaryTextColor }}>
          <div className="hidden md:block">
            <LocaleSwitcher />
          </div>
          <ThemeSwitcher />
          <Link
            href="/search"
            className={`rounded-full border p-2 transition ${navHoverClassName}`}
            style={{
              borderColor: controlBorderColor,
              background: controlBackground,
            }}
          >
            <Search className="h-4 w-4" />
          </Link>
          <Link
            href="/favorites"
            className={`hidden rounded-full border p-2 transition md:inline-flex ${navHoverClassName}`}
            style={{
              borderColor: controlBorderColor,
              background: controlBackground,
            }}
          >
            <Heart className="h-4 w-4" />
          </Link>
          <Link
            href="/account"
            className={`hidden rounded-full border p-2 transition md:inline-flex ${navHoverClassName}`}
            style={{
              borderColor: controlBorderColor,
              background: controlBackground,
            }}
          >
            <User className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={onCart}
            className={`relative rounded-full border p-2 transition ${navHoverClassName}`}
            style={{
              borderColor: controlBorderColor,
              background: controlBackground,
            }}
            aria-label="Open cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 ? (
              <span
                className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px]"
                style={{ color: badgeTextColor, background: badgeBackground }}
              >
                {cartCount}
              </span>
            ) : null}
          </button>
          <Link
            href="/shop"
            className="hidden items-center gap-2 rounded-full bg-[#c7202f] px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_14px_32px_rgba(199,32,47,0.28)] transition hover:-translate-y-0.5 hover:bg-[#a91624] lg:inline-flex"
          >
            <ChefHat className="h-4 w-4" />
            <span>Order Now</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function MobileMenu({
  open,
  onClose,
  brandName,
  navigationItems,
}: {
  open: boolean;
  onClose: () => void;
  brandName: string;
  navigationItems: NavigationItem[];
}) {
  const { t, localize } = useLocale();
  const { isDark } = useThemeMode();
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm flex-col px-6 py-6"
            style={{ background: isDark ? '#0c0c0d' : '#fffaf7' }}
          >
            <div className="mb-10 flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#f2d7cd] bg-white">
                  <img src="/shawerma-3a-saj-logo.jpg" alt="" className="h-full w-full object-contain" />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-base font-black uppercase">{brandName}</div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c7202f]">
                    Saj & Shawerma
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-black/10 p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-6">
              <LocaleSwitcher />
            </div>
            <div className="mb-6">
              <ThemeSwitcher />
            </div>
            <div className="space-y-3 text-base font-bold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              {navigationItems.map((item) => (
                <div key={item.id}>
                  <Link
                    href={item.path}
                    onClick={onClose}
                    className="block rounded-[16px] px-4 py-3 transition hover:bg-[#c7202f] hover:text-white"
                  >
                    {localize(item.label, item.labelAr)}
                  </Link>
                  {item.children?.length ? (
                    <div className="ms-4 mt-2 space-y-2 border-s border-black/10 ps-4 text-sm tracking-[0.12em]">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.path}
                          onClick={onClose}
                          className="block rounded-[12px] px-3 py-2 transition hover:bg-[#c7202f] hover:text-white"
                        >
                          {localize(child.label, child.labelAr)}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              <Link
                href="/account"
                onClick={onClose}
                className="block rounded-[16px] px-4 py-3 transition hover:bg-[#c7202f] hover:text-white"
              >
                {t('ACCOUNT')}
              </Link>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <div
      className="fixed inset-x-4 bottom-4 z-30 rounded-full border px-3 py-2 backdrop-blur-xl md:hidden"
      style={{
        borderColor: 'var(--border)',
        background: 'color-mix(in srgb, var(--background) 78%, transparent)',
      }}
    >
      <div className="grid grid-cols-5 gap-2">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-full py-1 text-[10px] tracking-[0.18em] transition ${
                active ? 'scale-105 text-white' : 'text-[var(--muted)]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t(item.label)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Footer({
  settings,
  navigationItems,
}: {
  settings: StoreSettings;
  navigationItems: NavigationItem[];
}) {
  const { t, localize } = useLocale();
  return (
    <footer
      className="border-t bg-[var(--background)] text-[var(--text)]"
      style={{
        borderColor: 'var(--border)',
        boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--text) 6%, transparent)',
      }}
    >
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-white p-1 shadow-[0_14px_34px_rgba(199,32,47,0.12)]">
                <img src="/shawerma-3a-saj-logo.jpg" alt="" className="h-full w-full object-contain" />
              </span>
              <span>
                <span className="block text-xl font-black uppercase leading-tight">
                  {settings.brandName}
                </span>
                <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                  Saj wraps since lunch
                </span>
              </span>
            </Link>
            <p className="mt-6 max-w-md text-sm leading-7 text-[var(--text-secondary)]">
              {t('Fresh shawerma, saj meals, pickup, and delivery across Jordan.')}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <FooterInfo icon={Clock} label="Hours" value="12 PM - 2 AM" />
              <FooterInfo icon={Phone} label="Phone" value="Order hotline" />
              <FooterInfo icon={MapPin} label="Delivery" value="Jordan branches" />
            </div>
          </div>

          <FooterColumn
            title="MENU"
            links={navigationItems.map((item) => ({
              label: localize(item.label, item.labelAr),
              href: item.path,
            }))}
          />
          <FooterColumn
            title="HELP"
            links={[
              { label: 'CONTACT', href: '/contact-us' },
              { label: 'DELIVERY', href: '/shipping' },
              { label: 'ORDER HELP', href: '/returns' },
              { label: 'FAQ', href: '/faq' },
            ]}
          />
          <FooterColumn
            title="FOLLOW"
            links={[
              { label: 'INSTAGRAM', href: settings.socials.instagram },
              { label: 'FACEBOOK', href: settings.socials.facebook },
              { label: 'PRIVACY POLICY', href: '/privacy-policy' },
              { label: 'TERMS', href: '/terms' },
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)] md:flex-row md:items-center md:justify-between">
          <span>© 2026 {settings.brandName}</span>
          <span className="text-[var(--accent)]">{t('HOT SAJ, FAST DELIVERY, AND PICKUP FROM JORDAN BRANCHES')}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  const { t } = useLocale();
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
      <div className="min-w-0">
        <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
          {t(label)}
        </div>
        <div className="mt-0.5 text-[11px] font-black uppercase leading-4 text-[var(--text)]">{t(value)}</div>
      </div>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  const { t } = useLocale();
  return (
    <div>
      <div className="mb-5 text-xs font-black uppercase tracking-[0.24em] text-[var(--accent)]">
        {t(title)}
      </div>
      <div className="space-y-3 text-sm font-semibold text-[var(--text-secondary)]">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="block transition hover:translate-x-1 hover:text-[var(--accent)]"
          >
            {t(link.label)}
          </Link>
        ))}
      </div>
    </div>
  );
}

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const lines = useMemo(() => getCartProducts(items), [items]);
  const { t, localize } = useLocale();
  const { isDark } = useThemeMode();
  const subtotal = lines.reduce((sum, line) => sum + line.variant.price * line.quantity, 0);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col p-6"
            style={{ background: isDark ? '#0d0d0f' : '#fffaf7' }}
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="text-xs tracking-[0.25em] text-[var(--muted)]">
                  {t('YOUR CART')}
                </div>
                <div className="mt-1 font-display text-2xl uppercase">{t('ORDER')}</div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto">
              {lines.length ? (
                lines.map((line) => (
                  <div
                    key={line.variant.id}
                    className="flex gap-4 rounded-[24px] border border-white/8 bg-white/3 p-3"
                  >
                    <img
                      src={line.product.images[0]?.url}
                      alt={localize(line.product.name, line.product.nameAr)}
                      className="h-28 w-24 rounded-[18px] object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
                        {line.product.categorySlug}
                      </div>
                      <div className="mt-1 text-base">
                        {localize(line.product.name, line.product.nameAr)}
                      </div>
                      <div className="mt-2 text-sm text-[var(--text-secondary)]">
                        {localize(line.variant.size, line.variant.sizeAr)}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm">{formatCurrency(line.variant.price)}</div>
                        <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.variant.id, line.quantity - 1)}
                          >
                            -
                          </button>
                          <span>{line.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.variant.id, line.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(line.variant.id)}
                        className="mt-3 text-xs tracking-[0.2em] text-[var(--muted)]"
                      >
                        {t('REMOVE')}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[32px] border border-white/8 bg-white/3 p-8 text-center">
                  <div className="font-display text-3xl uppercase">{t('YOUR CART IS EMPTY.')}</div>
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">
                    {t('Start with a saj sandwich or a full arabi meal.')}
                  </p>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm tracking-[0.2em]"
                    style={{ color: 'var(--background)' }}
                  >
                    {t('VIEW MENU')}
                  </Link>
                </div>
              )}
            </div>
            <div className="mt-6 border-t border-white/8 pt-5">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">{t('Subtotal')}</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="grid gap-3">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="rounded-full border border-white/10 px-5 py-3 text-center text-sm tracking-[0.2em]"
                >
                  {t('VIEW CART')}
                </Link>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="rounded-full bg-[var(--accent)] px-5 py-3 text-center text-sm tracking-[0.2em]"
                  style={{ color: 'var(--background)' }}
                >
                  {t('CHECKOUT')}
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function FlashSaleModal({ sale }: { sale: FlashSale | null }) {
  const { t } = useLocale();
  const { isDark } = useThemeMode();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sale?.showAsModal) {
      return;
    }

    const key = `flash-sale-dismissed:${sale.id}`;
    if (sessionStorage.getItem(key)) {
      return;
    }

    const timeout = window.setTimeout(() => setVisible(true), 1700);
    return () => clearTimeout(timeout);
  }, [sale]);

  if (!sale) {
    return null;
  }

  const dismiss = () => {
    sessionStorage.setItem(`flash-sale-dismissed:${sale.id}`, 'true');
    setVisible(false);
  };

  const modalKicker = t('HOT DEAL');
  const modalTitle = sale.modalTitle?.trim() || sale.title;
  const modalDescription = sale.modalDescription?.trim() || sale.description;
  const ctaText = sale.ctaText?.trim() || t('ORDER THE DEAL');
  const imageSrc = sale.image || '/products/product-placeholder.svg';
  const ctaTextColor = isDark ? '#3a1d08' : '#fff7e8';

  return (
    <AnimatePresence>
      {visible ? (
        <>
          <motion.button
            type="button"
            onClick={dismiss}
            className="fixed inset-0 z-50 bg-black/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.35 }}
            className="fixed left-1/2 top-1/2 z-[60] w-[92vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[36px] border"
            style={{
              borderColor: 'var(--border)',
              background: isDark ? '#111112' : '#fffaf7',
            }}
          >
            <div className="grid md:grid-cols-[1.05fr_0.95fr]">
              <img
                src={imageSrc}
                alt={sale.title}
                className="h-[260px] w-full object-cover md:h-full"
              />
              <div className="relative flex min-h-[420px] flex-col justify-center p-8 md:p-10">
                <button
                  type="button"
                  onClick={dismiss}
                  className="absolute right-5 top-5 rounded-full border border-white/10 p-2"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="text-xs tracking-[0.28em] text-[var(--muted)]">{modalKicker}</div>
                <div className="mt-4 font-display text-5xl uppercase leading-none">
                  {sale.discountLabel}
                </div>
                <h3 className="mt-5 max-w-sm text-lg uppercase tracking-[0.18em] text-[var(--text)]">
                  {t(modalTitle)}
                </h3>
                <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--text-secondary)]">
                  {t(modalDescription)}
                </p>
                <Link
                  href={sale.ctaUrl}
                  onClick={dismiss}
                  className="mt-8 inline-flex w-fit rounded-full bg-[var(--text)] px-6 py-3 text-sm tracking-[0.2em] text-black"
                >
                  <span style={{ color: ctaTextColor }}>{ctaText}</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function ToastViewport({
  toasts,
  dismissToast,
}: {
  toasts: Array<{ id: string; title: string; description?: string }>;
  dismissToast: (id: string) => void;
}) {
  useEffect(() => {
    const timeouts = toasts.map((toast) => window.setTimeout(() => dismissToast(toast.id), 3200));

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [toasts, dismissToast]);

  return (
    <div className="pointer-events-none fixed bottom-24 right-4 z-[70] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 md:bottom-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="pointer-events-auto rounded-[24px] border p-4 shadow-2xl"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--elevated)',
            }}
          >
            <div className="text-sm">{toast.title}</div>
            {toast.description ? (
              <div className="mt-1 text-xs leading-6 text-[var(--text-secondary)]">
                {toast.description}
              </div>
            ) : null}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
