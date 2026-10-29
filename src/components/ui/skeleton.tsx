import type { HTMLAttributes } from 'react';
import { cn } from '@/core/lib/cn';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('ds-skeleton', className)} aria-hidden {...props} />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-3.5', index === lines - 1 ? 'w-2/3' : index % 2 === 0 ? 'w-full' : 'w-11/12')}
        />
      ))}
    </div>
  );
}
