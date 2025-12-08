import React from "react";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { DataTable } from "@/components/globals/DataTable";
import { columns } from "./_components/columns";

const Page = async () => {
  const data = await db.products.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      brand: true,
      productSize: {
        include: {
          tireSize: true,
        },
      },
    }
  });
  return (
    <div>
      <div className="flex items-center flex-wrap gap-3 justify-between">
        <Heading
          title="Product Catalog"
          description="Browse and manage all tire and mag products in your catalog."
        />

        <Button size="sm">
          <Link
            href="/admin/products/create"
            className="flex items-center gap-2"
          >
            <IconPlus className="size-4" />
            Create new product
          </Link>
        </Button>
      </div>
      <div className="mt-5">
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Filter product ID or name..."
        />
      </div>
    </div>
  );
};

export default Page;
