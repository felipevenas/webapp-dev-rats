import { Check, Flame, GitCommitHorizontal, Loader2, Trophy, WifiOff } from 'lucide-react';
import { currentMonthKey, monthGrid, todayInZone, userTimeZone, WEEKDAY_LABELS } from '@/core/lib/date';
import { cn } from '@/core/lib/cn';

export function MiniCalendar() {
  const month = currentMonthKey(userTimeZone());
  const cells = monthGrid(month);
  const today = todayInZone(userTimeZone());

  return (
    <div className="rounded-xl border border-line bg-bg/50 p-3">
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label, index) => (
          <span key={`${label}-${index}`} className="text-center font-mono text-[9px] text-faint">
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.slice(0, 35).map((cell) => {
          const day = Number(cell.date.slice(-2));
          const isToday = cell.date === today;
          const isPast = cell.date < today;
          const valid = isPast && (day * 7) % 11 < 5;
          return (
            <span
              key={cell.date}
              className={cn(
                'aspect-square rounded-[5px] border',
                !cell.inMonth && 'opacity-25',
                valid && 'border-volt-line bg-volt',
                !valid && isPast && cell.inMonth && 'border-line bg-card-2',
                !isPast && cell.inMonth && 'border-line/70 border-dashed bg-transparent',
                isToday && !valid && 'border-volt-line',
              )}
            />
          );
        })}
      </div>
      <div className="mt-2.5 flex items-center justify-between font-mono text-[9px] text-faint">
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-[3px] bg-volt" /> dia válido
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-[3px] border border-dashed border-line-strong" /> futuro
        </span>
      </div>
    </div>
  );
}

const leaderboard = [
  { name: 'Ana Ribeiro', handle: 'anarib', days: 18, streak: 6, you: false },
  { name: 'Lucas Prado', handle: 'lucasp', days: 16, streak: 11, you: true },
  { name: 'Bia Souza', handle: 'biasouza', days: 14, streak: 2, you: false },
  { name: 'Caio Lima', handle: 'caiolima', days: 9, streak: 3, you: false },
];

export function MiniLeaderboard() {
  return (
    <div className="space-y-1.5">
      {leaderboard.map((entry, index) => (
        <div
          key={entry.handle}
          className={cn(
            'flex items-center gap-2.5 rounded-lg border px-2.5 py-2',
            entry.you ? 'border-volt-line bg-volt-soft/40' : 'border-line bg-bg/40',
          )}
        >
          <span
            className={cn(
              'inline-flex size-6 items-center justify-center rounded-md font-mono text-[10px]',
              index === 0
                ? 'bg-gold/15 text-gold'
                : index === 1
                  ? 'bg-silver/15 text-silver'
                  : index === 2
                    ? 'bg-bronze/15 text-bronze'
                    : 'bg-card-2 text-faint',
            )}
          >
            {index === 0 ? <Trophy className="size-3" aria-hidden /> : index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium text-fg">
              {entry.name} {entry.you ? <span className="text-accent">· você</span> : null}
            </p>
            <p className="truncate font-mono text-[9px] text-faint">@{entry.handle}</p>
          </div>
          <span className="flex items-center gap-0.5 font-mono text-[10px] text-muted">
            <Flame className="size-3 text-amber" aria-hidden />
            {entry.streak}
          </span>
          <span className="w-7 text-right font-mono text-xs text-fg">{entry.days}</span>
        </div>
      ))}
    </div>
  );
}

export function VerificationCard() {
  return (
    <div className="space-y-2.5 rounded-xl border border-line bg-bg/50 p-3.5 font-mono text-[11px]">
      <div className="flex items-center gap-2 text-muted">
        <span className="text-accent">$</span>
        <span>git push origin main</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-volt-line bg-volt-soft px-2.5 py-2">
        <Check className="size-3.5 text-accent" aria-hidden />
        <span className="text-fg">commit elegível</span>
        <span className="ml-auto text-faint">+1 dia</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-line px-2.5 py-2 text-muted">
        <Loader2 className="size-3.5 animate-spin text-cyan" aria-hidden />
        <span>verificando autoria…</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-amber/30 bg-amber-soft px-2.5 py-2">
        <WifiOff className="size-3.5 text-amber" aria-hidden />
        <span className="text-amber">GitHub indisponível — você não é penalizado</span>
      </div>
      <div className="flex items-center gap-2 text-faint">
        <GitCommitHorizontal className="size-3.5" aria-hidden />
        <span>identidade pelo ID numérico do GitHub</span>
      </div>
    </div>
  );
}

export function StreakRuleVisual() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-xl border border-line bg-bg/50 p-3">
        <p className="ds-label">Dias válidos</p>
        <p className="mt-1 font-mono text-2xl text-fg">23</p>
        <p className="text-[11px] text-muted">não zeram ao falhar um dia</p>
      </div>
      <div className="rounded-xl border border-line bg-bg/50 p-3">
        <p className="ds-label">Sequência</p>
        <p className="mt-1 font-mono text-2xl text-accent">06</p>
        <p className="text-[11px] text-muted">zera e recomeça no próximo dia</p>
      </div>
    </div>
  );
}
