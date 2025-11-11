import React from "react";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CarMakesTable from "./_components/car-makes-table";
import CarModelsTable from "./_components/car-models-table";

const Page = async () => {
  // Fetch car makes data
  const carMakesData = await db.carMake.findMany({
    include: {
      models: true,
    },
  });

  // Fetch car models data
  const carModelsData = await db.carModel.findMany({
    include: {
      make: true,
    },
  });

  // Fetch car makes for the form dropdown
  const carMakes = await db.carMake.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <Tabs defaultValue="car-makes">
        <TabsList>
          <TabsTrigger value="car-makes">Car Makes</TabsTrigger>
          <TabsTrigger value="car-models">Car Models</TabsTrigger>
        </TabsList>

        <TabsContent value="car-makes" className="mt-6">
          <CarMakesTable data={carMakesData} />
        </TabsContent>

        <TabsContent value="car-models" className="mt-6">
          <CarModelsTable data={carModelsData} carMakes={carMakes} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;
