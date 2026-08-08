import type { Metadata } from 'next';
import '@mantine/core/styles.css';
import React from 'react';
import '@/app/globals.css';
import { Providers } from '@/components/storefront/providers';
import { StorefrontShell } from '@/components/storefront/storefront-shell';
import { getFlashSale, getStoreSettings } from '@/lib/commerce-server';

export const metadata: Metadata = {
  title: {
    default: 'Tourmaline Coven',
    template: '%s | Tourmaline Coven',
  },
  description: 'Premium dark feminine ecommerce experience for Jordan.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, flashSale] = await Promise.all([getStoreSettings(), getFlashSale()]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <StorefrontShell settings={settings} flashSale={flashSale}>
            {children}
          </StorefrontShell>
        </Providers>
      </body>
    </html>
  );
}
