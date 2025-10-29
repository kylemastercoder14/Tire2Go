import React from "react";
import ProductForm from "@/components/forms/ProductForm";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";

const Page = async () => {
  const brands = await db.brands.findMany({ orderBy: { name: "asc" } });
  const carMakes = await db.carMake.findMany({ 
    orderBy: { name: "asc" },
    include: { models: { orderBy: { name: "asc" } } }
  });

  const title = "Create New Product";
  const description = "Add a new tire or mag product to your catalog.";

  return (
    <div>
      <Heading title={title} description={description} />
      <div className="mt-5">
        <ProductForm initialData={null} brands={brands} carMakes={carMakes} />
      </div>
    </div>
  );
};

export default Page;