import { UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface RemoveFriendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friendName?: string | null;
  loading?: boolean;
  onConfirm: () => void;
}

export function RemoveFriendModal({
  open,
  onOpenChange,
  friendName,
  loading,
  onConfirm,
}: RemoveFriendModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Remover amizade?"
      description={
        friendName
          ? `Você e ${friendName} deixarão de ver a presença um do outro.`
          : 'Vocês deixarão de ver a presença um do outro.'
      }
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} disabled={loading}>
            <UserMinus aria-hidden />
            Remover amizade
          </Button>
        </>
      }
    >
      <p className="text-[12px] leading-relaxed text-muted">
        A amizade é removida para os dois lados. A presença deixa de aparecer imediatamente e vocês
        podem enviar uma nova solicitação quando quiserem.
      </p>
    </Modal>
  );
}
