import React from "react";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { DataTable } from "@/components/globals/DataTable";
import { columns } from "./_components/columns";

const Page = async () => {
  const data = await db.staff.findMany({
	orderBy: {
	  createdAt: "desc",
	},
  });
  return (
	<div>
	  <div className="flex items-center justify-between">
		<Heading
		  title="Staff Management"
		  description="Browse and manage all staff members in your store."
		/>

		<Button size="sm">
		  <Link
			href="/admin/staff-management/create"
			className="flex items-center gap-2"
		  >
			<IconPlus className="size-4" />
			Create new staff member
		  </Link>
		</Button>
	  </div>
	  <div className="mt-5">
		<DataTable
		  columns={columns}
		  data={data}
		  searchPlaceholder="Filter staff ID or name..."
		/>
	  </div>
	</div>
  );
};

export default Page;
