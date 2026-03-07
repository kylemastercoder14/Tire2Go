"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, ChevronsUpDown, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import CellActions from "./cell-action";
import Image from "next/image";
import { InventoryWithProduct } from "@/types";
import { Badge } from "@/components/ui/badge";
import UpdateStock from "@/components/forms/UpdateStock";
import UpdateMinimumStock from "@/components/forms/UpdateMinimumStock";
import UpdateMaximumStock from "@/components/forms/UpdateMaximumStock";

export const columns: ColumnDef<InventoryWithProduct>[] = [
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
              src={raw.product.images[0] || ""}
              alt={raw.product.name}
            />
            <div className="absolute top-0 z-20 right-0">
              <Image
                className="object-contain"
                width={40}
                height={40}
                src={raw.product.brand.logo || ""}
                alt={raw.product.brand.name}
              />
            </div>
          </div>
          <div>
            <span className="font-semibold">{raw.product.name}</span>
            <div
              title={raw.id}
              className="text-xs cursor-pointer text-primary gap-2 flex items-center"
            >
              <span className="w-[180px] hover:underline truncate overflow-hidden whitespace-nowrap">
                Inventory ID: {raw.id}
              </span>
              {copied ? (
                <CheckIcon className="size-3 text-green-600" />
              ) : (
                <CopyIcon
                  onClick={() => {
                    navigator.clipboard.writeText(raw.id || "");
                    toast.success("Inventory ID copied to clipboard");
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
      const name = (row.original.product.name ?? "").toLowerCase();
      const sku = (row.original.sku ?? "").toLowerCase();
      const id = (row.original.id ?? "").toLowerCase();
      const search = filterValue.toLowerCase();

      return (
        name.includes(search) || id.includes(search) || sku.includes(search)
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "sku",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          SKU
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const sku = row.original.sku;
      return <span className="ml-3.5">{sku || "N/A"}</span>;
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quantity
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const quantity = row.original.quantity;
      return <UpdateStock id={row.original.id} stock={quantity} />;
    },
  },
  {
    accessorKey: "minStock",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Minimum Stock
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const minStock = row.original.minStock ?? 0;
      return (
        <UpdateMinimumStock id={row.original.id} minimumStock={minStock} />
      );
    },
  },
  {
    accessorKey: "maxStock",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Maximum Stock
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const maxStock = row.original.maxStock ?? 0;
      return (
        <UpdateMaximumStock id={row.original.id} maximumStock={maxStock} />
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status;

      switch (status) {
        case "IN_STOCK":
          return <Badge className="ml-3.5 bg-green-600">In Stock</Badge>;
        case "LOW_STOCK":
          return <Badge className="ml-3.5 bg-yellow-600">Low Stock</Badge>;
        case "OUT_OF_STOCK":
          return <Badge className="ml-3.5 bg-red-600">Out of Stock</Badge>;
        default:
          return <Badge className="ml-3.5 bg-gray-600">Discontinued</Badge>;
      }
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
      return <CellActions inventory={actions} />;
    },
  },
];
