/* eslint-disable @next/next/no-img-element */
import React from "react";
import FilterSidebar from "@/components/globals/FilterSidebar";
import SortOptions from "@/components/globals/SortOptions";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import db from "@/lib/db";
import { IconHandClick } from "@tabler/icons-react";
import { SEARCH_BY_CAR } from '@/constants';

interface PageProps {
  searchParams: {
    brand?: string;
    model?: string;
    year?: string;
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const { brand, model, year } = searchParams;

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
      // optional: filter by brand if provided
      ...(brand && { brand: { name: brand } }),
    },
    orderBy: { createdAt: "desc" },
    include: { brand: true },
  });

  // Filter by car model and year using SEARCH_BY_CAR
  const filteredProducts = products.filter((product) => {
    if (!brand || !model || !year) return true; // no filtering if params missing
    const yearNum = parseInt(year, 10);

    // Check if this product matches the selected car
    const carEntry = SEARCH_BY_CAR.find((c) => c.make === brand);
    if (!carEntry) return false;
    const models = carEntry.models as Record<string, number[]>;
    const modelYears = models[model];
    if (!modelYears) return false;

    return modelYears.includes(yearNum);
  });

  return (
    <div className="min-h-screen">
      <div
        className="w-full pt-30 h-[20vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://gogulong.ph/_nuxt/img/breadcrumbs-bg.f31fb0b.png')",
        }}
      >
        <h3 className="text-white text-center">
          Showing results for <strong>{brand ? brand : "All"} {model ? model : ""} {year ? year : ""}</strong>
        </h3>
      </div>
      <section className="pt-5 px-24 pb-10 grid lg:grid-cols-10 grid-cols-1 gap-10">
        <div className="lg:col-span-2 p-5">
          <FilterSidebar brands={brands} />
        </div>
        <div className="lg:col-span-8 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">Searched Tires</h3>
            <SortOptions />
          </div>
          <div className="mt-5 grid lg:grid-cols-4 grid-cols-1 gap-7">
            {filteredProducts.map((product) => {
              return (
                <div
                  key={product.id}
                  className="border border-primary shadow rounded-md"
                >
                  <div className="relative w-full h-60">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="object-contain size-full"
                    />
                    <div className="absolute top-2 right-2 size-15">
                      <img
                        src={product.brand.logo}
                        alt={product.brand.name}
                        className="object-contain size-full"
                      />
                    </div>
                    {/* make it center */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-20">
                      <img
                        src="/logo.png"
                        alt={"logo"}
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
