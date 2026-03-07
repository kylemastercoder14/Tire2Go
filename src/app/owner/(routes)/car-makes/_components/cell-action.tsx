"use client";

import AlertModal from "@/components/globals/AlertModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CarMake } from "@prisma/client";
import { ArchiveIcon, EditIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteCarMake } from "@/actions";
import CarMakeForm from "@/components/forms/CarMakeForm";

interface CellActionProps {
  carMake: CarMake;
}

export const CellActions: React.FC<CellActionProps> = ({ carMake }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    try {
      setLoading(true);
      await deleteCarMake(carMake.id);
      toast.success("Car make deleted.");
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
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Car Make</DialogTitle>
          </DialogHeader>
          <CarMakeForm initialData={carMake} onSuccess={handleEditSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CellActions;
