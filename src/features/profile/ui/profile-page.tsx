import { Github } from '@/components/brand/github-icon';
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Download,
  LogOut,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/core/auth/auth-provider';
import { toAppError } from '@/core/http/problem';
import { DEFAULT_TIME_ZONE, formatFullDate, localDateInZone, timeZoneLabel } from '@/core/lib/date';
import { Page, PageHeader } from '@/components/layout/page-header';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/controls';
import { Field, Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useDashboard } from '@/features/dashboard/data/use-dashboard';
import {
  useDeleteAccount,
  useExportData,
  useUpdateProfile,
} from '@/features/profile/data/use-profile';

const BRASILIA_LABEL = 'Horário de Brasília (GMT-3)';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const dashboard = useDashboard();
  const updateProfile = useUpdateProfile();
  const exportData = useExportData();
  const deleteAccount = useDeleteAccount();

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const stats = useMemo(() => {
    const groups = dashboard.data?.groups ?? [];
    return {
      groups: groups.length,
      validDays: groups.reduce((total, group) => total + group.validDays, 0),
      bestStreak: groups.reduce((best, group) => Math.max(best, group.bestStreak), 0),
    };
  }, [dashboard.data]);

  if (!user) return null;

  const displayTimezone =
    user.timezone === DEFAULT_TIME_ZONE ? BRASILIA_LABEL : `${timeZoneLabel(user.timezone)} (conta antiga)`;

  const dirty = displayName.trim() !== user.displayName;

  const handleSave = async () => {
    if (displayName.trim().length < 2) {
      toast.error('O nome precisa ter pelo menos 2 caracteres.');
      return;
    }
    try {
      await updateProfile.mutateAsync({ displayName: displayName.trim() });
      toast.success('Perfil atualizado.');
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  const togglePreference = async (
    key: 'notifyDailyGoal' | 'notifyMilestones' | 'notifyChallengeUpdates' | 'notifyIntegration',
    value: boolean,
  ) => {
    const previous = user;
    //---- Optimistic switch so the control responds immediately; roll back on failure.
    setUser({ ...user, [key]: value });
    try {
      const updated = await updateProfile.mutateAsync({ [key]: value });
      setUser(updated);
    } catch (error) {
      setUser(previous);
      toast.error(toAppError(error).detail);
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportData.mutateAsync();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `devrats-dados-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success('Exportação gerada.');
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  const handleDelete = async () => {
    if (confirmation !== 'EXCLUIR') {
      toast.error('Digite EXCLUIR para confirmar.');
      return;
    }
    try {
      await deleteAccount.mutateAsync(password);
      await logout();
      toast.success('Sua conta foi excluída.');
      navigate('/');
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Sua conta"
        title="Perfil"
        description="Ajuste como você aparece e o que quer receber de alerta."
        actions={
          <Button variant="secondary" onClick={() => void logout()}>
            <LogOut aria-hidden />
            Sair
          </Button>
        }
      />

      {!user.githubConnected ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber/30 bg-amber-soft p-4 sm:flex-row sm:items-center">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber/30 bg-card/40 text-amber">
            <AlertTriangle className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">GitHub desconectado</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
              A verificação de commits está pausada. Conecte para voltar a contar dias válidos.
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0 whitespace-nowrap">
            <Link to="/app/settings/integrations">
              <Github aria-hidden />
              Conectar agora
            </Link>
          </Button>
        </div>
      ) : null}

      <section className="ds-card relative overflow-hidden p-5 sm:p-6">
        <div className="ds-grid-bg-sm pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar src={user.avatarUrl} name={user.displayName} size="2xl" ring />
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">{user.displayName}</h2>
            <p className="font-mono text-[12px] text-muted">@{user.username}</p>
            <p className="mt-1 text-[11px] text-faint">{user.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant={user.githubConnected ? 'volt' : 'amber'} size="sm">
                <Github className="size-3" aria-hidden />
                {user.githubConnected ? `@${user.githubUsername ?? 'github'}` : 'GitHub desconectado'}
              </Badge>
              <Badge variant="outline" size="sm">
                <CalendarDays className="size-3" aria-hidden />
                desde {formatFullDate(localDateInZone(user.createdAt, user.timezone))}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:w-64">
            <HeroStat label="grupos" value={String(stats.groups)} />
            <HeroStat label="dias válidos" value={String(stats.validDays)} />
            <HeroStat label="melhor streak" value={`${stats.bestStreak}d`} />
          </div>
        </div>
      </section>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-4 text-muted" aria-hidden />
                Informações pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome de exibição" htmlFor="display-name" hint={`${displayName.length}/120`}>
                  <Input
                    id="display-name"
                    value={displayName}
                    maxLength={120}
                    onChange={(event) => setDisplayName(event.target.value)}
                  />
                </Field>
                <Field label="Usuário" htmlFor="username" hint="imutável">
                  <Input id="username" value={`@${user.username}`} readOnly disabled />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="E-mail" htmlFor="email" hint="usado para login">
                  <Input id="email" value={user.email} readOnly disabled />
                </Field>
                <Field label="Fuso horário" htmlFor="timezone" hint="novos desafios usam Brasília">
                  <Input id="timezone" value={displayTimezone} readOnly disabled />
                </Field>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                <p className="text-[11px] text-faint">
                  {dirty ? 'Há alterações não salvas.' : `Fuso exibido: ${displayTimezone}`}
                </p>
                <Button onClick={() => void handleSave()} loading={updateProfile.isPending} disabled={!dirty}>
                  <Save aria-hidden />
                  Salvar perfil
                </Button>
              </div>

              <div className="rounded-xl border border-line bg-card-2 p-3 text-[11px] leading-relaxed text-muted">
                O avatar e o nome de usuário do GitHub vêm da conta conectada. O e-mail não pode ser alterado no
                MVP. Todo o app e os novos desafios usam o horário de Brasília (GMT-3), que não pode ser alterado.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Bell className="size-4 text-muted" aria-hidden />
                Notificações internas
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-line">
              <PreferenceRow
                title="Meta diária"
                description="Quando um dia válido for registrado."
                checked={user.notifyDailyGoal}
                onChange={(value) => void togglePreference('notifyDailyGoal', value)}
                disabled={updateProfile.isPending}
              />
              <PreferenceRow
                title="Marcos e sequências"
                description="Quando você atingir um novo marco."
                checked={user.notifyMilestones}
                onChange={(value) => void togglePreference('notifyMilestones', value)}
                disabled={updateProfile.isPending}
              />
              <PreferenceRow
                title="Atualizações do desafio"
                description="Conclusão, cancelamento, entradas e convites aceitos."
                checked={user.notifyChallengeUpdates}
                onChange={(value) => void togglePreference('notifyChallengeUpdates', value)}
                disabled={updateProfile.isPending}
              />
              <PreferenceRow
                title="Integração"
                description="Quando o GitHub precisar de atenção."
                checked={user.notifyIntegration}
                onChange={(value) => void togglePreference('notifyIntegration', value)}
                disabled={updateProfile.isPending}
              />
            </CardContent>
          </Card>
        </div>

        <aside className="min-w-0 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Github className="size-4 text-muted" aria-hidden />
                Conta GitHub
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-[12px] leading-relaxed text-muted">
                {user.githubConnected
                  ? 'Sua conta está autorizada e os commits elegíveis são verificados automaticamente.'
                  : 'Sem a conexão, a verificação de commits fica pausada.'}
              </p>
              <Button asChild variant="secondary" size="sm" full>
                <Link to="/app/settings/integrations">
                  {user.githubConnected ? 'Gerenciar integração' : 'Conectar GitHub'}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShieldCheck className="size-4 text-accent" aria-hidden />
                Seus dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-[12px] leading-relaxed text-muted">
                Baixe uma cópia em JSON com perfil, grupos, progresso e preferências.
              </p>
              <Button
                variant="secondary"
                size="sm"
                full
                onClick={() => void handleExport()}
                loading={exportData.isPending}
              >
                <Download aria-hidden />
                Exportar meus dados
              </Button>
              <Button asChild variant="ghost" size="sm" full>
                <Link to="/privacidade">Política de privacidade</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-rose/25">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-rose">Excluir conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-[11px] leading-relaxed text-muted">
                Remove seu perfil e seu acesso. Resultados finalizados e registros de auditoria podem ser
                preservados por obrigação legal.
              </p>
              <Button variant="danger" size="sm" full onClick={() => setDeleteOpen(true)}>
                <Trash2 aria-hidden />
                Excluir minha conta
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir conta permanentemente"
        description="Esta ação não pode ser desfeita."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => void handleDelete()}
              loading={deleteAccount.isPending}
              disabled={confirmation !== 'EXCLUIR' || password.length === 0}
            >
              <Trash2 aria-hidden />
              Excluir conta
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-[12px] leading-relaxed text-muted">
            Todos os seus grupos serão afetados. Para confirmar, digite a senha e a palavra{' '}
            <strong className="font-mono text-fg">EXCLUIR</strong>.
          </p>
          <Field label="Senha" htmlFor="delete-password">
            <Input
              id="delete-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          <Field label="Confirmação" htmlFor="delete-confirmation">
            <Input
              id="delete-confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value.toUpperCase())}
              placeholder="EXCLUIR"
              className="font-mono"
            />
          </Field>
          <div className="flex items-start gap-2 rounded-lg border border-rose/25 bg-rose-soft p-2.5 text-[11px] leading-relaxed text-muted">
            <Trash2 className="mt-0.5 size-3.5 shrink-0 text-rose" aria-hidden />
            Se você é dono de um grupo, cancele ou encerre os desafios antes de excluir a conta.
          </div>
        </div>
      </Modal>
    </Page>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-bg/50 p-2.5">
      <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-faint">{label}</p>
      <p className="mt-1 font-mono text-lg leading-none text-fg">{value}</p>
    </div>
  );
}

function PreferenceRow({
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div>
        <p className="text-[13px] font-medium">{title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} label={title} />
    </div>
  );
}
