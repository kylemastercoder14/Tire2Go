"use client";

import React from "react";

import { EditIcon, ArchiveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import AlertModal from "@/components/globals/AlertModal";
import { toast } from "sonner";
import { ProductWithBrand } from "@/types";
import { deleteProduct } from "@/actions";

const CellActions = ({ product }: { product: ProductWithBrand }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const handleDelete = async () => {
    try {
      const response = await deleteProduct(product.id);
      if (response.error) {
        toast.error(response.error);
        return;
      }
      toast.success("Product deleted successfully");
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
      <div className="flex items-center gap-2 ml-2.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/products/${product.id}`)}
          className="h-8"
        >
          <EditIcon className="size-4" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="h-8 text-destructive hover:text-destructive"
        >
          <ArchiveIcon className="size-4" />
          Delete
        </Button>
      </div>
    </>
  );
};

export default CellActions;
