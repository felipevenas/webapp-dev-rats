import { useState } from 'react';
import { ArrowRight, CalendarClock, Check, Ticket, UserPlus, Users, XCircle } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/core/auth/auth-provider';
import { queryKeys } from '@/core/config/query-keys';
import { toAppError } from '@/core/http/problem';
import { DEFAULT_TIME_ZONE, formatFullDate, localDateInZone } from '@/core/lib/date';
import { invitesApi } from '@/features/invites/data/invites-api';
import { Logo } from '@/components/brand/logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const invalidCopy: Record<string, string> = {
  REVOKED: 'Este convite foi revogado pelo criador do grupo.',
  EXPIRED: 'Este convite expirou. Peça um novo link a quem te convidou.',
  EXHAUSTED: 'Este convite atingiu o limite de usos.',
  GROUP_ARCHIVED: 'O grupo não está mais ativo.',
};

export default function InvitePage() {
  const { token = '' } = useParams<{ token: string }>();
  const { status } = useAuth();
  const navigate = useNavigate();
  const [acceptError, setAcceptError] = useState<unknown>(null);

  const preview = useQuery({
    queryKey: queryKeys.invitePreview(token),
    queryFn: () => invitesApi.preview(token),
    enabled: Boolean(token),
    retry: false,
  });

  const accept = useMutation({
    mutationFn: () => invitesApi.accept(token),
    onSuccess: (group) => {
      toast.success(`Você entrou em ${group.name}.`);
      navigate(`/app/groups/${group.id}`, { replace: true });
    },
    onError: (error) => setAcceptError(error),
  });

  const next = `/invites/${token}`;
  const isAuthenticated = status === 'authenticated';

  return (
    <div className="relative min-h-dvh overflow-hidden bg-bg">
      <div className="ds-grid-bg ds-radial pointer-events-none absolute inset-0" aria-hidden />

      <header className="relative z-10">
        <div className="ds-container flex h-16 items-center justify-between">
          <Link to="/" aria-label="DevRats — início">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button asChild variant="ghost" size="sm">
                <Link to="/app">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Entrar</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="ds-container relative z-10 flex justify-center py-8 sm:py-14">
        <div className="w-full max-w-md">
          {preview.isLoading || status === 'booting' ? (
            <div className="ds-card space-y-4 p-6">
              <Skeleton className="mx-auto size-14 rounded-2xl" />
              <Skeleton className="mx-auto h-4 w-40" />
              <Skeleton className="mx-auto h-8 w-64" />
              <Skeleton className="h-11 w-full" />
            </div>
          ) : preview.isError ? (
            <div className="ds-card p-6">
              <ErrorState
                error={preview.error}
                action={
                  <Button asChild variant="secondary">
                    <Link to="/">Voltar ao início</Link>
                  </Button>
                }
              />
            </div>
          ) : preview.data ? (
            <div className="ds-card overflow-hidden">
              <div className="ds-grid-bg-sm border-b border-line bg-card-2/40 px-6 py-7 text-center">
                <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl border border-volt-line bg-volt-soft text-accent">
                  <Ticket className="size-6" aria-hidden />
                </span>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                  convite privado
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{preview.data.groupName}</h1>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  <strong className="text-fg">{preview.data.inviterName}</strong> te convidou para participar
                  deste desafio de constância.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <Badge variant={preview.data.valid ? 'volt' : 'rose'} size="sm">
                    {preview.data.valid ? (
                      <>
                        <Check className="size-3" aria-hidden /> convite válido
                      </>
                    ) : (
                      <>
                        <XCircle className="size-3" aria-hidden /> inválido
                      </>
                    )}
                  </Badge>
                  <Badge variant="outline" size="sm">
                    <CalendarClock className="size-3" aria-hidden />
                    expira {formatFullDate(localDateInZone(preview.data.expiresAt, DEFAULT_TIME_ZONE))}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4 p-6">
                {preview.data.valid ? (
                  <>
                    <div className="space-y-2.5">
                      {[
                        'Um dia válido por dia com pelo menos um commit elegível.',
                        'Ranking, sequência e calendário compartilhados com o grupo.',
                        'Regras iguais para todos, com verificação automática no GitHub.',
                      ].map((item) => (
                        <p key={item} className="flex gap-2 text-[12px] leading-relaxed text-muted">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
                          {item}
                        </p>
                      ))}
                    </div>

                    {acceptError ? (
                      <div className="space-y-2 rounded-xl border border-rose/30 bg-rose-soft p-3" role="alert">
                        <p className="text-[12px] font-medium text-fg">Não foi possível entrar</p>
                        <p className="text-[11px] leading-relaxed text-muted">
                          {toAppError(acceptError).detail}
                        </p>
                        <Button asChild size="sm" variant="secondary">
                          <Link to="/app">Ir para o dashboard</Link>
                        </Button>
                      </div>
                    ) : null}

                    {isAuthenticated ? (
                      <Button
                        full
                        size="lg"
                        onClick={() => {
                          setAcceptError(null);
                          accept.mutate();
                        }}
                        loading={accept.isPending}
                      >
                        <UserPlus aria-hidden />
                        Entrar no grupo
                        <ArrowRight aria-hidden />
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Button asChild full size="lg">
                          <Link to={`/login?next=${encodeURIComponent(next)}`}>
                            Entrar para aceitar
                            <ArrowRight aria-hidden />
                          </Link>
                        </Button>
                        <Button asChild full variant="secondary">
                          <Link to={`/register?next=${encodeURIComponent(next)}`}>Criar conta grátis</Link>
                        </Button>
                      </div>
                    )}

                    <p className="flex items-center justify-center gap-1.5 text-center text-[10px] text-faint">
                      <Users className="size-3" aria-hidden />
                      É necessário estar autenticado para aceitar o convite.
                    </p>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-amber/30 bg-amber-soft p-3">
                      <p className="text-[12px] font-medium text-fg">Convite indisponível</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted">
                        {invalidCopy[preview.data.reason ?? ''] ??
                          'Este convite não é mais válido. Peça um novo link ao criador do grupo.'}
                      </p>
                    </div>
                    <Button asChild full variant="secondary">
                      <Link to="/">Voltar ao início</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <p className="mt-5 text-center text-[10px] leading-relaxed text-faint">
            O DevRats nunca exibe o código dos repositórios. A verificação usa apenas metadados de commits.
          </p>
        </div>
      </main>
    </div>
  );
}
