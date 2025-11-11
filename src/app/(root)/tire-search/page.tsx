/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import FilterSidebar from "@/components/globals/FilterSidebar";
import SearchResults from "./_components/search-results";
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
        if (ps.product && (!brandIdsArray.length || brandIdsArray.includes(ps.product.brandId))) {
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
          if (comp.product && (!brandIdsArray.length || brandIdsArray.includes(comp.product.brandId))) {
            if (!productMap.has(comp.productId)) {
              productMap.set(comp.productId, comp.product);
            }
          }
        });

        products = Array.from(productMap.values());
      }
    }
  }
  // No search params - show all products (or show a message)
  else {
    products = await db.products.findMany({
      where: brandIdsArray.length > 0 ? {
        brandId: {
          in: brandIdsArray,
        },
      } : undefined,
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

  // Build search criteria display text
  let searchCriteria = "All Products";
  if (width) {
    if (ratio && diameter) {
      searchCriteria = `Tire Size: ${width}/${ratio} R${diameter}`;
    } else if (ratio) {
      searchCriteria = `Tire Size: ${width}/${ratio}`;
    } else {
      searchCriteria = `Tire Size: ${width}`;
    }
  } else if (brand && model) {
    if (year) {
      searchCriteria = `${brand} ${model} ${year}`;
    } else {
      searchCriteria = `${brand} ${model}`;
    }
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
        <h3 className="text-white text-center">
          Showing results for <strong>{searchCriteria}</strong>
          {products.length > 0 && (
            <span className="text-sm font-normal"> ({products.length} {products.length === 1 ? "product" : "products"})</span>
          )}
        </h3>
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
