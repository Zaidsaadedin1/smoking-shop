"use client";

import { Box, Button, Group, Image, Text } from "@mantine/core";
import { MotionBox } from "@/components/storefront/ui/motion-box";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  ShoppingCart,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, MouseEvent, ReactNode, useState } from "react";
import { useLocale } from "@/components/storefront/locale-provider";
import { StoreCategory, StoreProduct } from "@/lib/commerce-types";
import {
  calculateDiscount,
  formatCurrency,
  getCompareAtPrice,
  getPrimaryPrice,
  getPrimaryVariant,
  getProductColors,
  getProductInventory,
} from "@/lib/commerce-utils";
import { useCartStore } from "@/stores/use-cart-store";
import { useUiStore } from "@/stores/use-ui-store";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Box
      component="div"
      className={`min-w-0 w-full px-4 md:px-8 lg:px-12 ${className}`}
    >
      {children}
    </Box>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const { t } = useLocale();

  return (
    <Box
      component="div"
      className="mb-6 flex flex-col gap-4 border-b border-[var(--border)] pb-5 md:mb-8 md:flex-row md:items-end md:justify-between"
    >
      <Box component="div">
        {eyebrow ? (
          <Box
            component="div"
            className="text-[11px] font-medium tracking-[0.3em] text-[var(--muted)]"
          >
            {t(eyebrow)}
          </Box>
        ) : null}
        <Box
          component="h2"
          className="mt-2 break-words text-2xl font-semibold uppercase leading-[1.05] tracking-[0.12em] sm:text-3xl md:text-5xl md:tracking-[0.18em]"
        >
          {t(title)}
        </Box>
        {description ? (
          <Box
            component="p"
            className="mt-3 max-w-xl text-sm leading-7 text-[var(--text-secondary)]"
          >
            {t(description)}
          </Box>
        ) : null}
      </Box>
      {action}
    </Box>
  );
}

export function CategoryMoodCard({ category }: { category: StoreCategory }) {
  const { dir, localize } = useLocale();
  const isRtl = dir === "rtl";

  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="group relative min-h-[360px] overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--card)] shadow-[0_20px_60px_rgba(0,0,0,.2)] transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]"
    >
      <Image
        src={category.image || "/products/puff-jo-product-default.png"}
        alt={localize(category.name, category.nameAr)}
        className="absolute inset-0 h-full w-full bg-[#171717] object-contain mix-blend-screen opacity-80 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-100"
      />
      <Box
        component="div"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,.12),transparent_35%),linear-gradient(to_top,#000_0%,rgba(0,0,0,.2)_65%,transparent_100%)]"
      />
      <Box
        component="div"
        className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-5"
      >
        <Box component="div">
          <Box
            component="div"
            className="text-[11px] tracking-[0.3em] text-[var(--text-secondary)]"
          >
            {localize(category.accent, category.accentAr)}
          </Box>
          <Box
            component="div"
            className="mt-2 text-2xl font-semibold uppercase tracking-[0.18em]"
          >
            {localize(category.name, category.nameAr)}
          </Box>
        </Box>
        {isRtl ? (
          <ArrowLeft className="h-5 w-5 transition duration-500 group-hover:-translate-x-1" />
        ) : (
          <ArrowRight className="h-5 w-5 transition duration-500 group-hover:translate-x-1" />
        )}
      </Box>
    </Link>
  );
}

export function ProductCard({ product }: { product: StoreProduct }) {
  const toggleFavorite = useCartStore((state) => state.toggleFavorite);
  const favorites = useCartStore((state) => state.favorites);
  const { pushToast } = useUiStore();
  const { t, localize } = useLocale();
  const router = useRouter();

  const [added, setAdded] = useState(false);

  const favorite = favorites.includes(product.id);

  const price = getPrimaryPrice(product);
  const compareAtPrice = getCompareAtPrice(product);
  const discount = calculateDiscount(price, compareAtPrice);
  const inventory = getProductInventory(product);
  const primaryVariant = getPrimaryVariant(product);
  const colors = getProductColors(product);

  const productName = localize(product.name, product.nameAr);
  const brandName = localize(product.brand, product.brandAr);
  const description = localize(product.description, product.descriptionAr);

  const primaryImageUrl =
    product.images[0]?.url?.trim() || "/products/puff-jo-product-default.png";

  const hasRequiredOptions = Boolean(
    product.optionGroups?.some((group) => group.isRequired),
  );

  const canPurchase = product.variants.some(
    (variant) => variant.stockQuantity > 0 || variant.allowBackorder,
  );

  const needsOptions = hasRequiredOptions || product.variants.length > 1;

  function handleAddToCart(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!canPurchase || needsOptions || !primaryVariant) {
      router.push(`/product/${product.slug}`);
      return;
    }

    useCartStore.getState().addItem(product, primaryVariant.id);

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1400);

    pushToast({
      title: t("ADDED TO CART"),
      description: productName,
    });
  }

  async function handleFavorite(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    try {
      const response = await fetch(
        favorite
          ? `/api/favorites?productId=${encodeURIComponent(product.id)}`
          : "/api/favorites",
        favorite
          ? {
              method: "DELETE",
            }
          : {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                productId: product.id,
              }),
            },
      );

      if (response.status === 401) {
        pushToast({
          title: t("Sign in required"),
          description: t("Sign in to save products to your favorites."),
        });

        router.push("/login");
        return;
      }

      if (!response.ok) {
        pushToast({
          title: t("Something went wrong"),
          description: t("Try again in a moment."),
        });

        return;
      }

      toggleFavorite(product.id);

      pushToast({
        title: favorite ? t("REMOVED FROM FAVORITES") : t("SAVED TO FAVORITES"),
        description: productName,
      });
    } catch {
      pushToast({
        title: t("Something went wrong"),
        description: t("Try again in a moment."),
      });
    }
  }

  return (
    <Box
      component="article"
      className="
        group
        flex
        min-w-0
        flex-col
        overflow-hidden
        rounded-xl
        border
        border-[var(--border)]
        bg-[var(--background)]
        transition
        duration-200
        hover:-translate-y-[2px]
        hover:shadow-md
      "
    >
      {/* IMAGE */}
      <Box
        component="div"
        className="
          relative
          aspect-[4/5]
          w-full
          shrink-0
          overflow-hidden
          bg-[var(--background-secondary)]
        "
      >
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          <Image
            src={primaryImageUrl}
            alt={productName}
            fit="cover"
            className="
              block
              h-full
              w-full
              object-cover
              transition-transform
              duration-300
              group-hover:scale-[1.02]
            "
          />
        </Link>

        {/* BADGES */}
        <Box
          component="div"
          className="
            absolute
            left-2
            top-2
            z-10
            flex
            flex-wrap
            gap-1
          "
        >
          {product.isNew ? <MiniFlag label="NEW" /> : null}

          {discount > 0 ? <MiniFlag label={`-${discount}%`} /> : null}

          {!canPurchase ? <MiniFlag label="OUT OF STOCK" /> : null}
        </Box>

        {/* FAVORITE */}
        <MotionBox
          component="button"
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={handleFavorite}
          aria-label={t(
            favorite ? "Remove from favorites" : "Add to favorites",
          )}
          className="
            absolute
            right-2
            top-2
            z-10
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            border
            border-black/10
            bg-white
            text-gray-500
            shadow-sm
            transition
            hover:text-black
          "
        >
          <Heart
            className={`h-4 w-4 ${favorite ? "fill-current text-black" : ""}`}
          />
        </MotionBox>
      </Box>

      {/* CONTENT */}
      <Box
        component="div"
        className="
          flex
          min-h-0
          flex-1
          flex-col
          p-3
        "
      >
        {/* BRAND */}
        {brandName ? (
          <Text size="xs" c="dimmed" className="truncate">
            {brandName}
          </Text>
        ) : null}

        {/* PRODUCT NAME */}
        <Link
          href={`/product/${product.slug}`}
          className="
            mt-1
            block
            line-clamp-2
            text-[15px]
            font-semibold
            leading-5
            text-[var(--text)]
            transition
            hover:underline
          "
        >
          {productName}
        </Link>

        {/* DESCRIPTION */}
        {description ? (
          <Text
            mt={4}
            size="xs"
            c="dimmed"
            lineClamp={2}
            className="leading-[17px]"
          >
            {description}
          </Text>
        ) : null}

        {/* PRICE */}
        <Group mt={10} gap={7} align="center" wrap="wrap">
          <Text size="md" fw={700} className="shrink-0">
            {formatCurrency(price)}
          </Text>

          {compareAtPrice ? (
            <Text size="xs" c="dimmed" td="line-through">
              {formatCurrency(compareAtPrice)}
            </Text>
          ) : null}

          {discount > 0 ? (
            <Text size="xs" fw={600} c="red">
              -{discount}%
            </Text>
          ) : null}
        </Group>

        {/* OPTIONS */}
        {needsOptions && canPurchase ? (
          <Text mt={4} size="xs" c="dimmed" lineClamp={1}>
            {product.variants.length} {t("options available")}
          </Text>
        ) : null}

        {/* COLORS + STOCK */}
        <Box
          component="div"
          className="
            mt-3
            flex
            items-center
            justify-between
            gap-2
          "
        >
          <Box
            component="div"
            className="
              flex
              min-w-0
              items-center
              gap-1.5
              overflow-hidden
            "
          >
            {colors.slice(0, 5).map((color) => (
              <Box
                component="span"
                key={color.name}
                title={localize(color.name, color.nameAr)}
                className="
                  h-3
                  w-3
                  shrink-0
                  rounded-full
                  border
                  border-[var(--border)]
                "
                style={{
                  backgroundColor: color.hex,
                }}
              />
            ))}

            {colors.length > 5 ? (
              <Text size="xs" c="dimmed">
                +{colors.length - 5}
              </Text>
            ) : null}
          </Box>

          {inventory > 0 ? (
            <Text
              size="xs"
              c={inventory <= 2 ? "red" : "dimmed"}
              className="shrink-0"
            >
              {inventory <= 2 ? `${t("ONLY")} ${inventory}` : t("IN STOCK")}
            </Text>
          ) : null}
        </Box>

        {/* BUTTON */}
        <Button
          mt="auto"
          fullWidth
          h={38}
          size="xs"
          radius="md"
          disabled={!canPurchase}
          onClick={handleAddToCart}
          leftSection={
            canPurchase ? (
              added ? (
                <Check size={15} />
              ) : (
                <ShoppingCart size={15} />
              )
            ) : undefined
          }
        >
          {!canPurchase
            ? t("OUT OF STOCK")
            : added
              ? t("ADDED")
              : needsOptions
                ? t("CHOOSE OPTIONS")
                : t("ADD TO CART")}
        </Button>
      </Box>
    </Box>
  );
}

export function ProductGrid({ products }: { products: StoreProduct[] }) {
  return (
    <Box
      component="div"
      className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Box>
  );
}

export function EditorialBanner() {
  const { t, dir } = useLocale();

  return (
    <Box
      component="section"
      className="relative overflow-hidden border border-[var(--border)]"
    >
      <Image
        src="https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1600&q=80"
        alt="Puff Jo vape collection"
        className="h-[440px] w-full bg-[#181211] object-contain md:h-[560px]"
      />
      <Box
        component="div"
        className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"
      />
      <Box
        component="div"
        className="absolute inset-0 flex items-end p-6 md:p-12"
      >
        <Box component="div" className="max-w-xl">
          <Box
            component="div"
            className="text-xs tracking-[0.3em] text-[var(--text-secondary)]"
          >
            {t("FROM THE CLOUD")}
          </Box>
          <Box
            component="div"
            className="mt-4 text-4xl font-semibold uppercase tracking-[0.18em] leading-none md:text-6xl"
          >
            {t("DEVICES, FLAVOR, CLOUDS.")}
          </Box>
          <Box
            component="p"
            className="mt-4 max-w-lg text-sm leading-7 text-[var(--text-secondary)]"
          >
            {t(
              "Reliable hardware, standout flavor, and everything you need for the perfect setup.",
            )}
          </Box>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 text-sm tracking-[0.2em] text-white"
          >
            {t("SHOP THE COLLECTION")}{" "}
            {dir === "rtl" ? (
              <ArrowLeft className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

export function NewsletterSection() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setMessage({ type: "error", text: t("Email address is required") });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage({
          type: "error",
          text: t(payload.error ?? "Something went wrong"),
        });
        return;
      }

      setEmail("");
      setMessage({ type: "success", text: t("You are on the list.") });
    } catch {
      setMessage({ type: "error", text: t("Try again in a moment.") });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box
      component="section"
      className="border border-[var(--border)] bg-[var(--card)] p-8 md:p-10"
    >
      <Box component="div" className="max-w-xl">
        <Box
          component="div"
          className="text-xs tracking-[0.28em] text-[var(--muted)]"
        >
          {t("OFFERS")}
        </Box>
        <Box
          component="div"
          className="mt-4 font-display text-4xl uppercase md:text-5xl"
        >
          {t("GET THE LATEST DROPS.")}
        </Box>
        <Box
          component="p"
          className="mt-3 text-sm leading-7 text-[var(--text-secondary)]"
        >
          {t("New releases, flavor drops, and limited offers in your inbox.")}
        </Box>
      </Box>
      <Box
        component="form"
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-3 md:flex-row"
      >
        <Box
          component="input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("Email address")}
          className="h-14 flex-1 rounded-full border border-white/10 bg-black/20 px-6 text-sm outline-none placeholder:text-[var(--muted)]"
        />
        <Box
          component="button"
          type="submit"
          disabled={isSubmitting}
          className="h-14 rounded-full bg-[var(--accent)] px-8 text-sm tracking-[0.2em] disabled:opacity-40"
          style={{ color: "var(--background)" }}
        >
          {isSubmitting ? t("PLEASE WAIT") : t("JOIN")}
        </Box>
      </Box>
      {message ? (
        <Box
          component="p"
          className={`mt-4 text-sm ${message.type === "success" ? "text-[var(--text)]" : "text-[var(--blush)]"}`}
        >
          {message.text}
        </Box>
      ) : null}
    </Box>
  );
}

export function SocialGallery() {
  const images = [
    "https://images.unsplash.com/photo-1662116765994-1e4200c43589?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=1200&q=80",
  ];

  return (
    <Box component="div" className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {images.map((image) => (
        <Box
          component="div"
          key={image}
          className="overflow-hidden rounded-[28px] border border-white/8"
        >
          <Image
            src={image}
            alt="Puff Jo product"
            className="aspect-square w-full bg-[#171717] object-contain grayscale transition duration-500 hover:scale-[1.03]"
          />
        </Box>
      ))}
    </Box>
  );
}

export function Rating({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) {
  return (
    <Box
      component="div"
      className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"
    >
      <Star className="h-4 w-4 fill-current text-[var(--blush)]" />
      <Box component="span">{rating.toFixed(1)}</Box>
      <Box component="span">({reviewCount})</Box>
    </Box>
  );
}

function MiniFlag({ label }: { label: string }) {
  const { t } = useLocale();

  return (
    <Box
      component="span"
      className="bg-black px-2 py-1 text-[8px] font-medium tracking-[0.24em] text-white"
    >
      {t(label)}
    </Box>
  );
}
