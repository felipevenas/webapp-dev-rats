import {
  ArrowLeft,
  CalendarDays,
  Check,
  Copy,
  Lock,
  MoreHorizontal,
  Play,
  Settings,
  Share2,
  Target,
  Trash2,
  Trophy,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/core/auth/auth-provider';
import { toAppError } from '@/core/http/problem';
import { formatCountdown, formatDateTime, formatFullDate, localDateInZone } from '@/core/lib/date';
import { cn } from '@/core/lib/cn';
import { Page } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/dropdown';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useGroup, useGroupMembers, useLeaveGroup } from '@/features/groups/data/use-groups';
import { InviteDialog } from '@/features/groups/ui/invite-dialog';
import { OverviewTab } from '@/features/groups/ui/group-overview';
import { useCancelChallenge, useStartChallenge } from '@/features/challenges/data/use-challenges';
import { verificationModeCopy } from '@/features/challenges/domain/challenge-status';
import { ChallengeStatusBadge } from '@/features/challenges/ui/challenge-status-badge';
import { useFeed, useProgress, useChallengeResult } from '@/features/progress/data/use-progress';
import { FeedList } from '@/features/progress/ui/feed-list';
import { LeaderboardList, YourPositionCard } from '@/features/progress/ui/leaderboard';
import { ActivityCalendar } from '@/features/progress/ui/activity-calendar';
import { FinishedBanner } from '@/features/progress/ui/result-hero';

type Tab = 'overview' | 'leaderboard' | 'calendar' | 'activity';

const tabOptions: Array<{ id: Tab; label: string }> = [
  { id: 'overview', label: 'Visão geral' },
  { id: 'leaderboard', label: 'Ranking' },
  { id: 'calendar', label: 'Calendário' },
  { id: 'activity', label: 'Atividade' },
];

export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab: Tab = tabOptions.some((option) => option.id === tabParam) ? (tabParam as Tab) : 'overview';
  const [inviteOpen, setInviteOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const groupQuery = useGroup(groupId);
  const group = groupQuery.data;
  const challenge = group?.currentChallenge ?? undefined;
  const progressQuery = useProgress(challenge?.id);
  const membersQuery = useGroupMembers(groupId);
  const feedQuery = useFeed(challenge?.id);
  const resultQuery = useChallengeResult(challenge?.id, challenge?.status === 'COMPLETED');
  const startChallenge = useStartChallenge(groupId ?? '');
  const cancelChallenge = useCancelChallenge(groupId ?? '');
  const leaveGroup = useLeaveGroup(groupId ?? '');

  if (!user) return null;

  if (groupQuery.isLoading) return <GroupSkeleton />;

  if (groupQuery.isError || !group) {
    return (
      <Page>
        <ErrorState
          error={groupQuery.error}
          onRetry={() => void groupQuery.refetch()}
          action={
            <Button asChild variant="secondary">
              <Link to="/app">Voltar ao dashboard</Link>
            </Button>
          }
        />
      </Page>
    );
  }

  const isOwner = group.creatorId === user.id;
  const entries = progressQuery.data ?? [];
  const me = entries.find((entry) => entry.userId === user.id) ?? null;
  const members = membersQuery.data ?? [];
  const feed = feedQuery.data ?? [];
  const result = resultQuery.data ?? null;
  const mode = challenge ? verificationModeCopy(challenge.verificationMode) : null;
  const canStart =
    isOwner &&
    challenge?.status === 'DRAFT' &&
    (challenge.verificationMode === 'OWN_REPOSITORIES' || challenge.repositories.length > 0);
  const canCancel = isOwner && (challenge?.status === 'DRAFT' || challenge?.status === 'ACTIVE');
  const startLabel = challenge
    ? challenge.startsAt && new Date(challenge.startsAt).getTime() <= Date.now()
      ? 'Início imediato ao iniciar'
      : `Agendado para ${formatDateTime(challenge.startsAt, challenge.timezone)}`
    : '';

  const setTab = (nextTab: Tab) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', nextTab);
    setSearchParams(params);
  };

  const copyGroupLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link do grupo copiado.');
    } catch {
      toast.error('Não foi possível copiar o link.');
    }
  };

  const handleStart = async () => {
    if (!challenge) return;
    try {
      await startChallenge.mutateAsync(challenge.id);
      setStartOpen(false);
      toast.success('Desafio iniciado. A verificação está ativa.');
    } catch (error) {
      const appError = toAppError(error);
      //---- The scheduler may have activated a "start now" draft between render and click.
      if (appError.code === 'INVALID_CHALLENGE_STATE') {
        setStartOpen(false);
        await groupQuery.refetch();
        toast.info('O desafio já está ativo.');
        return;
      }
      toast.error(appError.detail);
    }
  };

  const handleCancel = async () => {
    if (!challenge) return;
    try {
      await cancelChallenge.mutateAsync(challenge.id);
      setCancelOpen(false);
      toast.success('Desafio cancelado. O histórico foi preservado.');
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveGroup.mutateAsync();
      setLeaveOpen(false);
      toast.success('Você saiu do grupo.');
      navigate('/app');
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  return (
    <Page>
      <div>
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Dashboard
        </Link>
      </div>

      <header className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {challenge ? <ChallengeStatusBadge status={challenge.status} /> : null}
              {mode ? (
                <Badge variant="outline">
                  {challenge?.verificationMode === 'SELECTED_REPOSITORIES' ? (
                    <Lock className="size-3" aria-hidden />
                  ) : (
                    <Target className="size-3" aria-hidden />
                  )}
                  {mode.label}
                </Badge>
              ) : null}
              {isOwner ? (
                <Badge variant="outline" size="sm">
                  você é o dono
                </Badge>
              ) : null}
            </div>
            <h1
              className={cn(
                'text-[28px] font-semibold leading-tight tracking-[-0.04em] sm:text-3xl',
                tab !== 'overview' && 'text-2xl lg:text-3xl',
              )}
            >
              {group.name}
            </h1>
            {group.description ? (
              <p
                className={cn(
                  'max-w-2xl text-[13px] leading-relaxed text-muted',
                  tab !== 'overview' && 'hidden lg:block',
                )}
              >
                {group.description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isOwner && (challenge?.status === 'DRAFT' || challenge?.status === 'ACTIVE') ? (
              <Button onClick={() => setInviteOpen(true)}>
                <UserPlus aria-hidden />
                Convidar
              </Button>
            ) : null}
            {canStart ? (
              <Button
                variant={challenge.repositories.length === 0 && challenge.verificationMode === 'SELECTED_REPOSITORIES' ? 'secondary' : 'primary'}
                onClick={() => setStartOpen(true)}
                disabled={!canStart}
                title={
                  challenge.verificationMode === 'SELECTED_REPOSITORIES' && challenge.repositories.length === 0
                    ? 'Vincule ao menos um repositório antes de iniciar'
                    : undefined
                }
              >
                <Play aria-hidden />
                Iniciar desafio
              </Button>
            ) : null}
            <Button variant="secondary" size="icon" onClick={() => void copyGroupLink()} aria-label="Copiar link do grupo" title="Copiar link do grupo">
              <Copy aria-hidden />
            </Button>
            <Dropdown
              trigger={
                <Button variant="secondary" size="icon" aria-label="Mais ações do grupo">
                  <MoreHorizontal aria-hidden />
                </Button>
              }
            >
              <DropdownItem
                icon={Settings}
                onSelect={() => navigate(`/app/groups/${group.id}/settings`)}
              >
                {isOwner ? 'Gerenciar grupo' : 'Membros e configurações'}
              </DropdownItem>
              <DropdownItem icon={Share2} onSelect={() => void copyGroupLink()}>
                Copiar link do grupo
              </DropdownItem>
              {canCancel ? (
                <>
                  <DropdownSeparator />
                  <DropdownItem icon={XCircle} danger onSelect={() => setCancelOpen(true)}>
                    Cancelar desafio
                  </DropdownItem>
                </>
              ) : null}
              {!isOwner ? (
                <>
                  <DropdownSeparator />
                  <DropdownItem icon={ArrowLeft} danger onSelect={() => setLeaveOpen(true)}>
                    Sair do grupo
                  </DropdownItem>
                </>
              ) : null}
            </Dropdown>
          </div>
        </div>

        {challenge ? (
          <div
            className={cn(
              'flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-3 text-[11px] text-muted',
              tab !== 'overview' && 'hidden lg:flex',
            )}
          >
            <span className="flex items-center gap-1.5">
              <Target className="size-3.5 text-accent" aria-hidden />
              meta <strong className="font-mono text-fg">{challenge.targetValidDays} dias</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" aria-hidden />
              <strong className="font-mono text-fg">{members.length}</strong>/{group.maxMembers} participantes
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden />
              {challenge.status === 'DRAFT'
                ? startLabel
                : challenge.endsAt
                  ? `termina em ${formatCountdown(challenge.endsAt)}`
                  : `iniciado em ${formatFullDate(localDateInZone(challenge.startedAt ?? challenge.startsAt, challenge.timezone))}`}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
              {challenge.timezone.replace('_', ' ')}
            </span>
          </div>
        ) : null}
      </header>

      {challenge?.status === 'DRAFT' ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber/30 bg-amber-soft p-4 sm:flex-row sm:items-center">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber/30 bg-card/40 text-amber">
            <Trophy className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Rascunho — o relógio ainda não começou</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
              Convide o grupo e inicie quando estiver pronto. Ao iniciar, modalidade, meta, fuso e repositórios
              ficam travados. {startLabel}.
            </p>
          </div>
          {isOwner ? (
            <Button variant="secondary" size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus aria-hidden />
              Convidar o grupo
            </Button>
          ) : null}
        </div>
      ) : null}

      {challenge && (challenge.status === 'CANCELLED' || challenge.status === 'EXPIRED') ? (
        <FinishedBanner challenge={challenge} />
      ) : null}

      <nav
        aria-label="Seções do desafio"
        className="grid grid-cols-4 gap-1 rounded-xl border border-line bg-card-2 p-1 sm:inline-flex sm:w-auto"
      >
        {tabOptions.map((option) => {
          const active = tab === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTab(option.id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'ds-focus-ring flex min-w-0 items-center justify-center gap-1 rounded-lg px-1.5 py-2 text-[11px] font-medium transition-colors sm:px-3.5 sm:text-[12px]',
                active ? 'bg-volt-soft text-accent' : 'text-muted hover:bg-card hover:text-fg',
              )}
            >
              <span className="truncate">
                <span className={option.id === 'overview' ? 'sm:hidden' : 'hidden'}>
                  {option.id === 'overview' ? 'Geral' : option.label}
                </span>
                <span className="hidden sm:inline">{option.label}</span>
              </span>
              {option.id === 'leaderboard' && entries.length > 0 ? (
                <span className="font-mono text-[10px] text-faint">{entries.length}</span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {!challenge ? (
        <EmptyState
          icon={Trophy}
          title="Este grupo ainda não tem um desafio"
          description="Crie um novo desafio para começar a contar dias válidos."
          action={
            isOwner ? (
              <Button asChild>
                <Link to="/app/groups/new">Criar desafio</Link>
              </Button>
            ) : undefined
          }
        />
      ) : tab === 'overview' ? (
        <OverviewTab
          group={group}
          challenge={challenge}
          entries={entries}
          members={members}
          feed={feed}
          user={user}
          result={result}
          githubConnected={user.githubConnected}
          isOwner={isOwner}
          loading={progressQuery.isLoading}
          onInvite={() => setInviteOpen(true)}
          onTab={setTab}
        />
      ) : tab === 'leaderboard' ? (
        <Card>
          <CardHeader className="gap-2 pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="size-4 text-gold" aria-hidden />
                Ranking do desafio
              </CardTitle>
              <Badge variant="outline" size="sm" className="hidden sm:inline-flex">
                atualiza a cada 60s
              </Badge>
            </div>
            <p className="text-[12px] leading-relaxed text-muted">
              Ordenado por dias válidos. Empates usam a sequência atual e a atividade elegível mais recente. A
              vitória é de quem atinge a meta primeiro, não da posição temporária.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {progressQuery.isLoading ? (
              <div className="space-y-2">
                {[0, 1, 2, 3].map((index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            ) : progressQuery.isError ? (
              <ErrorState error={progressQuery.error} compact onRetry={() => void progressQuery.refetch()} />
            ) : entries.length === 0 ? (
              <EmptyState icon={Users} compact title="Nenhum participante ativo" />
            ) : (
              <>
                {me && me.rank > 5 ? <YourPositionCard entry={me} /> : null}
                <LeaderboardList
                  entries={entries}
                  currentUserId={user.id}
                  winnerUserId={result?.winnerUserId}
                />
              </>
            )}
          </CardContent>
        </Card>
      ) : tab === 'calendar' ? (
        <Card>
          <CardHeader className="gap-2 pb-3">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-4 text-accent" aria-hidden />
              Calendário de atividade
            </CardTitle>
            <p className="text-[12px] leading-relaxed text-muted">
              Um dia com pelo menos um commit elegível conta uma vez. Dias sem atividade são diferentes de
              verificação indisponível — o status da integração aparece no topo.
            </p>
          </CardHeader>
          <CardContent>
            <ActivityCalendar
              challengeId={challenge.id}
              timezone={challenge.timezone}
              members={entries}
              currentUserId={user.id}
              manageUrlState
              githubConnected={user.githubConnected}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="gap-2 pb-3">
            <CardTitle className="flex items-center gap-2">
              <Check className="size-4 text-accent" aria-hidden />
              Atividade do desafio
            </CardTitle>
            <p className="text-[12px] leading-relaxed text-muted">
              Marcos e mudanças de estado do grupo. O feed prioriza progresso — mensagens e código de commits
              nunca são exibidos.
            </p>
          </CardHeader>
          <CardContent>
            {feedQuery.isLoading ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : feedQuery.isError ? (
              <ErrorState error={feedQuery.error} compact onRetry={() => void feedQuery.refetch()} />
            ) : feed.length === 0 ? (
              <EmptyState icon={CalendarDays} compact title="Nenhum evento registrado" />
            ) : (
              <FeedList items={feed} />
            )}
          </CardContent>
        </Card>
      )}

      <InviteDialog
        groupId={group.id}
        groupName={group.name}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />

      <Modal
        open={startOpen}
        onOpenChange={setStartOpen}
        title="Iniciar desafio?"
        description="O relógio começa agora e as regras ficam travadas para todos."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setStartOpen(false)}>
              Ainda não
            </Button>
            <Button onClick={() => void handleStart()} loading={startChallenge.isPending}>
              <Play aria-hidden />
              Iniciar agora
            </Button>
          </>
        }
      >
        <ul className="space-y-2.5 text-[12px] leading-relaxed text-muted">
          <li className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            Modalidade, meta, fuso e repositórios não poderão ser alterados.
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            Participantes atuais entram no ranking imediatamente.
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            A admissão segue a data configurada; depois dela, convites não podem ser aceitos.
          </li>
          {challenge && new Date(challenge.startsAt).getTime() > Date.now() ? (
            <li className="flex gap-2 text-amber">
              <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              O início agendado será antecipado para agora.
            </li>
          ) : null}
        </ul>
      </Modal>

      <Modal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancelar desafio?"
        description="Esta ação encerra o desafio para todos os participantes."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              Manter desafio
            </Button>
            <Button variant="danger" onClick={() => void handleCancel()} loading={cancelChallenge.isPending}>
              <Trash2 aria-hidden />
              Cancelar desafio
            </Button>
          </>
        }
      >
        <p className="text-[12px] leading-relaxed text-muted">
          O ranking e os dias válidos permanecem no histórico para consulta, mas o desafio será marcado como
          cancelado e não terá vencedor. Para mudar a modalidade, será necessário criar um novo desafio.
        </p>
      </Modal>

      <Modal
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title="Sair do grupo?"
        description="Você deixa de ver o ranking e o calendário deste grupo."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setLeaveOpen(false)}>
              Ficar
            </Button>
            <Button variant="danger" onClick={() => void handleLeave()} loading={leaveGroup.isPending}>
              Sair do grupo
            </Button>
          </>
        }
      >
        <p className="text-[12px] leading-relaxed text-muted">
          Seus dias válidos já registrados permanecem no histórico do desafio. Para voltar, será necessário um
          novo convite, respeitando a janela de admissão.
        </p>
      </Modal>
    </Page>
  );
}

function GroupSkeleton() {
  return (
    <Page>
      <Skeleton className="h-4 w-24" />
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </Page>
  );
}
