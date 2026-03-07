"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CarMakeForm from "@/components/forms/CarMakeForm";
import { useRouter } from "next/navigation";

const CreateCarMakeButton = () => {
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
          Create new car make
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Car Make</DialogTitle>
        </DialogHeader>
        <CarMakeForm initialData={null} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateCarMakeButton;
