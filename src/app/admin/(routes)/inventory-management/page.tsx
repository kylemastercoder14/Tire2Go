import React from "react";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { DataTable } from "@/components/globals/DataTable";
import { columns } from "./_components/columns";

const Page = async () => {
  const data = await db.inventory.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      product: {
        include: {
          brand: true,
        },
      },
    },
  });
  return (
    <div>
      <div className="flex items-center flex-wrap gap-3 justify-between">
        <Heading
          title="Inventory Management"
          description="Manage your products and stock levels."
        />

        <Button size="sm">
          <Link
            href="/admin/inventory-management/create"
            className="flex items-center gap-2"
          >
            <IconPlus className="size-4" />
            Create new stock item
          </Link>
        </Button>
      </div>
      <div className="mt-5">
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Filter stock item ID, SKU or product name..."
        />
      </div>
    </div>
  );
};

export default Page;
