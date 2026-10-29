import { Github } from '@/components/brand/github-icon';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Flame,
  Globe2,
  Info,
  Layers,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/core/auth/auth-provider';
import { toAppError } from '@/core/http/problem';
import {
  capitalize,
  formatDateTime,
  formatFullDate,
  listTimeZones,
  timeZoneLabel,
} from '@/core/lib/date';
import { cn } from '@/core/lib/cn';
import type { GitHubRepository } from '@/core/types/api';
import type { IconComponent } from '@/core/types/ui';
import { Page, PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/controls';
import { Field, Input, Textarea } from '@/components/ui/input';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Segmented } from '@/components/ui/segmented';
import { useCreateGroup } from '@/features/groups/data/use-groups';
import { challengesApi } from '@/features/challenges/data/challenges-api';
import { useGitHubStatus } from '@/features/github/data/use-github';
import { verificationModeCopy } from '@/features/challenges/domain/challenge-status';
import { RepositoryPicker } from '@/features/challenges/ui/repository-picker';
import {
  createChallengeSchema,
  defaultStartLocal,
  endOfDayLocal,
  type CreateChallengeValues,
} from '@/features/challenges/schemas/create-challenge-schema';

const timeZones = listTimeZones();
const targetPresets = [7, 14, 21, 30, 60, 90];

type StepId = 'group' | 'rules' | 'window' | 'repos' | 'review';

interface Step {
  id: StepId;
  label: string;
}

function todayInput(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function dateInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function admissionDefault(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return dateInput(date);
}

export default function CreateChallengePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createGroup = useCreateGroup();
  const github = useGitHubStatus();
  const [selectedRepositories, setSelectedRepositories] = useState<GitHubRepository[]>([]);
  const [stepId, setStepId] = useState<StepId>('group');
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateChallengeValues>({
    resolver: zodResolver(createChallengeSchema),
    defaultValues: {
      name: '',
      description: '',
      timezone: user?.timezone ?? 'America/Sao_Paulo',
      maxMembers: 10,
      verificationMode: 'OWN_REPOSITORIES',
      targetValidDays: 30,
      startMode: 'now',
      startAtLocal: defaultStartLocal(),
      endsAtDate: '',
      admissionEndsAtDate: admissionDefault(),
      repositoryIds: [],
    },
  });

  const verificationMode = form.watch('verificationMode');
  const targetValidDays = form.watch('targetValidDays');
  const startMode = form.watch('startMode');
  const startAtLocal = form.watch('startAtLocal');
  const name = form.watch('name');
  const endsAtDate = form.watch('endsAtDate');
  const admissionEndsAtDate = form.watch('admissionEndsAtDate');
  const timezone = form.watch('timezone');

  const steps = useMemo<Step[]>(() => {
    const base: Step[] = [
      { id: 'group', label: 'Grupo' },
      { id: 'rules', label: 'Regras' },
      { id: 'window', label: 'Janela' },
    ];
    if (verificationMode === 'SELECTED_REPOSITORIES') base.push({ id: 'repos', label: 'Repositórios' });
    base.push({ id: 'review', label: 'Revisão' });
    return base;
  }, [verificationMode]);

  const currentIndex = Math.max(0, steps.findIndex((step) => step.id === stepId));
  const isReview = stepId === 'review';

  useEffect(() => {
    if (!steps.some((step) => step.id === stepId)) {
      setStepId(steps[steps.length - 1]?.id ?? 'review');
    }
  }, [steps, stepId]);

  //---- Keep the admission window after the start whenever the start date changes.
  useEffect(() => {
    const start = startMode === 'now' ? new Date() : new Date(startAtLocal || '');
    if (Number.isNaN(start.getTime())) return;
    const current = form.getValues('admissionEndsAtDate');
    if (!current) return;
    if (new Date(`${current}T23:59:59`).getTime() < start.getTime()) {
      const next = new Date(start);
      next.setDate(next.getDate() + 7);
      form.setValue('admissionEndsAtDate', dateInput(next));
    }
  }, [startMode, startAtLocal, form]);

  const goBack = () => {
    setServerError(null);
    const previous = steps[currentIndex - 1];
    if (previous) setStepId(previous.id);
  };

  const goNext = async () => {
    setServerError(null);
    const fieldsByStep: Record<StepId, Array<keyof CreateChallengeValues>> = {
      group: ['name', 'description', 'timezone', 'maxMembers'],
      rules: ['verificationMode', 'targetValidDays'],
      window: ['startMode', 'startAtLocal', 'endsAtDate', 'admissionEndsAtDate'],
      repos: ['repositoryIds'],
      review: [],
    };
    const valid = await form.trigger(fieldsByStep[stepId]);
    if (!valid) return;
    const next = steps[currentIndex + 1];
    if (next) {
      setStepId(next.id);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const handleRepositories = (repositories: GitHubRepository[]) => {
    setSelectedRepositories(repositories);
    form.setValue(
      'repositoryIds',
      repositories.map((repository) => repository.id),
      { shouldValidate: form.formState.isSubmitted },
    );
  };

  const switchToOwnMode = () => {
    form.setValue('verificationMode', 'OWN_REPOSITORIES');
    form.setValue('repositoryIds', []);
    setSelectedRepositories([]);
  };

  const submitValues = async (values: CreateChallengeValues) => {
    setServerError(null);
    try {
      const startsAt =
        values.startMode === 'now'
          ? new Date().toISOString()
          : new Date(values.startAtLocal as string).toISOString();
      const group = await createGroup.mutateAsync({
        name: values.name,
        description: values.description?.trim() ? values.description.trim() : undefined,
        timezone: values.timezone,
        maxMembers: values.maxMembers,
        challenge: {
          verificationMode: values.verificationMode,
          targetValidDays: values.targetValidDays,
          startsAt,
          endsAt: values.endsAtDate ? endOfDayLocal(values.endsAtDate) : undefined,
          admissionEndsAt: values.admissionEndsAtDate ? endOfDayLocal(values.admissionEndsAtDate) : undefined,
          repositoryIds:
            values.verificationMode === 'SELECTED_REPOSITORIES' ? values.repositoryIds : undefined,
        },
      });
      if (values.startMode === 'now' && group.currentChallenge) {
        try {
          await challengesApi.start(group.currentChallenge.id);
          toast.success('Desafio criado e iniciado. Convide o grupo; a admissão segue até a data configurada.');
        } catch {
          toast.success('Desafio criado. Inicie-o na página do grupo.');
        }
      } else {
        toast.success('Desafio criado. Convide o grupo; o início é automático na data agendada.');
      }
      navigate(`/app/groups/${group.id}`, { replace: true });
    } catch (error) {
      const appError = toAppError(error);
      setServerError(appError.detail);
      toast.error(appError.detail);
      if (appError.fieldErrors.length > 0) {
        appError.fieldErrors.forEach((field) => {
          const key = field.field as keyof CreateChallengeValues;
          if (key in values) form.setError(key, { message: field.message });
        });
      }
    }
  };

  const onSubmit = form.handleSubmit(submitValues);

  return (
    <Page>
      <div>
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Voltar ao dashboard
        </Link>
      </div>

      <PageHeader
        eyebrow="Novo desafio"
        title="Monte o grupo e defina as regras"
        description="Defina as regras, escolha a modalidade e decida quando o desafio começa."
        actions={
          <Badge variant="outline">
            <Lock className="size-3" aria-hidden />
            regras travam após o início
          </Badge>
        }
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (isReview) void onSubmit(event);
            else void goNext();
          }}
          noValidate
          className="ds-card overflow-hidden"
        >
          <div className="border-b border-line px-5 py-4">
            <div className="flex items-center justify-between lg:hidden">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                Passo {currentIndex + 1} de {steps.length}
              </p>
              <p className="text-[12px] font-medium text-fg">{steps[currentIndex]?.label}</p>
            </div>
            <ol className="hidden items-center gap-1 lg:flex" aria-label="Etapas do formulário">
              {steps.map((step, index) => {
                const done = index < currentIndex;
                const active = step.id === stepId;
                return (
                  <li key={step.id} className="flex flex-1 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (index <= currentIndex) setStepId(step.id);
                      }}
                      disabled={index > currentIndex}
                      className={cn(
                        'flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] transition-colors',
                        active ? 'text-fg' : done ? 'text-muted hover:text-fg' : 'text-faint',
                        index > currentIndex && 'cursor-not-allowed',
                      )}
                      aria-current={active ? 'step' : undefined}
                    >
                      <span
                        className={cn(
                          'inline-flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[9px]',
                          active
                            ? 'border-volt bg-volt text-volt-ink'
                            : done
                              ? 'border-volt-line bg-volt-soft text-accent'
                              : 'border-line text-faint',
                        )}
                      >
                        {done ? <Check className="size-3" aria-hidden /> : index + 1}
                      </span>
                      <span className="truncate">{step.label}</span>
                    </button>
                    {index < steps.length - 1 ? <span className="h-px flex-1 bg-line" aria-hidden /> : null}
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="space-y-5 p-5">
            {stepId === 'group' ? <GroupStep form={form} /> : null}
            {stepId === 'rules' ? (
              <RulesStep form={form} githubConnected={Boolean(github.data?.connected)} />
            ) : null}
            {stepId === 'window' ? <WindowStep form={form} /> : null}
            {stepId === 'repos' ? (
              <ReposStep
                selected={selectedRepositories}
                onChange={handleRepositories}
                status={github.data}
                onSwitchToOwn={switchToOwnMode}
              />
            ) : null}
            {isReview ? (
              <ReviewStep
                values={form.getValues()}
                repositories={selectedRepositories}
                onEdit={setStepId}
              />
            ) : null}

            {serverError ? (
              <div className="flex items-start gap-2 rounded-xl border border-rose/30 bg-rose-soft p-3" role="alert">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose" aria-hidden />
                <p className="text-[12px] leading-relaxed text-rose">{serverError}</p>
              </div>
            ) : null}
          </div>

          <div className="ds-safe-bottom sticky bottom-0 z-10 flex flex-col-reverse gap-2 border-t border-line bg-surface/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="ghost" onClick={goBack} disabled={currentIndex === 0}>
              <ArrowLeft aria-hidden />
              Voltar
            </Button>
            {isReview ? (
              <Button type="submit" loading={createGroup.isPending}>
                <Sparkles aria-hidden />
                Criar desafio
              </Button>
            ) : (
              <Button type="submit">
                Continuar
                <ArrowRight aria-hidden />
              </Button>
            )}
          </div>
        </form>

        <aside className="sticky top-6 hidden space-y-3 xl:block">
          <div className="ds-card p-5">
            <p className="ds-label">Prévia do desafio</p>
            <div className="mt-4 flex items-center gap-4">
              <ProgressRing value={0} size={78} stroke={6} tone="volt" label="Nenhum dia válido ainda">
                <span className="font-mono text-lg leading-none text-fg">{targetValidDays}</span>
                <span className="font-mono text-[9px] text-faint">meta</span>
              </ProgressRing>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{name.trim() || 'Seu grupo'}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                  {verificationModeCopy(verificationMode).short}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                  <Users className="size-3" aria-hidden />
                  até {form.watch('maxMembers') || 10} participantes
                </p>
              </div>
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">Início</dt>
                <dd className="text-right font-mono text-fg">
                  {startMode === 'now' ? 'imediato' : startAtLocal ? startAtLocal.replace('T', ' ') : '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">Encerramento</dt>
                <dd className="text-right font-mono text-fg">
                  {endsAtDate ? formatFullDate(endsAtDate) : 'sem prazo'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">Admissão</dt>
                <dd className="text-right font-mono text-fg">
                  {admissionEndsAtDate ? formatFullDate(admissionEndsAtDate) : 'fecha no início'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">Fuso</dt>
                <dd className="truncate text-right font-mono text-fg">{timezone.replace('_', ' ')}</dd>
              </div>
              {verificationMode === 'SELECTED_REPOSITORIES' ? (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted">Repositórios</dt>
                  <dd className="text-right font-mono text-fg">{selectedRepositories.length}/3</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="rounded-xl border border-line bg-card/60 p-4">
            <p className="flex items-center gap-2 text-[12px] font-medium">
              <ShieldCheck className="size-3.5 text-accent" aria-hidden />
              Próximo passo
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              {startMode === 'now' ? (
                <>
                  O desafio começa ao criar. Depois, compartilhe o convite e acompanhe a admissão no grupo.
                </>
              ) : (
                <>
                  Depois de criar, compartilhe o convite e clique em <strong className="text-fg">Iniciar desafio</strong>{' '}
                  para antecipar, se quiser. As regras travam após o início.
                </>
              )}
            </p>
          </div>
        </aside>
      </div>
    </Page>
  );
}

type StepForm = ReturnType<typeof useForm<CreateChallengeValues>>;

function StepIntro({ title, description, icon: Icon }: { title: string; description: string; icon: IconComponent }) {
  return (
    <div className="flex gap-3">
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-line bg-card-2 text-accent">
        <Icon className="size-4" aria-hidden />
      </span>
      <div>
        <h2 className="text-[15px] font-semibold">{title}</h2>
        <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{description}</p>
      </div>
    </div>
  );
}

function GroupStep({ form }: { form: StepForm }) {
  return (
    <div className="space-y-5">
      <StepIntro
        icon={Users}
        title="Identidade do grupo"
        description="O nome aparece no ranking e nos convites. O fuso do desafio define quando cada dia começa e termina."
      />

      <Field label="Nome do grupo" htmlFor="name" error={form.formState.errors.name?.message}>
        <Input
          id="name"
          placeholder="Ex.: Rats Dev Challenge"
          maxLength={120}
          aria-invalid={Boolean(form.formState.errors.name)}
          {...form.register('name')}
        />
      </Field>

      <Field
        label="Descrição"
        htmlFor="description"
        optional
        error={form.formState.errors.description?.message}
        hint={`${form.watch('description')?.length ?? 0}/500`}
      >
        <Textarea
          id="description"
          placeholder="Qual é a proposta do grupo? Ex.: constância em projetos pessoais durante 30 dias."
          maxLength={500}
          rows={3}
          aria-invalid={Boolean(form.formState.errors.description)}
          {...form.register('description')}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Fuso do desafio"
          htmlFor="timezone"
          hint="fixo após criar"
          error={form.formState.errors.timezone?.message}
        >
          <Controller
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <Select id="timezone" value={field.value} onChange={field.onChange}>
                {timeZones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
            )}
          />
        </Field>

        <Field
          label="Limite de participantes"
          htmlFor="maxMembers"
          hint="2 a 200"
          error={form.formState.errors.maxMembers?.message}
        >
          <Input
            id="maxMembers"
            type="number"
            min={2}
            max={200}
            inputMode="numeric"
            aria-invalid={Boolean(form.formState.errors.maxMembers)}
            {...form.register('maxMembers', { valueAsNumber: true })}
          />
        </Field>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-line bg-card-2 p-3">
        <Globe2 className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden />
        <p className="text-[11px] leading-relaxed text-muted">
          Todos os participantes usam <strong className="text-fg">{timeZoneLabel(form.watch('timezone'))}</strong> para
          definir um dia válido. Não é possível alterar depois que o desafio iniciar.
        </p>
      </div>
    </div>
  );
}

function RulesStep({ form, githubConnected }: { form: StepForm; githubConnected: boolean }) {
  const mode = form.watch('verificationMode');
  const target = form.watch('targetValidDays');

  return (
    <div className="space-y-5">
      <StepIntro
        icon={Layers}
        title="Modalidade e meta"
        description="Escolha de onde vêm os commits válidos e quantos dias válidos levam à vitória."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <ModeCard
          active={mode === 'OWN_REPOSITORIES'}
          onClick={() => form.setValue('verificationMode', 'OWN_REPOSITORIES')}
          icon={Github}
          title="Repositórios próprios"
          description="Cada membro conta commits nos próprios projetos. Sem lista compartilhada."
          bullets={['Projetos pessoais e forks', 'Repositório de empresa não conta']}
          recommended
        />
        <ModeCard
          active={mode === 'SELECTED_REPOSITORIES'}
          onClick={() => form.setValue('verificationMode', 'SELECTED_REPOSITORIES')}
          icon={Target}
          title="Repositórios selecionados"
          description="O grupo define até três repositórios. Vale para todos, sem exceção."
          bullets={['Ideal para projeto coletivo', 'Lista trava após o início']}
        />
      </div>

      {mode === 'SELECTED_REPOSITORIES' && !githubConnected ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber/30 bg-amber-soft p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
          <p className="text-[11px] leading-relaxed text-muted">
            O modo de lista exige GitHub conectado para importar e validar os repositórios. Você pode conectar na
            próxima etapa ou voltar para repositórios próprios.
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-medium">Meta individual</span>
          <span className="font-mono text-[11px] text-faint">1 a 365 dias</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {targetPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => form.setValue('targetValidDays', preset, { shouldValidate: true })}
              aria-pressed={target === preset}
              className={cn(
                'ds-focus-ring rounded-lg border px-3 py-1.5 font-mono text-[12px] transition-colors',
                target === preset
                  ? 'border-volt-line bg-volt-soft text-accent'
                  : 'border-line bg-card-2 text-muted hover:border-line-strong hover:text-fg',
              )}
            >
              {preset}d
            </button>
          ))}
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={1}
              max={365}
              aria-label="Meta personalizada em dias"
              className="h-8 w-20 font-mono text-[12px]"
              {...form.register('targetValidDays', { valueAsNumber: true })}
            />
            <span className="text-[11px] text-faint">dias</span>
          </div>
        </div>
        {form.formState.errors.targetValidDays ? (
          <p className="text-xs text-rose" role="alert">
            {form.formState.errors.targetValidDays.message}
          </p>
        ) : null}
        <p className="flex items-center gap-1.5 text-[11px] text-muted">
          <Flame className="size-3.5 text-amber" aria-hidden />
          Aproximadamente {Math.max(1, Math.round(target / 7))} semanas de constância.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-card-2 p-3.5">
        <p className="flex items-center gap-1.5 text-[12px] font-medium">
          <Info className="size-3.5 text-cyan" aria-hidden />
          Meta não é sequência
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          A vitória é decidida pelos <strong className="text-fg">dias válidos acumulados</strong>. Perder um dia
          zera a sequência, mas não apaga o progresso. Vários commits no mesmo dia contam uma única vez.
        </p>
      </div>
    </div>
  );
}

function ModeCard({
  active,
  onClick,
  icon: Icon,
  title,
  description,
  bullets,
  recommended,
}: {
  active: boolean;
  onClick: () => void;
  icon: IconComponent;
  title: string;
  description: string;
  bullets: string[];
  recommended?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'ds-focus-ring relative flex h-full flex-col rounded-xl border p-4 text-left transition-colors',
        active ? 'border-volt-line bg-volt-soft/40' : 'border-line bg-card-2 hover:border-line-strong',
      )}
    >
      <span className="flex items-center justify-between">
        <span
          className={cn(
            'inline-flex size-8 items-center justify-center rounded-lg border',
            active ? 'border-volt-line bg-volt text-volt-ink' : 'border-line bg-card text-muted',
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
        <span
          className={cn(
            'inline-flex size-4 items-center justify-center rounded-full border',
            active ? 'border-volt bg-volt text-volt-ink' : 'border-line-strong',
          )}
          aria-hidden
        >
          {active ? <Check className="size-2.5 stroke-[3]" /> : null}
        </span>
      </span>
      <span className="mt-3 flex items-center gap-2 text-[13px] font-semibold">
        {title}
        {recommended ? <Badge variant="volt" size="sm">recomendado</Badge> : null}
      </span>
      <span className="mt-1 text-[11px] leading-relaxed text-muted">{description}</span>
      <span className="mt-3 space-y-1">
        {bullets.map((bullet) => (
          <span key={bullet} className="flex items-start gap-1.5 text-[10px] text-faint">
            <span className="mt-1 size-1 shrink-0 rounded-full bg-current" aria-hidden />
            {bullet}
          </span>
        ))}
      </span>
    </button>
  );
}

function WindowStep({ form }: { form: StepForm }) {
  const startMode = form.watch('startMode');
  const startAtLocal = form.watch('startAtLocal');

  return (
    <div className="space-y-5">
      <StepIntro
        icon={CalendarDays}
        title="Janela do desafio"
        description="Defina quando o desafio começa, se tem prazo final e até quando novos membros podem entrar."
      />

      <div className="space-y-2">
        <span className="text-[13px] font-medium">Início</span>
        <Segmented
          fullWidth
          ariaLabel="Quando o desafio começa"
          value={startMode}
          onChange={(value) => form.setValue('startMode', value)}
          options={[
            { value: 'now', label: 'Ao iniciar', icon: <Clock className="size-3.5" aria-hidden /> },
            { value: 'schedule', label: 'Agendar', icon: <CalendarDays className="size-3.5" aria-hidden /> },
          ]}
        />
        <p className="text-[11px] leading-relaxed text-muted">
          {startMode === 'now'
            ? 'O desafio começa assim que você criar o grupo. A janela de admissão permite convidar depois.'
            : 'O desafio inicia automaticamente no horário escolhido. Você também pode iniciar antes, manualmente.'}
        </p>
      </div>

      {startMode === 'schedule' ? (
        <Field
          label="Data e hora de início"
          htmlFor="startAtLocal"
          error={form.formState.errors.startAtLocal?.message}
          hint="horário local"
        >
          <Input
            id="startAtLocal"
            type="datetime-local"
            min={defaultStartLocal()}
            value={startAtLocal ?? ''}
            aria-invalid={Boolean(form.formState.errors.startAtLocal)}
            {...form.register('startAtLocal')}
          />
        </Field>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Encerramento"
          htmlFor="endsAtDate"
          optional
          error={form.formState.errors.endsAtDate?.message}
          hint="sem prazo se vazio"
        >
          <Input
            id="endsAtDate"
            type="date"
            min={todayInput()}
            aria-invalid={Boolean(form.formState.errors.endsAtDate)}
            {...form.register('endsAtDate')}
          />
        </Field>
        <Field
          label="Admissão até"
          htmlFor="admissionEndsAtDate"
          optional
          hint="fim do dia no fuso"
          error={form.formState.errors.admissionEndsAtDate?.message}
        >
          <Input
            id="admissionEndsAtDate"
            type="date"
            min={startMode === 'schedule' && startAtLocal ? startAtLocal.slice(0, 10) : todayInput()}
            aria-invalid={Boolean(form.formState.errors.admissionEndsAtDate)}
            {...form.register('admissionEndsAtDate')}
          />
        </Field>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-line bg-card-2 p-3">
        <Info className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden />
        <div className="text-[11px] leading-relaxed text-muted">
          <p>
            <strong className="text-fg">Admissão</strong> controla até quando um convite pode ser aceito. Se ficar
            vazia, novos membros só entram antes do início.
          </p>
          <p className="mt-1">
            O encerramento é opcional. Sem ele, o desafio termina quando alguém atingir a meta ou for cancelado.
          </p>
        </div>
      </div>
    </div>
  );
}

function ReposStep({
  selected,
  onChange,
  status,
  onSwitchToOwn,
}: {
  selected: GitHubRepository[];
  onChange: (repositories: GitHubRepository[]) => void;
  status?: Parameters<typeof RepositoryPicker>[0]['status'];
  onSwitchToOwn: () => void;
}) {
  return (
    <div className="space-y-5">
      <StepIntro
        icon={Target}
        title="Repositórios do grupo"
        description="Escolha de um a três repositórios que valem para todos. Commits fora da lista não geram dias válidos."
      />
      <RepositoryPicker selected={selected} onChange={onChange} status={status} />
      {status && !status.connected ? (
        <Button type="button" variant="ghost" size="sm" onClick={onSwitchToOwn}>
          Usar meus repositórios em vez disso
          <ArrowRight aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}

function ReviewStep({
  values,
  repositories,
  onEdit,
}: {
  values: CreateChallengeValues;
  repositories: GitHubRepository[];
  onEdit: (step: StepId) => void;
}) {
  const mode = verificationModeCopy(values.verificationMode);
  const startLabel =
    values.startMode === 'now'
      ? 'Imediatamente ao iniciar'
      : values.startAtLocal
        ? formatDateTime(new Date(values.startAtLocal).toISOString())
        : '—';

  return (
    <div className="space-y-4">
      <StepIntro
        icon={Sparkles}
        title="Revisar e criar"
        description="Confira as regras. Depois de criar, você poderá convidar o grupo e iniciar o desafio."
      />

      <SummaryBlock title="Grupo" onEdit={() => onEdit('group')}>
        <SummaryRow label="Nome" value={values.name} />
        {values.description ? <SummaryRow label="Descrição" value={values.description} /> : null}
        <SummaryRow label="Fuso" value={timeZoneLabel(values.timezone)} />
        <SummaryRow label="Limite" value={`${values.maxMembers} participantes`} />
      </SummaryBlock>

      <SummaryBlock title="Regras" onEdit={() => onEdit('rules')}>
        <SummaryRow label="Modalidade" value={mode.label} />
        <SummaryRow label="Meta" value={`${values.targetValidDays} dias válidos`} />
      </SummaryBlock>

      <SummaryBlock title="Janela" onEdit={() => onEdit('window')}>
        <SummaryRow label="Início" value={startLabel} />
        <SummaryRow
          label="Encerramento"
          value={values.endsAtDate ? formatFullDate(values.endsAtDate) : 'Sem prazo definido'}
        />
        <SummaryRow
          label="Admissão"
          value={
            values.admissionEndsAtDate
              ? `até ${formatFullDate(values.admissionEndsAtDate)}`
              : 'fecha no início'
          }
        />
      </SummaryBlock>

      {values.verificationMode === 'SELECTED_REPOSITORIES' ? (
        <SummaryBlock title="Repositórios" onEdit={() => onEdit('repos')}>
          {repositories.length === 0 ? (
            <p className="text-[12px] text-rose">Nenhum repositório selecionado.</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {repositories.map((repository) => (
                <li key={repository.id}>
                  <Badge variant="outline" className="normal-case tracking-normal">
                    {repository.fullName}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </SummaryBlock>
      ) : (
        <SummaryBlock title="Repositórios" onEdit={() => onEdit('rules')}>
          <p className="text-[12px] leading-relaxed text-muted">
            Cada participante conta commits nos próprios repositórios. Repositórios de empresas, organizações ou de
            terceiros não são elegíveis.
          </p>
        </SummaryBlock>
      )}

      <div className="flex items-start gap-2.5 rounded-xl border border-amber/30 bg-amber-soft p-3">
        <Lock className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
        <p className="text-[11px] leading-relaxed text-muted">
          {values.startMode === 'now' ? (
            <>
              O desafio começa <strong className="text-fg">assim que você criar o grupo</strong>. Modalidade, meta, fuso
              e lista de repositórios ficam travados imediatamente. Para mudar depois, será necessário cancelar e criar
              outro.
            </>
          ) : (
            <>
              O desafio será criado como <strong className="text-fg">rascunho</strong> e inicia automaticamente na data
              agendada. Modalidade, meta, fuso e lista de repositórios ficam travados depois do início.
            </>
          )}
        </p>
      </div>

      <p className="flex items-start gap-2 text-[11px] leading-relaxed text-faint">
        <Plus className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        Próximo passo: convidar o grupo por link privado. A admissão termina na data configurada.
      </p>
    </div>
  );
}

function SummaryBlock({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-card-2 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[12px] font-semibold">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-[11px] font-medium text-accent hover:underline"
        >
          Editar
        </button>
      </div>
      <dl className="space-y-1.5">{children}</dl>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-[11px]">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="text-right text-fg">{capitalize(value)}</dd>
    </div>
  );
}
