"use client";

import React from "react";
import { ProductWithBrand } from "@/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IconShare, IconShoppingCart } from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import useCart from '@/hooks/use-cart';
import { useRouter } from 'next/navigation';

const TireDetails = ({ data }: { data: ProductWithBrand }) => {
  const router = useRouter();
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: data.id,
      name: data.name,
      unitPrice: data.price,
      discountedPrice: data.discountedPrice ?? 0,
      quantity: 1,
      image: data.images[0],
      brand: data.brand.name,
      tireSize: data.tireSize,
    })

    router.push('/cart');
  }
  return (
    <div>
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
        {/* Left Side Images */}
        <div className="border rounded-md">
          <Carousel className="w-full relative">
            <CarouselContent>
              {data.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative w-full h-[270px] flex items-center justify-center">
                    <Image
                      src={image}
                      alt={`Tire Image ${index + 1}`}
                      fill
                      className="object-contain"
                    />
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
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Buttons inside the border */}
            <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow-md" />
            <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow-md" />
          </Carousel>
          <div className="relative mx-auto size-28">
            <Image
              src={data.brand.logo}
              alt={data.brand.name}
              fill
              className="object-contain size-full"
            />
          </div>
        </div>
        {/* Right Side Details */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl">{data.name}</h3>
              <p className="font-bold text-lg">{data.tireSize}</p>
            </div>
            <Button
              variant="outline"
              className="bg-transparent text-primary border-primary hover:text-primary hover:bg-primary/5"
            >
              <IconShare className="size-4" />
              Share
            </Button>
          </div>
          <div className="bg-gray-200 w-full mt-3 px-2 py-1">
            <div className="flex items-center gap-2">
              {data.discountedPrice && (
                <p className="font-bold text-3xl text-primary">
                  ₱{data.discountedPrice.toLocaleString()}
                </p>
              )}
              <p className="font-medium mt-2 line-through text-muted-foreground text-lg">
                ₱{data.price.toLocaleString()}
              </p>
            </div>
          </div>
          {data.discountedPrice !== null && (
            <p className="text-green-900 font-bold mt-3">
              SAVE ₱{(data.price - data.discountedPrice).toLocaleString()}!
            </p>
          )}
          <Separator className="my-3 !h-[2px]" />
          <div className="bg-primary inline-block pl-2 py-1">
            <span className="text-white font-bold text-sm">
              INCLUSIONS{" "}
              <span
                className="ml-8"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "8px solid transparent",
                  borderBottom: "8px solid transparent",
                  borderRight: "10px solid white",
                }}
              ></span>
            </span>
          </div>
          <div
            className="mt-3 text-sm prose prose-md max-w-none
           prose-headings:font-bold
           prose-headings:text-muted-foreground
           prose-a:text-primary prose-a:underline
           prose-ul:list-disc prose-ol:list-decimal
           prose-li:marker:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: data.inclusion }}
          />
          <Button onClick={handleAddToCart} className="w-full mt-3" size="lg">
            <IconShoppingCart className="size-4" />
            Place Order
          </Button>
        </div>
      </div>
      {/* Tire Tabs */}
      <div className="border border-gray-400 mt-5">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full p-0 bg-background justify-start border-b rounded-none">
            <TabsTrigger
              value="overview"
              className="rounded-none bg-secondary h-full border-t-0 border-x-0 data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none bg-secondary h-full border-t-0 border-x-0 data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Reviews
            </TabsTrigger>
            <TabsTrigger
              value="product"
              className="rounded-none bg-secondary h-full border-t-0 border-x-0 data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Product
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="py-2 px-3">
              <h3 className="font-bold text-lg text-primary">
                Manufacturer&apos;s Warranty
              </h3>
              <div
                className="mt-3 text-sm prose prose-md max-w-none
           prose-headings:font-bold
           prose-headings:text-muted-foreground
           prose-a:text-primary prose-a:underline
           prose-ul:list-disc prose-ol:list-decimal
           prose-li:marker:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: data.warranty }}
              />
              <div
                className="mt-3 text-sm prose prose-md max-w-none
           prose-headings:font-bold
           prose-headings:text-muted-foreground
           prose-a:text-primary prose-a:underline
           prose-ul:list-disc prose-ol:list-decimal
           prose-li:marker:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: data.inclusion }}
              />
            </div>
          </TabsContent>
          <TabsContent value="reviews">
            <div className="py-2 px-3">
              <h3 className="font-bold text-lg">Reviews</h3>
            </div>
          </TabsContent>
          <TabsContent value="product">
            <div className="py-2 px-3">
              <div
                className="mt-3 text-sm prose prose-md max-w-none
           prose-headings:font-bold
           prose-headings:text-muted-foreground
           prose-a:text-primary prose-a:underline
           prose-ul:list-disc prose-ol:list-decimal
           prose-li:marker:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: data.description }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TireDetails;
