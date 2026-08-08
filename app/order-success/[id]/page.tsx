import Link from 'next/link';
import { Container, SectionHeading } from '@/components/storefront/storefront-sections';

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container className="py-12 md:py-20">
      <div className="mx-auto max-w-3xl rounded-[36px] border border-white/8 bg-white/3 p-8 md:p-10">
        <SectionHeading title="ORDER RECEIVED." description={`Order #${id}`} />
        <div className="space-y-4 text-sm leading-7 text-[var(--text-secondary)]">
          <p>Total and delivery details should be populated from your live orders table once checkout is connected.</p>
          <p>The current date is August 8, 2026, so this confirmation page is ready to receive future live order records.</p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/account" className="rounded-full border border-white/10 px-5 py-3 text-center text-sm tracking-[0.2em]">
            TRACK ORDER
          </Link>
          <Link href="/shop" className="rounded-full bg-[var(--text)] px-5 py-3 text-center text-sm tracking-[0.2em] text-black">
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    </Container>
  );
}
