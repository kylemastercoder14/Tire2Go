"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, ChevronsUpDown, CopyIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { StarRating } from "@/components/ui/star-rating";
import { Feedback } from "@prisma/client";
import { useRouter } from "next/navigation";
import AlertModal from "@/components/globals/AlertModal";
import { deleteFeedback } from "@/actions";

type FeedbackWithUser = Feedback & {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export const columns: ColumnDef<FeedbackWithUser>[] = [
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
                    toast.success("Feedback ID copied to clipboard");
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
      const comment = (row.original.comment || "").toLowerCase();
      const id = (row.original.id ?? "").toLowerCase();
      const search = filterValue.toLowerCase();

      return (
        name.includes(search) ||
        email.includes(search) ||
        comment.includes(search) ||
        id.includes(search)
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "rating",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Rating
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const rating = row.original.rating;
      return (
        <div className="ml-3.5 flex items-center gap-2">
          <StarRating rating={rating} readonly size="sm" />
          <span className="text-sm font-medium">({rating}/5)</span>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.rating - rowB.original.rating;
    },
  },
  {
    accessorKey: "comment",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Comment
          <ChevronsUpDown className="h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const comment = row.original.comment;
      if (!comment) {
        return (
          <span className="ml-3.5 text-muted-foreground italic">No comment</span>
        );
      }
      const shortComment =
        comment.length > 100 ? comment.slice(0, 100) + "..." : comment;
      return (
        <div className="ml-3.5 max-w-md">
          <p className="text-sm">{shortComment}</p>
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
      const feedback = row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useRouter();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isOpen, setIsOpen] = useState(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isDeleting, setIsDeleting] = useState(false);

      const handleDelete = async () => {
        try {
          setIsDeleting(true);
          const response = await deleteFeedback(feedback.id);

          if (response.error) {
            toast.error(response.error);
            return;
          }

          toast.success(response.success || "Feedback deleted successfully");
          router.refresh();
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Failed to delete feedback");
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
            title="Delete Feedback"
            description="This action cannot be undone. This will permanently delete this feedback from the database."
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

