import React from "react";
import TireSizeForm from "@/components/forms/TireSizeForm";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  const initialData = await db.tireSize.findUnique({
    where: {
      id: params.id,
    },
  });

  const title = initialData ? "Edit Tire Size" : "Create New Tire Size";
  const description = initialData
    ? "Update the details of an existing tire size."
    : "Add a new tire size to your system.";

  return (
    <div>
      <Heading title={title} description={description} />
      <div className="mt-5">
        <TireSizeForm initialData={initialData} />
      </div>
    </div>
  );
};

export default Page;
