import React from "react";
import db from "../../lib/db";
import Image from "next/image";

const BrandsCollection = async () => {
  const brands = await db.brands.findMany({
    orderBy: { name: "asc" },
  });
  return (
    <div className="max-w-7xl mx-auto mt-10 grid lg:grid-cols-6 md:grid-cols-4 grid-cols-3 gap-5">
      {brands.map((brand) => {
        return (
          <div
            key={brand.id}
            className="bg-white flex flex-col items-center justify-center px-4 py-3 rounded-sm shadow border"
          >
            <div className="relative w-full h-8">
              <Image
                src={brand.logo}
                alt={brand.name}
                fill
                className="object-contain size-full"
              />
            </div>
            <p className="uppercase mt-3 text-sm font-medium">{brand.name}</p>
          </div>
        );
      })}
    </div>
  );
};

export default BrandsCollection;
