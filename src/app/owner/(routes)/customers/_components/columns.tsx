"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, ChevronsUpDown, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Users } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Users>[] = [
  {
    accessorKey: "filtered",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer
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
            <span className="font-semibold">
              {raw.firstName} {raw.lastName}
            </span>
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
                    toast.success("Customer ID copied to clipboard");
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
      const name = (
        row.original.firstName +
        " " +
        row.original.lastName
      ).toLowerCase();
      const id = (row.original.id ?? "").toLowerCase();
      const search = filterValue.toLowerCase();

      return name.includes(search) || id.includes(search);
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email Address
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const email = row.original.email;
      return <span className="ml-3.5">{email || "N/A"}</span>;
    },
  },
  {
    accessorKey: "ipAddress",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          IP Address
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      // Generate a random IPv4 address for testing
      const randomIpAddress = Array.from({ length: 4 }, () =>
        Math.floor(Math.random() * 256)
      ).join(".");

      const ipAddress = randomIpAddress;
      const userAgent = row.original.userAgent;
      const deviceType = row.original.deviceType;

      return (
        <div className="ml-3.5">
          <div>{ipAddress || "N/A"}</div>
          <span>
            {userAgent || "N/A"} ({deviceType || "N/A"})
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "emailVerified",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email Verified
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isVerified = row.original.isEmailVerified;
      return (
        <Badge
          className={`ml-3.5 ${isVerified ? "bg-green-600" : "bg-red-600"}`}
        >
          {isVerified ? "Verified" : "Unverified"}
        </Badge>
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
];
