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
import { IconChecks } from "@tabler/icons-react";
import TireSearch from "@/components/globals/TireSearch";
import { showTireBrandBanner } from "@/lib/show-brand-banner";
import { getTireSizesForSearch, getCarDataForSearch } from "@/actions";
import BrandProductGrid from "./_components/brand-product-grid";

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

  // Get color scheme with fallback to default colors
  const colorScheme = initialData.colorScheme && typeof initialData.colorScheme === 'object' && initialData.colorScheme !== null
    ? initialData.colorScheme as { primary: string; secondary: string; accent?: string }
    : { primary: "#c02b2b", secondary: "#dc2626", accent: "#ef4444" };

  return (
    <div className="min-h-screen">
      <div
        className="w-full pt-30 h-[20vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://gogulong.ph/_nuxt/img/breadcrumbs-bg.f31fb0b.png')",
          backgroundColor: colorScheme.primary,
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
              <BreadcrumbPage
                className="font-bold uppercase"
                style={{ color: colorScheme.accent || colorScheme.secondary }}
              >
                {initialData.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <section className="max-w-7xl mx-auto pb-10">
        <div className="relative w-full lg:h-[30vh] h-[20vh]">
          <img
            src={showTireBrandBanner(initialData.name)}
            alt={initialData.name}
            className="object-cover size-full"
          />
        </div>
        <div className="mt-3 lg:px-0 px-5">
          <h3 className="font-bold text-center text-gray-500 text-2xl">
            We Guarantee
          </h3>
          <div className="grid lg:grid-cols-4 grid-cols-1 mt-3 gap-5">
            <div className="flex items-center gap-3 lg:border-r lg:border-gray-500">
              <IconChecks className="size-10" style={{ color: colorScheme.primary }} />
              <h3 className="lg:text-xl text-base leading-tight font-semibold">
                <strong>BRAND NEW</strong> tires <br /> with manufacturer&apos;s{" "}
                <strong>
                  {" "}
                  <br />
                  WARRANTY
                </strong>
              </h3>
            </div>
            <div className="flex items-center gap-3 lg:border-r lg:border-gray-500">
              <IconChecks className="size-10" style={{ color: colorScheme.primary }} />
              <h3 className="lg:text-xl text-base leading-tight font-semibold">
                <strong>LEGITIMATE</strong> <br /> tire sellers
              </h3>
            </div>
            <div className="flex items-center gap-3 lg:border-r lg:border-gray-500">
              <IconChecks className="size-10" style={{ color: colorScheme.primary }} />
              <h3 className="lg:text-xl text-base leading-tight font-semibold">
                Sales invoice with <br />
                <strong>NO HIDDEN CHARGES</strong>
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <IconChecks className="size-10" style={{ color: colorScheme.primary }} />
              <h3 className="lg:text-xl text-base leading-tight font-semibold">
                <strong>PROFESSIONAL</strong> <br /> tire installation
              </h3>
            </div>
          </div>
          <div style={{ "--brand-primary": colorScheme.primary, "--brand-secondary": colorScheme.secondary } as React.CSSProperties}>
            <TireSearch
              className="!max-w-7xl mt-10"
              searchBySize={searchBySize}
              searchByCar={searchByCar}
            />
          </div>
          <h3 className="font-bold mt-10 text-center text-gray-500 text-2xl">
            Featured Tires
          </h3>
          <BrandProductGrid products={products} colorScheme={colorScheme} />
        </div>
      </section>
    </div>
  );
};

export default Page;
