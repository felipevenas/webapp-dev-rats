import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { Github } from '@/components/brand/github-icon';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/core/auth/auth-provider';
import { toAppError } from '@/core/http/problem';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { AuthLayout } from '@/features/auth/ui/auth-layout';
import { loginSchema, type LoginValues } from '@/features/auth/schemas/auth-schemas';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const nextParam = searchParams.get('next');
  const next = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/app';

  const onSubmit = async (values: LoginValues) => {
    setSubmitting(true);
    try {
      const user = await login(values.identifier, values.password);
      toast.success(`Bem-vindo de volta, ${user.displayName.split(' ')[0]}`);
      navigate(next, { replace: true });
    } catch (error) {
      const appError = toAppError(error);
      if (appError.fieldErrors.length > 0) {
        appError.fieldErrors.forEach((field) => {
          if (field.field === 'identifier' || field.field === 'password') {
            form.setError(field.field, { message: field.message });
          }
        });
      } else if (appError.code === 'INVALID_CREDENTIALS' || appError.status === 401) {
        form.setError('password', { message: 'E-mail, usuário ou senha incorretos' });
      } else {
        toast.error(appError.detail);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Entrar na sua sequência"
      subtitle="Acesse seus desafios, acompanhe o ranking e não perca o dia de hoje."
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="E-mail ou usuário" htmlFor="identifier" error={form.formState.errors.identifier?.message}>
          <Input
            id="identifier"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="voce@exemplo.com ou seu_usuario"
            aria-invalid={Boolean(form.formState.errors.identifier)}
            {...form.register('identifier')}
          />
        </Field>

        <Field label="Senha" htmlFor="password" error={form.formState.errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register('password')}
          />
        </Field>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] text-faint">
            <Github className="size-3.5" aria-hidden />
            GitHub é conectado depois do login
          </span>
          <Link to="/forgot-password" className="text-xs font-medium text-accent hover:underline">
            Esqueci a senha
          </Link>
        </div>

        <Button type="submit" full size="lg" loading={submitting}>
          Entrar
          <ArrowRight aria-hidden />
        </Button>
      </form>

      <div className="mt-6 rounded-xl border border-line bg-card/60 p-4 text-center text-sm text-muted">
        Ainda não tem conta?{' '}
        <Link to={`/register${next !== '/app' ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-medium text-accent hover:underline">
          Criar conta grátis
        </Link>
      </div>
    </AuthLayout>
  );
}
