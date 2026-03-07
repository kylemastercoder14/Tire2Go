import React from "react";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { DataTable } from "@/components/globals/DataTable";
import { columns } from "./_components/columns";

const Page = async () => {
  const data = await db.faqs.findMany({
	orderBy: {
	  createdAt: "desc",
	},
  });
  return (
	<div>
	  <div className="flex items-center flex-wrap gap-3 justify-between">
		<Heading
		  title="Frequently Asked Questions"
		  description="Manage your frequently asked questions to assist users effectively."
		/>

		<Button size="sm">
		  <Link
			href="/admin/faqs/create"
			className="flex items-center gap-2"
		  >
			<IconPlus className="size-4" />
			Create new FAQ
		  </Link>
		</Button>
	  </div>
	  <div className="mt-5">
		<DataTable
		  columns={columns}
		  data={data}
		  searchPlaceholder="Filter FAQs by question or answer..."
		/>
	  </div>
	</div>
  );
};

export default Page;
