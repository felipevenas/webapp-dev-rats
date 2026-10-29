import type { ReactNode } from 'react';
import { cn } from '@/core/lib/cn';
import type { IconComponent } from '@/core/types/ui';

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  icon?: IconComponent;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, icon: Icon, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0 space-y-1.5">
        {eyebrow ? (
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
            {Icon ? <Icon className="size-3.5 text-accent" aria-hidden /> : null}
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.035em] text-fg sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('ds-container space-y-6 py-5 sm:py-8', className)}>{children}</div>
  );
}
