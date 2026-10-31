import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, CircleHelp, ExternalLink, WifiOff } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { ActivityCommit, ActivityDayStatus, ProgressEntry } from '@/core/types/api';
import {
  addDays,
  currentMonthKey,
  firstDayOfMonth,
  formatFullDate,
  formatMonthLabel,
  formatTime,
  formatWeekdayLong,
  lastDayOfMonth,
  monthGrid,
  shiftMonth,
  todayInZone,
  WEEKDAY_LABELS,
} from '@/core/lib/date';
import { cn } from '@/core/lib/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/controls';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useActivity, useActivityCommits } from '@/features/progress/data/use-progress';

const statusCopy: Record<ActivityDayStatus, { label: string; description: string }> = {
  VALID: { label: 'Dia válido', description: 'Pelo menos um commit elegível foi verificado neste dia.' },
  EMPTY: { label: 'Sem atividade', description: 'Nenhum commit elegível foi encontrado neste dia.' },
  FUTURE: { label: 'Dia futuro', description: 'Este dia ainda não aconteceu no fuso do desafio.' },
  BEFORE_START: { label: 'Antes do início', description: 'Este dia é anterior ao início do desafio.' },
  AFTER_END: { label: 'Depois do encerramento', description: 'Este dia é posterior ao fim do desafio.' },
};

interface ActivityCalendarProps {
  challengeId: string;
  timezone: string;
  members: ProgressEntry[];
  currentUserId: string;
  manageUrlState?: boolean;
  githubConnected?: boolean;
  compact?: boolean;
}

export function ActivityCalendar({
  challengeId,
  timezone,
  members,
  currentUserId,
  manageUrlState = false,
  githubConnected = true,
  compact = false,
}: ActivityCalendarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localMonth, setLocalMonth] = useState(() => currentMonthKey(timezone));
  const [localMember, setLocalMember] = useState(currentUserId);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const monthKey = manageUrlState ? (searchParams.get('month') ?? localMonth) : localMonth;
  const memberId = manageUrlState ? (searchParams.get('member') ?? currentUserId) : localMember;

  const from = firstDayOfMonth(monthKey);
  const to = lastDayOfMonth(monthKey);
  const query = useActivity(challengeId, { userId: memberId, from, to });

  const dayMap = useMemo(() => {
    const map = new Map<string, ActivityDayStatus>();
    query.data?.days.forEach((day) => map.set(day.date, day.status));
    return map;
  }, [query.data]);

  const cells = useMemo(() => monthGrid(monthKey), [monthKey]);
  const today = todayInZone(timezone);
  const monthValidDays = query.data?.days.filter((day) => day.status === 'VALID').length ?? 0;
  const monthEmptyDays = query.data?.days.filter((day) => day.status === 'EMPTY').length ?? 0;

  const updateParams = (next: { month?: string; member?: string }) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'calendar');
    if (next.month) params.set('month', next.month);
    if (next.member) params.set('member', next.member);
    setSearchParams(params, { replace: true });
  };

  const setMonth = (nextMonth: string) => {
    setSelectedDate(null);
    if (manageUrlState) updateParams({ month: nextMonth });
    else setLocalMonth(nextMonth);
  };

  const setMember = (nextMember: string) => {
    setSelectedDate(null);
    if (manageUrlState) updateParams({ member: nextMember });
    else setLocalMember(nextMember);
  };

  const goToday = () => {
    const current = currentMonthKey(timezone);
    setMonth(current);
    setSelectedDate(today);
  };

  const moveSelection = (date: string, key: string) => {
    const delta = key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : key === 'ArrowUp' ? -7 : key === 'ArrowDown' ? 7 : 0;
    if (!delta) return;
    const next = addDays(date, delta);
    const nextMonth = next.slice(0, 7);
    if (nextMonth !== monthKey) setMonth(nextMonth);
    setSelectedDate(next);
    window.setTimeout(() => {
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${next}"]`)?.focus();
    }, 0);
  };

  const selectedStatus = selectedDate ? (dayMap.get(selectedDate) ?? 'EMPTY') : null;
  const commitsQuery = useActivityCommits(
    challengeId,
    { userId: memberId, date: selectedDate },
    !compact && selectedStatus === 'VALID',
  );
  const commits = commitsQuery.data ?? [];

  if (compact) {
    return (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] font-medium">{formatMonthLabel(monthKey)}</p>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMonth(shiftMonth(monthKey, -1))}
              aria-label="Mês anterior"
            >
              <ChevronLeft aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMonth(shiftMonth(monthKey, 1))}
              aria-label="Próximo mês"
            >
              <ChevronRight aria-hidden />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label, index) => (
            <span key={`${label}-${index}`} className="text-center font-mono text-[9px] text-faint">
              {label}
            </span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1" aria-hidden>
          {cells.map((cell) => {
            const status = cell.inMonth ? (dayMap.get(cell.date) ?? 'FUTURE') : null;
            return (
              <span
                key={cell.date}
                title={status ? `${formatFullDate(cell.date)} · ${statusCopy[status].label}` : undefined}
                className={cn(
                  'aspect-square rounded-[5px] border',
                  !cell.inMonth && 'opacity-20',
                  status === 'VALID' && 'border-volt-line bg-volt',
                  status === 'EMPTY' && 'border-line bg-card-2',
                  status === 'FUTURE' && 'border-dashed border-line/70 bg-transparent',
                  (status === 'BEFORE_START' || status === 'AFTER_END') && 'border-line bg-card-2/40',
                  cell.date === today && 'ring-1 ring-volt-line ring-offset-1 ring-offset-card',
                )}
              />
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[9px] text-faint">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-[3px] bg-volt" /> válido
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-[3px] border border-line bg-card-2" /> sem atividade
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-[3px] border border-dashed border-line-strong" /> futuro
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon-sm" onClick={() => setMonth(shiftMonth(monthKey, -1))} aria-label="Mês anterior">
            <ChevronLeft aria-hidden />
          </Button>
          <p className="min-w-40 text-center text-[13px] font-medium">{formatMonthLabel(monthKey)}</p>
          <Button variant="secondary" size="icon-sm" onClick={() => setMonth(shiftMonth(monthKey, 1))} aria-label="Próximo mês">
            <ChevronRight aria-hidden />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToday}>
            Hoje
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="calendar-member" className="text-[11px] text-muted">
            Calendário de
          </label>
          <Select
            id="calendar-member"
            value={memberId}
            onChange={(event) => setMember(event.target.value)}
            className="h-9 w-full text-[12px] sm:w-52"
          >
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.userId === currentUserId ? `${member.displayName} (você)` : member.displayName}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {!githubConnected ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber/30 bg-amber-soft p-3">
          <WifiOff className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
          <p className="text-[11px] leading-relaxed text-muted">
            A integração com o GitHub está desconectada. Dias vazios podem significar{' '}
            <strong className="text-fg">verificação indisponível</strong>, não descumprimento. Reconecte para
            retomar a validação.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] xl:grid-cols-[minmax(0,600px)_240px] xl:justify-center">
        <div>
          <div
            className="grid grid-cols-7 gap-1.5"
            role="grid"
            aria-label={`Calendário de ${formatMonthLabel(monthKey)}`}
          >
            {WEEKDAY_LABELS.map((label, index) => (
              <span key={`${label}-${index}`} role="columnheader" className="pb-1 text-center font-mono text-[10px] text-faint">
                {label}
              </span>
            ))}

            {query.isLoading
              ? Array.from({ length: 42 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-square rounded-md" />
                ))
              : null}

            {!query.isLoading
              ? cells.map((cell) => {
                  const status = cell.inMonth ? (dayMap.get(cell.date) ?? 'FUTURE') : null;
                  const isToday = cell.date === today;
                  const isSelected = cell.date === selectedDate;
                  const focusable = isSelected || (!selectedDate && isToday);
                  return (
                    <button
                      key={cell.date}
                      type="button"
                      role="gridcell"
                      data-date={cell.date}
                      tabIndex={focusable ? 0 : -1}
                      disabled={!cell.inMonth}
                      onClick={() => setSelectedDate(cell.date)}
                      onKeyDown={(event) => moveSelection(cell.date, event.key)}
                      aria-label={`${formatFullDate(cell.date)}${status ? `, ${statusCopy[status].label}` : ''}`}
                      aria-selected={isSelected}
                      className={cn(
                        'ds-focus-ring relative flex aspect-square items-center justify-center rounded-lg border text-[11px] transition-colors',
                        !cell.inMonth && 'cursor-default opacity-20',
                        status === 'VALID' &&
                          'border-volt-line bg-volt font-medium text-volt-ink hover:brightness-105',
                        status === 'EMPTY' && 'border-line bg-card-2 text-muted hover:border-line-strong',
                        status === 'FUTURE' && 'border-dashed border-line/70 bg-transparent text-faint',
                        (status === 'BEFORE_START' || status === 'AFTER_END') && 'border-line bg-card-2/40 text-faint',
                        isToday && 'ring-1 ring-volt-line ring-offset-1 ring-offset-card',
                        isSelected && 'outline outline-2 outline-offset-1 outline-volt',
                        cell.inMonth && 'cursor-pointer',
                      )}
                      style={
                        status === 'BEFORE_START' || status === 'AFTER_END'
                          ? {
                              backgroundImage:
                                'repeating-linear-gradient(45deg, var(--ds-line) 0 1px, transparent 1px 5px)',
                            }
                          : undefined
                      }
                    >
                      {cell.day}
                    </button>
                  );
                })
              : null}
          </div>

          {query.isError ? (
            <div className="mt-3">
              <ErrorState error={query.error} compact onRetry={() => void query.refetch()} />
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-muted">
            <Legend className="bg-volt border-volt-line" label="Dia válido" />
            <Legend className="bg-card-2 border-line" label="Sem atividade" />
            <Legend className="bg-transparent border-dashed border-line-strong" label="Futuro" />
            <Legend className="bg-card-2/40 border-line" label="Fora da janela" />
            <span className="flex items-center gap-1">
              <span className="size-3 rounded-[3px] border border-volt-line" /> hoje
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-line bg-card-2 p-3">
            <p className="ds-label">Neste mês</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl text-accent">{monthValidDays}</span>
              <span className="text-[11px] text-muted">
                {monthValidDays === 1 ? 'dia válido' : 'dias válidos'}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted">
              {monthEmptyDays} {monthEmptyDays === 1 ? 'dia sem atividade' : 'dias sem atividade'}
            </p>
          </div>

          <div className="rounded-xl border border-line bg-card-2 p-3">
            <p className="flex items-center gap-1.5 text-[12px] font-medium">
              <CircleHelp className="size-3.5 text-muted" aria-hidden />
              {selectedDate ? formatFullDate(selectedDate) : 'Selecione um dia'}
            </p>
            {selectedDate && selectedStatus ? (
              <div className="mt-2">
                <div className="space-y-1.5">
                  <Badge
                    variant={
                      selectedStatus === 'VALID'
                        ? 'volt'
                        : selectedStatus === 'EMPTY'
                          ? 'neutral'
                          : selectedStatus === 'FUTURE'
                            ? 'outline'
                            : 'amber'
                    }
                  >
                    {statusCopy[selectedStatus].label}
                  </Badge>
                  <p className="text-[11px] leading-relaxed text-muted">{statusCopy[selectedStatus].description}</p>
                  <p className="font-mono text-[10px] text-faint">{formatWeekdayLong(selectedDate)}</p>
                </div>
                {selectedStatus === 'VALID' ? (
                  <ActivityCommitList
                    commits={commits}
                    timezone={timezone}
                    isLoading={commitsQuery.isLoading}
                    error={commitsQuery.isError ? commitsQuery.error : null}
                    onRetry={() => void commitsQuery.refetch()}
                  />
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-[11px] leading-relaxed text-muted">
                Toque em um dia para ver o status. Use as setas do teclado para navegar.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('size-3 rounded-[3px] border', className)} aria-hidden />
      {label}
    </span>
  );
}

function shortSha(sha: string) {
  return sha.slice(0, 7);
}

interface ActivityCommitListProps {
  commits: ActivityCommit[];
  timezone: string;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

function ActivityCommitList({ commits, timezone, isLoading, error, onRetry }: ActivityCommitListProps) {
  return (
    <div className="mt-3 border-t border-line pt-3" aria-live="polite">
      <p className="ds-label">Commits do dia</p>

      {isLoading ? (
        <div className="mt-2 space-y-1.5">
          <Skeleton className="h-14 rounded-lg" />
          <Skeleton className="h-14 rounded-lg" />
          <span className="sr-only">Carregando commits do dia</span>
        </div>
      ) : error ? (
        <ErrorState error={error} compact onRetry={onRetry} className="mt-2 gap-2 rounded-lg px-3 py-4" />
      ) : commits.length === 0 ? (
        <p className="mt-2 text-[11px] leading-relaxed text-muted">Dia registrado sem commit associado</p>
      ) : (
        <ol className="mt-2 space-y-1.5" aria-label="Commits que validaram o dia">
          {commits.map((commit, index) => (
            <li key={commit.sha}>
              <a
                href={commit.commitUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Abrir commit ${shortSha(commit.sha)} de ${commit.repositoryFullName} no GitHub (nova aba)`}
                className={cn(
                  'ds-focus-ring group block min-w-0 rounded-lg border px-2.5 py-2 transition-colors',
                  index === 0
                    ? 'border-volt-line bg-volt-soft hover:brightness-105'
                    : 'border-line bg-card hover:border-line-strong',
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-[11px] font-medium text-accent">
                    {shortSha(commit.sha)}
                  </span>
                  <ExternalLink
                    className="size-3 shrink-0 text-faint transition-colors group-hover:text-accent"
                    aria-hidden
                  />
                </span>
                <span
                  className="mt-0.5 block truncate font-mono text-[10px] text-muted"
                  title={commit.repositoryFullName}
                >
                  {commit.repositoryFullName}
                </span>
                <span className="mt-1.5 flex flex-wrap items-center justify-between gap-1.5">
                  <time dateTime={commit.committedAt} className="font-mono text-[10px] text-faint">
                    {formatTime(commit.committedAt, timezone)}
                  </time>
                  {index === 0 ? (
                    <Badge variant="volt" size="sm" className="whitespace-normal text-left">
                      Commit que validou o dia
                    </Badge>
                  ) : null}
                </span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
