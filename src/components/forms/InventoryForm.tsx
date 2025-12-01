"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventoryValidators } from "@/validators";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createInventory, updateInventory } from "@/actions";
import { InventoryWithProduct, ProductWithBrand } from "@/types";
import Image from "next/image";

const InventoryForm = ({
  initialData,
  products,
}: {
  initialData: InventoryWithProduct | null;
  products: ProductWithBrand[];
}) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof InventoryValidators>>({
    resolver: zodResolver(InventoryValidators),
    mode: "onChange",
    defaultValues: {
      productId: initialData?.productId || "",
      quantity: initialData?.quantity ?? 0,
      minStock: initialData?.minStock ?? 0,
      maxStock: initialData?.maxStock ?? 0,
      sku: initialData?.sku || "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof InventoryValidators>) {
    try {
      // Client-side guard to mirror server-side validation
      if (values.quantity < values.minStock) {
        toast.error("Quantity cannot be less than min stock");
        return;
      }

      let response;
      if (initialData?.id) {
        // If initialData.id exists, it's an update (PUT)
        response = await updateInventory(initialData.id, values);
      } else {
        // Otherwise, it's a new creation (POST)
        response = await createInventory(values);
      }

      if (response.error) {
        console.error("API Error:", response.error);
        toast.error(response.error || "An error occurred.");
        return;
      }

      toast.success(response.success || "Stock item saved successfully!");
      router.push("/admin/inventory-management");
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to save stock item. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Product <span className="text-red-600">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem
                        className="flex items-center gap-2"
                        key={product.id}
                        value={product.id}
                      >
                        <div className="relative size-7">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="size-full object-contain"
                          />
                        </div>
                        {product.name} - {product.tireSize} (
                        {product.brand.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Stock <span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter product stock"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  This is the actual stock level of the product.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-3.5">
            <FormField
              control={form.control}
              name="minStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Minimum Stock <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter minimum stock"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Threshold to trigger low stock alerts.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Maximum Stock{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
					  type="number"
                      placeholder="Enter maximum stock"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the max capacity or the warehouse limit.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  SKU <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter SKU"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Stock Keeping Unit identifier for the product.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="ghost"
              className="w-fit"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-fit" disabled={isSubmitting}>
              {initialData ? "Save Changes" : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default InventoryForm;
