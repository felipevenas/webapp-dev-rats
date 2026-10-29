import { AlertOctagon } from 'lucide-react';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/logo';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const detail = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : 'Erro inesperado';

  return (
    <div className="ds-grid-bg flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <Logo className="mb-10" />
      <span className="inline-flex size-14 items-center justify-center rounded-2xl border border-rose/30 bg-rose-soft text-rose">
        <AlertOctagon className="size-6" aria-hidden />
      </span>
      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">Erro {status}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Algo saiu do fluxo</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        A interface encontrou um erro inesperado. Recarregue a página ou volte para o dashboard.
      </p>
      <details className="mt-4 max-w-md text-left">
        <summary className="cursor-pointer text-[11px] text-faint">Detalhes técnicos</summary>
        <p className="mt-1 break-words font-mono text-[11px] text-faint">{detail}</p>
      </details>
      <div className="mt-7 flex flex-col gap-2 sm:flex-row">
        <Button onClick={() => window.location.reload()}>Recarregar</Button>
        <Button asChild variant="secondary">
          <Link to="/app">Ir para o dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
