import React from "react";
import db from "@/lib/db";
import Image from "next/image";
import { cn, formatDate } from "@/lib/utils";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const Page = async () => {
  const data = await db.promotions.findMany({
    orderBy: {
      startDate: "desc",
    },
  });
  return (
    <div className="min-h-screen">
      <div
        className="w-full pt-24 sm:pt-30 h-[15vh] sm:h-[20vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://gogulong.ph/_nuxt/img/breadcrumbs-bg.f31fb0b.png')",
        }}
      >
        <h3 className="text-white font-bold text-center text-lg sm:text-xl lg:text-2xl px-4">
          PROMOTIONS & DISCOUNTS
        </h3>
      </div>
      <section className="pt-4 sm:pt-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10">
        <div className="flex flex-col gap-4 sm:gap-6">
          {data.map((promo) => (
            <div
              key={promo.id}
              className="flex flex-col md:flex-row gap-4 sm:gap-5 border-b border-gray-200 pb-4 sm:pb-6"
            >
              {/* Left Thumbnail */}
              <div className="w-full md:w-1/3">
                <Image
                  src={promo.thumbnail}
                  alt={promo.name}
                  width={400}
                  height={250}
                  className="rounded-md object-cover w-full h-[180px] sm:h-[200px] lg:h-[250px]"
                />
              </div>

              {/* Right Content */}
              <div className="flex-1 flex flex-col justify-between gap-3 sm:gap-4">
                <div>
                  {/* Title */}
                  <h2 className="text-base sm:text-lg font-bold mb-2">{promo.name}</h2>

                  {/* Date */}
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                    {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                  </p>

                  {/* Description (truncate) */}
                  <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 sm:line-clamp-3">
                    {promo.description}
                  </p>
                </div>

                {/* Read More Button */}
                <div>
                  <Link
                    href={`/promos/${promo.id}`}
                    className={cn(
                      "border-primary lg:mt-0 mt-3 text-primary !px-3 sm:!px-4 !py-2 sm:!py-2.5 hover:!text-primary hover:!bg-transparent !rounded text-xs sm:text-sm w-full sm:w-auto inline-block text-center",
                      buttonVariants({ variant: "outline" })
                    )}
                  >
                    Read More &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Page;
