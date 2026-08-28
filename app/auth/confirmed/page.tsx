import Link from 'next/link';

export default function AuthConfirmedPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-6 py-16 text-center">
      <div className="rounded-[36px] border border-[var(--border)] bg-[var(--card)] p-8 shadow-[0_18px_54px_rgba(24,18,17,0.08)] md:p-10">
        <div className="text-xs tracking-[0.25em] text-[var(--muted)]">EMAIL VERIFIED</div>
        <h1 className="mt-3 font-display text-5xl uppercase">You’re all set</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
          Your email has been confirmed. Sign in to continue shopping.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex rounded-full bg-[var(--text)] px-6 py-3 text-sm font-semibold text-[var(--background)]"
        >
          Go to login
        </Link>
      </div>
    </main>
  );
}
