/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import React from "react";
import FilterSidebar from "@/components/globals/FilterSidebar";
import SearchResults from "../tire-search/_components/search-results";
import db from "@/lib/db";
import { getTireSizesForSearch, getCarDataForSearch, getProductsSoldCounts } from "@/actions";

interface PageProps {
  searchParams: Promise<{
    brand?: string;
    model?: string;
    year?: string;
    width?: string;
    ratio?: string;
    diameter?: string;
    brandId?: string; // Changed to singular - only one brand selection allowed
    sortBy?: string; // Added sortBy param
  }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const { brand, model, year, width, ratio, diameter, brandId, sortBy } = params;

  // Fetch search data for FilterSidebar
  const [tireSizesResult, carDataResult] = await Promise.all([
    getTireSizesForSearch(),
    getCarDataForSearch(),
  ]);

  const searchBySize = tireSizesResult.data || {};
  const searchByCar = carDataResult.data || [];

  // Parse brandId filter - only single brand selection allowed
  const selectedBrandId = brandId ? brandId.trim() : "";

  const brands = await db.brands.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      products: {
        include: {
          productSize: true,
        },
      },
    },
  });

  // Filter brands to only show products that have clearance sale
  // This ensures the count in the sidebar is accurate for clearance sale page
  const brandsWithClearanceSale = brands.map((brand) => {
    const clearanceSaleProducts = brand.products.filter((product) => {
      // Check product level clearance sale
      if (product.isClearanceSale === true) {
        return true;
      }
      // Check if at least one productSize has clearance sale
      if (product.productSize && product.productSize.length > 0) {
        return product.productSize.some((ps) => ps.isClearanceSale === true);
      }
      return false;
    });
    return {
      ...brand,
      products: clearanceSaleProducts,
    };
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
      // Only include products that have clearance sale (product level OR productSize level)
      const productMap = new Map();
      productSizes.forEach((ps) => {
        if (
          ps.product &&
          (!selectedBrandId || ps.product.brandId === selectedBrandId)
        ) {
          // Check if product has clearance sale at product level or any productSize level (must be explicitly true)
          const hasProductClearance = ps.product.isClearanceSale === true;
          const hasProductSizeClearance =
            ps.product.productSize?.some((psItem) => psItem.isClearanceSale === true) ||
            false;

          if (hasProductClearance || hasProductSizeClearance) {
            if (!productMap.has(ps.productId)) {
              productMap.set(ps.productId, ps.product);
            }
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
            (!selectedBrandId || comp.product.brandId === selectedBrandId)
          ) {
            // Check if product has clearance sale (must be explicitly true)
            const hasProductClearance = comp.product.isClearanceSale === true;
            const hasProductSizeClearance =
              comp.product.productSize?.some((ps) => ps.isClearanceSale === true) ||
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
    // Get all products first, then filter for clearance sale
    // We need to fetch all to check both product level and productSize level clearance sale
    const allProducts = await db.products.findMany({
      where: selectedBrandId
        ? {
            brandId: selectedBrandId,
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

    // Filter products that have clearance sale
    // Only include products where:
    // 1. Product level has isClearanceSale === true, OR
    // 2. At least one productSize has isClearanceSale === true
    products = allProducts.filter((product) => {
      // Check product level clearance sale (must be explicitly true)
      if (product.isClearanceSale === true) {
        return true;
      }

      // Check if at least one productSize has clearance sale (must be explicitly true)
      if (product.productSize && product.productSize.length > 0) {
        return product.productSize.some((ps) => ps.isClearanceSale === true);
      }

      // No clearance sale found
      return false;
    });
  }

  // Final verification: Double-check that all products have clearance sale
  // This ensures no "REGULAR PRICE" products slip through
  products = products.filter((product: any) => {
    // Check product level clearance sale (if true, product is on clearance sale)
    if (product.isClearanceSale === true) {
      return true;
    }

    // Check if at least one productSize has clearance sale
    if (product.productSize && product.productSize.length > 0) {
      const hasClearanceSale = product.productSize.some(
        (ps: any) => ps.isClearanceSale === true
      );
      return hasClearanceSale;
    }

    // No clearance sale found - exclude this product
    return false;
  });

  // Fetch sold counts for popularity sorting
  const productIds = products.map((p: any) => p.id);
  const soldCounts = productIds.length > 0 ? await getProductsSoldCounts(productIds) : {};

  // Apply sorting
  if (sortBy) {
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
        case "popularity": {
          // Sort by sold count (popularity)
          const countA = soldCounts[a.id] || 0;
          const countB = soldCounts[b.id] || 0;
          return countB - countA; // Descending (most popular first)
        }
        case "discount-desc": {
          // Calculate maximum discount percentage for each product
          const getMaxDiscount = (product: any) => {
            let maxDiscount = 0;
            if (product.productSize && product.productSize.length > 0) {
              product.productSize.forEach((ps: any) => {
                if (ps.isClearanceSale && ps.discountedPrice && ps.price > 0) {
                  const discount = ((ps.price - ps.discountedPrice) / ps.price) * 100;
                  maxDiscount = Math.max(maxDiscount, discount);
                }
              });
            }
            // Check product level discount
            if (product.isClearanceSale && product.discountedPrice && product.price > 0) {
              const discount = ((product.price - product.discountedPrice) / product.price) * 100;
              maxDiscount = Math.max(maxDiscount, discount);
            }
            return maxDiscount;
          };
          return getMaxDiscount(b) - getMaxDiscount(a); // Descending (highest discount first)
        }
        case "discount-asc": {
          // Calculate minimum discount percentage for each product
          const getMinDiscount = (product: any) => {
            let minDiscount = Infinity;
            if (product.productSize && product.productSize.length > 0) {
              product.productSize.forEach((ps: any) => {
                if (ps.isClearanceSale && ps.discountedPrice && ps.price > 0) {
                  const discount = ((ps.price - ps.discountedPrice) / ps.price) * 100;
                  minDiscount = Math.min(minDiscount, discount);
                }
              });
            }
            // Check product level discount
            if (product.isClearanceSale && product.discountedPrice && product.price > 0) {
              const discount = ((product.price - product.discountedPrice) / product.price) * 100;
              minDiscount = Math.min(minDiscount, discount);
            }
            return minDiscount === Infinity ? 0 : minDiscount;
          };
          return getMinDiscount(a) - getMinDiscount(b); // Ascending (lowest discount first)
        }
        default:
          return 0;
      }
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
      <div className="w-full relative h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-screen mt-20 sm:mt-24 md:mt-30 bg-[#ab0000]">
        <img
          src="/CLEARANCE SALE.png"
          alt="Clearance Sale Banner"
          className="size-full object-cover object-center"
        />
      </div>
      <section className="pt-5 px-4 sm:px-6 md:px-12 lg:px-24 pb-10 grid lg:grid-cols-10 grid-cols-1 gap-6 lg:gap-10">
        <div className="lg:col-span-2 p-3 sm:p-4 lg:p-5">
          <FilterSidebar
            brands={brandsWithClearanceSale}
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
