"use client";

import { Promotions } from "@prisma/client";
import Image from 'next/image';
import React from "react";
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditIcon, MoreHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import AlertModal from "@/components/globals/AlertModal";
import { toast } from "sonner";
import { deletePromotion } from "@/actions";

const Client = ({ data }: { data: Promotions[] }) => {
  if (!data || data.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No promotions or discounts available.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {data.map((promo) => (
        <PromotionCard key={promo.id} promo={promo} />
      ))}
    </div>
  );
};

const PromotionCard = ({ promo }: { promo: Promotions }) => {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deletePromotion(promo.id);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Promotion deleted successfully");
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast.error("Failed to delete promotion");
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Promotion"
        description="This action cannot be undone. This will permanently delete this promotion from the database."
      />
      <div className="flex flex-col md:flex-row gap-5 border-b border-gray-200 pb-6">
        {/* Left Thumbnail */}
        <div className="w-full md:w-1/3">
          <Image
            src={promo.thumbnail}
            alt={promo.name}
            width={400}
            height={250}
            className="rounded-md object-cover w-full h-[200px]"
          />
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Title */}
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-bold">{promo.name}</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => router.push(`/admin/promotions-and-discounts/${promo.id}`)}
                  >
                    <EditIcon className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsDeleteOpen(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Date */}
            <p className="text-sm text-muted-foreground mb-2">
              {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
            </p>

            {/* Description (truncate) */}
            <p className="text-sm text-gray-700 line-clamp-3">
              {promo.description}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Client;
