import React from "react";
import CarMakeForm from "@/components/forms/CarMakeForm";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  const initialData = await db.carMake.findUnique({
    where: {
      id: params.id,
    },
  });

  const title = initialData ? "Edit Car Make" : "Create New Car Make";
  const description = initialData
    ? "Update the details of an existing car make."
    : "Add a new car make to your system.";

  return (
    <div>
      <Heading title={title} description={description} />
      <div className="mt-5">
        <CarMakeForm initialData={initialData} />
      </div>
    </div>
  );
};

export default Page;
