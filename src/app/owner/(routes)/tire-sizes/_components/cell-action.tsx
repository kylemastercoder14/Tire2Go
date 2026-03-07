"use client";

import AlertModal from "@/components/globals/AlertModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TireSize } from "@prisma/client";
import { ArchiveIcon, EditIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteTireSize } from "@/actions";
import TireSizeForm from "@/components/forms/TireSizeForm";

interface CellActionProps {
  tireSize: TireSize;
}

export const CellActions: React.FC<CellActionProps> = ({ tireSize }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    try {
      setLoading(true);
      await deleteTireSize(tireSize.id);
      toast.success("Tire size deleted.");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleEditSuccess = () => {
    setEditOpen(false);
    router.refresh();
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tire Size</DialogTitle>
          </DialogHeader>
          <TireSizeForm initialData={tireSize} onSuccess={handleEditSuccess} />
        </DialogContent>
      </Dialog>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setEditOpen(true)}
        >
          <EditIcon className="size-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => setOpen(true)}
        >
          <ArchiveIcon className="size-4" />
        </Button>
      </div>
    </>
  );
};

export default CellActions;
