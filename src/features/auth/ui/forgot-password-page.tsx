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
  const [submittedEmail, setSubmittedEmail] = useState('');

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setSubmitting(true);
    try {
      const response = await authApi.requestPasswordReset(values.email);
      setSubmittedEmail(values.email);
      setResult(response);
    } catch (error) {
      toast.error(toAppError(error).detail);
    } finally {
      setSubmitting(false);
    }
  };

  //---- O backend só devolve o token em local/test; nunca exibir em produção.
  const devToken = import.meta.env.DEV ? result?.resetToken : null;

  const sendToAnotherEmail = () => {
    setResult(null);
    form.reset({ email: submittedEmail });
  };

  return (
    <AuthLayout
      title="Recuperar acesso"
      subtitle="Informe seu e-mail e enviaremos as instruções para criar uma nova senha."
    >
      {result ? (
        <div className="space-y-4" aria-live="polite">
          <div className="flex items-start gap-3 rounded-xl border border-volt-line bg-volt-soft p-4">
            <MailCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
            <div className="space-y-2">
              <p className="text-sm font-medium text-fg">Confira sua caixa de entrada</p>
              <p className="text-sm leading-relaxed text-muted">{result.message}</p>
              <p className="text-xs leading-relaxed text-faint">
                Destino informado: <span className="font-medium text-muted">{submittedEmail}</span>
              </p>
              <p className="text-xs leading-relaxed text-faint">
                O link expira em 30 minutos e só pode ser usado uma vez.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-card/60 p-4 text-xs leading-relaxed text-muted">
            Não recebeu? Verifique a caixa de spam e aguarde alguns minutos antes de solicitar outro link.
          </div>

          {devToken ? (
            <div className="space-y-2 rounded-xl border border-dashed border-amber/40 bg-amber-soft p-4">
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-amber">
                <KeyRound className="size-3.5" aria-hidden />
                Ambiente local · token de desenvolvimento
              </p>
              <p className="break-all font-mono text-[11px] text-fg">{devToken}</p>
              <Button asChild variant="secondary" size="sm">
                <Link to={`/reset-password#token=${encodeURIComponent(devToken)}`}>Usar este token</Link>
              </Button>
            </div>
          ) : null}

          <Button type="button" variant="secondary" full onClick={sendToAnotherEmail}>
            Enviar para outro e-mail
          </Button>

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
