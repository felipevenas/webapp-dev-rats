import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Crown,
  DoorOpen,
  Pencil,
  Play,
  Save,
  Ticket,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/core/auth/auth-provider';
import { toAppError } from '@/core/http/problem';
import { formatDateTime, formatFullDate, localDateInZone } from '@/core/lib/date';
import { Page, PageHeader } from '@/components/layout/page-header';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Field, Input, Textarea } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGroup,
  useGroupInvites,
  useGroupMembers,
  useLeaveGroup,
  useRemoveMember,
  useUpdateGroup,
} from '@/features/groups/data/use-groups';
import { InviteDialog } from '@/features/groups/ui/invite-dialog';
import { useCancelChallenge, useStartChallenge } from '@/features/challenges/data/use-challenges';
import { challengeStatusCopy, verificationModeCopy } from '@/features/challenges/domain/challenge-status';
import { ChallengeStatusBadge } from '@/features/challenges/ui/challenge-status-badge';

export default function GroupSettingsPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const groupQuery = useGroup(groupId);
  const group = groupQuery.data;
  const membersQuery = useGroupMembers(groupId);
  const invitesQuery = useGroupInvites(groupId, Boolean(group));
  const updateGroup = useUpdateGroup(groupId ?? '');
  const removeMember = useRemoveMember(groupId ?? '');
  const leaveGroup = useLeaveGroup(groupId ?? '');
  const cancelChallenge = useCancelChallenge(groupId ?? '');
  const startChallenge = useStartChallenge(groupId ?? '');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ userId: string; displayName: string } | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description ?? '');
    }
  }, [group]);

  if (!user) return null;

  if (groupQuery.isLoading) {
    return (
      <Page>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Page>
    );
  }

  if (groupQuery.isError || !group) {
    return (
      <Page>
        <ErrorState
          error={groupQuery.error}
          onRetry={() => void groupQuery.refetch()}
          action={
            <Button asChild variant="secondary">
              <Link to="/app">Dashboard</Link>
            </Button>
          }
        />
      </Page>
    );
  }

  const isOwner = group.creatorId === user.id;
  const challenge = group.currentChallenge;
  const members = membersQuery.data ?? [];
  const activeMembers = members.filter((member) => member.status === 'ACTIVE');
  const invites = invitesQuery.data ?? [];
  const activeInvites = invites.filter(
    (invite) =>
      !invite.revokedAt &&
      new Date(invite.expiresAt).getTime() > Date.now() &&
      (invite.maxUses == null || invite.uses < invite.maxUses),
  );
  const challengeOpen = challenge?.status === 'DRAFT' || challenge?.status === 'ACTIVE';
  const canStart = isOwner && challenge?.status === 'DRAFT';

  const handleSave = async () => {
    if (name.trim().length < 2) {
      toast.error('O nome precisa ter pelo menos 2 caracteres.');
      return;
    }
    try {
      await updateGroup.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success('Informações do grupo atualizadas.');
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  const handleRemove = async () => {
    if (!selectedMember) return;
    try {
      await removeMember.mutateAsync(selectedMember.userId);
      toast.success(`${selectedMember.displayName} foi removido do grupo.`);
      setSelectedMember(null);
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveGroup.mutateAsync();
      toast.success('Você saiu do grupo.');
      navigate('/app');
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  const handleCancel = async () => {
    if (!challenge) return;
    try {
      await cancelChallenge.mutateAsync(challenge.id);
      setCancelOpen(false);
      toast.success('Desafio cancelado. O histórico foi preservado.');
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  const handleStart = async () => {
    if (!challenge) return;
    try {
      await startChallenge.mutateAsync(challenge.id);
      toast.success('Desafio iniciado. A verificação está ativa.');
      navigate(`/app/groups/${group.id}`);
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  return (
    <Page>
      <div>
        <Link
          to={`/app/groups/${group.id}`}
          className="inline-flex items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Voltar ao desafio
        </Link>
      </div>

      <PageHeader
        eyebrow="Grupo e configurações"
        title={group.name}
        description="Edite as informações do grupo, gerencie participantes e convites."
        actions={
          <Button asChild variant="secondary">
            <Link to={`/app/groups/${group.id}`}>
              <CalendarDays aria-hidden />
              Ver desafio
            </Link>
          </Button>
        }
      />

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Pencil className="size-4 text-muted" aria-hidden />
                Informações do grupo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isOwner ? (
                <>
                  <Field label="Nome" htmlFor="group-name" hint={`${name.length}/120`}>
                    <Input
                      id="group-name"
                      value={name}
                      maxLength={120}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </Field>
                  <Field label="Descrição" htmlFor="group-description" optional hint={`${description.length}/500`}>
                    <Textarea
                      id="group-description"
                      value={description}
                      maxLength={500}
                      rows={3}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </Field>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] text-faint">
                      O fuso do desafio ({group.timezone.replace('_', ' ')}) é fixo e não pode ser alterado.
                    </p>
                    <Button
                      onClick={() => void handleSave()}
                      loading={updateGroup.isPending}
                      disabled={name === group.name && description === (group.description ?? '')}
                    >
                      <Save aria-hidden />
                      Salvar alterações
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-fg">{group.description || 'Sem descrição.'}</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-faint">
                    <Users className="size-3.5" aria-hidden />
                    Apenas o criador pode editar as informações do grupo.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 pb-3">
              <CardTitle className="flex items-center gap-2">
                <Users className="size-4 text-muted" aria-hidden />
                Participantes
              </CardTitle>
              <Badge variant="outline">
                {activeMembers.length}/{group.maxMembers}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {membersQuery.isLoading ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : membersQuery.isError ? (
                <ErrorState error={membersQuery.error} compact onRetry={() => void membersQuery.refetch()} />
              ) : activeMembers.length === 0 ? (
                <EmptyState icon={Users} compact title="Nenhum participante ativo" />
              ) : (
                activeMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex min-w-0 items-center gap-3 rounded-xl border border-line bg-card-2 px-3 py-2.5"
                  >
                    <Avatar src={member.avatarUrl} name={member.displayName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate text-[12px] font-medium">
                        {member.displayName}
                        {member.userId === user.id ? <span className="text-accent">· você</span> : null}
                      </p>
                      <p className="truncate font-mono text-[10px] text-faint">
                        @{member.username} · entrou em {formatDateTime(member.joinedAt, group.timezone)}
                      </p>
                    </div>
                    {member.role === 'OWNER' ? (
                      <Badge variant="volt" size="sm">
                        <Crown className="size-2.5" aria-hidden /> dono
                      </Badge>
                    ) : isOwner ? (
                      <Button
                        variant="danger-ghost"
                        size="icon-sm"
                        onClick={() =>
                          setSelectedMember({ userId: member.userId, displayName: member.displayName })
                        }
                        aria-label={`Remover ${member.displayName}`}
                        title="Remover do grupo"
                      >
                        <UserMinus aria-hidden />
                      </Button>
                    ) : member.userId === user.id ? (
                      <Badge variant="outline" size="sm">
                        você
                      </Badge>
                    ) : null}
                  </div>
                ))
              )}
              <p className="text-[10px] leading-relaxed text-faint">
                A remoção encerra a participação no desafio atual. Dias válidos já registrados permanecem no
                histórico do grupo.
              </p>
            </CardContent>
          </Card>

          {isOwner ? (
            <Card>
              <CardHeader className="flex-row items-center justify-between gap-2 pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="size-4 text-muted" aria-hidden />
                  Convites
                </CardTitle>
                <Badge variant={activeInvites.length > 0 ? 'volt' : 'outline'} size="sm">
                  {activeInvites.length} ativo{activeInvites.length === 1 ? '' : 's'}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[12px] leading-relaxed text-muted">
                  Links privados com validade e limite de usos. O link completo só é exibido no momento da
                  criação.
                </p>
                <Button size="sm" onClick={() => setInviteOpen(true)}>
                  <UserPlus aria-hidden />
                  Gerar convite
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside className="min-w-0 space-y-4">
          {challenge ? (
            <Card>
              <CardHeader className="flex-row items-center justify-between gap-2 pb-3">
                <CardTitle className="text-sm">Desafio atual</CardTitle>
                <ChallengeStatusBadge status={challenge.status} size="sm" />
              </CardHeader>
              <CardContent className="space-y-3">
                <dl className="space-y-2 text-[11px]">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">Modalidade</dt>
                    <dd className="text-right text-fg">{verificationModeCopy(challenge.verificationMode).label}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">Meta</dt>
                    <dd className="font-mono text-fg">{challenge.targetValidDays} dias</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">Início</dt>
                    <dd className="text-right text-fg">
                      {formatFullDate(localDateInZone(challenge.startsAt, challenge.timezone))}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">Admissão</dt>
                    <dd className="text-right text-fg">
                      {challenge.admissionEndsAt
                        ? formatFullDate(localDateInZone(challenge.admissionEndsAt, challenge.timezone))
                        : 'fecha no início'}
                    </dd>
                  </div>
                </dl>
                <p className="rounded-lg border border-line bg-card-2 p-2.5 text-[10px] leading-relaxed text-muted">
                  {challengeStatusCopy(challenge.status).description}
                </p>
                {canStart ? (
                  <Button size="sm" full onClick={() => void handleStart()} loading={startChallenge.isPending}>
                    <Play aria-hidden />
                    Iniciar desafio
                  </Button>
                ) : null}
                <Button asChild variant="secondary" size="sm" full>
                  <Link to={`/app/groups/${group.id}`}>Abrir desafio</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Zona de risco</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isOwner ? (
                <>
                  <p className="text-[11px] leading-relaxed text-muted">
                    O criador não pode sair do grupo. Para encerrar, cancele o desafio - o histórico permanece
                    consultável.
                  </p>
                  {challengeOpen ? (
                    <Button variant="danger" size="sm" full onClick={() => setCancelOpen(true)}>
                      <XCircle aria-hidden />
                      Cancelar desafio
                    </Button>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="text-[11px] leading-relaxed text-muted">
                    Ao sair, você deixa de acessar o ranking e o calendário deste grupo.
                  </p>
                  <Button variant="danger" size="sm" full onClick={() => setLeaveOpen(true)}>
                    <DoorOpen aria-hidden />
                    Sair do grupo
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <div className="rounded-xl border border-line bg-card/50 p-3 text-[10px] leading-relaxed text-faint">
            <Check className="mb-1 inline size-3 text-accent" aria-hidden /> Alterações de regras só são permitidas
            antes do início do desafio.
          </div>
        </aside>
      </div>

      <InviteDialog
        groupId={group.id}
        groupName={group.name}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />

      <Modal
        open={Boolean(selectedMember)}
        onOpenChange={(open) => !open && setSelectedMember(null)}
        title="Remover participante?"
        description={
          selectedMember
            ? `${selectedMember.displayName} deixará de participar deste grupo.`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelectedMember(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => void handleRemove()} loading={removeMember.isPending}>
              <Trash2 aria-hidden />
              Remover
            </Button>
          </>
        }
      >
        <p className="text-[12px] leading-relaxed text-muted">
          A pessoa perde o acesso ao grupo e ao desafio atual. Os dias válidos já registrados permanecem no
          histórico do grupo. Para voltar, será necessário um novo convite.
        </p>
      </Modal>

      <Modal
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title="Sair do grupo?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setLeaveOpen(false)}>
              Ficar
            </Button>
            <Button variant="danger" onClick={() => void handleLeave()} loading={leaveGroup.isPending}>
              Sair do grupo
            </Button>
          </>
        }
      >
        <p className="text-[12px] leading-relaxed text-muted">
          Seus dias válidos permanecem no histórico. Para voltar, será necessário um novo convite, respeitando a
          janela de admissão do desafio.
        </p>
      </Modal>

      <Modal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancelar desafio?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              Manter desafio
            </Button>
            <Button variant="danger" onClick={() => void handleCancel()} loading={cancelChallenge.isPending}>
              <XCircle aria-hidden />
              Cancelar desafio
            </Button>
          </>
        }
      >
        <p className="text-[12px] leading-relaxed text-muted">
          O desafio será encerrado sem vencedor. O ranking e os dias válidos permanecem no histórico do grupo.
        </p>
      </Modal>
    </Page>
  );
}
