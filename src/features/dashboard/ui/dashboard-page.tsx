import { CalendarCheck, Flame, Plus, RefreshCw, Swords, Target, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/core/auth/auth-provider';
import { DEFAULT_TIME_ZONE, capitalize, formatFullDate, todayInZone } from '@/core/lib/date';
import { firstName } from '@/core/lib/format';
import type { IconComponent } from '@/core/types/ui';
import { Page, PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard } from '@/features/dashboard/data/use-dashboard';
import { DashboardChallengeCard } from '@/features/dashboard/ui/dashboard-challenge-card';
import { GitHubAttentionCard, GitHubBanner } from '@/features/dashboard/ui/github-banner';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard();

  if (!user) return null;

  const groups = data?.groups ?? [];
  const active = groups.filter((group) => group.challengeStatus === 'ACTIVE');
  const today = todayInZone(DEFAULT_TIME_ZONE);
  const validatedToday = active.filter((group) => group.lastValidDate === today).length;
  const totalDays = groups.reduce((total, group) => total + group.validDays, 0);
  const bestStreak = groups.reduce((best, group) => Math.max(best, group.bestStreak), 0);
  const bestRank = groups.length > 0 ? Math.min(...groups.map((group) => group.rank)) : 0;

  return (
    <Page>
      <PageHeader
        eyebrow={capitalize(
          new Intl.DateTimeFormat('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            timeZone: DEFAULT_TIME_ZONE,
          }).format(new Date()),
        )}
        title={`${greeting(DEFAULT_TIME_ZONE)}, ${firstName(user.displayName)}`}
        description="Um commit por dia. O painel mostra o que já foi validado - sem planilha, sem autoengano."
        actions={
          <>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => void refetch()}
              aria-label="Atualizar dados"
              title="Atualizar dados"
            >
              <RefreshCw className={isFetching ? 'animate-spin' : undefined} aria-hidden />
            </Button>
            <Button asChild>
              <Link to="/app/groups/new">
                <Plus aria-hidden />
                Novo desafio
              </Link>
            </Button>
          </>
        }
      />

      {data ? <GitHubBanner github={data.github} /> : null}

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <>
          <section className="ds-card-flat overflow-hidden" aria-label="Resumo">
            <div className="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-4 sm:divide-y-0">
              <SummaryTile
                label="Hoje"
                value={active.length > 0 ? `${validatedToday}/${active.length}` : '-'}
                caption="desafios com o dia válido"
                tone={validatedToday > 0 ? 'volt' : 'neutral'}
                icon={CalendarCheck}
              />
              <SummaryTile
                label="Dias válidos"
                value={String(totalDays)}
                caption="somados em todos os desafios"
                tone="cyan"
                icon={Target}
              />
              <SummaryTile
                label="Melhor sequência"
                value={`${bestStreak}d`}
                caption="sua maior corrida ativa"
                tone="amber"
                icon={Flame}
              />
              <SummaryTile
                label="Melhor posição"
                value={bestRank > 0 ? `#${bestRank}` : '-'}
                caption="ranking entre os grupos"
                tone="gold"
                icon={Trophy}
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.02em]">Seus desafios</h2>
                <p className="mt-0.5 text-[12px] text-muted">
                  {groups.length === 0
                    ? 'Nenhum grupo ainda - crie o primeiro.'
                    : `${groups.length} ${groups.length === 1 ? 'grupo' : 'grupos'} · atualizado automaticamente`}
                </p>
              </div>
              {groups.length > 0 ? (
                <Link
                  to="/app/challenges"
                  className="text-[12px] font-medium text-muted transition-colors hover:text-accent"
                >
                  Ver todos
                </Link>
              ) : null}
            </div>

            {groups.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Seu primeiro desafio começa aqui"
                description="Crie um grupo privado, defina a meta de dias válidos e convide amigos. A verificação no GitHub é automática."
                action={
                  <Button asChild>
                    <Link to="/app/groups/new">
                      <Plus aria-hidden />
                      Criar desafio
                    </Link>
                  </Button>
                }
                secondaryAction={
                  <Button asChild variant="ghost">
                    <Link to="/app/settings/integrations">Conectar GitHub</Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {groups.map((group, index) => (
                  <DashboardChallengeCard
                    key={group.groupId}
                    group={group}
                    timeZone={DEFAULT_TIME_ZONE}
                    index={index}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="grid gap-3 lg:grid-cols-2">
            <GitHubAttentionCard
              connected={data?.github.connected ?? user.githubConnected}
              repositoryCount={data?.github.repositoryCount ?? 0}
              lastSyncedAt={data?.github.lastSyncedAt}
            />
            <div className="ds-card-flat p-4">
              <div className="flex items-center justify-between">
                <span className="ds-label">Como contar</span>
                <Swords className="size-3.5 text-muted" aria-hidden />
              </div>
              <ul className="mt-3 space-y-2.5">
                {[
                  'Vários commits no mesmo dia contam como um único dia válido.',
                  'Perder um dia zera a sequência, mas mantém os dias já acumulados.',
                  'Falha de integração não é dia descumprido: o evento é reconciliado depois.',
                ].map((tip) => (
                  <li key={tip} className="flex gap-2 text-[12px] leading-relaxed text-muted">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-volt" aria-hidden />
                    {tip}
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-line pt-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                Fuso dos desafios: Brasília (GMT-3)
              </p>
            </div>
          </div>
        </>
      )}
    </Page>
  );
}

function SummaryTile({
  label,
  value,
  caption,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  caption: string;
  tone: 'volt' | 'cyan' | 'amber' | 'gold' | 'neutral';
  icon: IconComponent;
}) {
  const color = {
    volt: 'text-accent',
    cyan: 'text-cyan',
    amber: 'text-amber',
    gold: 'text-gold',
    neutral: 'text-fg',
  }[tone];
  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="ds-label">{label}</p>
        <Icon className={`size-3.5 ${color}`} aria-hidden />
      </div>
      <p className={`mt-2 font-mono text-2xl leading-none tracking-tight ${color} sm:text-[28px]`}>{value}</p>
      <p className="mt-1.5 text-[11px] leading-snug text-muted">{caption}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-56 w-full" />
        ))}
      </div>
    </div>
  );
}

function greeting(timeZone: string): string {
  let hour = new Date().getHours();
  try {
    hour = Number(
      new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: 'numeric',
        hourCycle: 'h23',
      }).format(new Date()),
    );
  } catch {
    //---- Fall back to the browser clock when the stored timezone is invalid.
  }
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export { formatFullDate };
