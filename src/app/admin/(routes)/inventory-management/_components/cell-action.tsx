"use client";

import React from "react";

import { EditIcon, ArchiveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import AlertModal from "@/components/globals/AlertModal";
import { toast } from "sonner";
import { InventoryWithProduct } from "@/types";
import { deleteInventory } from "@/actions";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";

const CellActions = ({ inventory }: { inventory: InventoryWithProduct }) => {
  const router = useRouter();
  const { can } = useAdminPermissions();
  const [isOpen, setIsOpen] = React.useState(false);
  const canDelete = can("inventoryManagement", "delete");

  const handleDelete = async () => {
    try {
      const response = await deleteInventory(inventory.id);
      if (response.error) {
        toast.error(response.error);
        return;
      }
      toast.success("Inventory item deleted successfully");
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
          onClick={() =>
            router.push(`/admin/inventory-management/${inventory.id}`)
          }
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
