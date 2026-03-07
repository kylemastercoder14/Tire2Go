"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import CellActions from "./cell-action";
import { Order } from "@prisma/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "filtered",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order Number
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const raw = row.original;
      return (
        <div className="flex items-center gap-2 ml-2.5">
          <span className="w-60 truncate">{raw.id}</span>
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
    accessorKey: "orderDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order Date
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const orderDate = formatDate(row.original.createdAt);
      return <span className="ml-3.5">{orderDate}</span>;
    },
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer Name
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="ml-3.5 flex items-center gap-2">
          <span>{row.original.name || "N/A"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Amount
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const totalAmount = row.original.totalAmount;
      const discountedPrice = row.original.discountedAmount ?? 0;
      return (
        <div className="flex flex-col ml-3.5">
          <span>₱{formatCurrency(totalAmount)}</span>
          <span className="text-sm text-muted-foreground">
            Discount: ₱{formatCurrency(discountedPrice)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Payment Status
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const paymentStatus = row.original.paymentStatus;

      switch (paymentStatus) {
        case "PAID":
          return <Badge className="ml-3.5 bg-green-600">Paid</Badge>;
        case "PENDING":
          return <Badge className="ml-3.5 bg-yellow-600">Pending</Badge>;
        case "FAILED":
          return <Badge className="ml-3.5 bg-red-600">Failed</Badge>;
        default:
          return <Badge className="ml-3.5 bg-gray-600">Unknown</Badge>;
      }
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
          Order Status
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status;

      switch (status) {
        case "COMPLETED":
          return <Badge className="ml-3.5 bg-green-600">Completed</Badge>;
        case "PENDING":
          return <Badge className="ml-3.5 bg-yellow-600">Pending</Badge>;
        case "CANCELLED":
          return <Badge className="ml-3.5 bg-red-600">Cancelled</Badge>;
        case "PROCESSING":
          return <Badge className="ml-3.5 bg-blue-600">Processing</Badge>;
        case "SHIPPED":
          return <Badge className="ml-3.5 bg-orange-600">Shipped</Badge>;
        default:
          return <Badge className="ml-3.5 bg-gray-600">Unknown</Badge>;
      }
    },
  },
  {
    accessorKey: "orderOption",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order Option
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const orderOption = row.original.orderOption;
      return <span className="ml-3.5 capitalize">{orderOption}</span>;
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
      return <CellActions data={actions} />;
    },
  },
];
