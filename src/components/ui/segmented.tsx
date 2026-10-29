import type { ReactNode } from 'react';
import { cn } from '@/core/lib/cn';

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: ReactNode; icon?: ReactNode }>;
  ariaLabel: string;
  className?: string;
  fullWidth?: boolean;
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
  fullWidth,
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('inline-flex gap-1 rounded-xl border border-line bg-card-2 p-1', fullWidth && 'flex w-full', className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'ds-focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
              fullWidth && 'flex-1',
              active ? 'bg-surface text-fg shadow-sm' : 'text-muted hover:text-fg',
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
