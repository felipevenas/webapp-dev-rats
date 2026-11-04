import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { toAppError } from '@/core/http/problem';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useDeleteGroup } from '@/features/groups/data/use-groups';

interface DeleteGroupModalProps {
  groupId: string;
  groupName: string;
  participantCount: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteGroupModal({
  groupId,
  groupName,
  participantCount,
  open,
  onOpenChange,
}: DeleteGroupModalProps) {
  const navigate = useNavigate();
  const deleteGroup = useDeleteGroup(groupId);
  const [confirmation, setConfirmation] = useState('');

  const close = () => {
    setConfirmation('');
    onOpenChange(false);
  };

  /**
   * Keeps the dialog open while the permanent deletion is in flight so the
   * success handler can close it and navigate without a race.
   */
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && deleteGroup.isPending) return;
    if (!nextOpen) setConfirmation('');
    onOpenChange(nextOpen);
  };

  /** Deletes the group, closes the dialog and returns to the dashboard. */
  const handleDelete = async () => {
    if (!navigator.onLine) {
      toast.error('Sem conexão. Tente novamente quando estiver online.');
      return;
    }
    try {
      await deleteGroup.mutateAsync();
      toast.success(`O grupo "${groupName}" foi excluído.`);
      close();
      navigate('/app');
    } catch (error) {
      toast.error(toAppError(error).detail);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="Excluir grupo permanentemente"
      description="Esta ação não pode ser desfeita."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={deleteGroup.isPending}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => void handleDelete()}
            loading={deleteGroup.isPending}
            disabled={confirmation.trim() !== groupName.trim()}
          >
            <Trash2 aria-hidden />
            Excluir grupo
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-[12px] leading-relaxed text-muted">
          O grupo, o desafio atual, o ranking e todo o histórico de dias válidos serão apagados definitivamente.
          Os arquivos e repositórios do GitHub não são afetados.
        </p>
        <div className="flex items-start gap-2 rounded-lg border border-rose/25 bg-rose-soft p-2.5 text-[11px] leading-relaxed text-muted">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-rose" aria-hidden />
          {participantCount == null
            ? 'A lista de participantes não está disponível agora. Os participantes ativos serão notificados sobre a exclusão.'
            : participantCount > 0
              ? `${participantCount} ${participantCount === 1 ? 'participante será notificado' : 'participantes serão notificados'} sobre a exclusão.`
              : 'Não há outros participantes ativos para notificar.'}
        </div>
        <Field label="Confirmação" htmlFor="delete-group-confirmation" hint={groupName}>
          <Input
            id="delete-group-confirmation"
            value={confirmation}
            autoComplete="off"
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={groupName}
          />
        </Field>
        <p className="text-[11px] leading-relaxed text-faint">
          Digite o nome do grupo exatamente como aparece acima para liberar a exclusão.
        </p>
      </div>
    </Modal>
  );
}
