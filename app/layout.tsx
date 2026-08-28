import type { Metadata } from 'next';
import '@mantine/core/styles.css';
import React from 'react';
import '@/app/globals.css';
import { Providers } from '@/components/storefront/providers';
import { StorefrontShell } from '@/components/storefront/storefront-shell';
import { getFlashSale, getNavigationItems, getStoreSettings } from '@/lib/commerce-server';

export const metadata: Metadata = {
  title: {
    default: 'Puff Jo',
    template: '%s | Puff Jo',
  },
  description: 'Premium vape hardware, e-liquid, pods, coils, and accessories.',
  icons: {
    icon: '/puff-jordan-logo.png',
    shortcut: '/puff-jordan-logo.png',
    apple: '/puff-jordan-logo.png',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, flashSale, navigationItems] = await Promise.all([
    getStoreSettings(),
    getFlashSale(),
    getNavigationItems(),
  ]);

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <StorefrontShell
            settings={settings}
            flashSale={flashSale}
            navigationItems={navigationItems}
          >
            {children}
          </StorefrontShell>
        </Providers>
      </body>
    </html>
  );
}
