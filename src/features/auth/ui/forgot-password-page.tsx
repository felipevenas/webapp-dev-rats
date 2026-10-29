import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, KeyRound, MailCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { toAppError } from '@/core/http/problem';
import { authApi, type PasswordResetResponse } from '@/features/auth/data/auth-api';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { AuthLayout } from '@/features/auth/ui/auth-layout';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/features/auth/schemas/auth-schemas';

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PasswordResetResponse | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setSubmitting(true);
    try {
      const response = await authApi.requestPasswordReset(values.email);
      setResult(response);
    } catch (error) {
      toast.error(toAppError(error).detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Recuperar acesso"
      subtitle="Informe seu e-mail e enviaremos as instruções para criar uma nova senha."
    >
      {result ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-volt-line bg-volt-soft p-4">
            <MailCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
            <div className="space-y-1">
              <p className="text-sm font-medium text-fg">Pedido registrado</p>
              <p className="text-sm leading-relaxed text-muted">{result.message}</p>
            </div>
          </div>

          {result.resetToken ? (
            <div className="space-y-2 rounded-xl border border-dashed border-amber/40 bg-amber-soft p-4">
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-amber">
                <KeyRound className="size-3.5" aria-hidden />
                Ambiente local · token de desenvolvimento
              </p>
              <p className="break-all font-mono text-[11px] text-fg">{result.resetToken}</p>
              <Button asChild variant="secondary" size="sm">
                <Link to={`/reset-password?token=${encodeURIComponent(result.resetToken)}`}>
                  Usar este token
                </Link>
              </Button>
            </div>
          ) : null}

          <Button asChild variant="ghost" full>
            <Link to="/login">
              <ArrowLeft aria-hidden />
              Voltar para o login
            </Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="E-mail" htmlFor="email" error={form.formState.errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              aria-invalid={Boolean(form.formState.errors.email)}
              {...form.register('email')}
            />
          </Field>
          <Button type="submit" full size="lg" loading={submitting}>
            Enviar instruções
          </Button>
          <Button asChild variant="ghost" full>
            <Link to="/login">
              <ArrowLeft aria-hidden />
              Voltar para o login
            </Link>
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
