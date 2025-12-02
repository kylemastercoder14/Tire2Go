"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
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
import { BrandValidators } from "@/validators";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBrand, updateBrand } from "@/actions";
import { Brands } from "@prisma/client";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/globals/ImageUpload";
import Hint from "@/components/globals/Hint";
import Image from "next/image";

const BrandForm = ({ initialData }: { initialData: Brands | null }) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof BrandValidators>>({
    resolver: zodResolver(BrandValidators),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      logo: initialData?.logo || "",
      thumbnail: initialData?.thumbnail || "",
      type: initialData?.type || "",
      colorScheme: initialData?.colorScheme
        ? (typeof initialData.colorScheme === 'object' && initialData.colorScheme !== null
            ? initialData.colorScheme as { primary: string; secondary: string; accent?: string }
            : undefined)
        : {
            primary: "#c02b2b",
            secondary: "#dc2626",
            accent: "#ef4444",
          },
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof BrandValidators>) {
    try {
      let response;
      if (initialData?.id) {
        // If initialData.id exists, it's an update (PUT)
        response = await updateBrand(initialData.id, values);
      } else {
        // Otherwise, it's a new creation (POST)
        response = await createBrand(values);
      }

      if (response.error) {
        console.error("API Error:", response.error);
        toast.error(response.error || "An error occurred.");
        return;
      }

      toast.success(response.success || "Brand saved successfully!");
      router.push("/admin/brands");
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to save brand. Please try again.");
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
                      placeholder="Enter brand name (e.g. Dunlop)"
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Type <span className="text-red-600">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a type brand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Mid-Range">Mid-Range</SelectItem>
                      <SelectItem value="Budget">Budget</SelectItem>
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
                  <Textarea
                    placeholder="Enter the brand description here..."
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
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <div className="flex items-center gap-2">
                    Logo <span className="text-red-600">*</span>
                    <Hint>
                      <div className="flex flex-col items-center justify-center">
                        <Image
                          src="/DUNLOP.png"
                          alt="dunlop Logo"
                          width={200}
                          height={200}
                        />
                      </div>
                    </Hint>
                  </div>
                </FormLabel>
                <FormControl>
                  <ImageUpload
                    imageCount={1}
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
            name="thumbnail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <div className="flex items-center gap-2">
                    Thumbnail <span className="text-red-600">*</span>
                    <Hint>
                      <div className="flex flex-col items-center justify-center">
                        <Image
                          src="https://gogulong.com/wp-content/uploads/2022/02/michelin-banner-desktop-2022.jpg"
                          alt="Thumbnail"
                          width={300}
                          height={300}
                        />
                      </div>
                    </Hint>
                  </div>
                </FormLabel>
                <FormControl>
                  <ImageUpload
                    imageCount={1}
                    maxSize={6}
                    onImageUpload={(url) => field.onChange(url)}
                    defaultValue={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Color Scheme Section */}
          <div className="space-y-4 border-t pt-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Color Scheme</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Customize the brand colors that will be displayed on customer-facing pages. Colors should be in hex format (e.g., #c02b2b).
              </p>
            </div>

            <div className="grid lg:grid-cols-3 grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="colorScheme.primary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Primary Color <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={field.value || "#c02b2b"}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                          disabled={isSubmitting}
                          className="w-16 h-10 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <Input
                          type="text"
                          placeholder="#c02b2b"
                          value={field.value || ""}
                          onChange={(e) => {
                            // Ensure hex format
                            const value = e.target.value.trim();
                            if (value === "" || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
                              field.onChange(value || "#c02b2b");
                            }
                          }}
                          disabled={isSubmitting}
                          className="flex-1"
                        />
                        <div
                          className="w-12 h-10 rounded border border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: field.value || "#c02b2b" }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colorScheme.secondary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Secondary Color <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={field.value || "#dc2626"}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                          disabled={isSubmitting}
                          className="w-16 h-10 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <Input
                          type="text"
                          placeholder="#dc2626"
                          value={field.value || ""}
                          onChange={(e) => {
                            // Ensure hex format
                            const value = e.target.value.trim();
                            if (value === "" || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
                              field.onChange(value || "#dc2626");
                            }
                          }}
                          disabled={isSubmitting}
                          className="flex-1"
                        />
                        <div
                          className="w-12 h-10 rounded border border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: field.value || "#dc2626" }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colorScheme.accent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Accent Color <span className="text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={field.value || "#ef4444"}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                          disabled={isSubmitting}
                          className="w-16 h-10 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <Input
                          type="text"
                          placeholder="#ef4444"
                          value={field.value || ""}
                          onChange={(e) => {
                            // Ensure hex format
                            const value = e.target.value.trim();
                            if (value === "" || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
                              field.onChange(value || undefined);
                            }
                          }}
                          disabled={isSubmitting}
                          className="flex-1"
                        />
                        <div
                          className="w-12 h-10 rounded border border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: field.value || "#ef4444" }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

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

export default BrandForm;
