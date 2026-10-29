import { cn } from '@/core/lib/cn';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} role="img" aria-label="DevStreak">
      <rect width="32" height="32" rx="9" fill="var(--ds-volt)" />
      <path
        d="M9.5 21.5V11l6.5 6.6 6.5-6.6v10.5"
        fill="none"
        stroke="var(--ds-volt-ink)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22.5" cy="24" r="1.6" fill="var(--ds-volt-ink)" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      {compact ? null : (
        <span className="text-[17px] font-semibold tracking-[-0.03em] text-fg">
          devstreak<span className="text-accent">.</span>
        </span>
      )}
    </span>
  );
}
