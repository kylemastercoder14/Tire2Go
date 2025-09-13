"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { updateStockQuantity } from "@/actions";
import { InventoryResponse } from "@/types";

const UpdateStock = ({ id, stock }: { id: string; stock: number }) => {
  const router = useRouter();
  const [value, setValue] = useState<number>(stock);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    try {
      // ✅ call the action directly
      const promise = updateStockQuantity(id, value);

      toast.promise(promise, {
        loading: `Saving ${value}...`,
        success: (data: InventoryResponse) =>
          data.success || "Stock updated successfully",
        error: (err: unknown) =>
          err instanceof Error ? err.message : "Failed to update stock",
      });

      // ✅ wait for the result separately
      const response = await promise;

      if (response.success) {
        router.refresh();
      } else if (response.error) {
        toast.error(response.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Unexpected error while updating stock");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Label htmlFor={`${id}-stock`} className="sr-only">
        Stock
      </Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onBlur={() => handleSubmit()} // auto-save on blur
        className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-18 border-transparent bg-transparent text-left shadow-none focus-visible:border dark:bg-transparent"
        id={`${id}-stock`}
      />
    </form>
  );
};

export default UpdateStock;
