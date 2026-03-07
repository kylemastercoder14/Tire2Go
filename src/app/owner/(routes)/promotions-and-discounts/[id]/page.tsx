import React from "react";
import PromotionForm from "@/components/forms/PromotionForm";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  const initialData = await db.promotions.findUnique({
    where: {
      id: params.id,
    },
  });

  const title = initialData ? "Edit Promotion" : "Create New Promotion";
  const description = initialData
    ? "Update the details of an existing promotion."
    : "Add a new promotion to your system.";

  return (
    <div>
      <Heading title={title} description={description} />
      <div className="mt-5">
        <PromotionForm initialData={initialData} />
      </div>
    </div>
  );
};

export default Page;
