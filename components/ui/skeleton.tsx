import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="skeleton" className={cn('flex animate-pulse color-gray-300 space-x-4', className)} {...props} />
  );
}

export { Skeleton };
