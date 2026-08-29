import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <Box
      component="main"
      className="min-h-screen bg-[var(--background)] px-4 py-16 text-[var(--text)]"
    >
      <Box
        component="div"
        className="mx-auto max-w-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center"
      >
        <Box
          component="div"
          className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]"
        >
          Order received
        </Box>
        <Box component="h1" className="mt-4 text-4xl font-semibold uppercase tracking-[0.16em]">
          Thank you for your order
        </Box>
        <Box component="p" className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
          Your order has been placed successfully. You can review your order history from your
          account dashboard.
        </Box>
        <Box component="div" className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
        </Box>
      </Box>
    </Box>
  );
}
import { Box } from '@mantine/core';
