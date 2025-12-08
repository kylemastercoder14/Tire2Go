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
import { TIPS_CATEGORY } from "@/constants";
import Image from "next/image";
import { format } from "date-fns";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Page = async (props: {
  params: Promise<{
    name: string;
  }>;
}) => {
  const params = await props.params;
  const formattedName = decodeURIComponent(params.name);
  const data = await db.tipsGuides.findMany({
    where: {
      category: formattedName,
    },
  });

  const filterCategory = TIPS_CATEGORY.find(
    (item) => item.label === formattedName
  );
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div
        className="w-full pt-24 sm:pt-30 h-[15vh] sm:h-[20vh] flex items-center justify-center bg-cover bg-center px-4"
        style={{
          backgroundImage:
            "url('https://gogulong.ph/_nuxt/img/breadcrumbs-bg.f31fb0b.png')",
        }}
      >
        <Breadcrumb>
          <BreadcrumbList className="flex-wrap justify-center">
            <BreadcrumbItem>
              <BreadcrumbLink
                className="text-white hover:text-white/90 font-bold text-sm sm:text-base"
                asChild
              >
                <Link href="/tips-and-advice">TIPS & ADVICE</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary font-bold uppercase text-xs sm:text-sm md:text-base truncate max-w-[200px] sm:max-w-none">
                {formattedName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <section className="pt-4 sm:pt-5 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="w-full rounded-md relative h-32 sm:h-36 lg:h-40">
          <Image
            src={filterCategory?.image || ""}
            alt={formattedName}
            fill
            className="object-cover rounded-md"
          />
          <div className="absolute rounded-md inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/30" />
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
            <h4 className="text-white text-lg sm:text-xl lg:text-2xl font-bold">
              {filterCategory?.label}
            </h4>
          </div>
        </div>
        <div className="grid mt-4 sm:mt-5 sm:grid-cols-2 lg:grid-cols-2 grid-cols-1 gap-4 sm:gap-5">
          {data.map((item) => (
            <div
              key={item.id}
              className="w-full hover:shadow-lg border bg-white shadow rounded-md overflow-hidden p-4 sm:p-5 flex flex-col"
            >
              <div className="relative w-full h-48 sm:h-56 lg:h-60">
                <Image
                  src={item.thumbnail || ""}
                  alt={item.title}
                  fill
                  className="object-cover size-full rounded-md"
                />
              </div>
              <div className="mt-3 sm:mt-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-sm sm:text-base line-clamp-2">{item.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                  {format(item.createdAt, "MMMM dd, yyyy")}
                </p>
                <div
                  className="mt-3 mb-3 space-y-2 line-clamp-3 text-xs sm:text-sm prose prose-sm max-w-none
                    prose-headings:text-xs sm:prose-headings:text-sm
                    prose-p:text-xs sm:prose-p:text-sm
                    prose-ul:text-xs sm:prose-ul:text-sm
                    prose-ol:text-xs sm:prose-ol:text-sm"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
              </div>
              <Link
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "text-xs sm:text-sm w-full sm:w-auto mt-auto"
                )}
                href={`/tips-and-advice/${params.name}/read-more/${item.id}`}
              >
                Read More &rarr;
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Page;
