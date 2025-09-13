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
import { ProductValidators } from "@/validators";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/actions";
import { Brands, Products } from "@prisma/client";
import ImageUpload from "@/components/globals/ImageUpload";
import { RichTextEditor } from "@/components/globals/RichTextEditor";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";

const ProductForm = ({
  initialData,
  brands,
}: {
  initialData: Products | null;
  brands: Brands[];
}) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof ProductValidators>>({
    resolver: zodResolver(ProductValidators),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price ?? 0,
      isClearanceSale: initialData?.isClearanceSale || true,
      discountedPrice: initialData?.discountedPrice ?? 0,
      images: initialData?.images || [],
      inclusion: initialData?.inclusion || "",
      warranty: initialData?.warranty || "",
      tireSize: initialData?.tireSize || "",
      brandId: initialData?.brandId || "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof ProductValidators>) {
    try {
      let response;
      if (initialData?.id) {
        // If initialData.id exists, it's an update (PUT)
        response = await updateProduct(initialData.id, values);
      } else {
        // Otherwise, it's a new creation (POST)
        response = await createProduct(values);
      }

      if (response.error) {
        console.error("API Error:", response.error);
        toast.error(response.error || "An error occurred.");
        return;
      }

      toast.success(response.success || "Product saved successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to save product. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-3.5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter product name (e.g. GRANDTREK AT25)"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tireSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tire Size <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter tire size (e.g. 265/65 R17 4PR)"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid lg:grid-cols-2 grid-cols-1 gap-3.5">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Original Price <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter product price"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brandId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Brand <span className="text-red-600">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a brand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem
                          className="flex items-center gap-2"
                          key={brand.id}
                          value={brand.id}
                        >
                          <div className="relative size-10">
                            <Image
                              src={brand.logo}
                              alt={brand.name}
                              fill
                              className="size-full object-contain"
                            />
                          </div>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description <span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <RichTextEditor
                    onChangeAction={field.onChange}
                    disabled={isSubmitting}
                    value={field.value}
                    placeholder="Enter the product description here..."
                  />
                </FormControl>
                <FormDescription>
                  Provide a detailed description of the product including
                  it&apos;s features and specifications.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inclusion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Inclusion <span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <RichTextEditor
                    onChangeAction={field.onChange}
                    disabled={isSubmitting}
                    value={field.value}
                    placeholder="Enter the product inclusion here..."
                  />
                </FormControl>
                <FormDescription>
                  List what is included with the product (e.g., accessories and
                  other freebies).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="warranty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Warranty <span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <RichTextEditor
                    onChangeAction={field.onChange}
                    disabled={isSubmitting}
                    value={field.value}
                    placeholder="Enter the product warranty here..."
                  />
                </FormControl>
                <FormDescription>
                  Specify the warranty details for the product.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Images <span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <ImageUpload
                    imageCount={4}
                    maxSize={2}
                    onImageUpload={(url) => field.onChange(url)}
                    defaultValue={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isClearanceSale"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3 rounded-lg border p-3">
                <FormControl>
                  <Checkbox
                    id="isClearanceSale"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                    className="data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white dark:data-[state=checked]:border-primary dark:data-[state=checked]:bg-primary"
                  />
                </FormControl>
                <div className="grid gap-1.5 font-normal">
                  <p className="data-[state=checked]:text-white text-sm leading-none font-medium">
                    Clearance Sale
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Check this box if the product is on clearance sale.
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("isClearanceSale") && (
            <FormField
              control={form.control}
              name="discountedPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Discounted Price{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter discounted price"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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

export default ProductForm;
