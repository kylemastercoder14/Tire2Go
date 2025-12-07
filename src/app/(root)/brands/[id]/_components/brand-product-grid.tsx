/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { buttonVariants, Button } from "@/components/ui/button";
import { IconHandClick, IconCube } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tire3DViewer } from "@/components/tire-3d-viewer";

interface Product {
  id: string;
  name: string;
  images: string[];
  inclusion: string;
  tireSize?: string | null;
  threeDModel?: string | null;
  isClearanceSale?: boolean;
  price?: number;
  discountedPrice?: number | null;
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
}

interface BrandProductGridProps {
  products: Product[];
  colorScheme?: {
    primary: string;
    secondary: string;
    accent?: string;
  };
}

const BrandProductGrid = ({ products, colorScheme }: BrandProductGridProps) => {
  // Default color scheme if not provided
  const colors = colorScheme || { primary: "#c02b2b", secondary: "#dc2626", accent: "#ef4444" };
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [is3DViewerOpen, setIs3DViewerOpen] = useState(false);

  const handleView3D = (product: Product) => {
    setSelectedProduct(product);
    setIs3DViewerOpen(true);
  };

  if (products.length === 0) {
    return (
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
    );
  }

  return (
    <>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-7">
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
            <div
              key={product.id}
              className="border shadow rounded-md"
              style={{ borderColor: colors.primary }}
            >
              <div className="relative w-full h-60">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="object-contain size-full"
                />
                {product.threeDModel && (
                  <Button
                    variant="default"
                    className="absolute top-2 left-2"
                    size="icon"
                    onClick={() => handleView3D(product)}
                  >
                    <IconCube className="size-4" />
                  </Button>
                )}
                <div className="absolute top-2 right-2 size-15">
                  <img
                    src={product.brand.logo}
                    alt={product.brand.name}
                    className="object-contain size-full"
                  />
                </div>
                {/* make it center */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-20">
                  <img
                    src="/logo.png"
                    alt={"logo"}
                    className="object-contain size-full opacity-30"
                  />
                </div>
              </div>
              <div
                className="p-2 text-white"
                style={{
                  background: `linear-gradient(to left, ${colors.secondary}, ${colors.primary})`
                }}
              >
                <h2 className="font-bold text-sm">
                  {hasClearanceSale ? "CLEARANCE SALE" : "REGULAR PRICE"}
                </h2>
              </div>
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
                  <p className="font-bold text-lg" style={{ color: colors.primary }}>
                    {priceRange}{" "}
                    <span className="font-medium text-base">per tire</span>
                  </p>
                </div>
                <div
                  className="my-3 text-sm prose prose-sm max-w-none
								  prose-headings:font-bold
								  prose-headings:text-muted-foreground
								  prose-a:underline
								  prose-ul:list-disc prose-ol:list-decimal
								  prose-li:marker:text-muted-foreground"
                  style={{
                    "--tw-prose-links": colors.primary,
                  } as React.CSSProperties}
                  dangerouslySetInnerHTML={{ __html: product.inclusion }}
                />
                <Link
                  href={`/tire/${product.id}`}
                  className={`w-full mb-2 ${buttonVariants({
                    variant: "default",
                  })}`}
                  style={{
                    backgroundColor: colors.primary,
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary;
                  }}
                >
                  <IconHandClick className="size-4" />
                  View Tire Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3D Viewer Dialog */}
      <Dialog open={is3DViewerOpen} onOpenChange={setIs3DViewerOpen}>
        <DialogContent className="max-w-7xl! max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct?.name} - 3D Preview on Ford Ranger
            </DialogTitle>
            <DialogDescription>
              Rotate, zoom, and explore how this tire looks on a Ford Ranger.
              {selectedProduct?.productSize &&
                selectedProduct.productSize.length > 0 && (
                  <span className="block mt-1">
                    Available sizes:{" "}
                    {selectedProduct.productSize
                      .map((ps) => {
                        const ts = ps.tireSize;
                        if (ts.ratio && ts.diameter) {
                          return `${ts.width}/${ts.ratio} R${ts.diameter}`;
                        } else if (ts.diameter) {
                          return `${ts.width} R${ts.diameter}`;
                        } else {
                          return `${ts.width}`;
                        }
                      })
                      .join(", ")}
                  </span>
                )}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedProduct && (
              <Tire3DViewer
                tireImage={selectedProduct.images[0]}
                tireName={selectedProduct.name}
                tireSize={
                  selectedProduct.productSize &&
                  selectedProduct.productSize.length > 0
                    ? (() => {
                        const ts = selectedProduct.productSize[0].tireSize;
                        if (ts.ratio && ts.diameter) {
                          return `${ts.width}/${ts.ratio} R${ts.diameter}`;
                        } else if (ts.diameter) {
                          return `${ts.width} R${ts.diameter}`;
                        } else {
                          return `${ts.width}`;
                        }
                      })()
                    : selectedProduct.tireSize || undefined
                }
                threeDModel={selectedProduct.threeDModel}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BrandProductGrid;
