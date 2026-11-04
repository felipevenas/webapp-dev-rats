import { cn } from '@/core/lib/cn';
import type { PresenceStatus } from '@/core/types/api';
import { presenceCopy } from '@/features/friends/domain/friend-copy';

interface PresenceDotProps {
  presence?: PresenceStatus | null;
  withLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

const sizeClass = {
  sm: 'size-2',
  md: 'size-2.5',
} as const;

/**
 * Renders nothing when the backend did not share presence (`null`).
 * Colour is never the only signal: the dot always carries an accessible name.
 */
export function PresenceDot({ presence, withLabel, className, size = 'md' }: PresenceDotProps) {
  const copy = presenceCopy(presence);
  if (!copy) return null;

  const dot = (
    <span
      role="img"
      aria-label={copy.label}
      title={copy.label}
      className={cn(
        'inline-block shrink-0 rounded-full ring-2 ring-bg',
        sizeClass[size],
        copy.dotClass,
        className,
      )}
    />
  );

  if (!withLabel) return dot;

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      {dot}
      <span aria-hidden className={cn('truncate text-[11px] font-medium', copy.textClass)}>
        {copy.label}
      </span>
    </span>
  );
}
