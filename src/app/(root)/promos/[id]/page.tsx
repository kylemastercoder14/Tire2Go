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
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Promo not found
        </h1>
        <p className="text-gray-600 mb-4">
          The promotion you’re looking for may have ended or does not exist.
        </p>
        <Link
          href="/promos"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
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
        className="w-full pt-30 h-[20vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://gogulong.ph/_nuxt/img/breadcrumbs-bg.f31fb0b.png')",
        }}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-white hover:text-white/90 font-bold"
                asChild
              >
                <Link href="/promos">PROMOTIONS & DISCOUNTS</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary font-bold uppercase">
                {data?.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main layout */}
      <section className="pt-5 pb-10 px-24 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left side - Related promos */}
        <aside className="md:col-span-1 max-h-[800px] flex flex-col overflow-y-auto bg-zinc-200 p-4 rounded-sm shadow-sm">
          <h2 className="text-2xl border-b-2 border-gray-600 pb-2 text-center font-semibold mb-4">
            RELATED PROMOTIONS
          </h2>
          <div className="space-y-5">
            {related.length > 0 ? (
              related.map((promo) => (
                <Link key={promo.id} href={`/promos/${promo.id}`}>
                  <div className="flex gap-3 border-b border-gray-600 hover:bg-gray-50 p-2 pb-6 transition">
                    {promo.thumbnail && (
                      <Image
                        src={promo.thumbnail}
                        alt={promo.name}
                        width={100}
                        height={100}
                        className="rounded object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold line-clamp-1 text-lg">
                        {promo.name}
                      </h3>
                      <p className="line-clamp-2 text-sm text-gray-500">
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
              <p className="text-sm text-gray-500">No related promos found.</p>
            )}
          </div>
          <div className="mt-auto">
            <div className="relative w-full h-[300px]">
              <Image
                src="https://yokohamatire.ph/wp-content/themes/yootheme/cache/ads_bg-66207086.jpeg"
                alt="Ads"
                fill
                className="object-cover size-full rounded-sm"
              />
              <div className="absolute inset-0 bg-black/60 text-white p-4 flex flex-col justify-center gap-4">
                <h3 className="text-white text-3xl font-semibold">
                  WHAT&apos;S THE RIGHT TIRE FOR YOU
                </h3>
                <p className='text-lg font-medium'>
                  Check out our latest tires <br />
                  Discover everything from how to read your sidewall to how your
                  tires can carry your whole vehicle.
                </p>
                <Link
                  href={`/tires`}
                  className={cn(
                    "border-white text-white !px-4 !py-2.5 !bg-transparent hover:!text-white hover:!bg-transparent !rounded",
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
        <div className="md:col-span-3 p-6">
          <h1 className="text-2xl font-bold mb-4">{data.name}</h1>
          {data.thumbnail && (
            <Image
              src={data.thumbnail}
              alt={data.name}
              width={800}
              height={400}
              className="rounded mb-6 object-cover"
            />
          )}
          <p className="text-gray-700 mb-4">{data.description}</p>

          <div className="text-sm text-gray-500">
            <p className="mt-2">
              Your promo will be available from{" "}
              <strong>
                {formatDate(data.startDate)} - {formatDate(data.endDate)}
              </strong>
              .
            </p>
            <div
              className="prose prose-sm max-w-none
           prose-headings:font-bold
           prose-headings:text-black
           prose-a:text-primary prose-a:underline
           prose-ul:list-disc prose-ol:list-decimal
           prose-li:marker:text-black mt-3 mb-3"
              dangerouslySetInnerHTML={{ __html: data.criteria || "" }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
