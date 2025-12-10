import React from "react";
import db from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { getProductsRatings, getProductsSoldCounts } from "@/actions";

const FeaturedProducts = async () => {
  // Fetch latest 8 products as featured products
  const products = await db.products.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      brand: true,
      productSize: {
        include: {
          tireSize: true,
        },
      },
    },
  });

  // Fetch ratings and sold counts for all products
  const productIds = products.map(p => p.id);
  const [ratings, soldCounts] = await Promise.all([
    getProductsRatings(productIds),
    getProductsSoldCounts(productIds),
  ]);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 sm:mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-7">
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

            // Also check product-level clearance sale
            if (product.isClearanceSale) hasClearanceSale = true;
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
            <Link
              key={product.id}
              href={`/tire/${product.id}`}
              className="border border-primary shadow rounded-md hover:shadow-lg transition-shadow"
            >
              <div className="relative w-full h-48 sm:h-52 lg:h-60">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="object-contain size-full p-2"
                />
                <div className="absolute top-2 right-2 w-12 h-12 sm:w-14 sm:h-14">
                  <img
                    src={product.brand.logo}
                    alt={product.brand.name}
                    className="object-contain size-full bg-white rounded p-1"
                  />
                </div>
              </div>
              <div className="bg-gradient-to-l from-red-500 to-primary text-white px-2 py-1">
                <h2 className="font-bold text-xs sm:text-sm">
                  {hasClearanceSale ? "CLEARANCE SALE" : "REGULAR PRICE"}
                </h2>
              </div>
              <div className="px-2 py-2 sm:py-3">
                <h4 className="font-bold text-sm sm:text-base line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h4>
                <div className="flex items-center gap-1.5 mt-1">
                  {ratings[product.id] && ratings[product.id].totalReviews > 0 ? (
                    <>
                      <StarRating rating={ratings[product.id].averageRating} readonly size="sm" />
                      <span className="text-xs text-muted-foreground">
                        ({ratings[product.id].averageRating.toFixed(1)}) • {ratings[product.id].totalReviews}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">No review</span>
                  )}
                </div>
                {soldCounts[product.id] !== undefined && (
                  <div className="mt-1">
                    <span className="text-xs text-muted-foreground">
                      {soldCounts[product.id] > 0 ? `${soldCounts[product.id]} sold` : 'No sales yet'}
                    </span>
                  </div>
                )}
                {uniqueTireSizes.length > 0 ? (
                  <div className="mt-1">
                    <p className="text-xs text-muted-foreground">
                      Available Sizes:
                    </p>
                    <p className="font-semibold text-xs sm:text-sm line-clamp-1">
                      {uniqueTireSizes.slice(0, 2).join(", ")}
                      {uniqueTireSizes.length > 2 &&
                        ` +${uniqueTireSizes.length - 2} more`}
                    </p>
                  </div>
                ) : (
                  <p className="font-bold text-xs sm:text-sm">
                    {product.tireSize || "N/A"}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-primary font-bold text-base sm:text-lg">
                    {priceRange}
                    <span className="font-medium text-xs sm:text-sm">
                      {" "}
                      per tire
                    </span>
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="flex justify-center mt-6 sm:mt-8">
        <Link
          href="/tire"
          className={buttonVariants({
            variant: "default",
            size: "lg",
          })}
        >
          View All Tires
        </Link>
      </div>
    </div>
  );
};

export default FeaturedProducts;

