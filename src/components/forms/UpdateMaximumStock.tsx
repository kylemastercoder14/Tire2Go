"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { updateMaximumStock } from "@/actions";
import { InventoryResponse } from "@/types";

const UpdateMaximumStock = ({
  id,
  maximumStock,
}: {
  id: string;
  maximumStock: number;
}) => {
  const router = useRouter();
  const [value, setValue] = useState<number>(maximumStock);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    try {
      const promise = updateMaximumStock(id, value);

      toast.promise(promise, {
        loading: `Saving ${value}...`,
        success: (data: InventoryResponse) =>
          data.success || "Maximum stock updated successfully",
        error: (err: unknown) =>
          err instanceof Error ? err.message : "Failed to update maximum stock",
      });

      const response = await promise;

      if (response.success) {
        router.refresh();
      } else if (response.error) {
        toast.error(response.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Unexpected error while updating maximum stock");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Label htmlFor={`${id}-max-stock`} className="sr-only">
        Maximum Stock
      </Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onBlur={() => handleSubmit()}
        className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-18 border-transparent bg-transparent text-left shadow-none focus-visible:border dark:bg-transparent"
        id={`${id}-max-stock`}
      />
    </form>
  );
};

export default UpdateMaximumStock;
