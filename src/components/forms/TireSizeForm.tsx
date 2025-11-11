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
import { TireSizeValidators } from "@/validators";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createTireSize, updateTireSize } from "@/actions";
import { TireSize } from "@prisma/client";

interface TireSizeFormProps {
  initialData: TireSize | null;
  onSuccess?: () => void;
}

const TireSizeForm = ({ initialData, onSuccess }: TireSizeFormProps) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof TireSizeValidators>>({
    resolver: zodResolver(TireSizeValidators),
    mode: "onChange",
    defaultValues: {
      width: initialData?.width || 0,
      ratio: initialData?.ratio || 0,
      diameter: initialData?.diameter || 0,
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof TireSizeValidators>) {
    try {
      let response;
      if (initialData?.id) {
        response = await updateTireSize(initialData.id, values);
      } else {
        response = await createTireSize(values);
      }

      if (response.error) {
        console.error("API Error:", response.error);
        toast.error(response.error || "An error occurred.");
        return;
      }

      toast.success(response.success || "Tire size saved successfully!");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/tire-sizes");
      }
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to save tire size. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 mt-3">
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Width <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter width (e.g. 205)"
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
              name="ratio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Aspect Ratio <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter ratio (e.g. 50)"
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
              name="diameter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Rim Diameter <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter diameter (e.g. 16)"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center gap-2">
            {!onSuccess && (
              <Button
                type="button"
                onClick={() => router.back()}
                variant="ghost"
                className="w-fit"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" className="w-fit" disabled={isSubmitting}>
              {initialData ? "Save Changes" : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default TireSizeForm;

