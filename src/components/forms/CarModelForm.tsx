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
import { CarModelValidators } from "@/validators";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCarModel, updateCarModel } from "@/actions";
import { CarMake, CarModel } from "@prisma/client";

interface CarModelFormProps {
  initialData: CarModel | null;
  carMakes: CarMake[];
  onSuccess?: () => void;
}

const CarModelForm = ({
  initialData,
  carMakes,
  onSuccess,
}: CarModelFormProps) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof CarModelValidators>>({
    resolver: zodResolver(CarModelValidators),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      makeId: initialData?.makeId || "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof CarModelValidators>) {
    try {
      let response;
      if (initialData?.id) {
        response = await updateCarModel(initialData.id, values);
      } else {
        response = await createCarModel(values);
      }

      if (response.error) {
        console.error("API Error:", response.error);
        toast.error(response.error || "An error occurred.");
        return;
      }

      toast.success(response.success || "Car model saved successfully!");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/car-models");
      }
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to save car model. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 mt-3">
          <div className="grid grid-cols-1 gap-5">
            <FormField
              control={form.control}
              name="makeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Car Make <span className="text-red-600">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a car make" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {carMakes.map((make) => (
                        <SelectItem key={make.id} value={make.id}>
                          {make.name}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Model Name <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter car model name (e.g. VIOS, LANCER)"
                      {...field}
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

export default CarModelForm;

