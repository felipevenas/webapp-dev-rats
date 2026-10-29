import { AlertTriangle, ArrowRight, Settings2, ShieldAlert, WifiOff } from 'lucide-react';
import { Github } from '@/components/brand/github-icon';
import { Link } from 'react-router-dom';
import type { GitHubStatus } from '@/core/types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function GitHubBanner({ github }: { github: GitHubStatus }) {
  if (github.connected) return null;

  const notConfigured = !github.appConfigured;

  return (
    <div
      className={
        notConfigured
          ? 'flex flex-col gap-3 rounded-2xl border border-line bg-card p-4 sm:flex-row sm:items-center'
          : 'flex flex-col gap-3 rounded-2xl border border-amber/30 bg-amber-soft p-4 sm:flex-row sm:items-center'
      }
      role="status"
    >
      <span
        className={
          notConfigured
            ? 'inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-card-2 text-muted'
            : 'inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber/30 bg-card/40 text-amber'
        }
      >
        {notConfigured ? <WifiOff className="size-4.5" aria-hidden /> : <AlertTriangle className="size-4.5" aria-hidden />}
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          {notConfigured ? 'Integração GitHub não configurada' : 'GitHub ainda não conectado'}
          {notConfigured ? <Badge variant="outline" size="sm">ambiente local</Badge> : null}
        </p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
          {notConfigured
            ? 'A GitHub App não está configurada neste ambiente. Você pode criar grupos no modo de repositórios próprios, mas a verificação de commits ficará pendente até configurar as credenciais.'
            : 'Sem a conexão, seus commits não podem ser verificados. Dias sem verificação não contam como descumprimento.'}
        </p>
      </div>

      <Button asChild variant={notConfigured ? 'secondary' : 'primary'} size="sm" className="shrink-0">
        <Link to="/app/settings/integrations">
          {notConfigured ? (
            <>
              <Settings2 aria-hidden />
              Ver integração
            </>
          ) : (
            <>
              <Github aria-hidden />
              Conectar GitHub
            </>
          )}
        </Link>
      </Button>
    </div>
  );
}

export function GitHubAttentionCard({
  connected,
  repositoryCount,
  lastSyncedAt,
}: {
  connected: boolean;
  repositoryCount: number;
  lastSyncedAt?: string | null;
}) {
  return (
    <div className="ds-card-flat p-4">
      <div className="flex items-center justify-between">
        <span className="ds-label">Integração</span>
        <Badge variant={connected ? 'volt' : 'amber'} size="sm">
          {connected ? 'conectada' : 'pendente'}
        </Badge>
      </div>
      <p className="mt-3 flex items-center gap-2 text-sm font-medium">
        <Github className="size-4" aria-hidden />
        {connected ? `${repositoryCount} repositórios acessíveis` : 'GitHub desconectado'}
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-muted">
        {connected
          ? lastSyncedAt
            ? `Última sincronização ${new Date(lastSyncedAt).toLocaleDateString('pt-BR')}.`
            : 'Sincronize para atualizar a lista de repositórios.'
          : 'Conecte para validar commits e liberar o modo de repositórios selecionados.'}
      </p>
      <Link
        to="/app/settings/integrations"
        className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-accent hover:underline"
      >
        {connected ? <ShieldAlert className="size-3.5" aria-hidden /> : <Github className="size-3.5" aria-hidden />}
        Gerenciar integração
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  );
}
