import React from "react";
import db from "@/lib/db";
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import ProductGrid from "@/app/(root)/tire-search/_components/product-grid";
import { IconCheck } from '@tabler/icons-react';

interface PageProps {
  params: Promise<{
    make: string;
    model: string;
  }>;
}

const Page = async (props: PageProps) => {
  const params = await props.params;
  const makeName = decodeURIComponent(params.make).toUpperCase();
  const modelName = decodeURIComponent(params.model).toUpperCase();

  // Find the car make
  const carMake = await db.carMake.findFirst({
    where: {
      name: makeName,
    },
  });

  if (!carMake) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Car make not found</p>
      </div>
    );
  }

  // Find the car model
  const carModel = await db.carModel.findFirst({
    where: {
      name: modelName,
      makeId: carMake.id,
    },
    include: {
      make: true,
    },
  });

  if (!carModel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Car model not found</p>
      </div>
    );
  }

  // Get compatible products
  const compatibilities = await db.productCompatibility.findMany({
    where: {
      modelId: carModel.id,
    },
    include: {
      product: {
        include: {
          brand: true,
          productSize: {
            include: {
              tireSize: true,
            },
          },
        },
      },
    },
  });

  // Get unique products
  const productMap = new Map();
  compatibilities.forEach((comp) => {
    if (comp.product && !productMap.has(comp.productId)) {
      productMap.set(comp.productId, comp.product);
    }
  });

  // Type the products to match ProductGrid's Product interface
  type ProductType = {
    id: string;
    name: string;
    images: string[];
    inclusion: string;
    tireSize?: string | null;
    brand: {
      id: string;
      name: string;
      logo: string;
    };
    productSize?: Array<{
      price: number;
      isClearanceSale: boolean;
      discountedPrice: number | null;
      tireSize: {
        width: number;
        ratio: number | null;
        diameter: number | null;
      };
    }>;
    isClearanceSale?: boolean;
    price?: number;
    discountedPrice?: number | null;
  };

  const products = Array.from(productMap.values()) as ProductType[];

  // Get common tire sizes for this car model
  const tireSizes = new Set<string>();
  products.forEach((product) => {
    if (product.productSize && product.productSize.length > 0) {
      product.productSize.forEach((ps: NonNullable<ProductType["productSize"]>[number]) => {
        const ts = ps.tireSize;
        if (ts.ratio && ts.diameter) {
          tireSizes.add(`${ts.width}/${ts.ratio} R${ts.diameter}`);
        } else if (ts.diameter) {
          tireSizes.add(`${ts.width} R${ts.diameter}`);
        }
      });
    }
  });

  const commonTireSizes = Array.from(tireSizes).slice(0, 1); // Get first common size for banner

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Breadcrumbs */}
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
                <Link href="/car-models">Car Models</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary font-bold">
                {carMake.name} {carModel.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Banner */}
      <section className="relative max-w-7xl mx-auto px-10">
        <div className="relative w-full h-[65vh] overflow-hidden">
          {/* Background Image with car model */}
          <div className="absolute inset-0">
            <Image
              src={`/car-models/${carMake.name} ${carModel.name}.png`}
              alt={`${carMake.name} ${carModel.name}`}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 via-gray-900/30 to-gray-900/50" />
          </div>
        </div>
      </section>

      {/* We Guarantee Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">
            We Guarantee
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <IconCheck className="size-10 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">
                  <strong>BRAND NEW</strong> tires with manufacturer&apos;s <strong>WARRANTY</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <IconCheck className="size-10 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">
                  <strong>LEGITIMATE</strong> tire sellers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <IconCheck className="size-10 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">
                  Sales invoice with <strong>NO HIDDEN CHARGES</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <IconCheck className="size-10 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">
                  <strong>PROFESSIONAL</strong> tire installation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Original Equipment Tires */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-10">
        <div className="mb-6">
          <h2 className="text-2xl text-center font-bold text-gray-900">
            {carMake.name} {carModel.name}
          </h2>
          <h3 className="text-lg text-center font-semibold text-gray-700 mt-2">
            Recommended{" "}
            <strong>Original Equipment</strong> Tires
          </h3>
        </div>

        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="mt-10 flex flex-col items-center justify-center py-20 bg-white rounded-lg">
            <p className="text-lg text-muted-foreground">
              No tires found for this car model yet.
            </p>
            <Link
              href="/car-models"
              className="mt-5 text-primary font-medium underline"
            >
              Browse other car models
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Page;

