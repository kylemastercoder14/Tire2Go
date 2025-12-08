/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import FilterSidebar from "@/components/globals/FilterSidebar";
import SearchResults from "../tire-search/_components/search-results";
import db from "@/lib/db";
import { getTireSizesForSearch, getCarDataForSearch } from "@/actions";

interface PageProps {
  searchParams: Promise<{
    brand?: string;
    model?: string;
    year?: string;
    width?: string;
    ratio?: string;
    diameter?: string;
    brandIds?: string;
    sortBy?: string; // Added sortBy param
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const { brand, model, year, width, ratio, diameter, brandIds, sortBy } = params;

  // Fetch search data for FilterSidebar
  const [tireSizesResult, carDataResult] = await Promise.all([
    getTireSizesForSearch(),
    getCarDataForSearch(),
  ]);

  const searchBySize = tireSizesResult.data || {};
  const searchByCar = carDataResult.data || [];

  // Parse brandIds filter
  const brandIdsArray = brandIds ? brandIds.split(",").filter(Boolean) : [];

  const brands = await db.brands.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      products: true,
    },
  });

  let products = [];

  // Search by tire size (supports partial searches: width only, width+ratio, or all three)
  if (width) {
    const widthNum = parseInt(width, 10);
    const ratioNum = ratio ? parseInt(ratio, 10) : null;
    const diameterNum = diameter ? parseInt(diameter, 10) : null;

    // Build where clause for tire size search
    const tireSizeWhere: any = { width: widthNum };
    if (ratioNum !== null) tireSizeWhere.ratio = ratioNum;
    if (diameterNum !== null) tireSizeWhere.diameter = diameterNum;

    // Find tire sizes matching the search criteria
    const tireSizes = await db.tireSize.findMany({
      where: tireSizeWhere,
    });

    if (tireSizes.length > 0) {
      const tireSizeIds = tireSizes.map((ts) => ts.id);

      // Find products that have any of these tire sizes
      const productSizes = await db.productSize.findMany({
        where: {
          tireSizeId: {
            in: tireSizeIds,
          },
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

      // Get unique products and filter by brand if needed
      const productMap = new Map();
      productSizes.forEach((ps) => {
        if (
          ps.product &&
          (!brandIdsArray.length ||
            brandIdsArray.includes(ps.product.brandId))
        ) {
          if (!productMap.has(ps.productId)) {
            productMap.set(ps.productId, ps.product);
          }
        }
      });

      products = Array.from(productMap.values());
    }
  }
  // Search by car (supports brand+model only or brand+model+year)
  else if (brand && model) {
    // Find the car make
    const carMake = await db.carMake.findFirst({
      where: {
        name: brand,
      },
    });

    if (carMake) {
      // Find the car model
      const carModel = await db.carModel.findFirst({
        where: {
          name: model,
          makeId: carMake.id,
        },
      });

      if (carModel) {
        // Build where clause for compatibility search
        const compatibilityWhere: any = { modelId: carModel.id };
        if (year) {
          const yearNum = parseInt(year, 10);
          compatibilityWhere.year = yearNum;
        }

        // Find products with matching compatibility
        const compatibilities = await db.productCompatibility.findMany({
          where: compatibilityWhere,
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

        // Get unique products and filter by brand if needed
        const productMap = new Map();
        compatibilities.forEach((comp) => {
          if (
            comp.product &&
            (!brandIdsArray.length ||
              brandIdsArray.includes(comp.product.brandId))
          ) {
            if (!productMap.has(comp.productId)) {
              productMap.set(comp.productId, comp.product);
            }
          }
        });

        products = Array.from(productMap.values());
      }
    }
  }
  // No search params - show all products
  else {
    // Get all products
    products = await db.products.findMany({
      where: brandIdsArray.length > 0
        ? {
            brandId: {
              in: brandIdsArray,
            },
          }
        : {},
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
  }

  // Apply sorting (after all products are fetched)
  if (sortBy && products.length > 0) {
    products.sort((a: any, b: any) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price-asc": {
          // Get minimum price from productSize for each product
          const getMinPrice = (product: any) => {
            if (product.productSize && product.productSize.length > 0) {
              const prices = product.productSize.map((ps: any) => {
                const effectivePrice = ps.isClearanceSale && ps.discountedPrice && ps.discountedPrice < ps.price
                  ? ps.discountedPrice
                  : ps.price;
                return effectivePrice;
              });
              return Math.min(...prices);
            }
            // Fallback to product price
            const effectivePrice = product.isClearanceSale && product.discountedPrice && product.discountedPrice < (product.price || 0)
              ? product.discountedPrice
              : product.price || 0;
            return effectivePrice;
          };
          return getMinPrice(a) - getMinPrice(b);
        }
        case "price-desc": {
          // Get maximum price from productSize for each product
          const getMaxPrice = (product: any) => {
            if (product.productSize && product.productSize.length > 0) {
              const prices = product.productSize.map((ps: any) => {
                const effectivePrice = ps.isClearanceSale && ps.discountedPrice && ps.discountedPrice < ps.price
                  ? ps.discountedPrice
                  : ps.price;
                return effectivePrice;
              });
              return Math.max(...prices);
            }
            // Fallback to product price
            const effectivePrice = product.isClearanceSale && product.discountedPrice && product.discountedPrice < (product.price || 0)
              ? product.discountedPrice
              : product.price || 0;
            return effectivePrice;
          };
          return getMaxPrice(b) - getMaxPrice(a);
        }
        default:
          return 0;
      }
    });
  }

  return (
    <div className="min-h-screen">
      <div className="w-full pt-24 sm:pt-30 h-[15vh] sm:h-[20vh] flex items-center justify-center bg-cover bg-center px-4"
        style={{
          backgroundImage:
            "url('https://gogulong.ph/_nuxt/img/breadcrumbs-bg.f31fb0b.png')",
        }}>
        <h3 className="text-white font-bold text-center text-lg sm:text-xl lg:text-2xl">ALL TIRES</h3>
      </div>
      <section className="pt-4 sm:pt-5 px-4 sm:px-6 md:px-12 lg:px-24 pb-8 sm:pb-10 grid lg:grid-cols-10 grid-cols-1 gap-4 sm:gap-6 lg:gap-10">
        <div className="lg:col-span-2 p-3 sm:p-4 lg:p-5">
          <FilterSidebar
            brands={brands}
            searchBySize={searchBySize}
            searchByCar={searchByCar}
          />
        </div>
        <SearchResults products={products as any} />
      </section>
    </div>
  );
};

export default Page;

