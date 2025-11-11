"use client";

import React from "react";
import { DataTable } from "@/components/globals/DataTable";
import { createColumns } from "./columns";
import { CarMake, CarModel } from "@prisma/client";

type CarModelWithMake = CarModel & {
  make: CarMake;
};

interface CarModelsTableProps {
  data: CarModelWithMake[];
  carMakes: CarMake[];
}

const CarModelsTable = ({ data, carMakes }: CarModelsTableProps) => {
  const columns = createColumns(carMakes);

  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Filter car model name..."
    />
  );
};

export default CarModelsTable;
