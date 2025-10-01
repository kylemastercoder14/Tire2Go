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
import { PromotionValidators } from "@/validators";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPromotion, updatePromotion } from "@/actions";
import { Promotions } from "@prisma/client";
import ImageUpload from "@/components/globals/ImageUpload";
import { RichTextEditor } from "@/components/globals/RichTextEditor";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/globals/DatePicker";

const PromotionForm = ({ initialData }: { initialData: Promotions | null }) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof PromotionValidators>>({
    resolver: zodResolver(PromotionValidators),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      criteria: initialData?.criteria || "",
      startDate: initialData?.startDate || undefined,
      endDate: initialData?.endDate || undefined,
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof PromotionValidators>) {
    try {
      let response;
      if (initialData?.id) {
        // If initialData.id exists, it's an update (PUT)
        response = await updatePromotion(initialData.id, values);
      } else {
        // Otherwise, it's a new creation (POST)
        response = await createPromotion(values);
      }

      if (response.error) {
        console.error("API Error:", response.error);
        toast.error(response.error || "An error occurred.");
        return;
      }

      toast.success(response.success || "Promotion saved successfully!");
      router.push("/admin/promotions-and-discounts");
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to save promotion. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6">
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
                    placeholder="Enter promotion name (e.g. BUY 3 TIRES, GET 1 FREE!)"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid lg:grid-cols-2 grid-cols-1 gap-3.5">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Start Date <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      descriptionText="Promotion starts on {date}."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    End Date <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      descriptionText="Promotion ends on {date}."
                    />
                  </FormControl>
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
                    disabled={isSubmitting}
                    {...field}
                    placeholder="Enter the promotion description here..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="criteria"
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
                    placeholder="Enter the promotion criteria here..."
                  />
                </FormControl>
                <FormDescription>
                  List what is included with the promotion (e.g., valid only,
                  additional detail, DTI permit if any).
                </FormDescription>
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
                  Thumbnail <span className="text-red-600">*</span>
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

export default PromotionForm;
