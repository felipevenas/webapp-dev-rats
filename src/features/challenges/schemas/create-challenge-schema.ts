import { z } from 'zod';

export const createChallengeSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Dê um nome ao grupo')
      .max(120, 'Use no máximo 120 caracteres'),
    description: z.string().trim().max(500, 'Use no máximo 500 caracteres').optional(),
    maxMembers: z
      .number({ message: 'Informe um número' })
      .min(2, 'O grupo precisa de pelo menos 2 vagas')
      .max(200, 'Use no máximo 200 vagas'),
    verificationMode: z.enum(['SELECTED_REPOSITORIES', 'OWN_REPOSITORIES']),
    targetValidDays: z
      .number({ message: 'Informe a meta' })
      .min(1, 'A meta mínima é 1 dia')
      .max(365, 'A meta máxima é 365 dias'),
    startMode: z.enum(['now', 'schedule']),
    startAtLocal: z.string().optional(),
    endsAtDate: z.string().optional(),
    admissionEndsAtDate: z.string().optional(),
    repositoryIds: z.array(z.string()).max(3, 'Selecione no máximo 3 repositórios'),
  })
  .superRefine((values, ctx) => {
    let startInstant = Date.now();
    if (values.startMode === 'schedule') {
      if (!values.startAtLocal) {
        ctx.addIssue({ code: 'custom', path: ['startAtLocal'], message: 'Escolha a data e hora de início' });
      } else {
        const parsed = new Date(values.startAtLocal).getTime();
        if (Number.isNaN(parsed)) {
          ctx.addIssue({ code: 'custom', path: ['startAtLocal'], message: 'Data inválida' });
        } else if (parsed < Date.now() - 60_000) {
          ctx.addIssue({ code: 'custom', path: ['startAtLocal'], message: 'O início não pode estar no passado' });
        } else {
          startInstant = parsed;
        }
      }
    }

    if (values.endsAtDate) {
      const end = new Date(`${values.endsAtDate}T23:59:59`).getTime();
      if (!Number.isNaN(end) && end <= startInstant) {
        ctx.addIssue({ code: 'custom', path: ['endsAtDate'], message: 'O encerramento deve ser depois do início' });
      }
    }

    if (values.admissionEndsAtDate) {
      const admission = new Date(`${values.admissionEndsAtDate}T23:59:59`).getTime();
      if (!Number.isNaN(admission) && admission < startInstant) {
        ctx.addIssue({
          code: 'custom',
          path: ['admissionEndsAtDate'],
          message: 'A admissão não pode terminar antes do início',
        });
      }
    }

    if (values.verificationMode === 'SELECTED_REPOSITORIES' && values.repositoryIds.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['repositoryIds'],
        message: 'Selecione de 1 a 3 repositórios para o modo de lista do grupo',
      });
    }
  });

export type CreateChallengeValues = z.infer<typeof createChallengeSchema>;

export function endOfDayLocal(date: string): string {
  return new Date(`${date}T23:59:59`).toISOString();
}

export function defaultStartLocal(): string {
  const date = new Date(Date.now() + 5 * 60_000);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
