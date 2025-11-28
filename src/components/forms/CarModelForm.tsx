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
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CarModelFormProps {
  initialData: (CarModel & { years?: number[] }) | null;
  carMakes: CarMake[];
  onSuccess?: () => void;
}

const CarModelForm = ({
  initialData,
  carMakes,
  onSuccess,
}: CarModelFormProps) => {
  const router = useRouter();
  const [startYear, setStartYear] = React.useState<string>("");
  const [endYear, setEndYear] = React.useState<string>("");

  // Get initial years from initialData (if it has years field or from compatibilities)
  const initialYears = React.useMemo(() => {
    if (initialData?.years && Array.isArray(initialData.years)) {
      return initialData.years;
    }
    return [];
  }, [initialData]);

  const form = useForm<z.infer<typeof CarModelValidators>>({
    resolver: zodResolver(CarModelValidators),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      makeId: initialData?.makeId || "",
      years: initialYears.length > 0 ? initialYears : undefined,
    },
  });

  // Update form when initialData changes (for edit mode)
  React.useEffect(() => {
    if (initialData) {
      form.setValue("name", initialData.name || "");
      form.setValue("makeId", initialData.makeId || "");
      const years = (initialData as any).years && Array.isArray((initialData as any).years)
        ? (initialData as any).years
        : [];
      form.setValue("years", years.length > 0 ? years : undefined);
    }
  }, [initialData, form]);

  const { isSubmitting } = form.formState;
  const years = form.watch("years") || [];

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
            <FormField
              control={form.control}
              name="years"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Years of Manufacture <span className="text-muted-foreground text-sm">(Optional)</span>
                  </FormLabel>
                  <div className="space-y-3">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <FormLabel className="text-sm text-muted-foreground">Start Year</FormLabel>
                        <Input
                          type="number"
                          placeholder="e.g. 2015"
                          value={startYear}
                          onChange={(e) => setStartYear(e.target.value)}
                          disabled={isSubmitting}
                          min={1900}
                          max={2100}
                        />
                      </div>
                      <div className="flex-1">
                        <FormLabel className="text-sm text-muted-foreground">End Year</FormLabel>
                        <Input
                          type="number"
                          placeholder="e.g. 2025"
                          value={endYear}
                          onChange={(e) => setEndYear(e.target.value)}
                          disabled={isSubmitting}
                          min={1900}
                          max={2100}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          const start = parseInt(startYear, 10);
                          const end = parseInt(endYear, 10);

                          if (isNaN(start) || isNaN(end)) {
                            toast.error("Please enter valid start and end years");
                            return;
                          }

                          if (start < 1900 || start > 2100 || end < 1900 || end > 2100) {
                            toast.error("Years must be between 1900 and 2100");
                            return;
                          }

                          if (start > end) {
                            toast.error("Start year must be less than or equal to end year");
                            return;
                          }

                          // Generate array of years from start to end
                          const yearArray: number[] = [];
                          for (let year = start; year <= end; year++) {
                            yearArray.push(year);
                          }

                          // Merge with existing years and remove duplicates
                          const currentYears = field.value || [];
                          const mergedYears = [...new Set([...currentYears, ...yearArray])].sort(
                            (a, b) => a - b
                          );

                          field.onChange(mergedYears);
                          setStartYear("");
                          setEndYear("");
                          toast.success(`Added years ${start}-${end}`);
                        }}
                        disabled={isSubmitting || !startYear || !endYear}
                        variant="outline"
                      >
                        Add Range
                      </Button>
                    </div>

                    {/* Display selected years */}
                    {years.length > 0 && (
                      <div className="space-y-2">
                        <FormLabel className="text-sm">Selected Years ({years.length})</FormLabel>
                        <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px]">
                          {years.map((year) => (
                            <Badge
                              key={year}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {year}
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(years.filter((y) => y !== year));
                                }}
                                disabled={isSubmitting}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            field.onChange([]);
                            setStartYear("");
                            setEndYear("");
                          }}
                          disabled={isSubmitting || years.length === 0}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                  </div>
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

