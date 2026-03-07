"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, ChevronsUpDown, CopyIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Ticket } from "@prisma/client";
import { useRouter } from "next/navigation";
import AlertModal from "@/components/globals/AlertModal";
import { deleteTicket, updateTicket } from "@/actions";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TicketWithUser = Ticket & {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export const columns: ColumnDef<TicketWithUser>[] = [
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
      const fullName = `${raw.user.firstName} ${raw.user.lastName}`;
      return (
        <div className="flex items-center gap-2 ml-2.5">
          <div>
            <span className="font-semibold">{fullName}</span>
            <div className="text-xs text-muted-foreground">
              {raw.user.email}
            </div>
            <div
              title={raw.id}
              className="text-xs cursor-pointer text-primary gap-2 flex items-center mt-1"
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
                    toast.success("Ticket ID copied to clipboard");
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
      const name = `${row.original.user.firstName} ${row.original.user.lastName}`.toLowerCase();
      const email = row.original.user.email.toLowerCase();
      const subject = (row.original.subject || "").toLowerCase();
      const description = (row.original.description || "").toLowerCase();
      const id = (row.original.id ?? "").toLowerCase();
      const search = filterValue.toLowerCase();

      return (
        name.includes(search) ||
        email.includes(search) ||
        subject.includes(search) ||
        description.includes(search) ||
        id.includes(search)
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "subject",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Subject
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const subject = row.original.subject;
      return (
        <div className="ml-3.5 max-w-md">
          <p className="text-sm font-medium">{subject}</p>
        </div>
      );
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
      const shortDescription =
        description.length > 100 ? description.slice(0, 100) + "..." : description;
      return (
        <div className="ml-3.5 max-w-md">
          <p className="text-sm">{shortDescription}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Priority
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const priority = row.original.priority;
      const priorityColors = {
        LOW: "bg-blue-100 text-blue-800",
        MEDIUM: "bg-yellow-100 text-yellow-800",
        HIGH: "bg-orange-100 text-orange-800",
        URGENT: "bg-red-100 text-red-800",
      };
      return (
        <div className="ml-3.5">
          <Badge className={priorityColors[priority] || "bg-gray-100 text-gray-800"}>
            {priority}
          </Badge>
        </div>
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
      const ticket = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useRouter();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isUpdating, setIsUpdating] = useState(false);

      const handleStatusChange = async (newStatus: string) => {
        try {
          setIsUpdating(true);
          const response = await updateTicket(ticket.id, {
            status: newStatus as any,
          });

          if (response.error) {
            toast.error(response.error);
            return;
          }

          toast.success("Ticket status updated successfully");
          router.refresh();
        } catch (error) {
          console.error("Update error:", error);
          toast.error("Failed to update ticket status");
        } finally {
          setIsUpdating(false);
        }
      };

      const statusColors = {
        OPEN: "bg-blue-100 text-blue-800",
        IN_PROGRESS: "bg-yellow-100 text-yellow-800",
        RESOLVED: "bg-green-100 text-green-800",
        CLOSED: "bg-gray-100 text-gray-800",
      };

      return (
        <div className="ml-3.5">
          <Select
            value={ticket.status}
            onValueChange={handleStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
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
          Date Submitted
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <span className="ml-3.5">
          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
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
      const ticket = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useRouter();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isOpen, setIsOpen] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isDeleting, setIsDeleting] = useState(false);

      const handleDelete = async () => {
        try {
          setIsDeleting(true);
          const response = await deleteTicket(ticket.id);

          if (response.error) {
            toast.error(response.error);
            return;
          }

          toast.success(response.success || "Ticket deleted successfully");
          router.refresh();
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Failed to delete ticket");
        } finally {
          setIsDeleting(false);
          setIsOpen(false);
        }
      };

      return (
        <>
          <AlertModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onConfirm={handleDelete}
            loading={isDeleting}
            title="Delete Ticket"
            description="This action cannot be undone. This will permanently delete this ticket from the database."
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </>
      );
    },
  },
];
