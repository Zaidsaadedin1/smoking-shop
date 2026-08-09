'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { LocaleSwitcher, useLocale } from '@/components/storefront/locale-provider';
import { ThemeSwitcher, useThemeMode } from '@/components/storefront/theme-provider';
import { FlashSale, StoreSettings } from '@/lib/commerce-types';
import { formatCurrency } from '@/lib/commerce-utils';
import { getCartProducts, useCartStore } from '@/stores/use-cart-store';
import { useUiStore } from '@/stores/use-ui-store';

const desktopNav = [
  { label: 'NEW', href: '/shop?sort=newest' },
  { label: 'SHOP', href: '/shop' },
  { label: 'TOPS', href: '/shop?category=tops' },
  { label: 'NAILS', href: '/shop?category=nails' },
  { label: 'SALE', href: '/shop?sale=true' },
];

const mobileNav = [
  { label: 'HOME', href: '/', icon: Search },
  { label: 'SHOP', href: '/shop', icon: Search },
  { label: '♡', href: '/favorites', icon: Heart },
  { label: 'BAG', href: '/cart', icon: ShoppingBag },
  { label: 'YOU', href: '/account', icon: User },
];

export function StorefrontShell({
  children,
  settings,
  flashSale,
}: {
  children: ReactNode;
  settings: StoreSettings;
  flashSale: FlashSale | null;
}) {
  const pathname = usePathname();
  const { t, localize } = useLocale();
  useThemeMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isCartOpen, openCart, closeCart, toasts, dismissToast, pushToast } = useUiStore();
  const items = useCartStore((state) => state.items);
  const cartLines = useMemo(() => getCartProducts(items), [items]);
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
      />
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        brandName={settings.brandName}
      />
      <main className="pb-24 md:pb-10">{children}</main>
      {!isCheckout ? <MobileBottomNav /> : null}
      <Footer settings={settings} />
      <CartDrawer open={isCartOpen} onClose={closeCart} />
      <FlashSaleModal sale={flashSale} />
      <ToastViewport toasts={toasts} dismissToast={dismissToast} />
    </div>
  );
}

function AnnouncementBar({ text }: { text: string }) {
  return (
    <div
      className="border-b px-4 py-2 text-center text-[10px] tracking-[0.3em] text-[var(--text-secondary)] md:text-xs"
      style={{
        borderColor: 'var(--border)',
        background: 'color-mix(in srgb, var(--background) 82%, transparent)',
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
}: {
  brandName: string;
  cartCount: number;
  scrolled: boolean;
  onMenu: () => void;
  onCart: () => void;
}) {
  const { t, localize } = useLocale();
  const { isDark } = useThemeMode();
  const navHoverClassName = isDark ? 'hover:text-white' : 'hover:text-[var(--text)]';
  const badgeTextColor = isDark ? '#000000' : '#fffaf7';
  const controlBorderColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(23,23,23,0.16)';
  const controlBackground = isDark ? 'transparent' : 'rgba(255,250,247,0.92)';
  const headerBackground = isDark ? 'rgba(0,0,0,0.60)' : 'rgba(248,243,238,0.88)';
  const headerTextColor = isDark ? 'var(--text)' : '#201715';
  const secondaryTextColor = isDark ? 'var(--text-secondary)' : '#5a433d';
  const badgeBackground = isDark ? 'var(--text)' : '#201715';
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
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 md:px-8 lg:px-12">
        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={onMenu}
            className="rounded-full border p-2 text-[var(--text)]"
            style={{
              borderColor: controlBorderColor,
              background: controlBackground,
            }}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <nav
          className="hidden items-center gap-6 text-xs tracking-[0.32em] md:flex"
          style={{ color: secondaryTextColor }}
        >
          {desktopNav.map((item) => (
            <Link key={item.href} href={item.href} className={`transition ${navHoverClassName}`}>
              {t(item.label)}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="text-center font-display text-[0.82rem] uppercase tracking-[0.18em] sm:text-[1rem] sm:tracking-[0.22em] md:text-3xl md:tracking-[0.35em]"
          style={{ color: headerTextColor }}
        >
          {brandName}
        </Link>

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
        </div>
      </div>
    </header>
  );
}

function MobileMenu({
  open,
  onClose,
  brandName,
}: {
  open: boolean;
  onClose: () => void;
  brandName: string;
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
            <div className="mb-10 flex items-center justify-between">
              <div className="font-display text-xl uppercase tracking-[0.3em]">{brandName}</div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 p-2"
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
            <div className="space-y-5 text-lg uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              {desktopNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="block transition hover:text-white"
                >
                  {t(item.label)}
                </Link>
              ))}
              <Link href="/account" onClick={onClose} className="block transition hover:text-white">
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
  const { t, localize } = useLocale();

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

function Footer({ settings }: { settings: StoreSettings }) {
  const { t } = useLocale();
  return (
    <footer
      className="border-t px-4 py-16 md:px-8 lg:px-12"
      style={{
        borderColor: 'var(--border)',
        background: 'color-mix(in srgb, var(--background) 72%, transparent)',
      }}
    >
      <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="font-display text-3xl uppercase tracking-[0.3em]">
            {settings.brandName}
          </div>
          <p className="mt-4 max-w-md text-sm leading-7 text-[var(--text-secondary)]">
            {t('Dark feminine pieces, nails, and finishing touches.')}
          </p>
        </div>
        <FooterColumn title="SHOP" links={desktopNav} />
        <FooterColumn
          title="HELP"
          links={[
            { label: 'CONTACT', href: '/contact-us' },
            { label: 'SHIPPING', href: '/shipping' },
            { label: 'RETURNS', href: '/returns' },
            { label: 'FAQ', href: '/faq' },
          ]}
        />
        <FooterColumn
          title="LEGAL"
          links={[
            { label: 'PRIVACY POLICY', href: '/privacy-policy' },
            { label: 'TERMS', href: '/terms' },
            { label: 'INSTAGRAM', href: settings.socials.instagram },
            { label: 'FACEBOOK', href: settings.socials.facebook },
          ]}
        />
      </div>
      <div
        className="mx-auto mt-12 flex max-w-[1440px] flex-col gap-2 border-t pt-6 text-xs tracking-[0.22em] text-[var(--muted)] md:flex-row md:items-center md:justify-between"
        style={{ borderColor: 'var(--border)' }}
      >
        <span>© 2026 {settings.brandName}</span>
        <span>{t('DELIVERY ACROSS JORDAN 🇯🇴  •  NEW DROP AVAILABLE NOW').split('  •  ')[0]}</span>
      </div>
    </footer>
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
      <div className="mb-4 text-xs tracking-[0.3em] text-[var(--text-secondary)]">{t(title)}</div>
      <div className="space-y-3 text-sm text-[var(--muted)]">
        {links.map((link) => (
          <Link key={link.label} href={link.href} className="block transition hover:text-white">
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
                <div className="text-xs tracking-[0.25em] text-[var(--muted)]">{t('YOUR BAG')}</div>
                <div className="mt-1 font-display text-2xl uppercase">{t('HOLD')}</div>
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
                        {localize(line.variant.color, line.variant.colorAr)} /{' '}
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
                  <div className="font-display text-3xl uppercase">{t('YOUR BAG IS EMPTY.')}</div>
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">
                    {t('But that can be fixed.')}
                  </p>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm tracking-[0.2em]"
                    style={{ color: 'var(--background)' }}
                  >
                    {t('SHOP THE DROP')}
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
                  {t('VIEW BAG')}
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

  const modalKicker = t('AFTER DARK');
  const modalTitle = sale.modalTitle?.trim() || sale.title;
  const modalDescription = sale.modalDescription?.trim() || sale.description;
  const ctaText = sale.ctaText?.trim() || t('SHOP THE SALE');
  const imageSrc = sale.image || '/products/product-placeholder.svg';
  const ctaTextColor = isDark ? '#8a304f' : '#f7efe3';

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
