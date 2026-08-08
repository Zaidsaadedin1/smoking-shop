import '@mantine/core/styles.css';
import { mantineHtmlProps, MantineProvider } from '@mantine/core';
import React from 'react';
import { theme } from '../theme';

export const metadata = {
  title: 'Tourmaline Coven',
  description: 'Dark gothic e-commerce experience built with Mantine.',
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body style={{ margin: 0, background: '#050308' }}>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
