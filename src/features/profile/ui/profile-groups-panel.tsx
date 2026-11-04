import { ArrowRight, Flame, Target, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ChallengeStatus, DashboardGroup } from '@/core/types/api';
import { cn } from '@/core/lib/cn';
import { ChallengeStatusBadge } from '@/features/challenges/ui/challenge-status-badge';

const MAX_VISIBLE_GROUPS = 3;

const progressTone: Record<ChallengeStatus, string> = {
  DRAFT: 'bg-amber',
  ACTIVE: 'bg-volt',
  COMPLETED: 'bg-violet',
  CANCELLED: 'bg-rose',
  EXPIRED: 'bg-faint',
};

interface ProfileGroupsPanelProps {
  groups: DashboardGroup[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function ProfileGroupsPanel({ groups, isLoading, isError, onRetry }: ProfileGroupsPanelProps) {
  const visibleGroups = groups.slice(0, MAX_VISIBLE_GROUPS);
  const validDays = groups.reduce((total, group) => total + group.validDays, 0);
  const bestStreak = groups.reduce((best, group) => Math.max(best, group.bestStreak), 0);

  return (
    <aside className="min-w-0 xl:w-[340px] xl:shrink-0" aria-labelledby="profile-groups-title">
      <div className="flex items-center justify-between gap-3">
        <h3
          id="profile-groups-title"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-fg"
        >
          <Users className="size-4 text-muted" aria-hidden />
          Seus grupos
        </h3>
        {groups.length > 0 ? (
          <Link
            to="/app/challenges"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted transition-colors hover:text-accent"
          >
            Ver todos
            <ArrowRight className="size-3" aria-hidden />
          </Link>
        ) : null}
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <GroupStat label="grupos" value={String(groups.length)} />
        <GroupStat label="dias válidos" value={String(validDays)} />
        <GroupStat label="melhor streak" value={`${bestStreak}d`} />
      </div>

      <div className="mt-3 space-y-2">
        {isLoading && groups.length === 0 ? (
          <>
            <div className="h-[62px] animate-pulse rounded-xl border border-line bg-card-2" aria-hidden />
            <div className="h-[62px] animate-pulse rounded-xl border border-line bg-card-2" aria-hidden />
            <span className="sr-only">Carregando seus grupos</span>
          </>
        ) : isError && groups.length === 0 ? (
          <div className="rounded-xl border border-line bg-bg/40 p-3">
            <p className="text-[11px] leading-relaxed text-muted">Não foi possível carregar seus grupos.</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 text-[11px] font-medium text-accent hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : visibleGroups.length === 0 ? (
          <div className="rounded-xl border border-line bg-bg/40 p-3">
            <p className="text-[11px] leading-relaxed text-muted">
              Você ainda não participa de nenhum grupo.
            </p>
            <Link
              to="/app/groups/new"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
            >
              Criar o primeiro desafio
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          </div>
        ) : (
          visibleGroups.map((group) => <ProfileGroupCard key={group.groupId} group={group} />)
        )}
      </div>

      {groups.length > MAX_VISIBLE_GROUPS ? (
        <Link
          to="/app/challenges"
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-muted transition-colors hover:text-accent"
        >
          +{groups.length - MAX_VISIBLE_GROUPS} {groups.length - MAX_VISIBLE_GROUPS === 1 ? 'grupo' : 'grupos'}
          <ArrowRight className="size-3" aria-hidden />
        </Link>
      ) : null}
    </aside>
  );
}

function ProfileGroupCard({ group }: { group: DashboardGroup }) {
  const percent = Math.max(0, Math.min(100, group.percent));

  return (
    <Link
      to={`/app/groups/${group.groupId}`}
      className="group flex flex-col gap-2 rounded-xl border border-line bg-bg/40 p-3 transition-colors hover:border-line-strong hover:bg-card-2/60"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate text-[12px] font-medium text-fg">{group.groupName}</p>
        <ChallengeStatusBadge status={group.challengeStatus} size="sm" />
      </div>

      <div className="flex items-center gap-2">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
          aria-label={`${group.groupName}: ${group.validDays} de ${group.targetValidDays} dias válidos`}
          className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-line-strong/60"
        >
          <div
            className={cn('h-full rounded-full transition-[width] duration-500', progressTone[group.challengeStatus])}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="shrink-0 font-mono text-[10px] text-muted">
          {group.validDays}/{group.targetValidDays}
        </span>
      </div>

      <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-faint">
        <span className="inline-flex items-center gap-1">
          <Flame className="size-3" aria-hidden />
          {group.currentStreak}d
        </span>
        <span className="inline-flex items-center gap-1">
          <Target className="size-3" aria-hidden />
          #{group.rank}
        </span>
      </p>
    </Link>
  );
}

function GroupStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-bg/40 px-2 py-2 text-center">
      <p className="font-mono text-[8px] uppercase tracking-[0.08em] text-faint">{label}</p>
      <p className="mt-0.5 font-mono text-base leading-none text-fg">{value}</p>
    </div>
  );
}
