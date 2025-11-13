/* eslint-disable @next/next/no-img-element */
import React from "react";
import db from "@/lib/db";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { IconChecks, IconHandClick } from "@tabler/icons-react";
import TireSearch from "@/components/globals/TireSearch";
import { buttonVariants } from "@/components/ui/button";
import { showTireBrandBanner } from "@/lib/show-brand-banner";
import { getTireSizesForSearch, getCarDataForSearch } from "@/actions";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  const [initialData, products, tireSizesResult, carDataResult] =
    await Promise.all([
      db.brands.findUnique({
        where: {
          id: params.id,
        },
      }),
      db.products.findMany({
        where: {
          brandId: params.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          brand: true,
          productSize: {
            include: {
              tireSize: true,
            },
          },
        },
      }),
      getTireSizesForSearch(),
      getCarDataForSearch(),
    ]);

  const searchBySize = tireSizesResult.data || {};
  const searchByCar = carDataResult.data || [];

  if (!initialData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Brand not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div
        className="w-full pt-30 h-[20vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://gogulong.ph/_nuxt/img/breadcrumbs-bg.f31fb0b.png')",
        }}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-white hover:text-white/90 font-bold"
                asChild
              >
                <Link href="/brands">BRANDS</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary font-bold uppercase">
                {initialData.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <section className="max-w-7xl mx-auto pb-10">
        <div className="relative w-full h-[30vh]">
          <img
            src={showTireBrandBanner(initialData.name)}
            alt={initialData.name}
            className="object-cover size-full"
          />
        </div>
        <div className="mt-3">
          <h3 className="font-bold text-center text-gray-500 text-2xl">
            We Guarantee
          </h3>
          <div className="grid lg:grid-cols-4 grid-cols-1 mt-3 gap-5">
            <div className="flex items-center gap-3 border-r border-gray-500">
              <IconChecks className="size-10 text-green-600" />
              <h3 className="text-xl leading-tight font-semibold">
                <strong>BRAND NEW</strong> tires <br /> with manufacturer&apos;s{" "}
                <strong>
                  {" "}
                  <br />
                  WARRANTY
                </strong>
              </h3>
            </div>
            <div className="flex items-center gap-3 border-r border-gray-500">
              <IconChecks className="size-10 text-green-600" />
              <h3 className="text-xl leading-tight font-semibold">
                <strong>LEGITIMATE</strong> <br /> tire sellers
              </h3>
            </div>
            <div className="flex items-center gap-3 border-r border-gray-500">
              <IconChecks className="size-10 text-green-600" />
              <h3 className="text-xl leading-tight font-semibold">
                Sales invoice with <br />
                <strong>NO HIDDEN CHARGES</strong>
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <IconChecks className="size-10 text-green-600" />
              <h3 className="text-xl leading-tight font-semibold">
                <strong>PROFESSIONAL</strong> <br /> tire installation
              </h3>
            </div>
          </div>
          <TireSearch
            className="!max-w-7xl mt-10"
            searchBySize={searchBySize}
            searchByCar={searchByCar}
          />
          <h3 className="font-bold mt-10 text-center text-gray-500 text-2xl">
            Featured Tires
          </h3>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-10">
              <p className="text-lg">No products found for this brand.</p>
              <Link
                href="/brands"
                className={buttonVariants({
                  variant: "outline",
                  className: "mt-5",
                })}
              >
                <IconHandClick className="mr-2" />
                Back to Brands
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid lg:grid-cols-4 grid-cols-1 gap-7">
              {products.map((product) => {
                // Calculate price range from productSize
                const productSizes = product.productSize || [];
                let priceRange = null;
                let hasClearanceSale = false;

                if (productSizes.length > 0) {
                  const prices = productSizes.map((ps) => {
                    const effectivePrice =
                      ps.isClearanceSale &&
                      ps.discountedPrice &&
                      ps.discountedPrice < ps.price
                        ? ps.discountedPrice
                        : ps.price;
                    if (ps.isClearanceSale) hasClearanceSale = true;
                    return effectivePrice;
                  });

                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);

                  if (minPrice === maxPrice) {
                    priceRange = `₱${minPrice.toLocaleString()}`;
                  } else {
                    priceRange = `₱${minPrice.toLocaleString()} - ₱${maxPrice.toLocaleString()}`;
                  }
                } else {
                  // Fallback to product price
                  const effectivePrice =
                    product.isClearanceSale &&
                    product.discountedPrice &&
                    product.discountedPrice < (product.price || 0)
                      ? product.discountedPrice
                      : product.price || 0;
                  priceRange = `₱${effectivePrice.toLocaleString()}`;
                  hasClearanceSale = product.isClearanceSale || false;
                }

                // Get available tire sizes
                const tireSizes = productSizes.map((ps) => {
                  const ts = ps.tireSize;
                  if (ts.ratio && ts.diameter) {
                    return `${ts.width}/${ts.ratio} R${ts.diameter}`;
                  } else if (ts.diameter) {
                    return `${ts.width} R${ts.diameter}`;
                  } else {
                    return `${ts.width}`;
                  }
                });
                const uniqueTireSizes = [...new Set(tireSizes)].sort();
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
                      <h2 className="font-bold text-sm">
                        {hasClearanceSale ? "CLEARANCE SALE" : "REGULAR PRICE"}
                      </h2>
                    </div>
                    <div className="px-2 py-1">
                      <h4 className="font-bold text-lg">{product.name}</h4>
                      {uniqueTireSizes.length > 0 ? (
                        <div className="mt-1">
                          <p className="text-xs text-muted-foreground">
                            Available Sizes:
                          </p>
                          <p className="font-semibold text-sm">
                            {uniqueTireSizes.slice(0, 3).join(", ")}
                            {uniqueTireSizes.length > 3 &&
                              ` +${uniqueTireSizes.length - 3} more`}
                          </p>
                        </div>
                      ) : (
                        <p className="font-bold text-sm">
                          {product.tireSize || "N/A"}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-primary font-bold text-lg">
                          {priceRange}{" "}
                          <span className="font-medium text-base">
                            per tire
                          </span>
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
          )}
        </div>
      </section>
    </div>
  );
};

export default Page;
