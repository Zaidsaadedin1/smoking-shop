'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ApiActivityProvider } from '@/components/storefront/api-activity-provider';
import { LocaleProvider } from '@/components/storefront/locale-provider';
import { AppThemeProvider } from '@/components/storefront/theme-provider';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AppThemeProvider>
      <QueryClientProvider client={queryClient}>
        <LocaleProvider>
          <ApiActivityProvider>{children}</ApiActivityProvider>
        </LocaleProvider>
      </QueryClientProvider>
    </AppThemeProvider>
  );
}
