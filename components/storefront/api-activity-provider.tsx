'use client';

import { Box } from '@mantine/core';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { LoaderBars } from '@/components/ui/loaders-bars';

function resolveRequestUrl(input: RequestInfo | URL): string | null {
  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  if (typeof Request !== 'undefined' && input instanceof Request) {
    return input.url;
  }

  return null;
}

function isApiRequest(input: RequestInfo | URL): boolean {
  const url = resolveRequestUrl(input);

  if (!url) {
    return false;
  }

  if (url === '/api' || url.startsWith('/api/')) {
    return true;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const parsed = new URL(url, window.location.origin);
    return (
      parsed.origin === window.location.origin &&
      (parsed.pathname === '/api' || parsed.pathname.startsWith('/api/'))
    );
  } catch {
    return false;
  }
}

export function ApiActivityProvider({ children }: { children: ReactNode }) {
  const [activeRequests, setActiveRequests] = useState(0);
  const originalFetchRef = useRef<typeof window.fetch | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || originalFetchRef.current) {
      return;
    }

    const originalFetch = window.fetch.bind(window);
    originalFetchRef.current = originalFetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const shouldTrack = isApiRequest(input);

      if (shouldTrack) {
        setActiveRequests((value) => value + 1);
      }

      try {
        return await originalFetch(input, init);
      } finally {
        if (shouldTrack) {
          setActiveRequests((value) => Math.max(0, value - 1));
        }
      }
    };

    return () => {
      if (originalFetchRef.current) {
        window.fetch = originalFetchRef.current;
        originalFetchRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {children}
      <Box
        component="div"
        aria-hidden={activeRequests === 0}
        aria-busy={activeRequests > 0}
        aria-label="Loading"
        className={`fixed inset-0 z-[9998] flex items-center justify-center bg-background/95 text-foreground backdrop-blur-sm transition-opacity ${activeRequests > 0 ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <LoaderBars barWidth={6} barHeight={46} gap={6} count={5} />
      </Box>
    </>
  );
}
