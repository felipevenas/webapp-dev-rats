import { Github } from '@/components/brand/github-icon';
import { Logo } from '@/components/brand/logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/controls';
import { ErrorState } from '@/components/ui/error-state';
import { Field, Input, Textarea } from '@/components/ui/input';
import { SelectableChips } from '@/components/ui/selectable-chips';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/core/auth/auth-provider';
import { toAppError } from '@/core/http/problem';
import { cn } from '@/core/lib/cn';
import type { ExperienceLevel, GitHubStatus, TechStack } from '@/core/types/api';
import type { IconComponent } from '@/core/types/ui';
import { useDashboard } from '@/features/dashboard/data/use-dashboard';
import { useGitHubStatus } from '@/features/github/data/use-github';
import { startGitHubFlow, type GitHubFlow } from '@/features/github/domain/connect';
import { useUpdateProfile } from '@/features/profile/data/use-profile';
import {
  MAX_PRIMARY_STACK,
  experienceLevelOptions,
  isValidWebsiteUrl,
  safeExternalUrl,
  techStackOptions,
} from '@/features/profile/domain/profile-options';
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronRight,
  Flame,
  GitCommitHorizontal,
  Link2,
  LogOut,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

type StepId = 'welcome' | 'profile' | 'github' | 'challenge' | 'invite';

interface StepDefinition {
  id: StepId;
  title: string;
  heading: string;
  summary: string;
  hint: string;
  icon: IconComponent;
}

const STEPS: readonly StepDefinition[] = [
  {
    id: 'welcome',
    title: 'Boas-vindas',
    heading: 'Bem-vindo ao DevRats',
    summary: 'Três conceitos e você entende como a constância é medida por aqui.',
    hint: 'Como medimos constância',
    icon: Sparkles,
  },
  {
    id: 'profile',
    title: 'Perfil',
    heading: 'Agora, quem é você?',
    summary: 'Isso ajuda o grupo a te reconhecer. Tudo é opcional e pode ser editado depois.',
    hint: 'Bio, nível e stack',
    icon: UserRound,
  },
  {
    id: 'github',
    title: 'GitHub',
    heading: 'Conecte seu GitHub',
    summary: 'A verificação lê apenas metadados de commits. Nunca o conteúdo dos repositórios.',
    hint: 'Verificação de commits',
    icon: Github,
  },
  {
    id: 'challenge',
    title: 'Desafio',
    heading: 'Monte seu primeiro desafio',
    summary: 'Defina a meta de dias válidos, os repositórios permitidos e o grupo que vai te cobrar.',
    hint: 'Meta e repositórios',
    icon: Rocket,
  },
  {
    id: 'invite',
    title: 'Convite',
    heading: 'Chame o seu grupo',
    summary: 'O convite é privado: só entra quem receber o link, dentro do prazo e do limite de usos.',
    hint: 'Convite privado',
    icon: Users,
  },
];

const STEP_PARAM_ALIASES: Record<string, number> = {
  welcome: 0,
  'boas-vindas': 0,
  profile: 1,
  perfil: 1,
  github: 2,
  challenge: 3,
  desafio: 3,
  invite: 4,
  convite: 4,
};

function initialStepFromParam(value: string | null): number {
  if (!value) return 0;
  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= STEPS.length) return numeric - 1;
  return STEP_PARAM_ALIASES[value] ?? 0;
}

interface ProfileDraft {
  bio: string;
  location: string;
  websiteUrl: string;
  experienceLevel?: ExperienceLevel;
  primaryStack: TechStack[];
}

export default function OnboardingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const github = useGitHubStatus();
  const dashboard = useDashboard();
  const updateProfile = useUpdateProfile();

  const [currentStep, setCurrentStep] = useState(() => initialStepFromParam(searchParams.get('step')));

  useEffect(() => {
    const fromUrl = initialStepFromParam(searchParams.get('step'));
    setCurrentStep((current) => (current === fromUrl ? current : fromUrl));
  }, [searchParams]);
  const [connecting, setConnecting] = useState<GitHubFlow | null>(null);
  const [profile, setProfile] = useState<ProfileDraft>(() => ({
    bio: user?.bio ?? '',
    location: user?.location ?? '',
    websiteUrl: user?.websiteUrl ?? '',
    experienceLevel: user?.experienceLevel ?? undefined,
    primaryStack: user?.primaryStack ?? [],
  }));
  const [profileError, setProfileError] = useState<string | null>(null);
  const stepTopRef = useRef<HTMLElement>(null);
  const hasMounted = useRef(false);

  //---- Skip the first render, then move focus to the top of the step the user just reached.
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    stepTopRef.current?.focus();
  }, [currentStep]);

  if (!user) return null;

  const step = STEPS[currentStep];
  const firstName = user.displayName.split(' ')[0] || user.username;
  const hasGroups = (dashboard.data?.groups.length ?? 0) > 0;
  const groupCount = dashboard.data?.groups.length ?? 0;

  const completedSteps = new Set<number>();
  if (user.bio || user.location || user.websiteUrl || user.experienceLevel || (user.primaryStack?.length ?? 0) > 0) {
    completedSteps.add(1);
  }
  if (github.data?.connected) completedSteps.add(2);
  if (hasGroups) completedSteps.add(3);

  const goToStep = (index: number) => {
    //---- Only previous steps are clickable; forward navigation happens through the CTAs.
    if (index < 0 || index >= STEPS.length || index > currentStep) return;
    setCurrentStep(index);
    setSearchParams({ step: STEPS[index].id });
  };

  const advance = () => {
    const next = Math.min(currentStep + 1, STEPS.length - 1);
    setCurrentStep(next);
    setSearchParams({ step: STEPS[next].id });
  };

  const skipSetup = () => navigate('/app');

  const savingProfile = updateProfile.isPending;

  const skipStep = () => {
    if (currentStep === STEPS.length - 1) {
      navigate('/app');
      return;
    }
    advance();
  };

  const saveProfile = async () => {
    setProfileError(null);
    if (!isValidWebsiteUrl(profile.websiteUrl)) {
      setProfileError('Informe uma URL http(s) válida para o site.');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        bio: profile.bio.trim(),
        location: profile.location.trim(),
        websiteUrl: safeExternalUrl(profile.websiteUrl) ?? '',
        experienceLevel: profile.experienceLevel ?? null,
        clearExperienceLevel: profile.experienceLevel === undefined,
        primaryStack: profile.primaryStack,
      });
      toast.success('Perfil salvo. Bora verificar seus commits.');
      advance();
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  const connectGitHub = async (flow: GitHubFlow) => {
    setConnecting(flow);
    try {
      await startGitHubFlow(flow, '/onboarding?step=github');
    } finally {
      setConnecting(null);
    }
  };

  const handlePrimaryAction = () => {
    switch (step.id) {
      case 'welcome':
        advance();
        break;
      case 'profile':
        void saveProfile();
        break;
      case 'github':
        advance();
        break;
      case 'challenge':
        if (hasGroups) advance();
        else navigate('/app/groups/new');
        break;
      case 'invite':
        navigate('/app');
        break;
    }
  };

  const primaryLabel = (() => {
    switch (step.id) {
      case 'welcome':
        return 'Entendi, vamos lá';
      case 'profile':
        return 'Salvar e continuar';
      case 'github':
        return 'Continuar';
      case 'challenge':
        return hasGroups ? 'Continuar' : 'Criar meu primeiro desafio';
      case 'invite':
        return 'Ir para o dashboard';
    }
  })();

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-bg">
      <div className="ds-grid-bg ds-radial pointer-events-none absolute inset-0 opacity-80" aria-hidden />

      <header className="relative z-20 border-b border-line bg-bg/85 backdrop-blur">
        <div className="ds-container flex h-16 items-center justify-between gap-3">
          <Link to="/" aria-label="DevRats - início" className="ds-focus-ring rounded-lg">
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={skipSetup} disabled={savingProfile} aria-label="Pular configuração">
              <span className="sm:hidden">Pular</span>
              <span className="hidden sm:inline">Pular configuração</span>
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              aria-label="Sair"
              onClick={() => {
                void logout().then(() => navigate('/login'));
              }}
            >
              <LogOut aria-hidden />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <div className="ds-container flex flex-col gap-5 py-5 sm:py-8 lg:flex-row lg:items-start lg:gap-8">
          <WizardRail currentStep={currentStep} completedSteps={completedSteps} onSelect={goToStep} />

          <div className="min-w-0 flex-1">
            <MobileProgress currentStep={currentStep} completedSteps={completedSteps} onSelect={goToStep} />

            <p className="sr-only" aria-live="polite" aria-atomic="true">
              Passo {currentStep + 1} de {STEPS.length}: {step.title}
            </p>

            <section
              ref={stepTopRef}
              tabIndex={-1}
              aria-labelledby="onboarding-step-title"
              className="ds-card mt-4 overflow-hidden outline-none lg:mt-0"
            >
              <div className="relative border-b border-line bg-card-2/40 p-5 sm:p-6">
                <div className="ds-grid-bg-sm pointer-events-none absolute inset-0 opacity-40" aria-hidden />
                <div className="relative">
                  <p className="ds-label">
                    Passo {currentStep + 1} de {STEPS.length}
                  </p>
                  <div className="mt-2 flex items-start gap-3">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-volt-line bg-volt-soft text-accent">
                      <step.icon className="size-4.5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h1
                        id="onboarding-step-title"
                        className="text-xl font-semibold leading-tight tracking-[-0.035em] sm:text-2xl"
                      >
                        {step.heading}
                      </h1>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{step.summary}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {step.id === 'welcome' ? <WelcomeStep firstName={firstName} /> : null}

                {step.id === 'profile' ? (
                  <ProfileStep
                    profile={profile}
                    websiteError={profileError}
                    onChange={(patch) => {
                      if (patch.websiteUrl !== undefined) setProfileError(null);
                      setProfile((current) => ({ ...current, ...patch }));
                    }}
                  />
                ) : null}

                {step.id === 'github' ? (
                  <GitHubStep
                    status={github.data}
                    isLoading={github.isLoading}
                    isError={github.isError}
                    error={github.error}
                    connecting={connecting}
                    onRetry={() => void github.refetch()}
                    onConnect={(flow) => void connectGitHub(flow)}
                  />
                ) : null}

                {step.id === 'challenge' ? (
                  <ChallengeStep
                    hasGroups={hasGroups}
                    groupCount={groupCount}
                    isLoading={dashboard.isLoading}
                    isError={dashboard.isError}
                    error={dashboard.error}
                    onRetry={() => void dashboard.refetch()}
                  />
                ) : null}

                {step.id === 'invite' ? <InviteStep /> : null}
              </div>
            </section>

            <footer className="ds-safe-bottom sticky bottom-0 z-20 mt-5 -mx-4 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-0 sm:rounded-2xl sm:border sm:px-4">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToStep(currentStep - 1)}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft aria-hidden />
                    Voltar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={skipStep} disabled={savingProfile}>
                    Pular
                  </Button>
                </div>
                <div className="sm:ml-auto">
                  <Button
                    full
                    className="sm:w-auto"
                    onClick={handlePrimaryAction}
                    loading={step.id === 'profile' && updateProfile.isPending}
                    disabled={savingProfile || (step.id === 'challenge' && dashboard.isLoading)}
                  >
                    {step.id === 'challenge' && !hasGroups ? <Rocket aria-hidden /> : null}
                    {primaryLabel}
                    {step.id === 'challenge' && !hasGroups ? null : <ArrowRight aria-hidden />}
                  </Button>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}

function WizardRail({
  currentStep,
  completedSteps,
  onSelect,
}: {
  currentStep: number;
  completedSteps: Set<number>;
  onSelect: (index: number) => void;
}) {
  const percent = Math.round(((currentStep + 1) / STEPS.length) * 100);

  return (
    <aside className="hidden w-[272px] shrink-0 lg:block" aria-label="Progresso do onboarding">
      <div className="sticky top-6 space-y-4">
        <div className="ds-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="ds-label">Configuração inicial</p>
            <span className="font-mono text-[11px] text-muted">
              {currentStep + 1}/{STEPS.length}
            </span>
          </div>
          <div
            className="mt-3 h-1 overflow-hidden rounded-full bg-card-2"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-valuenow={currentStep + 1}
            aria-label="Progresso do onboarding"
          >
            <div
              className="h-full rounded-full bg-volt transition-[width] duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>

          <ol className="mt-4 space-y-0.5">
            {STEPS.map((item, index) => {
              const active = index === currentStep;
              const done = completedSteps.has(index);
              const available = index <= currentStep;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(index)}
                    disabled={!available}
                    aria-current={active ? 'step' : undefined}
                    aria-label={`Passo ${index + 1}: ${item.title}${done ? ' - concluído' : ''}`}
                    className={cn(
                      'ds-focus-ring flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors',
                      active ? 'bg-volt-soft' : available ? 'hover:bg-card-2' : 'opacity-45',
                      !available && 'cursor-not-allowed',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex size-6 shrink-0 items-center justify-center rounded-lg border font-mono text-[10px]',
                        active || done
                          ? 'border-volt-line bg-volt text-volt-ink'
                          : 'border-line bg-card-2 text-faint',
                      )}
                    >
                      {done ? <Check className="size-3" aria-hidden /> : String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block truncate text-[12px] font-medium',
                          active ? 'text-accent' : 'text-fg',
                        )}
                      >
                        {item.title}
                      </span>
                      <span className="block truncate text-[10px] text-faint">{item.hint}</span>
                    </span>
                    {active ? <ChevronRight className="size-3 shrink-0 text-accent" aria-hidden /> : null}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="ds-inset p-3.5">
          <p className="flex gap-2 text-[11px] leading-relaxed text-muted">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
            Nada aqui bloqueia o acesso ao app. Você pode pular e configurar depois em Ajustes.
          </p>
        </div>
      </div>
    </aside>
  );
}

function MobileProgress({
  currentStep,
  completedSteps,
  onSelect,
}: {
  currentStep: number;
  completedSteps: Set<number>;
  onSelect: (index: number) => void;
}) {
  const percent = Math.round(((currentStep + 1) / STEPS.length) * 100);

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between gap-2">
        <p className="ds-label">Configuração inicial</p>
        <p className="font-mono text-[11px] text-muted">
          Passo {currentStep + 1} de {STEPS.length}
        </p>
      </div>
      <div
        className="mt-2 h-1 overflow-hidden rounded-full bg-card-2"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={currentStep + 1}
        aria-label="Progresso do onboarding"
      >
        <div className="h-full rounded-full bg-volt transition-[width] duration-300" style={{ width: `${percent}%` }} />
      </div>
      <ol className="mt-3 flex items-center gap-1.5" aria-label="Passos do onboarding">
        {STEPS.map((item, index) => {
          const active = index === currentStep;
          const done = completedSteps.has(index);
          const available = index <= currentStep;

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                disabled={!available}
                aria-current={active ? 'step' : undefined}
                aria-label={`Passo ${index + 1}: ${item.title}${done ? ' - concluído' : ''}`}
                className={cn(
                  'ds-focus-ring inline-flex size-8 items-center justify-center rounded-lg border font-mono text-[11px] transition-colors',
                  active || done
                    ? 'border-volt-line bg-volt text-volt-ink'
                    : 'border-line bg-card-2 text-faint',
                  !available && 'cursor-not-allowed opacity-45',
                )}
              >
                {done ? <Check className="size-3.5" aria-hidden /> : String(index + 1).padStart(2, '0')}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function WelcomeStep({ firstName }: { firstName: string }) {
  return (
    <div className="space-y-4">
      <p className="text-[12px] leading-relaxed text-muted">
        Bora, <strong className="text-fg">{firstName}</strong>. Em menos de dois minutos você configura o essencial -
        e pode parar quando quiser.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <ConceptCard
          icon={GitCommitHorizontal}
          title="Commit elegível"
          description="Um commit seu, dentro do período do desafio, em um repositório permitido pelo grupo. Só metadados: nunca o código."
        />
        <ConceptCard
          icon={CalendarCheck}
          title="Dia válido"
          description="Pelo menos um commit elegível no dia. Vários commits na mesma data continuam valendo um único dia."
        />
        <ConceptCard
          icon={Flame}
          title="Streak e grupo"
          description="Dias consecutivos formam sua sequência. O grupo acompanha o ranking e cobra presença de verdade."
        />
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-line bg-card-2 p-3">
        <CalendarDays className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden />
        <p className="text-[11px] leading-relaxed text-muted">
          Todo dia válido é calculado no <strong className="text-fg">horário de Brasília (GMT-3)</strong>, para o grupo
          inteiro jogar com a mesma régua.
        </p>
      </div>
    </div>
  );
}

function ConceptCard({
  icon: Icon,
  title,
  description,
}: {
  icon: IconComponent;
  title: string;
  description: string;
}) {
  return (
    <div className="ds-inset p-3.5">
      <span className="inline-flex size-8 items-center justify-center rounded-lg border border-volt-line bg-volt-soft text-accent">
        <Icon className="size-4" aria-hidden />
      </span>
      <p className="mt-2.5 text-[12.5px] font-semibold text-fg">{title}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted">{description}</p>
    </div>
  );
}

function ProfileStep({
  profile,
  websiteError,
  onChange,
}: {
  profile: ProfileDraft;
  websiteError: string | null;
  onChange: (patch: Partial<ProfileDraft>) => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Bio" htmlFor="onboarding-bio" optional hint={`${profile.bio.length}/280`}>
        <Textarea
          id="onboarding-bio"
          rows={3}
          maxLength={280}
          value={profile.bio}
          placeholder="Conte em uma linha o que você constrói."
          onChange={(event) => onChange({ bio: event.target.value })}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Localização" htmlFor="onboarding-location" optional>
          <Input
            id="onboarding-location"
            autoComplete="address-level2"
            maxLength={120}
            value={profile.location}
            placeholder="São Paulo, Brasil"
            onChange={(event) => onChange({ location: event.target.value })}
          />
        </Field>
        <Field label="Site ou portfólio" htmlFor="onboarding-website" optional error={websiteError ?? undefined}>
          <Input
            id="onboarding-website"
            type="url"
            inputMode="url"
            maxLength={300}
            value={profile.websiteUrl}
            placeholder="https://seusite.dev"
            aria-invalid={Boolean(websiteError)}
            onChange={(event) => onChange({ websiteUrl: event.target.value })}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nível de experiência" htmlFor="onboarding-level" optional>
          <Select
            id="onboarding-level"
            value={profile.experienceLevel ?? ''}
            onChange={(event) =>
              onChange({
                experienceLevel: (event.target.value || undefined) as ExperienceLevel | undefined,
              })
            }
          >
            <option value="">Não informar</option>
            {experienceLevelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Stack principal" optional hint={`${profile.primaryStack.length}/${MAX_PRIMARY_STACK}`}>
          <SelectableChips
            ariaLabel="Stack principal"
            options={techStackOptions}
            selected={profile.primaryStack}
            onChange={(next) => onChange({ primaryStack: next })}
            max={MAX_PRIMARY_STACK}
          />
        </Field>
      </div>

      <p className="text-[11px] leading-relaxed text-faint">
        Selecione até {MAX_PRIMARY_STACK} tecnologias que você usa no dia a dia. Dá para mudar isso no seu perfil.
      </p>
    </div>
  );
}

function GitHubStep({
  status,
  isLoading,
  isError,
  error,
  connecting,
  onRetry,
  onConnect,
}: {
  status?: GitHubStatus;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  connecting: GitHubFlow | null;
  onRetry: () => void;
  onConnect: (flow: GitHubFlow) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  if (isError) return <ErrorState error={error} compact onRetry={onRetry} />;

  const connected = Boolean(status?.connected);
  const installed = (status?.installationCount ?? 0) > 0;
  const appConfigured = status?.appConfigured ?? true;

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {[
          'Somente leitura: metadados de commits, lista de repositórios e sua conta.',
          'Sem permissão de escrita e sem código-fonte chegando ao navegador.',
          'Tokens ficam cifrados no backend e podem ser revogados quando você quiser.',
        ].map((item) => (
          <li key={item} className="flex gap-2 text-[12px] leading-relaxed text-muted">
            <Check className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
            {item}
          </li>
        ))}
      </ul>

      {!appConfigured ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber/30 bg-amber-soft p-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-fg">GitHub App não configurada neste ambiente</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
              Você pode continuar sem conectar. A verificação fica pausada e nenhum dia é tratado como
              descumprimento.
            </p>
          </div>
        </div>
      ) : null}

      {connected ? (
        <div className="rounded-xl border border-volt-line bg-volt-soft/60 p-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="volt">
              <Check className="size-3" aria-hidden />
              @{status?.githubUsername ?? 'conta autorizada'}
            </Badge>
            <span className="font-mono text-[10px] text-muted">
              {status?.repositoryCount ?? 0} repositórios acessíveis
            </span>
          </div>

          {installed ? (
            <>
              <p className="mt-2 text-[11px] leading-relaxed text-muted">
                A GitHub App está instalada em {status?.installationCount} instalação(ões). A verificação automática
                já pode rodar.
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="mt-2"
                onClick={() => onConnect('install')}
                loading={connecting === 'install'}
              >
                <Link2 aria-hidden />
                Gerenciar instalação
              </Button>
            </>
          ) : (
            <div className="mt-3 space-y-2">
              <p className="text-[11px] leading-relaxed text-muted">
                A conta está autorizada, mas a App ainda não foi instalada em nenhum repositório. Sem isso, não há
                commits para verificar.
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onConnect('install')}
                loading={connecting === 'install'}
                disabled={!appConfigured}
              >
                <Link2 aria-hidden />
                Instalar App nos repositórios
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-card-2/60 p-3.5">
          <p className="text-[12px] leading-relaxed text-muted">
            Nenhuma conta conectada ainda. Autorize a conta e, no passo seguinte, instale a App nos repositórios do
            grupo.
          </p>
          <Button
            size="sm"
            className="mt-3"
            onClick={() => onConnect('authorize')}
            loading={connecting === 'authorize'}
            disabled={!appConfigured}
          >
            <Github aria-hidden />
            Autorizar conta GitHub
            <ArrowRight aria-hidden />
          </Button>
        </div>
      )}

      {status?.message && !connected ? (
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">{status.message}</p>
      ) : null}
    </div>
  );
}

function ChallengeStep({
  hasGroups,
  groupCount,
  isLoading,
  isError,
  error,
  onRetry,
}: {
  hasGroups: boolean;
  groupCount: number;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (isError) return <ErrorState error={error} compact onRetry={onRetry} />;

  if (hasGroups) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-volt-line bg-volt-soft/60 p-3.5">
          <Badge variant="volt">
            <Check className="size-3" aria-hidden />
            {groupCount} {groupCount === 1 ? 'grupo ativo' : 'grupos ativos'}
          </Badge>
          <p className="text-[11px] leading-relaxed text-muted">
            Você já tem um desafio em andamento. Pode continuar para o convite ou abrir o dashboard.
          </p>
        </div>

        <ul className="space-y-2">
          {[
            'Defina a meta de dias válidos e a modalidade de verificação.',
            'Escolha os repositórios permitidos - ou valide apenas os seus.',
            'Compartilhe o link privado com quem vai competir junto.',
          ].map((item) => (
            <li key={item} className="flex gap-2 text-[12px] leading-relaxed text-muted">
              <Check className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[12px] leading-relaxed text-muted">
        Um desafio é a regra do jogo: quantos dias válidos até a meta, quais repositórios contam e quem participa. Você
        cria em um formulário guiado - não precisa configurar tudo agora.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <ConceptCard
          icon={CalendarCheck}
          title="Meta"
          description="Escolha quantos dias válidos até a conclusão e o período do desafio."
        />
        <ConceptCard
          icon={ShieldCheck}
          title="Verificação"
          description="Repositórios selecionados pelo grupo ou apenas os seus repositórios."
        />
        <ConceptCard
          icon={Users}
          title="Grupo"
          description="Cada pessoa entra por convite e acompanha o próprio progresso."
        />
      </div>

      <div className="rounded-xl border border-dashed border-line-strong bg-card-2/40 p-3">
        <p className="text-[11px] leading-relaxed text-muted">
          Ao criar, você vira o dono do grupo e pode convidar todo mundo logo em seguida. O botão abaixo abre o
          formulário completo.
        </p>
      </div>
    </div>
  );
}

function InviteStep() {
  return (
    <div className="space-y-4">
      <p className="text-[12px] leading-relaxed text-muted">
        Depois de criar o desafio, compartilhe um convite privado. Quem receber o link entra no grupo, vê as regras e
        começa a valer os próprios commits - sem cadastro público.
      </p>

      <div className="rounded-xl border border-dashed border-line-strong bg-card-2/50 p-4">
        <p className="ds-label">convite privado</p>
        <p className="mt-1.5 break-all font-mono text-[12px] text-muted">devrats.app/invites/••••••••</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <Badge variant="outline">expira em 7 dias</Badge>
          <Badge variant="outline">limite de usos</Badge>
          <Badge variant="outline">revogável</Badge>
        </div>
      </div>

      <ul className="space-y-2">
        {[
          'Só entra quem receber o link - não existe busca pública de grupos.',
          'Você define prazo e limite de usos, e pode revogar quando quiser.',
          'Quem entrar segue as mesmas regras de dia válido e horário de Brasília.',
        ].map((item) => (
          <li key={item} className="flex gap-2 text-[12px] leading-relaxed text-muted">
            <Check className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
            {item}
          </li>
        ))}
      </ul>

      <p className="flex gap-2 rounded-xl border border-line bg-card-2 p-3 text-[11px] leading-relaxed text-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
        O link completo só aparece na criação do convite, dentro da página do grupo.
      </p>
    </div>
  );
}
