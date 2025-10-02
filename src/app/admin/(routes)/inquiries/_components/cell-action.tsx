"use client";

import React from "react";

import { EditIcon, MoreHorizontal, ArchiveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import AlertModal from "@/components/globals/AlertModal";
import { toast } from "sonner";
import { deleteStaff } from "@/actions";
import { ForwardedMessageWithUser } from '@/types';

const CellActions = ({ data }: { data: ForwardedMessageWithUser }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const handleDelete = async () => {
    try {
      const response = await deleteStaff(data.id);
      if (response.error) {
        toast.error(response.error);
        return;
      }
      toast.success("Staff deleted successfully");
      router.refresh();
    } catch (error) {
      console.log(error);
    } finally {
      setIsOpen(false);
    }
  };
  return (
    <>
      <AlertModal
        onConfirm={handleDelete}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 ml-2.5">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            // onClick={() => router.push(`/admin/staff-management/${data.id}`)}
            disabled
          >
            <EditIcon className="size-4" />
            Reply
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled onClick={() => setIsOpen(true)}>
            <ArchiveIcon className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellActions;
