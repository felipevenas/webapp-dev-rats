import { Github } from '@/components/brand/github-icon';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  GitFork,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { toAppError } from '@/core/http/problem';
import { useDebouncedValue } from '@/core/lib/use-debounced-value';
import { cn } from '@/core/lib/cn';
import type { GitHubRepository, GitHubStatus } from '@/core/types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { useRepositories, useSyncRepositories } from '@/features/github/data/use-github';

interface RepositoryPickerProps {
  selected: GitHubRepository[];
  onChange: (repositories: GitHubRepository[]) => void;
  status?: GitHubStatus;
  max?: number;
}

export function RepositoryPicker({ selected, onChange, status, max = 3 }: RepositoryPickerProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 350);
  const sync = useSyncRepositories();

  const connected = Boolean(status?.connected);
  const query = useRepositories({ query: debouncedSearch || undefined, page, size: 20 }, connected);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const repositories = query.data?.content ?? [];
  const totalPages = query.data?.totalPages ?? 0;
  const selectedSet = useMemo(() => new Set(selected.map((repository) => repository.id)), [selected]);

  const toggle = (repository: GitHubRepository) => {
    if (selectedSet.has(repository.id)) {
      onChange(selected.filter((item) => item.id !== repository.id));
      return;
    }
    if (selected.length >= max) {
      toast.warning(`Você pode selecionar no máximo ${max} repositórios.`);
      return;
    }
    onChange([...selected, repository]);
  };

  const handleSync = async () => {
    try {
      await sync.mutateAsync();
      toast.success('Sincronização solicitada. A lista será atualizada em instantes.');
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  if (!status?.appConfigured) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-line bg-card-2 p-4">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
        <div>
          <p className="text-sm font-medium">Integração indisponível neste ambiente</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">
            A GitHub App não está configurada no backend. Use o modo de repositórios próprios ou configure as
            credenciais antes de criar um desafio com lista de repositórios.
          </p>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-xl border border-amber/30 bg-amber-soft p-4">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
          <div>
            <p className="text-sm font-medium">Conecte o GitHub antes de escolher repositórios</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              A lista de repositórios vem da sua conta autorizada. Abra a integração em outra aba para não perder
              o que já preencheu aqui.
            </p>
          </div>
        </div>
        <Button asChild variant="secondary">
          <a href="/app/settings/integrations" target="_blank" rel="noreferrer">
            <Github aria-hidden />
            Abrir integração
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-card-2 p-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-2">
          {Array.from({ length: max }).map((_, index) => {
            const repository = selected[index];
            return (
              <div
                key={index}
                className={cn(
                  'flex h-9 min-w-0 flex-1 items-center gap-1.5 rounded-lg border px-2 font-mono text-[11px]',
                  repository ? 'border-volt-line bg-volt-soft text-accent' : 'border-dashed border-line text-faint',
                )}
              >
                <span className="truncate">{repository?.fullName ?? `vaga ${index + 1}`}</span>
                {repository ? (
                  <button
                    type="button"
                    onClick={() => onChange(selected.filter((item) => item.id !== repository.id))}
                    className="ml-auto inline-flex size-5 shrink-0 items-center justify-center rounded text-accent hover:bg-volt/20"
                    aria-label={`Remover ${repository.fullName}`}
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
        <Badge variant={selected.length === max ? 'volt' : 'outline'}>
          {selected.length}/{max}
        </Badge>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por owner/repositório"
          className="pl-9"
          aria-label="Buscar repositórios"
        />
        {search ? (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-faint hover:text-fg"
            aria-label="Limpar busca"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </div>

      {query.isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState error={query.error} compact onRetry={() => void query.refetch()} />
      ) : repositories.length === 0 ? (
        <EmptyState
          icon={Github}
          compact
          title={debouncedSearch ? 'Nenhum repositório encontrado' : 'Nenhum repositório sincronizado'}
          description={
            debouncedSearch
              ? 'Tente outro termo ou limpe a busca.'
              : 'Sincronize sua conta para importar os repositórios autorizados pela GitHub App.'
          }
          action={
            <Button variant="secondary" size="sm" onClick={() => void handleSync()} loading={sync.isPending}>
              <RefreshCw aria-hidden />
              Sincronizar agora
            </Button>
          }
        />
      ) : (
        <>
          <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1" aria-label="Repositórios disponíveis">
            {repositories.map((repository) => {
              const isSelected = selectedSet.has(repository.id);
              const disabled = (!isSelected && selected.length >= max) || repository.accessStatus !== 'ACCESSIBLE';
              return (
                <li key={repository.id}>
                  <button
                    type="button"
                    onClick={() => toggle(repository)}
                    disabled={disabled && !isSelected}
                    aria-pressed={isSelected}
                    className={cn(
                      'ds-focus-ring flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                      isSelected ? 'border-volt-line bg-volt-soft' : 'border-line bg-card-2 hover:border-line-strong',
                      disabled && !isSelected && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-md border',
                        isSelected ? 'border-volt bg-volt text-volt-ink' : 'border-line-strong text-transparent',
                      )}
                      aria-hidden
                    >
                      <Check className="size-3.5 stroke-[3]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[12px] text-fg">
                        <span className="text-muted">{repository.ownerLogin}/</span>
                        {repository.fullName.split('/').slice(1).join('/')}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5">
                        {repository.privateRepository ? (
                          <Badge variant="outline" size="sm">
                            <Lock className="size-2.5" aria-hidden /> privado
                          </Badge>
                        ) : (
                          <Badge variant="outline" size="sm">
                            público
                          </Badge>
                        )}
                        {repository.fork ? (
                          <Badge variant="outline" size="sm">
                            <GitFork className="size-2.5" aria-hidden /> fork
                          </Badge>
                        ) : null}
                        {repository.accessStatus !== 'ACCESSIBLE' ? (
                          <Badge variant="amber" size="sm">
                            sem acesso
                          </Badge>
                        ) : null}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={query.data?.totalElements}
            pageSize={query.data?.size}
            onPageChange={setPage}
          />

          {query.isFetching ? (
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
              <Loader2 className="size-3 animate-spin" aria-hidden />
              atualizando lista
            </p>
          ) : null}
        </>
      )}

      <p className="text-[11px] leading-relaxed text-faint">
        Só é possível selecionar repositórios que a sua instalação da GitHub App acessa. O criador precisa ter
        acesso a todos os repositórios escolhidos.{' '}
        <Link to="/app/settings/integrations" className="text-muted underline-offset-2 hover:underline">
          Gerenciar acesso
        </Link>
        .
      </p>
    </div>
  );
}
