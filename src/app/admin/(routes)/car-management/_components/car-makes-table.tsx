"use client";

import React from "react";
import { DataTable } from "@/components/globals/DataTable";
import { columns } from "@/app/admin/(routes)/car-makes/_components/columns";
import CreateCarMakeButton from "@/app/admin/(routes)/car-makes/_components/create-button";
import { CarMake, CarModel } from "@prisma/client";
import Heading from "@/components/globals/Heading";

type CarMakeWithModels = CarMake & {
  models: CarModel[];
};

interface CarMakesTableProps {
  data: CarMakeWithModels[];
}

const CarMakesTable = ({ data }: CarMakesTableProps) => {
  return (
    <div>
      <div className="flex items-center flex-wrap gap-3 justify-between mb-4">
        <Heading
          title="Car Makes"
          description="Manage car makes for tire compatibility."
        />
        <CreateCarMakeButton />
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Filter car make name..."
      />
    </div>
  );
};

export default CarMakesTable;
