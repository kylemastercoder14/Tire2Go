"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, ChevronsUpDown, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import CellActions from "./cell-action";
import { CarMake, CarModel } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

type CarModelWithMake = CarModel & {
  make: CarMake;
  years?: number[];
  compatibilities?: Array<{ year: number | null }>;
};

export const createColumns = (carMakes: CarMake[]): ColumnDef<CarModelWithMake>[] => [
  {
    accessorKey: "filtered",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Car Model
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const raw = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [copied, setCopied] = useState(false);
      return (
        <div className="flex items-center gap-2 ml-2.5">
          <div>
            <span className="font-semibold">{raw.name}</span>
            <div
              title={raw.id}
              className="text-xs cursor-pointer text-primary gap-2 flex items-center"
            >
              <span className="w-[180px] hover:underline truncate overflow-hidden whitespace-nowrap">
                {raw.id}
              </span>
              {copied ? (
                <CheckIcon className="size-3 text-green-600" />
              ) : (
                <CopyIcon
                  onClick={() => {
                    navigator.clipboard.writeText(raw.id || "");
                    toast.success("Car model ID copied to clipboard");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="size-3 text-muted-foreground cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const name = (row.original.name ?? "").toLowerCase();
      const id = (row.original.id ?? "").toLowerCase();
      const search = filterValue.toLowerCase();

      return name.includes(search) || id.includes(search);
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "make",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Car Make
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const make = row.original.make;
      return <span className="ml-3.5">{make.name}</span>;
    },
  },
  {
    accessorKey: "years",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Years
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const model = row.original;

      // Get years - prioritize years field, fallback to compatibilities
      let years: number[] = [];
      if (model.years && Array.isArray(model.years) && model.years.length > 0) {
        years = [...model.years].sort((a, b) => a - b);
      } else if (model.compatibilities && model.compatibilities.length > 0) {
        years = model.compatibilities
          .map((c) => c.year)
          .filter((y): y is number => y !== null)
          .sort((a, b) => a - b);
      }

      if (years.length === 0) {
        return <span className="ml-3.5 text-muted-foreground">No years</span>;
      }

      // Format years as range if consecutive, otherwise show individual years
      const formatYears = (yearsArr: number[]): string => {
        if (yearsArr.length === 0) return "";
        if (yearsArr.length === 1) return yearsArr[0].toString();

        // Check if all years are consecutive
        const isConsecutive = yearsArr.every((year, index) => {
          if (index === 0) return true;
          return year === yearsArr[index - 1] + 1;
        });

        if (isConsecutive) {
          return `${yearsArr[0]}-${yearsArr[yearsArr.length - 1]}`;
        }

        // Show first and last year with ellipsis if many years
        if (yearsArr.length > 5) {
          return `${yearsArr[0]}-${yearsArr[yearsArr.length - 1]}`;
        }

        return yearsArr.join(", ");
      };

      const displayYears = years.slice(0, 5);
      const remaining = years.length - 5;
      const formattedRange = formatYears(years);

      return (
        <div className="ml-3.5">
          {years.length <= 5 ? (
            // Show all years as badges if 5 or fewer
            <div className="flex items-center gap-1 flex-wrap">
              {years.map((year) => (
                <Badge
                  key={year}
                  variant="secondary"
                  className="text-xs font-medium"
                >
                  {year}
                </Badge>
              ))}
            </div>
          ) : (
            // Show formatted range with popover for all years
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-xs text-primary hover:text-primary hover:underline"
                >
                  {formattedRange}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="p-4 border-b">
                  <h4 className="font-semibold text-sm">All Years</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {years.length} year{years.length !== 1 ? "s" : ""} available
                  </p>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {years.map((year) => (
                        <Badge
                          key={year}
                          variant="outline"
                          className="text-xs font-mono"
                        >
                          {year}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          )}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const getYears = (row: typeof rowA): number[] => {
        const model = row.original;
        if (model.years && Array.isArray(model.years) && model.years.length > 0) {
          return model.years;
        }
        if (model.compatibilities && model.compatibilities.length > 0) {
          return model.compatibilities
            .map((c) => c.year)
            .filter((y): y is number => y !== null);
        }
        return [];
      };

      const yearsA = getYears(rowA);
      const yearsB = getYears(rowB);

      const minA = yearsA.length > 0 ? Math.min(...yearsA) : 0;
      const minB = yearsB.length > 0 ? Math.min(...yearsB) : 0;

      return minA - minB;
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Created
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const startDate = new Date(row.original.createdAt);
      return (
        <span className="ml-3.5">{`${startDate.toLocaleDateString()}`}</span>
      );
    },
  },
  {
    accessorKey: "actions",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Actions
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const actions = row.original;
      return <CellActions carModel={actions} carMakes={carMakes} />;
    },
  },
];

export const columns = createColumns([]);
