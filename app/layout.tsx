import type { Metadata } from "next";
import "@mantine/core/styles.css";
import React from "react";
import "@/app/globals.css";
import { Providers } from "@/components/storefront/providers";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import {
  getFlashSale,
  getNavigationItems,
  getStoreSettings,
} from "@/lib/commerce-server";

export const metadata: Metadata = {
  title: {
    default: "Shawerma 3a Saj",
    template: "%s | Shawerma 3a Saj",
  },
  description: "Fresh shawerma, saj meals, delivery, and pickup across Jordan.",
  icons: {
    icon: "/shawerma-3a-saj-logo.jpg",
    shortcut: "/shawerma-3a-saj-logo.jpg",
    apple: "/shawerma-3a-saj-logo.jpg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, flashSale, navigationItems] = await Promise.all([
    getStoreSettings(),
    getFlashSale(),
    getNavigationItems(),
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
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
