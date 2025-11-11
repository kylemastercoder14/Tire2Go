"use client";

import React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { IconHandClick } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
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
}

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

const ProductGrid = ({ products, isLoading }: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="mt-5 grid lg:grid-cols-4 grid-cols-1 gap-7">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="border border-primary shadow rounded-md"
          >
            <Skeleton className="w-full h-60" />
            <Skeleton className="h-10 w-full" />
            <div className="px-2 py-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center py-20">
        <p className="text-lg text-muted-foreground">
          No tires found matching your search criteria.
        </p>
        <Link
          href="/"
          className={`mt-5 ${buttonVariants({
            variant: "outline",
          })}`}
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
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
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-20">
                <img
                  src="/logo.png"
                  alt={"logo"}
                  className="object-contain size-full opacity-30"
                />
              </div>
            </div>
            {hasClearanceSale && (
              <div className="bg-gradient-to-l p-2 from-red-500 to-primary text-white">
                <h2 className="font-bold text-sm">CLEARANCE SALE</h2>
              </div>
            )}
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
  );
};

export default ProductGrid;


