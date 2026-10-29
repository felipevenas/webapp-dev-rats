import type { ReactNode } from 'react';
import { cn } from '@/core/lib/cn';
import type { IconComponent } from '@/core/types/ui';

interface EmptyStateProps {
  icon: IconComponent;
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  compact,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card/40 text-center',
        compact ? 'gap-2 px-5 py-8' : 'gap-3 px-6 py-14',
        className,
      )}
    >
      <span className="mb-1 inline-flex size-11 items-center justify-center rounded-xl border border-line bg-card-2 text-volt">
        <Icon className="size-5" aria-hidden />
      </span>
      <h3 className="text-sm font-semibold text-fg">{title}</h3>
      {description ? <p className="max-w-sm text-sm leading-relaxed text-muted">{description}</p> : null}
      {action || secondaryAction ? (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
