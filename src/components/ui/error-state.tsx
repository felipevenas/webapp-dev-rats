import { AlertTriangle, RefreshCw, ShieldAlert, WifiOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { toAppError } from '@/core/http/problem';
import { Button } from '@/components/ui/button';
import { cn } from '@/core/lib/cn';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
  action?: ReactNode;
}

export function ErrorState({ error, onRetry, className, compact, action }: ErrorStateProps) {
  const appError = toAppError(error);
  const Icon = appError.isNetworkError
    ? WifiOff
    : appError.status === 403
      ? ShieldAlert
      : AlertTriangle;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-card text-center',
        compact ? 'px-5 py-8' : 'px-6 py-14',
        className,
      )}
      role="alert"
    >
      <span className="inline-flex size-11 items-center justify-center rounded-xl border border-rose/25 bg-rose-soft text-rose">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-fg">{appError.title}</h3>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted">{appError.detail}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {onRetry ? (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <RefreshCw aria-hidden />
            Tentar novamente
          </Button>
        ) : null}
        {action}
      </div>
      {appError.traceId ? (
        <details className="mt-1 text-left">
          <summary className="cursor-pointer text-[11px] text-faint hover:text-muted">Detalhes técnicos</summary>
          <p className="mt-1 font-mono text-[11px] text-faint">
            {appError.code} · {appError.traceId}
          </p>
        </details>
      ) : null}
    </div>
  );
}
