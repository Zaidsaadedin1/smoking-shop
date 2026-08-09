'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

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

  if (url.startsWith('/api/')) {
    return true;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin && parsed.pathname.startsWith('/api/');
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
      <div
        aria-hidden={activeRequests === 0}
        className={`tc-api-overlay${activeRequests > 0 ? ' tc-api-overlay--visible' : ''}`}
      >
        <div className="tc-api-overlay__panel" role="status" aria-live="polite">
          <div className="tc-api-overlay__gems" aria-hidden="true">
            <span className="tc-api-overlay__gem tc-api-overlay__gem--left" />
            <span className="tc-api-overlay__gem tc-api-overlay__gem--center" />
            <span className="tc-api-overlay__gem tc-api-overlay__gem--right" />
          </div>
          <div className="tc-api-overlay__copy">
            <span className="tc-api-overlay__eyebrow">Coven Ritual</span>
            <span className="tc-api-overlay__label">Setting The Order In Stone</span>
          </div>
        </div>
      </div>
    </>
  );
}
