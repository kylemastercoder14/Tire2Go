"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, ChevronsUpDown, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import CellActions from "./cell-action";
import Image from "next/image";
import { ProductWithBrand } from "@/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const columns: ColumnDef<ProductWithBrand>[] = [
  {
    accessorKey: "filtered",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product
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
          <div className="relative w-15 h-15">
            <Image
              className="object-contain"
              fill
              src={raw.images[0] || ""}
              alt={raw.name}
            />
            <div className="absolute top-0 z-20 right-0">
              <Image
                className="object-contain"
                width={40}
                height={40}
                src={raw.brand.logo || ""}
                alt={raw.brand.name}
              />
            </div>
          </div>
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
                    toast.success("Product ID copied to clipboard");
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
    accessorKey: "brand",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Brand
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const brand = row.original.brand.name;
      return <span className="ml-3.5">{brand || "N/A"}</span>;
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price Range
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const productSizes = row.original.productSize || [];

      if (productSizes.length === 0) {
        // Fallback to old price display if no productSize data
        const price = row.original.price;
        const discountedPrice = row.original.discountedPrice;

        return (
          <div className="ml-3.5 flex items-center gap-2">
            {discountedPrice && discountedPrice < price ? (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  ₱{price.toLocaleString()}
                </span>
                <span>₱{discountedPrice.toLocaleString()}</span>
              </>
            ) : (
              <span>₱{price.toLocaleString() || "N/A"}</span>
            )}
          </div>
        );
      }

      // Calculate price range from all tire sizes
      const prices = productSizes.map((ps) => {
        // Use discounted price if available and less than original price, otherwise use original price
        const effectivePrice = ps.isClearanceSale && ps.discountedPrice && ps.discountedPrice < ps.price
          ? ps.discountedPrice
          : ps.price;
        return effectivePrice;
      });

      if (prices.length === 0) {
        return <span className="ml-3.5">N/A</span>;
      }

      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      if (minPrice === maxPrice) {
        return <span className="ml-3.5">₱{minPrice.toLocaleString()}</span>;
      }

      return (
        <div className="ml-3.5">
          <span className="font-medium">₱{minPrice.toLocaleString()}</span>
          <span className="text-muted-foreground mx-1">-</span>
          <span className="font-medium">₱{maxPrice.toLocaleString()}</span>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const getMinPrice = (row: typeof rowA) => {
        const productSizes = row.original.productSize || [];
        if (productSizes.length === 0) {
          return row.original.price || 0;
        }
        const prices = productSizes.map((ps) => {
          const effectivePrice = ps.isClearanceSale && ps.discountedPrice && ps.discountedPrice < ps.price
            ? ps.discountedPrice
            : ps.price;
          return effectivePrice;
        });
        return prices.length > 0 ? Math.min(...prices) : 0;
      };

      return getMinPrice(rowA) - getMinPrice(rowB);
    },
  },
  {
    accessorKey: "tireSize",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Available Tire Sizes
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const productSizes = row.original.productSize || [];

      if (productSizes.length === 0) {
        // Fallback to old tireSize field if no productSize data
        const tireSize = row.original.tireSize;
        return <span className="ml-3.5">{tireSize || "N/A"}</span>;
      }

      // Get all tire sizes and format them with pricing info
      const tireSizesData = productSizes.map((ps) => {
        const ts = ps.tireSize;
        let sizeText = "";
        if (ts.ratio && ts.diameter) {
          sizeText = `${ts.width}/${ts.ratio} R${ts.diameter}`;
        } else if (ts.diameter) {
          sizeText = `${ts.width} R${ts.diameter}`;
        } else {
          sizeText = `${ts.width}`;
        }

        // Get effective price
        const effectivePrice = ps.isClearanceSale && ps.discountedPrice && ps.discountedPrice < ps.price
          ? ps.discountedPrice
          : ps.price;

        return {
          size: sizeText,
          price: effectivePrice,
          originalPrice: ps.price,
          discountedPrice: ps.discountedPrice,
          isClearanceSale: ps.isClearanceSale,
        };
      });

      // Remove duplicates based on size and keep the one with pricing info
      const uniqueTireSizesMap = new Map<string, typeof tireSizesData[0]>();
      tireSizesData.forEach((item) => {
        if (!uniqueTireSizesMap.has(item.size) || item.price < (uniqueTireSizesMap.get(item.size)?.price || Infinity)) {
          uniqueTireSizesMap.set(item.size, item);
        }
      });

      const uniqueTireSizes = Array.from(uniqueTireSizesMap.values()).sort((a, b) => a.size.localeCompare(b.size));
      const sizeCount = uniqueTireSizes.length;

      if (sizeCount === 0) {
        return <span className="ml-3.5">N/A</span>;
      }

      // Show first 2 sizes as badges, then use popover for the rest
      const maxInlineDisplay = 2;
      const displaySizes = uniqueTireSizes.slice(0, maxInlineDisplay);
      const remainingCount = sizeCount - maxInlineDisplay;

      return (
        <div className="ml-3.5 flex items-center gap-1.5 flex-wrap">
          {displaySizes.map((item, index) => (
            <Badge key={index} variant="secondary" className="text-xs font-mono">
              {item.size}
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-primary hover:text-primary"
                >
                  +{remainingCount} more
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="p-4 border-b">
                  <h4 className="font-semibold text-sm">All Available Tire Sizes</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {sizeCount} size{sizeCount !== 1 ? "s" : ""} available
                  </p>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="p-4 space-y-2">
                    {uniqueTireSizes.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <Badge variant="outline" className="font-mono text-xs">
                          {item.size}
                        </Badge>
                        <div className="flex flex-col items-end">
                          {item.isClearanceSale && item.discountedPrice && item.discountedPrice < item.originalPrice ? (
                            <>
                              <span className="text-xs text-muted-foreground line-through">
                                ₱{item.originalPrice.toLocaleString()}
                              </span>
                              <span className="text-sm font-medium text-red-600">
                                ₱{item.discountedPrice.toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-medium">
                              ₱{item.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          )}
        </div>
      );
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
      return <CellActions product={actions} />;
    },
  },
];
