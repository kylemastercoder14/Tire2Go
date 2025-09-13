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
import { SEARCH_BY_CAR, SEARCH_BY_SIZE } from "@/constants";
import { BrandWithProducts } from "@/types";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";

const FilterSidebar = ({ brands }: { brands: BrandWithProducts[] }) => {
  const [selectedValue, setSelectedValue] = React.useState("size");

  // --- STATE FOR SEARCH BY SIZE ---
  const [selectedWidth, setSelectedWidth] = React.useState("");
  const [selectedAspect, setSelectedAspect] = React.useState("");
  const [selectedRim, setSelectedRim] = React.useState("");

  // --- STATE FOR SEARCH BY CAR ---
  const [selectedBrand, setSelectedBrand] = React.useState("");
  const [selectedModel, setSelectedModel] = React.useState("");
  const [selectedYear, setSelectedYear] = React.useState("");

  // --- DERIVED OPTIONS FOR SIZE ---
  const widthOptions = Object.keys(SEARCH_BY_SIZE);
  const aspectOptions =
    selectedWidth && SEARCH_BY_SIZE[selectedWidth]
      ? Object.keys(SEARCH_BY_SIZE[selectedWidth])
      : [];
  const rimOptions =
    selectedWidth &&
    selectedAspect &&
    SEARCH_BY_SIZE[selectedWidth][selectedAspect]
      ? SEARCH_BY_SIZE[selectedWidth][selectedAspect]
      : [];

  // --- DERIVED OPTIONS FOR CAR ---
  const brandOptions = SEARCH_BY_CAR.map((b) => b.make);
  const modelOptions =
    selectedBrand !== ""
      ? SEARCH_BY_CAR.find((b) => b.make === selectedBrand)?.models || {}
      : {};
  const yearOptions =
    selectedModel !== "" ? modelOptions[selectedModel] || [] : [];
  return (
    <div>
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
            onValueChange={setSelectedRim}
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
            onValueChange={setSelectedYear}
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
      <div className="mt-5 space-y-4">
        {brands.map((brand) => {
          return (
            <div key={brand.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox id={brand.id} />
                <Label htmlFor={brand.id} className="uppercase">
                  {brand.name}
                </Label>
              </div>
              <Badge variant="secondary">{brand.products.length}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FilterSidebar;
