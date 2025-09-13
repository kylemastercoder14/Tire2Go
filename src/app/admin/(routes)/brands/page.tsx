import React from "react";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { DataTable } from "@/components/globals/DataTable";
import { columns } from "./_components/columns";

const Page = async () => {
  const data = await db.brands.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      products: true,
    }
  });
  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="Tires & Mags Brands"
          description="Browse and manage tire and mag brands for performance, safety, and style."
        />

        <Button size="sm">
          <Link
            href="/admin/brands/create"
            className="flex items-center gap-2"
          >
            <IconPlus className="size-4" />
            Create new brand
          </Link>
        </Button>
      </div>
      <div className="mt-5">
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Filter brand ID or name..."
        />
      </div>
    </div>
  );
};

export default Page;
