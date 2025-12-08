import React from "react";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { DataTable } from "@/components/globals/DataTable";
import { columns } from "./_components/columns";

const Page = async () => {
  const data = await db.tipsGuides.findMany({
	orderBy: {
	  createdAt: "desc",
	},
  });
  return (
	<div>
	  <div className="flex items-center flex-wrap gap-3 justify-between">
		<Heading
		  title="Tips & Guides"
		  description="Manage your tips and guides to help customers make informed purchasing decisions."
		/>

		<Button size="sm">
		  <Link
			href="/admin/tips-and-guides/create"
			className="flex items-center gap-2"
		  >
			<IconPlus className="size-4" />
			Create new tips and guide
		  </Link>
		</Button>
	  </div>
	  <div className="mt-5">
		<DataTable
		  columns={columns}
		  data={data}
		  searchPlaceholder="Filter tips and guides by title or category..."
		/>
	  </div>
	</div>
  );
};

export default Page;
