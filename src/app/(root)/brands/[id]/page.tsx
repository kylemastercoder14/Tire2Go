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
import Image from "next/image";
import { IconChecks, IconHandClick } from "@tabler/icons-react";
import TireSearch from "@/components/globals/TireSearch";
import { buttonVariants } from "@/components/ui/button";
import { showTireBrandBanner } from '@/lib/show-brand-banner';

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  const initialData = await db.brands.findUnique({
    where: {
      id: params.id,
    },
  });

  const products = await db.products.findMany({
    where: {
      brandId: params.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      brand: true,
    },
  });

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
          <Image
            src={showTireBrandBanner(initialData.name)}
            fill
            alt={initialData.name}
            className="object-cover"
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
          <TireSearch className="!max-w-7xl mt-10" />
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
