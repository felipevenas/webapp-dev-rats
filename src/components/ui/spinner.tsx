import { Loader2 } from 'lucide-react';
import { cn } from '@/core/lib/cn';

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-muted', className)} role="status">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      {label ? <span className="text-sm">{label}</span> : <span className="sr-only">Carregando</span>}
    </span>
  );
}
