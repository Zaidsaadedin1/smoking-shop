'use client';

import { ActionIcon, AspectRatio, Box, Group, Image, Paper, Stack, Text } from '@mantine/core';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useLocale } from '@/components/storefront/locale-provider';
import { formatCurrency } from '@/lib/commerce-utils';
import type { CartProductLine } from '@/stores/use-cart-store';

type CartLineCardProps = {
  line: CartProductLine;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export function CartLineCard({ line, onQuantityChange, onRemove }: CartLineCardProps) {
  const { t, localize } = useLocale();
  const productName = localize(line.product.name, line.product.nameAr);
  const variantName = localize(line.variant.size, line.variant.sizeAr);

  return (
    <Paper radius="md" p="sm" withBorder bg="var(--mantine-color-body)" shadow="xs">
      <AspectRatio ratio={4 / 3}>
        <Image
          src={line.product.images[0]?.url || '/products/puff-jo-product-default.png'}
          alt={productName}
          radius="sm"
          fit="cover"
          fallbackSrc="/products/puff-jo-product-default.png"
        />
      </AspectRatio>

      <Stack gap="sm" px={4} pt="md" pb={4}>
        {line.product.categorySlug ? (
          <Text size="xs" c="dimmed" tt="uppercase" lts="0.16em" lineClamp={1}>
            {line.product.categorySlug}
          </Text>
        ) : null}
        <Text fw={600} size="lg" lineClamp={2}>
          {productName}
        </Text>
        {variantName ? (
          <Text size="sm" c="dimmed">
            {variantName}
          </Text>
        ) : null}

        {line.selections.length ? (
          <Stack gap={6}>
            {line.selections.map((selection) => {
              const values = selection.items
                .map((item) => {
                  const label = localize(item.name, item.nameAr);
                  return item.priceDelta > 0
                    ? `${label} +${formatCurrency(item.priceDelta)}`
                    : label;
                })
                .filter(Boolean)
                .join(', ');

              return values ? (
                <Box
                  key={selection.groupId}
                  p="sm"
                  style={{
                    border: '1px solid var(--mantine-color-default-border)',
                    borderRadius: 'var(--mantine-radius-md)',
                    background: 'var(--mantine-color-default-hover)',
                  }}
                >
                  <Text size="xs" c="dimmed" tt="uppercase" lts="0.12em">
                    {localize(selection.groupName, selection.groupNameAr)}
                  </Text>
                  <Text size="sm" mt={4}>
                    {values}
                  </Text>
                </Box>
              ) : null;
            })}
          </Stack>
        ) : null}

        <Group justify="space-between" align="center" wrap="nowrap">
          <Text fw={700}>{formatCurrency(line.variant.price)}</Text>
          <Group gap={6} wrap="nowrap">
            <ActionIcon
              variant="default"
              radius="xl"
              size="lg"
              onClick={() => onQuantityChange(line.quantity - 1)}
              aria-label={t('Decrease quantity')}
            >
              <Minus size={16} />
            </ActionIcon>
            <Text miw={24} ta="center" fw={600} aria-live="polite">
              {line.quantity}
            </Text>
            <ActionIcon
              variant="default"
              radius="xl"
              size="lg"
              onClick={() => onQuantityChange(line.quantity + 1)}
              aria-label={t('Increase quantity')}
            >
              <Plus size={16} />
            </ActionIcon>
          </Group>
        </Group>

        <Group justify="space-between" gap="sm">
          <Text size="sm" c="dimmed">
            {t('Quantity')}: {line.quantity}
          </Text>
          <ActionIcon
            variant="subtle"
            color="red"
            radius="xl"
            onClick={onRemove}
            aria-label={t('REMOVE')}
          >
            <Trash2 size={17} />
          </ActionIcon>
        </Group>
      </Stack>
    </Paper>
  );
}
