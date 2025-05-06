
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateBlockForm } from "./form/CreateBlockForm";

interface CreateBlockDialogProps {
  farmId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateBlockDialog({
  farmId,
  isOpen,
  onClose,
  onSuccess,
}: CreateBlockDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{t("blocks.createBlock")}</DialogTitle>
        </DialogHeader>

        <CreateBlockForm
          farmId={farmId}
          onCancel={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
