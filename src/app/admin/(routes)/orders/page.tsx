import React from "react";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import { DataTable } from "@/components/globals/DataTable";
import { columns } from "./_components/columns";

const Page = async () => {
  const data = await db.order.findMany({
	orderBy: {
	  createdAt: "desc",
	},
	include: {
	  orderItem: true,
	}
  });
  return (
	<div>
	  <div className="flex items-center justify-between">
		<Heading
		  title="Manage Orders"
		  description="Browse and manage all orders in your store."
		/>
	  </div>
	  <div className="mt-5">
		<DataTable
		  columns={columns}
		  data={data}
		  searchPlaceholder="Filter order ID or customer name..."
		/>
	  </div>
	</div>
  );
};

export default Page;
