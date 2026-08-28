'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Cloud,
  CircleHelp,
  Clock,
  Heart,
  Home,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  Package,
  LogOut,
  Languages,
  MapPinned,
  Settings2,
  User,
  UserRound,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ComponentType,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { LocaleSwitcher, useLocale } from '@/components/storefront/locale-provider';
import { ThemeSwitcher, useThemeMode } from '@/components/storefront/theme-provider';
import { FlashSale, NavigationItem, StoreSettings } from '@/lib/commerce-types';
import { formatCurrency } from '@/lib/commerce-utils';
import { getCartProducts, useCartStore } from '@/stores/use-cart-store';
import { useUiStore } from '@/stores/use-ui-store';
import type { CustomerSession } from '@/lib/customer/auth';

const mobileNav = [
  { label: 'HOME', href: '/', icon: Home },
  { label: 'SHOP', href: '/shop', icon: Package },
  { label: '♡', href: '/favorites', icon: Heart },
  { label: 'CART', href: '/cart', icon: ShoppingBag },
  { label: 'YOU', href: '/account', icon: User },
];

const storefrontBrandName = 'Puff Jo';

function BrandLogo({ className, alt = '' }: { className: string; alt?: string }) {
  const { isDark } = useThemeMode();

  return (
    <img
      src={isDark ? '/puff-jordan-logo.png' : '/puff-jordan-logo-light.png'}
      alt={alt}
      className={className}
    />
  );
}

export function StorefrontShell({
  children,
  settings,
  flashSale,
  navigationItems,
  customerSession,
}: {
  children: ReactNode;
  settings: StoreSettings;
  flashSale: FlashSale | null;
  navigationItems: NavigationItem[];
  customerSession: CustomerSession | null;
}) {
  const pathname = usePathname();
  const { t } = useLocale();
  useThemeMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
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
        brandName={storefrontBrandName}
        currentPath={pathname}
        cartCount={items.reduce((sum, item) => sum + item.quantity, 0)}
        scrolled={scrolled || pathname !== '/'}
        onMenu={() => setMenuOpen(true)}
        onCart={openCart}
        onAccount={() => setAccountOpen(true)}
        navigationItems={navigationItems}
      />
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        brandName={storefrontBrandName}
        navigationItems={navigationItems}
      />
      <main className="pb-24 md:pb-10">{children}</main>
      {!isCheckout ? <MobileBottomNav onAccount={() => setAccountOpen(true)} /> : null}
      <Footer settings={settings} navigationItems={navigationItems} />
      <CartDrawer open={isCartOpen} onClose={closeCart} />
      <AccountDrawer
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        session={customerSession}
      />
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
        background: 'linear-gradient(90deg, #050505 0%, #333333 48%, #050505 100%)',
      }}
    >
      {text}
    </div>
  );
}

function Header({
  brandName,
  currentPath,
  cartCount,
  scrolled,
  onMenu,
  onCart,
  onAccount,
  navigationItems,
}: {
  brandName: string;
  currentPath: string;
  cartCount: number;
  scrolled: boolean;
  onMenu: () => void;
  onCart: () => void;
  onAccount: () => void;
  navigationItems: NavigationItem[];
}) {
  const { localize, t } = useLocale();
  const { isDark } = useThemeMode();
  const navHoverClassName = isDark ? 'hover:text-white' : 'hover:text-black';
  const badgeTextColor = '#ffffff';
  const controlBorderColor = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.16)';
  const controlBackground = isDark ? 'rgba(255,255,255,0.06)' : '#ffffff';
  const headerBackground = isDark ? 'rgba(8,8,8,0.9)' : 'rgba(255,255,255,0.94)';
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
            className="inline-flex h-14 w-24 items-center justify-start overflow-hidden transition hover:-translate-y-0.5 md:h-16 md:w-28"
            aria-label={brandName}
          >
            <BrandLogo className="h-full w-full object-contain" />
            <span className="sr-only">{brandName}</span>
          </Link>
        </div>

        <nav
          className="storefront-nav hidden min-w-0 max-w-[46rem] flex-1 items-center justify-start gap-1 overflow-visible text-[11px] font-bold uppercase tracking-[0.16em] md:flex"
          style={{
            color: secondaryTextColor,
            borderColor: 'transparent',
            background: 'transparent',
          }}
        >
          {navigationItems.map((item) => (
            <div key={item.id} className="group relative">
              <Link
                href={item.path}
                aria-haspopup={item.children?.length ? 'menu' : undefined}
                aria-current={currentPath === item.path ? 'page' : undefined}
                className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-2 py-3 transition ${navHoverClassName} ${currentPath === item.path ? 'border-[var(--accent)] text-[var(--text)]' : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text)]'}`}
              >
                <span>{localize(item.label, item.labelAr)}</span>
                {item.children?.length ? (
                  <span className="text-[8px] opacity-60 transition duration-200 group-hover:opacity-100">
                    ▾
                  </span>
                ) : null}
              </Link>
              {item.children?.length ? (
                <div className="invisible absolute left-0 top-[calc(100%-1px)] z-50 min-w-64 pt-2 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--background)] shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
                    <div className="space-y-0.5 p-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.path}
                          className="block whitespace-nowrap rounded-[12px] border border-transparent px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--text-secondary)] transition hover:border-[var(--border)] hover:bg-[var(--card)] hover:text-[var(--text)]"
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
            onClick={(event) => {
              event.preventDefault();
              onAccount();
            }}
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
            className="!text-black hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] shadow-[0_14px_32px_rgba(255,255,255,0.14)] transition hover:-translate-y-0.5 hover:bg-neutral-200 lg:inline-flex"
          >
            <Cloud className="h-4 w-4" />
            {t('ORDER NOW')}
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
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setExpandedItems((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

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
            className="storefront-nav fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm flex-col border-r border-[var(--border)] px-5 py-5 shadow-[0_25px_60px_rgba(0,0,0,0.28)]"
            style={{ background: isDark ? '#0d0d0f' : '#f5f5f3' }}
          >
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
                  <BrandLogo className="h-full w-full object-cover" />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-base font-black uppercase text-[var(--text)]">
                    {brandName}
                  </div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                    Vape / Smoke / Repeat
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5 flex items-center justify-between gap-3 rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-3 py-2.5">
              <LocaleSwitcher />
              <ThemeSwitcher />
            </div>

            <div className="space-y-2 whitespace-nowrap text-base font-bold uppercase tracking-[0.12em]">
              {navigationItems.map((item) => {
                const isExpanded = Boolean(expandedItems[item.id]);

                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--card)]"
                  >
                    {item.children?.length ? (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-[var(--text)] transition hover:bg-[color:color-mix(in_srgb,var(--accent)_12%,var(--card))] hover:text-[var(--accent)]"
                        >
                          <span>{localize(item.label, item.labelAr)}</span>
                          <span
                            className={`text-[10px] transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          >
                            ▾
                          </span>
                        </button>
                        <AnimatePresence initial={false}>
                          {isExpanded ? (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-1 border-t border-[var(--border)] bg-[color:color-mix(in_srgb,var(--background)_92%,transparent)] px-3 py-2 text-sm tracking-[0.12em] text-[var(--text-secondary)]">
                                {item.children.map((child) => (
                                  <Link
                                    key={child.id}
                                    href={child.path}
                                    onClick={onClose}
                                    className="block rounded-[12px] px-3 py-2 transition hover:bg-[color:color-mix(in_srgb,var(--accent)_10%,var(--card))] hover:text-[var(--text)]"
                                  >
                                    {localize(child.label, child.labelAr)}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={item.path}
                        onClick={onClose}
                        className="flex items-center justify-between px-4 py-3 text-[var(--text)] transition hover:bg-[color:color-mix(in_srgb,var(--accent)_12%,var(--card))] hover:text-[var(--accent)]"
                      >
                        <span>{localize(item.label, item.labelAr)}</span>
                      </Link>
                    )}
                  </div>
                );
              })}

              <Link
                href="/account"
                onClick={onClose}
                className="mt-2 block rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[color:color-mix(in_srgb,var(--accent)_12%,var(--card))] hover:text-[var(--accent)]"
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

function MobileBottomNav({ onAccount }: { onAccount: () => void }) {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <div
      className="storefront-nav fixed inset-x-4 bottom-4 z-30 rounded-full border px-3 py-2 backdrop-blur-xl md:hidden"
      style={{
        borderColor: 'var(--border)',
        background: 'color-mix(in srgb, var(--background) 78%, transparent)',
      }}
    >
      <div className="grid grid-cols-5 gap-2">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return item.href === '/account' ? (
            <button
              key={item.href}
              type="button"
              onClick={onAccount}
              className={`flex flex-col items-center gap-1 whitespace-nowrap rounded-full py-1 text-[10px] tracking-[0.18em] transition ${
                active ? 'scale-105 text-white' : 'text-[var(--muted)]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t(item.label)}</span>
            </button>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 whitespace-nowrap rounded-full py-1 text-[10px] tracking-[0.18em] transition ${
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
      className="tc-store-footer relative overflow-hidden border-t text-[var(--text)]"
      style={{
        borderColor: 'var(--border)',
        boxShadow: 'inset 0 1px 0 color-mix(in srgb, var(--text) 6%, transparent)',
      }}
    >
      <div className="pointer-events-none absolute -right-28 -top-36 h-96 w-96 rounded-full border border-[var(--border)] opacity-50 blur-sm" />
      <div className="pointer-events-none absolute -right-8 -top-16 h-72 w-72 rounded-full border border-[var(--border)]" />
      <div className="relative mx-auto max-w-[1440px] px-4 py-10 sm:py-12 md:px-8 md:py-16 lg:px-12">
        <div className="mb-10 flex flex-col gap-4 border-b border-[var(--border)] pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--muted)]">
              {t('Puff Jo / Jordan')}
            </div>
            <div className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] md:text-5xl">
              {t('Your trusted vape shop in Jordan.')}
            </div>
          </div>
          <div className="max-w-xs text-sm leading-6 text-[var(--text-secondary)] md:text-right">
            {t(
              'Shop trusted devices, flavors, pods, coils, and accessories with delivery across Jordan.'
            )}
          </div>
        </div>
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="max-w-md text-center sm:text-left">
            <Link href="/" className="inline-flex items-center gap-3 sm:gap-4">
              <span className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden sm:h-20 sm:w-24">
                <BrandLogo className="h-full w-full object-contain" />
              </span>
              <span>
                <span className="block text-base font-black uppercase leading-tight sm:text-lg md:text-xl">
                  {storefrontBrandName}
                </span>
                <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] sm:text-[10px] md:text-[11px]">
                  {t('Your vape setup, sorted')}
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-[var(--text-secondary)] sm:mt-5 sm:leading-7">
              {t(
                'Genuine vape gear, popular flavors, and everyday accessories for customers across Jordan.'
              )}
            </p>
            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:flex lg:flex-wrap">
              <FooterInfo icon={Clock} label="Hours" value="12 PM - 2 AM" />
              <FooterInfo icon={Phone} label="Phone" value={settings.supportPhone} />
              <FooterInfo icon={MapPin} label="Delivery" value="Delivery across Jordan" />
            </div>
          </div>

          <FooterColumn
            title="SHOP"
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

          <div className="lg:pt-0">
            <FooterColumn
              title="FOLLOW"
              links={[
                { label: 'INSTAGRAM', href: settings.socials.instagram },
                { label: 'PRIVACY POLICY', href: '/privacy-policy' },
                { label: 'TERMS', href: '/terms' },
              ]}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-[var(--border)] pt-4 text-center text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)] sm:text-xs md:mt-12 md:flex-row md:items-center md:justify-between md:pt-6">
          <span>© 2026 {storefrontBrandName}</span>
          <span className="text-[var(--accent)]">
            {t('BETTER CLOUDS, FAST DELIVERY, QUALITY GEAR')}
          </span>
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
    <div className="inline-flex w-full items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 shadow-[0_10px_28px_rgba(24,18,17,0.04)] lg:w-auto">
      <Icon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
      <div className="min-w-0">
        <div className="text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--muted)] sm:text-[9px]">
          {t(label)}
        </div>
        <div className="mt-0.5 text-[10px] font-black uppercase leading-4 text-[var(--text)] sm:text-[11px]">
          {t(value)}
        </div>
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
      <div className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--accent)] sm:mb-5 sm:text-xs">
        {t(title)}
      </div>
      <div className="grid gap-2.5 text-sm font-semibold text-[var(--text-secondary)] sm:space-y-3 sm:gap-0">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="block text-xs transition hover:translate-x-1 hover:text-[var(--accent)] sm:text-sm"
          >
            {t(link.label)}
          </Link>
        ))}
      </div>
    </div>
  );
}

function AccountDrawer({
  open,
  onClose,
  session,
}: {
  open: boolean;
  onClose: () => void;
  session: CustomerSession | null;
}) {
  const { t, locale } = useLocale();
  const { isDark } = useThemeMode();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isRtl = locale === 'ar';

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  const initials =
    session?.fullName
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'PU';

  const accountLinks = [
    { label: 'My Profile', href: '/profile', icon: UserRound },
    { label: 'My Orders', href: '/orders', icon: Package },
    { label: 'Saved Addresses', href: '/addresses', icon: MapPinned },
    { label: 'Favorites', href: '/favorites', icon: Heart },
  ];

  const supportLinks = [
    { label: 'Contact Us', href: '/contact-us', icon: CircleHelp },
    { label: 'Help / FAQ', href: '/faq', icon: CircleHelp },
  ];

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            onClick={onClose}
            aria-label={t('Close account drawer')}
            className="fixed inset-0 z-[60] bg-black/[.35] backdrop-blur-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-drawer-title"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
            initial={{ opacity: 0, x: isRtl ? -24 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? -24 : 24 }}
            transition={{ duration: 0.29, ease: 'easeOut' }}
            className={`fixed inset-y-0 z-[70] flex w-[min(92vw,440px)] flex-col border-[var(--border)] p-5 sm:p-7 ${isRtl ? 'left-0 border-r' : 'right-0 border-l'}`}
            style={{
              background: isDark
                ? 'color-mix(in srgb, var(--background) 94%, white 6%)'
                : 'color-mix(in srgb, var(--card) 96%, black 4%)',
              boxShadow: isRtl ? '12px 0 40px rgba(0,0,0,0.18)' : '-12px 0 40px rgba(0,0,0,0.18)',
            }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-6">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--muted)]">
                  {t('YOUR ACCOUNT')}
                </div>
                <h2
                  id="account-drawer-title"
                  className="mt-2 font-display text-3xl uppercase leading-none"
                >
                  {session ? t('Account') : t('Welcome')}
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label={t('Close account drawer')}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition hover:border-[var(--text)] hover:text-[var(--text)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {session ? (
              <div className="border-b border-[var(--border)] py-7">
                <div className="flex items-center gap-4">
                  {session.avatarUrl ? (
                    <img
                      src={session.avatarUrl}
                      alt=""
                      className="h-16 w-16 rounded-full border border-[var(--border)] object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-sm font-bold tracking-[0.12em] text-[var(--text)]">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-xl font-bold text-[var(--text)]">
                      {session.fullName}
                    </div>
                    <div className="mt-1 truncate text-sm text-[var(--text-secondary)]">
                      {session.email}
                    </div>
                    {session.phone ? (
                      <div className="mt-0.5 text-xs text-[var(--muted)]">{session.phone}</div>
                    ) : null}
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="group mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.23em] text-[var(--text-secondary)] transition hover:text-[var(--text)]"
                >
                  {t('VIEW PROFILE')}{' '}
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180">
                    →
                  </span>
                </Link>
              </div>
            ) : (
              <div className="border-b border-[var(--border)] py-9">
                <p className="max-w-xs text-lg font-semibold leading-7 text-[var(--text)]">
                  {t('Sign in to view orders, favorites and manage your profile.')}
                </p>
                <div className="mt-7 grid gap-3">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--text)] px-5 text-xs font-bold uppercase tracking-[0.2em]"
                    style={{ color: 'var(--background)' }}
                  >
                    {t('SIGN IN')}
                  </Link>
                  <Link
                    href="/register"
                    onClick={onClose}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border)] px-5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--text)] transition hover:bg-[var(--surface)]"
                  >
                    {t('CREATE ACCOUNT')}
                  </Link>
                </div>
              </div>
            )}

            {session ? (
              <div className="min-h-0 flex-1 overflow-y-auto py-6">
                <AccountDrawerSection label={t('ACCOUNT')} links={accountLinks} onClose={onClose} />
                <div className="mt-7">
                  <div className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--muted)]">
                    {t('SETTINGS')}
                  </div>
                  <AccountDrawerRow
                    icon={Languages}
                    label={t('Language')}
                    value={locale === 'ar' ? 'العربية' : 'English'}
                  >
                    <LocaleSwitcher />
                  </AccountDrawerRow>
                  <AccountDrawerRow
                    icon={Settings2}
                    label={t('Theme')}
                    value={isDark ? t('Dark') : t('Light')}
                  >
                    <ThemeSwitcher />
                  </AccountDrawerRow>
                </div>
                <div className="mt-7">
                  <AccountDrawerSection
                    label={t('SUPPORT')}
                    links={supportLinks}
                    onClose={onClose}
                  />
                </div>
              </div>
            ) : null}

            <div className="mt-auto border-t border-[var(--border)] pt-4">
              {session ? <AccountDrawerLogoutButton /> : null}
              <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]">
                <span>PUFF JO</span>
                <span>Jordan</span>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function AccountDrawerSection({
  label,
  links,
  onClose,
}: {
  label: string;
  links: Array<{ label: string; href: string; icon: ComponentType<{ className?: string }> }>;
  onClose: () => void;
}) {
  return (
    <div>
      <div className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--muted)]">
        {label}
      </div>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="group flex h-14 items-center gap-3 border-b border-[var(--border)] text-sm font-semibold text-[var(--text)] transition first:border-t hover:bg-[var(--surface)]"
          >
            <Icon className="h-4 w-4 shrink-0 text-[var(--muted)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--text)]" />
            <span className="flex-1">{link.label}</span>
            <span className="text-lg font-normal text-[var(--muted)] transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function AccountDrawerRow({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-14 items-center gap-3 border-b border-[var(--border)] text-sm font-semibold text-[var(--text)]">
      <Icon className="h-4 w-4 shrink-0 text-[var(--muted)]" />
      <span className="flex-1">{label}</span>
      <span className="mr-1 text-xs font-normal text-[var(--muted)]">{value}</span>
      {children}
    </div>
  );
}

function AccountDrawerLogoutButton() {
  const { t } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await fetch('/api/auth/logout', { method: 'POST' });
          router.push('/login');
          router.refresh();
        })
      }
      className="group flex h-12 w-full items-center gap-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--error)] disabled:opacity-50"
    >
      <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      <span>{isPending ? t('PLEASE WAIT') : t('SIGN OUT')}</span>
    </button>
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
            style={{ background: isDark ? '#0d0d0f' : '#f5f5f3' }}
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
                    key={line.lineId}
                    className="flex gap-4 rounded-[24px] border border-white/8 bg-white/3 p-3"
                  >
                    <img
                      src={line.product.images[0]?.url || '/products/puff-jo-product-default.png'}
                      alt={localize(line.product.name, line.product.nameAr)}
                      className="h-28 w-24 rounded-[18px] bg-[var(--background-secondary)] object-contain p-1"
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
                      {line.selections.length ? (
                        <div className="mt-3 space-y-1.5">
                          {line.selections.map((selection) => (
                            <div
                              key={selection.groupId}
                              className="rounded-[14px] border border-white/8 bg-white/4 px-3 py-2"
                            >
                              <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                                {localize(selection.groupName, selection.groupNameAr)}
                              </div>
                              <div className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                {selection.items
                                  .map((item) => {
                                    const label = localize(item.name, item.nameAr);
                                    return item.priceDelta > 0
                                      ? `${label} +${formatCurrency(item.priceDelta)}`
                                      : label;
                                  })
                                  .join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm">{formatCurrency(line.variant.price)}</div>
                        <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                          >
                            -
                          </button>
                          <span>{line.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(line.lineId)}
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
                    {t('Start with a device, a fresh flavor, or a new everyday essential.')}
                  </p>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm tracking-[0.2em]"
                    style={{ color: 'var(--background)' }}
                  >
                    {t('VIEW SHOP')}
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
              background: isDark ? '#111112' : '#f5f5f3',
            }}
          >
            <div className="grid md:grid-cols-[1.05fr_0.95fr]">
              <img
                src={imageSrc}
                alt={sale.title}
                className="h-[260px] w-full bg-[var(--background-secondary)] object-contain md:h-full"
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
