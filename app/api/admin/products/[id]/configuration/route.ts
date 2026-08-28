import { ensureAdminApiAccess } from '@/app/api/admin/_utils';
import {
  getAdminColors,
  getAdminProductOptionGroupLinks,
  getAdminProductOptionItemLinks,
  getAdminProductOptionGroups,
  getAdminProductOptionItems,
  getAdminProductVariants,
  getAdminSizes,
} from '@/lib/admin/data';
import { jsonError, jsonOk } from '@/lib/api/http';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await ensureAdminApiAccess();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const [variants, sizes, colors, groups, items, groupLinks, itemLinks] = await Promise.all([
      getAdminProductVariants(),
      getAdminSizes(),
      getAdminColors(),
      getAdminProductOptionGroups(),
      getAdminProductOptionItems(),
      getAdminProductOptionGroupLinks(),
      getAdminProductOptionItemLinks(),
    ]);

    return jsonOk({
      variants: variants.filter((item) => item.product_id === id && item.is_active),
      sizes,
      colors,
      groups: groups.filter((group) =>
        groupLinks.some((link) => link.product_id === id && link.option_group_id === group.id)
      ),
      items: items.filter(
        (item) =>
          item.is_active &&
          itemLinks.some((link) => link.product_id === id && link.option_item_id === item.id)
      ),
      groupLinks: groupLinks.filter((link) => link.product_id === id),
      itemLinks: itemLinks.filter((link) => link.product_id === id),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to load product options');
  }
}
