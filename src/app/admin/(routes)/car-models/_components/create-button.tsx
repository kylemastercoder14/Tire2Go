"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CarModelForm from "@/components/forms/CarModelForm";
import { useRouter } from "next/navigation";
import { CarMake } from "@prisma/client";

interface CreateCarModelButtonProps {
  carMakes: CarMake[];
}

const CreateCarModelButton = ({ carMakes }: CreateCarModelButtonProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <IconPlus className="size-4" />
          Create new car model
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Car Model</DialogTitle>
        </DialogHeader>
        <CarModelForm initialData={null} carMakes={carMakes} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateCarModelButton;
