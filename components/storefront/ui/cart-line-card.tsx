"use client";

import {
  ActionIcon,
  Box,
  Group,
  Image,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useLocale } from "@/components/storefront/locale-provider";
import { formatCurrency } from "@/lib/commerce-utils";
import type { CartProductLine } from "@/stores/use-cart-store";

type CartLineCardProps = {
  line: CartProductLine;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export function CartLineCard({
  line,
  onQuantityChange,
  onRemove,
}: CartLineCardProps) {
  const { t, localize } = useLocale();

  const productName = localize(line.product.name, line.product.nameAr);

  const variantName = localize(line.variant.size, line.variant.sizeAr);

  const lineTotal = line.variant.price * line.quantity;

  const maxQuantity = line.variant.allowBackorder
    ? 99
    : Math.max(1, line.variant.stockQuantity);

  return (
    <Paper
      withBorder
      radius="md"
      p={{ base: "sm", sm: "md" }}
      bg="var(--mantine-color-body)"
    >
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: 16,
        }}
        className="sm:!grid-cols-[120px_minmax(0,1fr)_auto]"
      >
        {/* Product image */}
        <Box
          w={{ base: "100%", sm: 120 }}
          h={{ base: 180, sm: 120 }}
          style={{
            borderRadius: "var(--mantine-radius-md)",
            overflow: "hidden",
            background: "var(--mantine-color-default-hover)",
          }}
        >
          <Image
            src={
              line.product.images[0]?.url ||
              "/products/puff-jo-product-default.png"
            }
            alt={productName}
            w="100%"
            h="100%"
            fit="contain"
            p={8}
            fallbackSrc="/products/puff-jo-product-default.png"
          />
        </Box>

        {/* Product details */}
        <Stack gap={7} justify="center" style={{ minWidth: 0 }}>
          {line.product.categorySlug ? (
            <Text
              size="xs"
              c="dimmed"
              tt="uppercase"
              fw={600}
              lts="0.08em"
              lineClamp={1}
            >
              {line.product.categorySlug}
            </Text>
          ) : null}

          <Text fw={600} fz={{ base: 15, sm: 16 }} lineClamp={2} lh={1.35}>
            {productName}
          </Text>

          {variantName ? (
            <Text size="sm" c="dimmed">
              {variantName}
            </Text>
          ) : null}

          {/* Selected options */}
          {line.selections.length ? (
            <Stack gap={4} mt={2}>
              {line.selections.map((selection) => {
                const values = selection.items
                  .map((item) => {
                    const label = localize(item.name, item.nameAr);

                    return item.priceDelta > 0
                      ? `${label} +${formatCurrency(item.priceDelta)}`
                      : label;
                  })
                  .filter(Boolean)
                  .join(", ");

                if (!values) {
                  return null;
                }

                return (
                  <Group key={selection.groupId} gap={6} wrap="wrap">
                    <Text size="xs" c="dimmed" fw={500}>
                      {localize(selection.groupName, selection.groupNameAr)}:
                    </Text>

                    <Text size="xs">{values}</Text>
                  </Group>
                );
              })}
            </Stack>
          ) : null}

          {/* Unit price mobile */}
          <Text fw={600} size="sm" hiddenFrom="sm" mt={4}>
            {formatCurrency(line.variant.price)}{" "}
            <Text component="span" size="xs" c="dimmed">
              / {t("item")}
            </Text>
          </Text>
        </Stack>

        {/* Actions */}
        <Stack
          gap="sm"
          justify="space-between"
          align={{ base: "stretch", sm: "flex-end" }}
          style={{ minWidth: 125 }}
        >
          <Box visibleFrom="sm">
            <Text size="xs" c="dimmed" ta="right">
              {t("Price")}
            </Text>

            <Text fw={700} fz={16} ta="right">
              {formatCurrency(lineTotal)}
            </Text>
          </Box>

          <Group
            justify={{
              base: "space-between",
              sm: "flex-end",
            }}
            gap="sm"
            wrap="nowrap"
          >
            {/* Quantity */}
            <Group
              gap={0}
              wrap="nowrap"
              style={{
                border: "1px solid var(--mantine-color-default-border)",
                borderRadius: "var(--mantine-radius-md)",
                overflow: "hidden",
              }}
            >
              <ActionIcon
                variant="transparent"
                color="gray"
                radius={0}
                size={36}
                disabled={line.quantity <= 1}
                onClick={() => onQuantityChange(Math.max(1, line.quantity - 1))}
                aria-label={t("Decrease quantity")}
              >
                <Minus size={15} />
              </ActionIcon>

              <Box
                miw={34}
                h={36}
                style={{
                  display: "grid",
                  placeItems: "center",
                  borderLeft: "1px solid var(--mantine-color-default-border)",
                  borderRight: "1px solid var(--mantine-color-default-border)",
                }}
              >
                <Text size="sm" fw={600} aria-live="polite">
                  {line.quantity}
                </Text>
              </Box>

              <ActionIcon
                variant="transparent"
                color="gray"
                radius={0}
                size={36}
                disabled={
                  !line.variant.allowBackorder && line.quantity >= maxQuantity
                }
                onClick={() =>
                  onQuantityChange(Math.min(maxQuantity, line.quantity + 1))
                }
                aria-label={t("Increase quantity")}
              >
                <Plus size={15} />
              </ActionIcon>
            </Group>

            {/* Remove */}
            <ActionIcon
              variant="subtle"
              color="red"
              radius="md"
              size={36}
              onClick={onRemove}
              aria-label={t("REMOVE")}
            >
              <Trash2 size={16} />
            </ActionIcon>
          </Group>

          {/* Mobile total */}
          <Group hiddenFrom="sm" justify="space-between">
            <Text size="sm" c="dimmed">
              {t("Total")}
            </Text>

            <Text fw={700}>{formatCurrency(lineTotal)}</Text>
          </Group>
        </Stack>
      </Box>
    </Paper>
  );
}
