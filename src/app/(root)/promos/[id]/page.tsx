import React from "react";
import db from "@/lib/db";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import Image from "next/image";
import { cn, formatDate } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  // Current promo
  const data = await db.promotions.findUnique({
    where: { id: params.id },
  });

  // If no data found
  if (!data) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center text-center px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Promo not found
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          The promotion you&apos;re looking for may have ended or does not exist.
        </p>
        <Link
          href="/promos"
          className="px-4 py-2 text-sm sm:text-base bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          Back to Promotions
        </Link>
      </div>
    );
  }

  // Other promos (exclude current one)
  const related = await db.promotions.findMany({
    where: { NOT: { id: params.id } },
    take: 5,
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="min-h-screen">
      {/* Header with background */}
      <div
        className="w-full pt-24 sm:pt-30 h-[15vh] sm:h-[20vh] flex items-center justify-center bg-cover bg-center px-4"
        style={{
          backgroundImage:
            "url('https://gogulong.ph/_nuxt/img/breadcrumbs-bg.f31fb0b.png')",
        }}
      >
        <Breadcrumb>
          <BreadcrumbList className="flex-wrap justify-center">
            <BreadcrumbItem className='hidden md:block'>
              <BreadcrumbLink
                className="text-white hover:text-white/90 font-bold text-sm sm:text-base"
                asChild
              >
                <Link href="/promos">PROMOTIONS & DISCOUNTS</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary font-bold uppercase text-xs sm:text-sm md:text-base truncate max-w-[200px] sm:max-w-none">
                {data?.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main layout */}
      <section className="pt-4 sm:pt-5 pb-8 sm:pb-10 px-4 sm:px-5 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
        {/* Left side - Related promos */}
        <aside className="md:col-span-1 max-h-[600px] md:max-h-[800px] flex flex-col overflow-y-auto bg-zinc-200 p-3 sm:p-4 rounded-sm shadow-sm order-2 md:order-1">
          <h2 className="text-lg sm:text-xl lg:text-2xl border-b-2 border-gray-600 pb-2 text-center font-semibold mb-3 sm:mb-4">
            RELATED PROMOTIONS
          </h2>
          <div className="space-y-3 sm:space-y-5">
            {related.length > 0 ? (
              related.map((promo) => (
                <Link key={promo.id} href={`/promos/${promo.id}`}>
                  <div className="flex gap-2 sm:gap-3 border-b border-gray-600 hover:bg-gray-50 p-2 pb-4 sm:pb-6 transition">
                    {promo.thumbnail && (
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0">
                        <Image
                          src={promo.thumbnail}
                          alt={promo.name}
                          fill
                          className="rounded object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold line-clamp-1 text-sm sm:text-base lg:text-lg mb-1">
                        {promo.name}
                      </h3>
                      <p className="line-clamp-2 text-xs sm:text-sm text-gray-500 mb-1">
                        {promo.description}
                      </p>
                      <p className="text-xs mt-1 text-gray-700">
                        {formatDate(promo.startDate)} -{" "}
                        {formatDate(promo.endDate)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs sm:text-sm text-gray-500 text-center">No related promos found.</p>
            )}
          </div>
          <div className="mt-4 sm:mt-auto">
            <div className="relative w-full h-[250px] sm:h-[300px]">
              <Image
                src="https://yokohamatire.ph/wp-content/themes/yootheme/cache/ads_bg-66207086.jpeg"
                alt="Ads"
                fill
                className="object-cover size-full rounded-sm"
              />
              <div className="absolute inset-0 bg-black/60 text-white p-3 sm:p-4 flex flex-col justify-center gap-2 sm:gap-4">
                <h3 className="text-white text-lg sm:text-xl lg:text-3xl font-semibold">
                  WHAT&apos;S THE RIGHT TIRE FOR YOU
                </h3>
                <p className='text-sm sm:text-base lg:text-lg font-medium'>
                  Check out our latest tires <br className="hidden sm:block" />
                  <span className="block sm:inline">Discover everything from how to read your sidewall to how your
                  tires can carry your whole vehicle.</span>
                </p>
                <Link
                  href={`/tire`}
                  className={cn(
                    "border-white text-white !px-3 sm:!px-4 !py-2 sm:!py-2.5 !bg-transparent hover:!text-white hover:!bg-transparent !rounded text-xs sm:text-sm w-full sm:w-auto inline-block text-center",
                    buttonVariants({ variant: "outline" })
                  )}
                >
                  Browse More &rarr;
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Right side - Current promo details */}
        <div className="md:col-span-3 p-4 sm:p-6 order-1 md:order-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">{data.name}</h1>
          {data.thumbnail && (
            <div className="relative w-full h-[200px] sm:h-[300px] lg:h-[400px] mb-4 sm:mb-6 rounded overflow-hidden">
              <Image
                src={data.thumbnail}
                alt={data.name}
                fill
                className="rounded object-cover"
              />
            </div>
          )}
          <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">{data.description}</p>

          <div className="text-xs sm:text-sm text-gray-500">
            <p className="mt-2">
              Your promo will be available from{" "}
              <strong>
                {formatDate(data.startDate)} - {formatDate(data.endDate)}
              </strong>
              .
            </p>
            <div
              className="prose prose-sm sm:prose-base max-w-none
           prose-headings:font-bold
           prose-headings:text-black
           prose-headings:text-base sm:prose-headings:text-lg
           prose-a:text-primary prose-a:underline
           prose-ul:list-disc prose-ol:list-decimal
           prose-li:marker:text-black
           prose-p:text-sm sm:prose-p:text-base
           prose-li:text-sm sm:prose-li:text-base
           mt-3 mb-3"
              dangerouslySetInnerHTML={{ __html: data.criteria || "" }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
