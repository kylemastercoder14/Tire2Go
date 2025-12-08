import React from "react";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import { DataTable } from "@/components/globals/DataTable";
import { columns } from "./_components/columns";
import CreateCarMakeButton from './_components/create-button';

const Page = async () => {
  const data = await db.carMake.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      models: true,
    }
  });

  return (
    <div>
      <div className="flex items-center flex-wrap gap-3 justify-between">
        <Heading
          title="Car Makes"
          description="Browse and manage car makes for tire compatibility."
        />
        <CreateCarMakeButton />
      </div>
      <div className="mt-5">
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Filter car make name..."
        />
      </div>
    </div>
  );
};

export default Page;
