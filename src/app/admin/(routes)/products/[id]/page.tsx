import React from "react";
import ProductForm from "@/components/forms/ProductForm";
import db from "@/lib/db";
import Heading from "@/components/globals/Heading";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  const initialData = await db.products.findUnique({
    where: {
      id: params.id,
    },
  });

  const brands = await db.brands.findMany({ orderBy: { name: "asc" } });

  const title = initialData ? "Edit Product" : "Create New Product";
  const description = initialData
    ? "Update the details of an existing tire or mag product."
    : "Add a new tire or mag product to your catalog.";

  return (
    <div>
      <Heading title={title} description={description} />
      <div className="mt-5">
        <ProductForm initialData={initialData} brands={brands} />
      </div>
    </div>
  );
};

export default Page;
