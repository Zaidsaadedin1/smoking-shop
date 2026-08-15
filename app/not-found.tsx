import Link from 'next/link';
import { Home, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="tc-not-found relative isolate min-h-screen overflow-hidden">
      <div className="tc-not-found__beam tc-not-found__beam--one" aria-hidden="true" />
      <div className="tc-not-found__beam tc-not-found__beam--two" aria-hidden="true" />
      <div className="noise-overlay absolute inset-0 pointer-events-none" aria-hidden="true" />

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-12">
        <div className="flex flex-col justify-center gap-7">
          <div className="tc-not-found__badge">
            <img src="/shawerma-3a-saj-logo.jpg" alt="Shawerma 3a Saj" />
            <span>Kitchen route check</span>
          </div>

          <div className="space-y-5">
            <p className="tc-not-found__code">404</p>
            <div className="space-y-3">
              <h1 className="font-display text-5xl font-bold leading-[0.96] sm:text-6xl lg:text-7xl">
                This order
                <br />
                rolled away.
              </h1>
              <p className="max-w-xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
                The page you opened is not on today&apos;s route. Head back to the menu and build a
                fresh shawerma order.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/shop" className="tc-not-found__button tc-not-found__button--primary">
              <ShoppingBag size={18} aria-hidden="true" />
              Order now
            </Link>
            <Link href="/" className="tc-not-found__button tc-not-found__button--secondary">
              <Home size={18} aria-hidden="true" />
              Go home
            </Link>
          </div>
        </div>

        <div className="tc-not-found__stage" aria-hidden="true">
          <div className="tc-not-found__ticket">
            <div className="tc-not-found__ticket-top">
              <span>Order ticket</span>
              <strong>#0404</strong>
            </div>
            <div className="tc-not-found__ticket-lines">
              <span />
              <span />
              <span />
            </div>
            <div className="tc-not-found__stamp">Not found</div>
          </div>

          <div className="tc-not-found__tray">
            <div className="tc-not-found__wrap">
              <span className="tc-not-found__wrap-mark tc-not-found__wrap-mark--one" />
              <span className="tc-not-found__wrap-mark tc-not-found__wrap-mark--two" />
              <span className="tc-not-found__wrap-mark tc-not-found__wrap-mark--three" />
              <div className="tc-not-found__filling">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="tc-not-found__sauce" />
          </div>

          <div className="tc-not-found__pin">?</div>
          <div className="tc-not-found__crumb tc-not-found__crumb--one" />
          <div className="tc-not-found__crumb tc-not-found__crumb--two" />
          <div className="tc-not-found__crumb tc-not-found__crumb--three" />
        </div>
      </section>
    </main>
  );
}
