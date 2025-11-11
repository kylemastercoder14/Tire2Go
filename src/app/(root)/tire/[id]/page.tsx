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

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div
        className="w-full pt-24 h-[20vh] flex items-center justify-center bg-cover bg-center"
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
                <Link href="/clearance-sale">CLEARANCE SALE</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary font-bold uppercase">
                Tire Details
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <section className="pt-8 pb-12 px-10 lg:px-24">
        <TireDetails data={data!} />
      </section>
      {otherProducts.length > 0 && (
        <section className="pb-16 px-10 lg:px-24">
          <div className="flex flex-col items-center mb-5">
            <h3 className="text-xl font-bold border-b-2 pb-1 border-primary inline-block text-center tracking-tight">
              More tires from {data?.brand.name}
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
