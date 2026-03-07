import React from "react";
import BrandForm from "@/components/forms/BrandForm";
import db from '@/lib/db';
import Heading from '@/components/globals/Heading';

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  const initialData = await db.brands.findUnique({
    where: {
      id: params.id,
    },
  });

  const title = initialData ? "Edit Brand" : "Create New Brand";
  const description = initialData
    ? "Update the details of an existing tire or mag brand."
    : "Add a new tire or mag brand to your catalog.";

  return (
    <div>
      <Heading title={title} description={description} />
      <div className="mt-5">
        <BrandForm initialData={initialData} />
      </div>
    </div>
  );
};

export default Page;
