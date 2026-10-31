import { useMemo, useState } from 'react';
import { Plus, Search, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/core/auth/auth-provider';
import { DEFAULT_TIME_ZONE } from '@/core/lib/date';
import { Page, PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/controls';
import { Segmented } from '@/components/ui/segmented';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard } from '@/features/dashboard/data/use-dashboard';
import { DashboardChallengeCard } from '@/features/dashboard/ui/dashboard-challenge-card';

type Filter = 'all' | 'active' | 'draft' | 'finished';

export default function ChallengesPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useDashboard();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const groups = data?.groups ?? [];

  const filtered = useMemo(() => {
    return groups
      .filter((group) => {
        if (filter === 'active') return group.challengeStatus === 'ACTIVE';
        if (filter === 'draft') return group.challengeStatus === 'DRAFT';
        if (filter === 'finished')
          return ['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(group.challengeStatus);
        return true;
      })
      .filter((group) => group.groupName.toLowerCase().includes(search.trim().toLowerCase()));
  }, [groups, filter, search]);

  const counts = {
    all: groups.length,
    active: groups.filter((group) => group.challengeStatus === 'ACTIVE').length,
    draft: groups.filter((group) => group.challengeStatus === 'DRAFT').length,
    finished: groups.filter((group) => ['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(group.challengeStatus))
      .length,
  };

  if (!user) return null;

  return (
    <Page>
      <PageHeader
        eyebrow="Seus grupos"
        title="Desafios"
        description="Todos os grupos em que você participa. O progresso é recalculado a cada minuto a partir dos dias validados."
        actions={
          <Button asChild>
            <Link to="/app/groups/new">
              <Plus aria-hidden />
              Novo desafio
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:hidden">
          <Select
            value={filter}
            onChange={(event) => setFilter(event.target.value as Filter)}
            aria-label="Filtrar desafios por estado"
          >
            <option value="all">Todos ({counts.all})</option>
            <option value="active">Ativos ({counts.active})</option>
            <option value="draft">Rascunhos ({counts.draft})</option>
            <option value="finished">Finalizados ({counts.finished})</option>
          </Select>
        </div>
        <div className="hidden sm:block">
          <Segmented
            ariaLabel="Filtrar desafios por estado"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: `Todos ${counts.all}` },
              { value: 'active', label: `Ativos ${counts.active}` },
              { value: 'draft', label: `Rascunhos ${counts.draft}` },
              { value: 'finished', label: `Finalizados ${counts.finished}` },
            ]}
          />
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar grupo"
            className="pl-9"
            aria-label="Buscar grupo pelo nome"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-56 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Swords}
          title={groups.length === 0 ? 'Nenhum desafio ainda' : 'Nada encontrado com esse filtro'}
          description={
            groups.length === 0
              ? 'Crie um grupo privado, escolha a modalidade e convide amigos para começar.'
              : 'Ajuste o filtro ou limpe a busca para ver seus outros grupos.'
          }
          action={
            groups.length === 0 ? (
              <Button asChild>
                <Link to="/app/groups/new">Criar desafio</Link>
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  setFilter('all');
                  setSearch('');
                }}
              >
                Limpar filtros
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((group, index) => (
            <DashboardChallengeCard key={group.groupId} group={group} timeZone={DEFAULT_TIME_ZONE} index={index} />
          ))}
        </div>
      )}
    </Page>
  );
}
