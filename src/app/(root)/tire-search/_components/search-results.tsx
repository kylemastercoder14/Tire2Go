"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import ProductGrid from "./product-grid";
import SortOptions from "@/components/globals/SortOptions";

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

interface SearchResultsProps {
  products: Product[];
}

const SearchResults = ({ products }: SearchResultsProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentProducts, setCurrentProducts] = React.useState(products);
  const prevSearchParamsRef = React.useRef<string>(searchParams.toString());
  const prevProductsRef = React.useRef<Product[]>(products);

  // Update products when they change from server
  React.useEffect(() => {
    // Check if products actually changed
    const productsChanged =
      products.length !== prevProductsRef.current.length ||
      products.some((p, i) => p.id !== prevProductsRef.current[i]?.id);

    if (productsChanged) {
      setCurrentProducts(products);
      setIsLoading(false);
      prevProductsRef.current = products;
    }
  }, [products]);

  // Detect URL changes (filtering) - only trigger loading on actual param changes
  React.useEffect(() => {
    const currentParams = searchParams.toString();
    const prevParams = prevSearchParamsRef.current;

    // If params changed (not on initial mount), show loading
    if (currentParams !== prevParams && prevParams !== "") {
      setIsLoading(true);
      prevSearchParamsRef.current = currentParams;
    } else if (prevParams === "") {
      // Initialize on mount
      prevSearchParamsRef.current = currentParams;
    }
  }, [pathname, searchParams]);

  // Get title based on pathname
  const getTitle = () => {
    const pathnameLower = pathname.toLowerCase();
    if (pathnameLower.includes("clearance")) {
      return "Clearance Sale Products";
    }
    return "Search Results";
  };

  return (
    <div className="lg:col-span-8 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight">{getTitle()}</h3>
        <SortOptions />
      </div>
      <ProductGrid products={currentProducts} isLoading={isLoading} />
    </div>
  );
};

export default SearchResults;

