import {
  Bell,
  CalendarCheck,
  Flag,
  ShieldAlert,
  Trophy,
  UserPlus,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NotificationType } from '@/core/types/api';

interface NotificationCopy {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: 'volt' | 'cyan' | 'amber' | 'rose' | 'violet' | 'neutral';
}

export function notificationCopy(type: NotificationType): NotificationCopy {
  switch (type) {
    case 'DAILY_GOAL':
      return {
        title: 'Dia válido registrado',
        description: 'Seu commit elegível de hoje já conta no desafio.',
        icon: CalendarCheck,
        tone: 'volt',
      };
    case 'MILESTONE':
      return {
        title: 'Novo marco alcançado',
        description: 'Sua sequência acabou de subir de nível.',
        icon: Flag,
        tone: 'violet',
      };
    case 'CHALLENGE_COMPLETED':
      return {
        title: 'Desafio concluído',
        description: 'Alguém alcançou a meta. O resultado final já está disponível.',
        icon: Trophy,
        tone: 'volt',
      };
    case 'CHALLENGE_CANCELLED':
      return {
        title: 'Desafio cancelado',
        description: 'O criador encerrou este desafio antes da meta.',
        icon: XCircle,
        tone: 'rose',
      };
    case 'CHALLENGE_EXPIRED':
      return {
        title: 'Desafio encerrado',
        description: 'O prazo acabou sem que ninguém atingisse a meta.',
        icon: XCircle,
        tone: 'amber',
      };
    case 'MEMBER_JOINED':
      return {
        title: 'Novo membro no grupo',
        description: 'Um participante entrou no desafio.',
        icon: UserPlus,
        tone: 'cyan',
      };
    case 'INVITE_ACCEPTED':
      return {
        title: 'Convite aceito',
        description: 'Seu convite foi aceito e a pessoa já está no grupo.',
        icon: UserPlus,
        tone: 'cyan',
      };
    case 'INTEGRATION_ATTENTION':
      return {
        title: 'GitHub precisa de atenção',
        description: 'Reconecte sua conta para continuar validando commits.',
        icon: ShieldAlert,
        tone: 'amber',
      };
    default:
      return {
        title: 'Atualização',
        description: 'Há uma novidade no seu DevStreak.',
        icon: Bell,
        tone: 'neutral',
      };
  }
}

export function parseNotificationPayload(payload?: string | null): Record<string, unknown> {
  if (!payload) return {};
  try {
    const parsed: unknown = JSON.parse(payload);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function notificationDetail(type: NotificationType, payload?: string | null): string | null {
  const data = parseNotificationPayload(payload);
  if (type === 'INVITE_ACCEPTED' && typeof data.groupName === 'string') {
    return `Grupo: ${data.groupName}`;
  }
  return null;
}
