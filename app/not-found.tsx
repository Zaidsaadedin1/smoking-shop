import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="tc-not-found relative isolate overflow-hidden">
      <div className="tc-not-found__cross tc-not-found__cross--one" aria-hidden="true" />
      <div className="tc-not-found__cross tc-not-found__cross--two" aria-hidden="true" />
      <div className="noise-overlay absolute inset-0 pointer-events-none" aria-hidden="true" />

      <section className="relative z-10 mx-auto flex min-h-[100vh] w-full max-w-6xl items-center px-6 py-16 sm:px-10 lg:px-16">
        <div className="tc-not-found__panel grid w-full gap-10 overflow-hidden rounded-[2rem] border px-6 py-8 sm:px-10 sm:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-14">
          <div className="flex flex-col justify-center gap-6">
            <span className="tc-not-found__eyebrow">Lost In The Coven</span>
            <div className="space-y-4">
              <p className="tc-not-found__code">404</p>
              <h1 className="font-display text-5xl leading-none tracking-[0.16em] sm:text-6xl lg:text-7xl">
                THIS PAGE
                <br />
                SLIPPED AWAY
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                The page you asked for does not exist, moved, or the link is broken. Use one of the
                routes below to get back into the storefront.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/" className="tc-not-found__button tc-not-found__button--primary">
                Return Home
              </Link>
              <Link href="/shop" className="tc-not-found__button tc-not-found__button--secondary">
                Browse Shop
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="tc-not-found__sigil">
              <div className="tc-not-found__sigil-ring tc-not-found__sigil-ring--outer" />
              <div className="tc-not-found__sigil-ring tc-not-found__sigil-ring--inner" />
              <div className="tc-not-found__sigil-slash tc-not-found__sigil-slash--left" />
              <div className="tc-not-found__sigil-slash tc-not-found__sigil-slash--right" />
              <div className="tc-not-found__sigil-center">
                <span className="font-display">N</span>
                <small>Not Found</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
