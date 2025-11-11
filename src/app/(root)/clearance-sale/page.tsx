/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
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
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const { brand, model, year, width, ratio, diameter, brandIds } = params;

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

      // Find products that have any of these tire sizes AND are on clearance sale
      const productSizes = await db.productSize.findMany({
        where: {
          tireSizeId: {
            in: tireSizeIds,
          },
          isClearanceSale: true, // Only clearance sale sizes
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

        // Get unique products that have clearance sale (product level OR productSize level)
        // and filter by brand if needed
        const productMap = new Map();
        compatibilities.forEach((comp) => {
          if (
            comp.product &&
            (!brandIdsArray.length ||
              brandIdsArray.includes(comp.product.brandId))
          ) {
            // Check if product has clearance sale
            const hasProductClearance = comp.product.isClearanceSale;
            const hasProductSizeClearance =
              comp.product.productSize?.some((ps) => ps.isClearanceSale) ||
              false;

            if (hasProductClearance || hasProductSizeClearance) {
              if (!productMap.has(comp.productId)) {
                productMap.set(comp.productId, comp.product);
              }
            }
          }
        });

        products = Array.from(productMap.values());
      }
    }
  }
  // No search params - show all clearance sale products
  else {
    // Get products with clearance sale at product level OR at productSize level
    const allProducts = await db.products.findMany({
      where: brandIdsArray.length > 0
        ? {
            brandId: {
              in: brandIdsArray,
            },
          }
        : undefined,
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

    // Filter products that have clearance sale
    products = allProducts.filter((product) => {
      const hasProductClearance = product.isClearanceSale;
      const hasProductSizeClearance =
        product.productSize?.some((ps) => ps.isClearanceSale) || false;
      return hasProductClearance || hasProductSizeClearance;
    });
  }

  // Build search criteria display text
  let searchCriteria = "Clearance Sale Products";
  if (width) {
    if (ratio && diameter) {
      searchCriteria = `Clearance Sale: ${width}/${ratio} R${diameter}`;
    } else if (ratio) {
      searchCriteria = `Clearance Sale: ${width}/${ratio}`;
    } else {
      searchCriteria = `Clearance Sale: ${width}`;
    }
  } else if (brand && model) {
    if (year) {
      searchCriteria = `Clearance Sale: ${brand} ${model} ${year}`;
    } else {
      searchCriteria = `Clearance Sale: ${brand} ${model}`;
    }
  }

  return (
    <div className="min-h-screen">
      <div className="w-full relative h-[59.7vh] mt-30 bg-[#ab0000]">
        <img
          src="/CLEARANCE SALE.png"
          alt="Clearance Sale Banner"
          className="size-full object-contain"
        />
      </div>
      <section className="pt-5 px-24 pb-10 grid lg:grid-cols-10 grid-cols-1 gap-10">
        <div className="lg:col-span-2 p-5">
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
