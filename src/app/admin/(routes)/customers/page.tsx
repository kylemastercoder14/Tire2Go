import React from "react";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import { DataTable } from "@/components/globals/DataTable";
import { columns } from "./_components/columns";

const Page = async () => {
  const data = await db.users.findMany({
	orderBy: {
	  createdAt: "desc",
	},
  });
  return (
	<div>
	  <div className="flex items-center justify-between">
		<Heading
		  title="Customers"
		  description="Browse and manage all customers in your store."
		/>
	  </div>
	  <div className="mt-5">
		<DataTable
		  columns={columns}
		  data={data}
		  searchPlaceholder="Filter customer ID or name..."
		/>
	  </div>
	</div>
  );
};

export default Page;
