"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {LoaderOne} from "@/components/globals/Loader";

interface Policy {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface PolicyModalProps {
  type: "Terms and Conditions" | "Privacy Policy";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  type,
  open,
  onOpenChange,
}) => {
  const [policy, setPolicy] = React.useState<Policy | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setPolicy(null);
      setError("");
      return;
    }

    // Fetch policy when modal opens
    const fetchPolicy = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/policy?type=${encodeURIComponent(type)}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setPolicy(data.data);
        }
      } catch (err) {
        setError("Failed to load policy. Please try again.");
        console.error("Error fetching policy:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicy();
  }, [open, type]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl! max-h-[90vh]! flex flex-col p-0">
        <div className="px-6 pt-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {type}
            </DialogTitle>
            {policy && (
              <p className="text-sm text-muted-foreground">
                Last Updated: {format(new Date(policy.updatedAt), "MMMM dd, yyyy")}
              </p>
            )}
          </DialogHeader>
        </div>
        <Separator />
        <ScrollArea className="flex-1 px-6 h-[90vh] overflow-auto py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoaderOne />
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          ) : policy ? (
            <div
              className="prose prose-md max-w-none
               prose-headings:font-bold
               prose-headings:text-black
               prose-a:text-primary prose-a:underline
               prose-ul:list-disc prose-ol:list-decimal
               prose-li:marker:text-black prose-img:w-full prose-img:object-contain"
              dangerouslySetInnerHTML={{ __html: policy.content }}
            />
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

