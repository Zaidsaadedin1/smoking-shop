import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export const DEFAULT_ENUM_LABELS = {
  user_role: {
    customer: { en: 'Customer', ar: 'عميل' },
    admin: { en: 'Admin', ar: 'مشرف' },
    super_admin: { en: 'Super Admin', ar: 'مشرف رئيسي' },
  },
  product_status: {
    draft: { en: 'Draft', ar: 'مسودة' },
    active: { en: 'Active', ar: 'نشط' },
    inactive: { en: 'Inactive', ar: 'غير نشط' },
    archived: { en: 'Archived', ar: 'مؤرشف' },
  },
  order_status: {
    pending: { en: 'Pending', ar: 'قيد الانتظار' },
    confirmed: { en: 'Confirmed', ar: 'مؤكد' },
    processing: { en: 'Processing', ar: 'قيد التجهيز' },
    packed: { en: 'Packed', ar: 'تم التغليف' },
    shipped: { en: 'Shipped', ar: 'تم الشحن' },
    out_for_delivery: { en: 'Out for delivery', ar: 'خرج للتوصيل' },
    delivered: { en: 'Delivered', ar: 'تم التسليم' },
    cancelled: { en: 'Cancelled', ar: 'ملغي' },
    failed: { en: 'Failed', ar: 'فشل' },
    refunded: { en: 'Refunded', ar: 'مسترجع' },
  },
  payment_status: {
    pending: { en: 'Pending', ar: 'قيد الانتظار' },
    authorized: { en: 'Authorized', ar: 'مخول' },
    paid: { en: 'Paid', ar: 'مدفوع' },
    failed: { en: 'Failed', ar: 'فشل' },
    cancelled: { en: 'Cancelled', ar: 'ملغي' },
    partially_refunded: { en: 'Partially refunded', ar: 'استرداد جزئي' },
    refunded: { en: 'Refunded', ar: 'مسترجع' },
  },
  payment_method: {
    cash_on_delivery: { en: 'Cash on delivery', ar: 'الدفع عند الاستلام' },
    card: { en: 'Card', ar: 'بطاقة' },
    bank_transfer: { en: 'Bank transfer', ar: 'تحويل بنكي' },
    apple_pay: { en: 'Apple Pay', ar: 'أبل باي' },
    google_pay: { en: 'Google Pay', ar: 'جوجل باي' },
  },
  discount_type: {
    percentage: { en: 'Percentage', ar: 'نسبة مئوية' },
    fixed: { en: 'Fixed', ar: 'ثابت' },
  },
} as const;

export type AdminEnumKey = keyof typeof DEFAULT_ENUM_LABELS;
export type AdminEnumLabels = Record<string, Record<string, { en: string; ar: string }>>;

export type AdminEnumLabelRow = {
  id: string;
  enumKey: AdminEnumKey;
  value: string;
  en: string;
  ar: string;
};

const enumFilePath = path.join(process.cwd(), 'data', 'admin-enum-labels.json');

function cloneDefaultLabels() {
  return JSON.parse(JSON.stringify(DEFAULT_ENUM_LABELS)) as AdminEnumLabels;
}

export async function readAdminEnumLabels(): Promise<AdminEnumLabels> {
  try {
    const raw = await readFile(enumFilePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<AdminEnumLabels>;
    const merged = cloneDefaultLabels();

    for (const enumKey of Object.keys(parsed) as AdminEnumKey[]) {
      const values = parsed[enumKey];
      if (!values) continue;
      for (const value of Object.keys(values)) {
        merged[enumKey][value] = {
          en: values[value]?.en ?? merged[enumKey]?.[value]?.en ?? value,
          ar: values[value]?.ar ?? merged[enumKey]?.[value]?.ar ?? value,
        };
      }
    }

    return merged;
  } catch {
    return cloneDefaultLabels();
  }
}

export async function writeAdminEnumLabel(input: {
  enumKey: AdminEnumKey;
  value: string;
  en: string;
  ar: string;
}) {
  const labels = await readAdminEnumLabels();
  labels[input.enumKey] ??= {};
  labels[input.enumKey][input.value] = {
    en: input.en,
    ar: input.ar,
  };

  await mkdir(path.dirname(enumFilePath), { recursive: true });
  await writeFile(enumFilePath, JSON.stringify(labels, null, 2), 'utf8');

  return labels;
}

export async function listAdminEnumLabelRows(): Promise<AdminEnumLabelRow[]> {
  const labels = await readAdminEnumLabels();

  return (Object.keys(labels) as AdminEnumKey[]).flatMap((enumKey) =>
    Object.entries(labels[enumKey]).map(([value, names]) => ({
      id: `${enumKey}:${value}`,
      enumKey,
      value,
      en: names.en,
      ar: names.ar,
    }))
  );
}
