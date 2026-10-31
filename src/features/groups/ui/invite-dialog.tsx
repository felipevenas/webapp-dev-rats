import { useState } from 'react';
import { Check, Copy, Link2, Share2, ShieldAlert, Ticket, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { toAppError } from '@/core/http/problem';
import { formatDateTime } from '@/core/lib/date';
import { cn } from '@/core/lib/cn';
import type { Invite } from '@/core/types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/controls';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreateInvite, useGroupInvites, useRevokeInvite } from '@/features/groups/data/use-groups';

interface InviteDialogProps {
  groupId: string;
  groupName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteDialog({ groupId, groupName, open, onOpenChange }: InviteDialogProps) {
  const invitesQuery = useGroupInvites(groupId, open);
  const createInvite = useCreateInvite(groupId);
  const revokeInvite = useRevokeInvite(groupId);
  const [expiryDays, setExpiryDays] = useState('7');
  const [maxUses, setMaxUses] = useState('');
  const [created, setCreated] = useState<Invite | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    try {
      const expiresAt = new Date(Date.now() + Number(expiryDays) * 86_400_000).toISOString();
      const invite = await createInvite.mutateAsync({
        expiresAt,
        maxUses: maxUses.trim() ? Number(maxUses) : undefined,
      });
      setCreated(invite);
      setCopied(false);
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  //---- Build the link on the current origin: the backend URL may point to another dev port/domain.
  const inviteUrl = created?.token ? `${window.location.origin}/invites/${created.token}` : '';

  const copy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success('Link copiado. Envie para quem vai participar.');
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Não foi possível copiar automaticamente. Selecione o link manualmente.');
    }
  };

  const share = async () => {
    if (!inviteUrl) return;
    const text = `Entre no grupo "${groupName}" no DevRats: ${inviteUrl}`;
    try {
      if (navigator.share) await navigator.share({ title: groupName, text, url: inviteUrl });
      else {
        await navigator.clipboard.writeText(inviteUrl);
        toast.success('Link copiado.');
      }
    } catch {
      //---- User cancelled the native share sheet.
    }
  };

  const handleRevoke = async (inviteId: string) => {
    try {
      await revokeInvite.mutateAsync(inviteId);
      if (created?.id === inviteId) setCreated(null);
      toast.success('Convite revogado.');
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Convidar para o grupo"
      description="Gere um link privado. Quem tiver o link e estiver autenticado pode entrar, respeitando o limite e a janela de admissão."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={() => void handleCreate()} loading={createInvite.isPending}>
            <Link2 aria-hidden />
            {created ? 'Gerar outro link' : 'Gerar link de convite'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {created ? (
          <div className="space-y-3 rounded-xl border border-volt-line bg-volt-soft/40 p-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-volt text-volt-ink">
                <Check className="size-4" aria-hidden />
              </span>
              <p className="text-sm font-semibold">Link criado</p>
              <Badge variant="volt" className="ml-auto">
                copie agora
              </Badge>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                readOnly
                value={inviteUrl}
                onFocus={(event) => event.currentTarget.select()}
                className="font-mono text-[11px]"
                aria-label="Link do convite"
              />
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => void copy()} className="flex-1 sm:flex-none">
                  {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
                  {copied ? 'Copiado' : 'Copiar'}
                </Button>
                <Button variant="secondary" size="icon" onClick={() => void share()} aria-label="Compartilhar convite">
                  <Share2 aria-hidden />
                </Button>
              </div>
            </div>
            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted">
              <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-amber" aria-hidden />
              Por segurança, o link completo não é exibido novamente depois que você fechar esta janela.
            </p>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Validade" htmlFor="invite-expiry" hint="padrão 7 dias">
            <Select id="invite-expiry" value={expiryDays} onChange={(event) => setExpiryDays(event.target.value)}>
              <option value="1">1 dia</option>
              <option value="7">7 dias</option>
              <option value="14">14 dias</option>
              <option value="30">30 dias</option>
            </Select>
          </Field>
          <Field label="Limite de usos" htmlFor="invite-uses" optional hint="vazio = ilimitado">
            <Input
              id="invite-uses"
              type="number"
              min={1}
              max={200}
              placeholder="Ex.: 5"
              value={maxUses}
              onChange={(event) => setMaxUses(event.target.value)}
            />
          </Field>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="ds-label">Links deste grupo</p>
            {invitesQuery.isFetching ? (
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-faint">atualizando</span>
            ) : null}
          </div>
          {invitesQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (invitesQuery.data?.length ?? 0) === 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-line p-3 text-[11px] text-muted">
              <Ticket className="size-4 text-faint" aria-hidden />
              Nenhum convite gerado ainda.
            </div>
          ) : (
            <ul className="space-y-1.5">
              {invitesQuery.data?.map((invite) => {
                const revoked = Boolean(invite.revokedAt);
                const expired = new Date(invite.expiresAt).getTime() < Date.now();
                const exhausted = invite.maxUses != null && invite.uses >= invite.maxUses;
                const active = !revoked && !expired && !exhausted;
                return (
                  <li
                    key={invite.id}
                    className="flex items-center gap-3 rounded-xl border border-line bg-card-2 px-3 py-2"
                  >
                    <span
                      className={cn(
                        'size-1.5 shrink-0 rounded-full',
                        active ? 'bg-volt' : 'bg-faint',
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[11px] text-fg">
                        {invite.uses} {invite.maxUses ? `/ ${invite.maxUses}` : ''} usos
                      </p>
                      <p className="truncate text-[10px] text-faint">
                        {revoked
                          ? 'revogado'
                          : expired
                            ? 'expirado'
                            : exhausted
                              ? 'esgotado'
                              : `expira ${formatDateTime(invite.expiresAt)}`}
                      </p>
                    </div>
                    <Badge variant={active ? 'volt' : 'outline'} size="sm">
                      {active ? 'ativo' : 'inativo'}
                    </Badge>
                    {active ? (
                      <Button
                        variant="danger-ghost"
                        size="icon-sm"
                        onClick={() => void handleRevoke(invite.id)}
                        aria-label="Revogar convite"
                        title="Revogar convite"
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
