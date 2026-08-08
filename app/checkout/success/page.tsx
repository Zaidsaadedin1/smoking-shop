import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-16 text-[var(--text)]">
      <div className="mx-auto max-w-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">Order received</div>
        <h1 className="mt-4 text-4xl font-semibold uppercase tracking-[0.16em]">Thank you for your order</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
          Your order has been placed successfully. You can review your order history from your account dashboard.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/orders"
            className="inline-flex min-w-[180px] items-center justify-center border border-[var(--text)] bg-[var(--text)] px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-[var(--background)]"
          >
            View orders
          </Link>
          <Link
            href="/shop"
            className="inline-flex min-w-[180px] items-center justify-center border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-[11px] uppercase tracking-[0.24em] text-[var(--text)]"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
