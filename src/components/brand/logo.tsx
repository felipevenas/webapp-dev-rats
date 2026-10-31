import { cn } from '@/core/lib/cn';

type MarkProps = { className?: string; title?: string };

function RatMark({ className, title = 'DevRats' }: MarkProps) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} role="img" aria-label={title}>
      <rect width="32" height="32" rx="9" fill="var(--ds-volt)" />
      <circle cx="9.6" cy="10.6" r="2.8" fill="var(--ds-volt-ink)" />
      <ellipse cx="10.6" cy="17" rx="6.2" ry="5.7" fill="var(--ds-volt-ink)" />
      <path d="M5.2 15.2 2.8 17.4 5.4 18.8Z" fill="var(--ds-volt-ink)" />
      <circle cx="7.8" cy="15.6" r="1" fill="var(--ds-volt)" />
      <path
        d="M16.2 20.6 19.4 20.6 23 16.4 26.6 16.4"
        fill="none"
        stroke="var(--ds-volt-ink)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19.4" cy="20.6" r="1.55" fill="var(--ds-volt-ink)" />
      <circle cx="23" cy="16.4" r="1.55" fill="var(--ds-volt-ink)" />
      <circle cx="26.6" cy="16.4" r="1.75" fill="var(--ds-volt-ink)" />
    </svg>
  );
}

export function LogoMark({ className, title }: MarkProps) {
  return <RatMark className={className} title={title} />;
}

export function Logo({
  className,
  compact = false,
  title,
}: {
  className?: string;
  compact?: boolean;
  title?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <RatMark title={title} />
      {compact ? null : (
        <span className="text-[17px] font-semibold tracking-[-0.03em] text-fg">
          devrats<span className="text-accent">.</span>
        </span>
      )}
    </span>
  );
}
