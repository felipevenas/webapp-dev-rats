import { ArrowUpRight, CalendarClock, Flame, Target, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardGroup } from '@/core/types/api';
import { diffInDays, formatShortDate, todayInZone } from '@/core/lib/date';
import { cn } from '@/core/lib/cn';
import { ProgressRing } from '@/components/ui/progress-ring';
import { ChallengeStatusBadge, MiniStat } from '@/features/challenges/ui/challenge-status-badge';

export function DashboardChallengeCard({
  group,
  timeZone,
  index = 0,
}: {
  group: DashboardGroup;
  timeZone: string;
  index?: number;
}) {
  const today = todayInZone(timeZone);
  const daysSince = group.lastValidDate ? diffInDays(group.lastValidDate, today) : null;
  const todayValid = group.lastValidDate === today;
  const atRisk = group.challengeStatus === 'ACTIVE' && daysSince !== null && daysSince >= 2;
  const awaitingToday = group.challengeStatus === 'ACTIVE' && !todayValid && !atRisk;

  return (
    <Link
      to={`/app/groups/${group.groupId}`}
      className={cn(
        'ds-card ds-focus-ring group relative flex flex-col overflow-hidden p-5 transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card',
        'animate-fade-up',
      )}
      style={{ animationDelay: `${Math.min(index, 5) * 45}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold tracking-tight text-fg">{group.groupName}</h3>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
            meta {group.targetValidDays} dias
          </p>
        </div>
        <ChallengeStatusBadge status={group.challengeStatus} size="sm" />
      </div>

      <div className="mt-5 flex items-center gap-5">
        <ProgressRing
          value={group.percent}
          size={92}
          stroke={7}
          tone={group.challengeStatus === 'ACTIVE' ? 'volt' : group.challengeStatus === 'COMPLETED' ? 'cyan' : 'amber'}
          label={`${group.validDays} de ${group.targetValidDays} dias válidos`}
        >
          <span className="font-mono text-xl leading-none text-fg">{group.validDays}</span>
          <span className="mt-0.5 font-mono text-[10px] text-faint">/ {group.targetValidDays}</span>
        </ProgressRing>

        <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-4 gap-y-3">
          <MiniStat icon={Flame} label="Sequência" value={`${group.currentStreak}d`} tone="amber" />
          <MiniStat icon={Trophy} label="Ranking" value={`#${group.rank}`} tone="gold" />
          <MiniStat icon={Target} label="Progresso" value={`${group.percent}%`} tone="volt" />
          <MiniStat icon={CalendarClock} label="Melhor" value={`${group.bestStreak}d`} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-3">
        <span
          className={cn(
            'flex min-w-0 items-center gap-1.5 text-[11px]',
            atRisk ? 'text-amber' : todayValid ? 'text-accent' : 'text-muted',
          )}
        >
          <span
            className={cn(
              'size-1.5 shrink-0 rounded-full',
              atRisk ? 'bg-amber' : todayValid ? 'bg-volt' : 'bg-faint',
            )}
            aria-hidden
          />
          <span className="truncate">
            {group.challengeStatus === 'DRAFT'
              ? `Início ${formatShortDate(group.startsAt.slice(0, 10))}`
              : group.challengeStatus === 'COMPLETED'
                ? 'Meta alcançada'
                : group.challengeStatus === 'CANCELLED'
                  ? 'Desafio cancelado'
                  : group.challengeStatus === 'EXPIRED'
                    ? 'Prazo encerrado'
                    : todayValid
                      ? 'Dia de hoje validado'
                      : atRisk
                        ? `Sem dia válido há ${daysSince} dias`
                        : awaitingToday
                          ? 'Hoje ainda pendente'
                          : 'Aguardando primeiro dia'}
          </span>
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted transition-colors group-hover:text-accent">
          Abrir
          <ArrowUpRight className="size-3.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
