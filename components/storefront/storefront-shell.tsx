"use client";

import {
  ActionIcon,
  Box,
  Button,
  Drawer,
  Group,
  Image,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { MotionBox } from "@/components/storefront/ui/motion-box";

import { AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
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
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ComponentType,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  LocaleSwitcher,
  useLocale,
} from "@/components/storefront/locale-provider";
import {
  ThemeSwitcher,
  useThemeMode,
} from "@/components/storefront/theme-provider";
import { FlashSale, NavigationItem, StoreSettings } from "@/lib/commerce-types";
import { formatCurrency } from "@/lib/commerce-utils";
import { getCartProducts, useCartStore } from "@/stores/use-cart-store";
import { useUiStore } from "@/stores/use-ui-store";
import type { CustomerSession } from "@/lib/customer/auth";
import { CartLineCard } from "@/components/storefront/ui/cart-line-card";

const mobileNav = [
  { label: "HOME", href: "/", icon: Home },
  { label: "SHOP", href: "/shop", icon: Package },
  { label: "♡", href: "/favorites", icon: Heart },
  { label: "CART", href: "/cart", icon: ShoppingBag },
  { label: "YOU", href: "/account", icon: User },
];

const storefrontBrandName = "Puff Jo";

function BrandLogo({
  className,
  alt = "",
}: {
  className: string;
  alt?: string;
}) {
  const { isDark } = useThemeMode();

  return (
    <Image
      src={isDark ? "/puff-jordan-logo.png" : "/puff-jordan-logo-light.png"}
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
  const { isCartOpen, openCart, closeCart, toasts, dismissToast, pushToast } =
    useUiStore();
  const items = useCartStore((state) => state.items);
  const isCheckout = pathname.startsWith("/checkout");
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new Event("storefront:route-ready"));
  }, [pathname]);

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
    <Box
      component="div"
      className="min-h-screen bg-[var(--background)] text-[var(--text)]"
    >
      <AnnouncementBar text={t(settings.announcement)} />
      <Header
        brandName={storefrontBrandName}
        currentPath={pathname}
        cartCount={items.reduce((sum, item) => sum + item.quantity, 0)}
        scrolled={scrolled || pathname !== "/"}
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
      <Box component="main" className="pb-24 md:pb-10">
        {children}
      </Box>
      {!isCheckout ? (
        <MobileBottomNav onAccount={() => setAccountOpen(true)} />
      ) : null}
      <Footer settings={settings} navigationItems={navigationItems} />
      <CartDrawer open={isCartOpen} onClose={closeCart} />
      <AccountDrawer
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        session={customerSession}
      />
      <FlashSaleModal sale={flashSale} />
      <ToastViewport toasts={toasts} dismissToast={dismissToast} />
    </Box>
  );
}

function AnnouncementBar({ text }: { text: string }) {
  return (
    <Box
      component="div"
      className="border-b px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-white md:text-xs"
      style={{
        borderColor: "rgba(0,0,0,0.08)",
        background:
          "linear-gradient(90deg, #050505 0%, #333333 48%, #050505 100%)",
      }}
    >
      {text}
    </Box>
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
  const navHoverClassName = isDark ? "hover:text-white" : "hover:text-black";
  const badgeTextColor = "#ffffff";
  const controlBorderColor = isDark
    ? "rgba(255,255,255,0.14)"
    : "rgba(0,0,0,0.16)";
  const controlBackground = isDark ? "rgba(255,255,255,0.06)" : "#ffffff";
  const headerBackground = isDark
    ? "rgba(8,8,8,0.9)"
    : "rgba(255,255,255,0.94)";
  const headerTextColor = isDark ? "var(--text)" : "#181211";
  const secondaryTextColor = isDark ? "var(--text-secondary)" : "#5f514b";
  const badgeBackground = "var(--accent)";
  return (
    <Box
      component="header"
      className={`sticky top-0 z-40 transition duration-300 ${
        scrolled ? "border-b backdrop-blur-xl" : "backdrop-blur-xl"
      }`}
      style={{
        borderColor: scrolled ? "var(--border)" : "transparent",
        background: isDark && !scrolled ? "transparent" : headerBackground,
        color: headerTextColor,
      }}
    >
      <Box
        component="div"
        className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 md:px-8 lg:px-12"
      >
        <Box component="div" className="flex items-center gap-3">
          <Box
            component="button"
            type="button"
            onClick={onMenu}
            className="rounded-full border p-2 text-[var(--text)] lg:hidden"
            style={{
              borderColor: controlBorderColor,
              background: controlBackground,
            }}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Box>

          <Link
            href="/"
            className="inline-flex h-10 items-center justify-start transition hover:-translate-y-0.5"
            aria-label={brandName}
          >
            <BrandLogo className="h-10 w-auto object-contain" />

            <Box component="span" className="sr-only">
              {brandName}
            </Box>
          </Link>
        </Box>

        <Box
          component="nav"
          className="storefront-nav hidden min-w-0 max-w-[46rem] flex-1 items-center justify-start gap-1 overflow-visible text-[11px] font-bold uppercase tracking-[0.16em] lg:flex"
          style={{
            color: secondaryTextColor,
            borderColor: "transparent",
            background: "transparent",
          }}
        >
          {navigationItems.map((item) => (
            <Box component="div" key={item.id} className="group relative">
              <Link
                href={item.path}
                aria-haspopup={item.children?.length ? "menu" : undefined}
                aria-current={currentPath === item.path ? "page" : undefined}
                className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-2 py-3 transition ${navHoverClassName} ${currentPath === item.path ? "border-[var(--accent)] text-[var(--text)]" : "border-transparent text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text)]"}`}
              >
                <Box component="span">{localize(item.label, item.labelAr)}</Box>
                {item.children?.length ? (
                  <Box
                    component="span"
                    className="text-[8px] opacity-60 transition duration-200 group-hover:opacity-100"
                  >
                    ▾
                  </Box>
                ) : null}
              </Link>
              {item.children?.length ? (
                <Box
                  component="div"
                  className="invisible absolute left-0 top-[calc(100%-1px)] z-50 min-w-64 pt-2 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
                >
                  <Box
                    component="div"
                    className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--background)] shadow-[0_18px_40px_rgba(0,0,0,0.16)]"
                  >
                    <Box component="div" className="space-y-0.5 p-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.path}
                          className="block whitespace-nowrap rounded-[12px] border border-transparent px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--text-secondary)] transition hover:border-[var(--border)] hover:bg-[var(--card)] hover:text-[var(--text)]"
                        >
                          {localize(child.label, child.labelAr)}
                        </Link>
                      ))}
                    </Box>
                  </Box>
                </Box>
              ) : null}
            </Box>
          ))}
        </Box>

        <Box
          component="div"
          className="flex items-center gap-2 md:gap-3"
          style={{ color: secondaryTextColor }}
        >
          <Box component="div" className="hidden lg:block">
            <LocaleSwitcher />
          </Box>
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
            className={`hidden rounded-full border p-2 transition lg:inline-flex ${navHoverClassName}`}
            style={{
              borderColor: controlBorderColor,
              background: controlBackground,
            }}
          >
            <Heart className="h-4 w-4" />
          </Link>
          <Link
            href="/account"
            data-no-route-loader
            onClick={(event) => {
              event.preventDefault();
              onAccount();
            }}
            className={`hidden rounded-full border p-2 transition lg:inline-flex ${navHoverClassName}`}
            style={{
              borderColor: controlBorderColor,
              background: controlBackground,
            }}
          >
            <User className="h-4 w-4" />
          </Link>
          <Box
            component="button"
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
              <Box
                component="span"
                className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px]"
                style={{ color: badgeTextColor, background: badgeBackground }}
              >
                {cartCount}
              </Box>
            ) : null}
          </Box>
          <Link
            href="/shop"
            className="!text-black hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] shadow-[0_14px_32px_rgba(255,255,255,0.14)] transition hover:-translate-y-0.5 hover:bg-neutral-200 lg:inline-flex"
          >
            <Cloud className="h-4 w-4" />
            {t("ORDER NOW")}
          </Link>
        </Box>
      </Box>
    </Box>
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
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );

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
          <MotionBox
            component="button"
            type="button"
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <MotionBox
            component="aside"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="storefront-nav fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm flex-col border-r border-[var(--border)] px-5 py-5 shadow-[0_25px_60px_rgba(0,0,0,0.28)]"
            style={{ background: isDark ? "#0d0d0f" : "#f5f5f3" }}
          >
            <Box
              component="div"
              className="mb-6 flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4"
            >
              <Box component="div" className="flex min-w-0 items-center gap-3">
                <Box
                  component="span"
                  className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.2)]"
                >
                  <BrandLogo className="h-full w-full object-cover" />
                </Box>
                <Box component="div" className="min-w-0">
                  <Box
                    component="div"
                    className="truncate text-base font-black uppercase text-[var(--text)]"
                  >
                    {brandName}
                  </Box>
                  <Box
                    component="div"
                    className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]"
                  >
                    Vape / Smoke / Repeat
                  </Box>
                </Box>
              </Box>
              <Box
                component="button"
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <X className="h-4 w-4" />
              </Box>
            </Box>

            <Box
              component="div"
              className="mb-5 flex items-center justify-between gap-3 rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-3 py-2.5"
            >
              <LocaleSwitcher />
              <ThemeSwitcher />
            </Box>

            <Box
              component="div"
              className="space-y-2 whitespace-nowrap text-base font-bold uppercase tracking-[0.12em]"
            >
              {navigationItems.map((item) => {
                const isExpanded = Boolean(expandedItems[item.id]);

                return (
                  <Box
                    component="div"
                    key={item.id}
                    className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--card)]"
                  >
                    {item.children?.length ? (
                      <>
                        <Box
                          component="button"
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left text-[var(--text)] transition hover:bg-[color:color-mix(in_srgb,var(--accent)_12%,var(--card))] hover:text-[var(--accent)]"
                        >
                          <Box component="span">
                            {localize(item.label, item.labelAr)}
                          </Box>
                          <Box
                            component="span"
                            className={`text-[10px] transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          >
                            ▾
                          </Box>
                        </Box>
                        <AnimatePresence initial={false}>
                          {isExpanded ? (
                            <MotionBox
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <Box
                                component="div"
                                className="space-y-1 border-t border-[var(--border)] bg-[color:color-mix(in_srgb,var(--background)_92%,transparent)] px-3 py-2 text-sm tracking-[0.12em] text-[var(--text-secondary)]"
                              >
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
                              </Box>
                            </MotionBox>
                          ) : null}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={item.path}
                        onClick={onClose}
                        className="flex items-center justify-between px-4 py-3 text-[var(--text)] transition hover:bg-[color:color-mix(in_srgb,var(--accent)_12%,var(--card))] hover:text-[var(--accent)]"
                      >
                        <Box component="span">
                          {localize(item.label, item.labelAr)}
                        </Box>
                      </Link>
                    )}
                  </Box>
                );
              })}

              <Link
                href="/account"
                onClick={onClose}
                className="mt-2 block rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[color:color-mix(in_srgb,var(--accent)_12%,var(--card))] hover:text-[var(--accent)]"
              >
                {t("ACCOUNT")}
              </Link>
            </Box>
          </MotionBox>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function MobileBottomNav({ onAccount }: { onAccount: () => void }) {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <Box
      component="div"
      className="storefront-nav fixed inset-x-4 bottom-4 z-30 rounded-full border px-3 py-2 backdrop-blur-xl md:hidden"
      style={{
        borderColor: "var(--border)",
        background: "color-mix(in srgb, var(--background) 78%, transparent)",
      }}
    >
      <Box component="div" className="grid grid-cols-5 gap-2">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={
                item.href === "/account"
                  ? (event) => {
                      event.preventDefault();
                      onAccount();
                    }
                  : undefined
              }
              className={`flex h-12 w-full min-w-0 flex-col items-center justify-center gap-1 whitespace-nowrap rounded-full px-0 text-[10px] tracking-[0.18em] transition ${
                active ? "scale-105 text-white" : "text-[var(--muted)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <Box component="span">{t(item.label)}</Box>
            </Link>
          );
        })}
      </Box>
    </Box>
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
    <Box
      component="footer"
      className="tc-store-footer relative overflow-hidden border-t text-[var(--text)]"
      style={{
        borderColor: "var(--border)",
        boxShadow:
          "inset 0 1px 0 color-mix(in srgb, var(--text) 6%, transparent)",
      }}
    >
      <Box
        component="div"
        className="pointer-events-none absolute -right-28 -top-36 h-96 w-96 rounded-full border border-[var(--border)] opacity-50 blur-sm"
      />
      <Box
        component="div"
        className="pointer-events-none absolute -right-8 -top-16 h-72 w-72 rounded-full border border-[var(--border)]"
      />
      <Box
        component="div"
        className="relative mx-auto max-w-[1440px] px-4 py-10 sm:py-12 md:px-8 md:py-16 lg:px-12"
      >
        <Box
          component="div"
          className="mb-10 flex flex-col gap-4 border-b border-[var(--border)] pb-8 xl:flex-row xl:items-end xl:justify-between"
        >
          <Box component="div">
            <Box
              component="div"
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--muted)]"
            >
              {t("Puff Jo / Jordan")}
            </Box>
            <Box
              component="div"
              className="mt-3 max-w-2xl text-3xl font-black uppercase leading-[0.98] tracking-[-0.04em] xl:text-5xl"
            >
              {t("Your trusted vape shop in Jordan.")}
            </Box>
          </Box>
          <Box
            component="div"
            className="max-w-xs text-sm leading-6 text-[var(--text-secondary)] md:text-right"
          >
            {t(
              "Shop trusted devices, flavors, pods, coils, and accessories with delivery across Jordan.",
            )}
          </Box>
        </Box>
        <Box
          component="div"
          className="grid min-w-0 grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-12 xl:grid-cols-[1.5fr_repeat(3,1fr)] xl:gap-10"
        >
          <Box
            component="div"
            className="col-span-1 max-w-md text-center sm:col-span-2 sm:text-left xl:col-span-1"
          >
            <Link href="/" className="inline-flex items-center gap-3 sm:gap-4">
              <Box
                component="span"
                className="inline-flex h-10 items-center justify-start transition hover:-translate-y-0.5"
              >
                <BrandLogo className="h-10 w-auto object-contain" />{" "}
              </Box>
              <Box component="span">
                <Box
                  component="span"
                  className="block text-base font-black uppercase leading-tight sm:text-lg md:text-xl"
                >
                  {storefrontBrandName}
                </Box>
                <Box
                  component="span"
                  className="mt-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] sm:text-[10px] md:text-[11px]"
                >
                  {t("Your vape setup, sorted")}
                </Box>
              </Box>
            </Link>
            <Box
              component="p"
              className="mt-4 max-w-md text-sm leading-6 text-[var(--text-secondary)] sm:mt-5 sm:leading-7"
            >
              {t(
                "Genuine vape gear, popular flavors, and everyday accessories for customers across Jordan.",
              )}
            </Box>
            <Box
              component="div"
              className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3 xl:flex xl:flex-wrap"
            >
              <FooterInfo icon={Clock} label="Hours" value="12 PM - 2 AM" />
              <FooterInfo
                icon={Phone}
                label="Phone"
                value={settings.supportPhone}
              />
              <FooterInfo
                icon={MapPin}
                label="Delivery"
                value="Delivery across Jordan"
              />
            </Box>
          </Box>

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
              { label: "CONTACT", href: "/contact-us" },
              { label: "DELIVERY", href: "/shipping" },
              { label: "ORDER HELP", href: "/returns" },
              { label: "FAQ", href: "/faq" },
            ]}
          />

          <Box component="div" className="sm:col-span-2 xl:col-span-1 xl:pt-0">
            <FooterColumn
              title="FOLLOW"
              links={[
                { label: "INSTAGRAM", href: settings.socials.instagram },
                { label: "PRIVACY POLICY", href: "/privacy-policy" },
                { label: "TERMS", href: "/terms" },
              ]}
            />
          </Box>
        </Box>

        <Box
          component="div"
          className="mt-8 flex flex-col gap-2 border-t border-[var(--border)] pt-4 text-center text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)] sm:text-xs xl:mt-12 xl:flex-row xl:items-center xl:justify-between xl:pt-6"
        >
          <Box component="span">© 2026 {storefrontBrandName}</Box>
          <Box component="span" className="text-[var(--accent)]">
            {t("BETTER CLOUDS, FAST DELIVERY, QUALITY GEAR")}
          </Box>
        </Box>
      </Box>
    </Box>
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
    <Box
      component="div"
      className="inline-flex w-full items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 shadow-[0_10px_28px_rgba(24,18,17,0.04)] lg:w-auto"
    >
      <Icon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
      <Box component="div" className="min-w-0">
        <Box
          component="div"
          className="text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--muted)] sm:text-[9px]"
        >
          {t(label)}
        </Box>
        <Box
          component="div"
          className="mt-0.5 text-[10px] font-black uppercase leading-4 text-[var(--text)] sm:text-[11px]"
        >
          {t(value)}
        </Box>
      </Box>
    </Box>
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
    <Box component="div">
      <Box
        component="div"
        className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--accent)] sm:mb-5 sm:text-xs"
      >
        {t(title)}
      </Box>
      <Box
        component="div"
        className="grid gap-2.5 text-sm font-semibold text-[var(--text-secondary)] sm:space-y-3 sm:gap-0"
      >
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="block text-xs transition hover:translate-x-1 hover:text-[var(--accent)] sm:text-sm"
          >
            {t(link.label)}
          </Link>
        ))}
      </Box>
    </Box>
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
  const isRtl = locale === "ar";
  const ForwardArrow = isRtl ? ArrowLeft : ArrowRight;

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const initials =
    session?.fullName
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "PU";

  const accountLinks = [
    { label: t("My Profile"), href: "/profile", icon: UserRound },
    { label: t("My Orders"), href: "/orders", icon: Package },
    { label: t("Saved Addresses"), href: "/addresses", icon: MapPinned },
    { label: t("Favorites"), href: "/favorites", icon: Heart },
  ];

  const supportLinks = [
    { label: t("Contact Us"), href: "/contact-us", icon: CircleHelp },
    { label: t("Help / FAQ"), href: "/faq", icon: CircleHelp },
  ];

  return (
    <AnimatePresence>
      {open ? (
        <>
          <MotionBox
            component="button"
            type="button"
            onClick={onClose}
            aria-label={t("Close account drawer")}
            className="fixed inset-0 z-[60] bg-black/[.35] backdrop-blur-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: "easeOut" }}
          />
          <MotionBox
            key={`account-drawer-${locale}`}
            component="aside"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-drawer-title"
            dir={locale === "ar" ? "rtl" : "ltr"}
            initial={{ opacity: 0, x: isRtl ? -24 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? -24 : 24 }}
            transition={{ duration: 0.29, ease: "easeOut" }}
            className={`fixed inset-y-0 z-[70] flex w-[min(92vw,440px)] flex-col border-[var(--border)] p-5 sm:p-7 ${isRtl ? "left-0 border-r" : "right-0 border-l"}`}
            style={{
              background: isDark
                ? "color-mix(in srgb, var(--background) 94%, white 6%)"
                : "color-mix(in srgb, var(--card) 96%, black 4%)",
              boxShadow: isRtl
                ? "12px 0 40px rgba(0,0,0,0.18)"
                : "-12px 0 40px rgba(0,0,0,0.18)",
            }}
          >
            <Box
              component="div"
              className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-6"
            >
              <Box component="div">
                <Box
                  component="div"
                  className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--muted)]"
                >
                  {t("YOUR ACCOUNT")}
                </Box>
                <Box
                  component="h2"
                  id="account-drawer-title"
                  className="mt-2 font-display text-3xl uppercase leading-none"
                >
                  {session ? t("Account") : t("Welcome")}
                </Box>
              </Box>
              <Box
                component="button"
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label={t("Close account drawer")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition hover:border-[var(--text)] hover:text-[var(--text)]"
              >
                <X className="h-4 w-4" />
              </Box>
            </Box>

            {session ? (
              <Box
                component="div"
                className="border-b border-[var(--border)] py-7"
              >
                <Box component="div" className="flex items-center gap-4">
                  {session.avatarUrl ? (
                    <Image
                      src={session.avatarUrl}
                      alt=""
                      className="h-16 w-16 rounded-full border border-[var(--border)] object-cover"
                    />
                  ) : (
                    <Box
                      component="div"
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-sm font-bold tracking-[0.12em] text-[var(--text)]"
                    >
                      {initials}
                    </Box>
                  )}
                  <Box component="div" className="min-w-0">
                    <Box
                      component="div"
                      className="truncate text-xl font-bold text-[var(--text)]"
                    >
                      {session.fullName}
                    </Box>
                    <Box
                      component="div"
                      className="mt-1 truncate text-sm text-[var(--text-secondary)]"
                    >
                      {session.email}
                    </Box>
                    {session.phone ? (
                      <Box
                        component="div"
                        className="mt-0.5 text-xs text-[var(--muted)]"
                      >
                        {session.phone}
                      </Box>
                    ) : null}
                  </Box>
                </Box>
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="group mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.23em] text-[var(--text-secondary)] transition hover:text-[var(--text)]"
                >
                  {t("VIEW PROFILE")}{" "}
                  <Box
                    component="span"
                    className={`transition-transform duration-200 ${isRtl ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`}
                  >
                    <ForwardArrow className="h-4 w-4" />
                  </Box>
                </Link>
              </Box>
            ) : (
              <Box
                component="div"
                className="border-b border-[var(--border)] py-9"
              >
                <Box
                  component="p"
                  className="max-w-xs text-lg font-semibold leading-7 text-[var(--text)]"
                >
                  {t(
                    "Sign in to view orders, favorites and manage your profile.",
                  )}
                </Box>
                <Box component="div" className="mt-7 grid gap-3">
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--text)] px-5 text-xs font-bold uppercase tracking-[0.2em]"
                    style={{ color: "var(--background)" }}
                  >
                    {t("SIGN IN")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={onClose}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border)] px-5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--text)] transition hover:bg-[var(--surface)]"
                  >
                    {t("CREATE ACCOUNT")}
                  </Link>
                </Box>
              </Box>
            )}

            {session ? (
              <Box
                component="div"
                className="min-h-0 flex-1 overflow-y-auto py-6"
              >
                <AccountDrawerSection
                  label={t("ACCOUNT")}
                  links={accountLinks}
                  onClose={onClose}
                  isRtl={isRtl}
                />
                <Box component="div" className="mt-7">
                  <Box
                    component="div"
                    className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--muted)]"
                  >
                    {t("SETTINGS")}
                  </Box>
                  <AccountDrawerRow
                    icon={Languages}
                    label={t("Language")}
                    value={locale === "ar" ? "العربية" : "English"}
                  >
                    <LocaleSwitcher />
                  </AccountDrawerRow>
                  <AccountDrawerRow
                    icon={Settings2}
                    label={t("Theme")}
                    value={isDark ? t("Dark") : t("Light")}
                  >
                    <ThemeSwitcher
                      ariaLabel={t(
                        isDark
                          ? "Switch to light theme"
                          : "Switch to dark theme",
                      )}
                    />
                  </AccountDrawerRow>
                </Box>
                <Box component="div" className="mt-7">
                  <AccountDrawerSection
                    label={t("SUPPORT")}
                    links={supportLinks}
                    onClose={onClose}
                    isRtl={isRtl}
                  />
                </Box>
              </Box>
            ) : null}

            <Box
              component="div"
              className="mt-auto border-t border-[var(--border)] pt-4"
            >
              {session ? <AccountDrawerLogoutButton /> : null}
              <Box
                component="div"
                className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-[var(--muted)]"
              >
                <Box component="span">PUFF JO</Box>
                <Box component="span">{t("Jordan")}</Box>
              </Box>
            </Box>
          </MotionBox>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function AccountDrawerSection({
  label,
  links,
  onClose,
  isRtl,
}: {
  label: string;
  links: Array<{
    label: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
  }>;
  onClose: () => void;
  isRtl: boolean;
}) {
  const ForwardArrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <Box component="div">
      <Box
        component="div"
        className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--muted)]"
      >
        {label}
      </Box>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="group flex h-14 items-center gap-3 border-b border-[var(--border)] text-sm font-semibold text-[var(--text)] transition first:border-t hover:bg-[var(--surface)]"
          >
            <Icon
              className={`h-4 w-4 shrink-0 text-[var(--muted)] transition-transform duration-200 group-hover:text-[var(--text)] ${isRtl ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`}
            />
            <Box component="span" className="flex-1">
              {link.label}
            </Box>
            <Box
              component="span"
              className={`text-lg font-normal text-[var(--muted)] transition-transform duration-200 ${isRtl ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`}
            >
              <ForwardArrow className="h-4 w-4" />
            </Box>
          </Link>
        );
      })}
    </Box>
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
    <Box
      component="div"
      className="flex min-h-14 items-center gap-3 border-b border-[var(--border)] text-sm font-semibold text-[var(--text)]"
    >
      <Icon className="h-4 w-4 shrink-0 text-[var(--muted)]" />
      <Box component="span" className="flex-1">
        {label}
      </Box>
      <Box
        component="span"
        className="mr-1 text-xs font-normal text-[var(--muted)]"
      >
        {value}
      </Box>
      {children}
    </Box>
  );
}

function AccountDrawerLogoutButton() {
  const { t } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <Box
      component="button"
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/login");
          router.refresh();
        })
      }
      className="group flex h-12 w-full items-center gap-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--error)] disabled:opacity-50"
    >
      <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      <Box component="span">{isPending ? t("PLEASE WAIT") : t("SIGN OUT")}</Box>
    </Box>
  );
}

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const lines = useMemo(() => getCartProducts(items), [items]);

  const { t } = useLocale();

  const subtotal = lines.reduce(
    (sum, line) => sum + line.variant.price * line.quantity,
    0,
  );

  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <Drawer
      opened={open}
      onClose={onClose}
      position="right"
      size="min(440px, 100vw)"
      padding={0}
      overlayProps={{
        backgroundOpacity: 0.5,
        blur: 3,
      }}
      title={
        <Box>
          <Title order={2} fz={20} fw={700}>
            {t("Shopping Cart")}
          </Title>

          <Text mt={2} size="xs" c="dimmed">
            {totalQuantity} {t(totalQuantity === 1 ? "item" : "items")}
          </Text>
        </Box>
      }
      styles={{
        header: {
          padding: "18px 20px",
          borderBottom: "1px solid var(--mantine-color-default-border)",
        },

        content: {
          background: "var(--mantine-color-body)",
        },

        body: {
          padding: 0,
          height: "calc(100% - 70px)",
        },
      }}
    >
      <Box
        h="100%"
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Items */}
        <ScrollArea
          style={{
            flex: 1,
            minHeight: 0,
          }}
          offsetScrollbars
        >
          <Box p={{ base: "md", sm: "lg" }}>
            {lines.length ? (
              <Stack gap="sm">
                {lines.map((line) => {
                  const productName = line.product.name;

                  const productImage =
                    line.product.images[0]?.url ||
                    "/products/puff-jo-product-default.png";

                  const maxQuantity = line.variant.allowBackorder
                    ? 99
                    : Math.max(1, line.variant.stockQuantity);

                  return (
                    <Paper key={line.lineId} withBorder radius="md" p="sm">
                      <Group align="flex-start" wrap="nowrap" gap="sm">
                        {/* Image */}
                        <Image
                          src={productImage}
                          alt={productName}
                          w={78}
                          h={78}
                          radius="sm"
                          fit="contain"
                          p={5}
                          fallbackSrc="/products/puff-jo-product-default.png"
                          style={{
                            flexShrink: 0,
                            background: "var(--mantine-color-default-hover)",
                          }}
                        />

                        {/* Info */}
                        <Box
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <Group
                            justify="space-between"
                            align="flex-start"
                            gap="xs"
                            wrap="nowrap"
                          >
                            <Box
                              style={{
                                minWidth: 0,
                              }}
                            >
                              <Text size="sm" fw={600} lineClamp={2} lh={1.35}>
                                {productName}
                              </Text>

                              {line.variant.size ? (
                                <Text mt={3} size="xs" c="dimmed">
                                  {line.variant.size}
                                </Text>
                              ) : null}
                            </Box>

                            <ActionIcon
                              variant="subtle"
                              color="red"
                              radius="md"
                              size="sm"
                              onClick={() => removeItem(line.lineId)}
                              aria-label={t("REMOVE")}
                            >
                              <Trash2 size={15} />
                            </ActionIcon>
                          </Group>

                          {/* Bottom section */}
                          <Group
                            mt="sm"
                            justify="space-between"
                            align="center"
                            gap="xs"
                          >
                            <Group
                              gap={0}
                              wrap="nowrap"
                              style={{
                                border:
                                  "1px solid var(--mantine-color-default-border)",
                                borderRadius: "var(--mantine-radius-sm)",
                                overflow: "hidden",
                              }}
                            >
                              <ActionIcon
                                variant="transparent"
                                color="gray"
                                radius={0}
                                size={30}
                                disabled={line.quantity <= 1}
                                onClick={() =>
                                  updateQuantity(
                                    line.lineId,
                                    Math.max(1, line.quantity - 1),
                                  )
                                }
                              >
                                <Minus size={13} />
                              </ActionIcon>

                              <Box
                                w={30}
                                h={30}
                                style={{
                                  display: "grid",
                                  placeItems: "center",
                                  borderLeft:
                                    "1px solid var(--mantine-color-default-border)",
                                  borderRight:
                                    "1px solid var(--mantine-color-default-border)",
                                }}
                              >
                                <Text size="xs" fw={600}>
                                  {line.quantity}
                                </Text>
                              </Box>

                              <ActionIcon
                                variant="transparent"
                                color="gray"
                                radius={0}
                                size={30}
                                disabled={
                                  !line.variant.allowBackorder &&
                                  line.quantity >= maxQuantity
                                }
                                onClick={() =>
                                  updateQuantity(
                                    line.lineId,
                                    Math.min(maxQuantity, line.quantity + 1),
                                  )
                                }
                              >
                                <Plus size={13} />
                              </ActionIcon>
                            </Group>

                            <Text size="sm" fw={700}>
                              {formatCurrency(
                                line.variant.price * line.quantity,
                              )}
                            </Text>
                          </Group>
                        </Box>
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            ) : (
              <Stack align="center" ta="center" py={60} gap="md">
                <Box
                  w={54}
                  h={54}
                  style={{
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background: "var(--mantine-color-default-hover)",
                  }}
                >
                  <ShoppingBag size={22} strokeWidth={1.5} />
                </Box>

                <Box>
                  <Text fw={700} fz={18}>
                    {t("Your cart is empty")}
                  </Text>

                  <Text mt={5} size="sm" c="dimmed" maw={260}>
                    {t("Add some products to your cart to get started.")}
                  </Text>
                </Box>

                <Button
                  component={Link}
                  href="/shop"
                  onClick={onClose}
                  radius="md"
                  color="dark"
                >
                  {t("Continue Shopping")}
                </Button>
              </Stack>
            )}
          </Box>
        </ScrollArea>

        {/* Footer */}
        {lines.length ? (
          <Box
            p={{ base: "md", sm: "lg" }}
            style={{
              flexShrink: 0,
              borderTop: "1px solid var(--mantine-color-default-border)",
              background: "var(--mantine-color-body)",
            }}
          >
            <Stack gap="md">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {t("Subtotal")}
                </Text>

                <Text fw={700} fz={18}>
                  {formatCurrency(subtotal)}
                </Text>
              </Group>

              <Text size="xs" c="dimmed">
                {t("Shipping and discounts are calculated at checkout.")}
              </Text>

              <Group gap="sm" grow>
                <Button
                  component={Link}
                  href="/cart"
                  onClick={onClose}
                  variant="default"
                  radius="md"
                >
                  {t("View Cart")}
                </Button>

                <Button
                  component={Link}
                  href="/checkout"
                  onClick={onClose}
                  color="dark"
                  radius="md"
                >
                  {t("Checkout")}
                </Button>
              </Group>
            </Stack>
          </Box>
        ) : null}
      </Box>
    </Drawer>
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
    sessionStorage.setItem(`flash-sale-dismissed:${sale.id}`, "true");
    setVisible(false);
  };

  const modalKicker = t("HOT DEAL");
  const modalTitle = sale.modalTitle?.trim() || sale.title;
  const modalDescription = sale.modalDescription?.trim() || sale.description;
  const ctaText = sale.ctaText?.trim() || t("ORDER THE DEAL");
  const imageSrc = sale.image || "/products/product-placeholder.svg";
  const ctaTextColor = isDark ? "#3a1d08" : "#fff7e8";

  return (
    <AnimatePresence>
      {visible ? (
        <>
          <MotionBox
            component="button"
            type="button"
            onClick={dismiss}
            className="fixed inset-0 z-50 bg-black/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <MotionBox
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.35 }}
            className="fixed left-1/2 top-1/2 z-[60] w-[92vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[36px] border"
            style={{
              borderColor: "var(--border)",
              background: isDark ? "#111112" : "#f5f5f3",
            }}
          >
            <Box component="div" className="grid md:grid-cols-[1.05fr_0.95fr]">
              <Image
                src={imageSrc}
                alt={sale.title}
                className="h-[260px] w-full bg-[var(--background-secondary)] object-contain md:h-full"
              />
              <Box
                component="div"
                className="relative flex min-h-[420px] flex-col justify-center p-8 md:p-10"
              >
                <Box
                  component="button"
                  type="button"
                  onClick={dismiss}
                  className="absolute right-5 top-5 rounded-full border border-white/10 p-2"
                >
                  <X className="h-4 w-4" />
                </Box>
                <Box
                  component="div"
                  className="text-xs tracking-[0.28em] text-[var(--muted)]"
                >
                  {modalKicker}
                </Box>
                <Box
                  component="div"
                  className="mt-4 font-display text-5xl uppercase leading-none"
                >
                  {sale.discountLabel}
                </Box>
                <Box
                  component="h3"
                  className="mt-5 max-w-sm text-lg uppercase tracking-[0.18em] text-[var(--text)]"
                >
                  {t(modalTitle)}
                </Box>
                <Box
                  component="p"
                  className="mt-4 max-w-sm text-sm leading-7 text-[var(--text-secondary)]"
                >
                  {t(modalDescription)}
                </Box>
                <Link
                  href={sale.ctaUrl}
                  onClick={dismiss}
                  className="mt-8 inline-flex w-fit rounded-full bg-[var(--text)] px-6 py-3 text-sm tracking-[0.2em] text-black"
                >
                  <Box component="span" style={{ color: ctaTextColor }}>
                    {ctaText}
                  </Box>
                </Link>
              </Box>
            </Box>
          </MotionBox>
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
    const timeouts = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), 3200),
    );

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [toasts, dismissToast]);

  return (
    <Box
      component="div"
      className="pointer-events-none fixed bottom-24 right-4 z-[70] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 md:bottom-6"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <MotionBox
            key={toast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="pointer-events-auto rounded-[24px] border p-4 shadow-2xl"
            style={{
              borderColor: "var(--border)",
              background: "var(--elevated)",
            }}
          >
            <Box component="div" className="text-sm">
              {toast.title}
            </Box>
            {toast.description ? (
              <Box
                component="div"
                className="mt-1 text-xs leading-6 text-[var(--text-secondary)]"
              >
                {toast.description}
              </Box>
            ) : null}
          </MotionBox>
        ))}
      </AnimatePresence>
    </Box>
  );
}
