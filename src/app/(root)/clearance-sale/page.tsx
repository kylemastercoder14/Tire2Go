import React from "react";
import FilterSidebar from "@/components/globals/FilterSidebar";
import db from "@/lib/db";
import SortOptions from "@/components/globals/SortOptions";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "../../../components/ui/button";
import { IconHandClick } from "@tabler/icons-react";

const Page = async () => {
  const brands = await db.brands.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      products: true,
    },
  });

  const products = await db.products.findMany({
    where: {
      isClearanceSale: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      brand: true,
    },
  });
  return (
    <div className="min-h-screen">
      <div className="w-full relative h-[40vh] bg-gray-500">
        <Image src="/CLEARANCE SALE.png" alt="Clearance Sale Banner" className='object-cover' fill />
      </div>
      <section className="px-24 pt-10 grid lg:grid-cols-10 grid-cols-1 gap-10">
        <div className="lg:col-span-2 p-5">
          <FilterSidebar brands={brands} />
        </div>
        <div className="lg:col-span-8 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">Featured Tires</h3>
            <SortOptions />
          </div>
          <div className="mt-5 grid lg:grid-cols-4 grid-cols-1 gap-7">
            {products.map((product) => {
              return (
                <div
                  key={product.id}
                  className="border border-primary shadow rounded-md"
                >
                  <div className="relative w-full h-60">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-contain size-full"
                    />
                    <div className="absolute top-2 right-2 size-15">
                      <Image
                        src={product.brand.logo}
                        alt={product.brand.name}
                        fill
                        className="object-contain size-full"
                      />
                    </div>
                    {/* make it center */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-20">
                      <Image
                        src="/logo.png"
                        alt={"logo"}
                        fill
                        className="object-contain size-full opacity-30"
                      />
                    </div>
                  </div>
                  <div className="bg-gradient-to-l p-2 from-red-500 to-primary text-white">
                    <h2 className="font-bold text-sm">CLEARANCE SALE</h2>
                  </div>
                  <div className="px-2 py-1">
                    <h4 className="font-bold text-lg">{product.name}</h4>
                    <p className="font-bold text-sm">{product.tireSize}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="line-through text-muted-foreground text-sm font-medium">
                        ₱{product.price.toLocaleString()}
                      </p>
                      <p className="text-primary font-bold text-lg">
                        ₱
                        {product.discountedPrice !== null &&
                        product.discountedPrice !== undefined
                          ? product.discountedPrice.toLocaleString()
                          : ""}{" "}
                        <span className="font-medium text-base">per tire</span>
                      </p>
                    </div>
                    <div
                      className="my-3 text-sm prose prose-sm max-w-none
                        prose-headings:font-bold
                        prose-headings:text-muted-foreground
                        prose-a:text-primary prose-a:underline
                        prose-ul:list-disc prose-ol:list-decimal
                        prose-li:marker:text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: product.inclusion }}
                    />
                    <Link
                      href={`/tire/${product.id}`}
                      className={`w-full mb-2 ${buttonVariants({
                        variant: "default",
                      })}`}
                    >
                      <IconHandClick className="size-4" />
                      View Tire Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
