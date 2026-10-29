import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { toAppError } from '@/core/http/problem';
import { authApi } from '@/features/auth/data/auth-api';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { AuthLayout } from '@/features/auth/ui/auth-layout';
import { PasswordStrength } from '@/features/auth/ui/password-strength';
import { resetPasswordSchema, type ResetPasswordValues } from '@/features/auth/schemas/auth-schemas';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    setSubmitting(true);
    try {
      await authApi.confirmPasswordReset(token, values.password);
      toast.success('Senha atualizada. Entre com a nova senha.');
      navigate('/login', { replace: true });
    } catch (error) {
      const appError = toAppError(error);
      toast.error(appError.detail);
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title="Link incompleto"
        subtitle="Este endereço não traz um token de recuperação válido."
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-amber/30 bg-amber-soft p-4">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber" aria-hidden />
            <p className="text-sm leading-relaxed text-muted">
              Solicite um novo link de recuperação. Por segurança, cada token pode ser usado apenas uma vez.
            </p>
          </div>
          <Button asChild full>
            <Link to="/forgot-password">Solicitar novo link</Link>
          </Button>
          <Button asChild variant="ghost" full>
            <Link to="/login">
              <ArrowLeft aria-hidden />
              Voltar para o login
            </Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Definir nova senha" subtitle="Escolha uma senha forte que você ainda não use em outros serviços.">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Nova senha" htmlFor="password" error={form.formState.errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Nova senha"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register('password')}
          />
        </Field>
        <PasswordStrength value={form.watch('password')} />
        <Field label="Confirmar senha" htmlFor="confirmPassword" error={form.formState.errors.confirmPassword?.message}>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            aria-invalid={Boolean(form.formState.errors.confirmPassword)}
            {...form.register('confirmPassword')}
          />
        </Field>
        <Button type="submit" full size="lg" loading={submitting}>
          Salvar nova senha
        </Button>
        <Button asChild variant="ghost" full>
          <Link to="/login">
            <ArrowLeft aria-hidden />
            Voltar para o login
          </Link>
        </Button>
      </form>
    </AuthLayout>
  );
}
