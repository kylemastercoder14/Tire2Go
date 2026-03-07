"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, ChevronsUpDown, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import CellActions from "./cell-action";
import { TireSize } from "@prisma/client";

export const columns: ColumnDef<TireSize>[] = [
  {
    accessorKey: "filtered",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tire Size
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const raw = row.original;
      const sizeDisplay = `${raw.width}/${raw.ratio} R${raw.diameter}`;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [copied, setCopied] = useState(false);
      return (
        <div className="flex items-center gap-2 ml-2.5">
          <div>
            <span className="font-semibold">{sizeDisplay}</span>
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
                    toast.success("Tire size ID copied to clipboard");
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
      const width = row.original.width.toString();
      const ratio = row.original.ratio?.toString() || "";
      const diameter = row.original.diameter?.toString() || "";
      const id = (row.original.id ?? "").toLowerCase();
      const search = filterValue.toLowerCase();

      return width.includes(search) || ratio.includes(search) || diameter.includes(search) || id.includes(search);
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const nameA = (rowA.original.width ?? "");
      const nameB = (rowB.original.width ?? "");

      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    },
    enableHiding: false,
  },
  {
    accessorKey: "width",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Width
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const width = row.original.width;
      return <span className="ml-3.5">{width}</span>;
    },
  },
  {
    accessorKey: "ratio",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ratio
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const ratio = row.original.ratio;
      return <span className="ml-3.5">{ratio}</span>;
    },
  },
  {
    accessorKey: "diameter",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Diameter
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const diameter = row.original.diameter;
      return <span className="ml-3.5">{diameter}</span>;
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
      return <CellActions tireSize={actions} />;
    },
  },
];
