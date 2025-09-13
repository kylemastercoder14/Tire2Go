"use client";

import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image";

const BannerCarousel = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="relative w-full">
      <Carousel
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        opts={{
          loop: true,
        }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="w-full h-80 relative rounded-3xl overflow-hidden">
                <Image
                  src="https://firebasestorage.googleapis.com/v0/b/gogulong.appspot.com/o/img%2Fhome%2Fpromos%2F2024-12-promo-carousel-otani.jpg?alt=media&token=f6af5726-a1e5-42e8-8fd8-04c8cb44efaf"
                  alt="Sample"
                  fill
                  className="object-cover rounded-3xl"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Position navigation inside */}
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black/60" />

        {/* Pagination inside bottom center */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-3.5 w-3.5 rounded-full border-2 border-white bg-white/40 hover:bg-white transition",
                { "bg-white border-primary": current === index + 1 }
              )}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

export default BannerCarousel;
