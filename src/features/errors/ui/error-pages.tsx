import { Compass, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/logo';
import type { IconComponent } from '@/core/types/ui';

function ErrorShell({
  code,
  title,
  description,
  icon: Icon,
}: {
  code: string;
  title: string;
  description: string;
  icon: IconComponent;
}) {
  return (
    <div className="ds-grid-bg ds-radial flex min-h-dvh flex-col items-center justify-center px-5 py-16 text-center">
      <Logo className="mb-10" />
      <span className="inline-flex size-14 items-center justify-center rounded-2xl border border-line bg-card text-accent">
        <Icon className="size-6" aria-hidden />
      </span>
      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">{code}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{title}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      <div className="mt-7 flex flex-col gap-2 sm:flex-row">
        <Button asChild>
          <Link to="/app">Ir para o dashboard</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <ErrorShell
      code="404 · rota inexistente"
      title="Essa página não compilou"
      description="O endereço não existe ou foi movido. Se veio de um convite, confira se o link está completo."
      icon={Compass}
    />
  );
}

export function ForbiddenPage() {
  return (
    <ErrorShell
      code="403 · acesso negado"
      title="Área restrita"
      description="Você não tem permissão para ver este conteúdo. Peça ao criador do grupo para verificar seu acesso."
      icon={ShieldAlert}
    />
  );
}
