import { Flame, Trophy } from 'lucide-react';
import type { ProgressEntry } from '@/core/types/api';
import { daysLabel, firstName } from '@/core/lib/format';
import { formatShortDate } from '@/core/lib/date';
import { cn } from '@/core/lib/cn';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function LeaderboardList({
  entries,
  currentUserId,
  winnerUserId,
  compact = false,
}: {
  entries: ProgressEntry[];
  currentUserId?: string;
  winnerUserId?: string | null;
  compact?: boolean;
}) {
  const visible = compact ? entries.slice(0, 5) : entries;

  return (
    <ol className="space-y-2" aria-label="Ranking do desafio">
      {visible.map((entry) => {
        const isMe = entry.userId === currentUserId;
        const isWinner = entry.userId === winnerUserId;
        const percent = Math.min(100, entry.percent);

        return (
          <li
            key={entry.participantId}
            className={cn(
              'relative overflow-hidden rounded-xl border p-3 transition-colors',
              isWinner
                ? 'border-volt-line bg-volt-soft/40'
                : isMe
                  ? 'border-line-strong bg-card'
                  : 'border-line bg-card/60',
            )}
          >
            {isMe ? <span className="absolute inset-y-0 left-0 w-0.5 bg-volt" aria-hidden /> : null}
            <div className="flex items-center gap-3">
              <RankBadge rank={entry.rank} winner={isWinner} />
              <Avatar src={entry.avatarUrl} name={entry.displayName} size={compact ? 'sm' : 'md'} />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <p className={cn('truncate text-[13px]', isMe ? 'font-semibold text-fg' : 'font-medium text-fg')}>
                    {compact ? firstName(entry.displayName) : entry.displayName}
                  </p>
                  {isMe ? <Badge variant="volt" size="sm">você</Badge> : null}
                  {isWinner ? (
                    <Badge variant="volt" size="sm">
                      <Trophy className="size-2.5" aria-hidden /> vencedor
                    </Badge>
                  ) : null}
                </div>
                <p className="truncate font-mono text-[10px] text-faint">@{entry.username}</p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <span className="font-mono text-base leading-none text-fg">{entry.validDays}</span>
                <span className="hidden font-mono text-[9px] uppercase tracking-[0.1em] text-faint sm:block">
                  dias
                </span>
              </div>

              {!compact ? (
                <div className="hidden w-14 shrink-0 flex-col items-end gap-0.5 sm:flex">
                  <span className="flex items-center gap-1 font-mono text-[11px] text-amber">
                    <Flame className="size-3" aria-hidden />
                    {entry.currentStreak}d
                  </span>
                  <span className="text-[9px] text-faint">
                    {entry.lastValidDate ? formatShortDate(entry.lastValidDate) : 'sem dia'}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-card-2">
                <div
                  className={cn(
                    'h-full rounded-full transition-[width] duration-500',
                    isWinner
                      ? 'bg-volt shadow-[0_0_10px_rgba(200,255,61,0.5)]'
                      : isMe
                        ? 'bg-volt/80'
                        : 'bg-muted/50',
                  )}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right font-mono text-[10px] text-faint">{percent}%</span>
              {!compact ? (
                <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-amber sm:hidden">
                  <Flame className="size-3" aria-hidden />
                  {entry.currentStreak}d
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function RankBadge({ rank, winner }: { rank: number; winner?: boolean }) {
  const tone =
    winner || rank === 1
      ? 'border-gold/40 bg-gold/10 text-gold'
      : rank === 2
        ? 'border-silver/40 bg-silver/10 text-silver'
        : rank === 3
          ? 'border-bronze/40 bg-bronze/10 text-bronze'
          : 'border-line bg-card-2 text-faint';

  return (
    <span
      className={cn(
        'inline-flex size-7 shrink-0 items-center justify-center rounded-lg border font-mono text-[11px]',
        tone,
      )}
      aria-label={`Posição ${rank}`}
    >
      {winner ? <Trophy className="size-3.5" aria-hidden /> : rank}
    </span>
  );
}

export function YourPositionCard({ entry }: { entry: ProgressEntry }) {
  return (
    <div className="rounded-xl border border-volt-line bg-volt-soft/30 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <RankBadge rank={entry.rank} />
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold">Sua posição</p>
            <p className="font-mono text-[10px] text-muted">
              {daysLabel(entry.validDays)} de {entry.targetValidDays} · sequência {entry.currentStreak}d
            </p>
          </div>
        </div>
        <Badge variant="volt">#{entry.rank}</Badge>
      </div>
    </div>
  );
}
