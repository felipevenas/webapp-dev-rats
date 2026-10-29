import { Flame, Medal, Target, Trophy } from 'lucide-react';
import type { ChallengeStatus } from '@/core/types/api';
import type { IconComponent } from '@/core/types/ui';
import { Badge } from '@/components/ui/badge';
import { challengeStatusCopy, type Tone } from '@/features/challenges/domain/challenge-status';

export function ChallengeStatusBadge({ status, size = 'md' }: { status: ChallengeStatus; size?: 'sm' | 'md' }) {
  const copy = challengeStatusCopy(status);
  const variant = toneToVariant(copy.tone);
  return (
    <Badge variant={variant} size={size}>
      {status === 'ACTIVE' ? <span className="size-1.5 animate-pulse rounded-full bg-current" aria-hidden /> : null}
      {copy.label}
    </Badge>
  );
}

export function toneToVariant(tone: Tone): 'volt' | 'cyan' | 'amber' | 'rose' | 'violet' | 'neutral' {
  return tone;
}

export function MiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: IconComponent;
  label: string;
  value: string;
  tone?: 'volt' | 'amber' | 'gold';
}) {
  const color =
    tone === 'volt' ? 'text-accent' : tone === 'amber' ? 'text-amber' : tone === 'gold' ? 'text-gold' : 'text-fg';
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] text-faint">
        <Icon className="size-3" aria-hidden />
        {label}
      </p>
      <p className={`mt-0.5 truncate font-mono text-sm ${color}`}>{value}</p>
    </div>
  );
}

export const statIcons = { Flame, Medal, Target, Trophy };
