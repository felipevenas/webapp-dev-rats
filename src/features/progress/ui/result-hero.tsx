import { CalendarCheck, Crown, Share2, Target, Trophy, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Challenge, ChallengeResult, ProgressEntry } from '@/core/types/api';
import { formatDateTime, formatFullDate } from '@/core/lib/date';
import { daysLabel } from '@/core/lib/format';
import { cn } from '@/core/lib/cn';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { IconComponent } from '@/core/types/ui';

export function WinnerHero({
  result,
  challenge,
  entries,
  currentUserId,
  onSeeRanking,
}: {
  result: ChallengeResult;
  challenge: Challenge;
  entries: ProgressEntry[];
  currentUserId: string;
  onSeeRanking: () => void;
}) {
  const winner = entries.find((entry) => entry.userId === result.winnerUserId);
  const isMe = result.winnerUserId === currentUserId;

  const share = async () => {
    const text = `${result.winnerDisplayName} (@${result.winnerUsername}) venceu o desafio no DevRats com ${daysLabel(result.validDaysAtWin)} válidos.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Resultado do DevRats', text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Resultado copiado para a área de transferência.');
      }
    } catch {
      //---- Sharing is optional; closing the native sheet must not surface an error.
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-volt-line bg-card p-6 sm:p-8">
      <div className="ds-grid-bg-sm pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-volt/15 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <span className="absolute inset-0 animate-pulse rounded-full bg-volt/20 blur-xl" aria-hidden />
          <div className="relative">
            <Avatar src={winner?.avatarUrl} name={result.winnerDisplayName} size="2xl" ring />
            <span className="absolute -bottom-1 -right-1 inline-flex size-8 items-center justify-center rounded-full border border-volt-line bg-volt text-volt-ink shadow-float ring-2 ring-bg">
              <Crown className="size-4" aria-hidden />
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="volt">
              <Trophy className="size-3" aria-hidden />
              desafio concluído
            </Badge>
            <Badge variant="outline">{result.status === 'FINAL' ? 'resultado final' : 'provisório'}</Badge>
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
            {isMe ? 'Você venceu.' : `${result.winnerDisplayName} venceu.`}
          </h2>
          <p className="mt-1 font-mono text-[11px] text-muted">@{result.winnerUsername}</p>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted">
            Alcançou a meta de {challenge.targetValidDays} dias válidos primeiro, com{' '}
            {daysLabel(result.validDaysAtWin)} verificados.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:w-40">
          <Button onClick={onSeeRanking} variant="secondary">
            Ver ranking final
          </Button>
          <Button onClick={() => void share()} variant="ghost">
            <Share2 aria-hidden />
            Compartilhar
          </Button>
        </div>
      </div>

      <dl className="relative mt-6 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-3">
        <ResultStat
          icon={Target}
          label="Dias válidos"
          value={`${result.validDaysAtWin}/${challenge.targetValidDays}`}
        />
        <ResultStat icon={CalendarCheck} label="Dia decisivo" value={formatFullDate(result.winningActivityDate)} />
        <ResultStat
          icon={Trophy}
          label="Conclusão reconhecida"
          value={formatDateTime(result.achievedAt, challenge.timezone)}
          className="col-span-2 sm:col-span-1"
        />
      </dl>
    </section>
  );
}

function ResultStat({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: IconComponent;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
        <Icon className="size-3" aria-hidden />
        {label}
      </dt>
      <dd className="mt-1 truncate text-[12px] text-fg">{value}</dd>
    </div>
  );
}

export function FinishedBanner({ challenge }: { challenge: Challenge }) {
  if (challenge.status === 'CANCELLED') {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-rose/30 bg-rose-soft p-4">
        <XCircle className="mt-0.5 size-4.5 shrink-0 text-rose" aria-hidden />
        <div>
          <p className="text-sm font-semibold">Desafio cancelado</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
            O criador encerrou este desafio antes da meta. O histórico de dias válidos permanece disponível para
            consulta, mas não há vencedor.
          </p>
        </div>
      </div>
    );
  }

  if (challenge.status === 'EXPIRED') {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-amber/30 bg-amber-soft p-4">
        <XCircle className="mt-0.5 size-4.5 shrink-0 text-amber" aria-hidden />
        <div>
          <p className="text-sm font-semibold">Prazo encerrado sem vencedor</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
            Ninguém atingiu a meta dentro da janela do desafio. Os dias válidos continuam registrados no histórico.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
