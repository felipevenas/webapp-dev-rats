import type { ChallengeStatus, VerificationMode } from '@/core/types/api';

export type Tone = 'volt' | 'cyan' | 'amber' | 'rose' | 'violet' | 'neutral';

interface StatusCopy {
  label: string;
  tone: Tone;
  description: string;
}

export function challengeStatusCopy(status: ChallengeStatus): StatusCopy {
  switch (status) {
    case 'DRAFT':
      return {
        label: 'Rascunho',
        tone: 'amber',
        description: 'Ajuste as regras e inicie quando o grupo estiver pronto.',
      };
    case 'ACTIVE':
      return {
        label: 'Ativo',
        tone: 'volt',
        description: 'A verificação está rodando e os dias válidos contam.',
      };
    case 'COMPLETED':
      return { label: 'Concluído', tone: 'violet', description: 'A meta foi alcançada e o resultado está congelado.' };
    case 'CANCELLED':
      return { label: 'Cancelado', tone: 'rose', description: 'O criador encerrou o desafio antes da meta.' };
    case 'EXPIRED':
      return { label: 'Encerrado', tone: 'neutral', description: 'O prazo terminou sem vencedor.' };
    default:
      return { label: status, tone: 'neutral', description: '' };
  }
}

export function verificationModeCopy(mode: VerificationMode): { label: string; short: string; description: string } {
  if (mode === 'SELECTED_REPOSITORIES') {
    return {
      label: 'Repositórios selecionados',
      short: 'Lista do grupo',
      description: 'Valem apenas os repositórios escolhidos pelo criador.',
    };
  }
  return {
    label: 'Repositórios próprios',
    short: 'Projetos pessoais',
    description: 'Cada participante conta commits nos próprios repositórios.',
  };
}

export function isChallengeOpen(status: ChallengeStatus): boolean {
  return status === 'DRAFT' || status === 'ACTIVE';
}

export function isChallengeFinished(status: ChallengeStatus): boolean {
  return status === 'COMPLETED' || status === 'CANCELLED' || status === 'EXPIRED';
}
