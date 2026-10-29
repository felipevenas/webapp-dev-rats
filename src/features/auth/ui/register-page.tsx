import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/core/auth/auth-provider';
import { toAppError } from '@/core/http/problem';
import { listTimeZones, userTimeZone } from '@/core/lib/date';
import { termsVersion } from '@/core/config/env';
import { Button } from '@/components/ui/button';
import { Checkbox, Select } from '@/components/ui/controls';
import { Field, Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { AuthLayout } from '@/features/auth/ui/auth-layout';
import { PasswordStrength } from '@/features/auth/ui/password-strength';
import { registerSchema, type RegisterValues } from '@/features/auth/schemas/auth-schemas';

const timeZones = listTimeZones();

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
      timezone: userTimeZone(),
      acceptTerms: false,
    },
  });

  const password = form.watch('password');
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
        timezone: values.timezone,
        acceptedTermsVersion: termsVersion,
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

        <Field
          label="Fuso horário"
          htmlFor="timezone"
          hint="define quando seu dia começa"
          error={form.formState.errors.timezone?.message}
        >
          <Controller
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <Select id="timezone" value={field.value} onChange={field.onChange} aria-invalid={Boolean(form.formState.errors.timezone)}>
                {timeZones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
            )}
          />
        </Field>

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
