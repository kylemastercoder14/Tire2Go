"use client";

import { Policies } from "@prisma/client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useRouter } from 'next/navigation';
import AlertModal from "@/components/globals/AlertModal";
import { toast } from "sonner";
import { deletePolicy } from "@/actions";

const PolicyCard = ({ data }: { data: Policies | null }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!data?.id) return;

    try {
      setIsDeleting(true);
      const response = await deletePolicy(data.id);

      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success(response.success || "Policy deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete policy");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  if (!data) {
    return null;
  }

  return (
    <>
      <AlertModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Policy"
        description={`Are you sure you want to delete the "${data.type}" policy? This action cannot be undone.`}
      />
      <Card className="rounded-sm">
        <CardContent>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg mb-2">{data.type}</h3>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push(`/admin/policies/${data.id}`)}
                variant="ghost"
                size="icon"
              >
                <IconEdit className="size-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setIsOpen(true)}
                disabled={isDeleting}
              >
                <IconTrash className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default PolicyCard;
