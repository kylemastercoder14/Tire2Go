"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BrandWithProducts, SearchBySize, SearchByCar } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";

interface FilterSidebarProps {
  brands: BrandWithProducts[];
  searchBySize: SearchBySize;
  searchByCar: SearchByCar[];
}

const FilterSidebar = ({ brands, searchBySize, searchByCar }: FilterSidebarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = React.useState(false);

  // Get current URL params
  const currentWidth = searchParams.get("width") || "";
  const currentRatio = searchParams.get("ratio") || "";
  const currentDiameter = searchParams.get("diameter") || "";
  const currentCarBrand = searchParams.get("brand") || "";
  const currentCarModel = searchParams.get("model") || "";
  const currentYear = searchParams.get("year") || "";
  const selectedBrandId = searchParams.get("brandId") || "";

  // Track loading state when URL changes - only on actual navigation
  const searchParamsString = searchParams.toString();
  const prevParamsRef = React.useRef<string>(searchParamsString);

  React.useEffect(() => {
    const currentParams = searchParamsString;
    const prevParams = prevParamsRef.current;

    // Only show loading if params actually changed (not on initial mount)
    if (prevParams !== "" && currentParams !== prevParams) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      prevParamsRef.current = currentParams;
      return () => clearTimeout(timer);
    } else if (prevParams === "") {
      // Initialize on mount
      prevParamsRef.current = currentParams;
    }
  }, [pathname, searchParamsString]);

  const [selectedValue, setSelectedValue] = React.useState(
    currentWidth && currentRatio && currentDiameter ? "size" :
    currentCarBrand && currentCarModel && currentYear ? "car" :
    "size"
  );

  // --- STATE FOR SEARCH BY SIZE ---
  const [selectedWidth, setSelectedWidth] = React.useState(currentWidth);
  const [selectedAspect, setSelectedAspect] = React.useState(currentRatio);
  const [selectedRim, setSelectedRim] = React.useState(currentDiameter);

  // --- STATE FOR SEARCH BY CAR ---
  const [selectedBrand, setSelectedBrand] = React.useState(currentCarBrand);
  const [selectedModel, setSelectedModel] = React.useState(currentCarModel);
  const [selectedYear, setSelectedYear] = React.useState(currentYear);

  // --- STATE FOR BRAND FILTER (single selection only) ---
  const [selectedBrandIdState, setSelectedBrandIdState] = React.useState<string>(selectedBrandId);

  // --- DERIVED OPTIONS FOR SIZE ---
  const widthOptions = Object.keys(searchBySize);
  const aspectOptions =
    selectedWidth && searchBySize[selectedWidth]
      ? Object.keys(searchBySize[selectedWidth])
      : [];
  const rimOptions =
    selectedWidth &&
    selectedAspect &&
    searchBySize[selectedWidth] &&
    searchBySize[selectedWidth][selectedAspect]
      ? searchBySize[selectedWidth][selectedAspect]
      : [];

  // --- DERIVED OPTIONS FOR CAR ---
  const brandOptions = searchByCar.map((b) => b.make);
  const modelOptions =
    selectedBrand !== ""
      ? searchByCar.find((b) => b.make === selectedBrand)?.models || {}
      : {};
  const yearOptions =
    selectedModel !== "" ? modelOptions[selectedModel] || [] : [];

  // --- HELPER TO UPDATE URL ---
  const updateSearchParams = React.useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  }, [router, searchParams, pathname]);

  // --- HANDLERS ---
  const handleSizeFilter = () => {
    if (selectedWidth && selectedAspect && selectedRim) {
      const updates: Record<string, string | null> = {
        width: selectedWidth,
        ratio: selectedAspect,
        diameter: selectedRim,
        brand: null, // Clear car search params
        model: null,
        year: null,
      };
      updateSearchParams(updates);
    }
  };

  const handleCarFilter = () => {
    if (selectedBrand && selectedModel && selectedYear) {
      const updates: Record<string, string | null> = {
        brand: selectedBrand,
        model: selectedModel,
        year: selectedYear,
        width: null, // Clear size search params
        ratio: null,
        diameter: null,
      };
      updateSearchParams(updates);
    }
  };

  const handleBrandFilter = (brandId: string) => {
    // If clicking the same brand, deselect it. Otherwise, select the new brand.
    const newSelectedBrandId = selectedBrandIdState === brandId ? "" : brandId;
    setSelectedBrandIdState(newSelectedBrandId);

    const updates: Record<string, string | null> = {
      brandId: newSelectedBrandId || null,
    };
    updateSearchParams(updates);
  };

  const handleResetFilters = () => {
    // Reset all state
    setSelectedValue("size");
    setSelectedWidth("");
    setSelectedAspect("");
    setSelectedRim("");
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedYear("");
    setSelectedBrandIdState("");

    // Clear all URL parameters
    const updates: Record<string, string | null> = {
      width: null,
      ratio: null,
      diameter: null,
      brand: null,
      model: null,
      year: null,
      brandId: null,
      sortBy: null,
    };
    updateSearchParams(updates);
  };

  // Auto-apply size filter when all fields are selected
  React.useEffect(() => {
    if (selectedValue === "size" && selectedWidth && selectedAspect && selectedRim) {
      const widthChanged = selectedWidth !== currentWidth;
      const ratioChanged = selectedAspect !== currentRatio;
      const rimChanged = selectedRim !== currentDiameter;

      if (widthChanged || ratioChanged || rimChanged) {
        handleSizeFilter();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWidth, selectedAspect, selectedRim, selectedValue, currentWidth, currentRatio, currentDiameter]);

  // Sync brand filter state with URL params
  React.useEffect(() => {
    setSelectedBrandIdState(selectedBrandId);
  }, [selectedBrandId]);

  // Auto-apply car filter when all fields are selected
  React.useEffect(() => {
    if (selectedValue === "car" && selectedBrand && selectedModel && selectedYear) {
      const brandChanged = selectedBrand !== currentCarBrand;
      const modelChanged = selectedModel !== currentCarModel;
      const yearChanged = selectedYear !== currentYear;

      if (brandChanged || modelChanged || yearChanged) {
        handleCarFilter();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrand, selectedModel, selectedYear, selectedValue, currentCarBrand, currentCarModel, currentYear]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute top-0 right-0 z-10 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Filtering...</span>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Filters</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetFilters}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
      <RadioGroup
        defaultValue={selectedValue}
        onValueChange={setSelectedValue}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <RadioGroupItem
            className="focus-visible:border-primary size-5"
            value="size"
            id="size"
          />
          <Label htmlFor="size" className="font-bold text-base">
            Filter by size
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem
            className="focus-visible:border-primary size-5"
            value="car"
            id="car"
          />
          <Label htmlFor="car" className="font-bold text-base">
            Filter by car
          </Label>
        </div>
      </RadioGroup>
      {selectedValue === "size" ? (
        <div className="mt-5 space-y-4">
          {/* Width */}
          <Select
            value={selectedWidth}
            onValueChange={(val) => {
              setSelectedWidth(val);
              setSelectedAspect("");
              setSelectedRim("");
            }}
          >
            <SelectTrigger className="w-full !border-black data-[placeholder]:text-black">
              <SelectValue placeholder="Width *" />
            </SelectTrigger>
            <SelectContent>
              {widthOptions.map((w) => (
                <SelectItem key={w} value={w}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Aspect Ratio */}
          <Select
            value={selectedAspect}
            onValueChange={(val) => {
              setSelectedAspect(val);
              setSelectedRim("");
            }}
            disabled={!selectedWidth}
          >
            <SelectTrigger className="w-full !border-black data-[placeholder]:text-black">
              <SelectValue placeholder="Aspect Ratio *" />
            </SelectTrigger>
            <SelectContent>
              {aspectOptions.map((ar) => (
                <SelectItem key={ar} value={ar}>
                  {ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Rim Diameter */}
          <Select
            value={selectedRim}
            onValueChange={(val) => {
              setSelectedRim(val);
            }}
            disabled={!selectedAspect}
          >
            <SelectTrigger className="w-full !border-black data-[placeholder]:text-black">
              <SelectValue placeholder="Rim Diameter *" />
            </SelectTrigger>
            <SelectContent>
              {rimOptions.map((r) => (
                <SelectItem key={r} value={String(r)}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {/* Brand */}
          <Select
            value={selectedBrand}
            onValueChange={(val) => {
              setSelectedBrand(val);
              setSelectedModel("");
              setSelectedYear("");
            }}
          >
            <SelectTrigger className="w-full !border-black data-[placeholder]:text-black">
              <SelectValue placeholder="Brand *" />
            </SelectTrigger>
            <SelectContent>
              {brandOptions.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Model */}
          <Select
            value={selectedModel}
            onValueChange={(val) => {
              setSelectedModel(val);
              setSelectedYear("");
            }}
            disabled={!selectedBrand}
          >
            <SelectTrigger className="w-full !border-black data-[placeholder]:text-black">
              <SelectValue placeholder="Model *" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(modelOptions).map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year */}
          <Select
            value={selectedYear}
            onValueChange={(val) => {
              setSelectedYear(val);
            }}
            disabled={!selectedModel}
          >
            <SelectTrigger className="w-full !border-black data-[placeholder]:text-black">
              <SelectValue placeholder="Year *" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <h3 className="font-bold mt-5">Filter by Brand</h3>
      <RadioGroup
        value={selectedBrandIdState}
        onValueChange={handleBrandFilter}
        className="mt-5 space-y-4"
      >
        {brands.map((brand) => {
          const isSelected = selectedBrandIdState === brand.id;
          return (
            <div key={brand.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RadioGroupItem value={brand.id} id={brand.id} />
                <Label htmlFor={brand.id} className="uppercase cursor-pointer">
                  {brand.name}
                </Label>
              </div>
              <Badge variant="secondary">{brand.products.length}</Badge>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};

export default FilterSidebar;
