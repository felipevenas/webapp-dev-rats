import { Github } from '@/components/brand/github-icon';
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Flame,
  GitBranch,
  Lock,
  Medal,
  Target,
  Ticket,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type {
  Challenge,
  ChallengeResult,
  FeedItem,
  Group,
  GroupMember,
  ProgressEntry,
  User,
} from '@/core/types/api';
import {
  diffInDays,
  formatCountdown,
  formatFullDate,
  formatShortDate,
  localDateInZone,
  todayInZone,
} from '@/core/lib/date';
import { cn } from '@/core/lib/cn';
import type { IconComponent } from '@/core/types/ui';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressRing } from '@/components/ui/progress-ring';
import { ActivityCalendar } from '@/features/progress/ui/activity-calendar';
import { FeedList } from '@/features/progress/ui/feed-list';
import { LeaderboardList } from '@/features/progress/ui/leaderboard';
import { WinnerHero } from '@/features/progress/ui/result-hero';
import { verificationModeCopy } from '@/features/challenges/domain/challenge-status';

type Tab = 'overview' | 'leaderboard' | 'calendar' | 'activity';

interface OverviewProps {
  group: Group;
  challenge: Challenge;
  entries: ProgressEntry[];
  members: GroupMember[];
  feed: FeedItem[];
  user: User;
  result: ChallengeResult | null;
  githubConnected: boolean;
  isOwner: boolean;
  loading: boolean;
  onInvite: () => void;
  onTab: (tab: Tab) => void;
}

export function OverviewTab({
  group,
  challenge,
  entries,
  members,
  feed,
  user,
  result,
  githubConnected,
  isOwner,
  loading,
  onInvite,
  onTab,
}: OverviewProps) {
  const me = entries.find((entry) => entry.userId === user.id) ?? null;

  return (
    <div className="space-y-4">
      {challenge.status === 'COMPLETED' && result ? (
        <WinnerHero
          result={result}
          challenge={challenge}
          entries={entries}
          currentUserId={user.id}
          onSeeRanking={() => onTab('leaderboard')}
        />
      ) : null}

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <YourProgressCard
            challenge={challenge}
            me={me}
            loading={loading}
            githubConnected={githubConnected}
            onOpenCalendar={() => onTab('calendar')}
          />

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Trophy className="size-4 text-gold" aria-hidden />
                Ranking
              </CardTitle>
              <button
                type="button"
                onClick={() => onTab('leaderboard')}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-muted transition-colors hover:text-accent"
              >
                Ver completo
                <ArrowRight className="size-3" aria-hidden />
              </button>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="ds-skeleton h-12 w-full" />
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <EmptyState icon={Users} compact title="Nenhum participante ativo" />
              ) : (
                <LeaderboardList
                  entries={entries}
                  currentUserId={user.id}
                  winnerUserId={result?.winnerUserId}
                  compact
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <CalendarDays className="size-4 text-accent" aria-hidden />
                Calendário
              </CardTitle>
              <button
                type="button"
                onClick={() => onTab('calendar')}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-muted transition-colors hover:text-accent"
              >
                Abrir
                <ArrowRight className="size-3" aria-hidden />
              </button>
            </CardHeader>
            <CardContent className="pt-0">
              <ActivityCalendar
                challengeId={challenge.id}
                timezone={challenge.timezone}
                members={entries}
                currentUserId={user.id}
                compact
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-cyan" aria-hidden />
                Atividade recente
              </CardTitle>
              <button
                type="button"
                onClick={() => onTab('activity')}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-muted transition-colors hover:text-accent"
              >
                Ver tudo
                <ArrowRight className="size-3" aria-hidden />
              </button>
            </CardHeader>
            <CardContent className="pt-0">
              {feed.length === 0 ? (
                <p className="text-[12px] text-muted">Nenhum evento registrado ainda.</p>
              ) : (
                <FeedList items={feed} limit={6} />
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="min-w-0 space-y-4">
          <ChallengeRulesCard challenge={challenge} isOwner={isOwner} groupId={group.id} />

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="size-4 text-muted" aria-hidden />
                Participantes
              </CardTitle>
              <Badge variant="outline" size="sm">
                {members.length}/{group.maxMembers}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-0">
              {members.slice(0, 6).map((member) => (
                <div key={member.id} className="flex items-center gap-2.5">
                  <Avatar src={member.avatarUrl} name={member.displayName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium">{member.displayName}</p>
                    <p className="truncate font-mono text-[10px] text-faint">@{member.username}</p>
                  </div>
                  {member.role === 'OWNER' ? (
                    <Badge variant="volt" size="sm">
                      dono
                    </Badge>
                  ) : member.userId === user.id ? (
                    <Badge variant="outline" size="sm">
                      você
                    </Badge>
                  ) : null}
                </div>
              ))}
              {members.length > 6 ? (
                <p className="text-[11px] text-faint">+ {members.length - 6} participantes</p>
              ) : null}
              <Button asChild variant="secondary" size="sm" full className="mt-1">
                <Link to={`/app/groups/${group.id}/settings`}>
                  {isOwner ? 'Gerenciar grupo' : 'Ver membros'}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {isOwner && (challenge.status === 'DRAFT' || challenge.status === 'ACTIVE') ? (
            <div className="rounded-2xl border border-volt-line bg-volt-soft/30 p-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-volt text-volt-ink">
                  <Ticket className="size-4" aria-hidden />
                </span>
                <div>
                  <p className="text-[12px] font-semibold">Convites do grupo</p>
                  <p className="text-[10px] text-muted">Link privado com prazo e limite de usos</p>
                </div>
              </div>
              <Button size="sm" full className="mt-3" onClick={onInvite}>
                <UserPlus aria-hidden />
                Convidar pessoas
              </Button>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function YourProgressCard({
  challenge,
  me,
  loading,
  githubConnected,
  onOpenCalendar,
}: {
  challenge: Challenge;
  me: ProgressEntry | null;
  loading: boolean;
  githubConnected: boolean;
  onOpenCalendar: () => void;
}) {
  const today = todayInZone(challenge.timezone);
  const last = me?.lastValidDate ?? null;
  const daysSince = last ? diffInDays(last, today) : null;
  const todayValid = last === today;
  const atRisk = challenge.status === 'ACTIVE' && daysSince !== null && daysSince >= 2;

  if (loading || !me) {
    return (
      <Card>
        <CardContent className="flex items-center gap-5">
          <div className="ds-skeleton size-28 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="ds-skeleton h-4 w-40" />
            <div className="ds-skeleton h-3 w-56" />
            <div className="ds-skeleton h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <span
        className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-volt/8 blur-2xl"
        aria-hidden
      />
      <CardContent className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="ds-label">Seu progresso</p>
            <h2 className="mt-1 text-[15px] font-semibold">
              {challenge.status === 'DRAFT'
                ? 'O desafio ainda não começou'
                : challenge.status === 'COMPLETED'
                  ? todayValid
                    ? 'Você fechou o dia decisivo'
                    : 'Desafio concluído'
                  : atRisk
                    ? 'Sua sequência está em risco'
                    : todayValid
                      ? 'Dia de hoje validado'
                      : 'Hoje ainda está pendente'}
            </h2>
          </div>
          <Badge variant={todayValid ? 'volt' : atRisk ? 'amber' : 'outline'} size="sm">
            {todayValid ? 'validado' : atRisk ? 'em risco' : 'aguardando'}
          </Badge>
        </div>

        <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <ProgressRing
            value={me.percent}
            size={128}
            stroke={9}
            tone={challenge.status === 'ACTIVE' ? 'volt' : challenge.status === 'COMPLETED' ? 'cyan' : 'amber'}
            label={`${me.validDays} de ${me.targetValidDays} dias válidos`}
          >
            <span className="font-mono text-[32px] leading-none text-fg">{me.validDays}</span>
            <span className="mt-1 font-mono text-[10px] text-faint">de {me.targetValidDays} dias</span>
            <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{me.percent}%</span>
          </ProgressRing>

          <div className="grid w-full flex-1 grid-cols-2 gap-3">
            <MiniMetric icon={Flame} label="Sequência" value={`${me.currentStreak}d`} tone="amber" />
            <MiniMetric icon={Medal} label="Melhor" value={`${me.bestStreak}d`} />
            <MiniMetric icon={Trophy} label="Ranking" value={`#${me.rank}`} tone="gold" />
            <MiniMetric
              icon={Target}
              label="Faltam"
              value={`${Math.max(0, me.targetValidDays - me.validDays)}d`}
              tone="volt"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-[11px] text-muted">
            <span
              className={cn(
                'size-1.5 rounded-full',
                todayValid ? 'bg-volt' : atRisk ? 'bg-amber' : 'bg-faint',
              )}
              aria-hidden
            />
            {last ? `Último dia válido: ${formatShortDate(last)}` : 'Nenhum dia válido registrado ainda'}
            {!githubConnected ? ' · verificação pausada' : ''}
          </p>
          <div className="flex items-center gap-2">
            {!githubConnected ? (
              <Link to="/app/settings/integrations" className="text-[11px] text-amber hover:underline">
                Reconectar GitHub
              </Link>
            ) : null}
            <Button variant="secondary" size="sm" onClick={onOpenCalendar}>
              <CalendarDays aria-hidden />
              Calendário
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniMetric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: IconComponent;
  label: string;
  value: string;
  tone?: 'amber' | 'gold' | 'volt';
}) {
  const color = tone === 'amber' ? 'text-amber' : tone === 'gold' ? 'text-gold' : tone === 'volt' ? 'text-accent' : 'text-fg';
  return (
    <div className="rounded-xl border border-line bg-card-2 p-3">
      <p className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
        <Icon className="size-3" aria-hidden />
        {label}
      </p>
      <p className={`mt-1 font-mono text-lg leading-none ${color}`}>{value}</p>
    </div>
  );
}

export function ChallengeRulesCard({
  challenge,
  isOwner,
  groupId,
}: {
  challenge: Challenge;
  isOwner: boolean;
  groupId: string;
}) {
  const mode = verificationModeCopy(challenge.verificationMode);
  const startDate = localDateInZone(challenge.startsAt, challenge.timezone);
  const endDate = challenge.endsAt ? localDateInZone(challenge.endsAt, challenge.timezone) : null;
  const admissionDate = challenge.admissionEndsAt
    ? localDateInZone(challenge.admissionEndsAt, challenge.timezone)
    : null;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Lock className="size-4 text-muted" aria-hidden />
          Regras do desafio
        </CardTitle>
        <Badge variant={challenge.verificationMode === 'OWN_REPOSITORIES' ? 'cyan' : 'violet'} size="sm">
          {mode.short}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="text-[11px] leading-relaxed text-muted">{mode.description}</p>

        <dl className="space-y-2 border-t border-line pt-3 text-[11px]">
          <RuleRow label="Meta" value={`${challenge.targetValidDays} dias válidos`} />
          <RuleRow label="Início" value={formatFullDate(startDate)} />
          <RuleRow
            label="Encerramento"
            value={endDate ? formatFullDate(endDate) : 'quando alguém atingir a meta'}
          />
          <RuleRow
            label="Admissão"
            value={admissionDate ? `até ${formatFullDate(admissionDate)}` : 'fecha no início'}
          />
          <RuleRow label="Fuso" value={challenge.timezone.replace('_', ' ')} />
          <RuleRow
            label={
              challenge.status === 'DRAFT'
                ? 'Começa em'
                : challenge.status === 'ACTIVE' && !challenge.endsAt
                  ? 'Duração'
                  : 'Janela'
            }
            value={
              challenge.status === 'DRAFT'
                ? formatCountdown(challenge.startsAt) === 'agora'
                  ? 'imediato ao iniciar'
                  : `em ${formatCountdown(challenge.startsAt)}`
                : challenge.status === 'ACTIVE' && challenge.endsAt
                  ? `termina em ${formatCountdown(challenge.endsAt)}`
                  : 'aberta'
            }
            mono
          />
        </dl>

        {challenge.verificationMode === 'SELECTED_REPOSITORIES' ? (
          <div className="border-t border-line pt-3">
            <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
              <GitBranch className="size-3" aria-hidden />
              Repositórios ({challenge.repositories.length}/3)
            </p>
            <ul className="mt-2 space-y-1">
              {challenge.repositories.length === 0 ? (
                <li className="text-[11px] text-amber">Nenhum repositório vinculado.</li>
              ) : (
                challenge.repositories.map((repository) => (
                  <li key={repository.id} className="truncate font-mono text-[11px] text-fg">
                    {repository.fullName}
                  </li>
                ))
              )}
            </ul>
          </div>
        ) : (
          <p className="flex items-start gap-1.5 border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
            <Github className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Cada membro usa os próprios repositórios pessoais. Projetos de empresa ou de terceiros não contam.
          </p>
        )}

        {challenge.status === 'DRAFT' && isOwner ? (
          <Button asChild variant="secondary" size="sm" full>
            <Link to={`/app/groups/${groupId}/settings`}>Editar antes de iniciar</Link>
          </Button>
        ) : null}

        {challenge.status === 'ACTIVE' ? (
          <p className="flex items-start gap-1.5 text-[10px] leading-relaxed text-faint">
            <Lock className="mt-0.5 size-3 shrink-0" aria-hidden />
            Regras travadas desde o início. Cancelar é a única forma de alterar a modalidade.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RuleRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className={cn('text-right text-fg', mono && 'font-mono text-[10px] uppercase tracking-[0.06em]')}>
        {value}
      </dd>
    </div>
  );
}
