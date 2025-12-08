import React from "react";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import { DataTable } from "@/components/globals/DataTable";
import { columns } from "./_components/columns";

const Page = async () => {
  const data = await db.feedback.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
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
          title="Customer Feedback"
          description="View and manage all customer feedback and ratings."
        />
      </div>
      <div className="mt-5">
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Filter by customer name, email, or comment..."
        />
      </div>
    </div>
  );
};

export default Page;

