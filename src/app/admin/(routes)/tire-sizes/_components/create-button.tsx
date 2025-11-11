"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import TireSizeForm from "@/components/forms/TireSizeForm";
import { useRouter } from "next/navigation";

const CreateTireSizeButton = () => {
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
          Create new tire size
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Tire Size</DialogTitle>
        </DialogHeader>
        <TireSizeForm initialData={null} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateTireSizeButton;
