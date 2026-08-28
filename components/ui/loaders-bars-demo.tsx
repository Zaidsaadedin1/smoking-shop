import { LoaderBars } from '@/components/ui/loaders-bars';

export default function LoaderBarsDemo() {
  return (
    <div className="flex min-h-[300px] w-full items-center justify-center bg-background text-foreground">
      <LoaderBars barWidth={10} barHeight={90} gap={8} count={5} />
    </div>
  );
}
