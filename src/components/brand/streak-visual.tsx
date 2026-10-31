import { Flame, GitCommitHorizontal, Trophy } from 'lucide-react';
import { cn } from '@/core/lib/cn';

const pattern = [1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1];
const today = new Date().getUTCDay();

export function StreakVisual({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-line bg-card/90 p-4 shadow-float backdrop-blur-sm',
        compact ? 'max-w-sm' : 'max-w-md',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
          <span className="inline-flex size-5 items-center justify-center rounded-md border border-line bg-card-2">
            <GitCommitHorizontal className="size-3 text-accent" aria-hidden />
          </span>
          devrats · live
        </span>
        <span className="flex items-center gap-1 rounded-full border border-volt-line bg-volt-soft px-2 py-0.5 font-mono text-[10px] text-accent">
          <Flame className="size-3" aria-hidden /> 12 dias
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">Meta do desafio</p>
          <p className="mt-1 font-mono text-[28px] leading-none text-fg">
            12<span className="text-muted">/30</span>
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">Ranking</p>
          <p className="mt-1 flex items-center justify-end gap-1 font-mono text-sm text-gold">
            <Trophy className="size-3.5" aria-hidden /> #1
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5" aria-hidden>
        {pattern.map((filled, index) => (
          <span
            key={index}
            className={cn(
              'aspect-square rounded-[5px] border',
              filled
                ? 'border-volt-line bg-volt/90 shadow-[0_0_10px_-2px_rgba(200,255,61,0.55)]'
                : index % 7 === today
                  ? 'border-volt-line/70 bg-card-2'
                  : 'border-line bg-card-2/60',
            )}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-bg/60 px-3 py-2 font-mono text-[11px]">
        <span className="text-accent">✓</span>
        <span className="text-muted">commit verificado</span>
        <span className="ml-auto text-faint">hoje · 21:14</span>
      </div>
    </div>
  );
}
