import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/core/auth/auth-provider';
import { toAppError } from '@/core/http/problem';
import { DEFAULT_TIME_ZONE } from '@/core/lib/date';
import { termsVersion } from '@/core/config/env';
import { Button } from '@/components/ui/button';
import { Checkbox, Select } from '@/components/ui/controls';
import { Field, Input, Textarea } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { SelectableChips } from '@/components/ui/selectable-chips';
import { AuthLayout } from '@/features/auth/ui/auth-layout';
import { PasswordStrength } from '@/features/auth/ui/password-strength';
import { registerSchema, type RegisterValues } from '@/features/auth/schemas/auth-schemas';
import {
  MAX_PRIMARY_STACK,
  experienceLevelOptions,
  techStackOptions,
} from '@/features/profile/domain/profile-options';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      username: '',
      email: '',
      password: '',
      acceptTerms: false,
    },
  });

  const password = form.watch('password');
  const bio = form.watch('bio') ?? '';
  const primaryStack = form.watch('primaryStack') ?? [];
  const nextParam = searchParams.get('next');
  const next = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/onboarding';

  const onSubmit = async (values: RegisterValues) => {
    setSubmitting(true);
    try {
      await registerUser({
        email: values.email,
        password: values.password,
        displayName: values.displayName,
        username: values.username,
        //---- The backend still expects the field; every account is fixed to Brasília time.
        timezone: DEFAULT_TIME_ZONE,
        acceptedTermsVersion: termsVersion,
        bio: values.bio?.trim() || null,
        location: values.location?.trim() || null,
        websiteUrl: values.websiteUrl?.trim() || null,
        experienceLevel: values.experienceLevel ?? null,
        primaryStack: values.primaryStack ?? [],
      });
      toast.success('Conta criada. Vamos conectar seu GitHub?');
      navigate(next, { replace: true });
    } catch (error) {
      const appError = toAppError(error);
      if (appError.code === 'DATA_CONFLICT' || appError.status === 409) {
        form.setError('email', { message: appError.detail });
        form.setError('username', { message: appError.detail });
      } else if (appError.fieldErrors.length > 0) {
        appError.fieldErrors.forEach((field) => {
          const key = field.field as keyof RegisterValues;
          if (key in form.getValues()) form.setError(key, { message: field.message });
        });
      } else {
        toast.error(appError.detail);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Leva menos de um minuto. O GitHub entra logo depois, com permissão de leitura."
      footer={
        <>
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-muted underline-offset-2 hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" htmlFor="displayName" error={form.formState.errors.displayName?.message}>
            <Input
              id="displayName"
              autoComplete="name"
              placeholder="Seu nome"
              aria-invalid={Boolean(form.formState.errors.displayName)}
              {...form.register('displayName')}
            />
          </Field>
          <Field
            label="Usuário"
            htmlFor="username"
            error={form.formState.errors.username?.message}
            hint="minúsculas e _"
          >
            <Input
              id="username"
              autoComplete="username"
              placeholder="dev_ferreira"
              aria-invalid={Boolean(form.formState.errors.username)}
              {...form.register('username')}
            />
          </Field>
        </div>

        <Field label="E-mail" htmlFor="email" error={form.formState.errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="voce@exemplo.com"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register('email')}
          />
        </Field>

        <Field label="Senha" htmlFor="password" error={form.formState.errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Crie uma senha forte"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register('password')}
          />
        </Field>
        <PasswordStrength value={password} />

        <div className="flex items-start gap-2 rounded-xl border border-line bg-card-2 p-3">
          <CalendarDays className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden />
          <p className="text-[11px] leading-relaxed text-muted">
            Seus dias válidos seguem sempre o <strong className="text-fg">horário de Brasília (GMT-3)</strong>.
          </p>
        </div>

        <section className="space-y-4 border-t border-line pt-4" aria-labelledby="about-you-title">
          <div>
            <h2 id="about-you-title" className="text-[13px] font-semibold">
              Sobre você <span className="font-normal text-faint">(opcional)</span>
            </h2>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
              Ajuda o grupo a te conhecer. Você pode preencher ou editar depois.
            </p>
          </div>

          <Field
            label="Bio"
            htmlFor="bio"
            optional
            hint={`${bio.length}/280`}
            error={form.formState.errors.bio?.message}
          >
            <Textarea
              id="bio"
              rows={3}
              maxLength={280}
              placeholder="Conte em uma linha o que você constrói."
              aria-invalid={Boolean(form.formState.errors.bio)}
              {...form.register('bio')}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Localização"
              htmlFor="location"
              optional
              error={form.formState.errors.location?.message}
            >
              <Input
                id="location"
                autoComplete="address-level2"
                placeholder="São Paulo, Brasil"
                maxLength={120}
                aria-invalid={Boolean(form.formState.errors.location)}
                {...form.register('location')}
              />
            </Field>
            <Field
              label="Site ou portfólio"
              htmlFor="website-url"
              optional
              error={form.formState.errors.websiteUrl?.message}
            >
              <Input
                id="website-url"
                type="url"
                inputMode="url"
                placeholder="https://seusite.dev"
                maxLength={300}
                aria-invalid={Boolean(form.formState.errors.websiteUrl)}
                {...form.register('websiteUrl')}
              />
            </Field>
          </div>

          <Field
            label="Nível de experiência"
            htmlFor="experience-level"
            optional
            error={form.formState.errors.experienceLevel?.message}
          >
            <Controller
              control={form.control}
              name="experienceLevel"
              render={({ field }) => (
                <Select
                  id="experience-level"
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange((event.target.value || undefined) as RegisterValues['experienceLevel'])
                  }
                  aria-invalid={Boolean(form.formState.errors.experienceLevel)}
                >
                  <option value="">Não informar</option>
                  {experienceLevelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              )}
            />
          </Field>

          <Field
            label="Stack principal"
            optional
            hint={`${primaryStack.length}/${MAX_PRIMARY_STACK}`}
            error={form.formState.errors.primaryStack?.message}
          >
            <Controller
              control={form.control}
              name="primaryStack"
              render={({ field }) => (
                <SelectableChips
                  ariaLabel="Stack principal"
                  options={techStackOptions}
                  selected={field.value ?? []}
                  onChange={field.onChange}
                  max={MAX_PRIMARY_STACK}
                />
              )}
            />
            <p className="text-[11px] text-faint">
              Selecione até {MAX_PRIMARY_STACK} tecnologias que você usa no dia a dia.
            </p>
          </Field>
        </section>

        <div className="rounded-xl border border-line bg-card/60 p-3.5">
          <Controller
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <label className="flex cursor-pointer items-start gap-3">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  label="Aceitar termos"
                />
                <span className="text-[12px] leading-relaxed text-muted">
                  Li e aceito os{' '}
                  <Link to="/termos" className="text-accent hover:underline" onClick={(event) => event.stopPropagation()}>
                    Termos de uso
                  </Link>{' '}
                  e a{' '}
                  <Link to="/privacidade" className="text-accent hover:underline" onClick={(event) => event.stopPropagation()}>
                    Política de privacidade
                  </Link>
                  . Apenas metadados de commits são lidos — nunca o conteúdo dos seus repositórios.
                </span>
              </label>
            )}
          />
          {form.formState.errors.acceptTerms ? (
            <p className="mt-2 text-xs text-rose" role="alert">
              {form.formState.errors.acceptTerms.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" full size="lg" loading={submitting}>
          Criar conta
          <ArrowRight aria-hidden />
        </Button>
      </form>
    </AuthLayout>
  );
}
