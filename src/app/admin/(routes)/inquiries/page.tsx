import React from "react";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import { DataTable } from "@/components/globals/DataTable";
import { columns } from "./_components/columns";

const Page = async () => {
  const data = await db.forwardedMessage.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },
  });
  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="Manage Inquiries"
          description="Browse and manage all inquiries in your store."
        />
      </div>
      <div className="mt-5">
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Filter inquiry ID or name..."
        />
      </div>
    </div>
  );
};

export default Page;
