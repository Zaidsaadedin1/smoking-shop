import { ensureAdminApiAccess, handleApiError } from '@/app/api/admin/_utils';
import { getAdminAccessToken } from '@/lib/admin/auth';
import {
  createBrand,
  createCategory,
  createColor,
  createSize,
  deleteBrand,
  deleteCategory,
  deleteColor,
  deleteSize,
  listBrands,
  listCategories,
  listColors,
  listSizes,
  updateBrand,
  updateCategory,
  updateColor,
  updateSize,
} from '@/lib/api/store-api';
import { jsonError, jsonOk, optionalString, requireString } from '@/lib/api/http';
import { saveUploadedImage } from '@/lib/admin/uploads';

function getAuthHeaders(accessToken: string | null) {
  return accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined;
}

type RouteAuth = ReturnType<typeof getAuthHeaders>;

type EntityHandlers = {
  list: (auth?: RouteAuth) => Promise<unknown>;
  create: (
    body: Record<string, unknown>,
    auth?: RouteAuth
  ) => Promise<{ data: unknown; error: string | null; status: number }>;
  update: (
    id: string,
    body: Record<string, unknown>,
    auth?: RouteAuth
  ) => Promise<{ data: unknown; error: string | null; status: number }>;
  remove: (
    id: string,
    auth?: RouteAuth
  ) => Promise<{ data: unknown; error: string | null; status: number }>;
};

async function getEntityHandlers(entity: string): Promise<EntityHandlers | null> {
  switch (entity) {
    case 'categories':
      return {
        list: (auth?: RouteAuth) => listCategories(auth),
        create: (body: Record<string, unknown>, auth?: RouteAuth) =>
          createCategory(
            {
              name: requireString(body.name, 'name'),
              name_ar: optionalString(body.nameAr),
              slug: requireString(body.slug, 'slug'),
              slug_ar: optionalString(body.slugAr),
              description: optionalString(body.description),
              description_ar: optionalString(body.descriptionAr),
              image_url: optionalString(body.imageUrl),
              sort_order: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
              is_active: body.isActive ?? true,
            },
            auth
          ),
        update: (id: string, body: Record<string, unknown>, auth?: RouteAuth) =>
          updateCategory(
            id,
            {
              ...(body.name !== undefined ? { name: optionalString(body.name) } : {}),
              ...(body.nameAr !== undefined ? { name_ar: optionalString(body.nameAr) } : {}),
              ...(body.slug !== undefined ? { slug: optionalString(body.slug) } : {}),
              ...(body.slugAr !== undefined ? { slug_ar: optionalString(body.slugAr) } : {}),
              ...(body.description !== undefined
                ? { description: optionalString(body.description) }
                : {}),
              ...(body.descriptionAr !== undefined
                ? { description_ar: optionalString(body.descriptionAr) }
                : {}),
              ...(body.imageUrl !== undefined ? { image_url: optionalString(body.imageUrl) } : {}),
              ...(typeof body.sortOrder === 'number' ? { sort_order: body.sortOrder } : {}),
              ...(typeof body.isActive === 'boolean' ? { is_active: body.isActive } : {}),
            },
            auth
          ),
        remove: (id: string, auth?: RouteAuth) => deleteCategory(id, auth),
      };
    case 'brands':
      return {
        list: (auth?: RouteAuth) => listBrands(auth),
        create: (body: Record<string, unknown>, auth?: RouteAuth) =>
          createBrand(
            {
              name: requireString(body.name, 'name'),
              name_ar: optionalString(body.nameAr),
              slug: requireString(body.slug, 'slug'),
              slug_ar: optionalString(body.slugAr),
              description: optionalString(body.description),
              description_ar: optionalString(body.descriptionAr),
              logo_url: optionalString(body.logoUrl),
              is_active: body.isActive ?? true,
            },
            auth
          ),
        update: (id: string, body: Record<string, unknown>, auth?: RouteAuth) =>
          updateBrand(
            id,
            {
              ...(body.name !== undefined ? { name: optionalString(body.name) } : {}),
              ...(body.nameAr !== undefined ? { name_ar: optionalString(body.nameAr) } : {}),
              ...(body.slug !== undefined ? { slug: optionalString(body.slug) } : {}),
              ...(body.slugAr !== undefined ? { slug_ar: optionalString(body.slugAr) } : {}),
              ...(body.description !== undefined
                ? { description: optionalString(body.description) }
                : {}),
              ...(body.descriptionAr !== undefined
                ? { description_ar: optionalString(body.descriptionAr) }
                : {}),
              ...(body.logoUrl !== undefined ? { logo_url: optionalString(body.logoUrl) } : {}),
              ...(typeof body.isActive === 'boolean' ? { is_active: body.isActive } : {}),
            },
            auth
          ),
        remove: (id: string, auth?: RouteAuth) => deleteBrand(id, auth),
      };
    case 'sizes':
      return {
        list: (auth?: RouteAuth) => listSizes(auth),
        create: (body: Record<string, unknown>, auth?: RouteAuth) =>
          createSize(
            {
              code: requireString(body.code, 'code'),
              name: requireString(body.name, 'name'),
              name_ar: optionalString(body.nameAr),
              sort_order: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
              is_active: body.isActive ?? true,
            },
            auth
          ),
        update: (id: string, body: Record<string, unknown>, auth?: RouteAuth) =>
          updateSize(
            id,
            {
              ...(body.code !== undefined ? { code: optionalString(body.code) } : {}),
              ...(body.name !== undefined ? { name: optionalString(body.name) } : {}),
              ...(body.nameAr !== undefined ? { name_ar: optionalString(body.nameAr) } : {}),
              ...(typeof body.sortOrder === 'number' ? { sort_order: body.sortOrder } : {}),
              ...(typeof body.isActive === 'boolean' ? { is_active: body.isActive } : {}),
            },
            auth
          ),
        remove: (id: string, auth?: RouteAuth) => deleteSize(id, auth),
      };
    case 'colors':
      return {
        list: (auth?: RouteAuth) => listColors(auth),
        create: (body: Record<string, unknown>, auth?: RouteAuth) =>
          createColor(
            {
              code: requireString(body.code, 'code'),
              name: requireString(body.name, 'name'),
              name_ar: optionalString(body.nameAr),
              hex_code: optionalString(body.hexCode),
              sort_order: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
              is_active: body.isActive ?? true,
            },
            auth
          ),
        update: (id: string, body: Record<string, unknown>, auth?: RouteAuth) =>
          updateColor(
            id,
            {
              ...(body.code !== undefined ? { code: optionalString(body.code) } : {}),
              ...(body.name !== undefined ? { name: optionalString(body.name) } : {}),
              ...(body.nameAr !== undefined ? { name_ar: optionalString(body.nameAr) } : {}),
              ...(body.hexCode !== undefined ? { hex_code: optionalString(body.hexCode) } : {}),
              ...(typeof body.sortOrder === 'number' ? { sort_order: body.sortOrder } : {}),
              ...(typeof body.isActive === 'boolean' ? { is_active: body.isActive } : {}),
            },
            auth
          ),
        remove: (id: string, auth?: RouteAuth) => deleteColor(id, auth),
      };
    default:
      return null;
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ entity: string }> }) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const { entity } = await params;
  const auth = getAuthHeaders(await getAdminAccessToken());
  const handlers = await getEntityHandlers(entity);

  if (!handlers) {
    return jsonError('Unknown lookup entity', 404);
  }

  const records = await handlers.list(auth);
  return jsonOk(records ?? []);
}

export async function POST(request: Request, { params }: { params: Promise<{ entity: string }> }) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { entity } = await params;
    const auth = getAuthHeaders(await getAdminAccessToken());
    const handlers = await getEntityHandlers(entity);

    if (!handlers) {
      return jsonError('Unknown lookup entity', 404);
    }

    const body = await readRequestBody(request, await getAdminAccessToken());
    const result = await handlers.create(body, auth);

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ entity: string }> }) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { entity } = await params;
    const auth = getAuthHeaders(await getAdminAccessToken());
    const handlers = await getEntityHandlers(entity);

    if (!handlers) {
      return jsonError('Unknown lookup entity', 404);
    }

    const body = await readRequestBody(request, await getAdminAccessToken());
    const id = requireString(body.id, 'id');
    const result = await handlers.update(id, body, auth);

    if (result.error) {
      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data);
  } catch (error) {
    return handleApiError(error);
  }
}

async function readRequestBody(request: Request, accessToken: string | null) {
  if (!request.headers.get('content-type')?.includes('multipart/form-data')) {
    return (await request.json()) as Record<string, unknown>;
  }

  const formData = await request.formData();
  const body: Record<string, unknown> = Object.fromEntries(formData.entries());
  const file = formData.get('logoUrl');

  if (file instanceof File && file.size > 0) {
    body.logoUrl = await saveUploadedImage(file, 'brands', accessToken);
  } else {
    body.logoUrl = formData.get('logoUrlUrl') ?? '';
  }

  return body;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  const unauthorized = await ensureAdminApiAccess();

  if (unauthorized) {
    return unauthorized;
  }

  const { entity } = await params;
  const auth = getAuthHeaders(await getAdminAccessToken());
  const handlers = await getEntityHandlers(entity);

  if (!handlers) {
    return jsonError('Unknown lookup entity', 404);
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return jsonError('id is required');
  }

  const result = await handlers.remove(id, auth);

  if (result.error) {
    return jsonError(result.error, result.status);
  }

  return jsonOk(result.data);
}
