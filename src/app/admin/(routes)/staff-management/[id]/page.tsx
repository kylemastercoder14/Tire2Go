import React from "react";
import StaffForm from "@/components/forms/StaffForm";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  const initialData = await db.staff.findUnique({
    where: {
      id: params.id,
    },
  });

  const title = initialData ? "Edit Staff Member" : "Create New Staff Member";
  const description = initialData
    ? "Update the details of an existing staff member."
    : "Add a new staff member to your system.";

  return (
    <div>
      <Heading title={title} description={description} />
      <div className="mt-5">
        <StaffForm initialData={initialData} />
      </div>
    </div>
  );
};

export default Page;
