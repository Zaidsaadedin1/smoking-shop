import Link from 'next/link';

export default function AuthConfirmedPage() {
  return (
    <Box
      component="main"
      className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-6 py-16 text-center"
    >
      <Box
        component="div"
        className="rounded-[36px] border border-[var(--border)] bg-[var(--card)] p-8 shadow-[0_18px_54px_rgba(24,18,17,0.08)] md:p-10"
      >
        <Box component="div" className="text-xs tracking-[0.25em] text-[var(--muted)]">
          EMAIL VERIFIED
        </Box>
        <Box component="h1" className="mt-3 font-display text-5xl uppercase">
          You’re all set
        </Box>
        <Box component="p" className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
          Your email has been confirmed. Sign in to continue shopping.
        </Box>
        <Link
          href="/login"
          className="mt-8 inline-flex rounded-full bg-[var(--text)] px-6 py-3 text-sm font-semibold text-[var(--background)]"
        >
          Go to login
        </Link>
      </Box>
    </Box>
  );
}
import { Box } from '@mantine/core';
