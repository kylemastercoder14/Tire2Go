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
import TireDetails from "@/components/globals/TireDetails";
import ProductGrid from "@/app/(root)/tire-search/_components/product-grid";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;
  const data = await db.products.findUnique({
    where: {
      id: params.id,
    },
    include: {
      brand: true,
      productSize: {
        include: {
          tireSize: true,
        },
        orderBy: [
          { tireSize: { width: "asc" } },
          { tireSize: { ratio: "asc" } },
          { tireSize: { diameter: "asc" } },
        ],
      },
    },
  });

  const otherProducts = await db.products.findMany({
    where: {
      brandId: data?.brandId,
      id: {
        not: data?.id,
      },
    },
    include: {
      brand: true,
      productSize: {
        include: {
          tireSize: true,
        },
      },
    },
    take: 8, // Limit to 8 products
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center text-center px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Tire not found
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          The tire you&apos;re looking for may not exist or has been removed.
        </p>
        <Link
          href="/tire"
          className="px-4 py-2 text-sm sm:text-base bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          Back to Tires
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div
        className="w-full pt-24 sm:pt-30 h-[15vh] sm:h-[20vh] flex items-center justify-center bg-cover bg-center px-4"
        style={{
          backgroundImage:
            "url('https://gogulong.ph/_nuxt/img/breadcrumbs-bg.f31fb0b.png')",
        }}
      >
        <Breadcrumb>
          <BreadcrumbList className="flex-wrap justify-center">
            <BreadcrumbItem className="hidden sm:block">
              <BreadcrumbLink
                className="text-white hover:text-white/90 font-bold text-sm sm:text-base"
                asChild
              >
                <Link href="/tire">TIRE BRANDS</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white hidden sm:block" />
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-white hover:text-white/90 font-bold text-sm sm:text-base"
                asChild
              >
                <Link href={`/brands/${data.brandId}`}>{data.brand.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white hidden sm:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary font-bold uppercase text-xs sm:text-sm md:text-base truncate max-w-[250px] sm:max-w-none">
                {data.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <section className="pt-4 sm:pt-6 lg:pt-8 pb-8 sm:pb-10 lg:pb-12 px-4 sm:px-6 lg:px-10 xl:px-24">
        <TireDetails data={data} />
      </section>
      {otherProducts.length > 0 && (
        <section className="pb-12 sm:pb-16 px-4 sm:px-6 lg:px-10 xl:px-24">
          <div className="flex flex-col items-center mb-4 sm:mb-5">
            <h3 className="text-lg sm:text-xl font-bold border-b-2 pb-1 border-primary inline-block text-center tracking-tight">
              More tires from {data.brand.name}
            </h3>
          </div>
          <ProductGrid
            products={otherProducts.map((p) => ({
              id: p.id,
              name: p.name,
              images: p.images,
              inclusion: p.inclusion,
              tireSize: p.tireSize,
              brand: {
                id: p.brand.id,
                name: p.brand.name,
                logo: p.brand.logo,
              },
              productSize: p.productSize?.map((ps) => ({
                price: ps.price,
                isClearanceSale: ps.isClearanceSale,
                discountedPrice: ps.discountedPrice,
                tireSize: {
                  width: ps.tireSize.width,
                  ratio: ps.tireSize.ratio,
                  diameter: ps.tireSize.diameter,
                },
              })),
              isClearanceSale: p.isClearanceSale,
              price: p.price,
              discountedPrice: p.discountedPrice,
            }))}
          />
        </section>
      )}
    </div>
  );
};

export default Page;
