'use client';

import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { Container, SectionHeading } from '@/components/storefront/storefront-sections';
import { useLocale } from '@/components/storefront/locale-provider';

type SupportSection = {
  title: string;
  body: string;
};

const hotline = '(06) 566 0880';
const email = 'shawerma3asaj@gmail.com';

const branchGroups = [
  {
    area: 'West Amman',
    areaAr: 'غرب عمان',
    branches: [
      ['Al Madina Al Munawwarah St.', 'شارع المدينة المنورة'],
      ['Abdullah Ghosheh St.', 'شارع عبدالله غوشة'],
      ['Abdoun', 'عبدون'],
      ['Swefieh', 'الصويفية'],
      ['Al Weibdeh', 'اللويبدة'],
      ['Marj Al Hamam', 'مرج الحمام'],
    ],
  },
  {
    area: 'North and central Amman',
    areaAr: 'شمال ووسط عمان',
    branches: [
      ['Al Muqabalain', 'المقابلين'],
      ['Rainbow St.', 'شارع الرينبو'],
      ['Prince Rashid District', 'ضاحية الأمير راشد'],
      ['City Mall', 'سيتي مول'],
      ['Jubeiha', 'الجبيهة'],
      ['Tabarbour', 'طبربور'],
      ['Dabouq', 'دابوق'],
    ],
  },
  {
    area: 'Jordan branches',
    areaAr: 'فروع الأردن',
    branches: [
      ['Salt - Al Saru', 'السلط - السرو'],
      ['Fuheis', 'الفحيص'],
      ['Al Yasmeen', 'الياسمين'],
      ['Shmeisani', 'الشميساني'],
      ['5B Mall', '5B Mall'],
      ['Tlaa Al Ali', 'تلاع العلي'],
    ],
  },
];

function SupportLayout({
  eyebrow,
  title,
  description,
  sections,
  ctaLabel,
  ctaHref,
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: SupportSection[];
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const { t } = useLocale();

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          ctaLabel && ctaHref ? (
            <Link
              href={ctaHref}
              className="rounded-full border border-white/10 px-5 py-3 text-sm tracking-[0.2em]"
            >
              {t(ctaLabel)}
            </Link>
          ) : null
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <div key={section.title} className="rounded-[28px] border border-white/8 bg-white/3 p-6">
            <div className="text-xs tracking-[0.24em] text-[var(--muted)]">{t(section.title)}</div>
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">{t(section.body)}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}

export function ContactSupportPage() {
  const { t, localize } = useLocale();

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        eyebrow="SUPPORT"
        title="CONTACT US"
        description="Call the order hotline for delivery, pickup, branch questions, or order updates."
        action={
          <Link
            href={`tel:${hotline.replace(/\D/g, '')}`}
            className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold tracking-[0.14em] text-white"
          >
            {hotline}
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <ContactCard icon={<Phone className="h-5 w-5" />} title="Order hotline" body={hotline} />
        <ContactCard icon={<Mail className="h-5 w-5" />} title="Email" body={email} />
        <ContactCard
          icon={<Clock className="h-5 w-5" />}
          title="Hours"
          body={localize('Most public listings show daily service from 10:00 AM to 4:00 AM.', 'تظهر القوائم العامة أن الدوام يومياً من 10 صباحاً حتى 4 فجراً.')}
        />
      </div>

      <section className="mt-10 rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 md:p-7">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              {t('BRANCHES')}
            </div>
            <h2 className="mt-2 text-3xl font-black uppercase text-[var(--text)]">
              {localize('Find your nearest branch', 'اختر الفرع الأقرب لك')}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[var(--text-secondary)]">
            {localize(
              'All listed branches use the same order hotline. Availability may change by coverage and live kitchen queue.',
              'جميع الفروع المدرجة تستخدم نفس رقم الطلبات. التوفر قد يختلف حسب التغطية وضغط المطبخ.'
            )}
          </p>
        </div>
        <BranchGrid />
      </section>
    </Container>
  );
}

export function AboutSupportPage() {
  const { t, localize } = useLocale();

  return (
    <Container className="py-8 md:py-14">
      <SectionHeading
        eyebrow="ABOUT"
        title="SHAWERMA 3A SAJ"
        description="Shawerma 3a Saj presents itself as the world's best shawerma and one of the largest Shawerma 3a Saj chains, with public app listings describing 18 branches in Jordan."
        action={
          <Link
            href="/shop"
            className="rounded-full border border-[var(--border)] px-5 py-3 text-sm font-semibold tracking-[0.14em] text-[var(--text)]"
          >
            {t('MENU')}
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--card)]">
          <div className="bg-[#c7202f] p-6 text-white md:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/72">
              {localize('Official positioning', 'هوية المطعم')}
            </div>
            <h2 className="mt-3 text-4xl font-black uppercase leading-none md:text-6xl">
              {localize('World-class saj shawerma', 'شاورما صاج بطابع عالمي')}
            </h2>
          </div>
          <div className="space-y-4 p-6 text-sm leading-8 text-[var(--text-secondary)] md:p-8">
            <p>
              {localize(
                'Public listings describe Shawerma 3a Saj as a Middle Eastern restaurant from Amman focused on shawerma meals and sandwiches prepared on saj bread with a modern twist.',
                'تصف القوائم العامة شاورما ع صاج كمطعم شرقي من عمان يركز على وجبات وسندويشات الشاورما المحضرة على خبز الصاج بلمسة عصرية.'
              )}
            </p>
            <p>
              {localize(
                'Their official app listing highlights authentic flavor, consistent quality, and fast access to the menu, delivery, and pickup services across Jordan branches.',
                'تؤكد صفحة التطبيق الرسمية على النكهة الأصلية والجودة الثابتة وسهولة الوصول إلى المنيو وخدمات التوصيل والاستلام عبر فروع الأردن.'
              )}
            </p>
            <p>
              {localize(
                'The menu direction is clear: chicken and meat shawerma, saj sandwiches, arabi boxes, rice meals, fatteh bowls, fries, salads, dips, and drinks.',
                'اتجاه المنيو واضح: شاورما دجاج ولحم، سندويشات صاج، وجبات عربي، رز، فتات، بطاطا، سلطات، صوصات ومشروبات.'
              )}
            </p>
          </div>
        </section>

        <section className="grid gap-4">
          <AboutFact title="Order hotline" titleAr="رقم الطلبات" value={hotline} />
          <AboutFact title="Email" titleAr="البريد الإلكتروني" value={email} />
          <AboutFact title="Main public address" titleAr="العنوان العام الرئيسي" value={localize('Al Madina Al Munawwarah St., Al Saad Complex 2, Amman', 'شارع المدينة المنورة، مجمع السعد 2، عمان')} />
          <AboutFact title="Public hours" titleAr="ساعات العمل العامة" value={localize('Daily listings show 10:00 AM - 4:00 AM', 'القوائم العامة تظهر 10 صباحاً - 4 فجراً')} />
        </section>
      </div>

      <section className="mt-10 rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 md:p-7">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              {t('BRANCHES')}
            </div>
            <h2 className="mt-2 text-3xl font-black uppercase text-[var(--text)]">
              {localize('Branches from their latest artwork', 'الفروع حسب آخر تصميم منشور')}
            </h2>
          </div>
          <Link
            href={`tel:${hotline.replace(/\D/g, '')}`}
            className="w-fit rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold tracking-[0.14em] text-white"
          >
            {hotline}
          </Link>
        </div>
        <BranchGrid />
      </section>
    </Container>
  );
}

function ContactCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  const { t } = useLocale();

  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
        {icon}
      </div>
      <div className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
        {t(title)}
      </div>
      <div className="mt-2 text-lg font-bold text-[var(--text)]">{body}</div>
    </div>
  );
}

function AboutFact({
  title,
  titleAr,
  value,
}: {
  title: string;
  titleAr: string;
  value: string;
}) {
  const { localize } = useLocale();

  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
        {localize(title, titleAr)}
      </div>
      <div className="mt-3 text-lg font-bold leading-7 text-[var(--text)]">{value}</div>
    </div>
  );
}

function BranchGrid() {
  const { localize } = useLocale();

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      {branchGroups.map((group) => (
        <div
          key={group.area}
          className="rounded-[24px] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--background)_78%,transparent)] p-4"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#c7202f] text-white">
              <MapPin className="h-4 w-4" />
            </span>
            <div className="font-bold text-[var(--text)]">{localize(group.area, group.areaAr)}</div>
          </div>
          <div className="grid gap-2">
            {group.branches.map(([en, ar], index) => (
              <div
                key={en}
                className="flex items-center justify-between gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
              >
                <span className="font-semibold text-[var(--text)]">{localize(en, ar)}</span>
                <span className="text-[10px] font-bold text-[var(--muted)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ShippingSupportPage() {
  return (
    <SupportLayout
      eyebrow="DELIVERY"
      title="DELIVERY"
      description="Delivery, pickup timing, and branch coverage expectations."
      ctaLabel="GO TO CHECKOUT"
      ctaHref="/checkout"
      sections={[
        {
          title: 'Preparation time',
          body: 'Hot-food preparation begins after branch confirmation and depends on order size.',
        },
        {
          title: 'Amman delivery',
          body: 'Amman delivery timing depends on branch coverage, traffic, and live order volume.',
        },
        {
          title: 'Jordan delivery',
          body: 'Jordan branch availability may vary by city and delivery zone.',
        },
        {
          title: 'Pickup orders',
          body: 'Choose pickup at checkout when you want the branch to prepare your order ahead of arrival.',
        },
      ]}
    />
  );
}

export function ReturnsSupportPage() {
  return (
    <SupportLayout
      eyebrow="POLICY"
      title="ORDER HELP"
      description="Guidance for incorrect, delayed, or changed food orders."
      ctaLabel="CONTACT US"
      ctaHref="/contact-us"
      sections={[
        {
          title: 'Order changes',
          body: 'Contact the branch quickly if you need to adjust sauces, notes, or pickup timing.',
        },
        {
          title: 'Food orders',
          body: 'Prepared food cannot be returned after handoff unless the order is incorrect or has a quality issue.',
        },
        {
          title: 'Issue window',
          body: 'Contact support as soon as possible after delivery if an item is missing, incorrect, or damaged.',
        },
        {
          title: 'Damaged or incorrect orders',
          body: 'If your order arrives damaged or incorrect, contact support with your order number and photos.',
        },
      ]}
    />
  );
}

export function FaqSupportPage() {
  return (
    <SupportLayout
      eyebrow="HELP"
      title="FAQ"
      description="Quick answers to the most common store and order questions."
      ctaLabel="CONTACT US"
      ctaHref="/contact-us"
      sections={[
        {
          title: 'How do I track my order?',
          body: 'Open your account orders page to see order status, tracking number, and delivery updates.',
        },
        {
          title: 'Can I save multiple addresses?',
          body: 'Yes. Signed-in customers can save multiple delivery addresses and choose one during checkout.',
        },
        {
          title: 'Do I need an account to check out?',
          body: 'Yes. Checkout is restricted to registered customers so orders, addresses, and account history stay connected.',
        },
        {
          title: 'Can I review a product?',
          body: 'Yes. Signed-in customers can submit reviews directly from the product page.',
        },
      ]}
    />
  );
}

export function PrivacySupportPage() {
  return (
    <SupportLayout
      eyebrow="LEGAL"
      title="PRIVACY POLICY"
      description="Last updated: August 15, 2026. This policy explains how Shawerma 3a Saj handles customer data for online ordering, delivery, pickup, accounts, and support."
      sections={[
        {
          title: 'Information we collect',
          body: 'When you use this website, we may collect your name, email address, phone number, saved addresses, delivery area, order items, selected add-ons, payment method, coupon use, support messages, and basic account activity such as login and order history.',
        },
        {
          title: 'How we use your information',
          body: 'We use customer information to create and secure accounts, confirm orders, prepare food, calculate delivery fees, contact you about an order, deliver to the correct address, provide support, prevent misuse, and improve the ordering experience.',
        },
        {
          title: 'Accounts and authentication',
          body: 'Account registration and login are handled through Supabase authentication. Email verification, session management, and account identifiers are used so orders, saved addresses, and profile data stay connected to the correct customer.',
        },
        {
          title: 'Orders, delivery, and branch operations',
          body: 'Order and delivery details may be visible to authorized Shawerma 3a Saj team members who need them for kitchen preparation, dispatch, branch coordination, customer service, refunds, complaints, or operational reporting.',
        },
        {
          title: 'Payments',
          body: 'Available payment methods are shown at checkout. If online card or wallet payments are enabled, payment details should be processed by the payment provider and not stored as full card numbers on this website.',
        },
        {
          title: 'Cookies and technical data',
          body: 'The website may use cookies or local storage to keep you signed in, remember cart contents, save language/theme preferences, protect the service, and measure basic website performance.',
        },
        {
          title: 'Data sharing',
          body: 'We do not sell customer personal information. Data may be shared only with service providers needed to run the website, authentication, storage, delivery, payment, analytics, communications, or legal compliance.',
        },
        {
          title: 'Retention and deletion',
          body: 'We keep account, address, order, and support records for as long as needed to provide service, meet legal or accounting obligations, resolve disputes, and protect the business. You can request correction or deletion of your account data when deletion is legally and operationally possible.',
        },
        {
          title: 'Your choices',
          body: 'You can update saved addresses and profile details from your account. You can also contact support to ask about your data, correct inaccurate information, request deletion, or stop non-essential communications.',
        },
        {
          title: 'Privacy contact',
          body: 'For privacy questions, contact Shawerma 3a Saj at shawerma3asaj@gmail.com or call (06) 566 0880.',
        },
      ]}
    />
  );
}

export function TermsSupportPage() {
  return (
    <SupportLayout
      eyebrow="LEGAL"
      title="TERMS"
      description="Store terms for ordering, payment, shipping, and returns."
      sections={[
        {
          title: 'Orders and pricing',
          body: 'Published prices, availability, and catalog content may change before an order is confirmed.',
        },
        {
          title: 'Payment methods',
          body: 'Available payment methods are shown during checkout and may vary based on store configuration.',
        },
        {
          title: 'Shipping and delivery',
          body: 'Delivery windows are estimates and may vary based on address, courier capacity, and order volume.',
        },
        {
          title: 'Returns and support',
          body: 'Return eligibility depends on item type, condition, and the support review process described on the returns page.',
        },
      ]}
    />
  );
}
