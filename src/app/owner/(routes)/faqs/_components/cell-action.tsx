"use client";

import React from "react";

import { EditIcon, ArchiveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import AlertModal from "@/components/globals/AlertModal";
import { toast } from "sonner";
import { deleteFaqs } from "@/actions";
import { Faqs } from "@prisma/client";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";

const CellActions = ({ topic }: { topic: Faqs }) => {
  const router = useRouter();
  const { can } = useAdminPermissions();
  const [isOpen, setIsOpen] = React.useState(false);
  const canDelete = can("faqs", "delete");

  const handleDelete = async () => {
    try {
      const response = await deleteFaqs(topic.id);
      if (response.error) {
        toast.error(response.error);
        return;
      }
      toast.success(response.success || "FAQ deleted successfully");
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete FAQ");
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
          onClick={() => router.push(`/admin/faqs/${topic.id}`)}
        >
          <EditIcon className="size-4" />
        </Button>
        {canDelete && (
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setIsOpen(true)}
          >
            <ArchiveIcon className="size-4" />
          </Button>
        )}
      </div>
    </>
  );
};

export default CellActions;
