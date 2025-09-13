import React from "react";
import TipsGuidesForm from "@/components/forms/TipsGuidesForm";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";

const Page = async (props: {
  params: Promise<{
	id: string;
  }>;
}) => {
  const params = await props.params;

  const initialData = await db.tipsGuides.findUnique({
	where: {
	  id: params.id,
	},
  });

  const title = initialData ? "Edit Tips & Guides" : "Create New Tips & Guides";
  const description = initialData
	? "Update the details of an existing tips & guides."
	: "Add a new tips & guides to your catalog.";

  return (
	<div>
	  <Heading title={title} description={description} />
	  <div className="mt-5">
		<TipsGuidesForm initialData={initialData} />
	  </div>
	</div>
  );
};

export default Page;
