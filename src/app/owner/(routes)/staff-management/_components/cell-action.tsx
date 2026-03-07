"use client";

import React from "react";

import { EditIcon, ArchiveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import AlertModal from "@/components/globals/AlertModal";
import { toast } from "sonner";
import { deleteStaff } from "@/actions";
import { Staff } from "@prisma/client";

const CellActions = ({ staff }: { staff: Staff }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const handleDelete = async () => {
    try {
      const response = await deleteStaff(staff.id);
      if (response.error) {
        toast.error(response.error);
        return;
      }
      toast.success("Staff deleted successfully");
      router.refresh();
    } catch (error) {
      console.log(error);
    } finally {
      setIsOpen(false);
    }
  };
  return (
    <>
      <AlertModal
        onConfirm={handleDelete}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/admin/staff-management/${staff.id}`)}
        >
          <EditIcon className="size-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => setIsOpen(true)}
        >
          <ArchiveIcon className="size-4" />
        </Button>
      </div>
    </>
  );
};

export default CellActions;
