import React from "react";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import CreateCarModelButton from "./_components/create-button";
import CarModelsTable from "./_components/car-models-table";

const Page = async () => {
  const data = await db.carModel.findMany({
    include: {
      make: true,
    },
    select: {
      id: true,
      name: true,
      makeId: true,
      years: true,
      createdAt: true,
      updatedAt: true,
      make: true,
    },
  });

  const carMakes = await db.carMake.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <Heading
          title="Car Models"
          description="Browse and manage car models for tire compatibility."
        />

        <CreateCarModelButton carMakes={carMakes} />
      </div>
      <div className="mt-5">
        <CarModelsTable data={data} carMakes={carMakes} />
      </div>
    </div>
  );
};

export default Page;
