import React from "react";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import { DataTable } from "@/components/globals/DataTable";
import { columns } from "./_components/columns";
import CreateTireSizeButton from "./_components/create-button";

const Page = async () => {
  const data = await db.tireSize.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="Tire Sizes"
          description="Browse and manage tire sizes for product compatibility."
        />

        <CreateTireSizeButton />
      </div>
      <div className="mt-5">
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Filter tire size..."
        />
      </div>
    </div>
  );
};

export default Page;
