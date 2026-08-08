'use client';

import Link from 'next/link';
import { Container, SectionHeading } from '@/components/storefront/storefront-sections';
import { useLocale } from '@/components/storefront/locale-provider';

type SupportSection = {
  title: string;
  body: string;
};

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
            <Link href={ctaHref} className="rounded-full border border-white/10 px-5 py-3 text-sm tracking-[0.2em]">
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
  return (
    <SupportLayout
      eyebrow="SUPPORT"
      title="CONTACT US"
      description="Talk to the store about orders, product questions, or delivery updates."
      ctaLabel="SHOP"
      ctaHref="/shop"
      sections={[
        {
          title: 'Customer support',
          body: 'Email: orders@tourmalinecoven.com',
        },
        {
          title: 'Phone and WhatsApp',
          body: 'Phone: +962 7 9000 8888',
        },
        {
          title: 'Support hours',
          body: 'Saturday to Thursday, 10 AM to 6 PM Amman time.',
        },
        {
          title: 'Response window',
          body: 'Most order and support requests are answered within one business day.',
        },
      ]}
    />
  );
}

export function AboutSupportPage() {
  return (
    <SupportLayout
      eyebrow="ABOUT"
      title="ABOUT"
      description="Brand story, mood, and store positioning."
      ctaLabel="SHOP"
      ctaHref="/shop"
      sections={[
        {
          title: 'Brand point of view',
          body: 'Tourmaline Coven is built around dark feminine styling, sharp silhouettes, and a mood-first storefront.',
        },
        {
          title: 'Product direction',
          body: 'The catalog focuses on statement apparel, accessories, and detail pieces with a gothic and editorial tone.',
        },
        {
          title: 'Store experience',
          body: 'The storefront is designed to feel dramatic, direct, and premium across both Arabic and English.',
        },
        {
          title: 'Customer focus',
          body: 'Orders, saved addresses, favorites, and account history stay connected through a single signed-in customer flow.',
        },
      ]}
    />
  );
}

export function ShippingSupportPage() {
  return (
    <SupportLayout
      eyebrow="DELIVERY"
      title="SHIPPING"
      description="Shipping policy, dispatch timing, and delivery expectations."
      ctaLabel="GO TO CHECKOUT"
      ctaHref="/checkout"
      sections={[
        {
          title: 'Processing time',
          body: 'Orders usually move into processing within one business day after confirmation.',
        },
        {
          title: 'Amman delivery',
          body: 'Orders inside Amman usually arrive within 1 to 3 business days.',
        },
        {
          title: 'Jordan delivery',
          body: 'Orders outside Amman usually arrive within 2 to 5 business days depending on location.',
        },
        {
          title: 'Tracking updates',
          body: 'Tracking number and carrier details appear in your account once the order is packed or shipped.',
        },
      ]}
    />
  );
}

export function ReturnsSupportPage() {
  return (
    <SupportLayout
      eyebrow="POLICY"
      title="RETURNS"
      description="Return and exchange guidance for eligible items."
      ctaLabel="CONTACT US"
      ctaHref="/contact-us"
      sections={[
        {
          title: 'Return eligibility',
          body: 'Eligible items must be unused, unworn, and returned in their original condition.',
        },
        {
          title: 'Final sale items',
          body: 'Nail sets, intimate items, and clearly marked sale items may be final sale unless faulty.',
        },
        {
          title: 'Return request window',
          body: 'Contact support as soon as possible after delivery if you need a return or exchange review.',
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
      description="How account, address, and order data are handled."
      sections={[
        {
          title: 'Account information',
          body: 'We store the customer profile details required to support sign-in, account management, and order history.',
        },
        {
          title: 'Order and delivery data',
          body: 'Shipping details, contact information, and order records are used to process and deliver purchases.',
        },
        {
          title: 'Admin access',
          body: 'Authorized store administrators can access operational order, customer, and catalog data inside the admin panel.',
        },
        {
          title: 'Support requests',
          body: 'Messages sent to support may be retained to resolve account, delivery, and order issues.',
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
