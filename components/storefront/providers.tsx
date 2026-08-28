'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ApiActivityProvider } from '@/components/storefront/api-activity-provider';
import { LocaleProvider } from '@/components/storefront/locale-provider';
import { NavigationLoader } from '@/components/storefront/navigation-loader';
import { AppThemeProvider } from '@/components/storefront/theme-provider';
import { RecoveryRedirect } from '@/components/storefront/recovery-redirect';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AppThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RecoveryRedirect />
        <LocaleProvider>
          <ApiActivityProvider>
            <NavigationLoader />
            {children}
          </ApiActivityProvider>
        </LocaleProvider>
      </QueryClientProvider>
    </AppThemeProvider>
  );
}
