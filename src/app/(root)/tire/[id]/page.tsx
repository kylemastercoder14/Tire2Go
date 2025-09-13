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
import UnderConstruction from '@/components/globals/UnderConstruction';

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
    },
  });

  const otherProducts = await db.products.findMany({
	where: {
	  brandId: data?.brandId,
	  id: {
		not: data?.id,
	  },
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
	  <section className='pb-16 flex flex-col items-center justify-center px-10 lg:px-24'>
		<h3 className="text-xl font-bold border-b-2 pb-1 border-primary inline-block mx-auto text-center justify-center items-center tracking-tight mb-5">More tires from {data?.brand.name}</h3>
		<UnderConstruction />
	  </section>
    </div>
  );
};

export default Page;
