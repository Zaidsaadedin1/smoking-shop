// Destructive one-time reset + seed. Keep the SQL file as the reviewable
// source of truth; this script applies its catalog payload through Supabase's
// REST/Auth/Storage APIs because the project does not expose a SQL execution
// endpoint to local scripts.
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "media";
const sql = fs.readFileSync("db/vape-catalog-reset-and-seed.sql", "utf8");
const catalogJson = sql.match(/\$catalog\$([\s\S]*?)\$catalog\$/)?.[1];

if (!projectUrl || !serviceRoleKey || !catalogJson) {
  throw new Error("Supabase credentials or catalog payload are missing.");
}

const catalog = JSON.parse(catalogJson);
const supabase = createClient(projectUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function checked(label, request) {
  const result = await request;
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }
  return result;
}

const resetTables = [
  ["payments", "id"],
  ["order_status_history", "id"],
  ["order_items", "id"],
  ["orders", "id"],
  ["coupon_usages", "id"],
  ["cart_items", "id"],
  ["carts", "id"],
  ["addresses", "id"],
  ["favorites", "id"],
  ["reviews", "id"],
  ["flash_sale_products", "id"],
  ["product_option_item_links", "product_id"],
  ["product_option_group_links", "product_id"],
  ["product_images", "id"],
  ["product_variants", "id"],
  ["products", "id"],
  ["product_option_items", "id"],
  ["product_option_groups", "id"],
  ["coupons", "id"],
  ["flash_sales", "id"],
  ["delivery_zones", "id"],
  ["hero_slides", "id"],
  ["navigation_items", "id"],
  ["newsletter_subscribers", "id"],
  ["store_settings", "key"],
  ["enum_labels", "id"],
  ["categories", "id"],
  ["brands", "id"],
  ["colors", "id"],
  ["sizes", "id"],
];

const adminProfiles = await checked(
  "Read admin profiles",
  supabase.from("profiles").select("id").in("role", ["admin", "super_admin"]),
);
const preservedAdminIds = new Set((adminProfiles.data ?? []).map((row) => row.id));
const customerProfiles = await checked(
  "Read customer profile IDs",
  supabase.from("profiles").select("id").eq("role", "customer"),
);

const currentRows = {};
for (const [table, key] of resetTables) {
  const result = await checked(
    `Count ${table}`,
    supabase.from(table).select(key, { count: "exact", head: true }),
  );
  currentRows[table] = result.count ?? 0;
}

if (!process.argv.includes("--apply")) {
  console.log(
    JSON.stringify(
      {
        mode: "dry-run",
        current_rows_by_table: currentRows,
        customer_accounts_to_remove: customerProfiles.data?.length ?? 0,
        admin_accounts_to_preserve: preservedAdminIds.size,
        next_step: "Re-run with --apply to clear the store data and seed the draft catalog.",
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const deletedRows = {};
for (const [table, key] of resetTables) {
  const result = await checked(
    `Clear ${table}`,
    supabase.from(table).delete({ count: "exact" }).not(key, "is", null),
  );
  deletedRows[table] = result.count ?? 0;
}

let deletedUsers = 0;
for (const profile of customerProfiles.data ?? []) {
  await checked(
    "Delete customer auth account",
    supabase.auth.admin.deleteUser(profile.id),
  );
  deletedUsers += 1;
}

const uploadedPhotoCodes = new Set(
  catalog.flatMap((product) => product.photos ?? []),
);
const photoPathForCode = (code) =>
  `vape-catalog/2026-10-06/WhatsApp-Image-2026-10-06-at-${code}.jpeg`;

async function filesInPath(storage, path = "") {
  const files = [];
  for (let offset = 0; ; offset += 100) {
    const result = await checked(
      `List storage objects ${path || "/"}`,
      storage.list(path, { limit: 100, offset }),
    );
    const entries = result.data ?? [];
    for (const entry of entries) {
      const childPath = path ? `${path}/${entry.name}` : entry.name;
      if (entry.id == null) {
        files.push(...(await filesInPath(storage, childPath)));
      } else {
        files.push(childPath);
      }
    }
    if (entries.length < 100) break;
  }
  return files;
}

const bucketResult = await checked("List storage buckets", supabase.storage.listBuckets());
let deletedStorageObjects = 0;
for (const storageBucket of bucketResult.data ?? []) {
  const storage = supabase.storage.from(storageBucket.name);
  const paths = await filesInPath(storage);
  const toRemove = paths.filter((objectPath) => {
    if (storageBucket.name !== bucket) return true;
    const match = objectPath.match(/^vape-catalog\/2026-10-06\/WhatsApp-Image-2026-10-06-at-(\d{2}\.\d{2}\.\d{2})\.jpeg$/);
    return !match || !uploadedPhotoCodes.has(match[1]);
  });

  for (let i = 0; i < toRemove.length; i += 100) {
    const batch = toRemove.slice(i, i + 100);
    await checked(`Remove storage objects from ${storageBucket.name}`, storage.remove(batch));
    deletedStorageObjects += batch.length;
  }
}

const category = await checked(
  "Create vape category",
  supabase
    .from("categories")
    .insert({
      name: "Vape Devices",
      name_ar: "أجهزة الفيب",
      slug: "vape-devices",
      slug_ar: "اجهزة-الفيب",
      description: "Disposable vape devices and related products.",
      description_ar: "أجهزة فيب ومنتجاتها.",
      sort_order: 10,
      is_active: true,
    })
    .select("id")
    .single(),
);

const brandNames = [...new Set(catalog.map((product) => product.brand_slug))];
const brandLabels = {
  oxbar: "OXBAR",
  vozol: "VOZOL",
  "crown-bar-al-fakher": "Crown Bar Al Fakher",
  "geek-bar": "Geek Bar",
  mazaya: "Mazaya",
  "lost-mary": "Lost Mary",
  "al-nakhla": "Al Nakhla",
  horizontech: "HorizonTech",
  oxva: "OXVA",
};
const brandRows = brandNames.map((slug) => ({
  name: brandLabels[slug],
  slug,
  is_active: true,
}));
const brands = await checked(
  "Create brands",
  supabase.from("brands").insert(brandRows).select("id,slug"),
);
const brandIds = new Map(brands.data.map((row) => [row.slug, row.id]));

const productRows = catalog.map((product) => ({
  category_id: category.data.id,
  brand_id: brandIds.get(product.brand_slug),
  name: product.name,
  slug: product.slug,
  base_price: 0,
  currency: "JOD",
  status: "draft",
  is_featured: false,
  tags: ["vape", "nicotine"],
}));
const products = await checked(
  "Create products",
  supabase.from("products").insert(productRows).select("id,slug,name"),
);
const productBySlug = new Map(products.data.map((row) => [row.slug, row]));

const groupRows = catalog
  .filter((product) => product.flavors?.length)
  .map((product) => ({
    code: `flavor-${product.slug}`,
    name: product.flavor_group,
    name_ar: product.flavor_group === "Flavor combination" ? "خلطة النكهات" : "النكهة",
    description: "Choose one flavor shown on the package.",
    description_ar: "اختر نكهة واحدة من النكهات الظاهرة على العبوة.",
    selection_type: "radio",
    is_active: true,
    sort_order: 10,
  }));
let groups = { data: [] };
if (groupRows.length) {
  groups = await checked(
    "Create flavor option groups",
    supabase.from("product_option_groups").insert(groupRows).select("id,code"),
  );
}
const groupByCode = new Map(groups.data.map((row) => [row.code, row]));

const itemRows = [];
for (const product of catalog) {
  if (!product.flavors?.length) continue;
  product.flavors.forEach((name, index) => {
    itemRows.push({
      group_id: groupByCode.get(`flavor-${product.slug}`).id,
      code: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name,
      price_delta: 0,
      stock_quantity: 0,
      track_inventory: false,
      allow_backorder: true,
      is_default: false,
      is_active: true,
      sort_order: (index + 1) * 10,
    });
  });
}
let items = { data: [] };
if (itemRows.length) {
  items = await checked(
    "Create flavor options",
    supabase.from("product_option_items").insert(itemRows).select("id,group_id,code,sort_order"),
  );
}

const groupLinks = [];
const itemLinks = [];
for (const product of catalog) {
  if (!product.flavors?.length) continue;
  const row = productBySlug.get(product.slug);
  const group = groupByCode.get(`flavor-${product.slug}`);
  groupLinks.push({
    product_id: row.id,
    option_group_id: group.id,
    is_required: true,
    min_selections: 1,
    max_selections: 1,
    sort_order: 10,
    selection_type: "radio",
  });
  for (const item of items.data.filter((option) => option.group_id === group.id)) {
    itemLinks.push({
      product_id: row.id,
      option_group_id: group.id,
      option_item_id: item.id,
      sort_order: item.sort_order,
    });
  }
}

await checked(
  "Link product flavor groups",
  supabase.from("product_option_group_links").insert(groupLinks),
);
await checked(
  "Link product flavor choices",
  supabase.from("product_option_item_links").insert(itemLinks),
);

const imageRows = [];
for (const source of catalog) {
  const product = productBySlug.get(source.slug);
  const photoCodes = [...(source.photos ?? [])].sort();
  photoCodes.forEach((code, index) => {
    const storagePath = photoPathForCode(code);
    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    imageRows.push({
      product_id: product.id,
      image_url: data.publicUrl,
      alt_text: product.name,
      sort_order: index,
      is_primary: index === 0,
    });
  });
}
await checked("Attach catalog photos", supabase.from("product_images").insert(imageRows));

console.log(
  JSON.stringify(
    {
      cleared_rows_by_table: deletedRows,
      deleted_customer_auth_users: deletedUsers,
      deleted_storage_objects: deletedStorageObjects,
      preserved_admin_accounts: preservedAdminIds.size,
      preserved_uploaded_catalog_photos: uploadedPhotoCodes.size,
      seeded_products: products.data.length,
      flavor_options: items.data.length,
      product_photo_links: imageRows.length,
      status: "all products are drafts at JOD 0.00 until real prices and stock are entered",
    },
    null,
    2,
  ),
);
