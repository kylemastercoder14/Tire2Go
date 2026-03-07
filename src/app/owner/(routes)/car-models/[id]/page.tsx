import React from "react";
import CarModelForm from "@/components/forms/CarModelForm";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  const initialData = await db.carModel.findUnique({
    where: {
      id: params.id,
    },
    select: {
      id: true,
      name: true,
      makeId: true,
      years: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const carMakes = await db.carMake.findMany({ orderBy: { name: "asc" } });

  const title = initialData ? "Edit Car Model" : "Create New Car Model";
  const description = initialData
    ? "Update the details of an existing car model."
    : "Add a new car model to your system.";

  return (
    <div>
      <Heading title={title} description={description} />
      <div className="mt-5">
        <CarModelForm initialData={initialData} carMakes={carMakes} />
      </div>
    </div>
  );
};

export default Page;
