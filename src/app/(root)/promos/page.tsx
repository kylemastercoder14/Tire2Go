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
        className="w-full pt-30 h-[20vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://gogulong.ph/_nuxt/img/breadcrumbs-bg.f31fb0b.png')",
        }}
      >
        <h3 className="text-white font-bold text-center">
          PROMOTIONS & DISCOUNTS
        </h3>
      </div>
      <section className="pt-5 max-w-7xl mx-auto px-8 pb-10">
        <div className="flex flex-col gap-6">
          {data.map((promo) => (
            <div
              key={promo.id}
              className="flex flex-col md:flex-row gap-5 border-b border-gray-200 pb-6"
            >
              {/* Left Thumbnail */}
              <div className="w-full md:w-1/3">
                <Image
                  src={promo.thumbnail}
                  alt={promo.name}
                  width={400}
                  height={250}
                  className="rounded-md object-cover w-full h-[200px]"
                />
              </div>

              {/* Right Content */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  {/* Title */}
                  <h2 className="text-lg font-bold">{promo.name}</h2>

                  {/* Date */}
                  <p className="text-sm text-muted-foreground mb-2">
                    {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                  </p>

                  {/* Description (truncate) */}
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {promo.description}
                  </p>
                </div>

                {/* Read More Button */}
                <div>
                  <Link
                    href={`/promos/${promo.id}`}
                    className={cn(
                      "border-primary text-primary !px-4 !py-2.5 hover:!text-primary hover:!bg-transparent !rounded",
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
