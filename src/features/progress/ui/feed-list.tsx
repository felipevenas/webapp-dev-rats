import {
  CalendarCheck,
  CheckCircle2,
  Flag,
  GitBranch,
  Lock,
  LogOut,
  ShieldAlert,
  Sparkles,
  Trophy,
  UserMinus,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FeedItem } from '@/core/types/api';
import { formatRelativeTime } from '@/core/lib/date';
import { cn } from '@/core/lib/cn';

const feedCopy: Record<string, { label: string; icon: LucideIcon; tone: string }> = {
  CHALLENGE_CREATED: { label: 'Desafio criado', icon: Flag, tone: 'text-cyan' },
  CHALLENGE_STARTED: { label: 'Desafio iniciado', icon: Sparkles, tone: 'text-accent' },
  CHALLENGE_COMPLETED: { label: 'Meta alcançada — desafio concluído', icon: Trophy, tone: 'text-gold' },
  CHALLENGE_CANCELLED: { label: 'Desafio cancelado', icon: XCircle, tone: 'text-rose' },
  CHALLENGE_EXPIRED: { label: 'Desafio encerrado sem vencedor', icon: XCircle, tone: 'text-amber' },
  CHALLENGE_UPDATED: { label: 'Regras do desafio atualizadas', icon: ShieldAlert, tone: 'text-amber' },
  MEMBER_JOINED: { label: 'Novo membro entrou no grupo', icon: UserPlus, tone: 'text-cyan' },
  INVITE_ACCEPTED: { label: 'Convite aceito', icon: UserPlus, tone: 'text-cyan' },
  INVITE_CREATED: { label: 'Novo link de convite gerado', icon: UserPlus, tone: 'text-cyan' },
  INVITE_REVOKED: { label: 'Convite revogado', icon: UserMinus, tone: 'text-muted' },
  MEMBER_LEFT: { label: 'Um participante saiu do grupo', icon: LogOut, tone: 'text-muted' },
  MEMBER_REMOVED: { label: 'Um participante foi removido', icon: UserMinus, tone: 'text-rose' },
  DAILY_GOAL: { label: 'Dia válido registrado', icon: CalendarCheck, tone: 'text-accent' },
  ACTIVITY_CORRECTED: { label: 'Atividade corrigida pela auditoria', icon: ShieldAlert, tone: 'text-amber' },
  GROUP_CREATED: { label: 'Grupo criado', icon: Users, tone: 'text-cyan' },
  GROUP_UPDATED: { label: 'Informações do grupo atualizadas', icon: ShieldAlert, tone: 'text-muted' },
  REPOSITORY_ADDED: { label: 'Repositório vinculado ao desafio', icon: GitBranch, tone: 'text-muted' },
  REPOSITORY_REMOVED: { label: 'Repositório removido do desafio', icon: GitBranch, tone: 'text-muted' },
  GITHUB_CONNECTED: { label: 'Conta do GitHub conectada', icon: CheckCircle2, tone: 'text-accent' },
  GITHUB_DISCONNECTED: { label: 'Conta do GitHub desconectada', icon: Lock, tone: 'text-amber' },
  CHALLENGE_REPOSITORIES_LOCKED: { label: 'Lista de repositórios travada', icon: Lock, tone: 'text-muted' },
};

export function feedItemCopy(item: FeedItem): { label: string; icon: LucideIcon; tone: string } {
  const known = feedCopy[item.type];
  if (known) return known;
  //---- The API falls back to the raw enum for unmapped actions; show a neutral label instead.
  const human = item.message && item.message !== item.type ? item.message : 'Atualização no desafio';
  return { label: human, icon: CheckCircle2, tone: 'text-muted' };
}

export function FeedList({ items, limit }: { items: FeedItem[]; limit?: number }) {
  const visible = limit ? items.slice(0, limit) : items;

  return (
    <ol className="relative space-y-0.5" aria-label="Atividade do desafio">
      {visible.map((item, index) => {
        const copy = feedItemCopy(item);
        const Icon = copy.icon;
        return (
          <li key={item.id} className="relative flex gap-3 pb-3">
            {index < visible.length - 1 ? (
              <span className="absolute left-[13px] top-7 h-[calc(100%-1.5rem)] w-px bg-line" aria-hidden />
            ) : null}
            <span
              className={cn(
                'relative z-10 mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-card-2',
                copy.tone,
              )}
            >
              <Icon className="size-3.5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[12px] leading-snug text-fg">{copy.label}</p>
              <p className="mt-0.5 font-mono text-[10px] text-faint">{formatRelativeTime(item.createdAt)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
