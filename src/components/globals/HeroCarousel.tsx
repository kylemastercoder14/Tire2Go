"use client";

import React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { cn } from "@/lib/utils";

const HeroCarousel = () => {
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
    <div className="relative lg:w-[600px] w-full h-[280px]">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        className="w-full h-full"
      >
        <CarouselContent>
          {[1, 2, 3].map((num) => (
            <CarouselItem key={num} className="w-full h-[280px]">
              <div className="relative w-full h-full">
                <Image
                  src={`/carousel/${num}.png`}
                  alt={`Carousel ${num}`}
                  fill
                  className="object-cover rounded-sm"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />

        {/* Pagination inside image */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-2.5 w-2.5 rounded-full border border-white transition",
                current === index + 1
                  ? "bg-white"
                  : "bg-transparent"
              )}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

export default HeroCarousel;
