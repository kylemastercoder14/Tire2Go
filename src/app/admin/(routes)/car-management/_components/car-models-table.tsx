"use client";

import React from "react";
import { DataTable } from "@/components/globals/DataTable";
import { createColumns } from "@/app/admin/(routes)/car-models/_components/columns";
import CreateCarModelButton from "@/app/admin/(routes)/car-models/_components/create-button";
import { CarMake, CarModel } from "@prisma/client";
import Heading from '@/components/globals/Heading';

type CarModelWithMake = CarModel & {
  make: CarMake;
  years?: number[];
  compatibilities: Array<{ year: number | null }>;
};

interface CarModelsTableProps {
  data: CarModelWithMake[];
  carMakes: CarMake[];
}

const CarModelsTable = ({ data, carMakes }: CarModelsTableProps) => {
  const columns = createColumns(carMakes);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
	  <Heading
          title="Car Models"
          description="Manage car models for tire compatibility."
        />
        <CreateCarModelButton carMakes={carMakes} />
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Filter car model name..."
      />
    </div>
  );
};

export default CarModelsTable;
