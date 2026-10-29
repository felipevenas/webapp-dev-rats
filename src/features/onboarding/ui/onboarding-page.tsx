import { ArrowRight, Check, LogOut, Rocket, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Github } from '@/components/brand/github-icon';
import type { IconComponent } from '@/core/types/ui';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/auth/auth-provider';
import { Logo } from '@/components/brand/logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useDashboard } from '@/features/dashboard/data/use-dashboard';
import { useGitHubStatus } from '@/features/github/data/use-github';
import { startGitHubFlow, type GitHubFlow } from '@/features/github/domain/connect';
import { cn } from '@/core/lib/cn';

export default function OnboardingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const github = useGitHubStatus();
  const dashboard = useDashboard();
  const [connecting, setConnecting] = useState<GitHubFlow | null>(null);

  if (!user) return null;

  const status = github.data;
  const hasGroups = (dashboard.data?.groups.length ?? 0) > 0;
  const connected = Boolean(status?.connected);
  const installed = (status?.installationCount ?? 0) > 0;
  const appConfigured = status?.appConfigured ?? true;

  const connect = async (flow: GitHubFlow) => {
    setConnecting(flow);
    await startGitHubFlow(flow, '/onboarding');
    setConnecting(null);
  };

  const stepTwoDone = hasGroups;
  const completed = connected && stepTwoDone;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-bg">
      <div className="ds-grid-bg ds-radial pointer-events-none absolute inset-0" aria-hidden />

      <header className="relative z-10">
        <div className="ds-container flex h-16 items-center justify-between">
          <Link to="/" aria-label="DevStreak — início">
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void logout().then(() => navigate('/login'));
              }}
            >
              <LogOut aria-hidden />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="ds-container relative z-10 flex justify-center py-8 sm:py-14">
        <div className="w-full max-w-2xl">
          <div className="mb-7 text-center">
            <Badge variant="volt" className="mb-4">
              <Sparkles className="size-3" aria-hidden />
              {completed ? 'tudo pronto' : 'configuração inicial'}
            </Badge>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              {completed ? `Bora, ${user.displayName.split(' ')[0]}.` : `Bem-vindo, ${user.displayName.split(' ')[0]}.`}
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted">
              {completed
                ? 'Sua conta já pode verificar commits e competir em grupos privados. Falta só convidar quem vai te cobrar.'
                : 'Três passos para transformar commits em constância verificável. Você pode pular e configurar depois.'}
            </p>
          </div>

          <div className="ds-card divide-y divide-line overflow-hidden">
            <StepRow
              number="01"
              title="Conectar o GitHub"
              description="Permissão somente de leitura para identificar seus commits. Sem acesso de escrita e sem expor código."
              done={connected}
              icon={Github}
            >
              {connected ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="volt">
                    <Check className="size-3" aria-hidden />
                    @{status?.githubUsername ?? user.githubUsername}
                  </Badge>
                  <span className="font-mono text-[10px] text-faint">
                    {status?.repositoryCount ?? 0} repositórios acessíveis
                    {status?.installationCount ? ` · ${status.installationCount} instalação(ões)` : ''}
                  </span>
                  {!installed ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void connect('install')}
                      loading={connecting === 'install'}
                    >
                      Instalar nos repositórios
                    </Button>
                  ) : null}
                </div>
              ) : !appConfigured ? (
                <div className="space-y-2">
                  <p className="rounded-lg border border-line bg-card-2 p-2.5 text-[11px] leading-relaxed text-muted">
                    A GitHub App ainda não está configurada neste ambiente. Você pode continuar e conectar depois —
                    dias sem verificação não contam como descumprimento.
                  </p>
                  <Button asChild size="sm" variant="secondary">
                    <Link to="/app/settings/integrations">Ver integração</Link>
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => void connect('authorize')}
                  loading={connecting === 'authorize'}
                >
                  <Github aria-hidden />
                  Conectar GitHub
                  <ArrowRight aria-hidden />
                </Button>
              )}
            </StepRow>

            <StepRow
              number="02"
              title="Criar seu primeiro desafio"
              description="Defina a meta de dias válidos, a modalidade e convide o grupo por link privado."
              done={stepTwoDone}
              icon={Rocket}
            >
              {stepTwoDone ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="volt">
                    <Check className="size-3" aria-hidden />
                    {dashboard.data?.groups.length} {dashboard.data?.groups.length === 1 ? 'grupo' : 'grupos'}
                  </Badge>
                  <Button size="sm" variant="secondary" onClick={() => navigate('/app')}>
                    Ir para o dashboard
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => navigate('/app/groups/new')}>
                  Montar desafio
                  <ArrowRight aria-hidden />
                </Button>
              )}
            </StepRow>

            <StepRow
              number="03"
              title="Convidar o grupo"
              description="Compartilhe um link privado com prazo e limite de usos. Todos seguem as mesmas regras."
              done={false}
              icon={Users}
            >
              <p className="text-[11px] leading-relaxed text-muted">
                Você faz isso dentro do grupo, depois de criá-lo. O link completo só aparece na criação do convite.
              </p>
            </StepRow>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="flex items-center gap-1.5 text-[11px] text-faint">
              <ShieldCheck className="size-3.5 text-accent" aria-hidden />
              Tokens ficam cifrados no backend e nunca chegam ao navegador.
            </p>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button variant="ghost" full onClick={() => navigate('/app')}>
                Pular por agora
              </Button>
              <Button full className="whitespace-nowrap" onClick={() => navigate(hasGroups ? '/app' : '/app/groups/new')}>
                {hasGroups ? 'Continuar' : 'Criar desafio'}
                <ArrowRight aria-hidden />
              </Button>
            </div>
          </div>

          {github.isLoading ? (
            <div className="mt-4 flex justify-center">
              <Spinner label="Verificando integração…" />
            </div>
          ) : null}

          {status?.message && !connected ? (
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
              {status.message}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function StepRow({
  number,
  title,
  description,
  done,
  icon: Icon,
  children,
}: {
  number: string;
  title: string;
  description: string;
  done: boolean;
  icon: IconComponent;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 p-4 sm:p-5">
      <span
        className={cn(
          'mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl border font-mono text-[11px]',
          done ? 'border-volt-line bg-volt-soft text-accent' : 'border-line bg-card-2 text-faint',
        )}
      >
        {done ? <Check className="size-4" aria-hidden /> : number}
      </span>
      <div className="min-w-0 flex-1 space-y-2.5">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Icon className="size-3.5 text-muted" aria-hidden />
            {title}
            {done ? <span className="sr-only">concluído</span> : null}
          </h2>
          <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
