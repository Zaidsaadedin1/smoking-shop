'use client';

import { ArrowUpRight, ChevronDown, Clock, Mail, MapPin, MessageCircle, Phone, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { Container, SectionHeading } from '@/components/storefront/storefront-sections';
import { useLocale } from '@/components/storefront/locale-provider';

type SupportSection = {
  title: string;
  body: string;
};

const hotline = '+962 79 256 0025';
const email = 'support@puffjo.com';

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
  legal = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: SupportSection[];
  ctaLabel?: string;
  ctaHref?: string;
  legal?: boolean;
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
              className="rounded-full border border-[var(--border)] bg-[var(--card)] px-5 py-3 text-sm font-semibold tracking-[0.14em] text-[var(--text)] transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--elevated)]"
            >
              {t(ctaLabel)}
            </Link>
          ) : null
        }
      />
      <div className={legal ? 'grid gap-3' : 'grid gap-4 lg:grid-cols-2'}>
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={legal ? { opacity: 0, y: 14 } : undefined}
            whileInView={legal ? { opacity: 1, y: 0 } : undefined}
            viewport={legal ? { once: true, amount: 0.15 } : undefined}
            transition={legal ? { delay: index * 0.04, duration: 0.4 } : undefined}
            className={legal
              ? 'group grid gap-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-5 transition hover:bg-[var(--surface)] md:grid-cols-[4rem_0.55fr_1.45fr] md:items-start md:px-6'
              : 'rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_14px_36px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:border-[var(--accent)]'}
          >
            {legal ? <div className="text-2xl font-black tracking-[-0.04em] text-[var(--muted)]">{String(index + 1).padStart(2, '0')}</div> : null}
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
              {t(section.title)}
            </div>
            <p className={legal ? 'text-sm leading-8 text-[var(--text-secondary)] md:max-w-3xl' : 'mt-4 text-sm leading-7 text-[var(--text-secondary)]'}>
              {t(section.body)}
            </p>
          </motion.div>
        ))}
      </div>
    </Container>
  );
}

export function ContactSupportPage() {
  const { localize } = useLocale();
  const whatsappHref = `https://wa.me/962792560025?text=${encodeURIComponent(
    localize(
      'Hi Puff Jo, I need help with a product or order.',
      'مرحبا بف جو، بدي مساعدة بخصوص منتج أو طلب.'
    )
  )}`;

  return (
    <Container className="py-8 md:py-14">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative isolate overflow-hidden rounded-[36px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.14)] md:p-10 lg:p-14"
      >
        <div className="pointer-events-none absolute -right-28 -top-32 -z-10 h-80 w-80 rounded-full border border-[var(--border)] opacity-60" />
        <div className="pointer-events-none absolute -right-10 top-8 -z-10 h-56 w-56 rounded-full bg-[color:color-mix(in_srgb,var(--accent)_12%,transparent)] blur-3xl" />
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.45 }}
              className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]"
            >
              <span className="h-px w-8 bg-[var(--accent)]" />
              {localize('PUFF JO / ONLINE SUPPORT', 'بف جو / دعم أونلاين')}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.55 }}
              className="mt-6 max-w-2xl text-5xl font-black uppercase leading-[0.94] tracking-[-0.04em] text-[var(--text)] md:text-7xl"
            >
              {localize('Talk to Puff Jo.', 'احكي مع بف جو.')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-6 max-w-xl text-base leading-8 text-[var(--text-secondary)] md:text-lg"
            >
              {localize(
                'We are an online-only vape shop in Jordan. Reach us for product advice, order updates, delivery questions, or help choosing your next setup.',
                'إحنا متجر فيب أونلاين فقط بالأردن. تواصل معنا لنساعدك باختيار المنتجات، وتحديثات الطلب، وأسئلة التوصيل، أو تجهيزتك الجاية.'
              )}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.5 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                href={`tel:${hotline.replace(/\D/g, '')}`}
                className="group inline-flex items-center gap-2 rounded-none bg-[var(--accent)] px-5 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition duration-300 hover:-translate-y-1 hover:bg-[var(--accent-hover)]"
                style={{ color: '#ffffff' }}
              >
                <Phone className="h-4 w-4" />
                {localize('Call us', 'اتصل بنا')}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href={`mailto:${email}`}
                className="group inline-flex items-center gap-2 rounded-none border border-[var(--border)] bg-transparent px-5 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-[var(--text)] transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:bg-[var(--surface)]"
              >
                <Mail className="h-4 w-4" />
                {localize('Email us', 'راسلنا')}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-md"
          >
            <motion.div
              animate={{ y: [-7, 7, -7], rotate: [-1, 1, -1] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative aspect-[0.9] overflow-hidden rounded-[30px] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--background)_76%,var(--accent)_10%)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
            >
              <div className="absolute inset-4 rounded-[23px] border border-[var(--border)]" />
              <div className="absolute -left-10 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full border border-[var(--border)] opacity-60" />
              <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-[color:color-mix(in_srgb,var(--accent)_10%,transparent)] blur-3xl" />
              <div className="relative flex h-full flex-col justify-between rounded-[22px] bg-[color:color-mix(in_srgb,var(--card)_68%,transparent)] p-6 backdrop-blur-sm md:p-8">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
                  <span>PUFF JO</span>
                  <span>ONLINE / 01</span>
                </div>
                <div>
                  <motion.div
                    animate={{ rotate: [0, 6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="mx-auto flex h-32 w-24 items-center justify-center rounded-[18px] border border-[var(--border)] bg-[var(--background)] shadow-[10px_16px_0_color-mix(in_srgb,var(--accent)_18%,transparent)] md:h-40 md:w-28"
                  >
                    <div className="text-center">
                      <Sparkles className="mx-auto h-6 w-6 text-[var(--accent)]" />
                      <div className="mt-3 text-2xl font-black tracking-[-0.08em] text-[var(--text)]">PUFF</div>
                      <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.25em] text-[var(--muted)]">JORDAN</div>
                    </div>
                  </motion.div>
                  <div className="mt-8 text-center text-sm font-semibold text-[var(--text-secondary)]">
                    {localize('Your setup, sorted.', 'تجهيزتك صارت جاهزة.')}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                  <span>{localize('Online shop', 'متجر أونلاين')}</span>
                  <span>AMMAN / JO</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="mt-5 grid gap-4 md:grid-cols-3"
      >
        <ContactCard icon={<Phone className="h-5 w-5" />} title="Order hotline" body={hotline} href={`tel:${hotline.replace(/\D/g, '')}`} />
        <ContactCard icon={<Mail className="h-5 w-5" />} title="Email" body={email} href={`mailto:${email}`} />
        <ContactCard
          icon={<Clock className="h-5 w-5" />}
          title="Hours"
          body={localize('Daily, 12:00 PM – 2:00 AM', 'يومياً، من 12 الظهر – 2 الفجر')}
        />
      </motion.div>

      <section className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-[28px] border border-[var(--border)] bg-[var(--accent)] p-6 text-[var(--background)] md:p-8"
        >
          <MessageCircle className="h-7 w-7" />
          <h2 className="mt-12 text-3xl font-black uppercase leading-none">
            {localize('Need a quick answer?', 'بدك جواب سريع؟')}
          </h2>
          <p className="mt-4 text-sm leading-7 opacity-75">
            {localize('Send us your order number or product question and we will get back to you.', 'ابعث رقم طلبك أو سؤالك عن أي منتج، وإحنا بنرجعلك.')}
          </p>
          <Link
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] underline underline-offset-4"
          >
            {localize('Start a conversation', 'ابدأ محادثة')} <MessageCircle className="h-4 w-4" />
          </Link>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['Product guidance', 'Not sure which device, pod, or flavor fits you? We can help.', 'مش عارف أي جهاز أو بود أو نكهة تناسبك؟ بنساعدك.'],
            ['Order support', 'Questions about payment, delivery, or an order already on its way?', 'عندك سؤال عن الدفع أو التوصيل أو طلبك الحالي؟'],
          ].map(([title, body, bodyAr], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
              className="group rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--accent)] transition group-hover:bg-[var(--accent)] group-hover:text-[var(--background)]">
                <span className="text-sm font-black">0{index + 1}</span>
              </div>
              <h3 className="mt-10 text-xl font-bold uppercase text-[var(--text)]">{localize(title, index === 0 ? 'مساعدة بالمنتجات' : 'مساعدة بالطلبات')}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{localize(body, bodyAr)}</p>
            </motion.div>
          ))}
        </div>
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
        title="PUFF JO"
        description="Puff Jo is a Jordan-focused smoking store for quality vape devices, e-liquids, pods, coils, and accessories."
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
          <div className="bg-black p-6 text-white md:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/72">
              {localize('Official positioning', 'هوية المطعم')}
            </div>
            <h2 className="mt-3 text-4xl font-black uppercase leading-none md:text-6xl">
              {localize('Premium vape essentials', 'مستلزمات فيب مميزة')}
            </h2>
          </div>
          <div className="space-y-4 p-6 text-sm leading-8 text-[var(--text-secondary)] md:p-8">
            <p>
              {localize(
                'Puff Jo brings together reliable hardware, considered flavor, and everyday smoking essentials in one clean storefront.',
                'تصف القوائم العامة شاورما ع صاج كمطعم شرقي من عمان يركز على وجبات وسندويشات الشاورما المحضرة على خبز الصاج بلمسة عصرية.'
              )}
            </p>
            <p>
              {localize(
                'Our focus is simple: clear product information, dependable quality, and fast access to the latest drops across Jordan.',
                'تؤكد صفحة التطبيق الرسمية على النكهة الأصلية والجودة الثابتة وسهولة الوصول إلى المنيو وخدمات التوصيل والاستلام عبر فروع الأردن.'
              )}
            </p>
            <p>
              {localize(
                'Shop disposable and reusable devices, e-liquids, pods, coils, chargers, cases, and smoking accessories.',
                'اتجاه المنيو واضح: شاورما دجاج ولحم، سندويشات صاج، وجبات عربي، رز، فتات، بطاطا، سلطات، صوصات ومشروبات.'
              )}
            </p>
          </div>
        </section>

        <section className="grid gap-4">
          <AboutFact title="Order hotline" titleAr="رقم الطلبات" value={hotline} />
          <AboutFact title="Email" titleAr="البريد الإلكتروني" value={email} />
          <AboutFact
            title="Main public address"
            titleAr="العنوان العام الرئيسي"
            value={localize(
              'Al Madina Al Munawwarah St., Al Saad Complex 2, Amman',
              'شارع المدينة المنورة، مجمع السعد 2، عمان'
            )}
          />
          <AboutFact
            title="Public hours"
            titleAr="ساعات العمل العامة"
            value={localize(
              'Daily listings show 10:00 AM - 4:00 AM',
              'القوائم العامة تظهر 10 صباحاً - 4 فجراً'
            )}
          />
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
            className="w-fit rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold tracking-[0.14em] text-[var(--background)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-hover)]"
          >
            {hotline}
          </Link>
        </div>
        <BranchGrid />
      </section>
    </Container>
  );
}

function ContactCard({
  icon,
  title,
  body,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href?: string;
}) {
  const { t } = useLocale();

  const content = (
    <>
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]">
        {icon}
      </div>
      <div className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
        {t(title)}
      </div>
      <div className="mt-2 text-lg font-bold text-[var(--text)]">{body}</div>
    </>
  );

  return href ? (
    <motion.a
      href={href}
      variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
      className="group rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_14px_36px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]"
    >
      {content}
    </motion.a>
  ) : (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
      className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_14px_36px_rgba(0,0,0,0.08)]"
    >
      {content}
    </motion.div>
  );
}

function AboutFact({ title, titleAr, value }: { title: string; titleAr: string; value: string }) {
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
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
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
          body: 'Orders are checked and packed after confirmation. Preparation time can change with product availability and live order volume.',
        },
        {
          title: 'Amman delivery',
          body: 'Amman delivery timing depends on your area, traffic, courier availability, and current order volume. We confirm the delivery details before dispatch.',
        },
        {
          title: 'Jordan delivery',
          body: 'Coverage and product availability vary by city and delivery zone. Enter your address at checkout to see the available option and fee.',
        },
        {
          title: 'Pickup orders',
          body: 'Choose pickup when it is available at checkout. Keep your order confirmation ready and wait for the pickup notice before visiting the branch.',
        },
        {
          title: 'Delivery notes',
          body: 'Add clear building, street, and contact details at checkout. Our team may call the number on the order if the location needs confirmation.',
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
      description="Guidance for incorrect, delayed, or changed product orders."
      ctaLabel="CONTACT US"
      ctaHref="/contact-us"
      legal
      sections={[
        {
          title: 'Order changes',
          body: 'Contact support as soon as possible with your order number if you need to change an address, phone number, flavor, or delivery note. Changes cannot be guaranteed after dispatch.',
        },
        {
          title: 'Product orders',
          body: 'Unopened, unused products may be eligible for a return review. Contact support before sending anything back so we can confirm eligibility and next steps.',
        },
        {
          title: 'Issue window',
          body: 'Check your package when it arrives and contact us promptly if an item is missing, incorrect, leaking, or damaged.',
        },
        {
          title: 'Damaged or incorrect orders',
          body: 'Send your order number, a short description, and clear photos of the package or product. We will review the issue and guide you through the available resolution.',
        },
        {
          title: 'Order cancellation',
          body: 'Cancellation requests are handled case by case and depend on whether the order has entered preparation or dispatch. Call the order line rather than sending a delayed message.',
        },
      ]}
    />
  );
}

export function FaqSupportPage() {
  const { t } = useLocale();
  const [openIndex, setOpenIndex] = useState(0);
  const questions = [
    ['How do I track my order?', 'Open your account orders page to see the latest order status, tracking number when available, and delivery updates.'],
    ['Can I save multiple addresses?', 'Yes. Signed-in customers can save multiple delivery addresses and choose one during checkout.'],
    ['Do I need an account to check out?', 'Yes. Checkout is restricted to registered customers so orders, addresses, and account history stay connected.'],
    ['Can I review a product?', 'Yes. Signed-in customers can submit reviews directly from the product page.'],
    ['What products does Puff Jo sell?', 'Puff Jo carries vape devices, disposable vapes, pod systems, e-liquids, pods, coils, chargers, cases, and other smoking accessories. Availability changes by product and delivery area.'],
    ['Do you sell to minors?', 'No. Puff Jo products are intended for adults of legal smoking age only. We may request age or identity confirmation before completing an order or delivery.'],
  ];

  return (
    <Container className="py-8 md:py-14">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative isolate overflow-hidden rounded-[36px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.12)] md:p-10 lg:p-14"
      >
        <div className="pointer-events-none absolute -right-20 -top-28 -z-10 h-72 w-72 rounded-full border border-[var(--border)] opacity-60" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 -z-10 h-64 w-64 rounded-full bg-[color:color-mix(in_srgb,var(--accent)_10%,transparent)] blur-3xl" />
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div>
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
              <span className="h-px w-8 bg-[var(--accent)]" />
              {t('HELP')}
            </div>
            <h1 className="mt-6 text-6xl font-black uppercase leading-[0.88] tracking-[-0.05em] text-[var(--text)] md:text-8xl">
              {t('FAQ')}
            </h1>
            <p className="mt-6 max-w-sm text-base leading-8 text-[var(--text-secondary)]">
              {t('Quick answers to the most common store and order questions.')}
            </p>
            <div className="mt-10 border-t border-[var(--border)] pt-5">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                {t('PUFF JO / ONLINE SUPPORT')}
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                {t('Need a hand with a product or order? We are here online across Jordan.')}
              </p>
              <Link
                href="/contact-us"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[var(--text)] underline decoration-[var(--accent)] decoration-2 underline-offset-4 transition hover:text-[var(--accent)]"
              >
                {t('CONTACT US')} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            {questions.map(([question, answer], index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div
                  key={question}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + index * 0.05, duration: 0.4 }}
                  className={`overflow-hidden border-b border-[var(--border)] ${isOpen ? 'bg-[var(--surface)]' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 px-4 py-5 text-left transition hover:text-[var(--accent)] md:px-5"
                  >
                    <span className="flex items-start gap-4 text-base font-bold text-[var(--text)] md:text-lg">
                      <span className="pt-0.5 text-xs font-semibold tracking-[0.16em] text-[var(--muted)]">0{index + 1}</span>
                      {t(question)}
                    </span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-[var(--muted)] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--accent)]' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p className="max-w-2xl px-4 pb-6 pl-14 text-sm leading-8 text-[var(--text-secondary)] md:px-5 md:pl-16">
                          {t(answer)}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>
    </Container>
  );
}

export function PrivacySupportPage() {
  return (
    <SupportLayout
      eyebrow="LEGAL"
      title="PRIVACY POLICY"
      description="Last updated: August 15, 2026. This policy explains how Puff Jo handles customer data for online ordering, delivery, accounts, and support."
      legal
      sections={[
        {
          title: 'Information we collect',
          body: 'When you use this website, we may collect your name, email address, phone number, saved addresses, delivery area, order items, selected add-ons, payment method, coupon use, support messages, and basic account activity such as login and order history.',
        },
        {
          title: 'How we use your information',
          body: 'We use customer information to create and secure accounts, confirm orders, calculate delivery fees, contact you about an order, deliver to the correct address, provide support, prevent misuse, and improve the shopping experience.',
        },
        {
          title: 'Accounts and authentication',
          body: 'Account registration and login are handled through Supabase authentication. Email verification, session management, and account identifiers are used so orders, saved addresses, and profile data stay connected to the correct customer.',
        },
        {
          title: 'Orders, delivery, and online operations',
          body: 'Order and delivery details may be visible to authorized Puff Jo team members who need them for dispatch, customer service, refunds, complaints, or operational reporting.',
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
          title: 'Security',
          body: 'We use access controls and service providers designed to protect account and order information. No online service can guarantee absolute security, so keep your password private and contact us if you notice suspicious activity.',
        },
        {
          title: 'Privacy contact',
          body: 'For privacy questions, contact Puff Jo at support@puffjo.com.',
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
      legal
      sections={[
        {
          title: 'Orders and pricing',
          body: 'Published prices, availability, and catalog content may change before an order is confirmed.',
        },
        {
          title: 'Age requirement',
          body: 'You must be an adult of legal smoking age in your location to browse and purchase age-restricted products. We may request age or identity verification at checkout or delivery.',
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
        {
          title: 'Responsible use',
          body: 'Use every device, e-liquid, pod, coil, and accessory according to its manufacturer instructions. Keep products away from children, pets, heat, and open flames.',
        },
        {
          title: 'Account responsibility',
          body: 'Keep your account details and delivery information accurate. You are responsible for activity made through your account and for being available at the delivery address.',
        },
      ]}
    />
  );
}
