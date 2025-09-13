import React from "react";
import FaqsForm from "@/components/forms/FaqsForm";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";

const Page = async (props: {
  params: Promise<{
	id: string;
  }>;
}) => {
  const params = await props.params;

  const initialData = await db.faqs.findUnique({
	where: {
	  id: params.id,
	},
  });

  const title = initialData ? "Edit FAQs" : "Create New FAQs";
  const description = initialData
	? "Update the details of an existing FAQs."
	: "Add a new FAQs to your catalog.";

  return (
	<div>
	  <Heading title={title} description={description} />
	  <div className="mt-5">
		<FaqsForm initialData={initialData} />
	  </div>
	</div>
  );
};

export default Page;
