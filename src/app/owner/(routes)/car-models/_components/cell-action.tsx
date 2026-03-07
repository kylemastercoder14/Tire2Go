"use client";

import AlertModal from "@/components/globals/AlertModal";
import { Button } from "@/components/ui/button";
import { CarMake, CarModel } from "@prisma/client";
import { ArchiveIcon, EditIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteCarModel } from "@/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CarModelForm from '@/components/forms/CarModelForm';

interface CellActionProps {
  carModel: CarModel & {
    make: CarMake;
  };
  carMakes: CarMake[];
}

export const CellActions: React.FC<CellActionProps> = ({ carModel, carMakes }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    try {
      setLoading(true);
      await deleteCarModel(carModel.id);
      toast.success("Car model deleted.");
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
            <DialogTitle>Edit Car Model</DialogTitle>
          </DialogHeader>
          <CarModelForm initialData={carModel} carMakes={carMakes} onSuccess={handleEditSuccess} />
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
