"use client";

import React, { useMemo, useState } from "react";
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
import {
  Brands,
  TireSize,
  CarMake,
  CarModel,
} from "@prisma/client";
import ImageUpload from "@/components/globals/ImageUpload";
import { RichTextEditor } from "@/components/globals/RichTextEditor";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductWithRelations, ProductSizeWithPricing } from "@/types";

const ProductForm = ({
  initialData,
  brands,
  tireSizes,
  carMakes,
  carModels,
}: {
  initialData: ProductWithRelations | null;
  brands: Brands[];
  tireSizes: TireSize[];
  carMakes: CarMake[];
  carModels: CarModel[];
}) => {
  const router = useRouter();
  const [tireSizeSearch, setTireSizeSearch] = useState("");
  const [isClearanceSale, setIsClearanceSale] = useState(false);
  const [tireSizePricing, setTireSizePricing] = useState<Record<string, {
    price: number;
    discountedPrice?: number;
  }>>({});

  // Get models grouped by make for easier selection
  const modelsByMake = useMemo(() => {
    const grouped: Record<string, CarModel[]> = {};
    carModels.forEach((model) => {
      if (!grouped[model.makeId]) {
        grouped[model.makeId] = [];
      }
      grouped[model.makeId].push(model);
    });
    return grouped;
  }, [carModels]);

  // Filter tire sizes based on search
  const filteredTireSizes = useMemo(() => {
    if (!tireSizeSearch) return tireSizes;
    return tireSizes.filter((tireSize) => {
      const searchTerm = tireSizeSearch.toLowerCase();
      const displayText = `${tireSize.width}/${tireSize.ratio} R${tireSize.diameter}`.toLowerCase();
      return displayText.includes(searchTerm);
    });
  }, [tireSizes, tireSizeSearch]);

  // Initialize tire size pricing from existing data
  React.useEffect(() => {
    if (initialData?.productSize) {
      const pricing: Record<string, { price: number; discountedPrice?: number }> = {};
      let hasClearanceSale = false;

      initialData.productSize.forEach((ps: ProductSizeWithPricing) => {
        pricing[ps.tireSizeId] = {
          price: ps.price,
          discountedPrice: ps.discountedPrice || undefined,
        };
        if (ps.isClearanceSale) {
          hasClearanceSale = true;
        }
      });

      setTireSizePricing(pricing);
      setIsClearanceSale(hasClearanceSale);
    }
  }, [initialData]);

  const form = useForm<z.infer<typeof ProductValidators>>({
    resolver: zodResolver(ProductValidators),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price ?? 0,
      isClearanceSale: initialData?.isClearanceSale || false,
      discountedPrice: initialData?.discountedPrice ?? undefined,
      images: initialData?.images || [],
      inclusion: initialData?.inclusion || "",
      warranty: initialData?.warranty || "",
      tireSize: initialData?.tireSize || "",
      brandId: initialData?.brandId || "",
      tireSizeIds:
        initialData?.productSize?.map((ps) => ps.tireSizeId) || [],
      compatibilities:
        initialData?.productCompatibility?.map((pc) => ({
          modelId: pc.modelId,
          year: pc.year,
        })) || [],
    },
  });

  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof ProductValidators>) {
    try {
      // Prepare tire size pricing data
      const selectedTireSizeIds = values.tireSizeIds || [];

      if (selectedTireSizeIds.length === 0) {
        toast.error("Please select at least one tire size with pricing.");
        return;
      }

      // Validate that all selected tire sizes have pricing
      const invalidTireSizes: string[] = [];
      const tireSizePricingData = selectedTireSizeIds.map((tireSizeId) => {
        const pricing = tireSizePricing[tireSizeId];
        if (!pricing || pricing.price <= 0) {
          const tireSize = tireSizes.find(ts => ts.id === tireSizeId);
          const displayText = tireSize ? `${tireSize.width}/${tireSize.ratio} R${tireSize.diameter}` : tireSizeId;
          invalidTireSizes.push(displayText);
          return null;
        }
        return {
          tireSizeId,
          price: pricing.price,
          isClearanceSale: isClearanceSale,
          discountedPrice: pricing.discountedPrice,
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null);

      if (invalidTireSizes.length > 0) {
        toast.error(`Please enter a valid price for tire size${invalidTireSizes.length > 1 ? 's' : ''}: ${invalidTireSizes.join(', ')}`);
        return;
      }

      if (tireSizePricingData.length === 0) {
        toast.error("Please select at least one tire size with valid pricing.");
        return;
      }

      const formData = {
        ...values,
        tireSizePricing: tireSizePricingData,
        price: 0, // Set default price for backward compatibility
      };

      let response;
      if (initialData?.id) {
        // If initialData.id exists, it's an update (PUT)
        response = await updateProduct(initialData.id, formData);
      } else {
        // Otherwise, it's a new creation (POST)
        response = await createProduct(formData);
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
      const errorMessage = error instanceof Error ? error.message : "Failed to save product. Please try again.";
      toast.error(errorMessage);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.error("Form validation errors:", errors);
        const firstError = Object.values(errors)[0];
        if (firstError?.message) {
          toast.error(firstError.message as string);
        } else {
          toast.error("Please fix the form errors before submitting.");
        }
      })}>
        <div className="grid gap-8">
          {/* General Information Section */}
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="text-lg font-semibold">General Information</h3>
              <p className="text-sm text-muted-foreground">Basic product details and identification</p>
            </div>

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
          </div>

          {/* Pricing Section */}
          <div className="space-y-6">
            <div className="border-b pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Pricing</h3>
                  <p className="text-sm text-muted-foreground">Set individual pricing for each tire size</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="globalClearanceSale"
                    checked={isClearanceSale}
                    onCheckedChange={(checked) => setIsClearanceSale(checked as boolean)}
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="globalClearanceSale"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Clearance Sale
                  </label>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="tireSizeIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tire Sizes with Pricing{" "}
                    <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        placeholder="Search tire sizes..."
                        value={tireSizeSearch}
                        onChange={(e) => setTireSizeSearch(e.target.value)}
                        className="mb-3"
                      />
                      {filteredTireSizes.length > 0 ? (
                        <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">
                          {filteredTireSizes.map((tireSize) => {
                            const isSelected = field.value?.includes(tireSize.id);
                            const displayText = `${tireSize.width}/${tireSize.ratio} R${tireSize.diameter}`;
                            const pricing = tireSizePricing[tireSize.id] || {
                              price: 0,
                              discountedPrice: undefined,
                            };

                            return (
                              <div
                                key={tireSize.id}
                                className={`border rounded-lg p-4 ${
                                  isSelected ? "border-primary bg-primary/5" : "border-border"
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`tire-${tireSize.id}`}
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, tireSize.id]);
                                        // Initialize pricing for this tire size
                                        setTireSizePricing(prev => ({
                                          ...prev,
                                          [tireSize.id]: {
                                            price: 0,
                                            discountedPrice: undefined,
                                          }
                                        }));
                                      } else {
                                        field.onChange(
                                          current.filter((id) => id !== tireSize.id)
                                        );
                                        // Remove pricing for this tire size
                                        setTireSizePricing(prev => {
                                          const newPricing = { ...prev };
                                          delete newPricing[tireSize.id];
                                          return newPricing;
                                        });
                                      }
                                    }}
                                    disabled={isSubmitting}
                                  />
                                  <label
                                    htmlFor={`tire-${tireSize.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    {displayText}
                                  </label>
                                </div>

                                {isSelected && (
                                  <div className={`grid gap-3 ml-6 mt-3 ${isClearanceSale ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                    <div>
                                      <label className="text-xs text-muted-foreground">
                                        {isClearanceSale ? "Original Price" : "Price"} <span className="text-red-600">*</span>
                                      </label>
                                      <Input
                                        type="number"
                                        placeholder={isClearanceSale ? "Enter original price" : "Enter price"}
                                        value={pricing.price || ""}
                                        onChange={(e) => {
                                          setTireSizePricing(prev => ({
                                            ...prev,
                                            [tireSize.id]: {
                                              ...prev[tireSize.id],
                                              price: parseFloat(e.target.value) || 0,
                                            }
                                          }));
                                        }}
                                        disabled={isSubmitting}
                                        className="h-8"
                                      />
                                    </div>
                                    {isClearanceSale && (
                                      <div>
                                        <label className="text-xs text-muted-foreground">Discounted Price</label>
                                        <Input
                                          type="number"
                                          placeholder="Enter discounted price"
                                          value={pricing.discountedPrice || ""}
                                          onChange={(e) => {
                                            setTireSizePricing(prev => ({
                                              ...prev,
                                              [tireSize.id]: {
                                                ...prev[tireSize.id],
                                                discountedPrice: parseFloat(e.target.value) || undefined,
                                              }
                                            }));
                                          }}
                                          disabled={isSubmitting}
                                          className="h-8"
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No tire sizes found matching &quot;{tireSizeSearch}&quot;
                        </div>
                      )}
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((tireSizeId) => {
                            const tireSize = tireSizes.find(
                              (ts) => ts.id === tireSizeId
                            );
                            if (!tireSize) return null;
                            return (
                              <Badge
                                key={tireSizeId}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {`${tireSize.width}/${tireSize.ratio} R${tireSize.diameter}`}
                                <button
                                  type="button"
                                  onClick={() => {
                                    field.onChange(
                                      field.value?.filter(
                                        (id) => id !== tireSizeId
                                      )
                                    );
                                    // Remove pricing for this tire size
                                    setTireSizePricing(prev => {
                                      const newPricing = { ...prev };
                                      delete newPricing[tireSizeId];
                                      return newPricing;
                                    });
                                  }}
                                  disabled={isSubmitting}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Select tire sizes and set individual pricing for each. At least one tire size with pricing is required.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="text-lg font-semibold">Product Details</h3>
              <p className="text-sm text-muted-foreground">Detailed product information and specifications</p>
            </div>

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
          </div>

          {/* Media Section */}
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="text-lg font-semibold">Media</h3>
              <p className="text-sm text-muted-foreground">Product images and visual content</p>
            </div>

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
          </div>

          {/* Compatibility Section */}
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="text-lg font-semibold">Compatibility</h3>
              <p className="text-sm text-muted-foreground">Car compatibility options</p>
            </div>

            <FormField
              control={form.control}
              name="compatibilities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Car Compatibility{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <div className="grid lg:grid-cols-3 grid-cols-1 gap-3">
                      <Select
                        value={selectedMake}
                        onValueChange={(value) => {
                          setSelectedMake(value);
                          setSelectedModel("");
                          setSelectedYear("");
                        }}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder="Select car make" />
                        </SelectTrigger>
                        <SelectContent>
                          {carMakes.map((make) => (
                            <SelectItem key={make.id} value={make.id}>
                              {make.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedModel}
                        onValueChange={(value) => {
                          setSelectedModel(value);
                          setSelectedYear("");
                        }}
                        disabled={isSubmitting || !selectedMake}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder="Select car model" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedMake &&
                            modelsByMake[selectedMake]?.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Year (e.g. 2020)"
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          disabled={isSubmitting || !selectedModel}
                          min={1900}
                          max={2100}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (!selectedModel || !selectedYear) {
                              toast.error(
                                "Please select both model and year"
                              );
                              return;
                            }
                            const yearNum = parseInt(selectedYear, 10);
                            if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
                              toast.error("Please enter a valid year");
                              return;
                            }
                            const current = field.value || [];
                            const exists = current.some(
                              (c) =>
                                c.modelId === selectedModel &&
                                c.year === yearNum
                            );
                            if (exists) {
                              toast.error(
                                "This compatibility already exists"
                              );
                              return;
                            }
                            field.onChange([
                              ...current,
                              { modelId: selectedModel, year: yearNum },
                            ]);
                            setSelectedMake("");
                            setSelectedModel("");
                            setSelectedYear("");
                          }}
                          disabled={isSubmitting || !selectedModel || !selectedYear}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {field.value && field.value.length > 0 && (
                      <div className="space-y-2">
                        {field.value.map((compat, index) => {
                          const model = carModels.find(
                            (m) => m.id === compat.modelId
                          );
                          const make = model
                            ? carMakes.find((m) => m.id === model.makeId)
                            : null;
                          return (
                            <Badge
                              key={`${compat.modelId}-${compat.year}-${index}`}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {make?.name} - {model?.name} ({compat.year})
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(
                                    field.value?.filter(
                                      (_, i) => i !== index
                                    )
                                  );
                                }}
                                disabled={isSubmitting}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Add car makes, models, and years that are compatible with
                  this product.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>

          {/* Actions Section */}
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="text-lg font-semibold">Actions</h3>
              <p className="text-sm text-muted-foreground">Save or cancel your changes</p>
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
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
