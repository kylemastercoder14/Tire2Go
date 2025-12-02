"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, ChevronsUpDown, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import CellActions from "./cell-action";
import Image from "next/image";
import { BrandWithProducts } from '@/types';

export const columns: ColumnDef<BrandWithProducts>[] = [
  {
    accessorKey: "filtered",
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
      const raw = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [copied, setCopied] = useState(false);
      return (
        <div className="flex items-center gap-2 ml-2.5">
          <div className="relative w-16 h-6">
            <Image
              className="object-contain"
              fill
              src={raw.logo || ""}
              alt={raw.name}
            />
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
                    toast.success("Brand ID copied to clipboard");
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
    accessorKey: "tiresCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          No. of Products
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const tiresCount = row.original.products.length;
      return <span className="ml-3.5">{tiresCount}</span>;
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Description
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const description = row.original.description;
      const shortDesc =
        description?.length > 50
          ? description.slice(0, 50) + "..."
          : description;
      return <span className="ml-3.5">{shortDesc || "N/A"}</span>;
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const type = row.original.type;
      return <span className="ml-3.5">{type || "N/A"}</span>;
    },
  },
  {
    accessorKey: "colorScheme",
    header: () => {
      return <span className="ml-3.5">Color Theme</span>;
    },
    cell: ({ row }) => {
      const colorScheme = row.original.colorScheme;

      // Check if colorScheme exists and is an object
      if (!colorScheme || typeof colorScheme !== 'object' || colorScheme === null) {
        return <span className="ml-3.5 text-muted-foreground text-sm">Not set</span>;
      }

      const colors = colorScheme as { primary?: string; secondary?: string; accent?: string };

      return (
        <div className="ml-3.5 flex items-center gap-2">
          {colors.primary && (
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                style={{ backgroundColor: colors.primary }}
                title={`Primary: ${colors.primary}`}
              />
              <span className="text-xs text-muted-foreground">P</span>
            </div>
          )}
          {colors.secondary && (
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                style={{ backgroundColor: colors.secondary }}
                title={`Secondary: ${colors.secondary}`}
              />
              <span className="text-xs text-muted-foreground">S</span>
            </div>
          )}
          {colors.accent && (
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                style={{ backgroundColor: colors.accent }}
                title={`Accent: ${colors.accent}`}
              />
              <span className="text-xs text-muted-foreground">A</span>
            </div>
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
      return <CellActions brand={actions} />;
    },
  },
];
