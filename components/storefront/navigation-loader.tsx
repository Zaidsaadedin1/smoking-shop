'use client';

import { useEffect, useState } from 'react';
import { LoaderBars } from '@/components/ui/loaders-bars';

export function NavigationLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleRouteReady = () => setVisible(false);
    window.addEventListener('storefront:route-ready', handleRouteReady);

    return () => {
      window.removeEventListener('storefront:route-ready', handleRouteReady);
    };
  }, []);

  useEffect(() => {
    const handleNavigationStart = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest('a');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname)
        return;

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
