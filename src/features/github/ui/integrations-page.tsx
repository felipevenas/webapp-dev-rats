import { Github } from '@/components/brand/github-icon';
import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  KeyRound,
  Link2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Unplug,
  Wifi,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/core/auth/auth-provider';
import { toAppError } from '@/core/http/problem';
import { formatDateTime, formatRelativeTime } from '@/core/lib/date';
import { useDebouncedValue } from '@/core/lib/use-debounced-value';
import { Page, PageHeader } from '@/components/layout/page-header';
import { Badge, Dot } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDisconnectGitHub,
  useGitHubStatus,
  useRepositories,
  useSyncRepositories,
} from '@/features/github/data/use-github';
import { startGitHubFlow } from '@/features/github/domain/connect';

export default function IntegrationsPage() {
  const { refreshUser } = useAuth();
  const statusQuery = useGitHubStatus();
  const sync = useSyncRepositories();
  const disconnect = useDisconnectGitHub();
  const [connecting, setConnecting] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 350);
  const status = statusQuery.data;

  const repos = useRepositories(
    { query: debouncedSearch || undefined, page, size: 20 },
    Boolean(status?.connected),
  );

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const totalPages = repos.data?.totalPages ?? 0;

  useEffect(() => {
    if (totalPages > 0 && page > totalPages - 1) setPage(totalPages - 1);
  }, [page, totalPages]);

  const handleConnect = async () => {
    setConnecting(true);
    await startGitHubFlow('authorize', '/app/settings/integrations');
    setConnecting(false);
  };

  const handleInstall = async () => {
    setConnecting(true);
    await startGitHubFlow('install', '/app/settings/integrations');
    setConnecting(false);
  };

  const handleSync = async () => {
    try {
      await sync.mutateAsync();
      toast.success('Sincronização solicitada. Os repositórios serão atualizados em instantes.');
      window.setTimeout(() => void statusQuery.refetch(), 2500);
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect.mutateAsync();
      await refreshUser();
      setDisconnectOpen(false);
      toast.success('Integração desconectada. A verificação fica pausada até reconectar.');
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Configurações"
        title="Integração GitHub"
        description="A GitHub App lê apenas o necessário para validar commits. Sem permissão de escrita, sem código no navegador."
        actions={
          <Button
            variant="secondary"
            size="icon"
            onClick={() => void statusQuery.refetch()}
            aria-label="Atualizar status da integração"
            title="Atualizar status"
          >
            <RefreshCw className={statusQuery.isFetching ? 'animate-spin' : undefined} aria-hidden />
          </Button>
        }
      />

      {statusQuery.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : statusQuery.isError ? (
        <ErrorState error={statusQuery.error} onRetry={() => void statusQuery.refetch()} />
      ) : status ? (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <Card className="relative overflow-hidden">
              <span
                className="pointer-events-none absolute -right-20 -top-20 size-52 rounded-full bg-volt/10 blur-3xl"
                aria-hidden
              />
              <CardContent className="relative space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-line bg-card-2 text-fg">
                      <Github className="size-5" aria-hidden />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold">
                          {status.connected ? 'Conta conectada' : 'Nenhuma conta conectada'}
                        </h2>
                        <Badge variant={status.connected ? 'volt' : 'amber'} size="sm">
                          <Dot tone={status.connected ? 'volt' : 'amber'} />
                          {status.connected ? 'ativa' : 'pendente'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[12px] leading-relaxed text-muted">
                        {status.connected
                          ? `Verificando commits como @${status.githubUsername ?? 'conta autorizada'}.`
                          : 'Conecte para validar commits, liberar repositórios e ativar a verificação automática.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!status.connected ? (
                      <Button onClick={() => void handleConnect()} loading={connecting} disabled={!status.appConfigured}>
                        <Github aria-hidden />
                        Conectar GitHub
                      </Button>
                    ) : (
                      <>
                        <Button variant="secondary" onClick={() => void handleInstall()} loading={connecting}>
                          <Link2 aria-hidden />
                          Gerenciar instalação
                        </Button>
                        <Button variant="danger-ghost" size="icon" onClick={() => setDisconnectOpen(true)} aria-label="Desconectar GitHub">
                          <Unplug aria-hidden />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {!status.appConfigured ? (
                  <div className="flex items-start gap-2.5 rounded-xl border border-amber/30 bg-amber-soft p-3">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
                    <div>
                      <p className="text-[12px] font-medium text-fg">GitHub App não configurada neste ambiente</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                        {status.message && !/não configurada/i.test(status.message)
                          ? status.message
                          : 'Configure as credenciais da GitHub App no backend para habilitar autorização, instalação e verificação automática.'}
                      </p>
                    </div>
                  </div>
                ) : null}

                <dl className="grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-4">
                  <Metric label="Repositórios" value={String(status.repositoryCount)} />
                  <Metric label="Instalações" value={String(status.installationCount)} />
                  <Metric
                    label="Conectado"
                    value={status.connectedAt ? formatRelativeTime(status.connectedAt) : '-'}
                  />
                  <Metric
                    label="Última sync"
                    value={status.lastSyncedAt ? formatRelativeTime(status.lastSyncedAt) : '-'}
                  />
                </dl>

                {status.permissions && status.permissions.length > 0 ? (
                  <div className="border-t border-line pt-4">
                    <p className="ds-label mb-2">Permissões concedidas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {status.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="normal-case tracking-normal">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between gap-2 pb-3">
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="size-4 text-muted" aria-hidden />
                  Repositórios acessíveis
                </CardTitle>
                {status.connected ? (
                  <Button variant="secondary" size="sm" onClick={() => void handleSync()} loading={sync.isPending}>
                    <RefreshCw aria-hidden />
                    Sincronizar
                  </Button>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-3">
                {!status.connected ? (
                  <EmptyState
                    icon={Github}
                    compact
                    title="Conecte o GitHub primeiro"
                    description="Depois da autorização, a lista de repositórios aparece aqui."
                    action={
                      <Button size="sm" onClick={() => void handleConnect()} disabled={!status.appConfigured}>
                        Conectar
                      </Button>
                    }
                  />
                ) : (
                  <>
                    <div className="relative">
                      <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar repositório"
                        aria-label="Buscar repositório"
                        className="h-9 pl-3 text-[12px]"
                      />
                    </div>
                    {repos.isLoading ? (
                      <div className="space-y-2">
                        {[0, 1, 2].map((index) => (
                          <Skeleton key={index} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : repos.isError ? (
                      <ErrorState error={repos.error} compact onRetry={() => void repos.refetch()} />
                    ) : (repos.data?.content.length ?? 0) === 0 ? (
                      <EmptyState
                        icon={Github}
                        compact
                        title={debouncedSearch ? 'Nenhum resultado' : 'Nenhum repositório sincronizado'}
                        description={
                          debouncedSearch
                            ? 'Tente outro termo.'
                            : 'Sincronize para importar os repositórios que a instalação acessa.'
                        }
                        action={
                          <Button size="sm" variant="secondary" onClick={() => void handleSync()} loading={sync.isPending}>
                            Sincronizar agora
                          </Button>
                        }
                      />
                    ) : (
                      <>
                        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                          {repos.data?.content.map((repository) => (
                            <li key={repository.id} className="flex items-center gap-3 bg-card-2/40 px-3 py-2.5">
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-mono text-[12px] text-fg">{repository.fullName}</p>
                                <p className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                  <Badge variant="outline" size="sm">
                                    {repository.privateRepository ? (
                                      <>
                                        <Lock className="size-2.5" aria-hidden /> privado
                                      </>
                                    ) : (
                                      'público'
                                    )}
                                  </Badge>
                                  {repository.fork ? (
                                    <Badge variant="outline" size="sm">
                                      fork
                                    </Badge>
                                  ) : null}
                                  {repository.accessStatus !== 'ACCESSIBLE' ? (
                                    <Badge variant="amber" size="sm">
                                      sem acesso
                                    </Badge>
                                  ) : null}
                                </p>
                              </div>
                              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
                                {repository.visibility.toLowerCase()}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <Pagination
                          page={page}
                          totalPages={repos.data?.totalPages ?? 0}
                          totalElements={repos.data?.totalElements}
                          pageSize={repos.data?.size}
                          onPageChange={(next) => {
                            setPage(next);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        />
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="size-4 text-accent" aria-hidden />
                  Privacidade e segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  'Somente leitura de metadados e commits.',
                  'Tokens cifrados no backend, fora do navegador.',
                  'Nenhum código-fonte ou mensagem privada é exibido.',
                  'A desconexão interrompe novas consultas.',
                ].map((item) => (
                  <p key={item} className="flex gap-2 text-[11px] leading-relaxed text-muted">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
                    {item}
                  </p>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Wifi className="size-4 text-cyan" aria-hidden />
                  O que depende disso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-[11px] leading-relaxed text-muted">
                <p>
                  <strong className="text-fg">Repositórios próprios:</strong> valida commits nos seus projetos
                  pessoais.
                </p>
                <p>
                  <strong className="text-fg">Repositórios selecionados:</strong> exige uma instalação com acesso
                  aos repositórios do grupo.
                </p>
                <p>
                  <strong className="text-fg">Sem conexão:</strong> nenhum dia é tratado como descumprido - a
                  verificação apenas fica pausada.
                </p>
              </CardContent>
            </Card>

            <details className="rounded-xl border border-line bg-card/50 p-3">
              <summary className="cursor-pointer text-[11px] font-medium text-muted">
                Para administradores
              </summary>
              <p className="mt-2 text-[10px] leading-relaxed text-faint">
                Configure <code className="font-mono text-muted">GITHUB_APP_ID</code>,{' '}
                <code className="font-mono text-muted">GITHUB_CLIENT_ID/SECRET</code>, chave privada e webhook no
                backend. Callback: <code className="font-mono text-muted">/api/v1/integrations/github/callback</code>.
              </p>
            </details>

            {status.lastSyncedAt ? (
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                sincronizado {formatDateTime(status.lastSyncedAt)}
              </p>
            ) : null}
          </aside>
        </div>
      ) : null}

      <Modal
        open={disconnectOpen}
        onOpenChange={setDisconnectOpen}
        title="Desconectar o GitHub?"
        description="A verificação de commits será pausada até uma nova conexão."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDisconnectOpen(false)}>
              Manter conectado
            </Button>
            <Button variant="danger" onClick={() => void handleDisconnect()} loading={disconnect.isPending}>
              <Trash2 aria-hidden />
              Desconectar
            </Button>
          </>
        }
      >
        <p className="text-[12px] leading-relaxed text-muted">
          A autorização é revogada e novas consultas deixam de funcionar. Seus dias válidos já registrados
          permanecem no histórico. Você pode reconectar quando quiser, mas o período desconectado não é
          recuperado automaticamente.
        </p>
      </Modal>
    </Page>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-faint">{label}</dt>
      <dd className="mt-1 truncate font-mono text-sm text-fg">{value}</dd>
    </div>
  );
}
