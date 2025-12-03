"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cancelOrder } from "@/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface CancelOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

const CANCELLATION_REASONS = [
  "Wrong item",
  "Change of mind",
  "Payment issue",
  "Found better price",
  "Duplicate order",
  "Shipping address error",
  "Other",
];

export const CancelOrderDialog = ({
  isOpen,
  onClose,
  orderId,
}: CancelOrderDialogProps) => {
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error("Please select a cancellation reason");
      return;
    }

    if (selectedReason === "Other" && !customReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    setIsSubmitting(true);

    try {
      const reason = selectedReason === "Other" ? customReason.trim() : selectedReason;
      const result = await cancelOrder(orderId, reason);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Order cancelled successfully. You will receive a confirmation email shortly.");
        onClose();
        router.refresh();
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedReason("");
      setCustomReason("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cancel Order</DialogTitle>
          <DialogDescription>
            Please select a reason for cancelling this order. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Cancellation Reason <span className="text-red-600">*</span>
            </Label>
            <Select
              value={selectedReason}
              onValueChange={setSelectedReason}
              disabled={isSubmitting}
            >
              <SelectTrigger className='w-full' id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {CANCELLATION_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedReason === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="customReason">
                Please specify <span className="text-red-600">*</span>
              </Label>
              <Textarea
                id="customReason"
                placeholder="Enter your cancellation reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReason}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Confirm Cancellation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

