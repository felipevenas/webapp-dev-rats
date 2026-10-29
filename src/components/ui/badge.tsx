import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/core/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'border-line bg-card-2 text-muted',
        volt: 'border-volt-line bg-volt-soft text-accent',
        cyan: 'border-cyan/30 bg-cyan-soft text-cyan',
        amber: 'border-amber/30 bg-amber-soft text-amber',
        rose: 'border-rose/30 bg-rose-soft text-rose',
        violet: 'border-violet/30 bg-violet-soft text-violet',
        outline: 'border-line-strong bg-transparent text-muted',
      },
      size: {
        sm: 'px-2 py-0.5 text-[9px]',
        md: 'px-2.5 py-1 text-[10px]',
      },
    },
    defaultVariants: { variant: 'neutral', size: 'md' },
  },
);

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export function Dot({ tone = 'neutral', pulse = false }: { tone?: 'volt' | 'cyan' | 'amber' | 'rose' | 'neutral' | 'violet'; pulse?: boolean }) {
  const colors: Record<string, string> = {
    volt: 'bg-volt',
    cyan: 'bg-cyan',
    amber: 'bg-amber',
    rose: 'bg-rose',
    violet: 'bg-violet',
    neutral: 'bg-faint',
  };
  return (
    <span className="relative flex size-2">
      {pulse ? (
        <span className={cn('absolute inline-flex size-full animate-ping rounded-full opacity-60', colors[tone])} />
      ) : null}
      <span className={cn('relative inline-flex size-2 rounded-full', colors[tone])} />
    </span>
  );
}
