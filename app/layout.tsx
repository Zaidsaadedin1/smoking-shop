import type { Metadata } from 'next';
import '@mantine/core/styles.css';
import React from 'react';
import '@/app/globals.css';
import { Providers } from '@/components/storefront/providers';
import { StorefrontShell } from '@/components/storefront/storefront-shell';
import { getFlashSale, getStoreSettings } from '@/lib/commerce-server';

export const metadata: Metadata = {
  title: 'Tourmaline Coven',
  description: 'Premium dark feminine ecommerce experience for Jordan.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, flashSale] = await Promise.all([getStoreSettings(), getFlashSale()]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="shortcut icon" href="/favicon.svg" />
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
