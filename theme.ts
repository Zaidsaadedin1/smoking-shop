'use client';

import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'grape',
  defaultRadius: 'xl',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: {
    fontFamily:
      '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, "Times New Roman", serif',
    fontWeight: '500',
  },
  colors: {
    night: [
      '#f3efff',
      '#d8ccef',
      '#bda9de',
      '#a286ce',
      '#8865bf',
      '#734dae',
      '#5a3a88',
      '#432b66',
      '#2d1c46',
      '#190d29',
    ],
  },
  primaryShade: 5,
  other: {
    pageGradient:
      'radial-gradient(circle at top, rgba(123, 63, 228, 0.22), transparent 28%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08), transparent 18%), linear-gradient(180deg, #09060d 0%, #110917 46%, #050308 100%)',
  },
});
