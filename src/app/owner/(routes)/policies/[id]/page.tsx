import React from "react";
import PolicyForm from "@/components/forms/PolicyForm";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";

const Page = async (props: {
  params: Promise<{
	id: string;
  }>;
}) => {
  const params = await props.params;

  const initialData = await db.policies.findUnique({
	where: {
	  id: params.id,
	},
  });

  const title = initialData ? "Edit Policy" : "Create New Policy";
  const description = initialData
	? "Update the details of an existing policy."
	: "Add a new policy to your system.";

  return (
	<div>
	  <Heading title={title} description={description} />
	  <div className="mt-5">
		<PolicyForm initialData={initialData} />
	  </div>
	</div>
  );
};

export default Page;
