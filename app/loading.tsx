import { LoaderBars } from '@/components/ui/loaders-bars';

export default function Loading() {
  return (
    <Box
      component="main"
      className="flex min-h-[60vh] w-full items-center justify-center bg-background text-foreground"
    >
      <LoaderBars aria-label="Loading" barWidth={6} barHeight={44} gap={6} count={5} />
    </Box>
  );
}
import { Box } from '@mantine/core';
