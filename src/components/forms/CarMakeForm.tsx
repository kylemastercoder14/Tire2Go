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
import { CarMakeValidators } from "@/validators";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCarMake, updateCarMake } from "@/actions";
import { CarMake } from "@prisma/client";

interface CarMakeFormProps {
  initialData: CarMake | null;
  onSuccess?: () => void;
}

const CarMakeForm = ({ initialData, onSuccess }: CarMakeFormProps) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof CarMakeValidators>>({
    resolver: zodResolver(CarMakeValidators),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof CarMakeValidators>) {
    try {
      let response;
      if (initialData?.id) {
        response = await updateCarMake(initialData.id, values);
      } else {
        response = await createCarMake(values);
      }

      if (response.error) {
        console.error("API Error:", response.error);
        toast.error(response.error || "An error occurred.");
        return;
      }

      toast.success(response.success || "Car make saved successfully!");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/car-makes");
      }
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to save car make. Please try again.");
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
                    placeholder="Enter car make name (e.g. TOYOTA, MITSUBISHI)"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

export default CarMakeForm;

