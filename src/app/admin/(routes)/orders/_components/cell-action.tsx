"use client";

import React from "react";

import {
  EditIcon,
  MoreHorizontal,
  ArchiveIcon,
  Wallet,
  XCircle,
} from "lucide-react";

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
import { deleteOrder, rejectOrder, toggleOrderPayment } from "@/actions";
import { Order } from "@prisma/client";
import { IconWalletOff } from "@tabler/icons-react";
import { Modal } from "@/components/globals/Modal";
import { Textarea } from "@/components/ui/textarea";

const CellActions = ({ data }: { data: Order }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [rejectModalOpen, setRejectModalOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    try {
      const response = await deleteOrder(data.id);
      if (response.error) {
        toast.error(response.error);
        return;
      }
      toast.success("Order deleted successfully");
      router.refresh();
    } catch (error) {
      console.log(error);
    } finally {
      setIsOpen(false);
    }
  };

  const handleTogglePaymentStatus = async (status: "PAID" | "FAILED") => {
    try {
      const response = await toggleOrderPayment(data.id, status);
      if (response.error) {
        toast.error(response.error);
        return;
      }
      toast.success(`Order marked as ${status}`);
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleReject = async () => {
    try {
      if (reason.trim().length === 0) {
        toast.error("Please provide a reason for rejecting the order");
        return;
      }
      setLoading(true);
      const response = await rejectOrder(data.id, reason);
      if (response.error) {
        toast.error(response.error);
        return;
      }
      toast.success("Order rejected successfully");
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setRejectModalOpen(false);
      setReason("");
    }
  };
  return (
    <>
      <AlertModal
        onConfirm={handleDelete}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
      <Modal
        title="Reject Order"
        description="Please provide a reason for rejecting this order."
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
      >
        <div>
          <div className="space-y-2">
            <Textarea
              placeholder="Enter the reason for rejecting the order"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end mt-4 gap-2 items-center">
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button disabled={loading} onClick={handleReject}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
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
            onClick={() => router.push(`/admin/orders/${data.id}`)}
          >
            <EditIcon className="size-4" />
            View Details
          </DropdownMenuItem>
          {data.status === "PENDING" && (
            <>
              {data.paymentStatus === "PENDING" && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleTogglePaymentStatus("PAID")}
                  >
                    <Wallet className="size-4" />
                    Mark as Paid
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleTogglePaymentStatus("FAILED")}
                  >
                    <IconWalletOff className="size-4" />
                    Mark as Failed
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={() => setRejectModalOpen(true)}>
                <XCircle className="size-4" /> Reject Order
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsOpen(true)}>
            <ArchiveIcon className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellActions;
