import { useState } from 'react';
import { cn } from '@/core/lib/cn';
import { initials } from '@/core/lib/format';

const sizes = {
  xs: 'size-6 text-[9px]',
  sm: 'size-8 text-[10px]',
  md: 'size-10 text-xs',
  lg: 'size-12 text-sm',
  xl: 'size-16 text-lg',
  '2xl': 'size-20 text-xl',
} as const;

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: keyof typeof sizes;
  className?: string;
  ring?: boolean;
}

export function Avatar({ src, name, size = 'md', className, ring = false }: AvatarProps) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(src) && !broken;

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-card-2 font-mono font-medium uppercase text-muted',
        sizes[size],
        ring && 'ring-2 ring-volt-line ring-offset-2 ring-offset-bg',
        className,
      )}
      title={name}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}
