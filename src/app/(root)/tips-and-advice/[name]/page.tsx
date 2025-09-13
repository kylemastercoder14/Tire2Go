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
        className="w-full pt-24 h-[20vh] flex items-center justify-center bg-cover bg-center"
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
                <Link href="/tips-and-advice">TIPS & ADVICE</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary font-bold uppercase">
                {formattedName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <section className="pt-5 pb-10 px-24">
        <div className="w-full rounded-md relative h-40">
          <Image
            src={filterCategory?.image || ""}
            alt={formattedName}
            fill
            className="object-cover rounded-md"
          />
          <div className="absolute rounded-md inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/30" />
          <div className="absolute bottom-4 left-4">
            <h4 className="text-white text-2xl font-bold">
              {filterCategory?.label}
            </h4>
          </div>
        </div>
        <div className="grid mt-5 lg:grid-cols-4 grid-cols-1 gap-5">
          {data.map((item) => (
            <div
              key={item.id}
              className="w-full hover:shadow-lg border bg-white shadow rounded-md overflow-hidden p-5"
            >
              <div className="relative w-full h-60">
                <Image
                  src={item.thumbnail || ""}
                  alt={item.title}
                  fill
                  className="object-cover size-full rounded-md"
                />
              </div>
              <div className="mt-4">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {format(item.createdAt, "MMMM dd, yyyy")}
                </p>
                <div
                  className="mt-3 mb-3 space-y-2 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
              </div>
              <Link
                className={buttonVariants({ variant: "default", size: "sm" })}
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
