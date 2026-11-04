import { DEFAULT_TIME_ZONE } from '@/core/lib/date';
import type { FriendshipStatus, PresenceStatus } from '@/core/types/api';

interface PresenceCopy {
  label: string;
  shortLabel: string;
  /** Tailwind background used by the dot. Rose is intentionally never used for presence. */
  dotClass: string;
  textClass: string;
}

export const PRESENCE_COPY: Record<PresenceStatus, PresenceCopy> = {
  ONLINE: {
    label: 'Online agora',
    shortLabel: 'Online',
    dotClass: 'bg-accent',
    textClass: 'text-accent',
  },
  AWAY: {
    label: 'Ausente',
    shortLabel: 'Ausente',
    dotClass: 'bg-amber',
    textClass: 'text-amber',
  },
  OFFLINE: {
    label: 'Offline',
    shortLabel: 'Offline',
    dotClass: 'bg-faint',
    textClass: 'text-muted',
  },
};

/** `null` means "not shared with you"; callers must not render anything in that case. */
export function presenceCopy(presence?: PresenceStatus | null): PresenceCopy | null {
  if (!presence) return null;
  return PRESENCE_COPY[presence] ?? null;
}

const FRIENDSHIP_STATUS_COPY: Record<FriendshipStatus, { label: string; description: string }> = {
  NONE: {
    label: 'Sem conexão',
    description: 'Vocês ainda não estão conectados. Envie uma solicitação para acompanhar a presença.',
  },
  PENDING_OUTGOING: {
    label: 'Solicitação enviada',
    description: 'Aguardando a outra pessoa aceitar. Você pode cancelar a solicitação quando quiser.',
  },
  PENDING_INCOMING: {
    label: 'Solicitação recebida',
    description: 'Esta pessoa quer adicionar você. Aceite para liberar a presença entre vocês.',
  },
  FRIENDS: {
    label: 'Amigos',
    description: 'Vocês são amigos e podem ver a presença um do outro.',
  },
  SELF: {
    label: 'Seu perfil',
    description: 'Este é o seu perfil público.',
  },
};

export function friendshipStatusCopy(status?: FriendshipStatus | null) {
  if (!status) return FRIENDSHIP_STATUS_COPY.NONE;
  return FRIENDSHIP_STATUS_COPY[status] ?? FRIENDSHIP_STATUS_COPY.NONE;
}

/** Compact label used next to friend cards, e.g. "Amigos desde nov de 2026". */
export function friendsSinceLabel(instant: string): string {
  const date = new Date(instant);
  if (Number.isNaN(date.getTime())) return 'Amigos';
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    year: 'numeric',
    timeZone: DEFAULT_TIME_ZONE,
  })
    .format(date)
    .replace('.', '');
  return `Amigos desde ${formatted}`;
}

export function friendRequestDirectionLabel(direction: 'RECEIVED' | 'SENT'): string {
  return direction === 'RECEIVED' ? 'Solicitação recebida' : 'Solicitação enviada';
}

export const FRIENDS_PAGE_COPY = {
  eyebrow: 'Sua rede',
  title: 'Amigos',
  description:
    'Presença visível apenas entre amigos. Adicione pessoas pelo @usuário e acompanhe quem está online agora.',
  privacyNote:
    'Ninguém vê sua presença fora da sua rede. O status é calculado pelo último acesso e some quando você fica inativo.',
  searchHint: 'Digite pelo menos 2 caracteres do @usuário.',
  searchPlaceholder: 'Buscar por @usuário',
} as const;

export const FRIEND_ACTION_COPY = {
  add: 'Adicionar',
  sent: 'Enviada',
  accept: 'Aceitar',
  decline: 'Recusar',
  friends: 'Amigos',
  cancel: 'Cancelar solicitação',
  remove: 'Remover amizade',
  viewProfile: 'Ver perfil',
} as const;
