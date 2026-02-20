import React from "react";
import { redirect } from "next/navigation";
import InventoryForm from "@/components/forms/InventoryForm";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import { canPerformAdminAction } from "@/lib/admin-access";
import { getCurrentAdminUserType } from "@/lib/admin-auth";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;
  const userType = await getCurrentAdminUserType();

  if (!userType) {
    redirect("/?error=access_denied");
  }

  const isCreate = params.id === "create";
  const requiredAction = isCreate ? "create" : "update";

  if (!canPerformAdminAction(userType, "inventoryManagement", requiredAction)) {
    redirect("/admin/inventory-management?error=access_denied");
  }

  const initialData = isCreate
    ? null
    : await db.inventory.findUnique({
        where: {
          id: params.id,
        },
        include: {
          product: {
            include: {
              brand: true,
            },
          },
        },
      });

  const products = await db.products.findMany({
    orderBy: { name: "asc" },
    include: { brand: true },
  });

  const title = initialData ? "Edit Stock Item" : "Create New Stock Item";
  const description = initialData
    ? "Update the details of an existing stock item."
    : "Add a new stock item to your catalog.";

  return (
    <div>
      <Heading title={title} description={description} />
      <div className="mt-5">
        <InventoryForm initialData={initialData} products={products} />
      </div>
    </div>
  );
};

export default Page;
