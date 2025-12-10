import React from "react";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import { DataTable } from "@/components/globals/DataTable";
import { columns } from "./_components/columns";

const Page = async () => {
  const data = await db.review.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      product: {
        include: {
          brand: true,
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center flex-wrap gap-3 justify-between">
        <Heading
          title="Product Reviews"
          description="Browse and manage all product reviews submitted by customers."
        />
      </div>
      <div className="mt-5">
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Filter review ID, product name, or customer name..."
        />
      </div>
    </div>
  );
};

export default Page;

