import type { AxiosError } from 'axios';
import type { ProblemDetail } from '@/core/types/api';

export interface FieldError {
  field: string;
  message: string;
}

export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly title: string;
  readonly detail: string;
  readonly fieldErrors: FieldError[];
  readonly traceId?: string;
  readonly retryAfterSeconds?: number;

  constructor(options: {
    status: number;
    code: string;
    title: string;
    detail: string;
    fieldErrors?: FieldError[];
    traceId?: string;
    retryAfterSeconds?: number;
  }) {
    super(options.detail);
    this.name = 'AppError';
    this.status = options.status;
    this.code = options.code;
    this.title = options.title;
    this.detail = options.detail;
    this.fieldErrors = options.fieldErrors ?? [];
    this.traceId = options.traceId;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get fieldErrorMap(): Record<string, string> {
    return this.fieldErrors.reduce<Record<string, string>>((acc, item) => {
      acc[item.field] = item.message;
      return acc;
    }, {});
  }
}

const FALLBACK_TITLES: Record<string, string> = {
  VALIDATION_ERROR: 'Revise os campos',
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  UNAUTHORIZED: 'Sessão expirada',
  FORBIDDEN: 'Acesso negado',
  GITHUB_NOT_CONNECTED: 'GitHub não conectado',
  GITHUB_UNAVAILABLE: 'GitHub indisponível',
  RATE_LIMITED: 'Muitas tentativas',
  DATA_CONFLICT: 'Conflito de dados',
  INTERNAL_ERROR: 'Erro interno',
};

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  const axiosError = error as AxiosError<ProblemDetail>;
  if (axiosError?.isAxiosError) {
    if (!axiosError.response) {
      return new AppError({
        status: 0,
        code: 'NETWORK_ERROR',
        title: 'Sem conexão',
        detail: 'Não foi possível falar com o servidor. Verifique sua internet e tente novamente.',
      });
    }
    const problem = axiosError.response.data;
    const status = axiosError.response.status;
    const code = problem?.code ?? `HTTP_${status}`;
    return new AppError({
      status,
      code,
      title: problem?.title ?? FALLBACK_TITLES[code] ?? 'Algo deu errado',
      detail: problem?.detail ?? defaultDetail(status),
      fieldErrors: problem?.errors ?? [],
      traceId: problem?.traceId,
      retryAfterSeconds: problem?.retryAfterSeconds,
    });
  }

  return new AppError({
    status: 0,
    code: 'UNKNOWN_ERROR',
    title: 'Algo deu errado',
    detail: error instanceof Error ? error.message : 'Tente novamente em instantes.',
  });
}

function defaultDetail(status: number): string {
  if (status === 401) return 'Sua sessão expirou. Entre novamente para continuar.';
  if (status === 403) return 'Você não tem permissão para esta ação.';
  if (status === 404) return 'Não encontramos o que você procura.';
  if (status === 429) return 'Aguarde um instante antes de tentar novamente.';
  if (status >= 500) return 'O servidor encontrou um problema. Tente novamente.';
  return 'Não foi possível concluir a ação.';
}

export function errorMessage(error: unknown): string {
  return toAppError(error).detail;
}
