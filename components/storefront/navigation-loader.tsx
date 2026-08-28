'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LoaderBars } from '@/components/ui/loaders-bars';

const NAVIGATION_FALLBACK_MS = 1200;
const INITIAL_LOAD_MINIMUM_MS = 650;

export function NavigationLoader() {
  const pathname = usePathname();
  const isFirstPathname = useRef(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const startedAt = Date.now();
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

    const finishInitialLoad = () => {
      const remaining = Math.max(0, INITIAL_LOAD_MINIMUM_MS - (Date.now() - startedAt));
      fallbackTimer = setTimeout(() => setVisible(false), remaining);
    };

    if (document.readyState === 'complete') {
      finishInitialLoad();
    } else {
      window.addEventListener('load', finishInitialLoad, { once: true });
      fallbackTimer = setTimeout(() => setVisible(false), NAVIGATION_FALLBACK_MS);
    }

    return () => {
      window.removeEventListener('load', finishInitialLoad);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (isFirstPathname.current) {
      isFirstPathname.current = false;
      return;
    }

    setVisible(false);
  }, [pathname]);

  useEffect(() => {
    const handleNavigationStart = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest('a');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;

      setVisible(true);
    };

    document.addEventListener('click', handleNavigationStart, true);
    return () => document.removeEventListener('click', handleNavigationStart, true);
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 text-foreground backdrop-blur-sm"
    >
      <LoaderBars barWidth={6} barHeight={46} gap={6} count={5} />
    </div>
  );
}
