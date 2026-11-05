import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export function MessageListSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4" aria-hidden>
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <Skeleton className="h-2.5 w-14 rounded-full" />
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="flex items-end gap-2">
        <Skeleton className="size-6 shrink-0 rounded-full" />
        <Skeleton className="h-16 w-[62%] max-w-xs rounded-2xl rounded-bl-md" />
      </div>

      <Skeleton className="ml-auto h-10 w-[46%] max-w-[280px] rounded-2xl rounded-br-md" />

      <div className="flex items-end gap-2">
        <Skeleton className="size-6 shrink-0 rounded-full" />
        <Skeleton className="h-20 w-[58%] max-w-sm rounded-2xl rounded-bl-md" />
      </div>

      <Skeleton className="ml-auto h-14 w-[38%] max-w-[240px] rounded-2xl rounded-br-md" />

      <div className="flex items-end gap-2">
        <Skeleton className="size-6 shrink-0 rounded-full" />
        <Skeleton className="h-10 w-[40%] max-w-[220px] rounded-2xl rounded-bl-md" />
      </div>

      <Skeleton className="ml-auto h-16 w-[52%] max-w-xs rounded-2xl rounded-br-md" />
    </div>
  );
}

export function ChatThreadSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando conversa"
      aria-busy="true"
      className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col bg-bg"
    >
      <header className="flex min-w-0 items-center gap-3 border-b border-line bg-surface/95 px-3 py-2.5 backdrop-blur-sm sm:px-4">
        <Link
          to="/app/chat"
          className="ds-focus-ring inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-2 hover:text-fg xl:hidden"
          aria-label="Voltar para conversas"
        >
          <ArrowLeft aria-hidden />
        </Link>

        <Skeleton className="size-9 shrink-0 rounded-xl" />

        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-36 max-w-[60%] rounded-full" />
          <Skeleton className="h-2.5 w-24 max-w-[40%] rounded-full" />
        </div>

        <Skeleton className="hidden h-8 w-24 shrink-0 rounded-lg sm:block" />
      </header>

      <div className="min-h-0 flex-1 overflow-hidden px-3 py-4 sm:px-4">
        <MessageListSkeleton />
      </div>

      <div className="ds-safe-bottom w-full border-t border-line bg-surface/95 px-3 py-3 backdrop-blur-sm sm:px-4">
        <div className="flex items-end gap-2">
          <Skeleton className="size-9 shrink-0 rounded-lg" />
          <Skeleton className="hidden size-9 shrink-0 rounded-lg sm:block" />
          <Skeleton className="hidden size-9 shrink-0 rounded-lg sm:block" />
          <Skeleton className="size-9 shrink-0 rounded-lg" />
          <Skeleton className="h-11 min-w-0 flex-1 rounded-xl" />
          <Skeleton className="size-11 shrink-0 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
